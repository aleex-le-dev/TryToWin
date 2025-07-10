import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import {
  recordGameResult,
  getUserGameScore,
  getUserRankInLeaderboard,
  getUserRankInCountryLeaderboard,
} from "../../services/scoreService";
import { useAuth } from "../../hooks/useAuth";
import { GAME_POINTS, getSerieMultiplier } from "../../constants/gamePoints";
import GameLayout from "../GameLayout";

const { width } = Dimensions.get("window");

const Morpion = ({ navigation }) => {
  const { user } = useAuth();
  const [plateau, setPlateau] = useState(Array(9).fill(null));
  const [tourJoueur, setTourJoueur] = useState(true);
  const [partieTerminee, setPartieTerminee] = useState(false);
  const [gagnant, setGagnant] = useState(null);
  const [score, setScore] = useState(0);
  const [tempsEcoule, setTempsEcoule] = useState(0);
  const [enPartie, setEnPartie] = useState(false);
  const [statsJeu, setStatsJeu] = useState({
    win: 0,
    draw: 0,
    lose: 0,
    totalPoints: 0,
    totalGames: 0,
    winRate: 0,
  });
  const [rank, setRank] = useState(null);
  const [totalPlayers, setTotalPlayers] = useState(null);
  const [countryRank, setCountryRank] = useState(null);
  const [countryTotal, setCountryTotal] = useState(null);

  useEffect(() => {
    const chargerStats = async () => {
      if (user?.id) {
        try {
          const stats = await getUserGameScore(user.id, "Morpion");
          setStatsJeu(stats);
          setScore(stats.totalPoints || 0);
          const { rank, total } = await getUserRankInLeaderboard(
            user.id,
            "Morpion"
          );
          setRank(rank);
          setTotalPlayers(total);
          // Pays
          const country = user.country || user.profile?.country || "FR";
          const { rank: cRank, total: cTotal } =
            await getUserRankInCountryLeaderboard(user.id, "Morpion", country);
          setCountryRank(cRank);
          setCountryTotal(cTotal);
        } catch (error) {
          console.log("Erreur lors du chargement des stats:", error);
        }
      }
    };
    chargerStats();
  }, [user?.id]);

  useEffect(() => {
    let interval = null;
    if (enPartie && !partieTerminee) {
      interval = setInterval(() => {
        setTempsEcoule((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [enPartie, partieTerminee]);

  useEffect(() => {
    nouvellePartie();
  }, []);

  const verifierGagnant = (cases) => {
    const lignesGagnantes = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lignesGagnantes.length; i++) {
      const [a, b, c] = lignesGagnantes[i];
      if (cases[a] && cases[a] === cases[b] && cases[a] === cases[c]) {
        return cases[a];
      }
    }
    return null;
  };

  const verifierMatchNul = (cases) => {
    return cases.every((case_) => case_ !== null);
  };

  const gererClicCase = (index) => {
    if (plateau[index] || partieTerminee) return;
    const nouveauPlateau = plateau.slice();
    nouveauPlateau[index] = tourJoueur ? "X" : "O";
    setPlateau(nouveauPlateau);
    setTourJoueur(!tourJoueur);
    const gagnant = verifierGagnant(nouveauPlateau);
    if (gagnant) {
      setGagnant(gagnant);
      setPartieTerminee(true);
      setEnPartie(false);
      gererFinPartie(gagnant, tempsEcoule);
    } else if (verifierMatchNul(nouveauPlateau)) {
      setPartieTerminee(true);
      setEnPartie(false);
      gererFinPartie("nul", tempsEcoule);
    }
  };

  const gererFinPartie = async (resultat, temps) => {
    let resultatBDD = "lose";
    if (resultat === "X") {
      resultatBDD = "win";
    } else if (resultat === "O") {
      resultatBDD = "lose";
    } else {
      resultatBDD = "draw";
    }
    if (user?.id) {
      try {
        await recordGameResult(user.id, "Morpion", resultatBDD, 0, temps);
        const nouvellesStats = await getUserGameScore(user.id, "Morpion");
        setStatsJeu(nouvellesStats);
        setScore(nouvellesStats.totalPoints || 0);
        const points = GAME_POINTS["Morpion"][resultatBDD];
        const mult = getSerieMultiplier(nouvellesStats.currentStreak);
        const pointsAvecMultiplicateur =
          mult > 0 ? Math.round(points * (1 + mult)) : points;
        let toastConfig = {
          position: "top",
          topOffset: 40,
          visibilityTime: 3000,
        };
        if (resultatBDD === "win") {
          toastConfig.type = "success";
          toastConfig.text1 = "Victoire !";
          if (mult > 0) {
            toastConfig.text1 = `🔥 Victoire ! Série de ${nouvellesStats.currentStreak}`;
            toastConfig.text2 = `+${pointsAvecMultiplicateur} points (x${(
              1 + mult
            ).toFixed(2)})`;
          } else {
            toastConfig.text2 = `+${points} points`;
          }
        } else if (resultatBDD === "lose") {
          toastConfig.type = "error";
          toastConfig.text1 = "Défaite";
          toastConfig.text2 = `+${points} points`;
        } else {
          toastConfig.type = "info";
          toastConfig.text1 = "Match nul";
          toastConfig.text2 = `+${points} points`;
        }
        Toast.show(toastConfig);

        // Relancer automatiquement une nouvelle partie après 3 secondes
        setTimeout(() => {
          recommencerPartie();
        }, 3000);
      } catch (error) {
        console.log("Erreur lors de la sauvegarde:", error);
      }
    }
  };

  const recommencerPartie = () => {
    setPlateau(Array(9).fill(null));
    setTourJoueur(true);
    setPartieTerminee(false);
    setGagnant(null);
    setTempsEcoule(0);
    setEnPartie(true);
  };

  const nouvellePartie = () => {
    recommencerPartie();
  };

  const rendreCase = (index) => {
    const valeur = plateau[index];
    let estCaseGagnante = false;
    let couleurGagnante = null;
    if (gagnant) {
      const lignesGagnantes = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
      ];
      for (let i = 0; i < lignesGagnantes.length; i++) {
        const [a, b, c] = lignesGagnantes[i];
        if (
          plateau[a] &&
          plateau[a] === plateau[b] &&
          plateau[a] === plateau[c] &&
          (index === a || index === b || index === c)
        ) {
          estCaseGagnante = true;
          couleurGagnante =
            plateau[a] === "O" ? styles.caseGagnanteO : styles.caseGagnanteX;
          break;
        }
      }
    }
    return (
      <TouchableOpacity
        key={index}
        style={[styles.case, estCaseGagnante && couleurGagnante]}
        onPress={() => gererClicCase(index)}
        disabled={partieTerminee}>
        <Text
          style={[
            styles.texteCase,
            valeur === "X" && styles.texteX,
            valeur === "O" && styles.texteO,
            estCaseGagnante && styles.texteGagnant,
          ]}>
          {valeur}
        </Text>
      </TouchableOpacity>
    );
  };

  const rendrePlateau = () => {
    return (
      <View style={styles.plateau}>
        <View style={styles.lignePlateau}>
          {rendreCase(0)}
          {rendreCase(1)}
          {rendreCase(2)}
        </View>
        <View style={styles.lignePlateau}>
          {rendreCase(3)}
          {rendreCase(4)}
          {rendreCase(5)}
        </View>
        <View style={styles.lignePlateau}>
          {rendreCase(6)}
          {rendreCase(7)}
          {rendreCase(8)}
        </View>
      </View>
    );
  };

  return (
    <GameLayout
      title='Morpion'
      stats={statsJeu}
      streak={statsJeu.currentStreak}
      onBack={() => navigation.goBack()}
      currentTurnLabel={
        partieTerminee
          ? gagnant === "X"
            ? "Vous avez gagné !"
            : gagnant === "O"
            ? "L'IA a gagné"
            : "Match nul"
          : tourJoueur
          ? "Votre tour"
          : "Tour de l'IA"
      }
      currentSymbol={
        partieTerminee
          ? gagnant === "X"
            ? "X"
            : gagnant === "O"
            ? "O"
            : "-"
          : tourJoueur
          ? "X"
          : "O"
      }
      timerLabel={`${Math.floor(tempsEcoule / 60)}:${(tempsEcoule % 60)
        .toString()
        .padStart(2, "0")}`}
      onPressMainActionButton={nouvellePartie}
      rank={rank}
      totalPlayers={totalPlayers}
      countryRank={countryRank}
      countryTotal={countryTotal}
      countryCode={user?.country || user?.profile?.country || "FR"}>
      <View style={styles.containerJeu}>{rendrePlateau()}</View>
      <Toast />
    </GameLayout>
  );
};

const styles = StyleSheet.create({
  containerJeu: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  plateau: {
    width: width - 80,
    height: width - 80,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    padding: 10,
  },
  lignePlateau: {
    flex: 1,
    flexDirection: "row",
  },
  case: {
    flex: 1,
    margin: 2,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  texteCase: {
    fontSize: 36,
    fontWeight: "bold",
  },
  texteX: {
    color: "#667eea",
  },
  texteO: {
    color: "#e74c3c",
  },
  caseGagnante: {
    backgroundColor: "#667eea",
  },
  caseGagnanteX: {
    backgroundColor: "#667eea",
  },
  caseGagnanteO: {
    backgroundColor: "#e74c3c",
  },
  texteGagnant: {
    color: "#fff",
  },
});

export default Morpion;
