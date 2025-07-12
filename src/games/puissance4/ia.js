// IA pour Puissance4
// Utilise l'algorithme minimax avec élagage alpha-beta et stratégies wikiHow
import { IA_CONFIG, strategyHelpers } from "./iaConfig";

// Évaluation d'une position avec stratégies wikiHow
const evaluatePosition = (board, player) => {
  let score = 0;
  const opponent = player === 1 ? 2 : 1;

  // Évaluation de base (lignes horizontales, verticales, diagonales)
  score += evaluateBasicLines(board, player);

  // Stratégies wikiHow
  score += evaluateWikiHowStrategies(board, player);

  // Heuristiques spéciales
  score += evaluateHeuristics(board, player);

  return score;
};

// Évaluation de base des lignes
const evaluateBasicLines = (board, player) => {
  let score = 0;

  // Vérifier les lignes horizontales
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 4; col++) {
      const line = [
        board[row][col],
        board[row][col + 1],
        board[row][col + 2],
        board[row][col + 3],
      ];
      score += evaluateLine(line, player);
    }
  }

  // Vérifier les lignes verticales
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 7; col++) {
      const line = [
        board[row][col],
        board[row + 1][col],
        board[row + 2][col],
        board[row + 3][col],
      ];
      score += evaluateLine(line, player);
    }
  }

  // Vérifier les diagonales (haut-gauche vers bas-droite)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const line = [
        board[row][col],
        board[row + 1][col + 1],
        board[row + 2][col + 2],
        board[row + 3][col + 3],
      ];
      score += evaluateLine(line, player);
    }
  }

  // Vérifier les diagonales (haut-droite vers bas-gauche)
  for (let row = 0; row < 3; row++) {
    for (let col = 3; col < 7; col++) {
      const line = [
        board[row][col],
        board[row + 1][col - 1],
        board[row + 2][col - 2],
        board[row + 3][col - 3],
      ];
      score += evaluateLine(line, player);
    }
  }

  return score;
};

// Évaluer une ligne de 4 cases avec scores wikiHow
const evaluateLine = (line, player) => {
  const opponent = player === 1 ? 2 : 1;
  let playerCount = 0;
  let opponentCount = 0;
  let emptyCount = 0;

  for (const cell of line) {
    if (cell === player) playerCount++;
    else if (cell === opponent) opponentCount++;
    else emptyCount++;
  }

  // Si la ligne contient les deux joueurs, elle n'est pas intéressante
  if (playerCount > 0 && opponentCount > 0) return 0;

  // Scores basés sur wikiHow
  if (playerCount === 4) return IA_CONFIG.patternScores.immediateWin; // Victoire
  if (playerCount === 3 && emptyCount === 1)
    return IA_CONFIG.patternScores.createThreeInLine; // Presque gagnant
  if (playerCount === 2 && emptyCount === 2)
    return IA_CONFIG.patternScores.createTwoInLine; // Potentiel
  if (playerCount === 1 && emptyCount === 3) return 10; // Début de ligne

  // Bloquer l'adversaire (stratégie défensive wikiHow)
  if (opponentCount === 3 && emptyCount === 1)
    return IA_CONFIG.patternScores.blockThreeInLine; // Bloquer victoire
  if (opponentCount === 2 && emptyCount === 2)
    return IA_CONFIG.patternScores.blockTwoInLine; // Bloquer potentiel

  return 0;
};

// Évaluer les stratégies wikiHow
const evaluateWikiHowStrategies = (board, player) => {
  let score = 0;
  const opponent = player === 1 ? 2 : 1;

  // 1. Contrôler le centre (stratégie fondamentale wikiHow)
  score += evaluateCenterControl(board, player);

  // 2. Évaluer les positions stratégiques
  score += evaluateStrategicPositions(board, player);

  // 3. Évaluer les connexions multiples (attaque à plusieurs sens)
  score += evaluateMultipleConnections(board, player);

  // 4. Évaluer la disposition en "7"
  score += evaluateSevenFormation(board, player);

  // 5. Évaluer les attaques à sept sens
  score += evaluateSevenDirectionAttack(board, player);

  return score;
};

// Évaluer le contrôle du centre (stratégie wikiHow #1)
const evaluateCenterControl = (board, player) => {
  let score = 0;

  // Bonus pour les pions au centre
  for (let row = 0; row < 6; row++) {
    if (board[row][3] === player) {
      score += IA_CONFIG.strategies.controlCenter.bonusScore;
      // Bonus supplémentaire pour les pions plus bas
      score += (5 - row) * 10;
    }
  }

  return score;
};

// Évaluer les positions stratégiques
const evaluateStrategicPositions = (board, player) => {
  let score = 0;

  // Positions près du centre
  for (const pos of IA_CONFIG.strategicPositions.nearCenter) {
    if (board[pos.row][pos.col] === player) {
      score += pos.score;
    }
  }

  // Positions diagonales
  for (const pos of IA_CONFIG.strategicPositions.diagonalPositions) {
    if (board[pos.row][pos.col] === player) {
      score += pos.score;
    }
  }

  return score;
};

