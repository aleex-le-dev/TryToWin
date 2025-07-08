/**
 * Composant du jeu Puissance4.
 * Jeu complet avec plateau 7x6, logique de victoire et interface interactive.
 * Enregistre et affiche uniquement les points du barème (pas de score brut).
 * Utilisé dans la navigation et la BDD sous l'identifiant "Puissance4".
 */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
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

const { width, height } = Dimensions.get("window");
const BOARD_WIDTH = width - 24; // Plateau bord à bord
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
  // Timer pour la partie
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
  }, [user?.id]);

  // Vérifier si une colonne est pleine
  const isColumnFull = (col) => {
    return board[0][col] !== null;
  };

  // Trouver la première cellule vide dans une colonne
  const getLowestEmptyCell = (col) => {
    for (let row = 5; row >= 0; row--) {
      if (board[row][col] === null) {
        return row;
      }
    }
    return -1;
  };

  // Placer un jeton dans une colonne
  const dropToken = (col) => {
    if (gameOver || isColumnFull(col)) return;

    const row = getLowestEmptyCell(col);
    if (row === -1) return;

    const newBoard = board.map((row) => [...row]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);

    // Vérifier la victoire
    if (checkWin(newBoard, row, col, currentPlayer)) {
      setWinner(currentPlayer);
      setGameOver(true);
      handleGameEnd(currentPlayer === 1 ? "win" : "lose");
      return;
    }

    // Vérifier le match nul
    if (isBoardFull(newBoard)) {
      setWinner(0);
      setGameOver(true);
      handleGameEnd("draw");
      return;
    }

    // Changer de joueur
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
  };

  // Vérifier si le plateau est plein
  const isBoardFull = (boardState) => {
    return boardState[0].every((cell) => cell !== null);
  };

  // Vérifier la victoire
  const checkWin = (boardState, row, col, player) => {
    const directions = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1], // diagonal droite
      [1, -1], // diagonal gauche
    ];

    for (const [dx, dy] of directions) {
      let count = 1;

      // Compter dans une direction
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

      // Compter dans la direction opposée
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

  // Gérer la fin de partie
  const handleGameEnd = async (result) => {
    if (user?.id) {
      await recordGameResult(user.id, "Puissance4", result, 0, 0);
      const s = await getUserGameScore(user.id, "Puissance4");
      setStats(s);
      const { rank, total } = await getUserRankInLeaderboard(
        user.id,
        "Puissance4"
      );
      setRank(rank);
      setTotalPlayers(total);

      // Afficher le toast avec les points gagnés et la série si applicable
      const points = GAME_POINTS["Puissance4"][result];
      const mult = getSerieMultiplier(s.currentStreak);
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
        toastConfig.text1 = `🔥 Victoire ! Série de ${s.currentStreak}`;
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
    }
  };

  // Réinitialiser le jeu
  const resetGame = () => {
    setBoard(
      Array(6)
        .fill()
        .map(() => Array(7).fill(null))
    );
    setCurrentPlayer(1);
    setGameOver(false);
    setWinner(null);
    setElapsedTime(0); // Reset timer
  };

  // Rendu d'une cellule
  const renderCell = (row, col) => {
    const cellValue = board[row][col];
    const isWinningCell = winner && checkWin(board, row, col, winner);

    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={[styles.cell, isWinningCell && styles.winningCell]}
        onPress={() => dropToken(col)}
        disabled={gameOver || isColumnFull(col)}>
        {cellValue && (
          <View
            style={[
              styles.token,
              cellValue === 1 ? styles.redToken : styles.yellowToken,
            ]}
          />
        )}
      </TouchableOpacity>
    );
  };

  // Remplacer le rendu du plateau par un fond bleu avec des trous blancs (effet Puissance 4)
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

  // SUPPRIMER : tout affichage direct du tour et du timer dans le render de Puissance 4

  // Message de fin de partie
  return (
    <GameLayout
      title='Puissance4'
      stats={stats}
      streak={stats.currentStreak}
      onBack={() => navigation.goBack()}
      statsMarginTop={200}
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
        .padStart(2, "0")}`}>
      <View style={styles.container}>

        {/* Plateau de jeu */}
        <View style={styles.boardContainer}>
          {width < 350 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {renderBoard()}
            </ScrollView>
          ) : (
            renderBoard()
          )}
        </View>

        {/* Message de fin de partie */}
        {gameOver && (
          <View style={styles.gameOverContainer}>
            <Text style={styles.gameOverText}>
              {winner === 0
                ? "Match nul !"
                : winner === 1
                ? "Rouge gagne !"
                : "Jaune gagne !"}
            </Text>
            <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
              <Ionicons name='refresh' size={20} color='#fff' />
              <Text style={styles.resetButtonText}>Nouvelle partie</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Statistiques */}
      </View>
      <Toast />
    </GameLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  playerIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  playerText: {
    fontSize: 16,
    marginRight: 10,
    color: "#666",
  },
  currentPlayerToken: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  boardContainer: {
    marginVertical: 20,
    backgroundColor: "transparent",
    padding: 8,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32, // Ajout d'espace sous le plateau
  },
  boardEffect: {
    width: BOARD_WIDTH,
    height: BOARD_HEIGHT,
    backgroundColor: "#0066cc",
    borderRadius: 20,
    padding: 0,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  board: {
    width: BOARD_WIDTH,
    height: BOARD_HEIGHT,
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
  winningCell: {
    backgroundColor: "#ffeb3b",
    elevation: 8,
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
  gameOverContainer: {
    alignItems: "center",
    marginVertical: 20,
    padding: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
  },
  gameOverText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#667eea",
    padding: 12,
    borderRadius: 8,
  },
  resetButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
  stats: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    width: "100%",
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  sectionStatistiques: {
    marginTop: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  titreStatistiques: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#222",
    textAlign: "left",
  },
  containerStatistiques: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  elementStat: {
    alignItems: "center",
    flex: 1,
  },
  valeurStat: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#667eea",
  },
  labelStat: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  containerStatsDetaillees: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  elementStatDetaille: {
    flex: 1,
    alignItems: "center",
  },
  labelStatDetaille: {
    fontSize: 13,
    color: "#888",
  },
  valeurStatDetaille: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#7c3aed",
    marginTop: 2,
  },
});

export default Puissance4;
