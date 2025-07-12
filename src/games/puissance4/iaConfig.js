// Configuration de l'IA pour Puissance 4
// Basée sur les stratégies de https://fr.wikihow.com/gagner-une-partie-de-Puissance-4

export const IA_CONFIG = {
  // Stratégies prioritaires selon wikiHow
  strategies: {
    // 1. Contrôler le centre (stratégie fondamentale)
    controlCenter: {
      priority: 1000,
      description:
        "Contrôler le centre de la grille pour maximiser les opportunités",
      centerColumns: [3], // Colonne centrale (0-indexed)
      bonusScore: 50,
    },

    // 2. Bloquer l'adversaire (défense)
    blockOpponent: {
      priority: 900,
      description: "Empêcher l'adversaire de gagner",
      immediateWinBlock: 5000,
      potentialWinBlock: 500,
    },

    // 3. Créer des opportunités de victoire (attaque)
    createWinningOpportunities: {
      priority: 800,
      description: "Créer des séries de 3 pions alignés",
      threeInLine: 1000,
      twoInLine: 100,
    },

    // 4. Attaque à plusieurs sens
    multiDirectionAttack: {
      priority: 700,
      description: "Créer des menaces dans plusieurs directions",
      bonusScore: 200,
    },

    // 5. Disposition en "7"
    sevenFormation: {
      priority: 600,
      description:
        "Former un 7 avec les pions pour créer des opportunités multiples",
      bonusScore: 150,
    },

    // 6. Attaque à sept sens
    sevenDirectionAttack: {
      priority: 500,
      description: "Créer des menaces dans sept directions différentes",
      bonusScore: 300,
    },
  },

  // Positions stratégiques selon wikiHow
  strategicPositions: {
    // Centre de la grille (position la plus importante)
    center: {
      row: 5,
      col: 3,
      score: 100,
    },

    // Positions autour du centre
    nearCenter: [
      { row: 5, col: 2, score: 80 },
      { row: 5, col: 4, score: 80 },
      { row: 4, col: 3, score: 70 },
    ],

    // Positions pour créer des diagonales
    diagonalPositions: [
      { row: 5, col: 1, score: 60 },
      { row: 5, col: 5, score: 60 },
      { row: 4, col: 2, score: 50 },
      { row: 4, col: 4, score: 50 },
    ],
  },

  // Scores pour différents patterns
  patternScores: {
    // Victoire immédiate
    immediateWin: 1000000,

    // Bloquer victoire adverse
    blockOpponentWin: 50000,

    // Créer une série de 3
    createThreeInLine: 1000,

    // Bloquer série de 3 adverse
    blockThreeInLine: 500,

    // Créer une série de 2
    createTwoInLine: 100,

    // Bloquer série de 2 adverse
    blockTwoInLine: 50,

    // Position centrale
    centerPosition: 50,

    // Position stratégique
    strategicPosition: 30,
  },

  // Configuration de l'algorithme minimax
  minimaxConfig: {
    defaultDepth: 4,
    maxDepth: 6,
    alphaBetaPruning: true,

    // Profondeur adaptative selon la complexité
    adaptiveDepth: {
      earlyGame: 3, // Moins de 10 coups
      midGame: 4, // 10-20 coups
      lateGame: 5, // Plus de 20 coups
    },
  },

  // Heuristiques spéciales selon wikiHow
  heuristics: {
    // Éviter de créer des "trous vides" dangereux
    avoidDangerousGaps: {
      enabled: true,
      penalty: -100,
    },

    // Privilégier les coups qui créent des connexions multiples
    multipleConnections: {
      enabled: true,
      bonusPerConnection: 20,
    },

    // Évaluer la hauteur des pions (plus bas = mieux)
    heightEvaluation: {
      enabled: true,
      penaltyPerHeight: -5,
    },
  },

  // Messages de debug pour comprendre les décisions de l'IA
  debug: {
    enabled: true,
    logDecisions: true,
    logScores: true,
  },
};

// Fonctions utilitaires pour les stratégies
export const strategyHelpers = {
  // Vérifier si une position est au centre
  isCenterPosition: (row, col) => {
    return col === 3;
  },

  // Vérifier si une position est près du centre
  isNearCenter: (row, col) => {
    return col >= 2 && col <= 4 && row >= 4;
  },

  // Calculer la hauteur d'un pion (distance du bas)
  getHeight: (row) => {
    return 5 - row;
  },

  // Vérifier si un coup crée des connexions multiples
  countConnections: (board, row, col, player) => {
    let connections = 0;
    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
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
          board[newRow][newCol] === player
        ) {
          count++;
        } else break;
      }

      // Compter dans l'autre direction
      for (let i = 1; i < 4; i++) {
        const newRow = row - i * dx;
        const newCol = col - i * dy;
        if (
          newRow >= 0 &&
          newRow < 6 &&
          newCol >= 0 &&
          newCol < 7 &&
          board[newRow][newCol] === player
        ) {
          count++;
        } else break;
      }

      if (count >= 2) connections++;
    }

    return connections;
  },

  // Vérifier si un coup crée un "trou vide" dangereux
  createsDangerousGap: (board, row, col) => {
    // Un trou vide est dangereux s'il permet à l'adversaire de gagner
    if (row === 0) return false; // Pas de trou au-dessus

    // Vérifier si le trou au-dessus permet une victoire adverse
    const opponent = board[row][col] === 1 ? 2 : 1;
    const tempBoard = board.map((r) => [...r]);
    tempBoard[row - 1][col] = opponent;

    // Vérifier si l'adversaire peut gagner avec ce trou
    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];
    for (const [dx, dy] of directions) {
      let count = 1;

      for (let i = 1; i < 4; i++) {
        const newRow = row - 1 + i * dx;
        const newCol = col + i * dy;
        if (
          newRow >= 0 &&
          newRow < 6 &&
          newCol >= 0 &&
          newCol < 7 &&
          tempBoard[newRow][newCol] === opponent
        ) {
          count++;
        } else break;
      }

      for (let i = 1; i < 4; i++) {
        const newRow = row - 1 - i * dx;
        const newCol = col - i * dy;
        if (
          newRow >= 0 &&
          newRow < 6 &&
          newCol >= 0 &&
          newCol < 7 &&
          tempBoard[newRow][newCol] === opponent
        ) {
          count++;
        } else break;
      }

      if (count >= 4) return true;
    }

    return false;
  },
};
