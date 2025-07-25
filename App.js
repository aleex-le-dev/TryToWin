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
import SettingsScreen from "./src/screens/social/SettingsScreen";
import { LogBox } from "react-native";

// Ignorer les avertissements Reanimated de react-native-chessboard
LogBox.ignoreLogs([
  "[Reanimated] Reading from `value` during component render",
  "[Reanimated] Reading from `value` during component render. Please ensure that you don't access the `value` property nor use `get` method of a shared value while React is rendering a component.",
]);

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
