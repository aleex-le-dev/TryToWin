import React, { useState, useCallback, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import GameLayout from "../GameLayout";
import { playAIMove } from "./ia";

// Configuration des pièces d'échecs (même style que react-native-chessboard)
const PIECES = {
  white: {
    king: "♔",
    queen: "♕",
    rook: "♖",
    bishop: "♗",
    knight: "♘",
    pawn: "♙",
  },
  black: {
    king: "♚",
    queen: "♛",
    rook: "♜",
    bishop: "♝",
    knight: "♞",
    pawn: "♟",
  },
};

// Position initiale du plateau d'échecs
const INITIAL_BOARD = [
  [
    { type: "rook", color: "black" },
    { type: "knight", color: "black" },
    { type: "bishop", color: "black" },
    { type: "queen", color: "black" },
    { type: "king", color: "black" },
    { type: "bishop", color: "black" },
    { type: "knight", color: "black" },
    { type: "rook", color: "black" },
  ],
  Array(8)
    .fill()
    .map(() => ({ type: "pawn", color: "black" })),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8)
    .fill()
    .map(() => ({ type: "pawn", color: "white" })),
  [
    { type: "rook", color: "white" },
    { type: "knight", color: "white" },
    { type: "bishop", color: "white" },
    { type: "queen", color: "white" },
    { type: "king", color: "white" },
    { type: "bishop", color: "white" },
    { type: "knight", color: "white" },
    { type: "rook", color: "white" },
  ],
];

