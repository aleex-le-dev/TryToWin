// Service d'authentification centralisé
// Gère toutes les opérations d'authentification Firebase

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../utils/firebaseConfig";
import { User } from "../models/User";
import { getEmailUrls } from "../constants/emailConfig";

class AuthService {
  // Connexion avec email/mot de passe
  async loginWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return {
        success: true,
        user: User.fromFirebase(userCredential.user),
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        user: null,
        error: this.getErrorMessage(error.code),
      };
    }
  }

  // Création de compte avec email/mot de passe
  async registerWithEmail(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Mise à jour du profil avec le nom d'utilisateur
      await updateProfile(userCredential.user, {
        displayName: displayName,
      });

      // Envoi de l'email de vérification avec configuration SMTP personnalisée
      const emailUrls = getEmailUrls();
      await sendEmailVerification(userCredential.user, {
        url: emailUrls.emailVerification,
        handleCodeInApp: true,
      });

      return {
        success: true,
        user: User.fromFirebase(userCredential.user),
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        user: null,
        error: this.getErrorMessage(error.code),
      };
    }
  }

  // Déconnexion
  async logout() {
    try {
      await signOut(auth);
      return { success: true, error: null };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code),
      };
    }
  }

  // Réinitialisation du mot de passe
  async resetPassword(email) {
    try {
      const emailUrls = getEmailUrls();
      await sendPasswordResetEmail(auth, email, {
        url: emailUrls.passwordReset,
        handleCodeInApp: true,
      });
      return { success: true, error: null };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code),
      };
    }
  }

  // Écouteur d'état d'authentification
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        callback(User.fromFirebase(user));
      } else {
        callback(null);
      }
    });
  }

  // Obtention de l'utilisateur actuel
  getCurrentUser() {
    const user = auth.currentUser;
    return user ? User.fromFirebase(user) : null;
  }

  // Messages d'erreur personnalisés
  getErrorMessage(errorCode) {
    const errorMessages = {
      "auth/user-not-found": "Aucun compte trouvé avec cet email",
      "auth/wrong-password": "Mot de passe incorrect",
      "auth/email-already-in-use": "Cet email est déjà utilisé",
      "auth/weak-password": "Le mot de passe est trop faible",
      "auth/invalid-email": "Format d'email invalide",
      "auth/too-many-requests": "Trop de tentatives. Réessayez plus tard",
      "auth/network-request-failed": "Erreur de connexion réseau",
      "auth/user-disabled": "Ce compte a été désactivé",
      "auth/operation-not-allowed": "Cette opération n'est pas autorisée",
      "auth/invalid-credential": "Identifiants invalides",
    };

    return errorMessages[errorCode] || "Une erreur est survenue";
  }
}

export const authService = new AuthService();
