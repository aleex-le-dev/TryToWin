import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { ToastProvider } from './src/contexts/ToastContext';
import AppNavigator from './src/navigation/AppNavigator';
import CustomToast from './src/components/CustomToast';
import { AccessibilityProvider } from './src/contexts/AccessibilityContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import ThemedApp from './src/components/ThemedApp';
import ThemedStatusBar from './src/components/ThemedStatusBar';

export default function App() {
  return (
    <View style={styles.container}>
      <AuthProvider>
        <ToastProvider>
          <AccessibilityProvider>
            <ThemeProvider>
              <ThemedStatusBar />
              <ThemedApp>
                <AppNavigator />
                <CustomToast />
              </ThemedApp>
            </ThemeProvider>
          </AccessibilityProvider>
        </ToastProvider>
      </AuthProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
