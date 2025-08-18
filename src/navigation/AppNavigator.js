import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ActivityIndicator, View, StyleSheet } from "react-native";

// Import des écrans
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import MainTabNavigator from "./MainTabNavigator";
import { useAuth } from "../contexts/AuthContext";
import EmailValidationScreen from "../screens/auth/EmailValidationScreen";
import SettingsScreen from "../screens/social/SettingsScreen";
import BlockedUsersScreen from "../screens/social/BlockedUsersScreen";
import AccessibilitySettings from "../screens/settingsPage/AccessibilitySettings";
import AccountSettings from "../screens/settingsPage/AccountSettings";
import AppearanceSettings from "../screens/settingsPage/AppearanceSettings";
import DeviceSettings from "../screens/settingsPage/DeviceSettings";
import DonateScreen from "../screens/settingsPage/DonateScreen";
import LanguageSettings from "../screens/settingsPage/LanguageSettings";
import PrivacySettings from "../screens/settingsPage/PrivacySettings";
import ShopScreen from "../screens/settingsPage/ShopScreen";
import SupportScreen from "../screens/settingsPage/SupportScreen";

const Stack = createStackNavigator();

// Écran de chargement pendant la vérification de l'authentification
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size='large' color='#667eea' />
  </View>
);

// Navigateur principal de l'application avec gestion de l'authentification
const AppNavigator = () => {
  const { user, loading } = useAuth();

  // Afficher l'écran de chargement pendant la vérification de l'authentification
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName={user ? "MainTabs" : "Login"}>
        {/* Écrans d'authentification - affichés seulement si l'utilisateur n'est pas connecté */}
        {!user && (
          <>
            <Stack.Screen
              name='Login'
              component={LoginScreen}
              options={{
                title: "Connexion",
              }}
            />
            <Stack.Screen
              name='Register'
              component={RegisterScreen}
              options={{
                title: "Inscription",
              }}
            />
            <Stack.Screen
              name='EmailValidation'
              component={EmailValidationScreen}
              options={{
                title: "Validation email",
              }}
            />
          </>
        )}
        {/* Écrans principaux après authentification - affichés seulement si l'utilisateur est connecté */}
        {user && (
          <>
            <Stack.Screen
              name='MainTabs'
              component={MainTabNavigator}
              options={{
                title: "TryToWin",
              }}
            />
            <Stack.Screen
              name='Settings'
              component={SettingsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name='BlockedUsers'
              component={BlockedUsersScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name='AccessibilitySettings' component={AccessibilitySettings} options={{ headerShown: false }} />
            <Stack.Screen name='AccountSettings' options={{ headerShown: false }}>{(p) => <AccountSettings {...p} />}</Stack.Screen>
            <Stack.Screen name='AppearanceSettings' options={{ headerShown: false }}>{(p) => <AppearanceSettings {...p} />}</Stack.Screen>
            <Stack.Screen name='DeviceSettings' options={{ headerShown: false }}>{(p) => <DeviceSettings {...p} />}</Stack.Screen>
            <Stack.Screen name='DonateScreen' options={{ headerShown: false }}>{(p) => <DonateScreen {...p} />}</Stack.Screen>
            <Stack.Screen name='LanguageSettings' options={{ headerShown: false }}>{(p) => <LanguageSettings {...p} />}</Stack.Screen>
            <Stack.Screen name='PrivacySettings' options={{ headerShown: false }}>{(p) => <PrivacySettings {...p} />}</Stack.Screen>
            <Stack.Screen name='ShopScreen' options={{ headerShown: false }}>{(p) => <ShopScreen {...p} />}</Stack.Screen>
            <Stack.Screen name='SupportScreen' options={{ headerShown: false }}>{(p) => <SupportScreen {...p} />}</Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#667eea",
  },
});

export default AppNavigator;
