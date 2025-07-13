// Configuration de l'IA pour le Puissance 4
// Définit les stratégies et priorités pour jouer de manière optimale

export const IA_CONFIG = {
  // Profondeur de recherche pour l'algorithme minimax
  SEARCH_DEPTH: 42,

  // Scores pour l'évaluation des positions
  SCORES: {
    VICTORY: 1000000,
    DEFEAT: -1000000,
    DRAW: 0,
    CENTER: 3,
    NEAR_CENTER: 2,
    EDGE: 1,
  },

  // Priorités des coups (du plus important au moins important)
  PRIORITIES: {
    WIN_MOVE: 1, // Coup gagnant immédiat
    BLOCK_MOVE: 2, // Bloquer la victoire de l'adversaire
    THREAT_CREATE: 3, // Créer une menace (3 en ligne)
    THREAT_BLOCK: 4, // Bloquer une menace de l'adversaire
    CENTER: 5, // Jouer au centre
    NEAR_CENTER: 6, // Jouer près du centre
    EDGE: 7, // Jouer sur un bord
    RANDOM: 8, // Coup aléatoire
  },

  // Positions stratégiques
  POSITIONS: {
    CENTER: 3, // Colonne centrale
    NEAR_CENTER: [2, 4], // Colonnes près du centre
    EDGES: [0, 1, 5, 6], // Colonnes sur les bords
  },

  // Lignes gagnantes (combinaisons de 4 cases)
  WINNING_LINES: [
    // Lignes horizontales
    [0, 1, 2, 3],
    [1, 2, 3, 4],
    [2, 3, 4, 5],
    [3, 4, 5, 6],
    [7, 8, 9, 10],
    [8, 9, 10, 11],
    [9, 10, 11, 12],
    [10, 11, 12, 13],
    [14, 15, 16, 17],
    [15, 16, 17, 18],
    [16, 17, 18, 19],
    [17, 18, 19, 20],
    [21, 22, 23, 24],
    [22, 23, 24, 25],
    [23, 24, 25, 26],
    [24, 25, 26, 27],
    [28, 29, 30, 31],
    [29, 30, 31, 32],
    [30, 31, 32, 33],
    [31, 32, 33, 34],
    [35, 36, 37, 38],
    [36, 37, 38, 39],
    [37, 38, 39, 40],
    [38, 39, 40, 41],

    // Lignes verticales
    [0, 7, 14, 21],
    [7, 14, 21, 28],
    [14, 21, 28, 35],
    [1, 8, 15, 22],
    [8, 15, 22, 29],
    [15, 22, 29, 36],
    [2, 9, 16, 23],
    [9, 16, 23, 30],
    [16, 23, 30, 37],
    [3, 10, 17, 24],
    [10, 17, 24, 31],
    [17, 24, 31, 38],
    [4, 11, 18, 25],
    [11, 18, 25, 32],
    [18, 25, 32, 39],
    [5, 12, 19, 26],
    [12, 19, 26, 33],
    [19, 26, 33, 40],
    [6, 13, 20, 27],
    [13, 20, 27, 34],
    [20, 27, 34, 41],

    // Diagonales montantes (haut-gauche vers bas-droite)
    [3, 9, 15, 21],
    [4, 10, 16, 22],
    [5, 11, 17, 23],
    [6, 12, 18, 24],
    [10, 16, 22, 28],
    [11, 17, 23, 29],
    [12, 18, 24, 30],
    [13, 19, 25, 31],
    [17, 23, 29, 35],
    [18, 24, 30, 36],
    [19, 25, 31, 37],
    [20, 26, 32, 38],

    // Diagonales descendantes (haut-droite vers bas-gauche)
    [3, 11, 19, 27],
    [2, 10, 18, 26],
    [1, 9, 17, 25],
    [0, 8, 16, 24],
    [10, 18, 26, 34],
    [9, 17, 25, 33],
    [8, 16, 24, 32],
    [7, 15, 23, 31],
    [17, 25, 33, 41],
    [16, 24, 32, 40],
    [15, 23, 31, 39],
    [14, 22, 30, 38],
  ],

  // Stratégies avancées
  STRATEGIES: {
    // Créer une menace (3 en ligne avec possibilité de gagner)
    CREATE_THREAT: {
      description:
        "Créer une position avec 3 en ligne et possibilité de gagner",
      priority: 3,
    },

    // Bloquer une menace
    BLOCK_THREAT: {
      description: "Empêcher l'adversaire de créer une menace",
      priority: 4,
    },

    // Forcer l'adversaire à bloquer
    FORCE_BLOCK: {
      description: "Créer une menace qui force l'adversaire à bloquer",
      priority: 5,
    },

    // Jouer de manière défensive
    DEFENSIVE: {
      description:
        "Jouer de manière défensive quand pas d'opportunité d'attaque",
      priority: 6,
    },
  },

  // Configuration de l'algorithme minimax
  MINIMAX: {
    USE_ALPHA_BETA: true,
    MAX_DEPTH: 8,
    EVALUATION_FUNCTION: "POSITION_SCORE",
  },

  // Messages de debug
  DEBUG: {
    ENABLED: true,
    SHOW_PRIORITIES: true,
    SHOW_EVALUATION: true,
    SHOW_STRATEGY: true,
  },
};

