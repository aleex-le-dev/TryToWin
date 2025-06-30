import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// Écran de détails d'un jeu
const GameDetailsScreen = ({ route, navigation }) => {
  const { game } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);

  const handlePlayGame = () => {
    Alert.alert(
      "Lancer le jeu",
      `Voulez-vous commencer une partie de ${game.title} ?`,
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Jouer",
          onPress: () => {
            Alert.alert("Jeu lancé !", "Le jeu va se charger...");
          },
        },
      ]
    );
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    Alert.alert(
      isFavorite ? "Retiré des favoris" : "Ajouté aux favoris",
      `${game.title} a été ${
        isFavorite ? "retiré de" : "ajouté aux"
      } vos favoris`
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header avec image et informations principales */}
        <LinearGradient
          colors={[game.color, game.color + "80"]}
          style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Ionicons name='arrow-back' size={24} color='#fff' />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={toggleFavorite}>
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={24}
                color={isFavorite ? "#FF6B6B" : "#fff"}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.gameHeader}>
            <View style={styles.gameIconContainer}>
              <Text style={styles.gameIcon}>{game.image}</Text>
            </View>
            <View style={styles.gameInfo}>
              <Text style={styles.gameTitle}>{game.title}</Text>
              <Text style={styles.gameDescription}>{game.description}</Text>
              <View style={styles.gameMeta}>
                <View style={styles.gameMetaItem}>
                  <Ionicons name='people-outline' size={16} color='#fff' />
                  <Text style={styles.gameMetaText}>{game.players}</Text>
                </View>
                <View style={styles.gameMetaItem}>
                  <Ionicons name='star' size={16} color='#FFD700' />
                  <Text style={styles.gameMetaText}>{game.rating}</Text>
                </View>
                <View style={styles.difficultyBadge}>
                  <Text style={styles.difficultyText}>{game.difficulty}</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Bouton de jeu principal */}
        <View style={styles.playButtonContainer}>
          <TouchableOpacity style={styles.playButton} onPress={handlePlayGame}>
            <LinearGradient
              colors={["#FF6B6B", "#ee5a24"]}
              style={styles.playButtonGradient}>
              <Ionicons name='play' size={24} color='#fff' />
              <Text style={styles.playButtonText}>Jouer maintenant</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Statistiques du jeu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons name='people' size={20} color='#667eea' />
              <Text style={styles.statNumber}>1,247</Text>
              <Text style={styles.statLabel}>Joueurs actifs</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name='time' size={20} color='#4ECDC4' />
              <Text style={styles.statNumber}>5-10 min</Text>
              <Text style={styles.statLabel}>Durée moyenne</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name='trophy' size={20} color='#FFD700' />
              <Text style={styles.statNumber}>89%</Text>
              <Text style={styles.statLabel}>Taux de satisfaction</Text>
            </View>
          </View>
        </View>

        {/* Description détaillée */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos du jeu</Text>
          <Text style={styles.description}>
            {game.title} est un jeu passionnant qui teste vos compétences et
            votre rapidité. Avec des niveaux de difficulté progressifs et un
            système de points innovant, vous ne vous ennuierez jamais !
          </Text>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comment jouer</Text>
          <View style={styles.instructionsList}>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>1</Text>
              </View>
              <Text style={styles.instructionText}>
                Cliquez sur "Jouer maintenant" pour commencer
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>2</Text>
              </View>
              <Text style={styles.instructionText}>
                Suivez les instructions à l'écran
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>3</Text>
              </View>
              <Text style={styles.instructionText}>
                Gagnez des points et grimpez dans le classement
              </Text>
            </View>
          </View>
        </View>

        {/* Avis des joueurs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avis des joueurs</Text>
          <View style={styles.reviewsList}>
            <View style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>Marie L.</Text>
                <View style={styles.reviewStars}>
                  <Ionicons name='star' size={14} color='#FFD700' />
                  <Ionicons name='star' size={14} color='#FFD700' />
                  <Ionicons name='star' size={14} color='#FFD700' />
                  <Ionicons name='star' size={14} color='#FFD700' />
                  <Ionicons name='star' size={14} color='#FFD700' />
                </View>
              </View>
              <Text style={styles.reviewText}>
                "Excellent jeu ! Très addictif et amusant. Je recommande !"
              </Text>
            </View>
            <View style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>Pierre M.</Text>
                <View style={styles.reviewStars}>
                  <Ionicons name='star' size={14} color='#FFD700' />
                  <Ionicons name='star' size={14} color='#FFD700' />
                  <Ionicons name='star' size={14} color='#FFD700' />
                  <Ionicons name='star' size={14} color='#FFD700' />
                  <Ionicons name='star-outline' size={14} color='#FFD700' />
                </View>
              </View>
              <Text style={styles.reviewText}>
                "Bon jeu, mais pourrait avoir plus de niveaux."
              </Text>
            </View>
          </View>
        </View>

        {/* Jeux similaires */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Jeux similaires</Text>
          <View style={styles.similarGames}>
            <TouchableOpacity style={styles.similarGameCard}>
              <Text style={styles.similarGameIcon}>🎯</Text>
              <Text style={styles.similarGameTitle}>Target Practice</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.similarGameCard}>
              <Text style={styles.similarGameIcon}>⚡</Text>
              <Text style={styles.similarGameTitle}>Speed Test</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.similarGameCard}>
              <Text style={styles.similarGameIcon}>🧩</Text>
              <Text style={styles.similarGameTitle}>Puzzle Master</Text>
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
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  favoriteButton: {
    padding: 10,
  },
  gameHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  gameIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  gameIcon: {
    fontSize: 40,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  gameDescription: {
    fontSize: 16,
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
    fontSize: 14,
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
    fontSize: 12,
    color: "#fff",
    fontWeight: "500",
  },
  playButtonContainer: {
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
  },
  playButton: {
    borderRadius: 25,
    overflow: "hidden",
  },
  playButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 30,
  },
  playButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  section: {
    padding: 20,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#6c757d",
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#6c757d",
    lineHeight: 24,
  },
  instructionsList: {
    marginTop: 10,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  instructionNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  instructionNumberText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  reviewsList: {
    marginTop: 10,
  },
  reviewItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f4",
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  reviewStars: {
    flexDirection: "row",
  },
  reviewText: {
    fontSize: 14,
    color: "#6c757d",
    lineHeight: 20,
  },
  similarGames: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  similarGameCard: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    marginHorizontal: 5,
  },
  similarGameIcon: {
    fontSize: 30,
    marginBottom: 8,
  },
  similarGameTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
});

export default GameDetailsScreen;
