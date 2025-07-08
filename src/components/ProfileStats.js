import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { gamesData as GAMES_DATA } from "../constants/gamesData";

/**
 * Composant de statistiques de jeu réutilisable
 * Basé sur la logique de GameDetailsScreen
 */
const ProfileStats = ({
  userStats,
  statsByGame,
  statsLoading,
  gameColor = "#667eea",
  generateAllGamesTestData,
  style,
}) => {
  const [selectedGame, setSelectedGame] = useState(null);

  if (statsLoading) {
    return (
      <View style={[styles.loadingContainer, style]}>
        <ActivityIndicator size='large' color={gameColor} />
        <Text style={styles.loadingText}>Chargement des statistiques...</Text>
      </View>
    );
  }

  // Statistiques globales
  const globalStats = {
    totalPoints: userStats?.totalScore || 0,
    totalGames: userStats?.gamesPlayed || 0,
    totalWins: userStats?.gamesWon || 0,
    currentStreak: userStats?.currentStreak || 0,
    winRate:
      userStats && userStats.gamesPlayed > 0
        ? Math.round((userStats.gamesWon / userStats.gamesPlayed) * 100)
        : 0,
  };

  const renderStatCard = (icon, value, label, color) => (
    <View style={styles.premiumStatCard}>
      <View style={[styles.premiumStatIcon, { backgroundColor: color + "22" }]}>
        {" "}
        {/* Couleur pastel */}
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.premiumStatValue}>{value}</Text>
      <Text style={styles.premiumStatLabel}>{label}</Text>
    </View>
  );

  const renderGameStats = (gameId, gameStats) => {
    const game = GAMES_DATA.find((g) => g.id === gameId);
    if (!game || !gameStats) return null;

    return (
      <View key={gameId} style={styles.gameStatsSection}>
        <View style={styles.gameHeader}>
          <Text style={styles.gameTitle}>{game.title}</Text>
          <View
            style={[styles.gameColorIndicator, { backgroundColor: game.color }]}
          />
        </View>

        <View style={styles.personalStats}>
          <View style={styles.personalStatRow}>
            <Ionicons name='trophy' size={20} color='#FFD700' />
            <Text style={styles.personalStatLabel}>Meilleur temps</Text>
            <Text style={styles.personalStatValue}>
              {gameStats.bestTime
                ? `${gameStats.bestTime.toFixed(1)} s`
                : "Aucun temps"}
            </Text>
          </View>

          <View style={styles.personalStatRow}>
            <Ionicons name='checkmark-circle' size={20} color='#4CAF50' />
            <Text style={styles.personalStatLabel}>Victoires</Text>
            <Text style={styles.personalStatValue}>
              {gameStats.win || 0} sur {gameStats.totalGames || 0}
            </Text>
          </View>

          <View style={styles.personalStatRow}>
            <Ionicons name='trending-up' size={20} color='#2196F3' />
            <Text style={styles.personalStatLabel}>Taux de victoire</Text>
            <Text style={styles.personalStatValue}>
              {gameStats.winRate || 0}%
            </Text>
          </View>

          <View style={styles.personalStatRow}>
            <Ionicons name='flame' size={20} color='#FF5722' />
            <Text style={styles.personalStatLabel}>Série actuelle</Text>
            <Text style={styles.personalStatValue}>
              {gameStats.currentStreak || 0} victoire
              {(gameStats.currentStreak || 0) > 1 ? "s" : ""}
            </Text>
          </View>

          <View style={styles.personalStatRow}>
            <Ionicons name='game-controller' size={20} color='#9C27B0' />
            <Text style={styles.personalStatLabel}>Points</Text>
            <Text style={styles.personalStatValue}>
              {gameStats.totalPoints || 0} points
            </Text>
          </View>

          <View style={styles.personalStatRow}>
            <Ionicons name='time-outline' size={20} color='#607D8B' />
            <Text style={styles.personalStatLabel}>Durée de jeu</Text>
            <Text style={styles.personalStatValue}>
              {gameStats.totalDuration
                ? `${Math.floor(gameStats.totalDuration / 60)}:${(
                    gameStats.totalDuration % 60
                  )
                    .toString()
                    .padStart(2, "0")}`
                : "0:00"}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={[styles.container, style]}>
      <View style={styles.statsContent}>
        {/* Statistiques globales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistiques globales</Text>

          {/* Chips statistiques */}
          <View style={styles.statsChips}>
            {renderStatCard(
              "trophy",
              globalStats.totalPoints,
              "Points",
              "#FFD700"
            )}
            {renderStatCard(
              "game-controller",
              globalStats.totalGames,
              "Parties",
              "#4ECDC4"
            )}
            {renderStatCard(
              "flame",
              globalStats.currentStreak,
              "Série",
              "#FF9800"
            )}
            {renderStatCard(
              "stats-chart-outline",
              `${globalStats.winRate}%`,
              "Victoires",
              "#4ECDC4"
            )}
          </View>
        </View>

        {/* Statistiques par jeu */}
        {statsByGame && Object.keys(statsByGame).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Par jeu</Text>
            {Object.entries(statsByGame).map(([gameId, gameStats]) =>
              renderGameStats(gameId, gameStats)
            )}
          </View>
        )}

        {/* Bouton de génération de données de test */}
        {typeof generateAllGamesTestData === "function" && (
          <View style={styles.testDataSection}>
            <TouchableOpacity
              style={[styles.testDataButton, { backgroundColor: gameColor }]}
              onPress={generateAllGamesTestData}>
              <Ionicons name='refresh-outline' size={20} color='#fff' />
              <Text style={styles.testDataButtonText}>
                Générer des données de test
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  statsContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  statsChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 140,
    minHeight: 44,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  statValue: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#23272a",
  },
  statLabel: {
    fontSize: 11,
    color: "#6c757d",
    marginLeft: 4,
  },
  gameStatsSection: {
    marginBottom: 20,
  },
  gameHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginRight: 8,
  },
  gameColorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  personalStats: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  personalStatRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  personalStatLabel: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
  },
  personalStatValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#667eea",
  },
  testDataSection: {
    alignItems: "center",
    marginTop: 20,
  },
  testDataButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 22,
  },
  testDataButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
  premiumStatCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    paddingVertical: 18,
    margin: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  premiumStatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  premiumStatValue: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#23272a",
    marginBottom: 2,
  },
  premiumStatLabel: {
    fontSize: 12,
    color: "#6c757d",
    marginTop: 1,
  },
});

export default ProfileStats;
