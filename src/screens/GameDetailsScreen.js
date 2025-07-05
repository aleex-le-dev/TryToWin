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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useAuth } from "../hooks/useAuth";
import {
  getUserGameScore,
  getUserRankInLeaderboard,
  recordGameResult,
  getLeaderboard,
} from "../services/scoreService";
import { useFocusEffect } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";

const { width } = Dimensions.get("window");

// Données du classement spécifique au jeu (remplacées par les vraies données Firestore)
const gameLeaderboardData = [];

// Liste de pays avec drapeau (emoji)
const countries = [
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "US", name: "États-Unis", flag: "🇺🇸" },
  { code: "DE", name: "Allemagne", flag: "🇩🇪" },
  { code: "ES", name: "Espagne", flag: "🇪🇸" },
  { code: "IT", name: "Italie", flag: "🇮🇹" },
  { code: "GB", name: "Royaume-Uni", flag: "🇬🇧" },
  { code: "MA", name: "Maroc", flag: "🇲🇦" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "JP", name: "Japon", flag: "🇯🇵" },
  { code: "BR", name: "Brésil", flag: "🇧🇷" },
];

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
  const flatListRef = useRef(null);

  // Utiliser l'identifiant technique Firestore du jeu
  const gameId = game.id || game.title;
  console.log(
    "🎯 GameDetailsScreen - gameId utilisé:",
    gameId,
    "pour le jeu:",
    game.title
  );

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

            // Récupérer le profil utilisateur pour obtenir le pays
            const userProfileRef = doc(db, "users", user.id);
            const userProfileSnap = await getDoc(userProfileRef);
            const userProfile = userProfileSnap.exists()
              ? userProfileSnap.data()
              : {};
            const userCountry = userProfile.country || "FR"; // Pays par défaut

            // Charger le classement
            const leaderboard = await getLeaderboard(gameId, 51, user);
            const processedLeaderboard = leaderboard.map((item, index) => ({
              id: item.userId,
              username: item.isCurrentUser
                ? user.displayName || user.email || "Vous"
                : item.username || `Joueur ${item.userId.slice(0, 6)}`,
              rank: item.rank,
              score: item.totalPoints || 0,
              winRate: item.winRate || 0,
              gamesPlayed: item.totalGames || 0,
              avatar: getAvatarForRank(item.rank),
              isCurrentUser: item.userId === user.id,
              country: item.isCurrentUser
                ? countries.find((c) => c.code === userCountry) || countries[0]
                : countries[index % countries.length],
            }));
            setLeaderboardData(processedLeaderboard);
            console.log(
              "📊 Nombre de joueurs dans le classement:",
              processedLeaderboard.length,
              "Pays utilisateur:",
              userCountry
            );
          } catch (error) {
            console.log("Erreur lors du chargement des données:", error);
          } finally {
            setStatsLoading(false);
            setLeaderboardLoading(false);
          }
        }
      };
      loadData();
    }, [user?.id, gameId])
  );

  // Fonction pour scroller vers l'utilisateur
  const scrollToUser = () => {
    if (leaderboardData.length > 0 && flatListRef.current) {
      const userIndex = leaderboardData.findIndex((item) => item.isCurrentUser);
      console.log("🎯 Scroll manuel vers l'utilisateur à l'index:", userIndex);

      if (userIndex !== -1) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: userIndex,
            animated: true,
            viewPosition: 0.5,
          });
        }, 100);
      }
    }
  };

  // Effet pour scroller automatiquement vers la position de l'utilisateur
  useEffect(() => {
    if (
      !leaderboardLoading &&
      leaderboardData.length > 0 &&
      flatListRef.current &&
      activeTab === "leaderboard"
    ) {
      // Trouver l'index de l'utilisateur dans le classement (30ème place)
      const userIndex = leaderboardData.findIndex((item) => item.isCurrentUser);
      console.log(
        "🎯 Tentative de scroll vers l'utilisateur à l'index:",
        userIndex
      );

      if (userIndex !== -1) {
        // Attendre un peu que la FlatList soit rendue
        setTimeout(() => {
          console.log("🎯 Scroll automatique vers l'index:", userIndex);
          flatListRef.current?.scrollToIndex({
            index: userIndex,
            animated: true,
            viewPosition: 0.5, // Centre l'élément dans la vue
          });
        }, 300); // Réduit le délai pour une réponse plus rapide
      } else {
        console.log("❌ Utilisateur non trouvé dans le classement");
      }
    } else {
      console.log("🔍 Conditions non remplies pour le scroll:", {
        leaderboardLoading,
        dataLength: leaderboardData.length,
        hasRef: !!flatListRef.current,
        activeTab,
      });
    }
  }, [leaderboardLoading, leaderboardData, activeTab]);

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

  const renderLeaderboardItem = ({ item }) => (
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
        {item.rank <= 3 && (
          <Ionicons
            name='trophy'
            size={16}
            color={
              item.rank === 1
                ? "#FFD700"
                : item.rank === 2
                ? "#C0C0C0"
                : "#CD7F32"
            }
          />
        )}
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userAvatar}>{item.avatar}</Text>
        <View style={styles.userDetails}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {/* Affiche le drapeau du pays dans le classement mondial */}
            {item.country && (
              <Text style={{ fontSize: 18, marginRight: 5 }}>
                {item.country.flag}
              </Text>
            )}
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
            <View style={styles.headerContent}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}>
                <Ionicons name='arrow-back' size={24} color='#fff' />
              </TouchableOpacity>
            </View>

            <View style={styles.gameHeader}>
              <View style={styles.gameIconContainer}>
                <Text style={styles.gameIcon}>{game.image}</Text>
              </View>
              <View style={styles.gameInfo}>
                <Text style={styles.gameTitle}>{game.title}</Text>
                <Text style={styles.gameDescription}>{game.description}</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Bouton de jeu principal */}
          <View style={styles.playButtonContainer}>
            <TouchableOpacity
              style={[styles.playButton, { backgroundColor: game.color }]}
              onPress={handlePlayGame}>
              <View style={styles.playButtonGradientFake}>
                <Ionicons name='game-controller' size={24} color='#fff' />
                <Text style={styles.playButtonText}>Jouer</Text>
              </View>
            </TouchableOpacity>
          </View>

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
                // Scroll vers l'utilisateur après un court délai
                setTimeout(() => scrollToUser(), 100);
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
          {activeTab === "stats" ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}>
              <View style={styles.statsContent}>
                {/* Statistiques personnelles */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Statistiques</Text>
                  {statsLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size='large' color={game.color} />
                      <Text style={styles.loadingText}>
                        Chargement des statistiques...
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.personalStats}>
                      <View style={styles.personalStatRow}>
                        <Ionicons name='trophy' size={20} color='#FFD700' />
                        <Text style={styles.personalStatLabel}>
                          Meilleur temps
                        </Text>
                        <Text style={styles.personalStatValue}>
                          {userStats.bestTime
                            ? `${userStats.bestTime.toFixed(1)} s`
                            : "Aucun temps"}
                        </Text>
                      </View>
                      <View style={styles.personalStatRow}>
                        <Ionicons
                          name='checkmark-circle'
                          size={20}
                          color='#4CAF50'
                        />
                        <Text style={styles.personalStatLabel}>Victoires</Text>
                        <Text style={styles.personalStatValue}>
                          {userStats.win} sur {userStats.totalGames || 0}
                        </Text>
                      </View>
                      <View style={styles.personalStatRow}>
                        <Ionicons
                          name='trending-up'
                          size={20}
                          color='#2196F3'
                        />
                        <Text style={styles.personalStatLabel}>
                          Taux de victoire
                        </Text>
                        <Text style={styles.personalStatValue}>
                          {userStats.winRate}%
                        </Text>
                      </View>
                      <View style={styles.personalStatRow}>
                        <Ionicons name='flame' size={20} color='#FF5722' />
                        <Text style={styles.personalStatLabel}>
                          Série actuelle
                        </Text>
                        <Text style={styles.personalStatValue}>
                          {userStats.currentStreak} victoire
                          {userStats.currentStreak > 1 ? "s" : ""}
                        </Text>
                      </View>
                      <View style={styles.personalStatRow}>
                        <Ionicons
                          name='game-controller'
                          size={20}
                          color='#9C27B0'
                        />
                        <Text style={styles.personalStatLabel}>Points</Text>
                        <Text style={styles.personalStatValue}>
                          {userStats.totalPoints} points
                        </Text>
                      </View>
                      <View style={styles.personalStatRow}>
                        <Ionicons
                          name='time-outline'
                          size={20}
                          color='#607D8B'
                        />
                        <Text style={styles.personalStatLabel}>
                          Durée de jeu
                        </Text>
                        <Text style={styles.personalStatValue}>
                          {userStats.totalDuration
                            ? `${Math.floor(userStats.totalDuration / 60)}:${(
                                userStats.totalDuration % 60
                              )
                                .toString()
                                .padStart(2, "0")}`
                            : "0:00"}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.leaderboardContent}>
              {/* En-tête du classement */}
              <View style={styles.leaderboardHeader}>
                <Text style={styles.leaderboardTitle}>
                  Classement {game.title} (Mondial)
                </Text>
              </View>
              {/* Liste du classement */}
              {leaderboardLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size='large' color={game.color} />
                  <Text style={styles.loadingText}>
                    Chargement du classement...
                  </Text>
                </View>
              ) : (
                <FlatList
                  ref={flatListRef}
                  data={leaderboardData}
                  renderItem={renderLeaderboardItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={true}
                  style={{ flex: 1 }}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  showsVerticalScrollIndicator={true}
                  removeClippedSubviews={false}
                  initialNumToRender={20}
                  maxToRenderPerBatch={20}
                  windowSize={10}
                  getItemLayout={(data, index) => ({
                    length: 80, // Hauteur approximative de chaque item
                    offset: 80 * index,
                    index,
                  })}
                  ListEmptyComponent={
                    <Text
                      style={{
                        color: "#6c757d",
                        textAlign: "center",
                        marginTop: 20,
                      }}>
                      Aucun joueur n'a encore gagné de points dans ce jeu.
                    </Text>
                  }
                />
              )}
            </View>
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
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  gameHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  gameIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  gameIcon: {
    fontSize: 40,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  gameDescription: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 10,
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
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
  },
  playButton: {
    borderRadius: 25,
    overflow: "hidden",
  },
  playButtonGradientFake: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 30,
  },
  playButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#667eea",
  },
  tabText: {
    fontSize: 16,
    color: "#6c757d",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#667eea",
    fontWeight: "bold",
  },
  statsContent: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  personalStats: {
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
  personalStatRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f4",
  },
  personalStatLabel: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
  },
  personalStatValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  tipsList: {
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
});

export default GameDetailsScreen;
