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
import { getIaMove } from "./ia";

const { width } = Dimensions.get("window");

const Morpion = ({ navigation }) => {
  const { user } = useAuth();
  const [plateau, setPlateau] = useState(Array(9).fill(null));
  const [partieTerminee, setPartieTerminee] = useState(false);
  const [gagnant, setGagnant] = useState(null);
  const [score, setScore] = useState(0);
  const [tempsEcoule, setTempsEcoule] = useState(0);
  const [enPartie, setEnPartie] = useState(false);
  const [tourIA, setTourIA] = useState(false);
  const [iaCommence, setIaCommence] = useState(false);
  const [showFirstTurnOverlay, setShowFirstTurnOverlay] = useState(false);
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
          console.log(
            "🎮 MORPION: Erreur lors du chargement des stats:",
            error
          );
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
    return () => {
      clearInterval(interval);
    };
  }, [enPartie, partieTerminee]);

  useEffect(() => {
    nouvellePartie();
    // Afficher l'overlay du premier tour au démarrage
    setShowFirstTurnOverlay(true);
  }, []);

  // Faire jouer l'IA si c'est son tour de commencer
  useEffect(() => {
    if (
      tourIA &&
      enPartie &&
      !partieTerminee &&
      plateau.every((cell) => cell === null)
    ) {
      console.log("🎯 IA: C'est le tour de l'IA de commencer");
      setTimeout(() => {
        faireJouerIA(plateau);
      }, 500);
    }
  }, [tourIA, enPartie, partieTerminee, plateau]);

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
    console.log("👤 JOUEUR: Clic sur l'index", index);
    console.log("👤 JOUEUR: État actuel du plateau:", plateau);

    if (plateau[index] || partieTerminee || tourIA) {
      console.log(
        "👤 JOUEUR: Coup invalide - case occupée, partie terminée ou tour de l'IA"
      );
      return;
    }

    const nouveauPlateau = plateau.slice();
    nouveauPlateau[index] = "X"; // Le joueur joue toujours X
    setPlateau(nouveauPlateau);
    console.log("👤 JOUEUR: X placé à l'index", index);
    console.log("👤 JOUEUR: Nouveau plateau:", nouveauPlateau);

    // Vérifier si le joueur a gagné
    const gagnant = verifierGagnant(nouveauPlateau);
    if (gagnant) {
      console.log("👤 JOUEUR: Victoire du joueur !");
      setGagnant(gagnant);
      setPartieTerminee(true);
      setEnPartie(false);
      gererFinPartie(gagnant, tempsEcoule);
      return;
    }

    // Vérifier match nul
    if (verifierMatchNul(nouveauPlateau)) {
      console.log("👤 JOUEUR: Match nul après coup du joueur");
      setPartieTerminee(true);
      setEnPartie(false);
      gererFinPartie("nul", tempsEcoule);
      return;
    }

    console.log("👤 JOUEUR: Partie continue, appel de l'IA...");
    setTourIA(true); // Indiquer que c'est le tour de l'IA

    // Faire jouer l'IA avec setTimeout pour éviter les problèmes d'async
    setTimeout(() => {
      faireJouerIA(nouveauPlateau);
    }, 100);
  };

  const faireJouerIA = async (plateauActuel) => {
    console.log("🎯 IA: Début du tour de l'IA");
    console.log("🎯 IA: État du plateau:", plateauActuel);

    try {
      console.log("🎯 IA: Appel de getIaMove...");
      const coupIA = await getIaMove(plateauActuel);
      console.log("🎯 IA: Réponse reçue:", coupIA);
      console.log("🎯 IA: Type de réponse:", typeof coupIA);

      if (coupIA && typeof coupIA === "string") {
        console.log("🎯 IA: Parsing des coordonnées...");

        // Nettoyer la réponse et extraire les coordonnées
        const reponseNettoyee = coupIA.trim().replace(/[^\d,]/g, "");
        console.log("🎯 IA: Réponse nettoyée:", reponseNettoyee);

        const coordonnees = reponseNettoyee.split(",");
        if (coordonnees.length === 2) {
          const ligne = parseInt(coordonnees[0]);
          const colonne = parseInt(coordonnees[1]);
          const indexIA = ligne * 3 + colonne;
          console.log(
            "🎯 IA: Coordonnées parsées - ligne:",
            ligne,
            "colonne:",
            colonne,
            "index:",
            indexIA
          );

          if (
            ligne >= 0 &&
            ligne <= 2 &&
            colonne >= 0 &&
            colonne <= 2 &&
            indexIA >= 0 &&
            indexIA < 9 &&
            plateauActuel[indexIA] === null
          ) {
            console.log("🎯 IA: Placement du coup O à l'index", indexIA);
            const plateauAvecIA = plateauActuel.slice();
            plateauAvecIA[indexIA] = "O";
            setPlateau(plateauAvecIA);
            console.log("🎯 IA: Plateau mis à jour:", plateauAvecIA);

            // Vérifier si l'IA a gagné
            const gagnantIA = verifierGagnant(plateauAvecIA);
            if (gagnantIA) {
              console.log("🎯 IA: L'IA a gagné !");
              setGagnant(gagnantIA);
              setPartieTerminee(true);
              setEnPartie(false);
              gererFinPartie(gagnantIA, tempsEcoule);
              return;
            }

            // Vérifier match nul après coup de l'IA
            if (verifierMatchNul(plateauAvecIA)) {
              console.log("🎯 IA: Match nul après coup de l'IA");
              setPartieTerminee(true);
              setEnPartie(false);
              gererFinPartie("nul", tempsEcoule);
              return;
            }

            console.log("🎯 IA: Tour terminé, retour au joueur");
            setTourIA(false); // Retour au tour du joueur
          } else {
            console.log(
              "🎯 IA: Coordonnées invalides - ligne:",
              ligne,
              "colonne:",
              colonne,
              "index:",
              indexIA,
              "case libre:",
              plateauActuel[indexIA] === null
            );
            setTourIA(false); // Retour au tour du joueur en cas d'erreur
          }
        } else {
          console.log(
            "🎯 IA: Format de coordonnées invalide:",
            reponseNettoyee
          );
          setTourIA(false); // Retour au tour du joueur en cas d'erreur
        }
      } else {
        console.log("🎯 IA: Réponse invalide de l'IA:", coupIA);
        setTourIA(false); // Retour au tour du joueur en cas d'erreur
      }
    } catch (error) {
      console.log("🎯 IA: Erreur lors du coup de l'IA:", error);
      setTourIA(false); // Retour au tour du joueur en cas d'erreur
    }
  };

  const gererFinPartie = async (resultat, temps) => {
    console.log(
      "🎮 MORPION: Fin de partie - resultat:",
      resultat,
      "temps:",
      temps
    );
    let resultatBDD = "lose";
    if (resultat === "X") {
      resultatBDD = "win";
    } else if (resultat === "O") {
      resultatBDD = "lose";
    } else {
      resultatBDD = "draw";
    }
    console.log("🎮 MORPION: Résultat BDD:", resultatBDD);

    if (user?.id) {
      try {
        console.log("🎮 MORPION: Sauvegarde du résultat...");
        await recordGameResult(user.id, "Morpion", resultatBDD, 0, temps);
        await actualiserStatsClassements();
        const points = GAME_POINTS["Morpion"][resultatBDD];
        const mult = getSerieMultiplier(statsJeu.currentStreak);
        const pointsAvecMultiplicateur =
          mult > 0 ? Math.round(points * (1 + mult)) : points;
        console.log(
          "🎮 MORPION: Points calculés:",
          points,
          "multiplicateur:",
          mult,
          "total:",
          pointsAvecMultiplicateur
        );

        // Configuration simple du toast
        if (resultatBDD === "win") {
          Toast.show({
            type: "success",
            text1:
              mult > 0
                ? `🔥 Victoire ! Série de ${statsJeu.currentStreak}`
                : "Victoire !",
            text2:
              mult > 0
                ? `+${pointsAvecMultiplicateur} points (x${(1 + mult).toFixed(
                    2
                  )})`
                : `+${points} points`,
            position: "top",
            visibilityTime: 4000,
          });
        } else if (resultatBDD === "lose") {
          Toast.show({
            type: "error",
            text1: "Défaite",
            text2: `+${points} points`,
            position: "top",
            visibilityTime: 4000,
          });
        } else {
          Toast.show({
            type: "info",
            text1: "Match nul",
            text2: `+${points} points`,
            position: "top",
            visibilityTime: 4000,
          });
        }
        // Redémarrage automatique après 3 secondes
        setTimeout(() => {
          nouvellePartie();
        }, 3000);
      } catch (error) {
        console.log("🎮 MORPION: Erreur lors de la sauvegarde:", error);
      }
    } else {
      console.log("🎮 MORPION: Aucun utilisateur connecté, pas de sauvegarde");
    }
  };

  const actualiserStatsClassements = async () => {
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
        const country = user.country || user.profile?.country || "FR";
        const { rank: cRank, total: cTotal } =
          await getUserRankInCountryLeaderboard(user.id, "Morpion", country);
        setCountryRank(cRank);
        setCountryTotal(cTotal);
      } catch (error) {
        console.log("Erreur lors de l'actualisation des stats:", error);
      }
    }
  };

  const recommencerPartie = () => {
    setPlateau(Array(9).fill(null));
    setPartieTerminee(false);
    setGagnant(null);
    setTempsEcoule(0);
    setEnPartie(true);

    // Le joueur commence toujours
    setTourIA(false);
    setIaCommence(false);
  };

  const nouvellePartie = () => {
    recommencerPartie();
  };

  const handleFirstTurnOverlayComplete = () => {
    setShowFirstTurnOverlay(false);
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
    <>
      <GameLayout
        title='Morpion'
        stats={statsJeu}
        streak={statsJeu.currentStreak}
        onBack={() => navigation.goBack()}
        currentTurnLabel={tourIA ? "Tour de l'IA" : "Votre tour"}
        currentSymbol={tourIA ? "O" : "X"}
        timerLabel={`${Math.floor(tempsEcoule / 60)}:${(tempsEcoule % 60)
          .toString()
          .padStart(2, "0")}`}
        onPressMainActionButton={nouvellePartie}
        rank={rank}
        totalPlayers={totalPlayers}
        countryRank={countryRank}
        countryTotal={countryTotal}
        countryCode={user?.country || user?.profile?.country || "FR"}
        showFirstTurnOverlay={showFirstTurnOverlay}
        firstTurnPlayerName='Vous'
        firstTurnPlayerSymbol='X'
        onFirstTurnOverlayComplete={handleFirstTurnOverlayComplete}>
        <View style={styles.containerJeu}>{rendrePlateau()}</View>
      </GameLayout>
      <Toast />
    </>
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
