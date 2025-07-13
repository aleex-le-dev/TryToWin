// IA avancée pour le Puissance 4 utilisant l'algorithme minimax
import { IA_CONFIG, IA_UTILS } from "./iaConfig";

// Algorithme minimax avec élagage alpha-beta
const minimax = (board, depth, alpha, beta, maximizingPlayer, player) => {
  const opponent = player === "X" ? "O" : "X";

  // Conditions d'arrêt
  if (depth === 0 || IA_UTILS.getEmptyCells(board).length === 0) {
    return IA_UTILS.evaluatePosition(board, player);
  }

  // Vérifier s'il y a déjà un gagnant
  const winLine = IA_UTILS.checkWin(board, player);
  if (winLine) return IA_CONFIG.SCORES.VICTORY;

  const winLineOpponent = IA_UTILS.checkWin(board, opponent);
  if (winLineOpponent) return IA_CONFIG.SCORES.DEFEAT;

  const validMoves = IA_UTILS.getValidMoves(board);

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of validMoves) {
      const newBoard = board.slice();
      newBoard[move] = player;
      const evaluation = minimax(
        newBoard,
        depth - 1,
        alpha,
        beta,
        false,
        player
      );
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break; // Élagage beta
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of validMoves) {
      const newBoard = board.slice();
      newBoard[move] = opponent;
      const evaluation = minimax(
        newBoard,
        depth - 1,
        alpha,
        beta,
        true,
        player
      );
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break; // Élagage alpha
    }
    return minEval;
  }
};

// Fonction principale pour obtenir le meilleur coup
export async function getIaMove(boardState) {
  console.log("🎯 IA AVANCÉE: Calcul du meilleur coup");

  const validMoves = IA_UTILS.getValidMoves(boardState);
  if (validMoves.length === 0) return null;

  // Priorité 1: Coup gagnant immédiat
  for (const index of validMoves) {
    const testBoard = boardState.slice();
    testBoard[index] = "O";
    if (IA_UTILS.checkWin(testBoard, "O")) {
      console.log("🎯 IA AVANCÉE: Coup gagnant trouvé à l'index", index);
      return IA_UTILS.indexToCoordinates(index);
    }
  }

  // Priorité 2: Bloquer la victoire de l'adversaire
  for (const index of validMoves) {
    const testBoard = boardState.slice();
    testBoard[index] = "X";
    if (IA_UTILS.checkWin(testBoard, "X")) {
      console.log("🎯 IA AVANCÉE: Blocage de l'adversaire à l'index", index);
      return IA_UTILS.indexToCoordinates(index);
    }
  }

  // Priorité 3: Créer une menace (3 en ligne avec possibilité de gagner)
  const threats = IA_UTILS.detectThreats(boardState, "O");
  if (threats.length > 0) {
    console.log("🎯 IA AVANCÉE: Création d'une menace à l'index", threats[0]);
    return IA_UTILS.indexToCoordinates(threats[0]);
  }

  // Priorité 4: Bloquer une menace de l'adversaire
  const opponentThreats = IA_UTILS.detectThreats(boardState, "X");
  if (opponentThreats.length > 0) {
    console.log(
      "🎯 IA AVANCÉE: Blocage d'une menace à l'index",
      opponentThreats[0]
    );
    return IA_UTILS.indexToCoordinates(opponentThreats[0]);
  }

  // Priorité 5: Jouer au centre UNIQUEMENT si le plateau est vide
  if (boardState.every((cell) => cell === null)) {
    const col = 3;
    const index = IA_UTILS.getLowestEmptyCell(boardState, col);
    if (index !== null && validMoves.includes(index)) {
      console.log("🎯 IA AVANCÉE: Premier coup au centre");
      return IA_UTILS.indexToCoordinates(index);
    }
  }

  // Utiliser minimax pour tous les autres coups
  let bestMove = validMoves[0];
  let bestValue = -Infinity;
  const depth = Math.min(IA_CONFIG.MINIMAX.MAX_DEPTH, validMoves.length);

  console.log("🎯 IA AVANCÉE: Utilisation de minimax avec profondeur", depth);

  for (const move of validMoves) {
    const testBoard = boardState.slice();
    testBoard[move] = "O";
    const value = minimax(
      testBoard,
      depth - 1,
      -Infinity,
      Infinity,
      false,
      "O"
    );

    if (value > bestValue) {
      bestValue = value;
      bestMove = move;
    }
  }

  console.log(
    "🎯 IA AVANCÉE: Meilleur coup trouvé à l'index",
    bestMove,
    "avec valeur",
    bestValue
  );
  return IA_UTILS.indexToCoordinates(bestMove);
}

// Fonction de debug pour afficher l'état du plateau
export function debugBoard(board) {
  if (!IA_CONFIG.DEBUG.ENABLED) return;

  console.log("🎯 IA AVANCÉE: État du plateau:");
  for (let row = 0; row < 6; row++) {
    let line = "";
    for (let col = 0; col < 7; col++) {
      const index = row * 7 + col;
      line += `${board[index] || " "} `;
    }
    console.log(line);
  }

  const validMoves = IA_UTILS.getValidMoves(board);
  console.log("🎯 IA AVANCÉE: Coups valides:", validMoves);

  const evaluation = IA_UTILS.evaluatePosition(board, "O");
  console.log("🎯 IA AVANCÉE: Évaluation de la position:", evaluation);
}
