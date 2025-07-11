// Contexte d'authentification pour gérer l'état de connexion
// Utilisé dans toute l'application pour vérifier si l'utilisateur est connecté

import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../utils/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
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

  useEffect(() => {
    // Écouter les changements d'état d'authentification
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.warn(
        "[DEBUG] Auth state changed:",
        firebaseUser ? firebaseUser.email : "No user"
      );
      if (firebaseUser && !firebaseUser.emailVerified) {
        setUser(null);
      } else {
        setUser(firebaseUser ? User.fromFirebase(firebaseUser) : null);
      }
      setLoading(false);
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
