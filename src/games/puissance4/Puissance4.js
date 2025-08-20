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
import GameResultOverlay from "../../components/GameResultOverlay";
import { getIaMove } from "./ia";

const { width } = Dimensions.get("window");

const Puissance4 = ({ navigation }) => {
  const { user } = useAuth();
  const [plateau, setPlateau] = useState(Array(42).fill(null)); // 6x7 = 42 cases
  const [partieTerminee, setPartieTerminee] = useState(false);
  const [gagnant, setGagnant] = useState(null);
  const [score, setScore] = useState(0);
  const [enPartie, setEnPartie] = useState(false);
  const [tourIA, setTourIA] = useState(false);
  const [iaCommence, setIaCommence] = useState(false);
  const [showFirstTurnOverlay, setShowFirstTurnOverlay] = useState(false);
  const [showResultOverlay, setShowResultOverlay] = useState(false);
  const [resultData, setResultData] = useState({
    result: null,
    points: 0,
    multiplier: 0,
    streak: 0,
  });
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
          const stats = await getUserGameScore(user.id, "Puissance4");
          setStatsJeu(stats);
          setScore(stats.totalPoints || 0);
          const { rank, total } = await getUserRankInLeaderboard(
            user.id,
            "Puissance4"
          );
          setRank(rank);
          setTotalPlayers(total);
          // Pays
          const country = user.country || user.profile?.country || "FR";
          const { rank: cRank, total: cTotal } =
            await getUserRankInCountryLeaderboard(
              user.id,
              "Puissance4",
              country
            );
          setCountryRank(cRank);
          setCountryTotal(cTotal);
        } catch (error) {
          console.log(
            "🎮 PUISSANCE4: Erreur lors du chargement des stats:",
            error
          );
        }
      }
    };
    chargerStats();
  }, [user?.id]);

  useEffect(() => {
    nouvellePartie();
    // Afficher l'overlay au démarrage initial
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
      faireJouerIA(plateau);
    }
  }, [tourIA, enPartie, partieTerminee, plateau]);

  const verifierGagnant = (cases) => {
    // Vérifier les lignes horizontales
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col <= 3; col++) {
        const index = row * 7 + col;
        if (
          cases[index] &&
          cases[index] === cases[index + 1] &&
          cases[index] === cases[index + 2] &&
          cases[index] === cases[index + 3]
        ) {
          return cases[index];
        }
      }
    }

    // Vérifier les lignes verticales
    for (let row = 0; row <= 2; row++) {
      for (let col = 0; col < 7; col++) {
        const index = row * 7 + col;
        if (
          cases[index] &&
          cases[index] === cases[index + 7] &&
          cases[index] === cases[index + 14] &&
          cases[index] === cases[index + 21]
        ) {
          return cases[index];
        }
      }
    }

    // Vérifier les diagonales montantes
    for (let row = 3; row < 6; row++) {
      for (let col = 0; col <= 3; col++) {
        const index = row * 7 + col;
        if (
          cases[index] &&
          cases[index] === cases[index - 6] &&
          cases[index] === cases[index - 12] &&
          cases[index] === cases[index - 18]
        ) {
          return cases[index];
        }
      }
    }

    // Vérifier les diagonales descendantes
    for (let row = 0; row <= 2; row++) {
      for (let col = 0; col <= 3; col++) {
        const index = row * 7 + col;
        if (
          cases[index] &&
          cases[index] === cases[index + 8] &&
          cases[index] === cases[index + 16] &&
          cases[index] === cases[index + 24]
        ) {
          return cases[index];
        }
      }
    }

    return null;
  };

  const verifierMatchNul = (cases) => {
    // Vérifier si la première ligne est pleine
    for (let col = 0; col < 7; col++) {
      if (cases[col] === null) {
        return false;
      }
    }
    return true;
  };

  const obtenirColonneLibre = (colonne) => {
    // Trouver la première case libre dans la colonne (en partant du bas)
    for (let row = 5; row >= 0; row--) {
      const index = row * 7 + colonne;
      if (plateau[index] === null) {
        return index;
      }
    }
    return null; // Colonne pleine
  };

  const gererClicCase = (colonne) => {
    console.log("👤 JOUEUR: Clic sur la colonne", colonne);
    console.log("👤 JOUEUR: État actuel du plateau:", plateau);

    if (partieTerminee || tourIA) {
      console.log("👤 JOUEUR: Coup invalide - partie terminée ou tour de l'IA");
      return;
    }

    const index = obtenirColonneLibre(colonne);
    if (index === null) {
      console.log("👤 JOUEUR: Colonne pleine");
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
      gererFinPartie(gagnant, 0); // Passer 0 pour tempsEcoule
      return;
    }

    // Vérifier match nul
    if (verifierMatchNul(nouveauPlateau)) {
      console.log("👤 JOUEUR: Match nul après coup du joueur");
      setPartieTerminee(true);
      setEnPartie(false);
      gererFinPartie("nul", 0); // Passer 0 pour tempsEcoule
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
          const indexIA = ligne * 7 + colonne;
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
            ligne <= 5 &&
            colonne >= 0 &&
            colonne <= 6 &&
            indexIA >= 0 &&
            indexIA < 42 &&
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
              gererFinPartie(gagnantIA, 0); // Passer 0 pour tempsEcoule
              return;
            }

            // Vérifier match nul après coup de l'IA
            if (verifierMatchNul(plateauAvecIA)) {
              console.log("🎯 IA: Match nul après coup de l'IA");
              setPartieTerminee(true);
              setEnPartie(false);
              gererFinPartie("nul", 0); // Passer 0 pour tempsEcoule
              return;
            }

            console.log("🎯 IA: Partie continue, tour du joueur");
            setTourIA(false); // Indiquer que c'est le tour du joueur
          } else {
            console.log(
              "🎯 IA: Coup invalide, utilisation d'un coup par défaut"
            );
            // Coup par défaut si l'IA retourne des coordonnées invalides
            const colonnesDisponibles = [];
            for (let col = 0; col < 7; col++) {
              if (obtenirColonneLibre(col) !== null) {
                colonnesDisponibles.push(col);
              }
            }
            if (colonnesDisponibles.length > 0) {
              const colonneAleatoire =
                colonnesDisponibles[
                  Math.floor(Math.random() * colonnesDisponibles.length)
                ];
              const indexIA = obtenirColonneLibre(colonneAleatoire);
              const plateauAvecIA = plateauActuel.slice();
              plateauAvecIA[indexIA] = "O";
              setPlateau(plateauAvecIA);
              setTourIA(false);
            }
          }
        } else {
          console.log("🎯 IA: Format de coordonnées invalide, coup par défaut");
          // Coup par défaut
          const colonnesDisponibles = [];
          for (let col = 0; col < 7; col++) {
            if (obtenirColonneLibre(col) !== null) {
              colonnesDisponibles.push(col);
            }
          }
          if (colonnesDisponibles.length > 0) {
            const colonneAleatoire =
              colonnesDisponibles[
                Math.floor(Math.random() * colonnesDisponibles.length)
              ];
            const indexIA = obtenirColonneLibre(colonneAleatoire);
            const plateauAvecIA = plateauActuel.slice();
            plateauAvecIA[indexIA] = "O";
            setPlateau(plateauAvecIA);
            setTourIA(false);
          }
        }
      } else {
        console.log("🎯 IA: Réponse invalide, coup par défaut");
        // Coup par défaut
        const colonnesDisponibles = [];
        for (let col = 0; col < 7; col++) {
          if (obtenirColonneLibre(col) !== null) {
            colonnesDisponibles.push(col);
          }
        }
        if (colonnesDisponibles.length > 0) {
          const colonneAleatoire =
            colonnesDisponibles[
              Math.floor(Math.random() * colonnesDisponibles.length)
            ];
          const indexIA = obtenirColonneLibre(colonneAleatoire);
          const plateauAvecIA = plateauActuel.slice();
          plateauAvecIA[indexIA] = "O";
          setPlateau(plateauAvecIA);
          setTourIA(false);
        }
      }
    } catch (error) {
      console.log("🎯 IA: Erreur lors du calcul du coup:", error);
      // Coup par défaut en cas d'erreur
      const colonnesDisponibles = [];
      for (let col = 0; col < 7; col++) {
        if (obtenirColonneLibre(col) !== null) {
          colonnesDisponibles.push(col);
        }
      }
      if (colonnesDisponibles.length > 0) {
        const colonneAleatoire =
          colonnesDisponibles[
            Math.floor(Math.random() * colonnesDisponibles.length)
          ];
        const indexIA = obtenirColonneLibre(colonneAleatoire);
        const plateauAvecIA = plateauActuel.slice();
        plateauAvecIA[indexIA] = "O";
        setPlateau(plateauAvecIA);
        setTourIA(false);
      }
    }
  };

  const gererFinPartie = async (resultat, temps) => {
    console.log(
      "🎮 PUISSANCE4: Fin de partie - resultat:",
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
    console.log("🎮 PUISSANCE4: Résultat BDD:", resultatBDD);

    if (user?.id) {
      try {
        console.log("🎮 PUISSANCE4: Sauvegarde du résultat...", { userId: user.id, game: "Puissance4", resultatBDD });
        await recordGameResult(user.id, "Puissance4", resultatBDD, 0);
        console.log("🎮 PUISSANCE4: Résultat sauvegardé, rafraîchissement stats/classements");
        await actualiserStatsClassements();
        const points = GAME_POINTS["Puissance4"][resultatBDD];
        const mult = getSerieMultiplier(statsJeu.currentStreak);
        const pointsAvecMultiplicateur =
          mult > 0 ? Math.round(points * (1 + mult)) : points;
        console.log(
          "🎮 PUISSANCE4: Points calculés:",
          points,
          "multiplicateur:",
          mult,
          "total:",
          pointsAvecMultiplicateur
        );

        setResultData({
          result: resultatBDD,
          points: pointsAvecMultiplicateur,
          multiplier: mult,
          streak: statsJeu.currentStreak,
        });
        setShowResultOverlay(true);
      } catch (error) {
        console.log("🎮 PUISSANCE4: Erreur lors de la sauvegarde:", error?.message || error);
      }
    } else {
      console.log(
        "🎮 PUISSANCE4: Aucun utilisateur connecté, pas de sauvegarde"
      );
    }
  };

  const actualiserStatsClassements = async () => {
    if (user?.id) {
      try {
        const stats = await getUserGameScore(user.id, "Puissance4");
        setStatsJeu(stats);
        setScore(stats.totalPoints || 0);
        const { rank, total } = await getUserRankInLeaderboard(
          user.id,
          "Puissance4"
        );
        setRank(rank);
        setTotalPlayers(total);
        const country = user.country || user.profile?.country || "FR";
        const { rank: cRank, total: cTotal } =
          await getUserRankInCountryLeaderboard(user.id, "Puissance4", country);
        setCountryRank(cRank);
        setCountryTotal(cTotal);
      } catch (error) {
        console.log("Erreur lors de l'actualisation des stats:", error);
      }
    }
  };

  const recommencerPartie = () => {
    setPlateau(Array(42).fill(null));
    setPartieTerminee(false);
    setGagnant(null);
    setEnPartie(true);

    // Alterner qui commence
    const nouvelleValeur = !iaCommence;
    setIaCommence(nouvelleValeur);
    if (nouvelleValeur) {
      setTourIA(true); // L'IA commence
    } else {
      setTourIA(false); // Le joueur commence
    }
  };

  const nouvellePartie = () => {
    setPlateau(Array(42).fill(null));
    setPartieTerminee(false);
    setGagnant(null);
    setEnPartie(true);

    // Alterner qui commence
    const nouvelleValeur = !iaCommence;
    setIaCommence(nouvelleValeur);
    if (nouvelleValeur) {
      setTourIA(true); // L'IA commence
    } else {
      setTourIA(false); // Le joueur commence
    }
  };

  const handleResultOverlayComplete = () => {
    setShowResultOverlay(false);
    // Redémarrage automatique après l'overlay
    setTimeout(() => {
      nouvellePartie();
      setShowFirstTurnOverlay(true);
    }, 500);
  };

  const handleFirstTurnOverlayComplete = (quiCommence = iaCommence) => {
    setShowFirstTurnOverlay(false);
    // Plus besoin de toast car l'overlay affiche déjà le bon message
  };

  const rendreCase = (index) => {
    const valeur = plateau[index];
    let estCaseGagnante = false;
    let couleurGagnante = null;
    if (gagnant) {
      // Vérifier toutes les lignes gagnantes possibles
      const lignesGagnantes = [];

      // Lignes horizontales
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col <= 3; col++) {
          const startIndex = row * 7 + col;
          lignesGagnantes.push([
            startIndex,
            startIndex + 1,
            startIndex + 2,
            startIndex + 3,
          ]);
        }
      }

      // Lignes verticales
      for (let row = 0; row <= 2; row++) {
        for (let col = 0; col < 7; col++) {
          const startIndex = row * 7 + col;
          lignesGagnantes.push([
            startIndex,
            startIndex + 7,
            startIndex + 14,
            startIndex + 21,
          ]);
        }
      }

      // Diagonales montantes
      for (let row = 3; row < 6; row++) {
        for (let col = 0; col <= 3; col++) {
          const startIndex = row * 7 + col;
          lignesGagnantes.push([
            startIndex,
            startIndex - 6,
            startIndex - 12,
            startIndex - 18,
          ]);
        }
      }

      // Diagonales descendantes
      for (let row = 0; row <= 2; row++) {
        for (let col = 0; col <= 3; col++) {
          const startIndex = row * 7 + col;
          lignesGagnantes.push([
            startIndex,
            startIndex + 8,
            startIndex + 16,
            startIndex + 24,
          ]);
        }
      }

      for (let i = 0; i < lignesGagnantes.length; i++) {
        const [a, b, c, d] = lignesGagnantes[i];
        if (
          plateau[a] &&
          plateau[a] === plateau[b] &&
          plateau[a] === plateau[c] &&
          plateau[a] === plateau[d] &&
          (index === a || index === b || index === c || index === d)
        ) {
          estCaseGagnante = true;
          couleurGagnante =
            plateau[a] === "O" ? styles.caseGagnanteO : styles.caseGagnanteX;
          break;
        }
      }
    }
    const col = index % 7;
    return (
      <TouchableOpacity
        key={index}
        style={[styles.case, estCaseGagnante && couleurGagnante]}
        onPress={() => gererClicCase(col)}
        disabled={
          partieTerminee || tourIA || obtenirColonneLibre(col) === null
        }>
        {/* Jeton jaune pour le joueur (X), rouge pour l'IA (O) */}
        {valeur === "X" && <View style={styles.yellowToken} />}
        {valeur === "O" && <View style={styles.redToken} />}
        {/* ... existing code ... */}
      </TouchableOpacity>
    );
  };

  const rendrePlateau = () => {
    return (
      <View style={styles.containerPlateau}>
        <View style={styles.plateau}>
          {Array.from({ length: 6 }, (_, row) => (
            <View key={row} style={styles.lignePlateau}>
              {Array.from({ length: 7 }, (_, col) => {
                const index = row * 7 + col;
                return rendreCase(index);
              })}
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <>
      <GameLayout
        title='Puissance 4'
        stats={statsJeu}
        streak={statsJeu.currentStreak}
        onBack={() => navigation.goBack()}
        currentTurnLabel={tourIA ? "Tour de l'IA" : "Votre tour"}
        currentSymbol={
          tourIA ? (
            <View
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: "#E53935",
                borderWidth: 2,
                borderColor: "#B71C1C",
              }}
            />
          ) : (
            <View
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: "#FFD600",
                borderWidth: 2,
                borderColor: "#B8860B",
              }}
            />
          )
        }
        onPressMainActionButton={nouvellePartie}
        rank={rank}
        totalPlayers={totalPlayers}
        countryRank={countryRank}
        countryTotal={countryTotal}
        countryCode={user?.country || user?.profile?.country || "FR"}
        showFirstTurnOverlay={showFirstTurnOverlay}
        firstTurnPlayerName={iaCommence ? "L'IA" : "Vous"}
        firstTurnPlayerSymbol={
          iaCommence ? (
            <View
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: "#E53935",
                borderWidth: 2,
                borderColor: "#B71C1C",
              }}
            />
          ) : (
            <View
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: "#FFD600",
                borderWidth: 2,
                borderColor: "#B8860B",
              }}
            />
          )
        }
        onFirstTurnOverlayComplete={() =>
          handleFirstTurnOverlayComplete(iaCommence)
        }
        headerColor="#FF6B6B">
        <View style={styles.containerJeu}>{rendrePlateau()}</View>
      </GameLayout>
      <GameResultOverlay
        isVisible={showResultOverlay}
        result={resultData.result}
        points={resultData.points}
        multiplier={resultData.multiplier}
        streak={resultData.streak}
        onAnimationComplete={handleResultOverlayComplete}
      />
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
  containerPlateau: {
    alignItems: "center",
  },
  plateau: {
    width: width - 80,
    height: (width - 80) * (6 / 7),
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
    aspectRatio: 1,
  },
  texteCase: {
    fontSize: 24,
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
  controlesColonnes: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-around",
    width: width - 80,
  },
  boutonColonne: {
    width: 40,
    height: 40,
    backgroundColor: "#f8f9fa",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  colonnePleine: {
    backgroundColor: "#e9ecef",
    opacity: 0.5,
  },
  yellowToken: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFD600",
    borderWidth: 2,
    borderColor: "#B8860B",
  },
  redToken: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E53935",
    borderWidth: 2,
    borderColor: "#B71C1C",
  },
});

export default Puissance4;
