// Système centralisé de gestion des erreurs
// Gère toutes les erreurs du projet avec logging console

import { colors } from "../constants/colors";

class ErrorHandler {
  constructor() {
    this.isDevelopment = __DEV__;
    this.errorCount = 0;
  }

  // Log d'erreur avec style console
  logError(error, context = "") {
    // Désactiver les logs console en runtime pour un app propre
    this.errorCount++;
    const timestamp = new Date().toISOString();
    if (!this.isDevelopment) {
      this.logToFile(error, context, timestamp);
    }
  }

  // Log d'avertissement
  logWarning(_message, _context = "") {}

  // Log d'information
  logInfo(_message, _context = "") {}

  // Log de succès
  logSuccess(_message, _context = "") {}

  // Gestion des erreurs d'authentification
  handleAuthError(error, context = "Authentication") {
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

    const userMessage =
      errorMessages[error.code] || "Une erreur d'authentification est survenue";

    this.logError(error, context);

    return {
      success: false,
      error: userMessage,
      code: error.code,
      originalError: error,
    };
  }

  // Gestion des erreurs de validation
  handleValidationError(errors, context = "Validation") {
    this.logWarning(
      `Erreurs de validation: ${JSON.stringify(errors)}`,
      context
    );

    return {
      success: false,
      errors: errors,
      message: "Veuillez corriger les erreurs dans le formulaire",
    };
  }

  // Gestion des erreurs réseau
  handleNetworkError(error, context = "Network") {
    this.logError(error, context);

    return {
      success: false,
      error: "Erreur de connexion réseau. Vérifiez votre connexion internet.",
      code: "NETWORK_ERROR",
    };
  }

  // Gestion des erreurs API
  handleApiError(error, context = "API") {
    this.logError(error, context);

    let userMessage = "Une erreur serveur est survenue";

    if (error.response) {
      switch (error.response.status) {
        case 400:
          userMessage = "Requête invalide";
          break;
        case 401:
          userMessage = "Non autorisé";
          break;
        case 403:
          userMessage = "Accès interdit";
          break;
        case 404:
          userMessage = "Ressource non trouvée";
          break;
        case 500:
          userMessage = "Erreur serveur";
          break;
        default:
          userMessage = error.response.data?.message || userMessage;
      }
    }

    return {
      success: false,
      error: userMessage,
      status: error.response?.status,
      code: "API_ERROR",
    };
  }

  // Gestion des erreurs de navigation
  handleNavigationError(error, context = "Navigation") {
    this.logError(error, context);

    return {
      success: false,
      error: "Erreur de navigation",
      code: "NAVIGATION_ERROR",
    };
  }

  // Gestion des erreurs de base de données
  handleDatabaseError(error, context = "Database") {
    this.logError(error, context);

    return {
      success: false,
      error: "Erreur de base de données",
      code: "DATABASE_ERROR",
    };
  }

  // Log vers fichier (pour production)
  logToFile(error, context, timestamp) {
    // Implémentation pour sauvegarder les erreurs dans un fichier
    // ou envoyer vers un service de monitoring
    const errorLog = {
      timestamp,
      context,
      message: error.message || error,
      code: error.code,
      stack: error.stack,
    };

    // Ici vous pouvez implémenter l'envoi vers un service
    // comme Sentry, LogRocket, ou un fichier local
    // Redirigez vers un service externe si nécessaire
  }

  // Récupération des statistiques d'erreurs
  getErrorStats() {
    return {
      totalErrors: this.errorCount,
      isDevelopment: this.isDevelopment,
      timestamp: new Date().toISOString(),
    };
  }

  // Réinitialisation du compteur d'erreurs
  resetErrorCount() {
    this.errorCount = 0;
    // No-op en production
  }
}

// Instance singleton
export const errorHandler = new ErrorHandler();

// Fonctions utilitaires pour un usage plus simple
export const logError = (error, context) =>
  errorHandler.logError(error, context);
export const logWarning = (message, context) =>
  errorHandler.logWarning(message, context);
export const logInfo = (message, context) =>
  errorHandler.logInfo(message, context);
export const logSuccess = (message, context) =>
  errorHandler.logSuccess(message, context);

// Gestionnaires spécialisés
export const handleAuthError = (error, context) =>
  errorHandler.handleAuthError(error, context);
export const handleValidationError = (errors, context) =>
  errorHandler.handleValidationError(errors, context);
export const handleNetworkError = (error, context) =>
  errorHandler.handleNetworkError(error, context);
export const handleApiError = (error, context) =>
  errorHandler.handleApiError(error, context);
export const handleNavigationError = (error, context) =>
  errorHandler.handleNavigationError(error, context);
export const handleDatabaseError = (error, context) =>
  errorHandler.handleDatabaseError(error, context);
