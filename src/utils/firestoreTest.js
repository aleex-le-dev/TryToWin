// Utilitaire de test pour diagnostiquer les problèmes Firestore
// Utilisé pour vérifier les permissions et la connectivité

import { db } from "./firebaseConfig";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { auth } from "./firebaseConfig";

/**
 * Teste la connexion Firestore et les permissions
 * @param {string} userId - ID de l'utilisateur à tester
 */
export async function testFirestoreConnection(userId) {
  console.log("=== TEST CONNEXION FIRESTORE ===");

  try {
    // Test 1: Vérifier l'authentification
    const currentUser = auth.currentUser;
    console.log(
      "1. Utilisateur authentifié:",
      currentUser ? currentUser.uid : "Aucun"
    );

    if (!currentUser) {
      console.error("❌ Aucun utilisateur authentifié");
      return false;
    }

    // Test 2: Lire le profil utilisateur
    console.log("2. Test lecture profil utilisateur...");
    const userDoc = doc(db, "users", userId);
    const userSnap = await getDoc(userDoc);

    if (userSnap.exists()) {
      console.log("✅ Profil utilisateur lu avec succès:", userSnap.data());
    } else {
      console.log("⚠️ Profil utilisateur n'existe pas, création...");
      await setDoc(userDoc, {
        username: "Test User",
        email: currentUser.email,
        createdAt: new Date().toISOString(),
      });
      console.log("✅ Profil utilisateur créé");
    }

    // Test 3: Lire les scores
    console.log("3. Test lecture scores...");
    const scoresCollection = collection(db, "users", userId, "scores");
    const scoresSnap = await getDocs(scoresCollection);
    console.log(`✅ ${scoresSnap.size} scores trouvés`);

    scoresSnap.forEach((doc) => {
      console.log(`   - ${doc.id}:`, doc.data());
    });

    // Test 4: Écrire un score de test
    console.log("4. Test écriture score...");
    const testScoreRef = doc(db, "users", userId, "scores", "test-game");
    await setDoc(testScoreRef, {
      win: 1,
      draw: 0,
      lose: 0,
      totalPoints: 10,
      totalGames: 1,
      lastUpdated: new Date().toISOString(),
    });
    console.log("✅ Score de test écrit avec succès");

    // Test 5: Relire le score de test
    const testScoreSnap = await getDoc(testScoreRef);
    if (testScoreSnap.exists()) {
      console.log("✅ Score de test relu avec succès:", testScoreSnap.data());
    }

    console.log("=== TESTS TERMINÉS AVEC SUCCÈS ===");
    return true;
  } catch (error) {
    console.error("❌ ERREUR LORS DES TESTS:", error);
    console.error("Code d'erreur:", error.code);
    console.error("Message:", error.message);

    if (error.code === "permission-denied") {
      console.error("🔒 PROBLÈME DE PERMISSIONS FIRESTORE");
      console.error("Vérifiez vos règles Firestore dans la console Firebase");
    }

    return false;
  }
}

/**
 * Génère des données de test pour tous les jeux
 * @param {string} userId - ID de l'utilisateur
 */
export async function generateTestData(userId) {
  console.log("=== GÉNÉRATION DE DONNÉES DE TEST ===");

  const games = ["Morpion", "Puissance4", "Othello"];
  const results = ["win", "draw", "lose"];

  try {
    for (const game of games) {
      console.log(`Génération de données pour ${game}...`);

      const gameRef = doc(db, "users", userId, "scores", game);
      const wins = Math.floor(Math.random() * 10) + 5;
      const draws = Math.floor(Math.random() * 5);
      const loses = Math.floor(Math.random() * 8);
      const totalGames = wins + draws + loses;
      const totalPoints = wins * 10 + draws * 2;

      await setDoc(gameRef, {
        win: wins,
        draw: draws,
        lose: loses,
        totalGames: totalGames,
        totalPoints: totalPoints,
        winRate: Math.round((wins / totalGames) * 100),
        lastUpdated: new Date().toISOString(),
        lastPlayed: new Date().toISOString(),
      });

      console.log(
        `✅ Données générées pour ${game}: ${wins}W/${draws}D/${loses}L`
      );
    }

    console.log("=== DONNÉES DE TEST GÉNÉRÉES AVEC SUCCÈS ===");
    return true;
  } catch (error) {
    console.error("❌ ERREUR LORS DE LA GÉNÉRATION:", error);
    return false;
  }
}
