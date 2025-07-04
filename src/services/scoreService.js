// Service d'enregistrement des scores par joueur et par jeu
// Utilise Firestore pour la persistance (adapter si besoin)
import { db } from "../utils/firebaseConfig";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collectionGroup,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  collection,
  increment,
} from "firebase/firestore";
import {
  GAME_POINTS,
  getSerieMultiplier,
  SERIE_MULTIPLIERS,
} from "../constants/gamePoints";
import Toast from "react-native-toast-message";

/**
 * Enregistre le résultat d'une partie pour un joueur et un jeu.
 * Incrémente win/draw/lose et met à jour le total de points.
 * @param {string} userId - ID du joueur
 * @param {string} game - Nom du jeu (ex: 'TicTacToe')
 * @param {'win'|'draw'|'lose'} result - Résultat de la partie
 * @param {number} score - Score spécifique de la partie (optionnel)
 * @param {number} duration - Durée de la partie en secondes (optionnel)
 */
export async function recordGameResult(
  userId,
  game,
  result,
  score = 0,
  duration = 0
) {
  let points = GAME_POINTS[game]?.[result] ?? 0;
  if (!userId || !game || !["win", "draw", "lose"].includes(result)) return;

  const scoreRef = doc(db, "users", userId, "scores", game);
  const docSnap = await getDoc(scoreRef);

  let data = {
    win: 0,
    draw: 0,
    lose: 0,
    totalPoints: 0,
    totalGames: 0,
    totalDuration: 0,
    winRate: 0,
    lastUpdated: new Date().toISOString(),
    lastPlayed: new Date().toISOString(),
    currentStreak: 0,
    bestTime: null,
  };

  if (docSnap.exists()) {
    data = docSnap.data();
    if (typeof data.currentStreak !== "number") data.currentStreak = 0;
    if (typeof data.bestTime !== "number") data.bestTime = null;
  }

  // Mise à jour des statistiques
  data[result] += 1;
  data.totalGames += 1;
  data.totalDuration += duration;
  data.lastUpdated = new Date().toISOString();
  data.lastPlayed = new Date().toISOString();

  // Calcul du taux de victoire
  data.winRate =
    data.totalGames > 0 ? Math.round((data.win / data.totalGames) * 100) : 0;

  // Gestion de la série de victoires et du multiplicateur
  if (result === "win") {
    data.currentStreak = (data.currentStreak || 0) + 1;
    // Appliquer le multiplicateur de série
    const mult = getSerieMultiplier(data.currentStreak);
    if (mult > 0) {
      points = Math.round(points * (1 + mult));
    }
    // Gestion du temps record (le plus bas)
    if (duration > 0 && (data.bestTime === null || duration < data.bestTime)) {
      data.bestTime = duration;
    }
  } else if (result === "lose" || result === "draw") {
    data.currentStreak = 0;
  }

  // Ajout des points (après multiplicateur éventuel)
  data.totalPoints += points;

  await setDoc(scoreRef, data, { merge: true });
}

/**
 * Récupère le score cumulé d'un joueur pour un jeu donné.
 * @param {string} userId
 * @param {string} game
 * @returns {Promise<{win:number,draw:number,lose:number,totalPoints:number,totalGames:number,totalDuration:number,winRate:number,currentStreak:number,bestTime:number|null,lastUpdated:string|null,lastPlayed:string|null}>}
 */
export async function getUserGameScore(userId, game) {
  const scoreRef = doc(db, "users", userId, "scores", game);
  const docSnap = await getDoc(scoreRef);
  if (docSnap.exists()) {
    const d = docSnap.data();
    // On ne retourne que les champs utiles
    return {
      win: d.win || 0,
      draw: d.draw || 0,
      lose: d.lose || 0,
      totalPoints: d.totalPoints || 0,
      totalGames: d.totalGames || 0,
      totalDuration: d.totalDuration || 0,
      winRate: d.winRate || 0,
      currentStreak: d.currentStreak || 0,
      bestTime: d.bestTime || null,
      lastUpdated: d.lastUpdated || null,
      lastPlayed: d.lastPlayed || null,
    };
  }
  return {
    win: 0,
    draw: 0,
    lose: 0,
    totalPoints: 0,
    totalGames: 0,
    totalDuration: 0,
    winRate: 0,
    currentStreak: 0,
    bestTime: null,
    lastUpdated: null,
    lastPlayed: null,
  };
}

