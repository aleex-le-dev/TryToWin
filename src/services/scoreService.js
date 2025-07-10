// Service d'enregistrement des scores par joueur et par jeu
// Utilise Firestore pour la persistance
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

import { generateLeaderboard } from "../utils/leaderboardUtils";
import Toast from "react-native-toast-message";

/**
 * Enregistre le résultat d'une partie pour un joueur et un jeu.
 * @param {string} userId - ID du joueur
 * @param {string} game - Nom du jeu
 * @param {'win'|'draw'|'lose'} result - Résultat de la partie
 * @param {number} score - Score spécifique de la partie
 * @param {number} duration - Durée de la partie en secondes
 */
export async function recordGameResult(
  userId,
  game,
  result,
  score = 0,
  duration = 0
) {
  if (!userId || !game || !["win", "draw", "lose"].includes(result)) return;

  const points = GAME_POINTS[game]?.[result] ?? 0;
  const scoreRef = doc(db, "users", userId, "scores", game);

  try {
    const docSnap = await getDoc(scoreRef);
    const data = docSnap.exists()
      ? docSnap.data()
      : {
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

    // Mise à jour des statistiques
    data[result] += 1;
    data.totalGames += 1;
    data.totalDuration += duration;
    data.lastUpdated = new Date().toISOString();
    data.lastPlayed = new Date().toISOString();

    // Gestion de la série de victoires
    if (result === "win") {
      data.currentStreak += 1;
      const multiplier = getSerieMultiplier(data.currentStreak);
      data.totalPoints += Math.round(points + points * multiplier);
    } else {
      data.currentStreak = 0;
      data.totalPoints += Math.round(points);
    }

    // Mise à jour du meilleur temps
    if (duration > 0 && (data.bestTime === null || duration < data.bestTime)) {
      data.bestTime = duration;
    }

    // Calcul du taux de victoire
    data.winRate =
      data.totalGames > 0 ? Math.round((data.win / data.totalGames) * 100) : 0;

    await setDoc(scoreRef, data);

    // Affichage du toast de succès
    const resultText =
      result === "win"
        ? "Victoire"
        : result === "draw"
        ? "Match nul"
        : "Défaite";
    const pointsGagnes =
      result === "win"
        ? Math.round(points + points * getSerieMultiplier(data.currentStreak))
        : Math.round(points);
    const multiplier = getSerieMultiplier(data.currentStreak);

    let toastConfig = {
      type: result === "win" ? "success" : "info",
      position: "top",
    };

    if (result === "win" && multiplier > 0) {
      toastConfig.text1 = `🔥 Victoire ! Série de ${data.currentStreak}`;
      toastConfig.text2 = `+${pointsGagnes} points (x${Math.round(
        1 + multiplier
      )})`;
    } else if (result === "win") {
      toastConfig.text1 = "Victoire !";
      toastConfig.text2 = `+${pointsGagnes} points`;
    } else if (result === "draw") {
      toastConfig.text1 = "Match nul !";
      toastConfig.text2 = `+${pointsGagnes} points`;
    } else {
      toastConfig.text1 = "Défaite";
      toastConfig.text2 = `+${pointsGagnes} points`;
    }

    Toast.show(toastConfig);
  } catch (error) {
    Toast.show({
      type: "error",
      text1: "Erreur",
      text2: "Impossible d'enregistrer le score",
      position: "top",
    });
  }
}

/**
 * Récupère les statistiques d'un utilisateur pour un jeu donné.
 * @param {string} userId - ID de l'utilisateur
 * @param {string} game - Nom du jeu
 * @returns {Promise<Object>} Statistiques du joueur
 */
export async function getUserGameScore(userId, game) {
  if (!userId || !game) {
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
      lastPlayed: null,
    };
  }

  try {
    const scoreRef = doc(db, "users", userId, "scores", game);
    const docSnap = await getDoc(scoreRef);

    if (docSnap.exists()) {
      return docSnap.data();
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
      lastPlayed: null,
    };
  } catch (error) {
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
      lastPlayed: null,
    };
  }
}

/**
 * Récupère toutes les statistiques d'un utilisateur pour tous les jeux.
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>} Statistiques globales
 */
export async function getUserAllGameStats(userId) {
  if (!userId) {
    return {};
  }

  try {
    const scoresSnap = await getDocs(collection(db, "users", userId, "scores"));

    const stats = {
      totalGames: 0,
      totalWins: 0,
      totalDraws: 0,
      totalLosses: 0,
      totalPoints: 0,
      totalDuration: 0,
      gamesPlayed: {},
    };

    scoresSnap.forEach((doc) => {
      const data = doc.data();
      const gameId = doc.id;

      stats.totalGames += data.totalGames || 0;
      stats.totalWins += data.win || 0;
      stats.totalDraws += data.draw || 0;
      stats.totalLosses += data.lose || 0;
      stats.totalPoints += data.totalPoints || 0;
      stats.totalDuration += data.totalDuration || 0;
      stats.gamesPlayed[gameId] = data;
    });

    stats.winRate =
      stats.totalGames > 0
        ? Math.round((stats.totalWins / stats.totalGames) * 100)
        : 0;

    return stats;
  } catch (error) {
    console.error(
      "[ERROR] getUserAllGameStats: Erreur lors de la récupération:",
      error
    );
    return {};
  }
}