// Composant principal du jeu d'échecs
const Echec = ({ navigation }) => {
  const [board, setBoard] = useState(INITIAL_BOARD);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [turn, setTurn] = useState("white");
  const [validMoves, setValidMoves] = useState([]);
  const [isAITurn, setIsAITurn] = useState(false);
  const [whiteTime, setWhiteTime] = useState(300); // 5 minutes en secondes
  const [blackTime, setBlackTime] = useState(300);
  const [gameStartTime, setGameStartTime] = useState(Date.now());
  const stats = { win: 0, lose: 0, draw: 0, totalPoints: 0 };

  // Formatage du temps
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Timer du jeu
  useEffect(() => {
    const timer = setInterval(() => {
      if (turn === "white") {
        setWhiteTime((prev) => Math.max(0, prev - 1));
      } else {
        setBlackTime((prev) => Math.max(0, prev - 1));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [turn]);

  // Vérification de fin de temps
  useEffect(() => {
    if (whiteTime <= 0) {
      // Les blancs ont perdu par temps
      console.log("Les blancs ont perdu par temps");
    } else if (blackTime <= 0) {
      // Les noirs ont perdu par temps
      console.log("Les noirs ont perdu par temps");
    }
  }, [whiteTime, blackTime]);

  // Obtient le symbole d'une pièce (mémorisé)
  const getPieceSymbol = useCallback((piece) => {
    if (!piece) return "";
    return PIECES[piece.color][piece.type];
  }, []);

  // Vérifie si une position est valide sur le plateau (mémorisé)
  const isValidPosition = useCallback((row, col) => {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }, []);

  // Calcule les mouvements valides pour une pièce (mémorisé)
  const getValidMoves = useCallback(
    (row, col, piece) => {
      if (!piece) return [];

      const moves = [];
      const { type, color } = piece;

      switch (type) {
        case "pawn":
          const direction = color === "white" ? -1 : 1;
          const startRow = color === "white" ? 6 : 1;

          if (
            isValidPosition(row + direction, col) &&
            !board[row + direction][col]
          ) {
            moves.push([row + direction, col]);

            if (row === startRow && !board[row + 2 * direction][col]) {
              moves.push([row + 2 * direction, col]);
            }
          }

          [-1, 1].forEach((offset) => {
            const targetRow = row + direction;
            const targetCol = col + offset;
            if (
              isValidPosition(targetRow, targetCol) &&
              board[targetRow][targetCol] &&
              board[targetRow][targetCol].color !== color
            ) {
              moves.push([targetRow, targetCol]);
            }
          });
          break;

        case "rook":
          const rookDirections = [
            [0, 1],
            [0, -1],
            [1, 0],
            [-1, 0],
          ];
          rookDirections.forEach(([dr, dc]) => {
            let r = row + dr,
              c = col + dc;
            while (isValidPosition(r, c)) {
              if (!board[r][c]) {
                moves.push([r, c]);
              } else {
                if (board[r][c].color !== color) moves.push([r, c]);
                break;
              }
              r += dr;
              c += dc;
            }
          });
          break;

        case "bishop":
          const bishopDirections = [
            [1, 1],
            [1, -1],
            [-1, 1],
            [-1, -1],
          ];
          bishopDirections.forEach(([dr, dc]) => {
            let r = row + dr,
              c = col + dc;
            while (isValidPosition(r, c)) {
              if (!board[r][c]) {
                moves.push([r, c]);
              } else {
                if (board[r][c].color !== color) moves.push([r, c]);
                break;
              }
              r += dr;
              c += dc;
            }
          });
          break;

        case "queen":
          const queenDirections = [
            [0, 1],
            [0, -1],
            [1, 0],
            [-1, 0],
            [1, 1],
            [1, -1],
            [-1, 1],
            [-1, -1],
          ];
          queenDirections.forEach(([dr, dc]) => {
            let r = row + dr,
              c = col + dc;
            while (isValidPosition(r, c)) {
              if (!board[r][c]) {
                moves.push([r, c]);
              } else {
                if (board[r][c].color !== color) moves.push([r, c]);
                break;
              }
              r += dr;
              c += dc;
            }
          });
          break;

        case "king":
          const kingDirections = [
            [0, 1],
            [0, -1],
            [1, 0],
            [-1, 0],
            [1, 1],
            [1, -1],
            [-1, 1],
            [-1, -1],
          ];
          kingDirections.forEach(([dr, dc]) => {
            const r = row + dr,
              c = col + dc;
            if (
              isValidPosition(r, c) &&
              (!board[r][c] || board[r][c].color !== color)
            ) {
              moves.push([r, c]);
            }
          });
          break;

        case "knight":
          const knightMoves = [
            [-2, -1],
            [-2, 1],
            [-1, -2],
            [-1, 2],
            [1, -2],
            [1, 2],
            [2, -1],
            [2, 1],
          ];
          knightMoves.forEach(([dr, dc]) => {
            const r = row + dr,
              c = col + dc;
            if (
              isValidPosition(r, c) &&
              (!board[r][c] || board[r][c].color !== color)
            ) {
              moves.push([r, c]);
            }
          });
          break;
      }

      return moves;
    },
    [board, isValidPosition]
  );

  // Gestion du clic sur une case (avec vérification des mouvements valides)
  const handleCellPress = useCallback(
    (row, col) => {
      console.log("🖱️ Clic détecté sur", row, col);

      if (isAITurn) {
        console.log("❌ Tour de l'IA, clic ignoré");
        return;
      }

      const piece = board[row][col];
      console.log("📦 Pièce sur cette case:", piece);

      // Si une pièce est sélectionnée, vérifier si le mouvement est valide
      if (selectedPiece) {
        console.log("🎯 Pièce sélectionnée, vérification du mouvement...");
        const [selectedRow, selectedCol] = selectedPiece;

        // Vérifier si le mouvement est valide
        const isValidMove = validMoves.some(([r, c]) => r === row && c === col);

        if (isValidMove) {
          console.log("✅ Mouvement valide, déplacement en cours...");
          // Déplacement immédiat
          const newBoard = board.map((row) => [...row]);
          newBoard[row][col] = newBoard[selectedRow][selectedCol];
          newBoard[selectedRow][selectedCol] = null;

          console.log("✅ Plateau mis à jour, mise à jour de l'état...");
          setBoard(newBoard);
          setTurn(turn === "white" ? "black" : "white");
          setSelectedPiece(null);
          setValidMoves([]);

          if (turn === "white") {
            console.log("🤖 Activation du tour de l'IA");
            setIsAITurn(true);
          }
          console.log("✅ Déplacement terminé");
        } else {
          console.log(
            "❌ Mouvement invalide, réinitialisation de la sélection"
          );
          // Réinitialiser la sélection pour permettre de changer de pièce
          setSelectedPiece(null);
          setValidMoves([]);

          // Si on clique sur une autre pièce de la même couleur, la sélectionner
          if (piece && piece.color === turn) {
            console.log(
              "🎯 Sélection d'une nouvelle pièce:",
              piece.type,
              piece.color
            );
            setSelectedPiece([row, col]);
            setValidMoves(getValidMoves(row, col, piece));
          }
        }
      }
      // Sélection d'une pièce
      else if (piece && piece.color === turn) {
        console.log("🎯 Sélection d'une pièce:", piece.type, piece.color);
        setSelectedPiece([row, col]);
        console.log("🧮 Calcul des mouvements valides...");
        setValidMoves(getValidMoves(row, col, piece));
        console.log("✅ Pièce sélectionnée");
      } else {
        console.log("❌ Aucune action effectuée");
      }
    },
    [board, selectedPiece, validMoves, turn, isAITurn, getValidMoves]
  );

  // Effet pour faire jouer l'IA automatiquement
  useEffect(() => {
    if (isAITurn && turn === "black") {
      console.log("🤖 Début du tour de l'IA");
      const playAI = async () => {
        try {
          console.log("🧠 IA réfléchit...");
          const aiResult = await playAIMove(board, "black");

          if (aiResult) {
            console.log("✅ IA a joué, mise à jour du plateau");
            setBoard(aiResult.newBoard);
            setTurn("white");
          } else {
            console.log("❌ IA n'a pas trouvé de coup");
          }
        } catch (error) {
          console.error("❌ Erreur lors du tour de l'IA:", error);
        }

        console.log("🏁 Fin du tour de l'IA");
        setIsAITurn(false);
      };

      playAI();
    }
  }, [isAITurn, turn, board]);

  // Vérifie si une case est un mouvement valide (mémorisé)
  const isValidMove = useCallback(
    (row, col) => {
      return validMoves.some(([r, c]) => r === row && c === col);
    },
    [validMoves]
  );

  // Vérifie si une case est sélectionnée (mémorisé)
  const isSelected = useCallback(
    (row, col) => {
      return (
        selectedPiece && selectedPiece[0] === row && selectedPiece[1] === col
      );
    },
    [selectedPiece]
  );

  // Vérifie si une case contient une pièce adverse qui peut être prise
  const isCapturablePiece = useCallback(
    (row, col) => {
      const piece = board[row][col];
      return (
        piece &&
        piece.color !== turn &&
        validMoves.some(([r, c]) => r === row && c === col)
      );
    },
    [board, turn, validMoves]
  );

  // Affichage du plateau d'échecs (mémorisé)
  const renderBoard = useMemo(
    () => (
      <View style={styles.board}>
        {board.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.row}>
            {row.map((cell, colIdx) => {
              const isWhite = (rowIdx + colIdx) % 2 === 0;
              const piece = getPieceSymbol(cell);
              const selected = isSelected(rowIdx, colIdx);
              const validMove = isValidMove(rowIdx, colIdx);
              const capturable = isCapturablePiece(rowIdx, colIdx);

              return (
                <TouchableOpacity
                  key={colIdx}
                  style={[
                    styles.cell,
                    {
                      backgroundColor: selected
                        ? "#4CAF50"
                        : isWhite
                        ? "#f0d9b5"
                        : "#b58863",
                    },
                    selected && styles.selectedCell,
                    capturable && styles.capturableCell,
                  ]}
                  onPress={() => handleCellPress(rowIdx, colIdx)}>
                  <Text
                    style={[
                      styles.piece,
                      { color: cell?.color === "white" ? "#fff" : "#000" },
                    ]}>
                    {piece}
                  </Text>
                  {validMove && !cell && <View style={styles.previewDot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    ),
    [
      board,
      getPieceSymbol,
      isSelected,
      isValidMove,
      isCapturablePiece,
      handleCellPress,
    ]
  );

  return (
    <GameLayout
      title='Échecs'
      stats={stats}
      streak={0}
      onBack={() => navigation.goBack()}
      rank={null}
      totalPlayers={null}
      bestTime={null}
      currentTurnLabel={turn === "white" ? "Tour Blancs" : "Tour Noirs"}
      currentSymbol={turn === "white" ? "♔" : "♚"}
      timerLabel={`${
        turn === "white" ? formatTime(whiteTime) : formatTime(blackTime)
      }`}
      renderMainActionButton={null}
      onPressMainActionButton={null}
      countryRank={null}
      countryTotal={null}
      countryCode={"FR"}
      showFirstTurnOverlay={false}>
      {renderBoard}
    </GameLayout>
  );
};

const styles = StyleSheet.create({
  board: {
    aspectRatio: 1,
    width: "98%",
    alignSelf: "center",
    borderWidth: 2,
    borderColor: "#8B4513",
  },
  row: {
    flexDirection: "row",
    flex: 1,
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "#888",
    position: "relative",
  },
  selectedCell: {
    borderWidth: 3,
    borderColor: "#2E7D32",
  },
  capturableCell: {
    borderWidth: 3,
    borderColor: "#FF0000",
  },
  piece: {
    fontSize: 24,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  previewDot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#222",
    alignSelf: "center",
  },
});

export default Echec;
