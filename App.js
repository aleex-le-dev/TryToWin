import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { ToastProvider } from './src/contexts/ToastContext';
import AppNavigator from './src/navigation/AppNavigator';
import CustomToast from './src/components/CustomToast';
import { AccessibilityProvider } from './src/contexts/AccessibilityContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { UnreadMessagesProvider } from './src/contexts/UnreadMessagesContext';
import ThemedApp from './src/components/ThemedApp';
import ThemedStatusBar from './src/components/ThemedStatusBar';

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <AuthProvider>
          <ToastProvider>
            <AccessibilityProvider>
              <ThemeProvider>
                <UnreadMessagesProvider>
                  <ThemedStatusBar />
                  <ThemedApp>
                    <AppNavigator />
                  </ThemedApp>
                  <CustomToast />
                </UnreadMessagesProvider>
              </ThemeProvider>
            </AccessibilityProvider>
          </ToastProvider>
        </AuthProvider>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
