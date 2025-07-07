const admin = require("firebase-admin");
const serviceAccount = require("./trytowin-c063c-firebase-adminsdk-fbsvc-f415325354.json"); // Mets ici le chemin vers ton fichier JSON

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function migrateAvatars() {
  const usersRef = db.collection("users");
  const snapshot = await usersRef.get();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const updates = {};

    // Copier photoURL dans avatar si présent
    if (data.photoURL) {
      updates.avatar = data.photoURL;
    }

    // Supprimer photoURL et l'ancien avatar (emoji)
    updates.photoURL = admin.firestore.FieldValue.delete();
    if ("avatar" in data) {
      updates.avatar_old = admin.firestore.FieldValue.delete();
    }

    if (Object.keys(updates).length > 0) {
      await doc.ref.update(updates);
      console.log(`Mise à jour de l'utilisateur ${doc.id}`);
    }
  }
  console.log("Migration terminée !");
}

migrateAvatars().catch(console.error);
