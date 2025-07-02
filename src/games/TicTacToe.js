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

const { width } = Dimensions.get("window");

// Composant principal du jeu Morpion
const Morpion = ({ navigation, route }) => {
  const [plateau, setPlateau] = useState(Array(9).fill(null));
  const [tourJoueur, setTourJoueur] = useState(true);
  const [partieTerminee, setPartieTerminee] = useState(false);
  const [gagnant, setGagnant] = useState(null);
  const [score, setScore] = useState(0);
  const [tempsEcoule, setTempsEcoule] = useState(0);
  const [enPartie, setEnPartie] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [historiqueParties, setHistoriqueParties] = useState([]);

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
  const gererFinPartie = (resultat, temps) => {
    let nouveauScore = 0;

    if (resultat === "X") {
      nouveauScore = Math.max(1000 - temps * 10, 100); // Score basé sur le temps
      Toast.show({
        type: "success",
        text1: "Victoire !",
        text2: `Score: ${nouveauScore} points`,
        position: "top",
        topOffset: 40,
        visibilityTime: 2000,
      });
    } else if (resultat === "O") {
      Toast.show({
        type: "error",
        text1: "Défaite",
        text2: "L'IA a gagné cette partie",
        position: "top",
        topOffset: 40,
        visibilityTime: 2000,
      });
    } else {
      nouveauScore = 50; // Score pour match nul
      Toast.show({
        type: "info",
        text1: "Match nul",
        text2: "Aucun gagnant cette fois",
        position: "top",
        topOffset: 40,
        visibilityTime: 2000,
      });
    }

    setScore((prev) => prev + nouveauScore);

    // Sauvegarder la partie
    const resultatPartie = {
      id: Date.now(),
      resultat,
      score: nouveauScore,
      temps,
      date: new Date().toISOString(),
    };
    setHistoriqueParties((prev) => [resultatPartie, ...prev]);
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
    const victoires = historiqueParties.filter(
      (partie) => partie.resultat === "X"
    ).length;
    const defaites = historiqueParties.filter(
      (partie) => partie.resultat === "O"
    ).length;
    const nuls = historiqueParties.filter(
      (partie) => partie.resultat === "nul"
    ).length;
    const totalParties = historiqueParties.length;

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
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {chargement && (
        <View style={styles.containerChargement}>
          <ActivityIndicator size='large' color='#667eea' />
          <Text style={styles.texteChargement}>Nouvelle partie...</Text>
        </View>
      )}

      {!chargement && (
        <>
          {/* En-tête */}
          <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.enTete}>
            <View style={styles.contenuEnTete}>
              <TouchableOpacity
                style={styles.boutonRetour}
                onPress={() => navigation.goBack()}>
                <Ionicons name='arrow-back' size={24} color='#fff' />
              </TouchableOpacity>
              <Text style={styles.titreJeu}>Morpion</Text>
              <View style={styles.containerScore}>
                <Text style={styles.texteScore}>{score}</Text>
                <Text style={styles.labelScore}>points</Text>
              </View>
            </View>
          </LinearGradient>

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
            <TouchableOpacity
              style={styles.boutonAction}
              onPress={nouvellePartie}>
              <Ionicons name='refresh' size={20} color='#fff' />
              <Text style={styles.texteBoutonAction}>Nouvelle partie</Text>
            </TouchableOpacity>

            {partieTerminee && (
              <TouchableOpacity
                style={[styles.boutonAction, styles.boutonPrincipal]}
                onPress={recommencerPartie}>
                <Ionicons name='play' size={20} color='#fff' />
                <Text style={styles.texteBoutonAction}>Rejouer</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Statistiques */}
          {historiqueParties.length > 0 && (
            <View style={styles.sectionStatistiques}>
              <Text style={styles.titreStatistiques}>Statistiques</Text>
              {rendreStatistiques()}
            </View>
          )}
        </>
      )}

      <Toast />
    </View>
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
});

export default Morpion;
