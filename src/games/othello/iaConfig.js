// Configuration stratégique IA Othello basée sur les astuces avancées (docteurslump 230623)

export const OTHELLO_IA_CONFIG = {
  MAX_DEPTH: 4,
  WEIGHTS: {
    COINS: 2000, // Prendre les coins
    EDGE: 200, // Prendre les bords
    ADJACENT_TO_COIN: -800, // Éviter les cases adjacentes aux coins
    CENTER: 100, // Contrôler le centre
    PARITY: 300, // Bonus si parité favorable
    MINIMIZE: 80, // Minimiser ses propres pions en début
    CHAIN: 60, // Créer des chaînes de pions
    FLEXIBILITY: 50, // Bonus pour mobilité/flexibilité
    ANTICIPATION: 40, // Bonus pour bloquer l'adversaire
    MAX_PIECES_END: 100, // Bonus pour avoir beaucoup de pions en fin de partie
    STONER_TRAP: -1000, // Malus si piège de Stoner détecté
    EARLY_EDGE: -200, // Malus si prise de bord trop tôt
    LATE_CLOSE: -150, // Malus si fermeture tardive
    LATE_OPEN: -150, // Malus si fermeture trop tôt
  },
  COINS: [0, 7, 56, 63],
  ADJACENT_TO_COIN: [
    1, 8, 9, 6, 14, 15, 48, 49, 57, 54, 55, 62, 47, 46, 58, 59,
  ],
  CENTER: [27, 28, 35, 36],
  utils: {
    isEdge: (idx) => {
      const row = Math.floor(idx / 8);
      const col = idx % 8;
      return row === 0 || row === 7 || col === 0 || col === 7;
    },
    isCenter: (idx) => [27, 28, 35, 36].includes(idx),
    isAdjacentToCoin: (idx) => OTHELLO_IA_CONFIG.ADJACENT_TO_COIN.includes(idx),
    isChain: (board, idx, player) => {
      // Compte le nombre de voisins du même joueur (ligne/colonne/diagonale)
      const row = Math.floor(idx / 8);
      const col = idx % 8;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const r = row + dr,
            c = col + dc;
          if (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (board[r * 8 + c] === player) count++;
          }
        }
      }
      return count;
    },
    parity: (board, player) => {
      // Parité : bonus si nombre de cases vides pair à la fin
      const empty = board.filter((x) => x === null).length;
      return empty % 2 === 0 ? 1 : -1;
    },
    stonerTrap: (board, player) => {
      // Détection simple du piège de Stoner (coin + case adjacente prise par l'adversaire)
      for (const coin of OTHELLO_IA_CONFIG.COINS) {
        if (board[coin] === null) {
          for (const adj of OTHELLO_IA_CONFIG.ADJACENT_TO_COIN) {
            if (Math.abs(coin - adj) === 1 || Math.abs(coin - adj) === 8) {
              if (board[adj] && board[adj] !== player) return true;
            }
          }
        }
      }
      return false;
    },
    flexibility: (board, player) => {
      // Nombre de coups légaux
      let moves = 0;
      for (let i = 0; i < 64; i++) {
        if (board[i] === null) moves++;
      }
      return moves;
    },
    anticipation: (board, player, getValidMoves) => {
      // Nombre de coups bloqués à l'adversaire
      const opponent = player === "X" ? "O" : "X";
      const oppMoves = getValidMoves(board, opponent).length;
      return -oppMoves;
    },
    minimize: (board, player) => {
      // Moins de pions = mieux en début
      return -board.filter((x) => x === player).length;
    },
    maxPiecesEnd: (board, player) => {
      // Plus de pions = mieux en fin
      return board.filter((x) => x === player).length;
    },
  },
};
