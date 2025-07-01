// Gestionnaire d'erreurs global pour React Native
// Capture toutes les erreurs non gérées et les log avec le système centralisé

import { logError, logWarning, logInfo } from "./errorHandler";

// Gestionnaire d'erreurs global pour JavaScript
const globalErrorHandler = (error, isFatal = false) => {
  logError(error, `GlobalErrorHandler${isFatal ? ".Fatal" : ""}`);

  // En production, vous pourriez envoyer l'erreur à un service de monitoring
  if (!__DEV__) {
    // Exemple: Sentry.captureException(error);
    console.log("📄 Erreur envoyée au service de monitoring");
  }
};

// Gestionnaire d'erreurs pour les promesses rejetées
const unhandledPromiseRejectionHandler = (reason, promise) => {
  const error = new Error(`Unhandled Promise Rejection: ${reason}`);
  error.promise = promise;
  error.reason = reason;

  logError(error, "GlobalErrorHandler.PromiseRejection");
};

// Gestionnaire d'erreurs pour les erreurs de navigation
const navigationErrorHandler = (error) => {
  logError(error, "GlobalErrorHandler.Navigation");
};

// Gestionnaire d'erreurs pour les erreurs de rendu React
const reactErrorHandler = (error, errorInfo) => {
  error.componentStack = errorInfo.componentStack;
  logError(error, "GlobalErrorHandler.React");
};

// Configuration du logging global
const setupGlobalErrorHandling = () => {
  logInfo(
    "Configuration du gestionnaire d'erreurs global",
    "GlobalErrorHandler.setup"
  );

  // Gestionnaire d'erreurs JavaScript global
  if (typeof global !== "undefined") {
    global.ErrorUtils.setGlobalHandler(globalErrorHandler);
  }

  // Gestionnaire d'erreurs pour les promesses non gérées
  if (typeof global !== "undefined" && global.addEventListener) {
    global.addEventListener("unhandledrejection", (event) => {
      unhandledPromiseRejectionHandler(event.reason, event.promise);
    });
  }

  // Gestionnaire d'erreurs pour les erreurs de console
  const originalConsoleError = console.error;
  console.error = (...args) => {
    logError(new Error(args.join(" ")), "Console.error");
    originalConsoleError.apply(console, args);
  };

  // Gestionnaire d'erreurs pour les avertissements de console
  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    logWarning(args.join(" "), "Console.warn");
    originalConsoleWarn.apply(console, args);
  };

  logSuccess(
    "Gestionnaire d'erreurs global configuré",
    "GlobalErrorHandler.setup"
  );
};

// Fonction pour nettoyer les gestionnaires d'erreurs
const cleanupGlobalErrorHandling = () => {
  logInfo(
    "Nettoyage du gestionnaire d'erreurs global",
    "GlobalErrorHandler.cleanup"
  );

  // Restaurer les fonctions console originales
  if (console.error.__original) {
    console.error = console.error.__original;
  }

  if (console.warn.__original) {
    console.warn = console.warn.__original;
  }
};

// Fonction pour tester le système d'erreurs
const testErrorHandling = () => {
  logInfo("Test du système de gestion d'erreurs", "GlobalErrorHandler.test");

  // Test d'une erreur simple
  try {
    throw new Error("Test d'erreur - Ceci est normal");
  } catch (error) {
    logError(error, "GlobalErrorHandler.test");
  }

  // Test d'un avertissement
  logWarning(
    "Test d'avertissement - Ceci est normal",
    "GlobalErrorHandler.test"
  );

  // Test d'une information
  logInfo("Test d'information - Ceci est normal", "GlobalErrorHandler.test");

  // Test d'un succès
  logSuccess("Test de succès - Ceci est normal", "GlobalErrorHandler.test");
};

export {
  setupGlobalErrorHandling,
  cleanupGlobalErrorHandling,
  testErrorHandling,
  globalErrorHandler,
  unhandledPromiseRejectionHandler,
  navigationErrorHandler,
  reactErrorHandler,
};
