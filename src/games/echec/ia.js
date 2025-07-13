// IA simple pour le jeu d'échecs
// Joue automatiquement après le tour du joueur humain

// Calcule un score simple pour une position
const evaluatePosition = (board) => {
  const pieceValues = {
    pawn: 1,
    knight: 3,
    bishop: 3,
    rook: 5,
    queen: 9,
    king: 1000,
  };

  let score = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const value = pieceValues[piece.type];
        score += piece.color === "white" ? value : -value;
      }
    }
  }

  return score;
};

// Trouve tous les mouvements possibles pour une couleur
const getAllPossibleMoves = (board, color) => {
  const moves = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const validMoves = getValidMovesForPiece(board, row, col, piece);
        validMoves.forEach(([targetRow, targetCol]) => {
          moves.push({
            from: [row, col],
            to: [targetRow, targetCol],
            piece: piece,
          });
        });
      }
    }
  }

  return moves;
};

// Calcule les mouvements valides pour une pièce spécifique
const getValidMovesForPiece = (board, row, col, piece) => {
  const moves = [];
  const { type, color } = piece;

  const isValidPosition = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
  const isEnemyPiece = (r, c) => board[r][c] && board[r][c].color !== color;
  const isEmpty = (r, c) => !board[r][c];

  switch (type) {
    case "pawn":
      const direction = color === "white" ? -1 : 1;
      const startRow = color === "white" ? 6 : 1;

      // Mouvement en avant
      if (
        isValidPosition(row + direction, col) &&
        isEmpty(row + direction, col)
      ) {
        moves.push([row + direction, col]);

        // Double mouvement depuis la position initiale
        if (row === startRow && isEmpty(row + 2 * direction, col)) {
          moves.push([row + 2 * direction, col]);
        }
      }

      // Prise en diagonale
      [-1, 1].forEach((offset) => {
        const targetRow = row + direction;
        const targetCol = col + offset;
        if (
          isValidPosition(targetRow, targetCol) &&
          isEnemyPiece(targetRow, targetCol)
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
          if (isEmpty(r, c)) {
            moves.push([r, c]);
          } else {
            if (isEnemyPiece(r, c)) moves.push([r, c]);
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
          if (isEmpty(r, c)) {
            moves.push([r, c]);
          } else {
            if (isEnemyPiece(r, c)) moves.push([r, c]);
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
          if (isEmpty(r, c)) {
            moves.push([r, c]);
          } else {
            if (isEnemyPiece(r, c)) moves.push([r, c]);
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
        if (isValidPosition(r, c) && (isEmpty(r, c) || isEnemyPiece(r, c))) {
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
        if (isValidPosition(r, c) && (isEmpty(r, c) || isEnemyPiece(r, c))) {
          moves.push([r, c]);
        }
      });
      break;
  }

  return moves;
};

// Algorithme minimax simple pour l'IA
const minimax = (board, depth, alpha, beta, isMaximizing) => {
  if (depth === 0) {
    return evaluatePosition(board);
  }

  const color = isMaximizing ? "white" : "black";
  const moves = getAllPossibleMoves(board, color);

  if (moves.length === 0) {
    return evaluatePosition(board);
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newBoard = makeMove(board, move);
      const evaluation = minimax(newBoard, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newBoard = makeMove(board, move);
      const evaluation = minimax(newBoard, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
};

// Effectue un mouvement sur le plateau
const makeMove = (board, move) => {
  const newBoard = board.map((row) => [...row]);
  const [fromRow, fromCol] = move.from;
  const [toRow, toCol] = move.to;

  newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
  newBoard[fromRow][fromCol] = null;

  return newBoard;
};

// Trouve le meilleur mouvement pour l'IA
export const findBestMove = (board, color, depth = 3) => {
  const moves = getAllPossibleMoves(board, color);

  if (moves.length === 0) return null;

  let bestMove = null;
  let bestValue = color === "white" ? -Infinity : Infinity;

  for (const move of moves) {
    const newBoard = makeMove(board, move);
    const value = minimax(
      newBoard,
      depth - 1,
      -Infinity,
      Infinity,
      color === "black"
    );

    if (color === "white" && value > bestValue) {
      bestValue = value;
      bestMove = move;
    } else if (color === "black" && value < bestValue) {
      bestValue = value;
      bestMove = move;
    }
  }

  return bestMove;
};

// Fonction principale pour faire jouer l'IA
export const playAIMove = (board, color) => {
  const move = findBestMove(board, color, 2); // Profondeur réduite pour la performance

  if (move) {
    const newBoard = makeMove(board, move);
    return {
      newBoard,
      move: {
        from: move.from,
        to: move.to,
        piece: move.piece,
      },
    };
  }

  return null;
};
