// Composant Pendu.js
// Ce composant implémente le jeu du Pendu adapté à React Native et intégré au layout commun des jeux.
// Il gère la logique du jeu, l'affichage, et l'intégration avec le système de points et de classement.
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import GameLayout from "./GameLayout";
import { gamePoints } from "../constants/gamePoints";

const WORDS = [
  "DEVELOPPEUR",
  "REACT",
  "JAVASCRIPT",
  "MOBILE",
  "ORDINATEUR",
  "ALGORITHME",
  "FONCTION",
  "VARIABLE",
  "COMPILATEUR",
  "NAVIGATEUR",
];

function getRandomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

const MAX_ERRORS = 7;

const Pendu = ({ navigation }) => {
  const [mot, setMot] = useState(getRandomWord());
  const [lettres, setLettres] = useState([]);
  const [erreurs, setErreurs] = useState(0);
  const [gagne, setGagne] = useState(false);
  const [perdu, setPerdu] = useState(false);
  const [input, setInput] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval = null;
    if (!gagne && !perdu) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gagne, perdu]);

  useEffect(() => {
    const motAffiche = mot.split("").every((l) => lettres.includes(l));
    if (motAffiche) setGagne(true);
    if (erreurs >= MAX_ERRORS) setPerdu(true);
  }, [lettres, erreurs]);

  useEffect(() => {
    if (gagne || perdu) {
      const points = gagne ? gamePoints.Pendu.win : gamePoints.Pendu.lose;
      const message = gagne ? "Victoire !" : "Défaite !";
      Toast.show({
        type: gagne ? "success" : "error",
        text1: message,
        text2: `${points} points`,
        position: "top",
        visibilityTime: 3000,
      });
    }
  }, [gagne, perdu]);

  const handleLettre = (lettre) => {
    if (gagne || perdu) return;
    lettre = lettre.toUpperCase();
    if (!lettre.match(/^[A-Z]$/) || lettres.includes(lettre)) return;
    if (mot.includes(lettre)) {
      setLettres([...lettres, lettre]);
    } else {
      setLettres([...lettres, lettre]);
      setErreurs(erreurs + 1);
    }
    setInput("");
  };

  const resetGame = () => {
    setMot(getRandomWord());
    setLettres([]);
    setErreurs(0);
    setGagne(false);
    setPerdu(false);
    setInput("");
    setElapsedTime(0);
  };

  const renderPendu = () => {
    const penduSteps = [
      // Base
      <View key='base' style={styles.penduBase} />,
      // Poteau vertical
      <View key='pole' style={styles.penduPole} />,
      // Barre horizontale
      <View key='beam' style={styles.penduBeam} />,
      // Corde
      <View key='rope' style={styles.penduRope} />,
      // Tête
      <View key='head' style={styles.penduHead} />,
      // Corps
      <View key='body' style={styles.penduBody} />,
      // Bras gauche
      <View key='leftArm' style={styles.penduLeftArm} />,
      // Bras droit
      <View key='rightArm' style={styles.penduRightArm} />,
      // Jambe gauche
      <View key='leftLeg' style={styles.penduLeftLeg} />,
      // Jambe droite
      <View key='rightLeg' style={styles.penduRightLeg} />,
    ];

    return (
      <View style={styles.penduContainer}>
        {penduSteps.slice(0, erreurs).map((step, index) => (
          <View key={index}>{step}</View>
        ))}
      </View>
    );
  };

  const renderWord = () => (
    <View style={styles.wordContainer}>
      {mot.split("").map((lettre, idx) => (
        <Text key={idx} style={styles.letter}>
          {lettres.includes(lettre) || gagne || perdu ? lettre : "_"}
        </Text>
      ))}
    </View>
  );

  const renderAlphabet = () => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    return (
      <View style={styles.alphabetContainer}>
        {alphabet.map((lettre) => (
          <TouchableOpacity
            key={lettre}
            style={[
              styles.alphabetButton,
              lettres.includes(lettre) && styles.alphabetButtonUsed,
            ]}
            onPress={() => handleLettre(lettre)}
            disabled={lettres.includes(lettre) || gagne || perdu}>
            <Text style={styles.alphabetText}>{lettre}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <GameLayout
      title='Pendu'
      timerLabel={`${Math.floor(elapsedTime / 60)}:${(elapsedTime % 60)
        .toString()
        .padStart(2, "0")}`}
      currentTurnLabel={
        gagne ? "Gagné !" : perdu ? "Perdu !" : "À vous de jouer"
      }
      currentSymbol={<Ionicons name='help-circle' size={22} color='#1976d2' />}
      onPressMainActionButton={resetGame}>
      <View style={styles.containerJeu}>
        <Text style={styles.erreurs}>
          Erreurs : {erreurs} / {MAX_ERRORS}
        </Text>
        {renderPendu()}
        {renderWord()}
        {renderAlphabet()}
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => handleLettre(input)}
          maxLength={1}
          editable={!gagne && !perdu}
          autoCapitalize='characters'
          placeholder='Lettre'
        />
        {(gagne || perdu) && (
          <Text style={styles.resultat}>
            {gagne
              ? "Bravo, vous avez trouvé le mot !"
              : `Le mot était : ${mot}`}
          </Text>
        )}
      </View>
      <Toast />
    </GameLayout>
  );
};

const styles = StyleSheet.create({
  containerJeu: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  erreurs: {
    fontSize: 18,
    color: "#e74c3c",
    marginBottom: 10,
    fontWeight: "bold",
  },
  penduContainer: {
    width: 140,
    height: 220,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "flex-start",
    position: "relative",
  },
  penduBase: {
    position: "absolute",
    bottom: 0,
    left: 10,
    width: 120,
    height: 8,
    backgroundColor: "#8B4513",
    borderRadius: 4,
  },
  penduPole: {
    position: "absolute",
    bottom: 8,
    left: 30,
    width: 8,
    height: 160,
    backgroundColor: "#8B4513",
    borderRadius: 4,
  },
  penduBeam: {
    position: "absolute",
    top: 0,
    left: 30,
    width: 70,
    height: 8,
    backgroundColor: "#8B4513",
    borderRadius: 4,
  },
  penduRope: {
    position: "absolute",
    top: 8,
    left: 92,
    width: 2,
    height: 32,
    backgroundColor: "#8B4513",
    borderRadius: 1,
  },
  penduHead: {
    position: "absolute",
    top: 40,
    left: 77,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFB6C1",
    borderWidth: 3,
    borderColor: "#8B4513",
  },
  penduBody: {
    position: "absolute",
    top: 72,
    left: 91,
    width: 4,
    height: 48,
    backgroundColor: "#8B4513",
    borderRadius: 2,
  },
  penduLeftArm: {
    position: "absolute",
    top: 80,
    left: 91,
    width: 28,
    height: 4,
    backgroundColor: "#8B4513",
    borderRadius: 2,
    transform: [{ rotate: "-30deg" }],
  },
  penduRightArm: {
    position: "absolute",
    top: 80,
    left: 67,
    width: 28,
    height: 4,
    backgroundColor: "#8B4513",
    borderRadius: 2,
    transform: [{ rotate: "30deg" }],
  },
  penduLeftLeg: {
    position: "absolute",
    top: 120,
    left: 91,
    width: 24,
    height: 4,
    backgroundColor: "#8B4513",
    borderRadius: 2,
    transform: [{ rotate: "30deg" }],
  },
  penduRightLeg: {
    position: "absolute",
    top: 120,
    left: 71,
    width: 24,
    height: 4,
    backgroundColor: "#8B4513",
    borderRadius: 2,
    transform: [{ rotate: "-30deg" }],
  },
  wordContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  letter: {
    fontSize: 28,
    marginHorizontal: 4,
    borderBottomWidth: 2,
    borderColor: "#1976d2",
    minWidth: 24,
    textAlign: "center",
    fontWeight: "bold",
    color: "#222",
  },
  alphabetContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 10,
  },
  alphabetButton: {
    backgroundColor: "#f1f3f4",
    borderRadius: 6,
    padding: 8,
    margin: 2,
    minWidth: 32,
    alignItems: "center",
  },
  alphabetButtonUsed: {
    backgroundColor: "#e0e0e0",
  },
  alphabetText: {
    fontSize: 16,
    color: "#1976d2",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#1976d2",
    borderRadius: 6,
    padding: 8,
    marginTop: 10,
    width: 60,
    textAlign: "center",
    fontSize: 18,
    backgroundColor: "#fff",
  },
  resultat: {
    fontSize: 20,
    color: "#1976d2",
    marginTop: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default Pendu;
