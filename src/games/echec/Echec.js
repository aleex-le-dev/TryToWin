// Composant principal du jeu d'échecs pour TryToWin
// Affiche un plateau d'échecs interactif avec react-native-chessboard
// Sert de base pour l'ajout futur d'une IA, de la gestion des scores et de l'intégration avec le système de points
// Utilisation : importé et utilisé dans gamesData.js pour l'accès au jeu depuis l'application
// Auteur : Assistant IA

import React, { useRef, useState, useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Chessboard, { ChessboardRef } from "react-native-chessboard";
import GameLayout from "../GameLayout";

// Composant principal du jeu d'échecs
// Utilise react-native-chessboard pour l'affichage et la gestion du plateau
// Pour l'instant, mode humain vs humain (pas d'IA)
const { width } = Dimensions.get("window");

const Echec = ({ navigation }) => {
  const chessboardRef = useRef(null);
  const [fen, setFen] = useState();
  const [currentTurn, setCurrentTurn] = useState("Blancs");
  const [moveCount, setMoveCount] = useState(1);
  const [timer, setTimer] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);

  // Timer pour la partie
  useEffect(() => {
    let interval = null;
    if (isGameActive) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGameActive]);

  // Format du timer
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Callback appelé à chaque mouvement
  const handleMove = ({ fen: newFen, ...state }) => {
    setFen(newFen);
    setMoveCount((prev) => prev + 1);
    setCurrentTurn((prev) => (prev === "Blancs" ? "Noirs" : "Blancs"));
    setIsGameActive(true);
    // TODO: Ajouter gestion de la victoire, nulle, etc.
  };

  // Fonction pour recommencer la partie
  const handleReset = () => {
    setFen(undefined);
    setCurrentTurn("Blancs");
    setMoveCount(1);
    setTimer(0);
    setIsGameActive(false);
    if (chessboardRef.current) {
      chessboardRef.current.resetBoard();
    }
  };

  return (
    <GameLayout
      navigation={navigation}
      gameName='Echec'
      title='Échecs'
      onBack={() => navigation.goBack()}
      currentTurnLabel={`Tour ${moveCount}`}
      timerLabel={formatTimer(timer)}
      currentSymbol={currentTurn === "Blancs" ? "♔" : "♚"}
      onPressMainActionButton={handleReset}
      stats={{
        win: 0,
        lose: 0,
        draw: 0,
        totalPoints: 0,
        currentStreak: 0,
      }}
      rank={null}
      countryRank={null}
      countryCode='FR'>
      <View style={styles.container}>
        <Chessboard
          ref={chessboardRef}
          fen={fen}
          boardSize={width - 32}
          gestureEnabled={true}
          withLetters={true}
          withNumbers={true}
          onMove={handleMove}
        />
      </View>
    </GameLayout>
  );
};

export default Echec;

// Styles pour le plateau d'échecs
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
});

// Ce composant affiche un plateau d'échecs interactif avec react-native-chessboard.
// Il gère l'état FEN et pourra être étendu pour supporter l'IA, la sauvegarde des scores, etc.
