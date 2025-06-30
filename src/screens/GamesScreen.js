import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// Données des jeux disponibles
const gamesData = [
  {
    id: "1",
    title: "Memory Game",
    description: "Testez votre mémoire avec ce jeu de cartes",
    category: "Puzzle",
    difficulty: "Facile",
    players: "1-4",
    rating: 4.5,
    image: "🧠",
    color: "#FF6B6B",
  },
  {
    id: "2",
    title: "Quiz Challenge",
    description: "Répondez aux questions et gagnez des points",
    category: "Quiz",
    difficulty: "Moyen",
    players: "1-8",
    rating: 4.2,
    image: "❓",
    color: "#4ECDC4",
  },
  {
    id: "3",
    title: "Word Scramble",
    description: "Déchiffrez les mots mélangés",
    category: "Mots",
    difficulty: "Facile",
    players: "1-2",
    rating: 4.0,
    image: "📝",
    color: "#45B7D1",
  },
  {
    id: "4",
    title: "Math Race",
    description: "Résolvez des calculs le plus vite possible",
    category: "Math",
    difficulty: "Difficile",
    players: "1-6",
    rating: 4.7,
    image: "🔢",
    color: "#96CEB4",
  },
  {
    id: "5",
    title: "Color Match",
    description: "Associez les couleurs rapidement",
    category: "Réflexes",
    difficulty: "Moyen",
    players: "1-4",
    rating: 4.3,
    image: "🎨",
    color: "#FFEAA7",
  },
  {
    id: "6",
    title: "Speed Typing",
    description: "Tapez les mots le plus vite possible",
    category: "Vitesse",
    difficulty: "Difficile",
    players: "1",
    rating: 4.1,
    image: "⌨️",
    color: "#DDA0DD",
  },
];

// Écran principal de la liste des jeux
const GamesScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    "Tous",
    "Puzzle",
    "Quiz",
    "Mots",
    "Math",
    "Réflexes",
    "Vitesse",
  ];

  const filteredGames = gamesData.filter((game) => {
    const matchesCategory =
      selectedCategory === "Tous" || game.category === selectedCategory;
    const matchesSearch =
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderGameCard = ({ item }) => (
    <TouchableOpacity
      style={styles.gameCard}
      onPress={() => navigation.navigate("GameDetails", { game: item })}>
      <LinearGradient
        colors={[item.color, item.color + "80"]}
        style={styles.gameCardGradient}>
        <View style={styles.gameCardContent}>
          <View style={styles.gameIconContainer}>
            <Text style={styles.gameIcon}>{item.image}</Text>
          </View>
          <View style={styles.gameInfo}>
            <Text style={styles.gameTitle}>{item.title}</Text>
            <Text style={styles.gameDescription}>{item.description}</Text>
            <View style={styles.gameMeta}>
              <View style={styles.gameMetaItem}>
                <Ionicons name='people-outline' size={14} color='#fff' />
                <Text style={styles.gameMetaText}>{item.players}</Text>
              </View>
              <View style={styles.gameMetaItem}>
                <Ionicons name='star' size={14} color='#FFD700' />
                <Text style={styles.gameMetaText}>{item.rating}</Text>
              </View>
              <View style={styles.difficultyBadge}>
                <Text style={styles.difficultyText}>{item.difficulty}</Text>
              </View>
            </View>
          </View>
          <Ionicons name='chevron-forward' size={24} color='#fff' />
        </View>
      </LinearGradient>
    </TouchableOpacity>
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Jeux</Text>
          <Text style={styles.headerSubtitle}>Choisissez votre défi</Text>
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

      {/* Liste des jeux */}
      <FlatList
        data={filteredGames}
        renderItem={renderGameCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.gamesList}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name='game-controller' size={24} color='#667eea' />
              <Text style={styles.statNumber}>{filteredGames.length}</Text>
              <Text style={styles.statLabel}>Jeux disponibles</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name='trophy' size={24} color='#FFD700' />
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Trophées gagnés</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name='star' size={24} color='#FF6B6B' />
              <Text style={styles.statNumber}>4.3</Text>
              <Text style={styles.statLabel}>Note moyenne</Text>
            </View>
          </View>
        }
      />
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
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
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
    padding: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#6c757d",
    marginTop: 2,
  },
  gameCard: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gameCardGradient: {
    padding: 20,
  },
  gameCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  gameIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  gameIcon: {
    fontSize: 30,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  gameDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 10,
  },
  gameMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  gameMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  gameMetaText: {
    fontSize: 12,
    color: "#fff",
    marginLeft: 5,
  },
  difficultyBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  difficultyText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "500",
  },
});

export default GamesScreen;
