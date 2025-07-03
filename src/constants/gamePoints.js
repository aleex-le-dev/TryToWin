/**
 * Configuration des points attribués pour chaque jeu selon le résultat.
 * Utilisé pour le calcul du classement et la gestion des scores.
 */
export const GAME_POINTS = {
  TicTacToe: {
    win: 10,
    draw: 3,
    lose: 0,
  },
  Memory: {
    win: 15,
    draw: 0,
    lose: 0,
  },
  Snake: {
    win: 20,
    draw: 0,
    lose: 0,
  },
  Tetris: {
    win: 25,
    draw: 0,
    lose: 0,
  },
  Puzzle: {
    win: 12,
    draw: 5,
    lose: 0,
  },
  Quiz: {
    win: 8,
    draw: 2,
    lose: 0,
  },
  Racing: {
    win: 18,
    draw: 0,
    lose: 0,
  },
  Strategy: {
    win: 30,
    draw: 10,
    lose: 0,
  },
};