// Fonctions utilitaires pour l'IA
export const IA_UTILS = {
  // Vérifier si une position est gagnante
  checkWin: (board, player) => {
    for (const line of IA_CONFIG.WINNING_LINES) {
      const [a, b, c, d] = line;
      if (
        board[a] === player &&
        board[b] === player &&
        board[c] === player &&
        board[d] === player
      ) {
        return line;
      }
    }
    return null;
  },

  // Obtenir les cases libres
  getEmptyCells: (board) => {
    return board
      .map((cell, index) => (cell === null ? index : -1))
      .filter((index) => index !== -1);
  },

  // Obtenir les coups valides (colonnes avec de la place)
  getValidMoves: (board) => {
    const validMoves = [];
    for (let col = 0; col < 7; col++) {
      const index = IA_UTILS.getLowestEmptyCell(board, col);
      if (index !== null) {
        validMoves.push(index);
      }
    }
    return validMoves;
  },

  // Obtenir la case la plus basse disponible dans une colonne
  getLowestEmptyCell: (board, col) => {
    for (let row = 5; row >= 0; row--) {
      const index = row * 7 + col;
      if (board[index] === null) {
        return index;
      }
    }
    return null; // Colonne pleine
  },

  // Évaluer la valeur d'une position
  evaluatePosition: (board, player) => {
    const opponent = player === "X" ? "O" : "X";
    let score = 0;

    // Vérifier les lignes gagnantes
    for (const line of IA_CONFIG.WINNING_LINES) {
      const [a, b, c, d] = line;
      const lineCells = [board[a], board[b], board[c], board[d]];

      const playerCount = lineCells.filter((cell) => cell === player).length;
      const opponentCount = lineCells.filter(
        (cell) => cell === opponent
      ).length;
      const emptyCount = lineCells.filter((cell) => cell === null).length;

      // Score pour les lignes complètes
      if (playerCount === 4) score += IA_CONFIG.SCORES.VICTORY;
      else if (opponentCount === 4) score -= IA_CONFIG.SCORES.VICTORY;
      // Score pour les lignes partielles
      else if (playerCount === 3 && emptyCount === 1) score += 1000;
      else if (opponentCount === 3 && emptyCount === 1) score -= 1000;
      else if (playerCount === 2 && emptyCount === 2) score += 100;
      else if (opponentCount === 2 && emptyCount === 2) score -= 100;
      else if (playerCount === 1 && emptyCount === 3) score += 10;
      else if (opponentCount === 1 && emptyCount === 3) score -= 10;
    }

    // Bonus pour les positions stratégiques
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 7; col++) {
        const index = row * 7 + col;
        if (board[index] === player) {
          if (col === IA_CONFIG.POSITIONS.CENTER) {
            score += IA_CONFIG.SCORES.CENTER;
          } else if (IA_CONFIG.POSITIONS.NEAR_CENTER.includes(col)) {
            score += IA_CONFIG.SCORES.NEAR_CENTER;
          } else if (IA_CONFIG.POSITIONS.EDGES.includes(col)) {
            score += IA_CONFIG.SCORES.EDGE;
          }
        }
      }
    }

    return score;
  },

  // Détecter les menaces (3 en ligne avec possibilité de gagner)
  detectThreats: (board, player) => {
    const threats = [];
    const validMoves = IA_UTILS.getValidMoves(board);

    for (const move of validMoves) {
      const testBoard = board.slice();
      testBoard[move] = player;

      // Vérifier si ce coup crée une menace
      for (const line of IA_CONFIG.WINNING_LINES) {
        const [a, b, c, d] = line;
        if (
          testBoard[a] === player &&
          testBoard[b] === player &&
          testBoard[c] === player &&
          testBoard[d] === player
        ) {
          threats.push(move);
          break;
        }
      }
    }

    return threats;
  },

  // Convertir index en coordonnées
  indexToCoordinates: (index) => {
    const row = Math.floor(index / 7);
    const col = index % 7;
    return `${row},${col}`;
  },

  // Convertir coordonnées en index
  coordinatesToIndex: (coordinates) => {
    const [row, col] = coordinates.split(",").map(Number);
    return row * 7 + col;
  },
};
