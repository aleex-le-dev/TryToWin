// IA avancée pour le Morpion utilisant l'algorithme minimax
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

  const validMoves = IA_UTILS.getEmptyCells(board);

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

  const emptyCells = IA_UTILS.getEmptyCells(boardState);
  if (emptyCells.length === 0) return null;

  // Priorité 1: Coup gagnant immédiat
  for (const index of emptyCells) {
    const testBoard = boardState.slice();
    testBoard[index] = "O";
    if (IA_UTILS.checkWin(testBoard, "O")) {
      console.log("🎯 IA AVANCÉE: Coup gagnant trouvé à l'index", index);
      return IA_UTILS.indexToCoordinates(index);
    }
  }

  // Priorité 2: Bloquer la victoire de l'adversaire
  for (const index of emptyCells) {
    const testBoard = boardState.slice();
    testBoard[index] = "X";
    if (IA_UTILS.checkWin(testBoard, "X")) {
      console.log("🎯 IA AVANCÉE: Blocage de l'adversaire à l'index", index);
      return IA_UTILS.indexToCoordinates(index);
    }
  }

  // Priorité 3: Créer une fourche
  const forks = IA_UTILS.detectForks(boardState, "O");
  if (forks.length > 0) {
    console.log("🎯 IA AVANCÉE: Création d'une fourche à l'index", forks[0]);
    return IA_UTILS.indexToCoordinates(forks[0]);
  }

  // Priorité 4: Bloquer une fourche de l'adversaire
  const opponentForks = IA_UTILS.detectForks(boardState, "X");
  if (opponentForks.length > 0) {
    console.log(
      "🎯 IA AVANCÉE: Blocage d'une fourche à l'index",
      opponentForks[0]
    );
    return IA_UTILS.indexToCoordinates(opponentForks[0]);
  }

  // Priorité 5: Jouer au centre
  if (boardState[IA_CONFIG.POSITIONS.CENTER] === null) {
    console.log("🎯 IA AVANCÉE: Jouer au centre");
    return IA_UTILS.indexToCoordinates(IA_CONFIG.POSITIONS.CENTER);
  }

  // Priorité 6: Utiliser minimax pour les coups complexes
  let bestMove = emptyCells[0];
  let bestValue = -Infinity;
  const depth = Math.min(IA_CONFIG.MINIMAX.MAX_DEPTH, emptyCells.length);

  console.log("🎯 IA AVANCÉE: Utilisation de minimax avec profondeur", depth);

  for (const move of emptyCells) {
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
  for (let i = 0; i < 9; i += 3) {
    console.log(
      `${board[i] || " "} | ${board[i + 1] || " "} | ${board[i + 2] || " "}`
    );
    if (i < 6) console.log("---------");
  }

  const emptyCells = IA_UTILS.getEmptyCells(board);
  console.log("🎯 IA AVANCÉE: Cases libres:", emptyCells);

  const evaluation = IA_UTILS.evaluatePosition(board, "O");
  console.log("🎯 IA AVANCÉE: Évaluation de la position:", evaluation);
}
