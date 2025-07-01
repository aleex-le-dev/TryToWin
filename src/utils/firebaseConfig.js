import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FIREBASE_API_KEY } from "@env";

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: "trytowin-c063c.firebaseapp.com",
  projectId: "trytowin-c063c",
  storageBucket: "trytowin-c063c.appspot.com",
  messagingSenderId: "690931106779",
  appId: "1:690931106779:web:1b6a027920a820be579dfe",
  measurementId: "G-ED7NTDD21F",
};

const app = initializeApp(firebaseConfig);

console.warn(
  "[DEBUG] FIREBASE_API_KEY:",
  FIREBASE_API_KEY ? FIREBASE_API_KEY.slice(0, 8) + "..." : "NON DEFINIE"
);

export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
