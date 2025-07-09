import React, { useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
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
  renderMainActionButton, // Ajout d'une prop pour le bouton principal
  onPressMainActionButton, // Ajout de la prop pour le clic
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
      {/* Bloc tour/timer */}
      <View
        style={styles.infoJeu}
        onStartShouldSetResponder={() => {
          console.log("Barre info cliquée");
          return false;
        }}>
        <View
          style={styles.infoJoueur}
          onStartShouldSetResponder={() => {
            console.log("Zone joueur cliquée");
            return false;
          }}>
          <Text style={styles.labelJoueur}>{currentTurnLabel}</Text>
          {currentSymbol && (
            <Text style={styles.symboleJoueur}>{currentSymbol}</Text>
          )}
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
            justifyContent: "space-between",
            position: "relative",
          }}>
          <View style={{ flex: 1 }} />
          {timerLabel && (
            <View style={styles.containerTimer}>
              <Ionicons name='time' size={20} color='#667eea' />
              <Text style={styles.texteTimer}>{timerLabel}</Text>
            </View>
          )}
          <View style={{ width: 60 }} />
          <View
            style={{
              width: 1,
              backgroundColor: "#e9ecef",
              alignSelf: "stretch",
            }}
          />
          <View style={{ flex: 1 }} />
          <View
            style={{
              alignItems: "flex-end",
              flex: 1,
              height: "100%",
              justifyContent: "center",
            }}>
            {renderMainActionButton ? (
              renderMainActionButton(onPressMainActionButton)
            ) : (
              <TouchableOpacity
                style={{
                  padding: 8,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => {
                  console.log("TouchableOpacity reset cliquée");
                  handleResetPress();
                }}
                activeOpacity={0.7}>
                <Animated.View
                  style={{ transform: [{ rotate: rotateInterpolate }] }}>
                  <Ionicons name='refresh' size={32} color='#1976d2' />
                </Animated.View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      {/* Contenu spécifique au jeu */}
      <View style={{ flex: 1 }}>{children}</View>
      {/* Statistiques sous le jeu */}
      {
        <View
          style={{ ...styles.sectionStatistiques, marginTop: statsMarginTop }}>
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
