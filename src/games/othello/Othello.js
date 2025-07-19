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
  getUserRankInCountryLeaderboard,
} from "../../services/scoreService";
import { useAuth } from "../../hooks/useAuth";
import { GAME_POINTS, getSerieMultiplier } from "../../constants/gamePoints";
import GameLayout from "./../GameLayout";
import GameResultOverlay from "../../components/GameResultOverlay";
import { getIaMove } from "./ia";

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
  const [countryRank, setCountryRank] = useState(null);
  const [countryTotal, setCountryTotal] = useState(null);
  const [iaCommence, setIaCommence] = useState(false);
  const [iaMovePreview, setIaMovePreview] = useState(null);

  useEffect(() => {
    const chargerStats = async () => {
      if (user?.id) {
        try {
          const s = await getUserGameScore(user.id, "Othello");
          setStats(s);
          const { rank, total } = await getUserRankInLeaderboard(
            user.id,
            "Othello"
          );
          setRank(rank);
          setTotalPlayers(total);
          // Pays
          const country = user.country || user.profile?.country || "FR";
          const { rank: cRank, total: cTotal } =
            await getUserRankInCountryLeaderboard(user.id, "Othello", country);
          setCountryRank(cRank);
          setCountryTotal(cTotal);
        } catch (error) {
          console.log(
            "🎮 OTHELLO: Erreur lors du chargement des stats:",
            error
          );
        }
      }
    };
    chargerStats();
    // Afficher l'overlay au démarrage initial
    setShowFirstTurnOverlay(true);
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
          (async () => {
            let resultatBDD = "draw";
            // Le joueur humain joue avec les pions noirs (1) si l'IA ne commence pas, sinon avec les pions blancs (2)
            const humanPlayer = iaCommence ? 2 : 1;
            if (winnerValue === humanPlayer) resultatBDD = "win";
            else if (winnerValue !== 0) resultatBDD = "lose";
            const points = GAME_POINTS["Othello"][resultatBDD];
            const mult = getSerieMultiplier(stats.currentStreak);
            const pointsAvecMultiplicateur = mult > 0 ? Math.round(points * (1 + mult)) : points;
            await recordGameResult(user.id, "Othello", resultatBDD, 0);
            await actualiserStatsClassements();
            setResultData({
              result: resultatBDD,
              points: pointsAvecMultiplicateur,
              multiplier: mult,
              streak: stats.currentStreak,
            });
            setShowResultOverlay(true);
          })();
        }
      } else {
        setCurrentPlayer(getOpponent(currentPlayer));
      }
      return;
    }
    // Appel IA si c'est à l'IA de jouer (joueur 2)
    if (currentPlayer === 2 && !gameOver) {
      (async () => {
        // Conversion board 2D -> 1D (null, 'X', 'O')
        const flatBoard = board
          .flat()
          .map((v) => (v === 1 ? "X" : v === 2 ? "O" : null));
        const iaMove = await getIaMove(flatBoard);
        if (iaMove) {
          const [row, col] = iaMove.split(",").map(Number);
          // Afficher le coup de l'IA pendant 1 seconde avant de le jouer
          setIaMovePreview([row, col]);
          setTimeout(() => {
            setBoard(applyMove(board, row, col, 2));
            setCurrentPlayer(1);
            setIaMovePreview(null);
          }, 1000);
        }
      })();
    }
  }, [board, currentPlayer, gameOver]);

  const handleCellPress = (row, col) => {
    if (gameOver || !isValidMove(board, row, col, currentPlayer)) return;
    const newBoard = applyMove(board, row, col, currentPlayer);
    setBoard(newBoard);
    setCurrentPlayer(getOpponent(currentPlayer));
  };

  const renderBoard = () => {
    // Le joueur humain joue avec les pions noirs (1) si l'IA ne commence pas, sinon avec les pions blancs (2)
    const humanPlayer = iaCommence ? 2 : 1;

    return (
      <View style={styles.board}>
        {board.map((rowArr, row) => (
          <View key={row} style={styles.row}>
            {rowArr.map((cell, col) => {
              const isValid = validMoves.some(
                ([r, c]) => r === row && c === col
              );
              // On affiche l'aperçu seulement si c'est le tour du joueur humain
              const showPreview = isValid && currentPlayer === humanPlayer;
              // On affiche le coup de l'IA en surlignage
              const showIaPreview =
                iaMovePreview &&
                iaMovePreview[0] === row &&
                iaMovePreview[1] === col;
              return (
                <TouchableOpacity
                  key={col}
                  style={styles.cell}
                  onPress={() => handleCellPress(row, col)}
                  disabled={
                    gameOver || !isValid || currentPlayer !== humanPlayer
                  }>
                  {cell === 1 && <View style={styles.blackDisc} />}
                  {cell === 2 && <View style={styles.whiteDisc} />}
                  {showPreview && <View style={styles.previewDot} />}
                  {showIaPreview && <View style={styles.iaPreviewDot} />}
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
    setGameOver(false);
    setWinner(null);
    // Alterner qui commence
    const nouvelleValeur = !iaCommence;
    setIaCommence(nouvelleValeur);
    if (nouvelleValeur) {
      setCurrentPlayer(2); // L'IA commence (blanc)
    } else {
      setCurrentPlayer(1); // Joueur commence (noir)
    }
  };

  const handleFirstTurnOverlayComplete = (quiCommence = iaCommence) => {
    setShowFirstTurnOverlay(false);
    // Plus besoin de toast car l'overlay affiche déjà le bon message
  };

  const handleResultOverlayComplete = () => {
    setShowResultOverlay(false);
    // Redémarrage automatique après l'overlay
    setTimeout(() => {
      resetGame();
      setShowFirstTurnOverlay(true);
    }, 500);
  };

  // Calcul du score
  const { black, white } = countTokens(board);

  // Message de fin de partie
  let endMessage = null;
  if (gameOver) {
    const humanPlayer = iaCommence ? 2 : 1;
    if (winner === humanPlayer) endMessage = `Victoire ! (${black} - ${white})`;
    else if (winner !== 0) endMessage = `Défaite (${black} - ${white})`;
    else endMessage = `Égalité (${black} - ${white})`;
  }

  const handleGameEnd = async (resultatBDD) => {
    if (user?.id) {
      await recordGameResult(user.id, "Othello", resultatBDD, 0);
      await actualiserStatsClassements();
    }
  };

  const actualiserStatsClassements = async () => {
    if (user?.id) {
      try {
        const s = await getUserGameScore(user.id, "Othello");
        setStats(s);
        const { rank, total } = await getUserRankInLeaderboard(
          user.id,
          "Othello"
        );
        setRank(rank);
        setTotalPlayers(total);
        // Pays
        const country = user.country || user.profile?.country || "FR";
        const { rank: cRank, total: cTotal } =
          await getUserRankInCountryLeaderboard(user.id, "Othello", country);
        setCountryRank(cRank);
        setCountryTotal(cTotal);
      } catch (error) {
        console.log("Erreur lors de l'actualisation des stats:", error);
      }
    }
  };

  return (
    <>
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
        onPressMainActionButton={resetGame}
        showFirstTurnOverlay={showFirstTurnOverlay}
        firstTurnPlayerName={iaCommence ? "L'IA" : "Vous"}
        firstTurnPlayerSymbol={iaCommence ? "⚪" : "⚫"}
        onFirstTurnOverlayComplete={() =>
          handleFirstTurnOverlayComplete(iaCommence)
        }
        headerColor="#4ECDC4"
        rank={rank}
        totalPlayers={totalPlayers}
        countryRank={countryRank}
        countryTotal={countryTotal}
        countryCode={user?.country || user?.profile?.country || "FR"}>
        {/* Score en direct sous le bloc info */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 8,
          }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginRight: 16,
            }}>
            <View
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: "#222",
                marginRight: 4,
              }}
            />
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>{black}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: "#fff",
                borderWidth: 1,
                borderColor: "#222",
                marginRight: 4,
              }}
            />
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>{white}</Text>
          </View>
        </View>
        {/* Plateau de jeu */}
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
                  {winner === 0
                    ? "Égalité"
                    : winner === (iaCommence ? 2 : 1)
                    ? "Victoire !"
                    : "Défaite"}
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
  blackDisc: {
    width: CELL_SIZE - 10,
    height: CELL_SIZE - 10,
    borderRadius: (CELL_SIZE - 10) / 2,
    backgroundColor: "#222",
  },
  whiteDisc: {
    width: CELL_SIZE - 10,
    height: CELL_SIZE - 10,
    borderRadius: (CELL_SIZE - 10) / 2,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#222",
  },
  previewDot: {
    width: CELL_SIZE / 3,
    height: CELL_SIZE / 3,
    borderRadius: CELL_SIZE / 6,
    backgroundColor: "#222",
    alignSelf: "center",
  },
  iaPreviewDot: {
    width: CELL_SIZE / 3,
    height: CELL_SIZE / 3,
    borderRadius: CELL_SIZE / 6,
    backgroundColor: "#ff6b6b",
    alignSelf: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
});

export default Othello;
