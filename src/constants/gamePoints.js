/**
 * Configuration des points attribués pour chaque jeu selon le résultat.
 * Utilisé pour le calcul du classement et la gestion des scores.
 * Seuls les jeux jouables contre une IA sont conservés.
 */
export const GAME_POINTS = {
  Morpion: {
    win: 10,
    draw: 3,
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
