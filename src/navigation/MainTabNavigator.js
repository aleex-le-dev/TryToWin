import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

// Import des écrans
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import GameDetailsScreen from "../screens/GameDetailsScreen";
import SocialScreen from "../screens/SocialScreen";
import Morpion from "../games/TicTacToe";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack pour l'écran des jeux avec détails
const GamesStack = ({ resetCategoryTrigger }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='GamesMain'>
        {(props) => (
          <HomeScreen {...props} resetCategoryTrigger={resetCategoryTrigger} />
        )}
      </Stack.Screen>
      <Stack.Screen name='GameDetails' component={GameDetailsScreen} />
      <Stack.Screen name='TicTacToe' component={Morpion} />
    </Stack.Navigator>
  );
};

// Navigateur principal avec barre de navigation en bas
const MainTabNavigator = () => {
  const [resetCategoryTrigger, setResetCategoryTrigger] = React.useState(0);
  const [profileTabResetKey, setProfileTabResetKey] = React.useState(0);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Games") {
            iconName = focused ? "game-controller" : "game-controller-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "Social") {
            iconName = focused ? "people" : "people-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#667eea",
        tabBarInactiveTintColor: "#6c757d",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#e9ecef",
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3.84,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        headerShown: false,
      })}>
      <Tab.Screen
        name='Games'
        children={() => (
          <GamesStack resetCategoryTrigger={resetCategoryTrigger} />
        )}
        options={{
          title: "Jeux",
          unmountOnBlur: true,
        }}
        listeners={{
          tabPress: () => setResetCategoryTrigger((t) => t + 1),
        }}
      />
      <Tab.Screen
        name='Profile'
        children={() => (
          <ProfileScreen profileTabResetKey={profileTabResetKey} />
        )}
        options={{
          title: "Profil",
        }}
        listeners={{
          tabPress: () => setProfileTabResetKey((k) => k + 1),
        }}
      />
      <Tab.Screen
        name='Social'
        component={SocialScreen}
        options={{
          title: "Social",
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