/**
 * Récupère le classement pour un jeu donné.
 * @param {string} game - Nom du jeu
 * @param {number} topN - Nombre de joueurs à afficher
 * @param {Object} currentUser - Utilisateur actuel
 * @returns {Promise<Array>} Classement
 */
export async function getLeaderboard(game, topN = 10, currentUser = null) {
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    const leaderboard = [];

    for (const userDoc of usersSnap.docs) {
      const userId = userDoc.id;
      const userProfile = userDoc.data();
      const scoreSnap = await getDoc(doc(db, "users", userId, "scores", game));
      const data = scoreSnap.exists() ? scoreSnap.data() : {};

      // Créer une entrée de score si elle n'existe pas
      if (!scoreSnap.exists()) {
        await ensureScoreEntry(userId, game);
      }

      // Inclure tous les joueurs (maintenant qu'ils ont tous une entrée de score)
      leaderboard.push({
        userId,
        name:
          userProfile.username ||
          userProfile.displayName ||
          userProfile.email ||
          "Joueur",
        points: data.totalPoints || 0,
        country: userProfile.country || "FR",
        win: data.win || 0,
        draw: data.draw || 0,
        lose: data.lose || 0,
        totalGames: data.totalGames || 0,
        winRate: data.winRate || 0,
        currentStreak: data.currentStreak || 0,
        bestTime: data.bestTime || null,
        avatar: userProfile.avatar || null,
        email: userProfile.email || null,
      });
    }

    // Ajout/actualisation de l'utilisateur courant si besoin
    let userStats = null;
    let userCountry = "FR";
    if (currentUser?.id) {
      const userScoreDoc = await getDoc(
        doc(db, "users", currentUser.id, "scores", game)
      );
      userStats = userScoreDoc.exists() ? userScoreDoc.data() : {};
      const userProfileRef = doc(db, "users", currentUser.id);
      const userProfileSnap = await getDoc(userProfileRef);
      const userProfile = userProfileSnap.exists()
        ? userProfileSnap.data()
        : {};
      userCountry = userProfile.country || "FR";
    }

    const leaderboardWithCurrent = generateLeaderboard(
      leaderboard,
      currentUser,
      userStats,
      userCountry
    );
    return leaderboardWithCurrent.slice(0, topN);
  } catch (error) {
    return [];
  }
}

/**
 * Récupère le classement global (tous jeux confondus).
 * @param {number} topN - Nombre de joueurs à afficher
 * @returns {Promise<Array>} Classement global
 */
export async function getGlobalLeaderboard(topN = 10) {
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    const leaderboard = [];

    for (const userDoc of usersSnap.docs) {
      const userId = userDoc.id;

      // S'assurer que l'utilisateur a des entrées de score pour tous les jeux
      const games = ["Puissance4", "Othello", "Morpion", "Pendu"];
      for (const game of games) {
        await ensureScoreEntry(userId, game);
      }

      const scoresSnap = await getDocs(
        collection(db, "users", userId, "scores")
      );

      let totalPoints = 0;
      let totalGames = 0;
      let totalWins = 0;

      scoresSnap.forEach((scoreDoc) => {
        const data = scoreDoc.data();
        totalPoints += data.totalPoints || 0;
        totalGames += data.totalGames || 0;
        totalWins += data.win || 0;
      });

      // Inclure tous les utilisateurs, même ceux avec 0 points
      leaderboard.push({
        userId,
        totalPoints,
        totalGames,
        totalWins,
        winRate:
          totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0,
      });
    }

    leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
    return leaderboard.slice(0, topN);
  } catch (error) {
    return [];
  }
}

/**
 * Récupère la position d'un utilisateur dans le classement d'un jeu.
 * @param {string} userId - ID de l'utilisateur
 * @param {string} game - Nom du jeu
 * @returns {Promise<{rank: number, total: number}>} Rang et total
 */
export async function getUserRankInLeaderboard(userId, game) {
  if (!userId || !game) return { rank: null, total: 0 };

  try {
    const userScoreDoc = await getDoc(doc(db, "users", userId, "scores", game));
    if (!userScoreDoc.exists()) return { rank: null, total: 0 };

    const userStats = userScoreDoc.data();
    // Afficher le rang même si totalPoints vaut 0, tant qu'il y a une entrée de score

    const userProfileRef = doc(db, "users", userId);
    const userProfileSnap = await getDoc(userProfileRef);
    const userProfile = userProfileSnap.exists() ? userProfileSnap.data() : {};
    const userCountry = userProfile.country || "FR";

    const leaderboard = generateLeaderboard(
      [],
      {
        id: userId,
        displayName: userProfile.username || userProfile.displayName || "Vous",
        email: userProfile.email,
      },
      userStats,
      userCountry
    );

    const myEntry = leaderboard.find((p) => p.isCurrentUser);
    return {
      rank: myEntry ? myEntry.rank : null,
      total: leaderboard.length,
    };
  } catch (error) {
    return { rank: null, total: 0 };
  }
}