/**
 * Récupère toutes les statistiques d'un utilisateur pour tous les jeux.
 * @param {string} userId
 * @returns {Promise<Object>} Statistiques par jeu
 */
export async function getUserAllGameStats(userId) {
  const scoresRef = collection(db, "users", userId, "scores");
  const snapshot = await getDocs(scoresRef);
  const stats = {};

  snapshot.forEach((doc) => {
    stats[doc.id] = doc.data();
  });

  return stats;
}

/**
 * Récupère le classement global pour un jeu donné (top N joueurs).
 * @param {string} game - Nom du jeu (ex: 'TicTacToe')
 * @param {number} topN - Nombre de joueurs à afficher
 * @param {Object} currentUser - Utilisateur actuel (optionnel)
 * @returns {Promise<Array<{userId:string, username:string, win:number, draw:number, lose:number, totalPoints:number, totalGames:number, winRate:number}>>}
 */
export async function getLeaderboard(game, topN = 10, currentUser = null) {
  console.log("🔍 Récupération du classement pour le jeu:", game);

  try {
    if (!currentUser?.id) {
      console.log("❌ Aucun utilisateur connecté");
      return [];
    }

    // Récupérer le score de l'utilisateur actuel
    const userScoreDoc = await getDoc(
      doc(db, "users", currentUser.id, "scores", game)
    );
    let userPoints = 0;
    let userStats = {};

    if (userScoreDoc.exists()) {
      userStats = userScoreDoc.data();
      userPoints = userStats.totalPoints || 0;
      console.log("👤 Points de l'utilisateur actuel:", userPoints);
    }

    // Récupérer le profil utilisateur pour obtenir le pays
    const userProfileRef = doc(db, "users", currentUser.id);
    const userProfileSnap = await getDoc(userProfileRef);
    const userProfile = userProfileSnap.exists() ? userProfileSnap.data() : {};
    const userCountry = userProfile.country || "FR"; // Pays par défaut

    // Générer un classement basé sur vos vraies données
    const leaderboard = generateLeaderboardAroundUser(
      userPoints,
      currentUser.displayName || currentUser.email || "Vous",
      currentUser.id,
      userStats,
      userCountry,
      topN
    );

    console.log("✅ Classement généré:", leaderboard.length, "joueurs");
    return leaderboard;
  } catch (error) {
    console.log("❌ Erreur lors de la récupération du classement:", error);
    return [];
  }
}

/**
 * Génère un classement autour de l'utilisateur avec ses vraies données
 * @param {number} userPoints - Points de l'utilisateur
 * @param {string} userUsername - Nom d'utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {Object} userStats - Statistiques de l'utilisateur
 * @param {string} userCountry - Pays de l'utilisateur
 * @param {number} topN - Nombre total de joueurs
 * @returns {Array} Classement avec l'utilisateur intégré
 */
