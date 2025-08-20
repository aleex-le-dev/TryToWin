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
 */
export async function recordGameResult(userId, game, result, score = 0) {
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
          winRate: 0,
          lastUpdated: new Date().toISOString(),
          lastPlayed: new Date().toISOString(),
          currentStreak: 0,
        };

    // Mise à jour des statistiques
    data[result] += 1;
    data.totalGames += 1;
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

    // (SUPPRESSION TOAST)
    // Toast.show(toastConfig);
  } catch (error) {
    // Toast.show({
    //   type: "error",
    //   text1: "Erreur",
    //   text2: "Impossible d'enregistrer le score",
    //   position: "top",
    // });
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
      winRate: 0,
      currentStreak: 0,
      lastPlayed: null,
    };
  } catch (error) {
    return {
      win: 0,
      draw: 0,
      lose: 0,
      totalPoints: 0,
      totalGames: 0,
      winRate: 0,
      currentStreak: 0,
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
      stats.gamesPlayed[gameId] = data;
    });

    stats.winRate =
      stats.totalGames > 0
        ? Math.round((stats.totalWins / stats.totalGames) * 100)
        : 0;

    return stats;
  } catch (error) {
    console.log(
      "[INFO] getUserAllGameStats: Impossible de récupérer les statistiques:",
      error.message || error
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
    console.log("[SCORE] getLeaderboard start", { game, topN, hasCurrentUser: !!currentUser });
    const usersSnap = await getDocs(collection(db, "users"));
    const leaderboard = [];

    for (const userDoc of usersSnap.docs) {
      const userId = userDoc.id;
      const userProfile = userDoc.data();
      const scoreSnap = await getDoc(doc(db, "users", userId, "scores", game));
      if (scoreSnap.exists()) {
        const data = scoreSnap.data() || {};
        console.log("[SCORE] getLeaderboard user score", {
          game,
          userId,
          totalGames: data.totalGames || 0,
          win: data.win || 0,
          draw: data.draw || 0,
          lose: data.lose || 0,
          totalPoints: data.totalPoints || 0,
        });
        if ((data.totalGames || 0) > 0) {
          const playerData = {
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
            avatar: userProfile.avatar || null,
            email: userProfile.email || null,
          };
          console.log("[SCORE] getLeaderboard player data", { game, userId, playerData });
          leaderboard.push(playerData);
        } else {
          console.log("[SCORE] getLeaderboard skipped (no games)", { game, userId });
        }
      }
    }

    // Ajout/actualisation de l'utilisateur courant si besoin
    console.log("[SCORE] getLeaderboard pre-generate", { game, playersCount: leaderboard.length });
    const leaderboardSorted = generateLeaderboard(leaderboard);
    console.log(
      "[SCORE] getLeaderboard done",
      {
        game,
        resultCount: leaderboardSorted?.length || 0,
        sample: (leaderboardSorted || []).slice(0, 3).map((p) => ({
          userId: p.userId,
          points: p.totalPoints,
          win: p.win,
          totalGames: p.totalGames,
        })),
      }
    );
    return leaderboardSorted;
  } catch (error) {
    console.log("[SCORE] getLeaderboard error", { game, error: error?.message || error });
    return [];
  }
}

/**
 * Récupère le classement global (tous jeux confondus).
 * @param {number} topN - Nombre de joueurs à afficher
 * @returns {Promise<Array>} Classement global
 */
