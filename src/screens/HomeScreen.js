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

// Données des jeux populaires
const popularGames = [
  {
    id: "1",
    title: "Memory Game",
    players: "1.2k",
    rating: 4.8,
    image: "🧠",
    color: "#FF6B6B",
  },
  {
    id: "2",
    title: "Quiz Challenge",
    players: "856",
    rating: 4.6,
    image: "❓",
    color: "#4ECDC4",
  },
  {
    id: "3",
    title: "Math Race",
    players: "1.5k",
    rating: 4.9,
    image: "🔢",
    color: "#96CEB4",
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

// Écran d'accueil principal
const HomeScreen = ({ navigation }) => {
  const [userName] = useState("Alex");

  const renderPopularGame = ({ item }) => (
    <TouchableOpacity
      style={styles.popularGameCard}
      onPress={() => navigation.navigate("GameDetails", { game: item })}>
      <LinearGradient
        colors={[item.color, item.color + "80"]}
        style={styles.popularGameGradient}>
        <Text style={styles.popularGameIcon}>{item.image}</Text>
        <Text style={styles.popularGameTitle}>{item.title}</Text>
        <View style={styles.popularGameMeta}>
          <View style={styles.popularGameMetaItem}>
            <Ionicons name='people-outline' size={12} color='#fff' />
            <Text style={styles.popularGameMetaText}>{item.players}</Text>
          </View>
          <View style={styles.popularGameMetaItem}>
            <Ionicons name='star' size={12} color='#FFD700' />
            <Text style={styles.popularGameMetaText}>{item.rating}</Text>
          </View>
        </View>
      </LinearGradient>
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
              <Text style={styles.subtitle}>Prêt à gagner ?</Text>
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

        {/* Actions rapides */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate("Games")}>
            <LinearGradient
              colors={["#FF6B6B", "#ee5a24"]}
              style={styles.quickActionGradient}>
              <Ionicons name='game-controller' size={30} color='#fff' />
              <Text style={styles.quickActionText}>Jouer</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate("Profile")}>
            <LinearGradient
              colors={["#4ECDC4", "#44A08D"]}
              style={styles.quickActionGradient}>
              <Ionicons name='trophy' size={30} color='#fff' />
              <Text style={styles.quickActionText}>Classement</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate("Profile")}>
            <LinearGradient
              colors={["#45B7D1", "#96C93D"]}
              style={styles.quickActionGradient}>
              <Ionicons name='person' size={30} color='#fff' />
              <Text style={styles.quickActionText}>Profil</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Défis quotidiens */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Défis Quotidiens</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={dailyChallenges}
            renderItem={renderChallenge}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            style={styles.challengesList}
          />
        </View>

        {/* Jeux populaires */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Jeux Populaires</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Games")}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={popularGames}
            renderItem={renderPopularGame}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.popularGamesList}
          />
        </View>

        {/* Statistiques rapides */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vos Statistiques</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name='checkmark-circle' size={24} color='#4CAF50' />
              <Text style={styles.statCardNumber}>32</Text>
              <Text style={styles.statCardLabel}>Victoires</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name='time' size={24} color='#FF9800' />
              <Text style={styles.statCardNumber}>12h</Text>
              <Text style={styles.statCardLabel}>Temps de jeu</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name='trending-up' size={24} color='#2196F3' />
              <Text style={styles.statCardNumber}>71%</Text>
              <Text style={styles.statCardLabel}>Taux de victoire</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name='flame' size={24} color='#FF5722' />
              <Text style={styles.statCardNumber}>8</Text>
              <Text style={styles.statCardLabel}>Série actuelle</Text>
            </View>
          </View>
        </View>

        {/* Section d'actualités */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actualités</Text>
          <View style={styles.newsCard}>
            <View style={styles.newsHeader}>
              <Ionicons name='megaphone' size={20} color='#667eea' />
              <Text style={styles.newsTitle}>Nouveau jeu disponible !</Text>
            </View>
            <Text style={styles.newsContent}>
              Découvrez "Speed Typing", le nouveau défi de vitesse de frappe.
              Testez vos compétences et grimpez dans le classement !
            </Text>
            <TouchableOpacity style={styles.newsButton}>
              <Text style={styles.newsButtonText}>En savoir plus</Text>
            </TouchableOpacity>
          </View>
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
  popularGamesList: {
    paddingRight: 20,
  },
  popularGameCard: {
    width: 150,
    marginRight: 15,
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
  popularGameGradient: {
    padding: 20,
    alignItems: "center",
    height: 120,
    justifyContent: "center",
  },
  popularGameIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  popularGameTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  popularGameMeta: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  popularGameMetaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  popularGameMetaText: {
    fontSize: 10,
    color: "#fff",
    marginLeft: 3,
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
  newsCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  newsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  newsContent: {
    fontSize: 14,
    color: "#6c757d",
    lineHeight: 20,
    marginBottom: 15,
  },
  newsButton: {
    backgroundColor: "#667eea",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignSelf: "flex-start",
  },
  newsButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default HomeScreen;
