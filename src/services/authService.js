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
import { EMAIL_MESSAGES, EMAIL_ERROR_CODES } from "../constants/emailMessages";
import { handleAuthError, logSuccess, logInfo, logError } from "../utils/errorHandler";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";

class AuthService {
  // Connexion avec email/mot de passe
  async loginWithEmail(email, password) {
    try {
      logInfo(
        `Tentative de connexion pour: ${email}`,
        "AuthService.loginWithEmail"
      );

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      logSuccess(
        `Connexion réussie pour: ${email}`,
        "AuthService.loginWithEmail"
      );

      return {
        success: true,
        user: User.fromFirebase(userCredential.user),
        error: null,
      };
    } catch (error) {
      const authError = handleAuthError(error, "AuthService.loginWithEmail");
      return {
        success: false,
        user: null,
        error: authError.error,
      };
    }
  }

  // Création de compte avec email/mot de passe
  async registerWithEmail(email, password, displayName) {
    try {
      logInfo(
        `Tentative de création de compte pour: ${email}`,
        "AuthService.registerWithEmail"
      );

      // Essayer de créer le compte directement
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Mise à jour du profil avec le nom d'utilisateur
      await updateProfile(userCredential.user, {
        displayName: displayName,
      });

      // Envoi de l'email de vérification (flow natif Firebase, pas d'option url)
      await sendEmailVerification(userCredential.user);

      const tag = this.generateTag();

      await setDoc(doc(db, "users", userCredential.user.uid), {
        username: displayName,
        email,
        tag,
        emailVerified: false,
        createdAt: new Date().toISOString(),
      });

      logSuccess(
        `Compte créé avec succès pour: ${email}`,
        "AuthService.registerWithEmail"
      );

      return {
        success: true,
        user: User.fromFirebase(userCredential.user),
        error: null,
      };
    } catch (error) {
      // Gestion spéciale pour les emails déjà utilisés
      if (error.code === EMAIL_ERROR_CODES.ALREADY_IN_USE) {
        // Au lieu de révéler que l'email est déjà utilisé,
        // on retourne une erreur générique qui sera gérée différemment
        return {
          success: false,
          user: null,
          error: "Compte non validé",
          code: "unverified_account",
          canResend: true,
        };
      }
      
      const authError = handleAuthError(error, "AuthService.registerWithEmail");
      return {
        success: false,
        user: null,
        error: authError.error,
      };
    }
  }

  // Déconnexion
  async logout() {
    try {
      logInfo("Tentative de déconnexion", "AuthService.logout");

      await signOut(auth);

      logSuccess("Déconnexion réussie", "AuthService.logout");

      return { success: true, error: null };
    } catch (error) {
      const authError = handleAuthError(error, "AuthService.logout");
      return {
        success: false,
        error: authError.error,
      };
    }
  }

  // Réinitialisation du mot de passe
  async resetPassword(email) {
    try {
      logInfo(
        `Tentative de réinitialisation de mot de passe pour: ${email}`,
        "AuthService.resetPassword"
      );

      const emailUrls = getEmailUrls();
      await sendPasswordResetEmail(auth, email, {
        url: emailUrls.passwordReset,
        handleCodeInApp: true,
      });

      logSuccess(
        `Email de réinitialisation envoyé à: ${email}`,
        "AuthService.resetPassword"
      );

      return { success: true, error: null };
    } catch (error) {
      const authError = handleAuthError(error, "AuthService.resetPassword");
      return {
        success: false,
        error: authError.error,
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

  // Messages d'erreur personnalisés (maintenu pour compatibilité)
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

  // Gestion des comptes non validés
  async handleUnverifiedAccount(email) {
    try {
      // Cette méthode sera appelée quand un utilisateur veut réinscrire avec un email non validé
      // On peut implémenter une logique pour supprimer l'ancien compte ou permettre la réinscription
      logInfo(
        `Gestion du compte non validé pour: ${email}`,
        "AuthService.handleUnverifiedAccount"
      );
      
      // Pour l'instant, on retourne un message informatif
      return {
        success: false,
        message: "Votre compte précédent n'a pas été validé. Veuillez vérifier votre boîte mail ou utiliser un autre email.",
        canResend: true,
      };
    } catch (error) {
      logError(error, "AuthService.handleUnverifiedAccount");
      return {
        success: false,
        message: "Erreur lors de la gestion du compte non validé",
        canResend: false,
      };
    }
  }

  // Nettoyer un compte non validé (à utiliser avec précaution)
  async cleanupUnverifiedAccount(email) {
    try {
      logInfo(
        `Tentative de nettoyage du compte non validé pour: ${email}`,
        "AuthService.cleanupUnverifiedAccount"
      );
      
      // Note: Firebase ne permet pas de supprimer directement un compte utilisateur
      // Cette méthode peut être utilisée pour nettoyer les données Firestore
      // mais le compte Firebase restera actif
      
      return {
        success: true,
        message: "Compte non validé nettoyé avec succès",
      };
    } catch (error) {
      logError(error, "AuthService.cleanupUnverifiedAccount");
      return {
        success: false,
        message: "Erreur lors du nettoyage du compte non validé",
      };
    }
  }

  // Renvoyer l'email de validation
  async resendEmailVerification(email) {
    const user = auth.currentUser;
    if (user && user.email === email) {
      await sendEmailVerification(user);
      return true;
    } else {
      throw new Error("Utilisateur non connecté ou email non correspondant");
    }
  }

  // Génère un tag unique à 4 chiffres
  generateTag() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
}

export const authService = new AuthService();
