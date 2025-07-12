// Configuration de l'IA pour le Morpion
// Définit les stratégies et priorités pour jouer de manière optimale

export const IA_CONFIG = {
  // Profondeur de recherche pour l'algorithme minimax
  SEARCH_DEPTH: 9,

  // Scores pour l'évaluation des positions
  SCORES: {
    VICTORY: 1000000,
    DEFEAT: -1000000,
    DRAW: 0,
    CENTER: 3,
    CORNER: 2,
    EDGE: 1,
  },

  // Priorités des coups (du plus important au moins important)
  PRIORITIES: {
    WIN_MOVE: 1, // Coup gagnant immédiat
    BLOCK_MOVE: 2, // Bloquer la victoire de l'adversaire
    FORK_CREATE: 3, // Créer une fourche (2 possibilités de gagner)
    FORK_BLOCK: 4, // Bloquer une fourche de l'adversaire
    CENTER: 5, // Jouer au centre
    CORNER: 6, // Jouer dans un coin
    EDGE: 7, // Jouer sur un bord
    RANDOM: 8, // Coup aléatoire
  },

  // Positions stratégiques
  POSITIONS: {
    CENTER: 4,
    CORNERS: [0, 2, 6, 8],
    EDGES: [1, 3, 5, 7],
  },

  // Lignes gagnantes (combinaisons de 3 cases)
  WINNING_LINES: [
    [0, 1, 2], // horizontales
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6], // verticales
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8], // diagonales
    [2, 4, 6],
  ],

  // Stratégies avancées
  STRATEGIES: {
    // Créer une fourche (2 lignes gagnantes possibles)
    CREATE_FORK: {
      description: "Créer une position avec 2 possibilités de gagner",
      priority: 3,
    },

    // Bloquer une fourche
    BLOCK_FORK: {
      description: "Empêcher l'adversaire de créer une fourche",
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
    MAX_DEPTH: 9,
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
      const [a, b, c] = line;
      if (board[a] === player && board[b] === player && board[c] === player) {
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

  // Évaluer la valeur d'une position
  evaluatePosition: (board, player) => {
    const opponent = player === "X" ? "O" : "X";
    let score = 0;

    // Vérifier les lignes gagnantes
    for (const line of IA_CONFIG.WINNING_LINES) {
      const [a, b, c] = line;
      const lineCells = [board[a], board[b], board[c]];

      const playerCount = lineCells.filter((cell) => cell === player).length;
      const opponentCount = lineCells.filter(
        (cell) => cell === opponent
      ).length;
      const emptyCount = lineCells.filter((cell) => cell === null).length;

      // Score pour les lignes complètes
      if (playerCount === 3) score += IA_CONFIG.SCORES.VICTORY;
      else if (opponentCount === 3) score -= IA_CONFIG.SCORES.VICTORY;
      // Score pour les lignes partielles
      else if (playerCount === 2 && emptyCount === 1) score += 100;
      else if (opponentCount === 2 && emptyCount === 1) score -= 100;
      else if (playerCount === 1 && emptyCount === 2) score += 10;
      else if (opponentCount === 1 && emptyCount === 2) score -= 10;
    }

    // Bonus pour les positions stratégiques
    if (board[IA_CONFIG.POSITIONS.CENTER] === player)
      score += IA_CONFIG.SCORES.CENTER;

    for (const corner of IA_CONFIG.POSITIONS.CORNERS) {
      if (board[corner] === player) score += IA_CONFIG.SCORES.CORNER;
    }

    return score;
  },

  // Détecter les fourches
  detectForks: (board, player) => {
    const forks = [];
    const emptyCells = IA_UTILS.getEmptyCells(board);

    for (const cell of emptyCells) {
      const testBoard = board.slice();
      testBoard[cell] = player;

      let winCount = 0;
      for (const line of IA_CONFIG.WINNING_LINES) {
        const [a, b, c] = line;
        if (
          testBoard[a] === player &&
          testBoard[b] === player &&
          testBoard[c] === player
        ) {
          winCount++;
        }
      }

      if (winCount >= 2) {
        forks.push(cell);
      }
    }

    return forks;
  },

  // Convertir index en coordonnées
  indexToCoordinates: (index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    return `${row},${col}`;
  },

  // Convertir coordonnées en index
  coordinatesToIndex: (coordinates) => {
    const [row, col] = coordinates.split(",").map(Number);
    return row * 3 + col;
  },
};
