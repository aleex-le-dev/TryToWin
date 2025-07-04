/**
 * Données de démo pour les classements de jeux
 * Contient 50 joueurs fictifs avec des scores variés
 * Utilisé dans scoreService.js pour créer des classements réalistes
 */

export const DEMO_PLAYERS = [
  { name: "AlexGamer", points: 2847, country: "FR" },
  { name: "MariePro", points: 2654, country: "CA" },
  { name: "PierreMaster", points: 2489, country: "FR" },
  { name: "SophieChamp", points: 2341, country: "BE" },
  { name: "LucasStar", points: 2198, country: "CH" },
  { name: "EmmaQueen", points: 2056, country: "GB" },
  { name: "ThomasElite", points: 1923, country: "DE" },
  { name: "JuliePro", points: 1789, country: "FR" },
  { name: "MaxGaming", points: 1654, country: "US" },
  { name: "SarahWinner", points: 1521, country: "AU" },
  { name: "DavidChamp", points: 1387, country: "ES" },
  { name: "LisaElite", points: 1254, country: "IT" },
  { name: "PaulMaster", points: 1121, country: "NL" },
  { name: "AnnaPro", points: 987, country: "SE" },
  { name: "KevinStar", points: 854, country: "NO" },
  { name: "ClaraWinner", points: 721, country: "DK" },
  { name: "MarcElite", points: 588, country: "FI" },
  { name: "NinaChamp", points: 455, country: "PL" },
  { name: "LeoGaming", points: 322, country: "CZ" },
  { name: "ZoePro", points: 289, country: "AT" },
  { name: "HugoStar", points: 256, country: "HU" },
  { name: "EvaWinner", points: 223, country: "RO" },
  { name: "RaphaelElite", points: 190, country: "BG" },
  { name: "CamilleChamp", points: 157, country: "HR" },
  { name: "AntoineGaming", points: 124, country: "SI" },
  { name: "LouisePro", points: 91, country: "SK" },
  { name: "BaptisteStar", points: 78, country: "EE" },
  { name: "ChloeWinner", points: 65, country: "LV" },
  { name: "ArthurElite", points: 52, country: "LT" },
  { name: "JadeChamp", points: 39, country: "MT" },
  { name: "NathanGaming", points: 26, country: "CY" },
  { name: "AlicePro", points: 23, country: "LU" },
  { name: "VictorStar", points: 20, country: "IE" },
  { name: "InesWinner", points: 17, country: "PT" },
  { name: "RomainElite", points: 14, country: "GR" },
  { name: "LolaChamp", points: 11, country: "HR" },
  { name: "GabrielGaming", points: 8, country: "SI" },
  { name: "MayaPro", points: 5, country: "SK" },
  { name: "LouisStar", points: 2, country: "EE" },
  { name: "ElenaWinner", points: 1, country: "LV" },
];

/**
 * Génère un classement de démo basé sur les points de l'utilisateur
 * @param {number} userPoints - Points de l'utilisateur actuel
 * @param {string} userUsername - Nom d'utilisateur actuel
 * @param {string} userId - ID de l'utilisateur actuel
 * @param {Object} userStats - Statistiques de l'utilisateur
 * @returns {Array} Classement avec l'utilisateur intégré
 */
export function generateDemoLeaderboard(
  userPoints,
  userUsername,
  userId,
  userStats = {}
) {
  // Créer une copie des joueurs de démo
  const demoPlayers = [...DEMO_PLAYERS];

  // Ajouter l'utilisateur actuel avec ses vrais points
  const userPlayer = {
    name: userUsername || "Vous",
    points: userPoints,
    country: "FR", // Pays par défaut
    isCurrentUser: true,
    userId: userId,
    ...userStats,
  };

  // Ajouter l'utilisateur à la liste
  demoPlayers.push(userPlayer);

  // Trier par points décroissants
  demoPlayers.sort((a, b) => b.points - a.points);

  // Trouver la position de l'utilisateur
  const userIndex = demoPlayers.findIndex((player) => player.isCurrentUser);

  // Si l'utilisateur n'est pas à la 30ème place, ajuster les points des autres joueurs
  if (userIndex !== 29) {
    // 29 = 30ème position (index 0-based)
    // Calculer les points nécessaires pour être 30ème
    const targetPoints = demoPlayers[28]?.points || 0; // Points du 29ème joueur
    const newUserPoints = targetPoints + 1; // Juste au-dessus du 29ème

    // Mettre à jour les points de l'utilisateur
    userPlayer.points = newUserPoints;

    // Retrier avec les nouveaux points
    demoPlayers.sort((a, b) => b.points - a.points);
  }

  // Convertir en format de classement
  return demoPlayers.map((player, index) => ({
    userId: player.userId || `demo_${index}`,
    username: player.name,
    gameId: "demo",
    totalPoints: player.points,
    win: player.win || Math.floor(player.points / 10),
    draw: player.draw || Math.floor(player.points / 20),
    lose: player.lose || Math.floor(player.points / 30),
    totalGames: player.totalGames || Math.floor(player.points / 5),
    winRate:
      player.winRate ||
      Math.floor(
        (Math.floor(player.points / 10) / Math.floor(player.points / 5)) * 100
      ),
    isCurrentUser: player.isCurrentUser || false,
    country: player.country,
  }));
}

/**
 * Calcule le rang d'un utilisateur dans le classement de démo
 * @param {number} userPoints - Points de l'utilisateur
 * @returns {Object} {rank: number, total: number}
 */
export function calculateDemoRank(userPoints) {
  // Trier tous les joueurs (démo + utilisateur) par points décroissants
  const allPlayers = [...DEMO_PLAYERS, { points: userPoints }];
  allPlayers.sort((a, b) => b.points - a.points);

  // Trouver la position de l'utilisateur
  const rank =
    allPlayers.findIndex((player) => player.points === userPoints) + 1;
  const total = allPlayers.length;

  return { rank, total };
}
