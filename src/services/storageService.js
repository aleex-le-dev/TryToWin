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

  const storage = getStorage();
  let response, blob, storageRef, url;
  try {
    response = await fetch(uri);

    blob = await response.blob();
    
    storageRef = ref(storage, `profile_photos/${userId}.jpg`);
    await uploadBytes(storageRef, blob);
    
    url = await getDownloadURL(storageRef);
    
    return url;
  } catch (e) {

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
