import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import { useIsFocused } from "@react-navigation/native";
import { gamesData } from "../constants/gamesData";
import { dailyChallenges } from "../constants/dailyChallenges";
import { categories } from "../constants/categories";

const { width } = Dimensions.get("window");

// Composant GameCard : carte de jeu moderne avec gestion de l'appui (pressed)
function GameCard({ item, onPress }) {
  const [pressed, setPressed] = React.useState(false);
  return (
    <TouchableOpacity
      style={[styles.gameCard, pressed && styles.gameCardPressed]}
      onPress={onPress}
      activeOpacity={0.85}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}>
      <LinearGradient
        colors={[item.color, item.color + "cc"]}
        style={styles.gameCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <View style={styles.gameCardContent}>
          <Text style={styles.gameIconCentered}>{item.image}</Text>
          <Text style={styles.gameTitleModern}>{item.title}</Text>
          <Text style={styles.gameDescriptionModern}>{item.description}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// Écran d'accueil fusionné avec liste des jeux
const HomeScreen = ({ navigation, resetCategoryTrigger }) => {
  const { user, loading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [profile, setProfile] = useState(null);
  const isFocused = useIsFocused();

  const filteredGames = gamesData.filter((game) => {
    return selectedCategory === "Tous" || game.category === selectedCategory;
  });

  // Récupération du profil utilisateur depuis Firestore
  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.uid) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data());
            console.log("Profil Firestore:", docSnap.data());
          }
        } catch (error) {
          console.log("Erreur lors de la récupération du profil:", error);
        }
      }
    };

    fetchProfile();
  }, [user, isFocused]);

  // Réinitialise la catégorie à "Tous" à chaque clic sur l'onglet Jeux (via resetCategoryTrigger)
  useEffect(() => {
    setSelectedCategory("Tous");
  }, [resetCategoryTrigger]);

  // Utilisation du composant GameCard dans renderGameCard
  const renderGameCard = ({ item }) => (
    <GameCard
      item={item}
      onPress={() => {
        // Passe simplement l'id = title
        navigation.navigate("GameDetails", {
          game: { ...item, id: item.title },
        });
      }}
    />
  );

  const renderCategoryButton = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item && styles.categoryButtonActive,
      ]}
      onPress={() => setSelectedCategory(item)}>
      <Text
        style={[
          styles.categoryButtonText,
          selectedCategory === item && styles.categoryButtonTextActive,
        ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderChallenge = ({ item }) => (
    <View style={styles.challengeCard}>
      <View style={styles.challengeHeader}>
        <Ionicons name={item.icon} size={20} color='#667eea' />
        <Text style={styles.challengeTitle}>{item.title}</Text>
        <Text style={styles.challengeReward}>{item.reward}</Text>
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(item.progress / item.total) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {item.progress}/{item.total}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header avec salutation */}
        <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>
                Bonjour,{" "}
                {loading
                  ? "..."
                  : profile?.username ||
                    user?.displayName ||
                    user?.email?.split("@")[0] ||
                    "Joueur"}{" "}
                ! 👋
              </Text>
              <Text style={styles.subtitle}>Prêt à jouer ?</Text>
            </View>
            <View style={styles.headerStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>2847</Text>
                <Text style={styles.statLabel}>Points</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>15</Text>
                <Text style={styles.statLabel}>Niveau</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Filtres par catégorie */}
        <View style={styles.filtersContainer}>
          <FlatList
            data={categories}
            renderItem={renderCategoryButton}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Liste des jeux (2 par ligne) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Jeux Disponibles</Text>
            <Text style={styles.gamesCount}>{filteredGames.length} jeux</Text>
          </View>
          <FlatList
            data={filteredGames}
            renderItem={renderGameCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.gameRow}
            scrollEnabled={false}
            style={styles.gamesList}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
  },
  headerStats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    padding: 15,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 15,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#fff",
    marginTop: -15,
    marginHorizontal: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  quickActionGradient: {
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  quickActionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  seeAllText: {
    fontSize: 14,
    color: "#667eea",
    fontWeight: "500",
  },
  gamesCount: {
    fontSize: 14,
    color: "#6c757d",
  },
  challengesList: {
    marginBottom: 10,
  },
  challengeCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  challengeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  challengeTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginLeft: 10,
  },
  challengeReward: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#e9ecef",
    borderRadius: 3,
    marginRight: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#667eea",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#6c757d",
    fontWeight: "500",
  },
  filtersContainer: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  categoryButtonActive: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  categoryButtonText: {
    fontSize: 14,
    color: "#6c757d",
    fontWeight: "500",
  },
  categoryButtonTextActive: {
    color: "#fff",
  },
  gamesList: {
    marginTop: 10,
  },
  gameRow: {
    justifyContent: "space-between",
  },
  gameCard: {
    width: (width - 60) / 2,
    marginBottom: 18,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 10,
    backgroundColor: "#fff",
    transform: [{ scale: 1 }],
  },
  gameCardPressed: {
    transform: [{ scale: 0.97 }],
    shadowOpacity: 0.08,
  },
  gameCardGradient: {
    padding: 22,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 28,
  },
  gameCardContent: {
    alignItems: "center",
    width: "100%",
    flex: 1,
    justifyContent: "space-between",
  },
  gameCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  difficultyBadgeModern: {
    backgroundColor: "rgba(0,0,0,0.18)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: "flex-end",
  },
  difficultyTextModern: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  gameTitleModern: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 2,
    marginTop: 2,
    textShadowColor: "rgba(0,0,0,0.12)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  gameDescriptionModern: {
    fontSize: 13,
    color: "rgba(255,255,255,0.92)",
    textAlign: "center",
    marginBottom: 10,
    marginTop: 2,
  },
  gameMetaModern: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
  },
  gameMetaItemModern: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.10)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginHorizontal: 2,
  },
  gameMetaTextModern: {
    fontSize: 12,
    color: "#fff",
    marginLeft: 4,
    fontWeight: "600",
  },
  gameIconCentered: {
    fontSize: 44,
    marginBottom: 10,
    alignSelf: "center",
  },
  gameMeta: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  gameMetaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  gameMetaText: {
    fontSize: 10,
    color: "#fff",
    marginLeft: 3,
  },
  difficultyBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 8,
    color: "#fff",
    fontWeight: "500",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statCardNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
    marginBottom: 5,
  },
  statCardLabel: {
    fontSize: 12,
    color: "#6c757d",
    textAlign: "center",
  },
});

export default HomeScreen;
