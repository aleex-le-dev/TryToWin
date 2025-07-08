// Service d'upload et de récupération de photo de profil sur Firebase Storage
// Utilisé pour synchroniser la photo de profil dans le cloud
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../utils/firebaseConfig";

/**
 * Upload une photo de profil sur Firebase Storage et retourne l'URL publique
 * @param {string} userId
 * @param {string} uri (local file URI)
 * @returns {Promise<string>} URL publique de la photo
 */
export async function uploadProfilePhoto(userId, uri) {
  console.log("[uploadProfilePhoto] Début upload", { userId, uri });
  const storage = getStorage();
  let response, blob, storageRef, url;
  try {
    response = await fetch(uri);
    console.log("[uploadProfilePhoto] fetch OK");
    blob = await response.blob();
    console.log("[uploadProfilePhoto] blob OK");
    storageRef = ref(storage, `profile_photos/${userId}.jpg`);
    await uploadBytes(storageRef, blob);
    console.log("[uploadProfilePhoto] uploadBytes OK");
    url = await getDownloadURL(storageRef);
    console.log("[uploadProfilePhoto] getDownloadURL OK", url);
    return url;
  } catch (e) {
    console.log("[uploadProfilePhoto] ERREUR", e);
    throw e;
  }
}

/**
 * Récupère l'URL de la photo de profil depuis Firebase Storage
 * @param {string} userId
 * @returns {Promise<string>} URL publique de la photo
 */
export async function getProfilePhotoUrl(userId) {
  const storage = getStorage();
  const storageRef = ref(storage, `profile_photos/${userId}.jpg`);
  return await getDownloadURL(storageRef);
}
