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
  const [leaderboardType, setLeaderboardType] = useState("global");
  const flatListRef = useRef(null);
  const [userCountry, setUserCountry] = useState("FR");

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
            setUserCountry(userCountry);

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

  const filteredLeaderboardData =
    leaderboardType === "global"
      ? leaderboardData
      : leaderboardData.filter((item) => item.country?.code === userCountry);

  // Fonction pour scroller vers l'utilisateur dans la liste Monde
  const scrollToUserInWorld = () => {
    const data = leaderboardData;
    const userIndex = data.findIndex((item) => item.isCurrentUser);
    console.log(
      "ScrollToUserInWorld - index:",
      userIndex,
      "data.length:",
      data.length
    );
    if (userIndex !== -1 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToIndex({
          index: userIndex,
          animated: true,
          viewPosition: 0.5,
        });
      }, 100);
    }
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
            <View style={styles.headerContent}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}>
                <Ionicons name='arrow-back' size={24} color='#fff' />
              </TouchableOpacity>
            </View>

            <View style={styles.gameHeader}>
              {/* Image en arrière-plan, grande et dépassant à gauche */}
              {typeof game.image !== "string" && (
                <Image
                  source={game.image}
                  style={styles.gameBgImage}
                  resizeMode='contain'
                  pointerEvents='none'
                />
              )}
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
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  marginBottom: 12,
                  gap: 10,
                }}>
                <TouchableOpacity
                  style={{
                    backgroundColor:
                      leaderboardType === "global" ? "#667eea" : "#f1f3f4",
                    borderRadius: 16,
                    paddingVertical: 7,
                    paddingHorizontal: 18,
                    marginHorizontal: 2,
                  }}
                  onPress={() => {
                    setLeaderboardType("global");
                    setTimeout(scrollToUserInWorld, 400);
                  }}>
                  <Text
                    style={{
                      color: leaderboardType === "global" ? "#fff" : "#667eea",
                      fontWeight: "bold",
                      fontSize: 15,
                    }}>
                    Mondial
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor:
                      leaderboardType === "country" ? "#667eea" : "#f1f3f4",
                    borderRadius: 16,
                    paddingVertical: 7,
                    paddingHorizontal: 18,
                    marginHorizontal: 2,
                  }}
                  onPress={() => {
                    setLeaderboardType("country");
                  }}>
                  <Text
                    style={{
                      color: leaderboardType === "country" ? "#fff" : "#667eea",
                      fontWeight: "bold",
                      fontSize: 15,
                    }}>
                    {userCountry === "FR" ? "🇫🇷 France" : userCountry}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ alignItems: "center", marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#333",
                    marginBottom: 5,
                  }}>
                  {leaderboardType === "global"
                    ? `Classement ${game.title} (Mondial)`
                    : `Classement ${game.title} - ${userCountry}`}
                </Text>
                <Text style={{ fontSize: 14, color: "#6c757d" }}>
                  {leaderboardType === "global"
                    ? `Top des meilleurs joueurs tous pays`
                    : `Joueurs du pays : ${userCountry}`}
                </Text>
                {/* Rang de l'utilisateur connecté */}
                {userRank && (
                  <Text
                    style={{
                      marginTop: 8,
                      color: "#667eea",
                      fontWeight: "bold",
                    }}>
                    Ton rang : #{userRank}
                  </Text>
                )}
              </View>
              {/* Liste du classement harmonisée */}
              <FlatList
                ref={flatListRef}
                data={
                  leaderboardType === "global"
                    ? leaderboardData
                    : leaderboardData.filter(
                        (item) => item.country?.code === userCountry
                      )
                }
                renderItem={({ item, index }) => {
                  let medal = null;
                  if (index === 0) medal = "🥇";
                  else if (index === 1) medal = "🥈";
                  else if (index === 2) medal = "🥉";
                  const isCurrentUser = item.isCurrentUser;
                  return (
                    <Animated.View
                      style={{
                        opacity: 1,
                        transform: [{ translateY: 0 }],
                        marginBottom: 12,
                      }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: isCurrentUser
                            ? "rgba(102,126,234,0.10)"
                            : "#fff",
                          borderRadius: 18,
                          paddingVertical: 12,
                          paddingHorizontal: 16,
                          shadowColor: isCurrentUser ? "#667eea" : "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: isCurrentUser ? 0.18 : 0.08,
                          shadowRadius: isCurrentUser ? 8 : 3,
                          elevation: isCurrentUser ? 7 : 3,
                          borderWidth: isCurrentUser ? 2 : 0,
                          borderColor: isCurrentUser
                            ? "#667eea"
                            : "transparent",
                        }}>
                        <Text
                          style={{
                            width: 28,
                            fontWeight: "bold",
                            color:
                              index === 0
                                ? "#FFD700"
                                : index === 1
                                ? "#C0C0C0"
                                : index === 2
                                ? "#CD7F32"
                                : "#23272a",
                            fontSize: 18,
                            textAlign: "center",
                          }}>
                          {medal || `#${index + 1}`}
                        </Text>
                        <View
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            backgroundColor: "#f7faff",
                            alignItems: "center",
                            justifyContent: "center",
                            marginHorizontal: 8,
                            borderWidth: 2,
                            borderColor: isCurrentUser ? "#667eea" : "#e0e3ea",
                          }}>
                          <Text style={{ fontSize: 28 }}>{item.avatar}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontWeight: "bold",
                              fontSize: 16,
                              color: isCurrentUser ? "#667eea" : "#23272a",
                            }}>
                            {item.username}
                          </Text>
                          <Text style={{ fontSize: 12, color: "#6c757d" }}>
                            {item.country?.flag || "🌍"}
                          </Text>
                        </View>
                        <View style={{ alignItems: "flex-end" }}>
                          <Text
                            style={{
                              fontWeight: "bold",
                              fontSize: 16,
                              color: isCurrentUser ? "#667eea" : "#23272a",
                            }}>
                            {item.score}
                          </Text>
                          <Text style={{ fontSize: 12, color: "#6c757d" }}>
                            points
                          </Text>
                        </View>
                      </View>
                    </Animated.View>
                  );
                }}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{ paddingBottom: 200 }}
              />
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
    position: "relative",
    minHeight: 120,
    overflow: "visible",
  },
  gameBgImage: {
    position: "absolute",
    left: -40,
    top: -20,
    width: 300,
    height: 250,
    opacity: 0.18,
    zIndex: 0,
  },
  gameInfo: {
    flex: 1,
    zIndex: 1,
    paddingLeft: 60,
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
});

export default GameDetailsScreen;
