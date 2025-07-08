import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import Toast from "react-native-toast-message";

const GameLayout = ({
  title,
  stats,
  streak,
  onBack,
  rank,
  totalPlayers,
  bestTime,
  children,
  statsMarginTop = 32,
  currentTurnLabel,
  timerLabel,
  currentSymbol,
}) => {
  // Tableau de stats
  const rendreStatistiques = () => {
    const victoires = stats?.win || 0;
    const defaites = stats?.lose || 0;
    const nuls = stats?.draw || 0;
    const totalParties = stats?.totalGames || 0;
    const tauxVictoire = stats?.winRate || 0;
    return (
      <View style={styles.containerStatistiques}>
        <View style={styles.elementStat}>
          <Text style={styles.valeurStat}>{victoires}</Text>
          <Text style={styles.labelStat}>Victoires</Text>
        </View>
        <View style={styles.elementStat}>
          <Text style={styles.valeurStat}>{defaites}</Text>
          <Text style={styles.labelStat}>Défaites</Text>
        </View>
        <View style={styles.elementStat}>
          <Text style={styles.valeurStat}>{nuls}</Text>
          <Text style={styles.labelStat}>Nuls</Text>
        </View>
        <View style={styles.elementStat}>
          <Text style={styles.valeurStat}>{totalParties}</Text>
          <Text style={styles.labelStat}>Total</Text>
        </View>
        <View style={styles.elementStat}>
          <Text style={styles.valeurStat}>{tauxVictoire.toFixed(1)}%</Text>
          <Text style={styles.labelStat}>Taux Victoire</Text>
        </View>
      </View>
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
      {/* Header */}
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={{ paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
          {onBack && (
            <TouchableOpacity style={{ padding: 8 }} onPress={onBack}>
              <Ionicons name='arrow-back' size={24} color='#fff' />
            </TouchableOpacity>
          )}
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "#fff" }}>
            {title}
          </Text>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#fff" }}>
              {stats?.totalPoints || 0}
            </Text>
            <Text style={{ fontSize: 12, color: "#fff", opacity: 0.8 }}>
              points
            </Text>
          </View>
        </View>
      </LinearGradient>
      {/* Affichage générique du tour et du timer pour tous les jeux, juste sous le header */}
      {(currentTurnLabel || timerLabel) && (
        <View style={styles.infoJeu}>
          <View style={styles.infoJoueur}>
            <Text style={styles.labelJoueur}>{currentTurnLabel}</Text>
            {currentSymbol && (
              <Text style={styles.symboleJoueur}>{currentSymbol}</Text>
            )}
          </View>
          {timerLabel && (
            <View style={styles.containerTimer}>
              <Ionicons name='time' size={20} color='#667eea' />
              <Text style={styles.texteTimer}>{timerLabel}</Text>
            </View>
          )}
        </View>
      )}
      {/* Contenu spécifique au jeu */}
      <View style={{ flex: 1 }}>{children}</View>
      {/* Statistiques sous le jeu */}
      {
        <View
          style={{ ...styles.sectionStatistiques, marginTop: statsMarginTop }}>
          <Text style={styles.titreStatistiques}>Statistiques</Text>
          {rendreStatistiques()}
          <View style={styles.containerStatsDetaillees}>
            <View style={styles.elementStatDetaille}>
              <Text style={styles.labelStatDetaille}>Position</Text>
              <Text style={styles.valeurStatDetaille}>
                {rank !== undefined &&
                totalPlayers !== undefined &&
                rank !== null &&
                totalPlayers !== null
                  ? `${rank}/${totalPlayers}`
                  : "-"}
              </Text>
            </View>
            <View style={styles.elementStatDetaille}>
              <Text style={styles.labelStatDetaille}>Meilleur temps</Text>
              <Text style={styles.valeurStatDetaille}>
                {typeof bestTime === "number" && bestTime > 0
                  ? `${bestTime.toFixed(1)} s`
                  : "-"}
              </Text>
            </View>
            {streak >= 5 && (
              <View style={styles.elementStatDetaille}>
                <Text style={styles.labelStatDetaille}>Multiplicateur</Text>
                <Text style={styles.valeurStatDetaille}>
                  x
                  {(
                    1 + (stats?.currentStreak ? stats.currentStreak / 10 : 0)
                  ).toFixed(2)}
                </Text>
              </View>
            )}
          </View>
        </View>
      }
      {/* Toast global pour tous les jeux */}
      <Toast />
    </View>
  );
};

const styles = {
  sectionStatistiques: {
    marginTop: 32,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  titreStatistiques: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#222",
    textAlign: "left",
  },
  containerStatistiques: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    elevation: 1,
  },
  elementStat: {
    alignItems: "center",
    flex: 1,
  },
  valeurStat: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#667eea",
  },
  labelStat: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  containerStatsDetaillees: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  elementStatDetaille: {
    flex: 1,
    alignItems: "center",
  },
  labelStatDetaille: {
    fontSize: 13,
    color: "#888",
  },
  valeurStatDetaille: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#7c3aed",
    marginTop: 2,
  },
  infoJeu: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop:-10,
    marginBottom: 70,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#ececec",
  },
  infoJoueur: {
    flexDirection: "row",
    alignItems: "center",
  },
  labelJoueur: {
    fontSize: 16,
    color: "#333",
    marginRight: 10,
  },
  symboleJoueur: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#667eea",
  },
  containerTimer: {
    flexDirection: "row",
    alignItems: "center",
  },
  texteTimer: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#667eea",
    marginLeft: 5,
  },
};

export default GameLayout;
