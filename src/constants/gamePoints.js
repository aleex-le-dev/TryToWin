/**
 * Configuration des points attribués pour chaque jeu selon le résultat.
 */
export const GAME_POINTS = {
  Puissance4: {
    win: 10,
    draw: 3,
    lose: 1,
  },
  Othello: {
    win: 12,
    draw: 4,
    lose: 1,
  },
  Morpion: {
    win: 8,
    draw: 2,
    lose: 1,
  },

};

// Configuration du multiplicateur de points par série (bonus à partir de 5 victoires)
export const SERIE_MULTIPLIERS = [
  { min: 1, max: 4, multiplier: 0 }, // Pas de bonus pour 1 à 4
  { min: 5, max: 9, multiplier: 0.1 }, // +10% pour 5 à 9
  { min: 10, max: 14, multiplier: 0.2 }, // +20% pour 10 à 14
  { min: 15, max: 19, multiplier: 0.3 }, // +30% pour 15 à 19
  { min: 20, max: 24, multiplier: 0.4 }, // +40% pour 20 à 24
  { min: 25, max: 29, multiplier: 0.5 }, // +50% pour 25 à 29
  { min: 30, max: 34, multiplier: 0.6 }, // +60% pour 30 à 34
  { min: 35, max: 39, multiplier: 0.7 }, // +70% pour 35 à 39
  { min: 40, max: 44, multiplier: 0.8 }, // +80% pour 40 à 44
  { min: 45, max: 49, multiplier: 0.9 }, // +90% pour 45 à 49
  { min: 50, max: Infinity, multiplier: 1.0 }, // +100% au-delà de 50
];

export function getSerieMultiplier(streak) {
  for (const tranche of SERIE_MULTIPLIERS) {
    if (streak >= tranche.min && streak <= tranche.max) {
      return tranche.multiplier;
    }
  }
  return 0;
}
