import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { View, Text, StyleSheet } from "react-native";
import { useUnreadMessages } from "../contexts/UnreadMessagesContext";

// Import des écrans
import GameScreen from "../screens/jeux/GameScreen";
import ProfileScreen from "../screens/profil/ProfileScreen";
import GameDetailsScreen from "../screens/jeux/GameDetailsScreen";
import SocialScreen from "../screens/social/SocialScreen";
import Morpion from "../games/morpion/Morpion";
import Puissance4 from "../games/puissance4/Puissance4";
import Othello from "../games/othello/Othello";
import Echec from "../games/echec/Echec";
import PlayerCardScreen from "../screens/profil/PlayerCardScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack pour l'écran des jeux avec détails
const GamesStack = ({ resetCategoryTrigger, forceHomeReset }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='GamesMain'>
        {(props) => (
          <GameScreen
            {...props}
            resetCategoryTrigger={resetCategoryTrigger}
            forceHomeReset={forceHomeReset}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name='GameDetails' component={GameDetailsScreen} />
      <Stack.Screen name='Morpion' component={Morpion} />
      <Stack.Screen name='Puissance4' component={Puissance4} />
      <Stack.Screen name='Othello' component={Othello} />
      <Stack.Screen name='Echec' component={Echec} />
      <Stack.Screen name='PlayerCard' component={PlayerCardScreen} />
    </Stack.Navigator>
  );
};

// Composant pour l'icône avec pastille de notification
const TabBarIcon = ({ name, focused, color, size, badgeCount = 0 }) => (
  <View style={{ position: 'relative' }}>
    <Ionicons name={name} size={size} color={color} />
    {badgeCount > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {badgeCount > 99 ? '99+' : badgeCount}
        </Text>
      </View>
    )}
  </View>
);

// Navigateur principal avec barre de navigation en bas
const MainTabNavigator = () => {
  const [resetCategoryTrigger, setResetCategoryTrigger] = React.useState(0);
  const [profileTabResetKey, setProfileTabResetKey] = React.useState(0);
  const [socialTabResetKey, setSocialTabResetKey] = React.useState(0);
  const [forceHomeReset, setForceHomeReset] = React.useState(0);
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { getTotalUnreadMessages } = useUnreadMessages();

  // Détection si on est sur Android avec navigation par geste
  const isAndroidWithGestureNav = Platform.OS === 'android' && insets.bottom > 0;
  const bottomPadding = isAndroidWithGestureNav ? Math.max(insets.bottom, 10) : 5;
  const tabBarHeight = isAndroidWithGestureNav ? 60 + Math.max(insets.bottom, 10) : 60;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let badgeCount = 0;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Games') {
            iconName = focused ? 'game-controller' : 'game-controller-outline';
          } else if (route.name === 'Social') {
            iconName = focused ? 'people' : 'people-outline';
            badgeCount = getTotalUnreadMessages();
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return (
            <TabBarIcon 
              name={iconName} 
              focused={focused} 
              color={color} 
              size={size} 
              badgeCount={badgeCount}
            />
          );
        },
        tabBarActiveTintColor: "#667eea",
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          paddingBottom: bottomPadding,
          paddingTop: 5,
          height: tabBarHeight,
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
          color: theme.text,
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
        children={(props) => (
          <SocialScreen {...props} key={socialTabResetKey} />
        )}
        options={{
          title: "Social",
          unmountOnBlur: true,
        }}
        listeners={{
          tabPress: () => setSocialTabResetKey((k) => k + 1),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
