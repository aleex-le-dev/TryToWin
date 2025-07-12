import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import {
  recordGameResult,
  getUserGameScore,
  getUserRankInLeaderboard,
} from "../../services/scoreService";
import { useAuth } from "../../hooks/useAuth";
import {
  GAME_POINTS,
  getSerieMultiplier,
} from "../../components/GamePointsConfig";
import GameLayout from "./../GameLayout";

const { width } = Dimensions.get("window");
const BOARD_WIDTH = width - 24;
const CELL_SIZE = BOARD_WIDTH / 7;
const BOARD_HEIGHT = CELL_SIZE * 6;

const Puissance4 = ({ navigation }) => {
  const { user } = useAuth();
  const [board, setBoard] = useState(
    Array(6)
      .fill()
      .map(() => Array(7).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState(1); // 1 = rouge, 2 = jaune
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [showFirstTurnOverlay, setShowFirstTurnOverlay] = useState(false);
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
        const s = await getUserGameScore(user.id, "Puissance4");
        setStats(s);
        const { rank, total } = await getUserRankInLeaderboard(
          user.id,
          "Puissance4"
        );
        setRank(rank);
        setTotalPlayers(total);
      }
    };
    chargerStats();
    // Afficher l'overlay du premier tour au démarrage
    setShowFirstTurnOverlay(true);
  }, [user?.id]);

  const isColumnFull = (col) => {
    return board[0][col] !== null;
  };

  const getLowestEmptyCell = (col) => {
    for (let row = 5; row >= 0; row--) {
      if (board[row][col] === null) {
        return row;
      }
    }
    return -1;
  };

  const dropToken = (col) => {
    if (gameOver || isColumnFull(col)) return;
    const row = getLowestEmptyCell(col);
    if (row === -1) return;
    const newBoard = board.map((row) => [...row]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);
    if (checkWin(newBoard, row, col, currentPlayer)) {
      setWinner(currentPlayer);
      setGameOver(true);
      handleGameEnd(currentPlayer === 1 ? "win" : "lose");
      return;
    }
    if (isBoardFull(newBoard)) {
      setWinner(0);
      setGameOver(true);
      handleGameEnd("draw");
      return;
    }
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
  };

  const isBoardFull = (boardState) => {
    return boardState[0].every((cell) => cell !== null);
  };

  const checkWin = (boardState, row, col, player) => {
    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];
    for (const [dx, dy] of directions) {
      let count = 1;
      for (let i = 1; i < 4; i++) {
        const newRow = row + i * dx;
        const newCol = col + i * dy;
        if (
          newRow >= 0 &&
          newRow < 6 &&
          newCol >= 0 &&
          newCol < 7 &&
          boardState[newRow][newCol] === player
        ) {
          count++;
        } else {
          break;
        }
      }
      for (let i = 1; i < 4; i++) {
        const newRow = row - i * dx;
        const newCol = col - i * dy;
        if (
          newRow >= 0 &&
          newRow < 6 &&
          newCol >= 0 &&
          newCol < 7 &&
          boardState[newRow][newCol] === player
        ) {
          count++;
        } else {
          break;
        }
      }
      if (count >= 4) return true;
    }
    return false;
  };

  const handleGameEnd = async (result) => {
    if (user?.id) {
      await recordGameResult(user.id, "Puissance4", result, 0, 0);
      await actualiserStatsClassements();
      const points = GAME_POINTS["Puissance4"][result];
      const mult = getSerieMultiplier(stats.currentStreak);
      const pointsAvecMultiplicateur =
        mult > 0 ? Math.round(points * (1 + mult)) : points;
      let toastConfig = {
        type:
          result === "win" ? "success" : result === "draw" ? "info" : "error",
        position: "top",
        topOffset: 40,
        visibilityTime: 3000,
      };
      if (result === "win" && mult > 0) {
        toastConfig.text1 = `🔥 Victoire ! Série de ${stats.currentStreak}`;
        toastConfig.text2 = `+${pointsAvecMultiplicateur} points (x${(
          1 + mult
        ).toFixed(2)})`;
      } else if (result === "win") {
        toastConfig.text1 = "Victoire enregistrée !";
        toastConfig.text2 = `+${points} points`;
      } else if (result === "draw") {
        toastConfig.text1 = "Match nul !";
        toastConfig.text2 = `+${points} points`;
      } else {
        toastConfig.text1 = "Défaite enregistrée";
        toastConfig.text2 = `+${points} points`;
      }
      Toast.show(toastConfig);
      setTimeout(async () => {
        await actualiserStatsClassements();
        resetGame();
      }, 3000);
    }
  };

  const actualiserStatsClassements = async () => {
    if (user?.id) {
      try {
        const s = await getUserGameScore(user.id, "Puissance4");
        setStats(s);
        const { rank, total } = await getUserRankInLeaderboard(
          user.id,
          "Puissance4"
        );
        setRank(rank);
        setTotalPlayers(total);
      } catch (error) {
        console.log("Erreur lors de l'actualisation des stats:", error);
      }
    }
  };

  const resetGame = () => {
    console.log("resetGame appelée dans Puissance4 - Reset du jeu");
    setBoard(
      Array(6)
        .fill()
        .map(() => Array(7).fill(null))
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

  const handleFirstTurnOverlayComplete = () => {
    setShowFirstTurnOverlay(false);
  };

  const renderBoard = () => {
    return (
      <View style={styles.boardEffect}>
        {board.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, colIndex) => (
              <TouchableOpacity
                key={`${rowIndex}-${colIndex}`}
                style={styles.cell}
                onPress={() => dropToken(colIndex)}
                disabled={gameOver || isColumnFull(colIndex)}
                activeOpacity={0.7}>
                <View style={styles.hole}>
                  {cell && (
                    <View
                      style={[
                        styles.token,
                        cell === 1 ? styles.redToken : styles.yellowToken,
                      ]}
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <GameLayout
      title='Puissance4'
      stats={stats}
      streak={stats.currentStreak}
      onBack={() => navigation.goBack()}
      currentTurnLabel={gameOver ? "Partie terminée" : `Tour du joueur`}
      currentSymbol={
        gameOver
          ? winner === 1
            ? "🔴"
            : winner === 2
            ? "🟡"
            : "-"
          : currentPlayer === 1
          ? "🔴"
          : "🟡"
      }
      timerLabel={`${Math.floor(elapsedTime / 60)}:${(elapsedTime % 60)
        .toString()
        .padStart(2, "0")}`}
      onPressMainActionButton={resetGame}
      showFirstTurnOverlay={showFirstTurnOverlay}
      firstTurnPlayerName='Vous'
      firstTurnPlayerSymbol='🔴'
      onFirstTurnOverlayComplete={handleFirstTurnOverlayComplete}>
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
  boardEffect: {
    width: BOARD_WIDTH,
    height: BOARD_HEIGHT,
    backgroundColor: "#0066cc",
    borderRadius: 20,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  hole: {
    width: CELL_SIZE - 8,
    height: CELL_SIZE - 8,
    borderRadius: (CELL_SIZE - 8) / 2,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  token: {
    width: CELL_SIZE - 8,
    height: CELL_SIZE - 8,
    borderRadius: (CELL_SIZE - 8) / 2,
  },
  redToken: {
    backgroundColor: "#f44336",
  },
  yellowToken: {
    backgroundColor: "#ffeb3b",
  },
});

export default Puissance4;
