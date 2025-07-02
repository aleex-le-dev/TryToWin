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
} from "firebase/firestore";
import { GAME_POINTS } from "../constants/gamePoints";

/**
 * Enregistre le résultat d'une partie pour un joueur et un jeu.
 * Incrémente win/draw/lose et met à jour le total de points.
 * @param {string} userId - ID du joueur
 * @param {string} game - Nom du jeu (ex: 'TicTacToe')
 * @param {'win'|'draw'|'lose'} result - Résultat de la partie
 */
export async function recordGameResult(userId, game, result) {
  const points = GAME_POINTS[game]?.[result] ?? 0;
  if (!userId || !game || !["win", "draw", "lose"].includes(result)) return;
  const scoreRef = doc(db, "users", userId, "scores", game);
  const docSnap = await getDoc(scoreRef);
  let data = {
    win: 0,
    draw: 0,
    lose: 0,
    totalPoints: 0,
    lastUpdated: new Date().toISOString(),
  };
  if (docSnap.exists()) {
    data = docSnap.data();
  }
  data[result] += 1;
  data.totalPoints += points;
  data.lastUpdated = new Date().toISOString();
  await setDoc(scoreRef, data, { merge: true });
}

/**
 * Récupère le score cumulé d'un joueur pour un jeu donné.
 * @param {string} userId
 * @param {string} game
 * @returns {Promise<{win:number,draw:number,lose:number,totalPoints:number}>}
 */
export async function getUserGameScore(userId, game) {
  const scoreRef = doc(db, "users", userId, "scores", game);
  const docSnap = await getDoc(scoreRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return { win: 0, draw: 0, lose: 0, totalPoints: 0 };
}

/**
 * Récupère le classement global pour un jeu donné (top N joueurs).
 * @param {string} game - Nom du jeu (ex: 'TicTacToe')
 * @param {number} topN - Nombre de joueurs à afficher
 * @returns {Promise<Array<{userId:string, win:number, draw:number, lose:number, totalPoints:number}>>}
 */
export async function getLeaderboard(game, topN = 10) {
  const q = query(
    collectionGroup(db, "scores"),
    where("__name__", "==", game),
    orderBy("totalPoints", "desc"),
    limit(topN)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    userId: doc.ref.parent.parent.id,
    ...doc.data(),
  }));
}

/**
 * Récupère le classement global (tous jeux confondus) : somme des points de tous les jeux pour chaque joueur.
 * @param {number} topN - Nombre de joueurs à afficher
 * @returns {Promise<Array<{userId:string, totalPoints:number}>>}
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
    scoresSnap.forEach((scoreDoc) => {
      const data = scoreDoc.data();
      totalPoints += data.totalPoints || 0;
    });
    leaderboard.push({ userId, totalPoints });
  }
  leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
  return leaderboard.slice(0, topN);
}
