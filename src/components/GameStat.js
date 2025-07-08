import React from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const GameStat = ({ userStats, statsLoading, game }) => {
  const renderStatCard = (icon, value, label, color, subtitle = "") => (
    <View style={styles.statCard}>
      <View
        style={[styles.statIconContainer, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
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
                <Text style={styles.personalStatLabel}>Meilleur temps</Text>
                <Text style={styles.personalStatValue}>
                  {userStats.bestTime
                    ? `${userStats.bestTime.toFixed(1)} s`
                    : "Aucun temps"}
                </Text>
              </View>
              <View style={styles.personalStatRow}>
                <Ionicons name='checkmark-circle' size={20} color='#4CAF50' />
                <Text style={styles.personalStatLabel}>Victoires</Text>
                <Text style={styles.personalStatValue}>
                  {userStats.win} sur {userStats.totalGames || 0}
                </Text>
              </View>
              <View style={styles.personalStatRow}>
                <Ionicons name='trending-up' size={20} color='#2196F3' />
                <Text style={styles.personalStatLabel}>Taux de victoire</Text>
                <Text style={styles.personalStatValue}>
                  {userStats.winRate}%
                </Text>
              </View>
              <View style={styles.personalStatRow}>
                <Ionicons name='flash' size={20} color='#FF9800' />
                <Text style={styles.personalStatLabel}>Série actuelle</Text>
                <Text style={styles.personalStatValue}>
                  {userStats.currentStreak} victoires
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = {
  statsContent: {
    flex: 1,
    paddingHorizontal: 16,
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
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  personalStats: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
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
    fontWeight: "600",
    color: "#333",
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: "#999",
  },
};

export default GameStat;
