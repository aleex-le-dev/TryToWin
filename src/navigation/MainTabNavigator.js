import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

// Import des écrans
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import GameDetailsScreen from "../screens/GameDetailsScreen";
import SocialScreen from "../screens/social/SocialScreen";
import Morpion from "../games/Morpion";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack pour l'écran des jeux avec détails
const GamesStack = ({ resetCategoryTrigger, forceHomeReset }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='GamesMain'>
        {(props) => (
          <HomeScreen
            {...props}
            resetCategoryTrigger={resetCategoryTrigger}
            forceHomeReset={forceHomeReset}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name='GameDetails' component={GameDetailsScreen} />
      <Stack.Screen name='Morpion' component={Morpion} />
    </Stack.Navigator>
  );
};

// Navigateur principal avec barre de navigation en bas
const MainTabNavigator = () => {
  const [resetCategoryTrigger, setResetCategoryTrigger] = React.useState(0);
  const [profileTabResetKey, setProfileTabResetKey] = React.useState(0);
  const [forceHomeReset, setForceHomeReset] = React.useState(0);

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
          <GamesStack
            resetCategoryTrigger={resetCategoryTrigger}
            forceHomeReset={forceHomeReset}
          />
        )}
        options={{
          title: "Jeux",
          unmountOnBlur: true,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Empêcher le comportement par défaut
            e.preventDefault();

            // Réinitialiser la catégorie
            setResetCategoryTrigger((t) => t + 1);

            // Forcer le retour à l'accueil
            setForceHomeReset((r) => r + 1);

            // Naviguer vers l'écran principal
            navigation.navigate("Games", { screen: "GamesMain" });
          },
        })}
      />
      <Tab.Screen
        name='Profile'
        children={(props) => (
          <ProfileScreen {...props} key={profileTabResetKey} />
        )}
        options={{
          title: "Profil",
          unmountOnBlur: true,
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
