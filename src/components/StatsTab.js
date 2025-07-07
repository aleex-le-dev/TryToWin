/**
 * Composant StatsTab : affiche les statistiques globales et par jeu d'un utilisateur.
 * Style hérité de l'ancienne page statistique du profil pour conserver l'apparence d'origine.
 * Les statistiques détaillées sont maintenant mises en valeur avec un fond, une bordure colorée et une icône dans un cercle coloré.
 * Utilisé dans ProfileScreen. API :
 *   - userStats : { totalScore, gamesPlayed, gamesWon, winRate, bestGame, currentStreak, totalTime }
 *   - statsByGame (optionnel) : { [jeu]: { totalGames, wins, draws, loses, points, winrate } }
 */
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const { width } = Dimensions.get("window");

const mainStats = [
  {
    icon: "trophy",
    color: "#FFD700",
    label: "Points",
    valueKey: "totalScore",
  },
  {
    icon: "game-controller",
    color: "#4ECDC4",
    label: "Parties Jouées",
    valueKey: "gamesPlayed",
  },
  {
    icon: "checkmark-circle",
    color: "#45B7D1",
    label: "Victoires",
    valueKey: "gamesWon",
  },
  {
    icon: "trending-up",
    color: "#96CEB4",
    label: "Taux de Victoire",
    valueKey: "winRate",
    suffix: "%",
  },
  {
    icon: "hand-left-outline",
    color: "#A3A3A3",
    label: "Nuls",
    valueKey: "draws",
  },
  {
    icon: "close-circle",
    color: "#FF6B6B",
    label: "Défaites",
    valueKey: "loses",
  },
  {
    icon: "flame",
    color: "#FF9800",
    label: "Série de victoires",
    valueKey: "currentStreak",
  },
  {
    icon: "time",
    color: "#4ECDC4",
    label: "Durée de jeu",
    valueKey: "totalTime",
  },
  {
    icon: "timer-outline",
    color: "#667eea",
    label: "Meilleur temps",
    valueKey: "bestTime",
  },
];

const StatsTab = ({ userStats, statsByGame }) => {
  // Vérifier si userStats est un objet valide
  if (!userStats || typeof userStats !== "object") {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Chargement des statistiques...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Statistiques principales (grille moderne) */}
      <View style={styles.statsGrid}>
        {mainStats.map((item) => (
          <StatCard
            key={item.label}
            icon={item.icon}
            value={
              item.valueKey === "winRate"
                ? String(userStats?.[item.valueKey] ?? 0) + (item.suffix ?? "")
                : String(userStats?.[item.valueKey] ?? 0)
            }
            label={item.label}
            color={item.color}
          />
        ))}
      </View>
      {/* Nouvelle section stats par jeu (simple grille) */}
      {statsByGame && Object.keys(statsByGame).length > 0 && (
        <View style={{ width: "100%", marginTop: 24 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "#333",
              marginBottom: 10,
            }}>
            Statistiques par jeu
          </Text>
          {Object.entries(statsByGame).map(([jeu, stats]) => (
            <View
              key={jeu}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 8,
                borderBottomWidth: 1,
                borderBottomColor: "#eee",
              }}>
              <Text style={{ flex: 2, fontWeight: "bold", color: "#667eea" }}>
                {jeu}
              </Text>
              <Text style={{ flex: 1, textAlign: "center" }}>
                {stats.totalGames ?? 0} parties
              </Text>
              <Text style={{ flex: 1, textAlign: "center", color: "#4CAF50" }}>
                {stats.wins ?? 0} V
              </Text>
              <Text style={{ flex: 1, textAlign: "center", color: "#FF6B6B" }}>
                {stats.loses ?? 0} D
              </Text>
              <Text style={{ flex: 1, textAlign: "center", color: "#A3A3A3" }}>
                {stats.draws ?? 0} N
              </Text>
              <Text style={{ flex: 1, textAlign: "center", color: "#FFD700" }}>
                {stats.points ?? 0} pts
              </Text>
              <Text style={{ flex: 1, textAlign: "center", color: "#2196F3" }}>
                {stats.winrate ?? 0}%
              </Text>
            </View>
          ))}
        </View>
      )}
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
            <Ionicons name='help-circle-outline' size={24} color='#667eea' />
            <Text style={styles.actionButtonText}>Aide</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Carte de statistique principale
const StatCard = ({ icon, value, label, color }) => {
  return (
    <View style={[styles.statCard, { borderColor: color }]}>
      <View style={[styles.statIcon, { backgroundColor: color + "22" }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.statValue}>{String(value ?? "0")}</Text>
      <Text style={styles.statLabel}>{String(label ?? "")}</Text>
    </View>
  );
};

// Mini carte pour stats par jeu
const MiniStat = ({ label, value }) => {
  return (
    <View style={styles.miniStatCard}>
      <Text style={styles.miniStatValue}>{String(value ?? "0")}</Text>
      <Text style={styles.miniStatLabel}>{String(label ?? "")}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    paddingTop: 18,
    paddingBottom: 32,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    alignItems: "center",
    alignSelf: "center",
    width: "100%",
    marginBottom: 18,
    backgroundColor: "transparent",
    shadowColor: "transparent",
    padding: 0,
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
    borderWidth: 2,
    borderColor: "#fff",
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
    // Même largeur que la grille principale pour un alignement parfait
    width: "100%",
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
  gameBlock: {
    marginBottom: 18,
    padding: 12,
    backgroundColor: "#f7faff",
    borderRadius: 12,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#667eea",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  miniStatCard: {
    alignItems: "center",
    marginHorizontal: 4,
    paddingVertical: 6,
    flex: 1,
  },
  miniStatValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#667eea",
  },
  miniStatLabel: {
    fontSize: 11,
    color: "#23272a",
    marginTop: 2,
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
});

export default StatsTab;