export async function getGlobalLeaderboard(topN = null) {
  try {

    
    const usersSnap = await getDocs(collection(db, "users"));

    
    const leaderboard = [];

    for (const userDoc of usersSnap.docs) {
      const userId = userDoc.id;


      try {
        // S'assurer que l'utilisateur a des entrées de score pour tous les jeux
        const games = ["Puissance4", "Othello", "Morpion"];
        for (const game of games) {
          await ensureScoreEntry(userId, game);
        }

        // Au lieu d'essayer de lire les scores privés, on utilise les données publiques
        // ou on crée des entrées par défaut
        let totalPoints = 0;
        let totalGames = 0;
        let totalWins = 0;

        // Essayer de récupérer les scores de manière sécurisée
        try {
          const scoresSnap = await getDocs(
            collection(db, "users", userId, "scores")
          );

          scoresSnap.forEach((scoreDoc) => {
            const data = scoreDoc.data();
            totalPoints += data.totalPoints || 0;
            totalGames += data.totalGames || 0;
            totalWins += data.win || 0;
          });
        } catch (scoreError) {
          // Si on ne peut pas accéder aux scores, on utilise des valeurs par défaut

          totalPoints = 0;
          totalGames = 0;
          totalWins = 0;
        }



        // Inclure TOUS les utilisateurs, même ceux avec 0 points
        const playerEntry = {
          userId,
          totalPoints,
          totalGames,
          win: totalWins, // Ajouter le champ win pour les victoires
          totalWins,
          winRate:
            totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0,
        };
        
        console.log("[SCORE] getGlobalLeaderboard player entry", { userId, playerEntry });
        leaderboard.push(playerEntry);
      } catch (userError) {

        // Ajouter quand même l'utilisateur avec 0 points
        leaderboard.push({
          userId,
          totalPoints: 0,
          totalGames: 0,
          win: 0, // Ajouter le champ win pour les victoires
          totalWins: 0,
          winRate: 0,
        });
      }
    }



    // Trier par points décroissants, puis par nom d'utilisateur pour les égalités
    leaderboard.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      // En cas d'égalité de points, trier par nom d'utilisateur
      return (a.userId || "").localeCompare(b.userId || "");
    });



    // Si topN est spécifié, limiter le résultat, sinon retourner tous les utilisateurs
    const result = topN ? leaderboard.slice(0, topN) : leaderboard;

    
    return result;
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
    // Récupérer tous les utilisateurs et leurs scores pour le jeu
    const usersSnap = await getDocs(collection(db, "users"));
    const players = [];
    for (const userDoc of usersSnap.docs) {
      const userProfile = userDoc.data();
      const scoreSnap = await getDoc(
        doc(db, "users", userDoc.id, "scores", game)
      );
      const data = scoreSnap.exists() ? scoreSnap.data() : {};
      // Inclure tous les utilisateurs qui ont une entrée de score
      if (scoreSnap.exists()) {
        players.push({
          userId: userDoc.id,
          points: data.totalPoints || 0,
          country: userProfile.country || "FR",
          displayName: userProfile.username || userProfile.displayName || "",
          email: userProfile.email || "",
        });
      }
    }

    const userScoreDoc = await getDoc(doc(db, "users", userId, "scores", game));
    if (!userScoreDoc.exists()) return { rank: null, total: 0 };
    const userStats = userScoreDoc.data();
    const userProfileRef = doc(db, "users", userId);
    const userProfileSnap = await getDoc(userProfileRef);
    const userProfile = userProfileSnap.exists() ? userProfileSnap.data() : {};
    const userCountry = userProfile.country || "FR";

    const leaderboard = generateLeaderboard(
      players,
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
      const games = ["Puissance4", "Othello", "Morpion"];
      for (const game of games) {
        await ensureScoreEntry(currentUserId, game);
      }

      let totalPoints = 0;
      
      // Essayer de récupérer les scores de manière sécurisée
      try {
        const scoresSnap = await getDocs(
          collection(db, "users", currentUserId, "scores")
        );

        scoresSnap.forEach((scoreDoc) => {
          const data = scoreDoc.data();
          totalPoints += data.totalPoints || 0;
        });
      } catch (scoreError) {
        // Si on ne peut pas accéder aux scores, on utilise des valeurs par défaut

        totalPoints = 0;
      }

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
    const games = ["Puissance4", "Othello", "Morpion"];

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
          winRate: 0,
          lastUpdated: new Date().toISOString(),
          lastPlayed: new Date().toISOString(),
          currentStreak: 0,
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
      winRate: 0,
      lastUpdated: new Date().toISOString(),
      lastPlayed: new Date().toISOString(),
      currentStreak: 0,
    });
  }
}

/**
 * Initialise les entrées de score pour tous les utilisateurs existants.
 * À appeler une seule fois pour migrer les données existantes.
 */
export async function initializeAllUsersScoreEntries() {
  try {
    const games = ["Puissance4", "Othello", "Morpion"];
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
            winRate: 0,
            lastUpdated: new Date().toISOString(),
            lastPlayed: new Date().toISOString(),
            currentStreak: 0,
          });
        }
      }
    }
  } catch (error) {

  }
}
