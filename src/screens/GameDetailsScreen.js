import React, { useState, useEffect } from "react";
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
} from "../services/scoreService";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

// Données du classement spécifique au jeu
const gameLeaderboardData = [
  {
    id: "1",
    username: "AlexGamer",
    rank: 1,
    score: 2847,
    bestMove: "15.3s",
    winRate: 89,
    gamesPlayed: 45,
    avatar: "👑",
    isCurrentUser: true,
  },
  {
    id: "2",
    username: "MariePro",
    rank: 2,
    score: 2654,
    bestMove: "18.7s",
    winRate: 76,
    gamesPlayed: 38,
    avatar: "🎮",
    isCurrentUser: false,
  },
  {
    id: "3",
    username: "PierreMaster",
    rank: 3,
    score: 2489,
    bestMove: "22.1s",
    winRate: 71,
    gamesPlayed: 42,
    avatar: "⚡",
    isCurrentUser: false,
  },
];

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
  const { game, selectedCountry = countries[0] } = route.params;
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

  // Utiliser l'identifiant technique Firestore du jeu
  const gameId = game.id || game.title;

  // Switch classement mondial/pays
  const [leaderboardType, setLeaderboardType] = useState("global");
  // Attribution d'un pays à chaque joueur (pour la démo)
  const gameLeaderboardWithCountry = gameLeaderboardData.map((item, idx) => ({
    ...item,
    country: countries[idx % countries.length],
  }));
  // Top 10 mondial
  const top10Global = gameLeaderboardWithCountry.slice(0, 10);
  // Top 10 du pays sélectionné
  const top10Country = gameLeaderboardWithCountry
    .filter((item) => item.country.code === selectedCountry.code)
    .slice(0, 10);

  // Charger les statistiques de l'utilisateur pour ce jeu (uniquement Firestore)
  useFocusEffect(
    React.useCallback(() => {
      const loadUserStats = async () => {
        if (user?.id && gameId) {
          try {
            setStatsLoading(true);
            const stats = await getUserGameScore(user.id, gameId);
            setUserStats(stats);
            const { rank, total } = await getUserRankInLeaderboard(
              user.id,
              gameId
            );
            setUserRank(rank);
            setTotalPlayers(total);
          } catch (error) {
            console.log("Erreur lors du chargement des stats:", error);
          } finally {
            setStatsLoading(false);
          }
        }
      };
      loadUserStats();
    }, [user?.id, gameId])
  );

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
            {leaderboardType === "global" && item.country && (
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
        <ScrollView showsVerticalScrollIndicator={false}>
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
              onPress={() => setActiveTab("leaderboard")}>
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
                      <Ionicons name='trending-up' size={20} color='#2196F3' />
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
                      <Text style={styles.personalStatLabel}>Score total</Text>
                      <Text style={styles.personalStatValue}>
                        {userStats.totalPoints} points
                      </Text>
                    </View>
                    <View style={styles.personalStatRow}>
                      <Ionicons name='time-outline' size={20} color='#607D8B' />
                      <Text style={styles.personalStatLabel}>Temps total</Text>
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
          ) : (
            <View style={styles.leaderboardContent}>
              {/* Switch Mondial / Par pays */}
              <View style={styles.leaderboardSwitchRow}>
                <TouchableOpacity
                  style={[
                    styles.leaderboardSwitchBtn,
                    leaderboardType === "global" &&
                      styles.leaderboardSwitchActive,
                  ]}
                  onPress={() => setLeaderboardType("global")}>
                  <Text
                    style={[
                      styles.leaderboardSwitchText,
                      leaderboardType === "global" &&
                        styles.leaderboardSwitchTextActive,
                    ]}>
                    Mondial
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.leaderboardSwitchBtn,
                    leaderboardType === "country" &&
                      styles.leaderboardSwitchActive,
                  ]}
                  onPress={() => setLeaderboardType("country")}>
                  <Text
                    style={[
                      styles.leaderboardSwitchText,
                      leaderboardType === "country" &&
                        styles.leaderboardSwitchTextActive,
                    ]}>
                    {selectedCountry.flag} {selectedCountry.name}
                  </Text>
                </TouchableOpacity>
              </View>
              {/* En-tête du classement */}
              <View style={styles.leaderboardHeader}>
                <Text style={styles.leaderboardTitle}>
                  {leaderboardType === "global"
                    ? `Classement ${game.title} (Mondial)`
                    : `Top 10 - ${selectedCountry.name}`}
                </Text>
                <Text style={styles.leaderboardSubtitle}>
                  {leaderboardType === "global"
                    ? `Top 10 des meilleurs joueurs tous pays`
                    : `Joueurs du pays : ${selectedCountry.flag} ${selectedCountry.name}`}
                </Text>
              </View>
              {/* Liste du classement */}
              <FlatList
                data={leaderboardType === "global" ? top10Global : top10Country}
                renderItem={renderLeaderboardItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                style={styles.leaderboardList}
                ListEmptyComponent={
                  <Text
                    style={{
                      color: "#6c757d",
                      textAlign: "center",
                      marginTop: 20,
                    }}>
                    Aucun joueur trouvé pour ce pays.
                  </Text>
                }
              />
            </View>
          )}
        </ScrollView>
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
  leaderboardSwitchRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
    gap: 10,
  },
  leaderboardSwitchBtn: {
    backgroundColor: "#f1f3f4",
    borderRadius: 16,
    paddingVertical: 7,
    paddingHorizontal: 18,
    marginHorizontal: 2,
  },
  leaderboardSwitchActive: {
    backgroundColor: "#667eea",
  },
  leaderboardSwitchText: {
    color: "#667eea",
    fontWeight: "bold",
    fontSize: 15,
  },
  leaderboardSwitchTextActive: {
    color: "#fff",
  },
});

export default GameDetailsScreen;
