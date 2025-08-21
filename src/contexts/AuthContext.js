// Contexte d'authentification pour gérer l'état de connexion
// Utilisé dans toute l'application pour vérifier si l'utilisateur est connecté

import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../utils/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import { User } from "../models/User";

// Création du contexte d'authentification
const AuthContext = createContext();

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
};

// Provider du contexte d'authentification
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fonction pour récupérer les données utilisateur depuis Firestore
  const fetchUserData = async (firebaseUser) => {
    try {
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          ...firebaseUser,
          username: userData.username,
          points: userData.points || 0,
          gamesPlayed: userData.gamesPlayed || 0,
          bestScore: userData.bestScore || 0,
        };
      }
      return firebaseUser;
    } catch (error) {
      console.error("Erreur lors de la récupération des données utilisateur:", error);
      return firebaseUser;
    }
  };

  // Fonction pour mettre à jour le profil utilisateur
  const updateUserProfile = async (updates) => {
    if (!user) return false;
    
    try {
      // Utiliser user.uid si disponible, sinon user.id
      const userId = user.uid || user.id;
      if (!userId) {
        console.error("ID utilisateur non disponible");
        return false;
      }
      
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, updates);
      
      // Récupérer les données mises à jour depuis Firestore
      const updatedUserDoc = await getDoc(userRef);
      if (updatedUserDoc.exists()) {
        const updatedUserData = updatedUserDoc.data();
        const newUserData = {
          ...user,
          ...updates,
          ...updatedUserData
        };
        setUser(User.fromFirebase(newUserData));
      } else {
        // Fallback si la récupération échoue
        setUser(prevUser => {
          const updatedUserData = { ...prevUser, ...updates };
          return User.fromFirebase(updatedUserData);
        });
      }
      
      return true;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      return false;
    }
  };

  useEffect(() => {
    // Écouter les changements d'état d'authentification
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && !firebaseUser.emailVerified) {
        setUser(null);
        setLoading(false);
      } else if (firebaseUser) {
        try {
          const userWithData = await fetchUserData(firebaseUser);
          setUser(User.fromFirebase(userWithData));
        } catch (error) {
          console.error("Erreur lors de la récupération des données utilisateur:", error);
          setUser(User.fromFirebase(firebaseUser));
        }
        setLoading(false);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    // Nettoyer l'écouteur lors du démontage
    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    emailNotVerified:
      auth.currentUser &&
      auth.currentUser.email &&
      !auth.currentUser.emailVerified,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
