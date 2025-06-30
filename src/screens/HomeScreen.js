import React, { useState } from "react";
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

const { width } = Dimensions.get("window");

// Données des jeux simples
const gamesData = [
  {
    id: "1",
    title: "Puissance 4",
    description: "Alignez 4 pions pour gagner",
    category: "Stratégie",
    difficulty: "Facile",
    players: "2",
    rating: 4.8,
    image: "🔴",
    color: "#FF6B6B",
    gameType: "grid",
  },
  {
    id: "2",
    title: "Othello",
    description: "Retournez les pions adverses",
    category: "Stratégie",
    difficulty: "Moyen",
    players: "2",
    rating: 4.6,
    image: "⚫",
    color: "#4ECDC4",
    gameType: "grid",
  },
  {
    id: "3",
    title: "Tic Tac Toe",
    description: "3 en ligne pour gagner",
    category: "Logique",
    difficulty: "Facile",
    players: "2",
    rating: 4.5,
    image: "❌",
    color: "#45B7D1",
    gameType: "grid",
  },
  {
    id: "4",
    title: "Memory Game",
    description: "Retrouvez les paires",
    category: "Mémoire",
    difficulty: "Facile",
    players: "1-4",
    rating: 4.7,
    image: "🧠",
    color: "#96CEB4",
    gameType: "cards",
  },
  {
    id: "5",
    title: "Snake",
    description: "Mangez et grandissez",
    category: "Arcade",
    difficulty: "Moyen",
    players: "1",
    rating: 4.4,
    image: "🐍",
    color: "#FFEAA7",
    gameType: "arcade",
  },
  {
    id: "6",
    title: "Tetris",
    description: "Empilez les blocs",
    category: "Puzzle",
    difficulty: "Difficile",
    players: "1",
    rating: 4.9,
    image: "🧩",
    color: "#DDA0DD",
    gameType: "puzzle",
  },
  {
    id: "7",
    title: "Pong",
    description: "Bataille de raquettes",
    category: "Arcade",
    difficulty: "Moyen",
    players: "2",
    rating: 4.3,
    image: "🏓",
    color: "#FFB6C1",
    gameType: "arcade",
  },
  {
    id: "8",
    title: "2048",
    description: "Fusionnez les nombres",
    category: "Puzzle",
    difficulty: "Difficile",
    players: "1",
    rating: 4.8,
    image: "��",
    color: "#98D8C8",
    gameType: "puzzle",
  },
];

// Données des défis quotidiens
const dailyChallenges = [
  {
    id: "1",
    title: "Gagner 5 parties",
    reward: "+50 points",
    progress: 3,
    total: 5,
    icon: "trophy",
  },
  {
    id: "2",
    title: "Jouer 3 jeux différents",
    reward: "+30 points",
    progress: 2,
    total: 3,
    icon: "game-controller",
  },
  {
    id: "3",
    title: "Atteindre 1000 points",
    reward: "+100 points",
    progress: 847,
    total: 1000,
    icon: "star",
  },
];

// Écran d'accueil fusionné avec liste des jeux
const HomeScreen = ({ navigation }) => {
  const [userName] = useState("Alex");
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  const categories = [
    "Tous",
    "Stratégie",
    "Logique",
    "Mémoire",
    "Arcade",
    "Puzzle",
  ];

  const filteredGames = gamesData.filter((game) => {
    return selectedCategory === "Tous" || game.category === selectedCategory;
  });

  const renderGameCard = ({ item }) => (
    <TouchableOpacity
      style={styles.gameCard}
      onPress={() => navigation.navigate("GameDetails", { game: item })}>
      <LinearGradient
        colors={[item.color, item.color + "80"]}
        style={styles.gameCardGradient}>
        <View style={styles.gameCardContent}>
          <Text style={styles.gameIcon}>{item.image}</Text>
          <Text style={styles.gameTitle}>{item.title}</Text>
          <Text style={styles.gameDescription}>{item.description}</Text>
          <View style={styles.gameMeta}>
            <View style={styles.gameMetaItem}>
              <Ionicons name='people-outline' size={12} color='#fff' />
              <Text style={styles.gameMetaText}>{item.players}</Text>
            </View>
            <View style={styles.gameMetaItem}>
              <Ionicons name='star' size={12} color='#FFD700' />
              <Text style={styles.gameMetaText}>{item.rating}</Text>
            </View>
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>{item.difficulty}</Text>
            </View>
          </View>
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
              <Text style={styles.greeting}>Bonjour, {userName} ! 👋</Text>
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
    height: 160,
    justifyContent: "center",
    alignItems: "center",
  },
  gameCardContent: {
    alignItems: "center",
    width: "100%",
  },
  gameIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 5,
  },
  gameDescription: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginBottom: 10,
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
