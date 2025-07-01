// src/utils/firebaseConfig.js
// Configuration et initialisation Firebase pour TryToWin (Expo/React Native)
// Utilise la config générée depuis la console Firebase (application Web)

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD5snXZaI326eZdNz95EPz-9fQWquw4OEw",
  authDomain: "trytowin-c063c.firebaseapp.com",
  projectId: "trytowin-c063c",
  storageBucket: "trytowin-c063c.appspot.com", // .appspot.com obligatoire
  messagingSenderId: "690931106779",
  appId: "1:690931106779:web:1b6a027920a820be579dfe",
  measurementId: "G-ED7NTDD21F",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
