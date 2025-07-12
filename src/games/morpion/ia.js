// IA simple pour le morpion sans API
export async function getIaMove(boardState) {
  console.log("🎯 IA SIMPLE: Calcul du meilleur coup");

  // Trouver toutes les cases libres
  const casesLibres = [];
  for (let i = 0; i < boardState.length; i++) {
    if (boardState[i] === null) {
      casesLibres.push(i);
    }
  }

  console.log("🎯 IA SIMPLE: Cases libres:", casesLibres);

  // Priorité 1: Gagner si possible
  for (const index of casesLibres) {
    const plateauTest = boardState.slice();
    plateauTest[index] = "O";
    if (verifierGagnant(plateauTest) === "O") {
      console.log("🎯 IA SIMPLE: Coup gagnant trouvé à l'index", index);
      return convertirIndexEnCoordonnees(index);
    }
  }

  // Priorité 2: Bloquer le joueur
  for (const index of casesLibres) {
    const plateauTest = boardState.slice();
    plateauTest[index] = "X";
    if (verifierGagnant(plateauTest) === "X") {
      console.log("🎯 IA SIMPLE: Blocage du joueur à l'index", index);
      return convertirIndexEnCoordonnees(index);
    }
  }

  // Priorité 3: Jouer au centre
  if (boardState[4] === null) {
    console.log("🎯 IA SIMPLE: Jouer au centre");
    return "1,1";
  }

  // Priorité 4: Jouer dans un coin
  const coins = [0, 2, 6, 8];
  for (const coin of coins) {
    if (boardState[coin] === null) {
      console.log("🎯 IA SIMPLE: Jouer dans un coin à l'index", coin);
      return convertirIndexEnCoordonnees(coin);
    }
  }

  // Priorité 5: Jouer n'importe où
  const coupAleatoire =
    casesLibres[Math.floor(Math.random() * casesLibres.length)];
  console.log("🎯 IA SIMPLE: Coup aléatoire à l'index", coupAleatoire);
  return convertirIndexEnCoordonnees(coupAleatoire);
}

function verifierGagnant(cases) {
  const lignesGagnantes = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // horizontales
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // verticales
    [0, 4, 8],
    [2, 4, 6], // diagonales
  ];

  for (const [a, b, c] of lignesGagnantes) {
    if (cases[a] && cases[a] === cases[b] && cases[a] === cases[c]) {
      return cases[a];
    }
  }
  return null;
}

function convertirIndexEnCoordonnees(index) {
  const ligne = Math.floor(index / 3);
  const colonne = index % 3;
  return `${ligne},${colonne}`;
}
