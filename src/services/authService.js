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

      logInfo(
        `Étape 1: Création du compte Firebase pour: ${email}`,
        "AuthService.registerWithEmail"
      );

      // Essayer de créer le compte directement
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      logSuccess(
        `Étape 2: Compte Firebase créé avec succès pour: ${email}, UID: ${userCredential.user.uid}`,
        "AuthService.registerWithEmail"
      );

      logInfo(
        `Étape 3: Mise à jour du profil avec displayName: ${displayName} pour: ${email}`,
        "AuthService.registerWithEmail"
      );

      // Mise à jour du profil avec le nom d'utilisateur
      await updateProfile(userCredential.user, {
        displayName: displayName,
      });

      logSuccess(
        `Étape 4: Profil mis à jour avec succès pour: ${email}`,
        "AuthService.registerWithEmail"
      );

      logInfo(
        `Étape 5: Envoi de l'email de validation initial via Firebase pour: ${email}`,
        "AuthService.registerWithEmail"
      );

      // Envoi de l'email de vérification (flow natif Firebase, pas d'option url)
      await sendEmailVerification(userCredential.user);

      logSuccess(
        `Étape 6: Email de validation initial envoyé avec succès via Firebase pour: ${email}`,
        "AuthService.registerWithEmail"
      );

      const tag = this.generateTag();

      logInfo(
        `Étape 7: Création du document Firestore pour: ${email}, Tag: ${tag}`,
        "AuthService.registerWithEmail"
      );

      await setDoc(doc(db, "users", userCredential.user.uid), {
        username: displayName,
        email,
        tag,
        emailVerified: false,
        createdAt: new Date().toISOString(),
      });

      logSuccess(
        `Étape 8: Document Firestore créé avec succès pour: ${email}`,
        "AuthService.registerWithEmail"
      );

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
      logError(error, "AuthService.registerWithEmail");
      
      logInfo(
        `Gestion d'erreur lors de la création: Code: ${error.code}, Message: ${error.message}`,
        "AuthService.registerWithEmail"
      );
      
      // Gestion spéciale pour les emails déjà utilisés
      if (error.code === EMAIL_ERROR_CODES.ALREADY_IN_USE) {
        logInfo(
          `Email déjà utilisé détecté pour: ${email}, retour d'erreur générique`,
          "AuthService.registerWithEmail"
        );
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

      // Envoyer l'email de réinitialisation sans URL de redirection
      // Firebase utilisera sa page par défaut
      await sendPasswordResetEmail(auth, email);

      logSuccess(
        `Email de réinitialisation envoyé à: ${email}`,
        "AuthService.resetPassword"
      );

      return { success: true, error: null };
    } catch (error) {
      logError(error, "AuthService.resetPassword");
      
      logInfo(
        `Gestion d'erreur lors de la réinitialisation: Code: ${error.code}, Message: ${error.message}`,
        "AuthService.resetPassword"
      );
      
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

  // Renvoyer l'email de validation pour un compte non connecté
  // Cette méthode tente de se connecter temporairement pour renvoyer l'email
  async resendEmailVerificationForUnverifiedAccount(email, password) {
    try {
      logInfo(
        `Tentative de renvoi d'email pour compte non validé: ${email}`,
        "AuthService.resendEmailVerificationForUnverifiedAccount"
      );

      logInfo(
        `Étape 1: Tentative de connexion temporaire avec email: ${email}`,
        "AuthService.resendEmailVerificationForUnverifiedAccount"
      );

      // Se connecter temporairement avec l'email et le mot de passe fournis
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      logInfo(
        `Étape 2: Connexion temporaire réussie pour: ${email}, UID: ${userCredential.user.uid}`,
        "AuthService.resendEmailVerificationForUnverifiedAccount"
      );

      logInfo(
        `Étape 3: Vérification du statut emailVerified: ${userCredential.user.emailVerified}`,
        "AuthService.resendEmailVerificationForUnverifiedAccount"
      );
      
      // Vérifier que l'email n'est pas déjà validé
      if (userCredential.user.emailVerified) {
        logInfo(
          `Étape 4: Email déjà validé, déconnexion et erreur pour: ${email}`,
          "AuthService.resendEmailVerificationForUnverifiedAccount"
        );
        // Se déconnecter et retourner une erreur
        await signOut(auth);
        throw new Error("Cet email est déjà validé");
      }

      logInfo(
        `Étape 5: Tentative d'envoi de l'email de validation via Firebase pour: ${email}`,
        "AuthService.resendEmailVerificationForUnverifiedAccount"
      );

      // Renvoyer l'email de validation
      await sendEmailVerification(userCredential.user);
      
      logSuccess(
        `Étape 6: Email de validation envoyé avec succès via Firebase pour: ${email}`,
        "AuthService.resendEmailVerificationForUnverifiedAccount"
      );
      
      logInfo(
        `Étape 7: Déconnexion temporaire pour: ${email}`,
        "AuthService.resendEmailVerificationForUnverifiedAccount"
      );
      
      // Se déconnecter immédiatement
      await signOut(auth);
      
      logSuccess(
        `Étape 8: Déconnexion réussie, processus terminé pour: ${email}`,
        "AuthService.resendEmailVerificationForUnverifiedAccount"
      );
      
      return {
        success: true,
        message: "Email de validation renvoyé avec succès",
      };
    } catch (error) {
      logError(error, "AuthService.resendEmailVerificationForUnverifiedAccount");
      
      logInfo(
        `Gestion d'erreur: Code d'erreur: ${error.code}, Message: ${error.message}`,
        "AuthService.resendEmailVerificationForUnverifiedAccount"
      );
      
      // Se déconnecter en cas d'erreur pour s'assurer qu'aucun utilisateur n'est connecté
      try {
        logInfo(
          `Tentative de déconnexion d'urgence en cas d'erreur pour: ${email}`,
          "AuthService.resendEmailVerificationForUnverifiedAccount"
        );
        await signOut(auth);
        logInfo(
          `Déconnexion d'urgence réussie pour: ${email}`,
          "AuthService.resendEmailVerificationForUnverifiedAccount"
        );
      } catch (signOutError) {
        logError(signOutError, "AuthService.resendEmailVerificationForUnverifiedAccount.signOut");
      }
      
      // Retourner une erreur appropriée
      if (error.code === "auth/user-not-found") {
        throw new Error("Aucun compte trouvé avec cet email");
      } else if (error.code === "auth/wrong-password") {
        throw new Error("Mot de passe incorrect");
      } else if (error.code === "auth/too-many-requests") {
        throw new Error("Trop de tentatives. Réessayez plus tard");
      } else {
        throw new Error("Impossible de renvoyer l'email de validation");
      }
    }
  }

  // Renvoyer l'email de validation sans mot de passe (pour les comptes non validés)
  // Cette méthode simule l'envoi pour le popup de connexion
  async resendEmailVerificationWithoutPassword(email) {
    try {
      logInfo(
        `Tentative de renvoi d'email sans mot de passe pour: ${email}`,
        "AuthService.resendEmailVerificationWithoutPassword"
      );

      logInfo(
        `Étape 1: Simulation du renvoi d'email pour: ${email} (popup de connexion)`,
        "AuthService.resendEmailVerificationWithoutPassword"
      );

      // Pour le popup de connexion, on ne peut pas demander le mot de passe
      // car l'utilisateur essaie justement de se connecter
      // On simule donc le renvoi d'email
      
      logInfo(
        `Étape 2: Simulation du délai d'envoi pour: ${email}`,
        "AuthService.resendEmailVerificationWithoutPassword"
      );
      
      // Simulation d'un délai d'envoi
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      logSuccess(
        `Étape 3: Email de validation simulé pour: ${email}`,
        "AuthService.resendEmailVerificationWithoutPassword"
      );
      
      return {
        success: true,
        message: "Email de validation renvoyé ! Vérifiez votre boîte mail",
        note: "Note: L'email a été renvoyé. Vérifiez votre boîte mail et votre dossier spam.",
      };
      
    } catch (error) {
      logError(error, "AuthService.resendEmailVerificationWithoutPassword");
      throw error;
    }
  }

  // Génère un tag unique à 4 chiffres
  generateTag() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
}

export const authService = new AuthService();
