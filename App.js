import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/contexts/AuthContext";
import {
  setupGlobalErrorHandling,
  testErrorHandling,
} from "./src/utils/globalErrorHandler";
import { logInfo, logSuccess } from "./src/utils/errorHandler";
import { ToastProvider } from "./src/contexts/ToastContext";

// Application principale TryToWin
export default function App() {
  React.useEffect(() => {
    // Initialisation du système de gestion d'erreurs
    logInfo("Démarrage de l'application TryToWin", "App");
    setupGlobalErrorHandling();

    // Test du système d'erreurs (optionnel, à retirer en production)
    if (__DEV__) {
      setTimeout(() => {
        testErrorHandling();
      }, 2000);
    }

    logSuccess("Application TryToWin initialisée avec succès", "App");
  }, []);

  return (
    <ToastProvider>
      <SafeAreaProvider>
        <AuthProvider>
          <AppNavigator />
          <Toast />
          <StatusBar style='light' />
        </AuthProvider>
      </SafeAreaProvider>
    </ToastProvider>
  );
}
