// Middleware d'authentification
// Protège les routes et vérifie l'authentification des utilisateurs

import { auth } from "../utils/firebaseConfig";
import { authService } from "../services/authService";

class AuthMiddleware {
  // Vérifie si l'utilisateur est authentifié
  static isAuthenticated() {
    return !!auth.currentUser;
  }

  // Vérifie si l'utilisateur a un email vérifié
  static isEmailVerified() {
    const user = auth.currentUser;
    return user ? user.emailVerified : false;
  }

  // Vérifie si l'utilisateur a un profil complet
  static hasCompleteProfile() {
    const user = auth.currentUser;
    if (!user) return false;

    return !!(user.displayName && user.email);
  }

  // Middleware pour protéger une route
  static requireAuth(navigation, redirectTo = "Login") {
    if (!this.isAuthenticated()) {
      navigation.navigate(redirectTo);
      return false;
    }
    return true;
  }

  // Middleware pour vérifier l'email
  static requireEmailVerification(
    navigation,
    redirectTo = "EmailVerification"
  ) {
    if (!this.isEmailVerified()) {
      navigation.navigate(redirectTo);
      return false;
    }
    return true;
  }

  // Middleware pour vérifier le profil complet
  static requireCompleteProfile(navigation, redirectTo = "CompleteProfile") {
    if (!this.hasCompleteProfile()) {
      navigation.navigate(redirectTo);
      return false;
    }
    return true;
  }

  // Vérification de session
  static checkSession() {
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve({
          isAuthenticated: !!user,
          user: user ? authService.getCurrentUser() : null,
          emailVerified: user ? user.emailVerified : false,
        });
      });
    });
  }

  // Gestion des erreurs d'authentification
  static handleAuthError(error, navigation) {
    const errorCode = error.code;

    switch (errorCode) {
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "Identifiants incorrects";

      case "auth/too-many-requests":
        return "Trop de tentatives. Réessayez plus tard";

      case "auth/user-disabled":
        return "Ce compte a été désactivé";

      case "auth/network-request-failed":
        return "Erreur de connexion réseau";

      case "auth/requires-recent-login":
        // Rediriger vers la reconnexion
        navigation.navigate("ReLogin");
        return "Reconnexion requise";

      default:
        return "Une erreur d'authentification est survenue";
    }
  }

  // Vérification des permissions
  static hasPermission(permission) {
    const user = auth.currentUser;
    if (!user) return false;

    // Ici vous pouvez ajouter votre logique de permissions
    // Par exemple, vérifier des claims personnalisés Firebase
    return true; // Par défaut, tous les utilisateurs authentifiés ont accès
  }

  // Middleware pour les permissions
  static requirePermission(
    permission,
    navigation,
    redirectTo = "Unauthorized"
  ) {
    if (!this.hasPermission(permission)) {
      navigation.navigate(redirectTo);
      return false;
    }
    return true;
  }
}

export default AuthMiddleware;
