import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Image,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useAuth } from "../../hooks/useAuth";
import {
  getUserGameScore,
  getUserRankInLeaderboard,
  recordGameResult,
  getLeaderboard,
} from "../../services/scoreService";
import { useFocusEffect } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../utils/firebaseConfig";
import { countries } from "../../constants";
import { AVATAR_COLLECTIONS } from "../../constants/avatars";
import GameLeaderboard from "../../components/GameLeaderboard";
import GameStat from "../../components/GameStat";

const { width } = Dimensions.get("window");

// Données du classement spécifique au jeu (remplacées par les vraies données Firestore)
const gameLeaderboardData = [];

// Écran de détails d'un jeu avec focus sur classement et statistiques
const GameDetailsScreen = ({ route, navigation }) => {
  const { game } = route.params;
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState({
    win: 0,
    draw: 0,
    lose: 0,
    totalPoints: 0,
    totalGames: 0,
    totalScore: 0,
    totalDuration: 0,
    bestScore: 0,
    averageScore: 0,
    winRate: 0,
    currentStreak: 0,
    bestTime: null,
  });
  const [userRank, setUserRank] = useState(null);
  const [totalPlayers, setTotalPlayers] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardType, setLeaderboardType] = useState("global");
  const flatListRef = useRef(null);
  const [userCountry, setUserCountry] = useState(null);
  const prevTab = useRef(activeTab);
  const [pendingScrollToUserCountry, setPendingScrollToUserCountry] =
    useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);

  // Fonction pour récupérer l'URL de l'avatar à partir de sa clé
  const getAvatarUrl = (avatarKey) => {
    if (!avatarKey || typeof avatarKey !== "string") return null;

    // Si c'est déjà une URL, la retourner directement
    if (avatarKey.startsWith("http")) return avatarKey;

    // Chercher dans toutes les collections d'avatars
    for (const collection of AVATAR_COLLECTIONS) {
      const avatar = collection.avatars.find((av) => av.key === avatarKey);
      if (avatar) return avatar.url;
    }

    return null;
  };

  // Utiliser l'identifiant technique Firestore du jeu
  const gameId = game.id || game.title;

  // Charger les statistiques de l'utilisateur et le classement pour ce jeu
  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        if (user?.id && gameId) {
          try {
            setStatsLoading(true);
            setLeaderboardLoading(true);

            // Charger les stats utilisateur
            const stats = await getUserGameScore(user.id, gameId);
            setUserStats(stats);
            const { rank, total } = await getUserRankInLeaderboard(
              user.id,
              gameId
            );
            setUserRank(rank);
            setTotalPlayers(total);

            // Récupérer le profil utilisateur pour obtenir le pays et le username
            const userProfileRef = doc(db, "users", user.id);
            const userProfileSnap = await getDoc(userProfileRef);
            const userProfile = userProfileSnap.exists()
              ? userProfileSnap.data()
              : {};
            const userCountry = userProfile.country || null;
            const userUsername =
              userProfile.username || user.displayName || user.email || "Vous";
            setUserCountry(userCountry);

            // Charger le classement
            const leaderboard = await getLeaderboard(gameId, 51, user);

            // Récupérer les avatars des utilisateurs depuis Firestore
            const processedLeaderboard = await Promise.all(
              leaderboard.map(async (item, index) => {
                let userAvatar = "👤";

                // Récupérer l'avatar depuis le profil utilisateur
                if (item.userId) {
                  try {
                    const userDoc = await getDoc(doc(db, "users", item.userId));
                    if (userDoc.exists()) {
                      const userData = userDoc.data();
                      userAvatar =
                        getAvatarUrl(userData.avatar) ||
                        userData.photoURL ||
                        "👤";
                    }
                  } catch (e) {}
                }

                return {
                  id: item.userId,
                  username: item.isCurrentUser
                    ? userUsername
                    : item.username || `Joueur ${item.userId.slice(0, 6)}`,
                  rank: item.rank,
                  score: item.totalPoints || 0,
                  winRate: item.winRate || 0,
                  gamesPlayed: item.totalGames || 0,
                  avatar: userAvatar,
                  isCurrentUser: item.userId === user.id,
                  country: item.isCurrentUser
                    ? countries.find((c) => c.code === userCountry) || {
                        code: "",
                        name: "Monde",
                        flag: "🌍",
                      }
                    : item.country && typeof item.country === "string"
                    ? countries.find(
                        (c) => c.code === item.country.toUpperCase()
                      ) || { code: "", name: "Monde", flag: "🌍" }
                    : countries[index % countries.length],
                };
              })
            );
            setLeaderboardData(processedLeaderboard);
          } catch (error) {
          } finally {
            setStatsLoading(false);
            setLeaderboardLoading(false);
          }
        }
      };
      loadData();
    }, [user?.id, gameId])
  );

  useEffect(() => {
    if (activeTab === "leaderboard" && prevTab.current !== "leaderboard") {
      setTimeout(scrollToUserInWorld, 400);
    }
    prevTab.current = activeTab;
  }, [activeTab]);

  // Force l'onglet Mondial et le scroll vers l'utilisateur au chargement
  useEffect(() => {
    if (leaderboardData.length > 0 && user?.id) {
      // Forcer l'onglet Mondial
      setLeaderboardType("global");

      // Scroll vers l'utilisateur après un délai pour laisser le temps au rendu
      setTimeout(() => {
        scrollToUserInWorld();
      }, 500);
    }
  }, [leaderboardData, user?.id]);

  // Debug du classement (optionnel)
  useEffect(() => {
    // Logs de debug pour vérifier le fonctionnement du classement
    if (leaderboardType === "global") {
      console.log(
        `[DEBUG] Classement mondial: ${leaderboardData.length} joueurs`
      );
    } else if (leaderboardType === "country") {
      const countryCode = selectedCountry || "FR";
      const countryPlayers = leaderboardData
        .filter((item) => (item.country?.code || item.country) === countryCode)
        .sort((a, b) => b.score - a.score)
        .map((item, index) => ({
          ...item,
          rank: index + 1,
        }));
      console.log(
        `[DEBUG] Classement ${countryCode}: ${countryPlayers.length} joueurs`
      );
    }
  }, [leaderboardType, leaderboardData, selectedCountry]);

  // Fonction pour obtenir l'avatar selon le rang
  const getAvatarForRank = (rank) => {
    if (rank === 1) return "👑";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "🎮";
  };

  const handlePlayGame = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate(game.id);
    }, 1500);
  };

  const renderLeaderboardItem = ({ item, index }) => (
    <View
      style={[
        styles.leaderboardItem,
        item.isCurrentUser && { backgroundColor: game.color },
      ]}>
      <View style={styles.rankContainer}>
        <Text
          style={[styles.rankText, item.isCurrentUser && { color: "#fff" }]}>
          #{item.rank}
        </Text>
        {index < 3 && (
          <Ionicons
            name='trophy'
            size={16}
            color={
              index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : "#CD7F32"
            }
          />
        )}
      </View>
      <View style={styles.userInfo}>
        <View style={styles.userAvatar}>
          {item.avatar && item.avatar.startsWith("http") ? (
            <Image
              source={{ uri: item.avatar }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
              }}
              resizeMode='cover'
              defaultSource={require("../../../assets/icon.png")}
              onError={() => {}}
            />
          ) : (
            <Text style={{ fontSize: 28 }}>{item.avatar || "👤"}</Text>
          )}
        </View>
        <View style={styles.userDetails}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {/* Affiche le drapeau du pays dans le classement mondial, ou 🌍 si non renseigné */}
            <Text style={{ fontSize: 18, marginRight: 5 }}>
              {item.country?.flag || "🌍"}
            </Text>
            <Text
              style={[
                styles.username,
                item.isCurrentUser && { color: "#fff" },
              ]}>
              {item.username}
            </Text>
          </View>
          <Text
            style={[styles.userStats, item.isCurrentUser && { color: "#fff" }]}>
            {item.gamesPlayed} parties • {item.winRate}% victoires
          </Text>
        </View>
      </View>
      <View style={styles.scoreContainer}>
        <Text
          style={[
            styles.scoreText,
            item.isCurrentUser
              ? { color: "#fff" }
              : { color: game.color, fontWeight: "bold" },
          ]}>
          {item.score}
        </Text>
        <Text
          style={[styles.scoreLabel, item.isCurrentUser && { color: "#fff" }]}>
          points
        </Text>
      </View>
    </View>
  );

  const renderStatCard = (icon, value, label, color, subtitle = "") => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color='#fff' />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const filteredLeaderboardData =
    leaderboardType === "global"
      ? leaderboardData
      : leaderboardData
          .filter(
            (item) =>
              (item.country?.code || item.country) ===
              (selectedCountry || userCountry)
          )
          .sort((a, b) => b.score - a.score)
          .map((item, index) => ({
            ...item,
            rank: index + 1, // Recalculer les rangs pour le pays
          }));

  // Calculer le rang de l'utilisateur dans le classement filtré
  const getUserRankInFilteredData = () => {
    if (!user?.id) return null;

    if (leaderboardType === "global") {
      return userRank;
    } else {
      // Pour le classement par pays, calculer le rang dans les données filtrées
      const userIndex = filteredLeaderboardData.findIndex(
        (item) => item.isCurrentUser
      );
      return userIndex !== -1 ? userIndex + 1 : null;
    }
  };

  const currentUserRank = getUserRankInFilteredData();

  // Fonction pour scroller vers l'utilisateur dans Monde
  const scrollToUserInWorld = () => {
    const userIndex = leaderboardData.findIndex((item) => item.isCurrentUser);
    if (userIndex !== -1 && flatListRef.current) {
      setTimeout(() => {
        try {
          flatListRef.current.scrollToIndex({
            index: userIndex,
            animated: true,
            viewPosition: 0.5,
          });
        } catch (error) {
          // Fallback : scroll vers le haut si l'index n'est pas trouvé
          flatListRef.current.scrollToOffset({ offset: 0, animated: true });
        }
      }, 200);
    }
  };
  // Fonction pour scroller vers l'utilisateur dans Pays
  const scrollToUserInCountry = () => {
    const userIndex = filteredLeaderboardData.findIndex(
      (item) => item.isCurrentUser
    );
    if (userIndex !== -1 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToIndex({
          index: userIndex,
          animated: true,
          viewPosition: 0.5,
        });
      }, 500);
    }
  };

  // Fonction pour gérer l'échec du scrollToIndex
  const handleScrollToIndexFailed = (info) => {
    // Si l'index demandé est trop grand, scroll au dernier élément
    if (flatListRef.current && info.highestMeasuredFrameIndex >= 0) {
      flatListRef.current.scrollToIndex({
        index: info.highestMeasuredFrameIndex,
        animated: true,
        viewPosition: 0.5,
      });
    }
  };

  // Génère une liste avec placeholders pour centrage parfait
  const getCenteredLeaderboardData = () => {
    // Désormais, on retourne simplement la liste filtrée sans placeholder
    return filteredLeaderboardData;
  };
  const centeredLeaderboardData = getCenteredLeaderboardData();

  // Décalage d'index pour le scroll automatique
  const getUserIndexWithPlaceholders = () => {
    const userIndex = filteredLeaderboardData.findIndex(
      (item) => item.isCurrentUser
    );
    const minItemsToFill = 7;
    if (filteredLeaderboardData.length >= minItemsToFill) return userIndex;
    const before = Math.max(0, Math.floor(minItemsToFill / 2) - userIndex);
    return userIndex + before;
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.fullScreenLoading}>
          <ActivityIndicator size='large' color='#fff' />
          <Text style={styles.loadingText}>Chargement du jeu...</Text>
        </View>
      )}
      {!loading && (
        <View style={{ flex: 1 }}>
          {/* Header avec informations du jeu */}
          <LinearGradient
            colors={[game.color, game.color + "80"]}
            style={styles.header}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                width: "100%",
              }}>
              {/* Flèche et titre alignés verticalement */}
              <View
                style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}>
                  <Ionicons name='arrow-back' size={24} color='#fff' />
                </TouchableOpacity>
                <View style={{ justifyContent: "center", marginLeft: 8 }}>
                  <Text style={styles.gameTitle}>{game.title}</Text>
                  <Text style={styles.gameDescription}>{game.description}</Text>
                </View>
              </View>
              {/* Bouton jouer à droite */}
              <View
                style={[
                  styles.playButtonContainer,
                  { marginVertical: 0, marginLeft: 8 },
                ]}>
                <TouchableOpacity
                  style={[styles.playButton, { backgroundColor: game.color }]}
                  onPress={handlePlayGame}>
                  <View style={styles.playButtonGradientFake}>
                    <Ionicons name='game-controller' size={24} color='#fff' />
                    <Text style={styles.playButtonText}>Jouer</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            {/* Image de fond centrée et discrète */}
            {typeof game.image !== "string" && (
              <Image
                source={game.image}
                style={styles.gameBgImage}
                resizeMode='contain'
                pointerEvents='none'
              />
            )}
          </LinearGradient>

          {/* Onglets avec couleur dynamique pour l'onglet actif */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "leaderboard" && {
                  borderBottomColor: game.color,
                  borderBottomWidth: 2,
                },
              ]}
              onPress={() => {
                setActiveTab("leaderboard");
                setTimeout(scrollToUserInWorld, 400);
              }}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === "leaderboard" && {
                    color: game.color,
                    fontWeight: "bold",
                  },
                ]}>
                Classement
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "stats" && {
                  borderBottomColor: game.color,
                  borderBottomWidth: 2,
                },
              ]}
              onPress={() => setActiveTab("stats")}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === "stats" && {
                    color: game.color,
                    fontWeight: "bold",
                  },
                ]}>
                Statistiques
              </Text>
            </TouchableOpacity>
          </View>

          {/* Contenu des onglets */}
          {activeTab === "leaderboard" ? (
            <GameLeaderboard
              leaderboardData={leaderboardData}
              leaderboardType={leaderboardType}
              setLeaderboardType={setLeaderboardType}
              userCountry={userCountry}
              currentUserRank={currentUserRank}
              game={game}
              filteredLeaderboardData={filteredLeaderboardData}
              centeredLeaderboardData={centeredLeaderboardData}
              flatListRef={flatListRef}
              handleScrollToIndexFailed={handleScrollToIndexFailed}
              pendingScrollToUserCountry={pendingScrollToUserCountry}
              setPendingScrollToUserCountry={setPendingScrollToUserCountry}
              getUserIndexWithPlaceholders={getUserIndexWithPlaceholders}
              loading={loading}
              renderLeaderboardItem={renderLeaderboardItem}
              scrollToUserInWorld={scrollToUserInWorld}
              countries={countries}
            />
          ) : (
            <GameStat
              userStats={userStats}
              statsLoading={statsLoading}
              game={game}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingTop: 30,
    paddingBottom: 18,
    paddingHorizontal: 20,
    overflow: "hidden",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
  },
  backButton: {
    padding: 10,
    zIndex: 3,
  },
  gameHeader: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    minHeight: 80,
    overflow: "visible",
  },
  gameBgImage: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "80%",
    height: 250,
    opacity: 0.18,
    zIndex: 0,
  },
  gameInfo: {
    flex: 1,
    zIndex: 1,
    paddingLeft: 16,
    justifyContent: "center",
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
    backgroundColor: "transparent",
    opacity: 1,
    zIndex: 2,
  },
  gameDescription: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 10,
    backgroundColor: "transparent",
    opacity: 1,
    zIndex: 2,
  },
  gameMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  gameMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  gameMetaText: {
    fontSize: 14,
    color: "#fff",
    marginLeft: 5,
  },
  difficultyBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  difficultyText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "500",
  },
  playButtonContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  playButton: {
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    backgroundColor: undefined,
    opacity: 1,
    zIndex: 2,
  },
  playButtonGradientFake: {
    flexDirection: "row",
    alignItems: "center",
  },
  playButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
    backgroundColor: "transparent",
    opacity: 1,
    zIndex: 2,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
  },
  tabText: {
    fontSize: 16,
    color: "#6c757d",
    fontWeight: "500",
  },
  statsContent: {
    padding: 20,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  personalStats: {
    gap: 15,
  },
  personalStatRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  personalStatLabel: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  personalStatValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#667eea",
  },
  tipsContainer: {
    gap: 15,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    marginLeft: 15,
    lineHeight: 20,
  },
  leaderboardContent: {
    padding: 20,
    flex: 1,
  },
  leaderboardHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  leaderboardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  leaderboardSubtitle: {
    fontSize: 14,
    color: "#6c757d",
  },
  leaderboardList: {
    marginBottom: 20,
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  currentUserItem: {
    backgroundColor: "#667eea",
  },
  rankContainer: {
    width: 40,
    alignItems: "center",
    marginRight: 15,
  },
  rankText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    fontSize: 24,
    marginRight: 10,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  currentUsername: {
    color: "#fff",
  },
  userStats: {
    fontSize: 12,
    color: "#6c757d",
  },
  scoreContainer: {
    alignItems: "center",
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#667eea",
  },
  scoreLabel: {
    fontSize: 10,
    color: "#6c757d",
  },
  bestMoveText: {
    fontSize: 10,
    color: "#4CAF50",
    fontWeight: "500",
    marginTop: 2,
  },
  aiInfo: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  aiStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  aiStatItem: {
    width: "48%",
    alignItems: "center",
    marginBottom: 15,
  },
  aiStatLabel: {
    fontSize: 12,
    color: "#6c757d",
    marginBottom: 5,
  },
  aiStatValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#667eea",
  },
  fullScreenLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#2363eb",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
    marginTop: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  scopeButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  scopeButtonActive: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  scopeButtonText: {
    fontSize: 14,
    color: "#6c757d",
    fontWeight: "bold",
  },
  scopeButtonTextActive: {
    color: "#fff",
  },
  leaderboardSwitchRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    gap: 10,
  },
  leaderboardSwitchBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  leaderboardSwitchActive: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  leaderboardSwitchText: {
    fontSize: 14,
    color: "#6c757d",
    fontWeight: "bold",
  },
  leaderboardSwitchTextActive: {
    color: "#fff",
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#6c757d",
  },
  statSubtitle: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
  },
});

export default GameDetailsScreen;
