import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ActivityIndicator, View, StyleSheet } from "react-native";

// Import des écrans
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import MainTabNavigator from "./MainTabNavigator";
import { useAuth } from "../contexts/AuthContext";

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
          </>
        )}
        {/* Écrans principaux après authentification - affichés seulement si l'utilisateur est connecté */}
        {user && (
          <Stack.Screen
            name='MainTabs'
            component={MainTabNavigator}
            options={{
              title: "TryToWin",
            }}
          />
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
