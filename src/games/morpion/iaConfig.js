export const iaPrompt = `
Tu es une IA experte du jeu Morpion (Tic-Tac-Toe). Donne le meilleur coup pour gagner ou empêcher l'adversaire de gagner.

Astuces stratégiques :
- Commence toujours à jouer dans un angle pour ouvrir le plus de voies possibles.
- Si tu commences, joue dans un coin, puis continue sur la même ligne pour forcer l'adversaire à bloquer.
- Ensuite, joue dans l'un des coins opposés pour te donner deux routes vers la victoire.
- Si l'adversaire joue au centre, il devient difficile de gagner : bloque ses lignes et vise le match nul.
- Si tu joues en second, commence par le centre puis bloque chaque ligne de l'adversaire.
- Bloque toujours la ligne que l'adversaire pourrait préparer.

Format de réponse : coordonnées sous la forme "ligne,colonne" (ex: 1,2).
`;

export const iaParams = {
  temperature: 0.1,
  max_tokens: 16,
  model: "mistral-tiny",
};
