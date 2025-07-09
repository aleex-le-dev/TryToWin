/**
 * Composant du jeu Othello.
 * Enregistre et affiche uniquement les points du barème (pas de score brut).
 * Utilisé dans la navigation et la BDD sous l'identifiant "Othello".
 */
import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
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

const { width } = Dimensions.get("window");
const BOARD_SIZE = 8;
const CELL_SIZE = (width - 40) / BOARD_SIZE;

const Othello = ({ navigation }) => {
  const { user } = useAuth();
  const [board, setBoard] = useState(
    Array(BOARD_SIZE)
      .fill()
      .map(() => Array(BOARD_SIZE).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState(1); // 1 = noir, 2 = blanc
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [stats, setStats] = useState({
    win: 0,
    draw: 0,
    lose: 0,
    totalPoints: 0,
    totalGames: 0,
    winRate: 0,
  });
  const [rank, setRank] = useState(null);
  const [totalPlayers, setTotalPlayers] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval = null;
    if (!gameOver) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameOver]);

  useEffect(() => {
    const chargerStats = async () => {
      if (user?.id) {
        const s = await getUserGameScore(user.id, "Othello");
        setStats(s);
        const { rank, total } = await getUserRankInLeaderboard(
          user.id,
          "Othello"
        );
        setRank(rank);
        setTotalPlayers(total);
      }
    };
    chargerStats();
  }, [user?.id]);

  // Plateau fictif (aucune logique de jeu réelle ici)
  const renderBoard = () => {
    return (
      <View style={styles.board}>
        {board.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, colIndex) => (
              <View key={`${rowIndex}-${colIndex}`} style={styles.cell}>
                {/* Pion fictif */}
                {cell && (
                  <View
                    style={[
                      styles.token,
                      cell === 1 ? styles.blackToken : styles.whiteToken,
                    ]}
                  />
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  const resetGame = () => {
    console.log("resetGame appelée dans Othello - Reset du jeu");
    setBoard(
      Array(BOARD_SIZE)
        .fill()
        .map(() => Array(BOARD_SIZE).fill(null))
    );
    setCurrentPlayer(1);
    setGameOver(true);
    setWinner(null);
    setElapsedTime(0);
    // Forcer le redémarrage du timer
    setTimeout(() => {
      setGameOver(false);
    }, 100);
  };

  return (
    <GameLayout
      title='Othello'
      stats={stats}
      streak={stats.currentStreak}
      onBack={() => navigation.goBack()}
      currentTurnLabel={gameOver ? "Partie terminée" : `Tour du joueur`}
      currentSymbol={
        gameOver
          ? winner === 1
            ? "⚫"
            : winner === 2
            ? "⚪"
            : "-"
          : currentPlayer === 1
          ? "⚫"
          : "⚪"
      }
      timerLabel={`${Math.floor(elapsedTime / 60)}:${(elapsedTime % 60)
        .toString()
        .padStart(2, "0")}`}
      onPressMainActionButton={resetGame}>
      <View style={styles.containerJeu}>{renderBoard()}</View>
      <Toast />
    </GameLayout>
  );
};

const styles = StyleSheet.create({
  containerJeu: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  board: {
    backgroundColor: "#388e3c",
    borderRadius: 12,
    padding: 8,
    marginTop: 20,
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: "#4caf50",
    borderWidth: 1,
    borderColor: "#2e7d32",
    justifyContent: "center",
    alignItems: "center",
  },
  token: {
    width: CELL_SIZE - 10,
    height: CELL_SIZE - 10,
    borderRadius: (CELL_SIZE - 10) / 2,
  },
  blackToken: {
    backgroundColor: "#222",
  },
  whiteToken: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#222",
  },
});

export default Othello;
