import React, { useState, useEffect, useRef } from "react";
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
import GameResultOverlay from "../../components/GameResultOverlay";
import { getIaMove } from "./ia";
import Svg, { Line } from "react-native-svg";

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
  const [currentPlayer, setCurrentPlayer] = useState(1); // 1 = rouge (joueur), 2 = jaune (IA)
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [winningCells, setWinningCells] = useState([]);
  const [showFirstTurnOverlay, setShowFirstTurnOverlay] = useState(false);
  const [showResultOverlay, setShowResultOverlay] = useState(false);
  const [resultData, setResultData] = useState({
    result: null,
    points: 0,
    multiplier: 0,
    streak: 0,
  });
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
  const [iaCommence, setIaCommence] = useState(false);
  const [tourIA, setTourIA] = useState(false);
  const showResultOverlayRef = useRef(false);

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
    console.log("Nouvelle partie démarrée");
  }, [board]);

  // Faire jouer l'IA si c'est son tour
  useEffect(() => {
    if (tourIA && !gameOver && currentPlayer === 2) {
      console.log("🎯 IA: C'est le tour de l'IA");
      setTimeout(() => {
        faireJouerIA();
      }, 500);
    }
  }, [tourIA, gameOver, currentPlayer]);

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
    // Afficher l'overlay au démarrage initial
    setShowFirstTurnOverlay(true);
  }, [user?.id]);

  useEffect(() => {
    if (resultData.result !== null) {
      console.log(
        "useEffect: resultData.result détecté, forçage setShowResultOverlay(true)"
      );
      setShowResultOverlay(true);
    }
  }, [resultData.result]);

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
    if (gameOver || isColumnFull(col) || currentPlayer !== 1) return; // Seul le joueur peut jouer
    const row = getLowestEmptyCell(col);
    if (row === -1) return;
    const newBoard = board.map((row) => [...row]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);
    console.log("JOUEUR joue colonne", col, "ligne", row);
    const winningLine = checkWin(newBoard, row, col, currentPlayer);
    if (winningLine) {
      setWinner(currentPlayer);
      setWinningCells(winningLine);
      console.log('VICTOIRE JOUEUR détectée, appel handleGameEnd("win")');
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
    setTourIA(true); // Activer le tour de l'IA
  };

  const faireJouerIA = async () => {
    console.log("IA: Début du tour de l'IA");
    try {
      const coupIA = await getIaMove(board, 2);
      console.log("IA: Coup choisi:", coupIA);

      if (coupIA !== null && !isColumnFull(coupIA)) {
        const row = getLowestEmptyCell(coupIA);
        if (row !== -1) {
          const newBoard = board.map((r) => [...r]);
          newBoard[row][coupIA] = 2; // L'IA joue toujours 2 (jaune)
          setBoard(newBoard);
          console.log("IA joue colonne", coupIA, "ligne", row);

          const winningLine = checkWin(newBoard, row, coupIA, 2);
          if (winningLine) {
            setWinner(2);
            setWinningCells(winningLine);
            console.log("🎯 WINNING CELLS:", JSON.stringify(winningLine)); // LOG DEBUG
            setGameOver(true);
            handleGameEnd("lose");
            return;
          }
          if (isBoardFull(newBoard)) {
            setWinner(0);
            setGameOver(true);
            handleGameEnd("draw");
            return;
          }
          setCurrentPlayer(1); // Retour au joueur
          setTourIA(false);
        }
      } else {
        console.log("IA: Coup invalide, retour au joueur");
        setCurrentPlayer(1);
        setTourIA(false);
      }
    } catch (error) {
      console.log("IA: Erreur lors du coup de l'IA:", error);
      setCurrentPlayer(1);
      setTourIA(false);
    }
  };

  const isBoardFull = (boardState) => {
    return boardState[0].every((cell) => cell !== null);
  };

  const checkWin = (boardState, row, col, player) => {
    const directions = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1], // diagonale descendante
      [1, -1], // diagonale montante
    ];
    for (const [dx, dy] of directions) {
      let line = [[row, col]];
      // Vers l'avant
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
          line.push([newRow, newCol]);
        } else {
          break;
        }
      }
      // Vers l'arrière
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
          line.unshift([newRow, newCol]);
        } else {
          break;
        }
      }
      if (line.length >= 4) {
        return line.slice(0, 4); // Toujours exactement 4 cases alignées
      }
    }
    return null;
  };

  const handleGameEnd = async (result) => {
    console.log("handleGameEnd appelé avec", result);
    let pointsAvecMultiplicateur = 0;
    let mult = 0;
    if (user?.id) {
      await recordGameResult(user.id, "Puissance4", result, 0, 0);
      await actualiserStatsClassements();
      const points = GAME_POINTS["Puissance4"][result];
      mult = getSerieMultiplier(stats.currentStreak);
      pointsAvecMultiplicateur =
        mult > 0 ? Math.round(points * (1 + mult)) : points;
    }
    setResultData({
      result: result,
      points: pointsAvecMultiplicateur,
      multiplier: mult,
      streak: stats.currentStreak,
    });
    console.log(
      "setShowResultOverlay(true) AVANT",
      showResultOverlayRef.current
    );
    setShowResultOverlay(true);
    showResultOverlayRef.current = true;
    console.log(
      "setShowResultOverlay(true) APRES",
      showResultOverlayRef.current
    );
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
    setGameOver(false);
    setWinner(null);
    setWinningCells([]);
    setElapsedTime(0);
    setTourIA(false);
    // Ne pas toucher à showResultOverlay ici !
    // Alterner qui commence
    const nouvelleValeur = !iaCommence;
    setIaCommence(nouvelleValeur);
    if (nouvelleValeur) {
      setCurrentPlayer(2); // L'IA commence (jaune)
      setTourIA(true); // Activer le tour de l'IA
    } else {
      setCurrentPlayer(1); // Joueur commence (rouge)
    }
  };

  const handleFirstTurnOverlayComplete = (quiCommence = iaCommence) => {
    setShowFirstTurnOverlay(false);
    // Plus besoin de toast car l'overlay affiche déjà le bon message
  };

  const handleResultOverlayComplete = () => {
    console.log("handleResultOverlayComplete appelé");
    setShowResultOverlay(false);
    showResultOverlayRef.current = false;
    setTimeout(() => {
      console.log("resetGame appelé depuis handleResultOverlayComplete");
      resetGame();
      setShowFirstTurnOverlay(true);
    }, 500);
  };

  const renderWinningLineSVG = () => {
    if (!winningCells || winningCells.length < 2) return null;
    let sorted = [...winningCells];
    sorted.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
    const [start, end] = [sorted[0], sorted[sorted.length - 1]];
    const getPos = ([row, col]) => ({
      x: col * CELL_SIZE + CELL_SIZE / 2,
      y: row * CELL_SIZE + CELL_SIZE / 2,
    });
    const startPos = getPos(start);
    const endPos = getPos(end);
    return (
      <Svg
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: BOARD_WIDTH,
          height: BOARD_HEIGHT,
          zIndex: 20,
          pointerEvents: "none",
        }}>
        <Line
          x1={startPos.x}
          y1={startPos.y}
          x2={endPos.x}
          y2={endPos.y}
          stroke='#FFD700'
          strokeWidth={6}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </Svg>
    );
  };

  const renderBoard = () => {
    return (
      <View style={styles.boardEffect}>
        {board.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, colIndex) => {
              const isWinningCell = winningCells.some(
                ([r, c]) => r === rowIndex && c === colIndex
              );
              // Correction : comparaison robuste
              // const isWinningCell = winningCells.some(cellArr => JSON.stringify(cellArr) === JSON.stringify([rowIndex, colIndex]));
              return (
                <TouchableOpacity
                  key={`${rowIndex}-${colIndex}`}
                  style={styles.cell}
                  onPress={() => dropToken(colIndex)}
                  disabled={gameOver || isColumnFull(colIndex)}
                  activeOpacity={0.7}>
                  <View
                    style={[styles.hole, isWinningCell && styles.winningHole]}>
                    {cell && (
                      <View
                        style={[
                          styles.token,
                          cell === 1 ? styles.redToken : styles.yellowToken,
                          isWinningCell && styles.winningToken,
                        ]}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
        {renderWinningLineSVG()}
      </View>
    );
  };

  // DEBUG : log état overlay
  console.log(
    "showResultOverlay:",
    showResultOverlay,
    "resultData:",
    resultData
  );
  return (
    <>
      <GameLayout
        title='Puissance4'
        stats={stats}
        streak={stats.currentStreak}
        onBack={() => navigation.goBack()}
        currentTurnLabel={
          gameOver
            ? "Partie terminée"
            : currentPlayer === 1
            ? "Votre tour"
            : "Tour de l'IA"
        }
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
        firstTurnPlayerName={iaCommence ? "L'IA" : "Vous"}
        firstTurnPlayerSymbol={iaCommence ? "🟡" : "🔴"}
        onFirstTurnOverlayComplete={() =>
          handleFirstTurnOverlayComplete(iaCommence)
        }>
        <View style={styles.containerJeu}>{renderBoard()}</View>
      </GameLayout>
      {console.log(
        "GameResultOverlay rendu, showResultOverlay:",
        showResultOverlay,
        "resultData:",
        resultData
      )}
      <GameResultOverlay
        isVisible={showResultOverlay || resultData.result !== null}
        result={resultData.result}
        points={resultData.points}
        multiplier={resultData.multiplier}
        streak={resultData.streak}
        onAnimationComplete={handleResultOverlayComplete}
      />
    </>
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
  winningHole: {
    borderWidth: 3,
    borderColor: "#FFD700",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  winningToken: {
    borderWidth: 3,
    borderColor: "#FFD700",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default Puissance4;
