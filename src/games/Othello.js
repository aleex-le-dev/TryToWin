/**
 * Composant du jeu Othello.
 * Enregistre et affiche uniquement les points du barème (pas de score brut).
 * Utilisé dans la navigation et la BDD sous l'identifiant "Othello".
 */
import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text,
} from "react-native";
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

const initialBoard = () => {
  const board = Array(BOARD_SIZE)
    .fill()
    .map(() => Array(BOARD_SIZE).fill(null));
  board[3][3] = 2;
  board[3][4] = 1;
  board[4][3] = 1;
  board[4][4] = 2;
  return board;
};

function getOpponent(player) {
  return player === 1 ? 2 : 1;
}

function isValidMove(board, row, col, player) {
  if (board[row][col] !== null) return false;
  const directions = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  for (const [dx, dy] of directions) {
    let x = row + dx,
      y = col + dy,
      foundOpponent = false;
    while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
      if (board[x][y] === getOpponent(player)) {
        foundOpponent = true;
      } else if (board[x][y] === player && foundOpponent) {
        return true;
      } else {
        break;
      }
      x += dx;
      y += dy;
    }
  }
  return false;
}

function getValidMoves(board, player) {
  const moves = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (isValidMove(board, i, j, player)) moves.push([i, j]);
    }
  }
  return moves;
}

function applyMove(board, row, col, player) {
  const newBoard = board.map((r) => [...r]);
  newBoard[row][col] = player;
  const directions = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  for (const [dx, dy] of directions) {
    let x = row + dx,
      y = col + dy,
      toFlip = [];
    while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
      if (newBoard[x][y] === getOpponent(player)) {
        toFlip.push([x, y]);
      } else if (newBoard[x][y] === player) {
        for (const [fx, fy] of toFlip) newBoard[fx][fy] = player;
        break;
      } else {
        break;
      }
      x += dx;
      y += dy;
    }
  }
  return newBoard;
}

function countTokens(board) {
  let black = 0,
    white = 0;
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (board[i][j] === 1) black++;
      if (board[i][j] === 2) white++;
    }
  }
  return { black, white };
}

const Othello = ({ navigation }) => {
  const { user } = useAuth();
  const [board, setBoard] = useState(initialBoard());
  const [currentPlayer, setCurrentPlayer] = useState(1); // 1 = noir, 2 = blanc
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [validMoves, setValidMoves] = useState(
    getValidMoves(initialBoard(), 1)
  );
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

  useEffect(() => {
    setValidMoves(getValidMoves(board, currentPlayer));
    const moves = getValidMoves(board, currentPlayer);
    if (moves.length === 0) {
      const oppMoves = getValidMoves(board, getOpponent(currentPlayer));
      if (oppMoves.length === 0) {
        setGameOver(true);
        const { black, white } = countTokens(board);
        const winnerValue = black > white ? 1 : white > black ? 2 : 0;
        setWinner(winnerValue);
        // Toast points
        if (user?.id) {
          let resultatBDD = "draw";
          if (winnerValue === 1) resultatBDD = "win";
          else if (winnerValue === 2) resultatBDD = "lose";
          const points = GAME_POINTS["Othello"][resultatBDD];
          Toast.show({
            type:
              resultatBDD === "win"
                ? "success"
                : resultatBDD === "lose"
                ? "error"
                : "info",
            text1:
              resultatBDD === "win"
                ? "Victoire !"
                : resultatBDD === "lose"
                ? "Défaite"
                : "Égalité",
            text2: `+${points} points`,
            position: "top",
            topOffset: 40,
            visibilityTime: 3000,
          });
        }
      } else {
        setCurrentPlayer(getOpponent(currentPlayer));
      }
    }
  }, [board, currentPlayer]);

  const handleCellPress = (row, col) => {
    if (gameOver || !isValidMove(board, row, col, currentPlayer)) return;
    const newBoard = applyMove(board, row, col, currentPlayer);
    setBoard(newBoard);
    setCurrentPlayer(getOpponent(currentPlayer));
  };

  const renderBoard = () => {
    return (
      <View style={styles.board}>
        {board.map((rowArr, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {rowArr.map((cell, colIndex) => {
              const isValid = validMoves.some(
                ([r, c]) => r === rowIndex && c === colIndex
              );
              return (
                <TouchableOpacity
                  key={`${rowIndex}-${colIndex}`}
                  style={styles.cell}
                  onPress={() => handleCellPress(rowIndex, colIndex)}
                  disabled={gameOver || !isValid}
                  activeOpacity={0.7}>
                  {cell && (
                    <View
                      style={[
                        styles.token,
                        cell === 1 ? styles.blackToken : styles.whiteToken,
                      ]}
                    />
                  )}
                  {/* Indicateur de coup possible */}
                  {!cell && isValid && !gameOver && (
                    <View
                      style={{
                        width: CELL_SIZE / 3,
                        height: CELL_SIZE / 3,
                        borderRadius: CELL_SIZE / 6,
                        backgroundColor: "#222",
                        alignSelf: "center",
                      }}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  const resetGame = () => {
    setBoard(initialBoard());
    setCurrentPlayer(1);
    setGameOver(false);
    setWinner(null);
    setElapsedTime(0);
    setValidMoves(getValidMoves(initialBoard(), 1));
  };

  // Calcul du score
  const { black, white } = countTokens(board);

  // Message de fin de partie
  let endMessage = null;
  if (gameOver) {
    if (winner === 1) endMessage = `Victoire Noir (${black} - ${white})`;
    else if (winner === 2) endMessage = `Victoire Blanc (${white} - ${black})`;
    else endMessage = `Égalité (${black} - ${white})`;
  }

  return (
    <GameLayout
      title='Othello'
      stats={stats}
      streak={stats.currentStreak}
      onBack={() => navigation.goBack()}
      currentTurnLabel={
        gameOver
          ? winner === 0
            ? "Égalité"
            : "Partie terminée"
          : `Tour du joueur`
      }
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
      <View style={styles.containerJeu}>
        {renderBoard()}
        {gameOver && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.25)",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10,
            }}>
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.8)",
                borderRadius: 18,
                paddingVertical: 24,
                paddingHorizontal: 36,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 8,
                elevation: 4,
              }}>
              <Text
                style={{
                  color: "#222",
                  fontSize: 36,
                  fontWeight: "bold",
                  marginBottom: 18,
                  textAlign: "center",
                  textShadowColor: "rgba(0,0,0,0.08)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}>
                {winner === 1
                  ? "Victoire des Noirs"
                  : winner === 2
                  ? "Victoire des Blancs"
                  : "Égalité"}
              </Text>
              <Text
                style={{
                  color: "#1976d2",
                  fontSize: 48,
                  fontWeight: "bold",
                  textAlign: "center",
                  letterSpacing: 4,
                  textShadowColor: "rgba(0,0,0,0.08)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}>
                {black} - {white}
              </Text>
            </View>
          </View>
        )}
      </View>
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
