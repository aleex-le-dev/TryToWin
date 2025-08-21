// Liste des jeux jouables contre une IA, utilisée pour l'affichage dans l'accueil et la navigation.

export const gamesData = [
  {
    id: "Puissance4",
    title: "Puissance 4",
    description: "Alignez 4 pions pour gagner",
    category: "Stratégie",
    image: require("../../assets/jeux/puissance4.png"),
    color: "#FF6B6B",
    gameType: "grid",
  },
  {
    id: "Othello",
    title: "Othello",
    description: "Retournez les pions adverses",
    category: "Stratégie",
    image: require("../../assets/jeux/othello.png"),
    color: "#4ECDC4",
    gameType: "grid",
  },
  {
    id: "Morpion",
    title: "Morpion",
    description: "3 en ligne pour gagner",
    category: "Logique",
    image: require("../../assets/jeux/morpion.png"),
    color: "#45B7D1",
    gameType: "grid",
  },
  {
    id: "Echec",
    title: "Échecs",
    description: "Affrontez l'IA sur un plateau d'échecs classique.",
    category: "Stratégie",
    image: "♟️",
    color: "#CD8D4E",
    gameType: "grid",
  },
];
