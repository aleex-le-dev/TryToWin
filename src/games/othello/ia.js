import { OTHELLO_IA_CONFIG } from "./iaConfig";

const BOARD_SIZE = 8;
const MAX_DEPTH = OTHELLO_IA_CONFIG.MAX_DEPTH;
const PLAYER = "X"; // Humain
const AI = "O"; // IA
const W = OTHELLO_IA_CONFIG.WEIGHTS;

const DIRECTIONS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

function evaluate(board, player) {
  let score = 0;
  let aiCount = 0,
    playerCount = 0,
    aiCoins = 0,
    playerCoins = 0,
    aiEdge = 0,
    playerEdge = 0,
    aiAdjCoin = 0,
    playerAdjCoin = 0,
    aiCenter = 0,
    playerCenter = 0,
    aiChain = 0,
    playerChain = 0;
  for (let i = 0; i < 64; i++) {
    if (board[i] === AI) {
      aiCount++;
      if (OTHELLO_IA_CONFIG.COINS.includes(i)) aiCoins++;
      if (OTHELLO_IA_CONFIG.utils.isEdge(i)) aiEdge++;
      if (OTHELLO_IA_CONFIG.utils.isAdjacentToCoin(i)) aiAdjCoin++;
      if (OTHELLO_IA_CONFIG.utils.isCenter(i)) aiCenter++;
      aiChain += OTHELLO_IA_CONFIG.utils.isChain(board, i, AI);
    }
    if (board[i] === PLAYER) {
      playerCount++;
      if (OTHELLO_IA_CONFIG.COINS.includes(i)) playerCoins++;
      if (OTHELLO_IA_CONFIG.utils.isEdge(i)) playerEdge++;
      if (OTHELLO_IA_CONFIG.utils.isAdjacentToCoin(i)) playerAdjCoin++;
      if (OTHELLO_IA_CONFIG.utils.isCenter(i)) playerCenter++;
      playerChain += OTHELLO_IA_CONFIG.utils.isChain(board, i, PLAYER);
    }
  }
  // Coins
  score += W.COINS * (aiCoins - playerCoins);
  // Bords
  score += W.EDGE * (aiEdge - playerEdge);
  // Cases adjacentes aux coins
  score += W.ADJACENT_TO_COIN * (aiAdjCoin - playerAdjCoin);
  // Centre
  score += W.CENTER * (aiCenter - playerCenter);
  // Parité
  score += W.PARITY * OTHELLO_IA_CONFIG.utils.parity(board, AI);
  // Minimisation (début)
  score += W.MINIMIZE * OTHELLO_IA_CONFIG.utils.minimize(board, AI);
  // Chaînes
  score += W.CHAIN * (aiChain - playerChain);
  // Flexibilité (mobilité)
  score += W.FLEXIBILITY * OTHELLO_IA_CONFIG.utils.flexibility(board, AI);
  // Anticipation (bloquer l'adversaire)
  score +=
    W.ANTICIPATION *
    OTHELLO_IA_CONFIG.utils.anticipation(board, AI, getValidMoves);
  // Beaucoup de pions en fin de partie
  score += W.MAX_PIECES_END * OTHELLO_IA_CONFIG.utils.maxPiecesEnd(board, AI);
  // Stoner trap
  if (OTHELLO_IA_CONFIG.utils.stonerTrap(board, AI)) score += W.STONER_TRAP;
  return score;
}

function getValidMoves(board, player) {
  const moves = [];
  for (let i = 0; i < 64; i++) {
    if (board[i] === null && isValidMove(board, i, player)) moves.push(i);
  }
  return moves;
}

function isValidMove(board, index, player) {
  const row = Math.floor(index / 8);
  const col = index % 8;
  const opponent = player === "X" ? "O" : "X";
  for (const [dx, dy] of DIRECTIONS) {
    let x = row + dx,
      y = col + dy,
      found = false;
    let count = 0;
    while (x >= 0 && x < 8 && y >= 0 && y < 8) {
      const idx = x * 8 + y;
      if (board[idx] === opponent) {
        found = true;
        count++;
        x += dx;
        y += dy;
      } else break;
    }
    if (found && count > 0 && x >= 0 && x < 8 && y >= 0 && y < 8) {
      const idx = x * 8 + y;
      if (board[idx] === player) return true;
    }
  }
  return false;
}

function playMove(board, index, player) {
  const newBoard = board.slice();
  newBoard[index] = player;
  const row = Math.floor(index / 8);
  const col = index % 8;
  const opponent = player === "X" ? "O" : "X";
  for (const [dx, dy] of DIRECTIONS) {
    let x = row + dx,
      y = col + dy,
      toFlip = [];
    while (x >= 0 && x < 8 && y >= 0 && y < 8) {
      const idx = x * 8 + y;
      if (board[idx] === opponent) {
        toFlip.push(idx);
        x += dx;
        y += dy;
      } else break;
    }
    if (toFlip.length > 0 && x >= 0 && x < 8 && y >= 0 && y < 8) {
      const idx = x * 8 + y;
      if (board[idx] === player) {
        for (const f of toFlip) newBoard[f] = player;
      }
    }
  }
  return newBoard;
}

function minimax(board, depth, maximizing, alpha, beta) {
  const player = maximizing ? AI : PLAYER;
  const moves = getValidMoves(board, player);
  if (depth === 0 || moves.length === 0) return [evaluate(board, AI), null];
  let bestMove = null;
  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newBoard = playMove(board, move, AI);
      const [evalScore] = minimax(newBoard, depth - 1, false, alpha, beta);
      if (evalScore > maxEval) {
        maxEval = evalScore;
        bestMove = move;
      }
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return [maxEval, bestMove];
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newBoard = playMove(board, move, PLAYER);
      const [evalScore] = minimax(newBoard, depth - 1, true, alpha, beta);
      if (evalScore < minEval) {
        minEval = evalScore;
        bestMove = move;
      }
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return [minEval, bestMove];
  }
}

export async function getIaMove(boardState) {
  const [_score, move] = minimax(
    boardState,
    MAX_DEPTH,
    true,
    -Infinity,
    Infinity
  );
  if (move === null) return null;
  const row = Math.floor(move / 8);
  const col = move % 8;
  return `${row},${col}`;
}
