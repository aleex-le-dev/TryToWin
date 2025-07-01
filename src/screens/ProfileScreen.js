import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  TextInput,
  Platform,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { Picker } from "@react-native-picker/picker";
import { ColorPicker } from "react-native-color-picker";
import { auth } from "../utils/firebaseConfig";
import { signOut } from "firebase/auth";

const { width } = Dimensions.get("window");

// Données du classement
const leaderboardData = [
  {
    id: "1",
    username: "AlexGamer",
    rank: 1,
    score: 2847,
    gamesPlayed: 45,
    avatar: "👑",
    isCurrentUser: true,
  },
  {
    id: "2",
    username: "MariePro",
    rank: 2,
    score: 2654,
    gamesPlayed: 38,
    avatar: "🎮",
    isCurrentUser: false,
  },
  {
    id: "3",
    username: "PierreMaster",
    rank: 3,
    score: 2489,
    gamesPlayed: 42,
    avatar: "⚡",
    isCurrentUser: false,
  },
  {
    id: "4",
    username: "SophieWin",
    rank: 4,
    score: 2312,
    gamesPlayed: 35,
    avatar: "🌟",
    isCurrentUser: false,
  },
  {
    id: "5",
    username: "LucasChamp",
    rank: 5,
    score: 2156,
    gamesPlayed: 29,
    avatar: "🏆",
    isCurrentUser: false,
  },
  {
    id: "6",
    username: "EmmaStar",
    rank: 6,
    score: 1987,
    gamesPlayed: 33,
    avatar: "💎",
    isCurrentUser: false,
  },
  {
    id: "7",
    username: "ThomasElite",
    rank: 7,
    score: 1845,
    gamesPlayed: 27,
    avatar: "🔥",
    isCurrentUser: false,
  },
  {
    id: "8",
    username: "JulieQueen",
    rank: 8,
    score: 1723,
    gamesPlayed: 31,
    avatar: "👸",
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

// Bannière par défaut (placeholder) via Placeholders.xyz
const DEFAULT_BANNER =
  "https://placeholders.xyz/800x200/667eea/FFFFFF?text=Ma+Banni%C3%A8re";

// Écran de profil avec classement et statistiques
const ProfileScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [profileBanner, setProfileBanner] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("👑");
  const [profileName, setProfileName] = useState("AlexGamer");
  const [profileBio, setProfileBio] = useState(
    "Passionné de jeux de stratégie et de logique. Toujours prêt à relever de nouveaux défis !"
  );
  const [editing, setEditing] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [editingField, setEditingField] = useState(null);
  const [bannerColor, setBannerColor] = useState("#fff");
  const [bannerModalVisible, setBannerModalVisible] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [leaderboardType, setLeaderboardType] = useState("global");

  const userStats = {
    totalScore: 2847,
    gamesPlayed: 45,
    gamesWon: 32,
    winRate: 71,
    bestGame: "Memory Game",
    currentStreak: 8,
    totalTime: "12h 34m",
  };

  const leaderboardDataWithCountry = leaderboardData.map((item, idx) => ({
    ...item,
    country: countries[idx % countries.length],
  }));

  const top10Global = leaderboardDataWithCountry.slice(0, 10);
  const top10Country = leaderboardDataWithCountry
    .filter((item) => item.country.code === selectedCountry.code)
    .slice(0, 10);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.warn("[DEBUG] User logged out successfully");
      Toast.show({
        type: "success",
        text1: "Déconnexion réussie",
        text2: "Vous avez été déconnecté avec succès",
        position: "top",
        visibilityTime: 2000,
      });

      // Navigation vers la page de connexion
      setTimeout(() => {
        navigation.navigate("Login");
      }, 1000);
    } catch (error) {
      console.warn("[DEBUG] Logout error:", error.message);
      Toast.show({
        type: "error",
        text1: "Erreur de déconnexion",
        text2: "Impossible de se déconnecter",
        position: "top",
        visibilityTime: 3000,
      });
    }
  };

  const renderLeaderboardItem = ({ item, index }) => (
    <View
      style={[
        styles.leaderboardItem,
        item.isCurrentUser && styles.currentUserItem,
      ]}>
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>#{item.rank}</Text>
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
                item.isCurrentUser && styles.currentUsername,
              ]}>
              {item.username}
            </Text>
          </View>
          <Text style={styles.userStats}>
            {item.gamesPlayed} parties • {item.score} pts
          </Text>
        </View>
      </View>

      <View style={styles.scoreContainer}>
        <Text
          style={[styles.scoreText, item.isCurrentUser && { color: "#fff" }]}>
          {item.score}
        </Text>
        <Text
          style={[styles.scoreLabel, item.isCurrentUser && { color: "#fff" }]}>
          points
        </Text>
      </View>
    </View>
  );

  const renderStatCard = (icon, value, label, color) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color='#fff' />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header du profil */}
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>👑</Text>
            <View style={styles.onlineIndicator} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>AlexGamer</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleLogout}>
            <Ionicons name='log-out-outline' size={24} color='#fff' />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Onglets */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "profile" && styles.activeTab]}
          onPress={() => setActiveTab("profile")}>
          <Text
            style={[
              styles.tabText,
              activeTab === "profile" && styles.activeTabText,
            ]}>
            Profil
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "leaderboard" && styles.activeTab]}
          onPress={() => setActiveTab("leaderboard")}>
          <Text
            style={[
              styles.tabText,
              activeTab === "leaderboard" && styles.activeTabText,
            ]}>
            Classement
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "stat" && styles.activeTab]}
          onPress={() => setActiveTab("stat")}>
          <Text
            style={[
              styles.tabText,
              activeTab === "stat" && styles.activeTabText,
            ]}>
            Statistique
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === "profile" ? (
          <View style={styles.playerCardWrapper}>
            {/* Bannière en arrière-plan, en haut */}
            {profileBanner ? (
              <Image source={{ uri: profileBanner }} style={styles.bannerBg} />
            ) : (
              <View
                style={[styles.bannerBg, { backgroundColor: bannerColor }]}
              />
            )}
            {/* Carte de joueur principale en overlay */}
            <View style={styles.playerCard}>
              {/* Avatar circulaire mis en avant, débordant */}
              <View style={styles.playerAvatarContainer}>
                <Text style={styles.playerAvatar}>{profileAvatar}</Text>
              </View>
              {/* Pseudo, tag et pays */}
              <View style={styles.playerIdentityRow}>
                <Text style={styles.playerName}>{profileName}</Text>
                <Text style={styles.playerTag}>#1234</Text>
                <View style={styles.playerCountry}>
                  <Text style={styles.playerFlag}>{selectedCountry.flag}</Text>
                  <Text style={styles.playerCountryName}>
                    {selectedCountry.name}
                  </Text>
                </View>
              </View>
              {/* Statistiques clés sous forme de mini-cartes */}
              <View style={styles.playerStatsRow}>
                <View style={styles.playerStatCard}>
                  <Ionicons name='trophy' size={20} color='#FFD700' />
                  <Text style={styles.playerStatValue}>
                    {userStats.totalScore}
                  </Text>
                  <Text style={styles.playerStatLabel}>Score</Text>
                </View>
                <View style={styles.playerStatCard}>
                  <Ionicons name='game-controller' size={20} color='#4ECDC4' />
                  <Text style={styles.playerStatValue}>
                    {userStats.gamesPlayed}
                  </Text>
                  <Text style={styles.playerStatLabel}>Parties</Text>
                </View>
                <View style={styles.playerStatCard}>
                  <Ionicons name='checkmark-circle' size={20} color='#45B7D1' />
                  <Text style={styles.playerStatValue}>
                    {userStats.gamesWon}
                  </Text>
                  <Text style={styles.playerStatLabel}>Victoires</Text>
                </View>
                <View style={styles.playerStatCard}>
                  <Ionicons name='trending-up' size={20} color='#96CEB4' />
                  <Text style={styles.playerStatValue}>
                    {userStats.winRate}%
                  </Text>
                  <Text style={styles.playerStatLabel}>Winrate</Text>
                </View>
              </View>
              {/* Bio du joueur */}
              <Text style={styles.playerBio}>{profileBio}</Text>
            </View>
          </View>
        ) : activeTab === "leaderboard" ? (
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
                  ? "Classement Mondial"
                  : `Top 10 - ${selectedCountry.name}`}
              </Text>
              <Text style={styles.leaderboardSubtitle}>
                {leaderboardType === "global"
                  ? "Top 10 des meilleurs joueurs tous pays"
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
            {/* Informations supplémentaires */}
            <View style={styles.leaderboardInfo}>
              <View style={styles.infoItem}>
                <Ionicons
                  name='information-circle-outline'
                  size={20}
                  color='#667eea'
                />
                <Text style={styles.infoText}>
                  Le classement est mis à jour toutes les heures
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.profileContent}>
            {/* Statistiques principales */}
            <View style={styles.statsGrid}>
              {renderStatCard(
                "trophy",
                userStats.totalScore,
                "Score Total",
                "#FF6B6B"
              )}
              {renderStatCard(
                "game-controller",
                userStats.gamesPlayed,
                "Parties Jouées",
                "#4ECDC4"
              )}
              {renderStatCard(
                "checkmark-circle",
                userStats.gamesWon,
                "Victoires",
                "#45B7D1"
              )}
              {renderStatCard(
                "trending-up",
                `${userStats.winRate}%`,
                "Taux de Victoire",
                "#96CEB4"
              )}
            </View>

            {/* Statistiques détaillées */}
            <View style={styles.detailedStats}>
              <Text style={styles.sectionTitle}>Statistiques Détaillées</Text>

              <View style={styles.statRow}>
                <Ionicons name='star' size={20} color='#FFD700' />
                <Text style={styles.statRowLabel}>Meilleur jeu</Text>
                <Text style={styles.statRowValue}>{userStats.bestGame}</Text>
              </View>

              <View style={styles.statRow}>
                <Ionicons name='flame' size={20} color='#FF6B6B' />
                <Text style={styles.statRowLabel}>Série actuelle</Text>
                <Text style={styles.statRowValue}>
                  {userStats.currentStreak} victoires
                </Text>
              </View>

              <View style={styles.statRow}>
                <Ionicons name='time' size={20} color='#4ECDC4' />
                <Text style={styles.statRowLabel}>Temps total</Text>
                <Text style={styles.statRowValue}>{userStats.totalTime}</Text>
              </View>
            </View>

            {/* Actions rapides */}
            <View style={styles.quickActions}>
              <Text style={styles.sectionTitle}>Actions Rapides</Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name='share-outline' size={24} color='#667eea' />
                  <Text style={styles.actionButtonText}>Partager</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name='download-outline' size={24} color='#667eea' />
                  <Text style={styles.actionButtonText}>Exporter</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons
                    name='help-circle-outline'
                    size={24}
                    color='#667eea'
                  />
                  <Text style={styles.actionButtonText}>Aide</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
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
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 15,
  },
  avatar: {
    fontSize: 50,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#fff",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  userLevel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 5,
  },
  badges: {
    flexDirection: "row",
    gap: 5,
  },
  settingsButton: {
    padding: 10,
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
  content: {
    flex: 1,
  },
  profileContent: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: "center",
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
    fontSize: 12,
    color: "#6c757d",
    textAlign: "center",
  },
  detailedStats: {
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f4",
  },
  statRowLabel: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  statRowValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#667eea",
  },
  quickActions: {
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
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  actionButton: {
    alignItems: "center",
    padding: 15,
  },
  actionButtonText: {
    fontSize: 12,
    color: "#667eea",
    marginTop: 5,
    fontWeight: "500",
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
  leaderboardInfo: {
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
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    fontSize: 14,
    color: "#6c757d",
    marginLeft: 10,
    flex: 1,
  },
  customProfileContent: {
    backgroundColor: "#18191c",
    flex: 1,
    padding: 0,
    minHeight: "100%",
  },
  bannerContainer: {
    width: "100%",
    height: 120,
    backgroundColor: "#18191c",
    position: "relative",
    marginBottom: 0,
    overflow: "visible",
  },
  banner: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    backgroundColor: "#18191c",
  },
  profileAvatarWrapper: {
    position: "absolute",
    left: 24,
    bottom: -40,
    zIndex: 2,
    backgroundColor: "#18191c",
    borderRadius: 48,
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#23272a",
    elevation: 6,
  },
  avatarBig: {
    fontSize: 48,
  },
  profileMainCard: {
    backgroundColor: "#23272a",
    borderRadius: 18,
    marginTop: 48,
    marginHorizontal: 16,
    padding: 24,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  profileEditRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  editIcon: {
    marginLeft: 8,
    padding: 4,
  },
  profileUserName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 2,
  },
  profileTagRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  profileTag: {
    backgroundColor: "#5865f2",
    color: "#fff",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 13,
    marginRight: 6,
    fontWeight: "bold",
  },
  profileCountry: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  countryFlag: {
    fontSize: 22,
    marginRight: 6,
  },
  profileBio: {
    fontSize: 15,
    color: "#b9bbbe",
    marginTop: 8,
    textAlign: "left",
    marginBottom: 10,
  },
  profileHint: {
    fontSize: 12,
    color: "#6c757d",
    marginTop: 10,
    textAlign: "center",
  },
  saveButtonFixed: {
    backgroundColor: "#667eea",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 36,
    alignSelf: "center",
    marginTop: 18,
    marginBottom: 10,
    elevation: 4,
    zIndex: 200,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  countryPicker: {
    flex: 1,
    height: 40,
    color: "#333",
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
  },
  bannerEditIconFixed: {
    position: "absolute",
    top: 14,
    right: 18,
    backgroundColor: "rgba(0,0,0,0.85)",
    borderRadius: 20,
    padding: 8,
    zIndex: 100,
    borderWidth: 2,
    borderColor: "#fff",
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#23272a",
    borderRadius: 18,
    padding: 24,
    width: "85%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  modalLabel: {
    color: "#b9bbbe",
    marginBottom: 8,
  },
  colorPreview: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#fff",
  },
  colorPreviewText: {
    color: "#fff",
    fontSize: 15,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginTop: 16,
  },
  uploadButtonText: {
    color: "#667eea",
    fontWeight: "bold",
    marginLeft: 8,
  },
  closeModalButton: {
    marginTop: 18,
  },
  closeModalText: {
    color: "#fff",
    fontSize: 15,
    textDecorationLine: "underline",
  },
  bannerDefault: {
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "#18191c",
    borderRadius: 0,
  },
  playerCardWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#18191c",
    paddingTop: 0,
    paddingBottom: 32,
  },
  bannerBg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: 140,
    zIndex: 1,
  },
  playerCard: {
    width: "92%",
    backgroundColor: "#fff",
    borderRadius: 24,
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 80,
    marginBottom: 18,
    zIndex: 2,
  },
  playerAvatarContainer: {
    marginTop: -60,
    marginBottom: 12,
    backgroundColor: "#23272a",
    borderRadius: 60,
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 5,
    borderColor: "#fff",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    zIndex: 3,
  },
  playerAvatar: {
    fontSize: 60,
  },
  playerIdentityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  playerName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#23272a",
  },
  playerTag: {
    backgroundColor: "#667eea",
    color: "#fff",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 13,
    fontWeight: "bold",
    marginLeft: 6,
  },
  playerCountry: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  playerFlag: {
    fontSize: 22,
    marginRight: 4,
  },
  playerCountryName: {
    color: "#23272a",
    fontSize: 14,
  },
  playerStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 18,
    gap: 8,
  },
  playerStatCard: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 14,
    alignItems: "center",
    paddingVertical: 12,
    marginHorizontal: 2,
    elevation: 2,
  },
  playerStatValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#23272a",
    marginTop: 2,
  },
  playerStatLabel: {
    fontSize: 11,
    color: "#6c757d",
    marginTop: 1,
  },
  playerBio: {
    fontSize: 15,
    color: "#667eea",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 0,
  },
  playerActionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
    marginTop: 8,
  },
  playerActionButton: {
    alignItems: "center",
    padding: 10,
  },
  playerActionText: {
    fontSize: 12,
    color: "#667eea",
    marginTop: 3,
    fontWeight: "500",
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

export default ProfileScreen;