// Évaluer les connexions multiples (attaque à plusieurs sens)
const evaluateMultipleConnections = (board, player) => {
  let score = 0;

  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      if (board[row][col] === player) {
        const connections = strategyHelpers.countConnections(
          board,
          row,
          col,
          player
        );
        if (connections >= 2) {
          score += IA_CONFIG.strategies.multiDirectionAttack.bonusScore;
        }
      }
    }
  }

  return score;
};

// Évaluer la disposition en "7" (stratégie wikiHow)
const evaluateSevenFormation = (board, player) => {
  let score = 0;

  // Chercher des patterns en "7" dans toutes les directions
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 6; col++) {
      // Pattern "7" horizontal + diagonal
      if (
        board[row][col] === player &&
        board[row][col + 1] === player &&
        board[row][col + 2] === player &&
        board[row + 1][col + 2] === player
      ) {
        score += IA_CONFIG.strategies.sevenFormation.bonusScore;
      }

      // Pattern "7" inversé
      if (
        board[row][col] === player &&
        board[row][col + 1] === player &&
        board[row][col + 2] === player &&
        board[row + 1][col] === player
      ) {
        score += IA_CONFIG.strategies.sevenFormation.bonusScore;
      }
    }
  }

  return score;
};

// Évaluer les attaques à sept sens (stratégie avancée wikiHow)
const evaluateSevenDirectionAttack = (board, player) => {
  let score = 0;

  // Cette stratégie nécessite une position très spécifique
  // Vérifier si on a les positions clés pour une attaque à sept sens
  const keyPositions = [
    { row: 5, col: 3 }, // Centre bas
    { row: 4, col: 2 },
    { row: 4, col: 4 }, // Deuxième rangée
    { row: 3, col: 1 },
    { row: 3, col: 3 },
    { row: 3, col: 5 }, // Troisième rangée
    { row: 2, col: 3 },
    { row: 1, col: 3 }, // Colonne centrale
  ];

  let controlledPositions = 0;
  for (const pos of keyPositions) {
    if (board[pos.row][pos.col] === player) {
      controlledPositions++;
    }
  }

  if (controlledPositions >= 6) {
    score += IA_CONFIG.strategies.sevenDirectionAttack.bonusScore;
  }

  return score;
};

// Évaluer les heuristiques spéciales
const evaluateHeuristics = (board, player) => {
  let score = 0;

  if (IA_CONFIG.heuristics.avoidDangerousGaps.enabled) {
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 7; col++) {
        if (board[row][col] === player) {
          if (strategyHelpers.createsDangerousGap(board, row, col)) {
            score += IA_CONFIG.heuristics.avoidDangerousGaps.penalty;
          }
        }
      }
    }
  }

  if (IA_CONFIG.heuristics.heightEvaluation.enabled) {
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 7; col++) {
        if (board[row][col] === player) {
          const height = strategyHelpers.getHeight(row);
          score +=
            height * IA_CONFIG.heuristics.heightEvaluation.penaltyPerHeight;
        }
      }
    }
  }

  return score;
};

// Vérifier si un coup gagne
const checkWin = (board, row, col, player) => {
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

    if (count >= 4) return true;
  }
  return false;
};

// Obtenir la ligne la plus basse disponible dans une colonne
const getLowestEmptyCell = (board, col) => {
  for (let row = 5; row >= 0; row--) {
    if (board[row][col] === null) return row;
  }
  return -1;
};

// Vérifier si une colonne est pleine
const isColumnFull = (board, col) => {
  return board[0][col] !== null;
};

// Obtenir tous les coups possibles
const getValidMoves = (board) => {
  const moves = [];
  for (let col = 0; col < 7; col++) {
    if (!isColumnFull(board, col)) {
      moves.push(col);
    }
  }
  return moves;
};

// Calculer la profondeur adaptative selon la phase de jeu
const getAdaptiveDepth = (board) => {
  const totalMoves = countTotalMoves(board);

  if (totalMoves < 10) return IA_CONFIG.minimaxConfig.adaptiveDepth.earlyGame;
  if (totalMoves < 20) return IA_CONFIG.minimaxConfig.adaptiveDepth.midGame;
  return IA_CONFIG.minimaxConfig.adaptiveDepth.lateGame;
};

// Compter le nombre total de coups joués
const countTotalMoves = (board) => {
  let count = 0;
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      if (board[row][col] !== null) count++;
    }
  }
  return count;
};