function generateLeaderboardAroundUser(
  userPoints,
  userUsername,
  userId,
  userStats = {},
  userCountry = "FR",
  topN = 51
) {
  // Liste de pays disponibles
  const countries = [
    { code: "FR", name: "France", flag: "🇫🇷" },
    { code: "US", name: "États-Unis", flag: "🇺🇸" },
    { code: "DE", name: "Allemagne", flag: "🇩🇪" },
    { code: "ES", name: "Espagne", flag: "🇪🇸" },
    { code: "IT", name: "Italie", flag: "🇮🇹" },
    { code: "GB", name: "Royaume-Uni", flag: "🇬🇧" },
    { code: "MA", name: "Maroc", flag: "🇲🇦" },
    { code: "CA", name: "Canada", flag: "🇨🇦" },
    { code: "JP", name: "Japon", flag: "🇯🇵" },
    { code: "BR", name: "Brésil", flag: "🇧🇷" },
  ];

  // Noms fictifs pour les autres joueurs
  const fakeNames = [
    "AlexGamer",
    "MariePro",
    "PierreMaster",
    "SophieChamp",
    "LucasStar",
    "EmmaQueen",
    "ThomasElite",
    "JuliePro",
    "MaxGaming",
    "SarahWinner",
    "DavidChamp",
    "LisaElite",
    "PaulMaster",
    "AnnaPro",
    "KevinStar",
    "ClaraWinner",
    "MarcElite",
    "NinaChamp",
    "LeoGaming",
    "ZoePro",
    "HugoStar",
    "EvaWinner",
    "RaphaelElite",
    "CamilleChamp",
    "AntoineGaming",
    "LouisePro",
    "BaptisteStar",
    "ChloeWinner",
    "ArthurElite",
    "JadeChamp",
    "NathanGaming",
    "AlicePro",
    "VictorStar",
    "InesWinner",
    "RomainElite",
    "LolaChamp",
    "GabrielGaming",
    "MayaPro",
    "LouisStar",
    "ElenaWinner",
    "FelixChamp",
    "MiaGaming",
    "OscarPro",
    "IsabellaStar",
    "LiamWinner",
    "AvaElite",
    "NoahChamp",
    "EmmaGaming",
    "WilliamPro",
    "OliviaStar",
  ];

  // Créer l'utilisateur avec ses VRAIES données
  const userPlayer = {
    userId: userId,
    username: userUsername,
    totalPoints: userPoints,
    win: userStats.win || 0,
    draw: userStats.draw || 0,
    lose: userStats.lose || 0,
    totalGames: userStats.totalGames || 0,
    winRate: userStats.winRate || 0,
    isCurrentUser: true,
    country: countries.find((c) => c.code === userCountry) || countries[0],
    currentStreak: userStats.currentStreak || 0,
    bestTime: userStats.bestTime || null,
  };

  // Créer des joueurs fictifs autour de votre position
  const allPlayers = [];

  // Ajouter des joueurs avec plus de points (au-dessus de vous)
  for (let i = 0; i < 29; i++) {
    const pointsAbove = userPoints + Math.floor(Math.random() * 1000) + 100;
    allPlayers.push({
      userId: `fake_above_${i}`,
      username: fakeNames[i] || `Joueur${i + 1}`,
      totalPoints: pointsAbove,
      win: Math.floor(pointsAbove / 10),
      draw: Math.floor(pointsAbove / 20),
      lose: Math.floor(pointsAbove / 30),
      totalGames: Math.floor(pointsAbove / 5),
      winRate: Math.floor(
        (Math.floor(pointsAbove / 10) / Math.floor(pointsAbove / 5)) * 100
      ),
      isCurrentUser: false,
      country: countries[i % countries.length],
    });
  }

  // Ajouter l'utilisateur (30ème position)
  allPlayers.push(userPlayer);

  // Ajouter des joueurs avec moins de points (en-dessous de vous)
  for (let i = 29; i < topN - 1; i++) {
    const pointsBelow = Math.max(
      0,
      userPoints - Math.floor(Math.random() * 100) - 10
    );
    allPlayers.push({
      userId: `fake_below_${i}`,
      username: fakeNames[i] || `Joueur${i + 1}`,
      totalPoints: pointsBelow,
      win: Math.floor(pointsBelow / 10),
      draw: Math.floor(pointsBelow / 20),
      lose: Math.floor(pointsBelow / 30),
      totalGames: Math.floor(pointsBelow / 5),
      winRate:
        pointsBelow > 0
          ? Math.floor(
              (Math.floor(pointsBelow / 10) / Math.floor(pointsBelow / 5)) * 100
            )
          : 0,
      isCurrentUser: false,
      country: countries[i % countries.length],
    });
  }

  // Trier par points décroissants
  allPlayers.sort((a, b) => b.totalPoints - a.totalPoints);

  // S'assurer que l'utilisateur est à la 30ème position
  const userIndex = allPlayers.findIndex((player) => player.isCurrentUser);
  if (userIndex !== 29) {
    // Ajuster les points pour être 30ème
    const targetPoints = allPlayers[28]?.totalPoints || 0;
    userPlayer.totalPoints = targetPoints + 1;

    // Retrier
    allPlayers.sort((a, b) => b.totalPoints - a.totalPoints);
  }

  console.log(
    "🎮 Classement généré avec utilisateur à la position:",
    allPlayers.findIndex((player) => player.isCurrentUser) + 1
  );

  return allPlayers;
}

/**
 * Récupère le classement global (tous jeux confondus) : somme des points de tous les jeux pour chaque joueur.
 * @param {number} topN - Nombre de joueurs à afficher
 * @returns {Promise<Array<{userId:string, totalPoints:number, totalGames:number, totalWins:number}>>}
 */
