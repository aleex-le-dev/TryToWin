import React, { useState, useCallback, useEffect } from "react";
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
const Echec = () => {
  const [board, setBoard] = useState(INITIAL_BOARD);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [turn, setTurn] = useState("white");
  const [validMoves, setValidMoves] = useState([]);
  const [isAITurn, setIsAITurn] = useState(false);
  const stats = { win: 0, lose: 0, draw: 0, totalPoints: 0 };

  // Obtient le symbole d'une pièce
  const getPieceSymbol = (piece) => {
    if (!piece) return "";
    return PIECES[piece.color][piece.type];
  };

  // Vérifie si une position est valide sur le plateau
  const isValidPosition = (row, col) => {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  };

  // Calcule les mouvements valides pour une pièce
  const getValidMoves = useCallback(
    (row, col, piece) => {
      if (!piece) return [];

      const moves = [];
      const { type, color } = piece;

      switch (type) {
        case "pawn":
          const direction = color === "white" ? -1 : 1;
          const startRow = color === "white" ? 6 : 1;

          // Mouvement en avant
          if (
            isValidPosition(row + direction, col) &&
            !board[row + direction][col]
          ) {
            moves.push([row + direction, col]);

            // Double mouvement depuis la position initiale
            if (row === startRow && !board[row + 2 * direction][col]) {
              moves.push([row + 2 * direction, col]);
            }
          }

          // Prise en diagonale
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
          // Mouvements horizontaux et verticaux
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
          // Mouvements diagonaux
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
          // Combine les mouvements de la tour et du fou
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
          // Mouvements d'une case dans toutes les directions
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
          // Mouvement en L
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
    [board]
  );

  // Gestion du clic sur une case
  const handleCellPress = (row, col) => {
    // Empêcher les clics pendant le tour de l'IA
    if (isAITurn) return;

    const piece = board[row][col];

    // Si une pièce est sélectionnée
    if (selectedPiece) {
      const [selectedRow, selectedCol] = selectedPiece;

      // Vérifier si le mouvement est valide
      if (validMoves.some(([r, c]) => r === row && c === col)) {
        // Effectuer le mouvement
        const newBoard = board.map((row) => [...row]);
        newBoard[row][col] = newBoard[selectedRow][selectedCol];
        newBoard[selectedRow][selectedCol] = null;

        setBoard(newBoard);
        setTurn(turn === "white" ? "black" : "white");

        // Déclencher le tour de l'IA après le mouvement du joueur
        if (turn === "white") {
          setIsAITurn(true);
        }
      }

      // Réinitialiser la sélection
      setSelectedPiece(null);
      setValidMoves([]);
    }
    // Si aucune pièce n'est sélectionnée et qu'on clique sur une pièce de la bonne couleur
    else if (piece && piece.color === turn) {
      setSelectedPiece([row, col]);
      setValidMoves(getValidMoves(row, col, piece));
    }
  };

  // Effet pour faire jouer l'IA automatiquement
  useEffect(() => {
    if (isAITurn && turn === "black") {
      const timer = setTimeout(() => {
        const aiResult = playAIMove(board, "black");

        if (aiResult) {
          setBoard(aiResult.newBoard);
          setTurn("white");
        }

        setIsAITurn(false);
      }, 1000); // Délai d'1 seconde pour l'effet visuel

      return () => clearTimeout(timer);
    }
  }, [isAITurn, turn, board]);

  // Vérifie si une case est un mouvement valide
  const isValidMove = (row, col) => {
    return validMoves.some(([r, c]) => r === row && c === col);
  };

  // Vérifie si une case est sélectionnée
  const isSelected = (row, col) => {
    return (
      selectedPiece && selectedPiece[0] === row && selectedPiece[1] === col
    );
  };

  // Affichage du plateau d'échecs
  const renderBoard = () => (
    <View style={styles.board}>
      {board.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
          {row.map((cell, colIdx) => {
            const isWhite = (rowIdx + colIdx) % 2 === 0;
            const piece = getPieceSymbol(cell);
            const selected = isSelected(rowIdx, colIdx);
            const validMove = isValidMove(rowIdx, colIdx);

            return (
              <TouchableOpacity
                key={colIdx}
                style={[
                  styles.cell,
                  {
                    backgroundColor: selected
                      ? "#4CAF50"
                      : validMove
                      ? "#81C784"
                      : isWhite
                      ? "#f0d9b5"
                      : "#b58863",
                  },
                  selected && styles.selectedCell,
                ]}
                onPress={() => handleCellPress(rowIdx, colIdx)}>
                <Text
                  style={[
                    styles.piece,
                    { color: cell?.color === "white" ? "#fff" : "#000" },
                  ]}>
                  {piece}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );

  return (
    <GameLayout
      title='Échecs'
      stats={stats}
      streak={0}
      onBack={null}
      rank={null}
      totalPlayers={null}
      bestTime={null}
      currentTurnLabel={turn === "white" ? "Tour Blancs" : "Tour Noirs"}
      currentSymbol={turn === "white" ? "♔" : "♚"}
      timerLabel={null}
      renderMainActionButton={null}
      onPressMainActionButton={null}
      countryRank={null}
      countryTotal={null}
      countryCode={"FR"}
      showFirstTurnOverlay={false}>
      {renderBoard()}
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
  },
  selectedCell: {
    borderWidth: 3,
    borderColor: "#2E7D32",
  },
  piece: {
    fontSize: 24,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default Echec;
