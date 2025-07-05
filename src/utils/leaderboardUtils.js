/**
 * Génère un classement à partir d'une liste de joueurs (fictifs ou réels) et de l'utilisateur connecté
 * - Trie par points décroissants
 * - Gère les égalités de rang (classement 1,2,2,4…)
 * - Place l'utilisateur connecté dans le classement avec ses vraies données
 * - En cas d'égalité, l'utilisateur connecté est affiché en premier dans le groupe
 * - Tri secondaire par nom
 *
 * @param {Array} players - Liste des joueurs (objets {name, points, country, ...})
 * @param {Object} user - Utilisateur connecté (optionnel)
 * @param {Object} userStats - Statistiques utilisateur (optionnel)
 * @param {string} userCountry - Code pays utilisateur (optionnel)
 * @returns {Array} Classement complet avec rangs et égalités
 */
export function generateLeaderboard(
  players,
  user = null,
  userStats = {},
  userCountry = "FR"
) {
  let allPlayers = [...players];

  // Ajouter l'utilisateur connecté avec ses vraies données si fourni
  if (user) {
    const userPlayer = {
      name: user.displayName || user.email || "Vous",
      points: userStats.totalPoints || 0,
      country: userCountry,
      isCurrentUser: true,
      userId: user.id,
      win: userStats.win || 0,
      draw: userStats.draw || 0,
      lose: userStats.lose || 0,
      totalGames: userStats.totalGames || 0,
      winRate: userStats.winRate || 0,
      totalPoints: userStats.totalPoints || 0,
      currentStreak: userStats.currentStreak || 0,
      bestTime: userStats.bestTime || null,
    };
    // Retirer tout doublon éventuel (même id)
    allPlayers = allPlayers.filter((p) => p.userId !== user.id);
    allPlayers.push(userPlayer);
  }

  // Tri principal : points décroissants, puis utilisateur connecté, puis nom
  allPlayers.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (a.isCurrentUser) return -1;
    if (b.isCurrentUser) return 1;
    return (a.name || "").localeCompare(b.name || "");
  });

  // Attribution des rangs pour classement dense strict (pas de saut)
  let prevPoints = null;
  let rank = 1;
  allPlayers.forEach((player, i) => {
    if (i === 0) {
      player.rank = rank;
    } else if (player.points !== prevPoints) {
      rank++;
      player.rank = rank;
    } else {
      player.rank = rank;
    }
    prevPoints = player.points;
    // Log détaillé pour debug
    console.log(
      `[RANKING] ${player.name} | points: ${player.points} | rang: #${player.rank}`
    );
  });

  // Mapping final pour compatibilité avec l'affichage
  return allPlayers.map((player, index) => ({
    userId: player.userId || `player_${index}`,
    username: player.name,
    gameId: player.gameId || "demo",
    totalPoints: player.points,
    rank: player.rank,
    win: player.isCurrentUser ? player.win : Math.floor(player.points / 10),
    draw: player.isCurrentUser ? player.draw : Math.floor(player.points / 20),
    lose: player.isCurrentUser ? player.lose : Math.floor(player.points / 30),
    totalGames: player.isCurrentUser
      ? player.totalGames
      : Math.floor(player.points / 5),
    winRate: player.isCurrentUser
      ? player.winRate
      : Math.floor(
          (Math.floor(player.points / 10) / Math.floor(player.points / 5)) * 100
        ),
    isCurrentUser: player.isCurrentUser || false,
    country: player.country,
    currentStreak: player.isCurrentUser ? player.currentStreak : 0,
    bestTime: player.isCurrentUser ? player.bestTime : null,
  }));
}
