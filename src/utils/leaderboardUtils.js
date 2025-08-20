/**
 * Génère un classement à partir d'une liste de joueurs et de l'utilisateur connecté.
 * Trie par points décroissants, gère les égalités de rang et place l'utilisateur connecté.
 *
 * @param {Array} players - Liste des joueurs
 * @param {Object} user - Utilisateur connecté
 * @param {Object} userStats - Statistiques utilisateur
 * @param {string} userCountry - Code pays utilisateur
 * @returns {Array} Classement complet avec rangs
 */
export function generateLeaderboard(
  players,
  user = null,
  userStats = {},
  userCountry = "FR"
) {
  try {
    console.log("[LEADERBOARD] generateLeaderboard input", {
      playersCount: Array.isArray(players) ? players.length : 0,
      hasUser: !!user,
      userStats: {
        totalPoints: userStats?.totalPoints || 0,
        totalGames: userStats?.totalGames || 0,
        win: userStats?.win || 0,
      },
      userCountry,
    });
  } catch {}
  let allPlayers = [...players];

  // Ajouter l'utilisateur connecté avec ses vraies données
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

    };

    // Retirer tout doublon éventuel
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

  // Attribution des rangs pour classement dense (même rang pour même points)
  let rank = 1;
  let prevPoints = null;

  allPlayers.forEach((player) => {
    if (prevPoints !== null && player.points !== prevPoints) {
      rank++;
    }
    player.rank = rank;
    prevPoints = player.points;
  });

  // Mapping final pour compatibilité avec l'affichage
  const mapped = allPlayers.map((player, index) => ({
    userId: player.userId || `player_${index}`,
    username: player.name,
    gameId: player.gameId || "demo",
    totalPoints: player.points,
    rank: player.rank,
    win: player.win || 0,
    draw: player.draw || 0,
    lose: player.lose || 0,
    totalGames: player.totalGames || 0,
    winRate: player.isCurrentUser
      ? player.winRate
      : (player.totalGames > 0 ? Math.round((player.win / player.totalGames) * 100) : 0),
    isCurrentUser: player.isCurrentUser || false,
    country: player.country,
    currentStreak: player.isCurrentUser ? player.currentStreak : 0,

  }));
  try {
    console.log("[LEADERBOARD] generateLeaderboard output", {
      count: mapped.length,
      sample: mapped.slice(0, 3).map((p) => ({
        userId: p.userId,
        totalPoints: p.totalPoints,
        win: p.win,
        totalGames: p.totalGames,
        isCurrentUser: p.isCurrentUser,
      })),
    });
  } catch {}
  return mapped;
}
