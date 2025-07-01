import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/utils/AuthContext";

// Application principale TryToWin
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
        <Toast />
        <StatusBar style='light' />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
