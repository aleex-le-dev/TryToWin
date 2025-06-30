import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Import des écrans
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import MainTabNavigator from "./MainTabNavigator";

const Stack = createStackNavigator();

// Navigateur principal de l'application
const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        {!isAuthenticated ? (
          // Écrans d'authentification
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
        ) : (
          // Écrans principaux après authentification
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

export default AppNavigator;
