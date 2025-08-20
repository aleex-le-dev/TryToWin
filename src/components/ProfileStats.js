import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { gamesData as GAMES_DATA } from "../constants/gamesData";
import { useTheme } from "../contexts/ThemeContext";

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
  const { theme } = useTheme();
  const [selectedGame, setSelectedGame] = useState(null);

  if (statsLoading) {
    return (
      <View style={[styles.loadingContainer, style]}>
        <ActivityIndicator size='large' color={gameColor} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Chargement des statistiques...</Text>
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
    <View style={[styles.premiumStatCard, { backgroundColor: theme.card }]}>
      <View style={[styles.premiumStatIcon, { backgroundColor: color + "22" }]}>
        {/* Couleur pastel */}
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={[styles.premiumStatValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.premiumStatLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );

  const renderGameStats = (gameId, gameStats) => {
    const game = GAMES_DATA.find((g) => g.id === gameId);
    if (!game || !gameStats) return null;

    return (
      <View key={gameId} style={styles.gameStatsSection}>
        <View style={styles.gameHeader}>
          <Text style={[styles.gameTitle, { color: theme.text }]}>{game.title}</Text>
          <View
            style={[styles.gameColorIndicator, { backgroundColor: game.color }]}
          />
        </View>

        <View style={[styles.personalStats, { backgroundColor: theme.card }]}>
          <View style={[styles.personalStatRow, { borderBottomColor: theme.divider }]}>
            <Ionicons name='trophy' size={20} color='#FFD700' />
            <Text style={[styles.personalStatLabel, { color: theme.text }]}>Meilleur score</Text>
            <Text style={[styles.personalStatValue, { color: theme.primary }]}>
              {gameStats.bestScore || 0}
            </Text>
          </View>

          <View style={[styles.personalStatRow, { borderBottomColor: theme.divider }]}>
            <Ionicons name='checkmark-circle' size={20} color='#4CAF50' />
            <Text style={[styles.personalStatLabel, { color: theme.text }]}>Victoires</Text>
            <Text style={[styles.personalStatValue, { color: theme.primary }]}>
              {gameStats.win || 0} sur {gameStats.totalGames || 0}
            </Text>
          </View>

          <View style={[styles.personalStatRow, { borderBottomColor: theme.divider }]}>
            <Ionicons name='trending-up' size={20} color='#2196F3' />
            <Text style={[styles.personalStatLabel, { color: theme.text }]}>Taux de victoire</Text>
            <Text style={[styles.personalStatValue, { color: theme.primary }]}>
              {gameStats.winRate || 0}%
            </Text>
          </View>

          <View style={[styles.personalStatRow, { borderBottomColor: theme.divider }]}>
            <Ionicons name='flame' size={20} color='#FF5722' />
            <Text style={[styles.personalStatLabel, { color: theme.text }]}>Série actuelle</Text>
            <Text style={[styles.personalStatValue, { color: theme.primary }]}>
              {gameStats.currentStreak || 0} victoire
              {(gameStats.currentStreak || 0) > 1 ? "s" : ""}
            </Text>
          </View>

          <View style={[styles.personalStatRow, { borderBottomColor: theme.divider }]}>
            <Ionicons name='game-controller' size={20} color='#9C27B0' />
            <Text style={[styles.personalStatLabel, { color: theme.text }]}>Points</Text>
            <Text style={[styles.personalStatValue, { color: theme.primary }]}>
              {gameStats.totalPoints || 0} points
            </Text>
          </View>

          <View style={[styles.personalStatRow, { borderBottomColor: theme.divider }]}>
            <Ionicons name='game-controller' size={20} color='#607D8B' />
            <Text style={[styles.personalStatLabel, { color: theme.text }]}>Parties jouées</Text>
            <Text style={[styles.personalStatValue, { color: theme.primary }]}>
              {gameStats.totalGames || 0}
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
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Statistiques globales</Text>

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
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Par jeu</Text>
            <View style={[styles.tableContainer, { backgroundColor: theme.card, borderColor: theme.divider }]}>
              <View style={[styles.tableHeaderRow, { borderBottomColor: theme.divider }]}>
                <Text style={[styles.tableHeaderCellGame, { color: theme.text }]}>Jeu</Text>
                <Text style={[styles.tableHeaderCell, { color: theme.text }]}>Parties</Text>
                <Text style={[styles.tableHeaderCell, { color: theme.text }]}>V</Text>
                <Text style={[styles.tableHeaderCell, { color: theme.text }]}>N</Text>
                <Text style={[styles.tableHeaderCell, { color: theme.text }]}>D</Text>
                <Text style={[styles.tableHeaderCell, { color: theme.text }]}>Points</Text>
              </View>
              {GAMES_DATA.map((g, index) => {
                const gameId = g.id;
                const s = (statsByGame && statsByGame[gameId]) || {};
                const totalGames = Number(s.totalGames) || 0;
                const wins = Number(s.win ?? s.wins) || 0;
                const draws = Number(s.draw ?? s.draws) || 0;
                const loses = Number(s.lose ?? s.loses) || 0;
                const points = Number(s.totalPoints ?? s.points) || 0;

                return (
                  <View
                    key={gameId}
                    style={[
                      styles.tableRow,
                      { backgroundColor: index % 2 === 0 ? theme.surface : "transparent" },
                    ]}>
                    <View style={styles.tableCellGameWrapper}>
                      <View style={[styles.gameDot, { backgroundColor: g.color }]} />
                      <Text style={[styles.tableCellGameText, { color: theme.text }]}>{g.title}</Text>
                    </View>
                    <Text style={[styles.tableCell, { color: theme.text }]}>{totalGames}</Text>
                    <Text style={[styles.tableCell, { color: theme.text }]}>{wins}</Text>
                    <Text style={[styles.tableCell, { color: theme.text }]}>{draws}</Text>
                    <Text style={[styles.tableCell, { color: theme.text }]}>{loses}</Text>
                    <Text style={[styles.tableCell, { color: theme.text }]}>{points}</Text>
                  </View>
                );
              })}
            </View>
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
  },
  statLabel: {
    fontSize: 11,
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
    marginRight: 8,
  },
  gameColorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  personalStats: {
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
  },
  personalStatLabel: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  personalStatValue: {
    fontSize: 16,
    fontWeight: "bold",
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
    marginBottom: 2,
  },
  premiumStatLabel: {
    fontSize: 12,
    marginTop: 1,
  },
  // Tableau stylé “Par jeu”
  tableContainer: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  tableHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  tableHeaderCellGame: {
    flex: 2,
    fontWeight: "bold",
  },
  tableHeaderCell: {
    flex: 1,
    textAlign: "center",
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableCellGameWrapper: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  gameDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  tableCellGameText: {
    fontWeight: "600",
  },
  tableCell: {
    flex: 1,
    textAlign: "center",
  },
});

export default ProfileStats;
