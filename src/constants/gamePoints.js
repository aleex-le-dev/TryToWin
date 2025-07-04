/**
 * Configuration des points attribués pour chaque jeu selon le résultat.
 */
export const GAME_POINTS = {
  Puissance4: {
    win: 10,
    draw: 3,
    lose: 0,
  },
  Othello: {
    win: 12,
    draw: 4,
    lose: 0,
  },
  Morpion: {
    win: 8,
    draw: 2,
    lose: 0,
  },
  Pong: {
    win: 15,
    draw: 5,
    lose: 0,
  },
};

// Configuration du multiplicateur de points par série (par tranche de 5, +10% à chaque fois)
export const SERIE_MULTIPLIERS = [
  { min: 1, max: 5, multiplier: 0.1 }, // +10% pour 1 à 5
  { min: 6, max: 10, multiplier: 0.2 }, // +20% pour 6 à 10
  { min: 11, max: 15, multiplier: 0.3 }, // +30% pour 11 à 15
  { min: 16, max: 20, multiplier: 0.4 }, // +40% pour 16 à 20
  { min: 21, max: 25, multiplier: 0.5 }, // +50% pour 21 à 25
  { min: 26, max: 30, multiplier: 0.6 }, // +60% pour 26 à 30
  { min: 31, max: 35, multiplier: 0.7 }, // +70% pour 31 à 35
  { min: 36, max: 40, multiplier: 0.8 }, // +80% pour 36 à 40
  { min: 41, max: 45, multiplier: 0.9 }, // +90% pour 41 à 45
  { min: 46, max: Infinity, multiplier: 1.0 }, // +100% au-delà de 45
];

export function getSerieMultiplier(streak) {
  for (const tranche of SERIE_MULTIPLIERS) {
    if (streak >= tranche.min && streak <= tranche.max) {
      return tranche.multiplier;
    }
  }
  return 0;
}
