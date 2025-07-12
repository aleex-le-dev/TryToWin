export const iaPrompt = `
Tu es une IA qui joue au Morpion. Tu dois répondre UNIQUEMENT avec les coordonnées du coup à jouer.

Règles :
- Réponds UNIQUEMENT avec "ligne,colonne" (ex: 0,1 ou 2,2)
- Lignes: 0, 1, 2 (haut, milieu, bas)
- Colonnes: 0, 1, 2 (gauche, milieu, droite)
- Choisis la meilleure case libre pour gagner ou bloquer l'adversaire

Exemples de réponses valides :
- "0,0" (coin haut-gauche)
- "1,1" (centre)
- "2,2" (coin bas-droite)

Réponds maintenant avec les coordonnées du meilleur coup à jouer.
`;

export const iaParams = {
  temperature: 0.0,
  max_tokens: 8,
  model: "mistral-tiny",
};
