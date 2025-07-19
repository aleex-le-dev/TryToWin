import React, { useRef, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import Toast from "react-native-toast-message";
import FirstTurnOverlay from "../components/FirstTurnOverlay";

// Fonction utilitaire pour convertir un code pays en emoji drapeau
function countryCodeToFlag(code) {
  if (!code) return "🇫🇷";
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt()));
}

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
  renderMainActionButton, // Ajout d'une prop pour le bouton principal
  onPressMainActionButton, // Ajout de la prop pour le clic
  countryRank,
  countryTotal,
  countryCode,
  showFirstTurnOverlay = false, // Nouvelle prop pour contrôler l'overlay
  firstTurnPlayerName = "Vous", // Nom du joueur qui commence
  firstTurnPlayerSymbol = "X", // Symbole du joueur qui commence
  onFirstTurnOverlayComplete, // Callback quand l'overlay se termine
  headerColor = "#667eea", // Couleur du header (défaut: violet)
}) => {
  // Tableau de stats
  const rendreStatistiques = () => {
    const victoires = stats?.win || 0;
    const defaites = stats?.lose || 0;
    const nuls = stats?.draw || 0;
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
        <View style={[styles.elementStat, styles.elementStatLast]}>
          <Text style={styles.valeurStat}>{nuls}</Text>
          <Text style={styles.labelStat}>Nuls</Text>
        </View>
      </View>
    );
  };

  const rotation = useRef(new Animated.Value(0)).current;

  const handleResetPress = () => {
    console.log("Bouton reset cliqué");
    Animated.sequence([
      Animated.timing(rotation, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(rotation, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onPressMainActionButton) onPressMainActionButton();
    });
  };
  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
      {/* Overlay du premier tour */}
      <FirstTurnOverlay
        isVisible={showFirstTurnOverlay}
        playerName={firstTurnPlayerName}
        playerSymbol={firstTurnPlayerSymbol}
        onAnimationComplete={onFirstTurnOverlayComplete}
      />

      {/* Header */}
      <LinearGradient
        colors={[headerColor, headerColor]}
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
      {/* NOUVEAU BLOC INFO SIMPLE ET FONCTIONNEL */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#fff",
          borderRadius: 10,
          marginHorizontal: 20,
          marginTop: -10,
          marginBottom: 32,
          paddingVertical: 8,
          paddingHorizontal: 14,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 2,
          minHeight: 44,
        }}>
        {/* Tour du joueur à gauche */}
        <View
          style={{ flexDirection: "row", alignItems: "center", minWidth: 80 }}>
          <Text style={{ fontSize: 15, color: "#222", fontWeight: "500" }}>
            {currentTurnLabel}
          </Text>
          {currentSymbol && (
            <Text style={{ fontSize: 20, marginLeft: 6 }}>{currentSymbol}</Text>
          )}
        </View>
        {/* Timer centré */}
        <View
          style={{
            flex: 1,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
          }}>
          {timerLabel && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name='time'
                size={18}
                color='#667eea'
                style={{ marginRight: 3 }}
              />
              <Text
                style={{ fontSize: 16, color: "#667eea", fontWeight: "bold" }}>
                {timerLabel}
              </Text>
            </View>
          )}
        </View>
        {/* Bouton reset à droite */}
        <TouchableOpacity
          style={{ padding: 6, alignItems: "center", justifyContent: "center" }}
          onPress={handleResetPress}
          activeOpacity={0.7}>
          <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
            <Ionicons name='refresh' size={24} color='#1976d2' />
          </Animated.View>
        </TouchableOpacity>
      </View>
      {/* Contenu spécifique au jeu */}
      <View style={{ flex: 1 }}>{children}</View>
      {/* Statistiques sous le jeu */}
      {
        <View
          style={{ ...styles.sectionStatistiques, marginTop: statsMarginTop }}>
          {rendreStatistiques()}
          <View style={styles.containerStatistiques}>
            <View style={styles.elementStat}>
              <Text style={styles.valeurStat}>
                {typeof rank === "number" && rank !== null ? `#${rank}` : "-"}
              </Text>
              <Text style={styles.labelStat}>
                <Text style={{ fontSize: 16 }}>🌍</Text> Monde
              </Text>
            </View>
            <View style={[styles.elementStat, styles.elementStatLast]}>
              <Text style={styles.valeurStat}>
                {typeof countryRank === "number" && countryRank !== null
                  ? `#${countryRank}`
                  : "-"}
              </Text>
              <Text style={styles.labelStat}>
                <Text style={{ fontSize: 16 }}>
                  {countryCodeToFlag(countryCode)}
                </Text>{" "}
                Pays
              </Text>
            </View>
          </View>
          {streak >= 5 && (
            <View style={styles.containerStatsDetaillees}>
              <View style={styles.elementStatDetaille}>
                <Text style={styles.labelStatDetaille}>Multiplicateur</Text>
                <Text style={styles.valeurStatDetaille}>
                  x
                  {(
                    1 + (stats?.currentStreak ? stats.currentStreak / 10 : 0)
                  ).toFixed(2)}
                </Text>
              </View>
            </View>
          )}
        </View>
      }
    </View>
  );
};

const styles = {
  sectionStatistiques: {
    marginTop: 32,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    alignItems: "center",
  },
  titreStatistiques: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#222",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  containerStatistiques: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: -15,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    width: "100%",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  elementStat: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderRightWidth: 1,
    borderRightColor: "#ececec",
  },
  valeurStat: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#667eea",
    marginBottom: 2,
    textAlign: "center",
  },
  labelStat: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    paddingBottom: 10,
  },
  // Dernière colonne sans bordure droite
  elementStatLast: {
    borderRightWidth: 0,
  },
  containerStatsDetaillees: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 14,
    width: "100%",
    gap: 8,
  },
  elementStatDetaille: {
    flex: 1,
    alignItems: "center",
    gap: 2,
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
    marginTop: -10,
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
    paddingRight: 0,
    overflow: "visible",
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
  boutonActionDiscret: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e7ef",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#cfd8dc",
  },
  texteBoutonDiscret: {
    color: "#667eea",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 15,
  },
};

export default GameLayout;
