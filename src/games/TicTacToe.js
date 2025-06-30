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
const TicTacToe = ({ navigation, route }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gameHistory, setGameHistory] = useState([]);

  // Timer pour le jeu
  useEffect(() => {
    let interval = null;
    if (isPlaying && !gameOver) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, gameOver]);

  // Vérifier s'il y a un gagnant
  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // horizontales
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // verticales
      [0, 4, 8],
      [2, 4, 6], // diagonales
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return squares[a];
      }
    }
    return null;
  };

  // Vérifier si le jeu est nul
  const isDraw = (squares) => {
    return squares.every((square) => square !== null);
  };

  // Gérer un clic sur une case
  const handleClick = (i) => {
    if (board[i] || gameOver) return;

    const newBoard = board.slice();
    newBoard[i] = xIsNext ? "X" : "O";
    setBoard(newBoard);
    setXIsNext(!xIsNext);

    // Vérifier le gagnant
    const winner = calculateWinner(newBoard);
    if (winner) {
      setWinner(winner);
      setGameOver(true);
      setIsPlaying(false);
      handleGameEnd(winner, timeElapsed);
    } else if (isDraw(newBoard)) {
      setGameOver(true);
      setIsPlaying(false);
      handleGameEnd("draw", timeElapsed);
    }
  };

  // Gérer la fin du jeu
  const handleGameEnd = (result, time) => {
    let newScore = 0;
    let message = "";

    if (result === "X") {
      newScore = Math.max(1000 - time * 10, 100); // Score basé sur le temps
      message = "🎉 Victoire ! Vous avez gagné !";
      Toast.show({
        type: "success",
        text1: "Victoire !",
        text2: `Score: ${newScore} points`,
      });
    } else if (result === "O") {
      message = "😔 Défaite ! L'IA a gagné.";
      Toast.show({
        type: "error",
        text1: "Défaite",
        text2: "L'IA a gagné cette partie",
      });
    } else {
      newScore = 50; // Score pour match nul
      message = "🤝 Match nul !";
      Toast.show({
        type: "info",
        text1: "Match nul",
        text2: "Aucun gagnant cette fois",
      });
    }

    setScore((prev) => prev + newScore);

    // Sauvegarder la partie
    const gameResult = {
      id: Date.now(),
      result,
      score: newScore,
      time,
      date: new Date().toISOString(),
    };
    setGameHistory((prev) => [gameResult, ...prev]);
  };

  // Recommencer une partie
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setGameOver(false);
    setWinner(null);
    setTimeElapsed(0);
    setIsPlaying(true);
  };

  // Nouvelle partie
  const newGame = () => {
    setLoading(true);
    setTimeout(() => {
      resetGame();
      setLoading(false);
    }, 500);
  };

  // Rendre une case du plateau
  const renderSquare = (i) => {
    const value = board[i];
    const isWinningSquare = winner && calculateWinner(board) === value;

    return (
      <TouchableOpacity
        key={i}
        style={[styles.square, isWinningSquare && styles.winningSquare]}
        onPress={() => handleClick(i)}
        disabled={gameOver}>
        <Text
          style={[
            styles.squareText,
            value === "X" && styles.xText,
            value === "O" && styles.oText,
            isWinningSquare && styles.winningText,
          ]}>
          {value}
        </Text>
      </TouchableOpacity>
    );
  };

  // Rendre le plateau complet
  const renderBoard = () => {
    return (
      <View style={styles.board}>
        <View style={styles.boardRow}>
          {renderSquare(0)}
          {renderSquare(1)}
          {renderSquare(2)}
        </View>
        <View style={styles.boardRow}>
          {renderSquare(3)}
          {renderSquare(4)}
          {renderSquare(5)}
        </View>
        <View style={styles.boardRow}>
          {renderSquare(6)}
          {renderSquare(7)}
          {renderSquare(8)}
        </View>
      </View>
    );
  };

  // Rendre les statistiques
  const renderStats = () => {
    const wins = gameHistory.filter((game) => game.result === "X").length;
    const losses = gameHistory.filter((game) => game.result === "O").length;
    const draws = gameHistory.filter((game) => game.result === "draw").length;
    const totalGames = gameHistory.length;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{wins}</Text>
          <Text style={styles.statLabel}>Victoires</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{losses}</Text>
          <Text style={styles.statLabel}>Défaites</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{draws}</Text>
          <Text style={styles.statLabel}>Nuls</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalGames}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#667eea' />
          <Text style={styles.loadingText}>Nouvelle partie...</Text>
        </View>
      )}

      {!loading && (
        <>
          {/* Header */}
          <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
            <View style={styles.headerContent}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}>
                <Ionicons name='arrow-back' size={24} color='#fff' />
              </TouchableOpacity>
              <Text style={styles.gameTitle}>Morpion</Text>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>{score}</Text>
                <Text style={styles.scoreLabel}>points</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Informations du jeu */}
          <View style={styles.gameInfo}>
            <View style={styles.playerInfo}>
              <Text style={styles.playerLabel}>
                {xIsNext ? "Votre tour" : "Tour de l'IA"}
              </Text>
              <Text style={styles.playerSymbol}>{xIsNext ? "X" : "O"}</Text>
            </View>

            <View style={styles.timerContainer}>
              <Ionicons name='time' size={20} color='#667eea' />
              <Text style={styles.timerText}>
                {Math.floor(timeElapsed / 60)}:
                {(timeElapsed % 60).toString().padStart(2, "0")}
              </Text>
            </View>
          </View>

          {/* Plateau de jeu */}
          <View style={styles.gameContainer}>{renderBoard()}</View>

          {/* Boutons d'action */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={newGame}>
              <Ionicons name='refresh' size={20} color='#fff' />
              <Text style={styles.actionButtonText}>Nouvelle partie</Text>
            </TouchableOpacity>

            {gameOver && (
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={resetGame}>
                <Ionicons name='play' size={20} color='#fff' />
                <Text style={styles.actionButtonText}>Rejouer</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Statistiques */}
          {gameHistory.length > 0 && (
            <View style={styles.statsSection}>
              <Text style={styles.statsTitle}>Statistiques</Text>
              {renderStats()}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#667eea",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  scoreContainer: {
    alignItems: "center",
  },
  scoreText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  scoreLabel: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.8,
  },
  gameInfo: {
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
  playerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  playerLabel: {
    fontSize: 16,
    color: "#333",
    marginRight: 10,
  },
  playerSymbol: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#667eea",
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#667eea",
    marginLeft: 5,
  },
  gameContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  board: {
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
  boardRow: {
    flex: 1,
    flexDirection: "row",
  },
  square: {
    flex: 1,
    margin: 2,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  squareText: {
    fontSize: 36,
    fontWeight: "bold",
  },
  xText: {
    color: "#667eea",
  },
  oText: {
    color: "#e74c3c",
  },
  winningSquare: {
    backgroundColor: "#667eea",
  },
  winningText: {
    color: "#fff",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6c757d",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: "#667eea",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  statsContainer: {
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
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#667eea",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
});

export default TicTacToe;
