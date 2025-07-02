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

const detailedStatsData = [
  {
    icon: "star",
    color: "#FFD700",
    label: "Meilleur jeu",
    valueKey: "bestGame",
  },
  {
    icon: "flame",
    color: "#FF6B6B",
    label: "Série actuelle",
    valueKey: "currentStreak",
    suffix: " victoires",
  },
  {
    icon: "time",
    color: "#4ECDC4",
    label: "Temps total",
    valueKey: "totalTime",
  },
];

const StatsTab = ({ userStats, statsByGame }) => (
  <View style={styles.container}>
    {/* Statistiques principales */}
    <View style={styles.statsGrid}>
      <StatCard
        icon='trophy'
        value={String(userStats?.totalScore ?? "")}
        label='Score Total'
        color='#FF6B6B'
      />
      <StatCard
        icon='game-controller'
        value={String(userStats?.gamesPlayed ?? "")}
        label='Parties Jouées'
        color='#4ECDC4'
      />
      <StatCard
        icon='checkmark-circle'
        value={String(userStats?.gamesWon ?? "")}
        label='Victoires'
        color='#45B7D1'
      />
      <StatCard
        icon='trending-up'
        value={String(userStats?.winRate ?? "") + "%"}
        label='Taux de Victoire'
        color='#96CEB4'
      />
    </View>
    {/* Statistiques détaillées avec mise en forme améliorée */}
    <View style={styles.detailedStats}>
      <Text style={styles.sectionTitle}>Statistiques Détaillées</Text>
      {detailedStatsData.map((item) => (
        <View
          key={item.label}
          style={[styles.statRowEnhanced, { borderLeftColor: item.color }]}>
          <View
            style={[
              styles.statRowIconCircle,
              { backgroundColor: item.color + "22" },
            ]}>
            <Ionicons name={item.icon} size={20} color={item.color} />
          </View>
          <Text style={styles.statRowLabel}>{String(item.label ?? "")}</Text>
          <Text style={styles.statRowValue}>
            {String(userStats?.[item.valueKey] ?? "") + (item.suffix ?? "")}
          </Text>
        </View>
      ))}
    </View>
    {/* Statistiques par jeu si fourni */}
    {statsByGame && (
      <View style={styles.detailedStats}>
        <Text style={styles.sectionTitle}>Par jeu</Text>
        {Object.entries(statsByGame).map(([jeu, stats]) => (
          <View key={String(jeu)} style={styles.gameBlock}>
            <Text style={styles.gameTitle}>{String(jeu ?? "")}</Text>
            <View style={styles.statsRow}>
              <MiniStat
                label='Parties'
                value={String(stats?.totalGames ?? "")}
              />
              <MiniStat label='Victoires' value={String(stats?.wins ?? "")} />
              <MiniStat label='Nuls' value={String(stats?.draws ?? "")} />
              <MiniStat label='Défaites' value={String(stats?.loses ?? "")} />
              <MiniStat label='Points' value={String(stats?.points ?? "")} />
              <MiniStat
                label='Winrate'
                value={String(stats?.winrate ?? "") + "%"}
              />
            </View>
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

// Carte de statistique principale
const StatCard = ({ icon, value, label, color }) => (
  <View style={[styles.statCard, { borderColor: color }]}>
    {" "}
    {/* Style d'origine : bordure colorée */}
    <View style={[styles.statIcon, { backgroundColor: color + "22" }]}>
      {" "}
      {/* Cercle coloré */}
      <Ionicons name={icon} size={28} color={color} />
    </View>
    <Text style={styles.statValue}>{String(value ?? "")}</Text>
    <Text style={styles.statLabel}>{String(label ?? "")}</Text>
  </View>
);

// Mini carte pour stats par jeu
const MiniStat = ({ label, value }) => (
  <View style={styles.miniStatCard}>
    <Text style={styles.miniStatValue}>{String(value ?? "")}</Text>
    <Text style={styles.miniStatLabel}>{String(label ?? "")}</Text>
  </View>
);

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
  // Style amélioré pour les lignes de stats détaillées
  statRowEnhanced: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderLeftWidth: 5,
    backgroundColor: "#f7faff",
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  statRowIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statRowLabel: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 2,
  },
  statRowValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#667eea",
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