// Algorithme minimax avec élagage alpha-beta amélioré
const minimax = (board, depth, alpha, beta, maximizingPlayer, player) => {
  const opponent = player === 1 ? 2 : 1;

  // Conditions d'arrêt
  if (depth === 0) {
    return evaluatePosition(board, player) - evaluatePosition(board, opponent);
  }

  const validMoves = getValidMoves(board);
  if (validMoves.length === 0) return 0;

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const col of validMoves) {
      const row = getLowestEmptyCell(board, col);
      if (row !== -1) {
        const newBoard = board.map((r) => [...r]);
        newBoard[row][col] = player;

        // Vérifier si ce coup gagne
        if (checkWin(newBoard, row, col, player)) {
          return IA_CONFIG.patternScores.immediateWin;
        }

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
        if (beta <= alpha && IA_CONFIG.minimaxConfig.alphaBetaPruning) break; // Élagage beta
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const col of validMoves) {
      const row = getLowestEmptyCell(board, col);
      if (row !== -1) {
        const newBoard = board.map((r) => [...r]);
        newBoard[row][col] = opponent;

        // Vérifier si ce coup gagne
        if (checkWin(newBoard, row, col, opponent)) {
          return -IA_CONFIG.patternScores.immediateWin;
        }

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
        if (beta <= alpha && IA_CONFIG.minimaxConfig.alphaBetaPruning) break; // Élagage alpha
      }
    }
    return minEval;
  }
};

// Fonction principale pour obtenir le meilleur coup avec stratégies wikiHow
export const getIaMove = async (board, player = 2) => {
  try {
    const validMoves = getValidMoves(board);
    if (validMoves.length === 0) return null;

    // 1. Vérifier d'abord s'il y a un coup gagnant (priorité absolue)
    for (const col of validMoves) {
      const row = getLowestEmptyCell(board, col);
      if (row !== -1) {
        const newBoard = board.map((r) => [...r]);
        newBoard[row][col] = player;
        if (checkWin(newBoard, row, col, player)) {
          console.log("IA: coup gagnant direct détecté", col);
          return col;
        }
      }
    }

    // 2. Vérifier s'il faut bloquer l'adversaire (stratégie défensive wikiHow)
    const opponent = player === 1 ? 2 : 1;
    for (const col of validMoves) {
      const row = getLowestEmptyCell(board, col);
      if (row !== -1) {
        const newBoard = board.map((r) => [...r]);
        newBoard[row][col] = opponent;
        if (checkWin(newBoard, row, col, opponent)) {
          console.log("IA: blocage de victoire adverse", col);
          return col;
        }
      }
    }

    // 3. Empêcher toute défaite immédiate ET fork (double menace)
    let safeMoves = [];
    for (const col of validMoves) {
      const row = getLowestEmptyCell(board, col);
      if (row !== -1) {
        const newBoard = board.map((r) => [...r]);
        newBoard[row][col] = player;
        const opponentMoves = getValidMoves(newBoard);
        let danger = false;
        for (const oppCol of opponentMoves) {
          const oppRow = getLowestEmptyCell(newBoard, oppCol);
          if (oppRow !== -1) {
            const oppBoard = newBoard.map((r) => [...r]);
            oppBoard[oppRow][oppCol] = opponent;
            // Si le joueur gagne immédiatement après ce coup, ce coup de l'IA est interdit
            if (checkWin(oppBoard, oppRow, oppCol, opponent)) {
              danger = true;
              console.log(
                "IA: coup interdit (danger immédiat)",
                col,
                "car joueur gagne en jouant",
                oppCol
              );
              break;
            }
            // Fork/double menace : simuler tous les coups de l'IA après la réponse du joueur
            let forkCount = 0;
            const iaMovesAfter = getValidMoves(oppBoard);
            for (const iaCol of iaMovesAfter) {
              const iaRow = getLowestEmptyCell(oppBoard, iaCol);
              if (iaRow !== -1) {
                const iaBoard = oppBoard.map((r) => [...r]);
                iaBoard[iaRow][iaCol] = player;
                // Après ce coup de l'IA, le joueur a-t-il encore une victoire immédiate ?
                const oppMovesAfter = getValidMoves(iaBoard);
                for (const oppCol2 of oppMovesAfter) {
                  const oppRow2 = getLowestEmptyCell(iaBoard, oppCol2);
                  if (oppRow2 !== -1) {
                    const oppBoard2 = iaBoard.map((r) => [...r]);
                    oppBoard2[oppRow2][oppCol2] = opponent;
                    if (checkWin(oppBoard2, oppRow2, oppCol2, opponent)) {
                      forkCount++;
                    }
                  }
                }
              }
            }
            if (forkCount >= 2) {
              danger = true;
              console.log(
                "IA: coup interdit (fork/double menace)",
                col,
                "car joueur peut forker après",
                oppCol
              );
              break;
            }
          }
        }
        if (!danger) safeMoves.push(col);
      }
    }
    if (safeMoves.length > 0) {
      console.log("IA: coups sûrs trouvés", safeMoves);
      return safeMoves[0];
    }
    console.log("IA: aucun coup sûr, je joue aléatoirement");
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  } catch (error) {
    const validMoves = getValidMoves(board);
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }
};