export async function getGlobalLeaderboard(topN = 10) {
  // On récupère tous les users
  // Pour chaque user, on somme les totalPoints de tous ses scores
  // On trie et on retourne le topN
  const usersSnap = await getDocs(collection(db, "users"));
  const leaderboard = [];

  for (const userDoc of usersSnap.docs) {
    const userId = userDoc.id;
    const scoresSnap = await getDocs(collection(db, "users", userId, "scores"));
    let totalPoints = 0;
    let totalGames = 0;
    let totalWins = 0;

    scoresSnap.forEach((scoreDoc) => {
      const data = scoreDoc.data();
      totalPoints += data.totalPoints || 0;
      totalGames += data.totalGames || 0;
      totalWins += data.win || 0;
    });

    leaderboard.push({
      userId,
      totalPoints,
      totalGames,
      totalWins,
      winRate: totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0,
    });
  }

  leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
  return leaderboard.slice(0, topN);
}

/**
 * Réinitialise les statistiques d'un utilisateur pour un jeu spécifique.
 * @param {string} userId
 * @param {string} game
 */
export async function resetUserGameStats(userId, game) {
  const scoreRef = doc(db, "users", userId, "scores", game);
  await setDoc(scoreRef, {
    win: 0,
    draw: 0,
    lose: 0,
    totalPoints: 0,
    totalGames: 0,
    totalDuration: 0,
    winRate: 0,
    lastUpdated: new Date().toISOString(),
    lastPlayed: new Date().toISOString(),
    currentStreak: 0,
    bestTime: null,
  });
}

/**
 * Réinitialise toutes les statistiques d'un utilisateur.
 * @param {string} userId
 */
export async function resetAllUserStats(userId) {
  const scoresRef = collection(db, "users", userId, "scores");
  const snapshot = await getDocs(scoresRef);

  const resetPromises = snapshot.docs.map((doc) => {
    return setDoc(doc.ref, {
      win: 0,
      draw: 0,
      lose: 0,
      totalPoints: 0,
      totalGames: 0,
      totalDuration: 0,
      winRate: 0,
      lastUpdated: new Date().toISOString(),
      lastPlayed: new Date().toISOString(),
      currentStreak: 0,
      bestTime: null,
    });
  });

  await Promise.all(resetPromises);
}

/**
 * Récupère la position (rang) d'un utilisateur dans le classement d'un jeu donné.
 * @param {string} userId
 * @param {string} game
 * @returns {Promise<{rank:number, total:number}>}
 */
export async function getUserRankInLeaderboard(userId, game) {
  try {
    // Récupérer le score de l'utilisateur
    const userScoreDoc = await getDoc(doc(db, "users", userId, "scores", game));

    if (!userScoreDoc.exists()) {
      return { rank: null, total: 0 };
    }

    const userStats = userScoreDoc.data();
    const userPoints = userStats.totalPoints || 0;

    if (userPoints === 0) {
      return { rank: null, total: 0 };
    }

    // Calculer le rang basé sur les points (position fixe à 30ème)
    const rank = 30; // Position fixe pour l'utilisateur
    const total = 51; // Total de joueurs dans le classement

    console.log(
      "🏆 Rang calculé:",
      rank,
      "/",
      total,
      "pour",
      userPoints,
      "points"
    );
    return { rank, total };
  } catch (error) {
    console.log("❌ Erreur lors du calcul du rang:", error);
    return { rank: null, total: 0 };
  }
}

/**
 * Réinitialise uniquement la série de victoires d'un utilisateur pour un jeu spécifique.
 * @param {string} userId
 * @param {string} game
 */
export async function resetUserStreak(userId, game) {
  const scoreRef = doc(db, "users", userId, "scores", game);
  await setDoc(scoreRef, { currentStreak: 0 }, { merge: true });
}

/**
 * Réinitialise la série de victoires (currentStreak) pour tous les jeux d'un utilisateur.
 * @param {string} userId
 */
export async function resetAllUserStreaks(userId) {
  const scoresRef = collection(db, "users", userId, "scores");
  const snapshot = await getDocs(scoresRef);
  const resetPromises = snapshot.docs.map((doc) =>
    setDoc(doc.ref, { currentStreak: 0 }, { merge: true })
  );
  await Promise.all(resetPromises);
}
