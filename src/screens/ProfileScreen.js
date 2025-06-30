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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

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

// Écran de profil avec classement et statistiques
const ProfileScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("profile");

  const userStats = {
    totalScore: 2847,
    gamesPlayed: 45,
    gamesWon: 32,
    winRate: 71,
    bestGame: "Memory Game",
    currentStreak: 8,
    totalTime: "12h 34m",
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
          <Text
            style={[
              styles.username,
              item.isCurrentUser && styles.currentUsername,
            ]}>
            {item.username}
          </Text>
          <Text style={styles.userStats}>
            {item.gamesPlayed} parties • {item.score} pts
          </Text>
        </View>
      </View>

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>{item.score}</Text>
        <Text style={styles.scoreLabel}>points</Text>
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
            <Text style={styles.userLevel}>Niveau 15 • Pro Gamer</Text>
            <View style={styles.badges}>
              <Ionicons name='trophy' size={16} color='#FFD700' />
              <Ionicons name='star' size={16} color='#FFD700' />
              <Ionicons name='medal' size={16} color='#FFD700' />
            </View>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name='settings-outline' size={24} color='#fff' />
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
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === "profile" ? (
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
        ) : (
          <View style={styles.leaderboardContent}>
            {/* En-tête du classement */}
            <View style={styles.leaderboardHeader}>
              <Text style={styles.leaderboardTitle}>Classement Global</Text>
              <Text style={styles.leaderboardSubtitle}>
                Top 8 des meilleurs joueurs
              </Text>
            </View>

            {/* Liste du classement */}
            <FlatList
              data={leaderboardData}
              renderItem={renderLeaderboardItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              style={styles.leaderboardList}
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
});

export default ProfileScreen;
