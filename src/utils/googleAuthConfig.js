// Configuration Google Auth - Variables d'environnement pour l'authentification Google
// À utiliser dans les écrans d'authentification pour configurer Google Sign-In

import { EXPO_CLIENT_ID, ANDROID_CLIENT_ID } from "@env";

// Vérification des variables d'environnement
const expoClientId = EXPO_CLIENT_ID || null;
const androidClientId = ANDROID_CLIENT_ID || null;

export { expoClientId as EXPO_CLIENT_ID, androidClientId as ANDROID_CLIENT_ID };
