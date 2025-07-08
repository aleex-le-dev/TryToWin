import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import {
  recordGameResult,
  getUserGameScore,
  getUserRankInLeaderboard,
} from "../services/scoreService";
import { useAuth } from "../hooks/useAuth";
import { GAME_POINTS, getSerieMultiplier } from "../constants/gamePoints";
import GameLayout from "./GameLayout";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

// Composant principal du jeu Morpion
const Morpion = ({ navigation, route }) => {
  const { user } = useAuth();
  const [plateau, setPlateau] = useState(Array(9).fill(null));
  const [tourJoueur, setTourJoueur] = useState(true);
  const [partieTerminee, setPartieTerminee] = useState(false);
  const [gagnant, setGagnant] = useState(null);
  const [score, setScore] = useState(0);
  const [tempsEcoule, setTempsEcoule] = useState(0);
  const [enPartie, setEnPartie] = useState(false);
  const [chargement, setChargement] = useState(false);
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

  // Charger les statistiques depuis la base de données
  useEffect(() => {
    const chargerStats = async () => {
      if (user?.id) {
        try {
          const stats = await getUserGameScore(user.id, "Morpion");
          setStatsJeu(stats);
          setScore(stats.totalPoints || 0);
          // Récupérer le rang
          const { rank, total } = await getUserRankInLeaderboard(
            user.id,
            "Morpion"
          );
          setRank(rank);
          setTotalPlayers(total);
        } catch (error) {
          console.log("Erreur lors du chargement des stats:", error);
        }
      }
    };
    chargerStats();
  }, [user?.id]);

  // Timer pour le jeu
  useEffect(() => {
    let interval = null;
    if (enPartie && !partieTerminee) {
      interval = setInterval(() => {
        setTempsEcoule((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [enPartie, partieTerminee]);

  // Démarrer automatiquement une partie à l'arrivée sur l'écran
  useEffect(() => {
    nouvellePartie();
  }, []);

  // Vérifier s'il y a un gagnant
  const verifierGagnant = (cases) => {
    const lignesGagnantes = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // horizontales
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // verticales
      [0, 4, 8],
      [2, 4, 6], // diagonales
    ];

    for (let i = 0; i < lignesGagnantes.length; i++) {
      const [a, b, c] = lignesGagnantes[i];
      if (cases[a] && cases[a] === cases[b] && cases[a] === cases[c]) {
        return cases[a];
      }
    }
    return null;
  };

  // Vérifier si le jeu est nul
  const verifierMatchNul = (cases) => {
    return cases.every((case_) => case_ !== null);
  };

  // Gérer un clic sur une case
  const gererClicCase = (index) => {
    if (plateau[index] || partieTerminee) return;

    const nouveauPlateau = plateau.slice();
    nouveauPlateau[index] = tourJoueur ? "X" : "O";
    setPlateau(nouveauPlateau);
    setTourJoueur(!tourJoueur);

    // Vérifier le gagnant
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

  // Gérer la fin du jeu
  const gererFinPartie = async (resultat, temps) => {
    let resultatBDD = "lose";

    if (resultat === "X") {
      resultatBDD = "win";
    } else if (resultat === "O") {
      resultatBDD = "lose";
    } else {
      resultatBDD = "draw";
    }

    // Sauvegarder le résultat en base de données
    if (user?.id) {
      try {
        await recordGameResult(user.id, "Morpion", resultatBDD, 0, temps);

        // Recharger les statistiques mises à jour
        const nouvellesStats = await getUserGameScore(user.id, "Morpion");
        setStatsJeu(nouvellesStats);
        setScore(nouvellesStats.totalPoints || 0);

        // Afficher le toast avec les points gagnés et la série si applicable
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
      } catch (error) {
        console.log("Erreur lors de la sauvegarde:", error);
      }
    }
  };

  // Recommencer une partie
  const recommencerPartie = () => {
    setPlateau(Array(9).fill(null));
    setTourJoueur(true);
    setPartieTerminee(false);
    setGagnant(null);
    setTempsEcoule(0);
    setEnPartie(true);
  };

  // Nouvelle partie
  const nouvellePartie = () => {
    setChargement(true);
    setTimeout(() => {
      recommencerPartie();
      setChargement(false);
    }, 500);
  };

  // Rendre une case du plateau
  const rendreCase = (index) => {
    const valeur = plateau[index];
    const estCaseGagnante = gagnant && verifierGagnant(plateau) === valeur;

    return (
      <TouchableOpacity
        key={index}
        style={[styles.case, estCaseGagnante && styles.caseGagnante]}
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

  // Rendre le plateau complet
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

  // Rendre les statistiques
  const rendreStatistiques = () => {
    const victoires = statsJeu.win;
    const defaites = statsJeu.lose;
    const nuls = statsJeu.draw;
    const totalParties = statsJeu.totalGames;
    const tauxVictoire = statsJeu.winRate;

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

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        if (user?.id) {
          // resetUserStreak(user.id, "Morpion");
        }
      };
    }, [user?.id])
  );

  return (
    <GameLayout
      title='Morpion'
      stats={statsJeu}
      streak={statsJeu.currentStreak}
      onBack={() => navigation.goBack()}
      statsMarginTop={-50}>
      {/* Informations du jeu */}
      <View style={styles.infoJeu}>
        <View style={styles.infoJoueur}>
          <Text style={styles.labelJoueur}>
            {tourJoueur ? "Votre tour" : "Tour de l'IA"}
          </Text>
          <Text style={styles.symboleJoueur}>{tourJoueur ? "X" : "O"}</Text>
        </View>

        <View style={styles.containerTimer}>
          <Ionicons name='time' size={20} color='#667eea' />
          <Text style={styles.texteTimer}>
            {Math.floor(tempsEcoule / 60)}:
            {(tempsEcoule % 60).toString().padStart(2, "0")}
          </Text>
        </View>
      </View>

      {/* Plateau de jeu */}
      <View style={styles.containerJeu}>{rendrePlateau()}</View>

      {/* Boutons d'action */}
      <View style={styles.containerActions}>
        {!partieTerminee && (
          <TouchableOpacity
            style={styles.boutonAction}
            onPress={nouvellePartie}>
            <Ionicons name='refresh' size={20} color='#fff' />
            <Text style={styles.texteBoutonAction}>Nouvelle partie</Text>
          </TouchableOpacity>
        )}
        {partieTerminee && (
          <TouchableOpacity
            style={[styles.boutonAction, styles.boutonPrincipal]}
            onPress={recommencerPartie}>
            <Ionicons name='play' size={20} color='#fff' />
            <Text style={styles.texteBoutonAction}>Rejouer</Text>
          </TouchableOpacity>
        )}
      </View>
      <Toast />
    </GameLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  containerChargement: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  texteChargement: {
    marginTop: 10,
    fontSize: 16,
    color: "#667eea",
  },
  enTete: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  contenuEnTete: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  boutonRetour: {
    padding: 8,
  },
  titreJeu: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  containerScore: {
    alignItems: "center",
  },
  texteScore: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  labelScore: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.8,
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
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  texteGagnant: {
    color: "#fff",
  },
  containerActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  boutonAction: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6c757d",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  boutonPrincipal: {
    backgroundColor: "#667eea",
  },
  texteBoutonAction: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
  sectionStatistiques: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  titreStatistiques: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  containerStatistiques: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  elementStat: {
    alignItems: "center",
  },
  valeurStat: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#667eea",
  },
  labelStat: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  containerStatsDetaillees: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  elementStatDetaille: {
    alignItems: "center",
  },
  labelStatDetaille: {
    fontSize: 11,
    color: "#666",
    marginBottom: 4,
    textAlign: "center",
  },
  valeurStatDetaille: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#764ba2",
  },
});

export default Morpion;