/**
 * Récupère la position d'un utilisateur dans le classement global.
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<{rank: number, total: number}>} Rang et total
 */
export async function getUserGlobalRank(userId) {
  if (!userId) return { rank: null, total: 0 };

  try {
    const usersSnap = await getDocs(collection(db, "users"));
    const leaderboard = [];

    for (const userDoc of usersSnap.docs) {
      const currentUserId = userDoc.id;

      // S'assurer que l'utilisateur a des entrées de score pour tous les jeux
      const games = ["Puissance4", "Othello", "Morpion", "Pendu"];
      for (const game of games) {
        await ensureScoreEntry(currentUserId, game);
      }

      const scoresSnap = await getDocs(
        collection(db, "users", currentUserId, "scores")
      );

      let totalPoints = 0;
      scoresSnap.forEach((scoreDoc) => {
        const data = scoreDoc.data();
        totalPoints += data.totalPoints || 0;
      });

      // Inclure tous les utilisateurs, même ceux avec 0 points
      leaderboard.push({ userId: currentUserId, totalPoints });
    }

    leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);

    const userIndex = leaderboard.findIndex((entry) => entry.userId === userId);
    if (userIndex === -1) return { rank: null, total: leaderboard.length };

    // Gestion des égalités de rang
    let rank = 1;
    for (let i = 0; i < userIndex; i++) {
      if (leaderboard[i].totalPoints > leaderboard[i + 1].totalPoints) {
        rank = i + 2;
      }
    }

    return { rank, total: leaderboard.length };
  } catch (error) {
    return { rank: null, total: 0 };
  }
}

/**
 * Récupère la position d'un utilisateur dans le classement par pays pour un jeu.
 * @param {string} userId - ID de l'utilisateur
 * @param {string} game - Nom du jeu
 * @param {string} country - Code pays (ex: 'FR')
 * @returns {Promise<{rank: number, total: number}>} Rang et total dans le pays
 */
export async function getUserRankInCountryLeaderboard(userId, game, country) {
  if (!userId || !game || !country) return { rank: null, total: 0 };
  try {
    // Récupérer tous les utilisateurs du pays
    const usersSnap = await getDocs(collection(db, "users"));
    const leaderboard = [];
    for (const userDoc of usersSnap.docs) {
      const userProfile = userDoc.data();
      if ((userProfile.country || "FR") !== country) continue;
      const scoreSnap = await getDoc(
        doc(db, "users", userDoc.id, "scores", game)
      );
      const data = scoreSnap.exists() ? scoreSnap.data() : {};
      // Inclure tous les utilisateurs du pays qui ont une entrée de score
      if (scoreSnap.exists()) {
        leaderboard.push({
          userId: userDoc.id,
          totalPoints: data.totalPoints || 0,
        });
      }
    }
    leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
    const userIndex = leaderboard.findIndex((entry) => entry.userId === userId);
    if (userIndex === -1) return { rank: null, total: leaderboard.length };
    // Gestion des égalités de rang
    let rank = 1;
    for (let i = 0; i < userIndex; i++) {
      if (leaderboard[i].totalPoints > leaderboard[i + 1].totalPoints) {
        rank = i + 2;
      }
    }
    return { rank, total: leaderboard.length };
  } catch (error) {
    return { rank: null, total: 0 };
  }
}

/**
 * Initialise les leaderboards pour un utilisateur.
 * @param {string} userId - ID de l'utilisateur
 */
export async function initializeLeaderboardsForUser(userId) {
  if (!userId) return;

  try {
    const games = ["Puissance4", "Othello", "Morpion", "Pendu"];

    for (const game of games) {
      const scoreRef = doc(db, "users", userId, "scores", game);
      const docSnap = await getDoc(scoreRef);

      if (!docSnap.exists()) {
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
    }
  } catch (error) {
    // Erreur silencieuse pour ne pas bloquer l'initialisation
  }
}

export async function ensureScoreEntry(userId, game) {
  if (!userId || !game) return;
  const scoreRef = doc(db, "users", userId, "scores", game);
  const docSnap = await getDoc(scoreRef);
  if (!docSnap.exists()) {
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
}

/**
 * Initialise les entrées de score pour tous les utilisateurs existants.
 * À appeler une seule fois pour migrer les données existantes.
 */
export async function initializeAllUsersScoreEntries() {
  try {
    const games = ["Puissance4", "Othello", "Morpion", "Pendu"];
    const usersSnap = await getDocs(collection(db, "users"));

    for (const userDoc of usersSnap.docs) {
      const userId = userDoc.id;

      for (const game of games) {
        const scoreRef = doc(db, "users", userId, "scores", game);
        const docSnap = await getDoc(scoreRef);

        if (!docSnap.exists()) {
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
      }
    }
  } catch (error) {
    console.error("Erreur lors de l'initialisation des scores:", error);
  }
}
