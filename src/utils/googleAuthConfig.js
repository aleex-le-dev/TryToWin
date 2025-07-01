// Configuration Google Auth - Variables d'environnement pour l'authentification Google
// À utiliser dans les écrans d'authentification pour configurer Google Sign-In

import { EXPO_CLIENT_ID, ANDROID_CLIENT_ID } from "@env";

// Vérification et logs de débogage des variables d'environnement
const expoClientId = EXPO_CLIENT_ID || null;
const androidClientId = ANDROID_CLIENT_ID || null;

console.warn(
  "[DEBUG] EXPO_CLIENT_ID:",
  expoClientId ? expoClientId.slice(0, 8) + "..." : "NON DEFINI"
);
console.warn(
  "[DEBUG] ANDROID_CLIENT_ID:",
  androidClientId ? androidClientId.slice(0, 8) + "..." : "NON DEFINI"
);

export { expoClientId as EXPO_CLIENT_ID, androidClientId as ANDROID_CLIENT_ID };
