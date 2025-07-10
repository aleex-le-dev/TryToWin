import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Image,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../utils/firebaseConfig";
import { useIsFocused } from "@react-navigation/native";
import { gamesData } from "../../constants/gamesData";
import { categories } from "../../constants/categories";
import { getUserAllGameStats } from "../../services/scoreService";
import { useRef } from "react";

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
          {typeof item.image === "string" ? (
            <Text style={styles.gameIconCentered}>{item.image}</Text>
          ) : (
            <Image
              source={item.image}
              style={[
                styles.gameIconCentered,
                { width: 80, height: 80, fontSize: undefined },
              ]}
              resizeMode='contain'
            />
          )}
          <Text style={styles.gameTitleModern}>{item.title}</Text>
          <Text style={styles.gameDescriptionModern}>{item.description}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// Composant effet shiny-text
const ShinyText = ({ children, style }) => {
  const [shineAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.timing(shineAnim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 260], // Largeur du texte estimée
  });

  return (
    <View
      style={{
        position: "relative",
        overflow: "hidden",
        alignSelf: "flex-start",
      }}>
      <Text style={style}>{children}</Text>
      <Animated.View
        pointerEvents='none'
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          transform: [{ translateX }],
        }}>
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.7)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: 60, height: "100%" }}
        />
      </Animated.View>
    </View>
  );
};

function ShinyLetter({ letter, style }) {
  const [shineAnim] = useState(new Animated.Value(0));
  useEffect(() => {
    Animated.loop(
      Animated.timing(shineAnim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);
  const translateX = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 40],
  });
  return (
    <View style={{ position: "relative", display: "inline-block" }}>
      <Text style={style}>{letter}</Text>
      <Animated.View
        pointerEvents='none'
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 20,
          height: "100%",
          transform: [{ translateX }],
        }}>
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.7)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: 20, height: "100%" }}
        />
      </Animated.View>
    </View>
  );
}

function ShinyTextLetters({ children, style }) {
  return (
    <Text style={[style, { flexDirection: "row", flexWrap: "wrap" }]}>
      {children.split("").map((char, i) => (
        <ShinyLetter key={i} letter={char} style={style} />
      ))}
    </Text>
  );
}

function useDecryptedText(
  target,
  duration = 1200,
  charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
) {
  const [displayed, setDisplayed] = useState("");
  const intervalRef = useRef();
  useEffect(() => {
    let frame = 0;
    let resolved = Array(target.length).fill(false);
    let current = Array(target.length).fill("");
    const totalFrames = Math.max(1, Math.floor(duration / 16));
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      let done = true;
      for (let i = 0; i < target.length; i++) {
        if (!resolved[i]) {
          if (Math.random() < frame / totalFrames) {
            current[i] = target[i];
            resolved[i] = true;
          } else {
            current[i] = charset[Math.floor(Math.random() * charset.length)];
            done = false;
          }
        }
      }

      setDisplayed(current.join(""));
      frame++;
      if (done || frame > totalFrames + 5) clearInterval(intervalRef.current);
    }, 16);
    return () => clearInterval(intervalRef.current);
  }, [target, duration, charset]);
  return displayed;
}

// Écran d'accueil fusionné avec liste des jeux
const GameScreen = ({ navigation, resetCategoryTrigger, forceHomeReset }) => {
  const { user, loading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  const isFocused = useIsFocused();
  const scrollViewRef = React.useRef(null);

  const filteredGames = gamesData.filter((game) => {
    return selectedCategory === "Tous" || game.category === selectedCategory;
  });

  // Récupération du profil utilisateur depuis Firestore
  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        setProfileLoading(true);
        try {
          console.log("[GameScreen] Chargement profil pour user.id:", user.id);
          const docRef = doc(db, "users", user.id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const profileData = docSnap.data();
            console.log("[GameScreen] Profil chargé:", profileData);
            setProfile(profileData);
          } else {
            console.log(
              "[GameScreen] Aucun profil trouvé pour user.id:",
              user.id
            );
          }
        } catch (error) {
          console.error("[GameScreen] Erreur chargement profil:", error);
        } finally {
          setProfileLoading(false);
        }
      } else {
        console.log("[GameScreen] Pas d'user.id disponible");
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user, isFocused]);

  // Récupération du total de points utilisateur
  useEffect(() => {
    const fetchPoints = async () => {
      if (user?.id) {
        const stats = await getUserAllGameStats(user.id);
        setTotalPoints(stats.totalPoints || 0);
      }
    };
    fetchPoints();
  }, [user, isFocused]);

  // Réinitialise la catégorie à "Tous" à chaque clic sur l'onglet Jeux (via resetCategoryTrigger)
  useEffect(() => {
    setSelectedCategory("Tous");
  }, [resetCategoryTrigger]);

  // Force le retour à l'accueil et scroll en haut
  useEffect(() => {
    if (forceHomeReset && scrollViewRef.current) {
      // Scroll en haut de la page
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  }, [forceHomeReset]);

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

  useEffect(() => {
    if (isFocused) setSelectedCategory("Tous");
  }, [isFocused]);

  const decryptedBonjour = useDecryptedText("Bonjour", 3000);
  const decryptedName = useDecryptedText(
    profile?.username ? profile.username + " 👋" : "",
    3000
  );
  const decryptedReady = useDecryptedText("Prêt à jouer ?", 3000);

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        {/* Header avec salutation */}
        <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>{decryptedBonjour}</Text>
              {profile?.username && (
                <Text style={styles.userName}>{decryptedName}</Text>
              )}
              <Text style={styles.subtitle}>{decryptedReady}</Text>
            </View>
            <View style={styles.headerStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{totalPoints}</Text>
                <Text style={styles.statLabel}>Points</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>?</Text>
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
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: -2,
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
    shadowColor: undefined,
    shadowOffset: undefined,
    shadowOpacity: undefined,
    shadowRadius: undefined,
    elevation: 0,
    backgroundColor: "#fff",
    transform: [{ scale: 1 }],
  },
  gameCardPressed: {
    transform: [{ scale: 0.97 }, { translateY: 2 }],
    shadowColor: undefined,
    shadowOffset: undefined,
    shadowOpacity: undefined,
    shadowRadius: undefined,
    elevation: 0,
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

export default GameScreen;
