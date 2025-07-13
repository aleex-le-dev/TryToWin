// IA très forte pour le jeu d'échecs (compatible React Native)
// Utilise un algorithme minimax avec évaluation avancée

// Tables de position pour chaque pièce (améliore l'évaluation)
const POSITION_TABLES = {
  pawn: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5, 5, 10, 25, 25, 10, 5, 5],
    [0, 0, 0, 20, 20, 0, 0, 0],
    [5, -5, -10, 0, 0, -10, -5, 5],
    [5, 10, 10, -20, -20, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  knight: [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0, 0, 0, 0, -20, -40],
    [-30, 0, 10, 15, 15, 10, 0, -30],
    [-30, 5, 15, 20, 20, 15, 5, -30],
    [-30, 0, 15, 20, 20, 15, 0, -30],
    [-30, 5, 10, 15, 15, 10, 5, -30],
    [-40, -20, 0, 5, 5, 0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50],
  ],
  bishop: [
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 10, 10, 5, 0, -10],
    [-10, 5, 5, 10, 10, 5, 5, -10],
    [-10, 0, 10, 10, 10, 10, 0, -10],
    [-10, 10, 10, 10, 10, 10, 10, -10],
    [-10, 5, 0, 0, 0, 0, 5, -10],
    [-20, -10, -10, -10, -10, -10, -10, -20],
  ],
  rook: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 10, 10, 10, 10, 10, 10, 5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [0, 0, 0, 5, 5, 0, 0, 0],
  ],
  queen: [
    [-20, -10, -10, -5, -5, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 5, 5, 5, 0, -10],
    [-5, 0, 5, 5, 5, 5, 0, -5],
    [0, 0, 5, 5, 5, 5, 0, -5],
    [-10, 5, 5, 5, 5, 5, 0, -10],
    [-10, 0, 5, 0, 0, 0, 0, -10],
    [-20, -10, -10, -5, -5, -10, -10, -20],
  ],
  king: [
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-20, -30, -30, -40, -40, -30, -30, -20],
    [-10, -20, -20, -20, -20, -20, -20, -10],
    [20, 20, 0, 0, 0, 0, 20, 20],
    [20, 30, 10, 0, 0, 10, 30, 20],
  ],
};

// Valeurs des pièces
const PIECE_VALUES = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000,
};

// Évaluation avancée de la position
const evaluatePosition = (board) => {
  let score = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const value = PIECE_VALUES[piece.type];
        const positionValue = POSITION_TABLES[piece.type][row][col];

        if (piece.color === "white") {
          score += value + positionValue;
        } else {
          score -= value + POSITION_TABLES[piece.type][7 - row][col]; // Inversé pour les noirs
        }
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

      if (
        isValidPosition(row + direction, col) &&
        isEmpty(row + direction, col)
      ) {
        moves.push([row + direction, col]);

        if (row === startRow && isEmpty(row + 2 * direction, col)) {
          moves.push([row + 2 * direction, col]);
        }
      }

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

// Algorithme minimax avec élagage alpha-beta
const minimax = (board, depth, alpha, beta, isMaximizing, maxDepth) => {
  if (depth === 0) {
    return evaluatePosition(board);
  }

  const color = isMaximizing ? "white" : "black";
  const moves = getAllPossibleMoves(board, color);

  if (moves.length === 0) {
    return evaluatePosition(board);
  }

  // Tri des mouvements pour améliorer l'élagage
  moves.sort((a, b) => {
    const aBoard = makeMove(board, a);
    const bBoard = makeMove(board, b);
    const aEval = evaluatePosition(aBoard);
    const bEval = evaluatePosition(bBoard);
    return isMaximizing ? bEval - aEval : aEval - bEval;
  });

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newBoard = makeMove(board, move);
      const evaluation = minimax(
        newBoard,
        depth - 1,
        alpha,
        beta,
        false,
        maxDepth
      );
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break; // Élagage beta
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newBoard = makeMove(board, move);
      const evaluation = minimax(
        newBoard,
        depth - 1,
        alpha,
        beta,
        true,
        maxDepth
      );
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break; // Élagage alpha
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

// Trouve le meilleur mouvement avec recherche en profondeur
export const findBestMove = (board, color, maxDepth = 4) => {
  const moves = getAllPossibleMoves(board, color);

  if (moves.length === 0) return null;

  let bestMove = null;
  let bestValue = color === "white" ? -Infinity : Infinity;

  // Tri des mouvements pour améliorer l'élagage
  moves.sort((a, b) => {
    const aBoard = makeMove(board, a);
    const bBoard = makeMove(board, b);
    const aEval = evaluatePosition(aBoard);
    const bEval = evaluatePosition(bBoard);
    return color === "white" ? bEval - aEval : aEval - bEval;
  });

  for (const move of moves) {
    const newBoard = makeMove(board, move);
    const value = minimax(
      newBoard,
      maxDepth - 1,
      -Infinity,
      Infinity,
      color === "black",
      maxDepth
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

// Fonction principale pour faire jouer l'IA très forte
export const playAIMove = async (board, color) => {
  try {
    const move = findBestMove(board, color, 1); // Profondeur 1 pour réactivité immédiate

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
  } catch (error) {
    console.error("Erreur IA:", error);
    return null;
  }
};
