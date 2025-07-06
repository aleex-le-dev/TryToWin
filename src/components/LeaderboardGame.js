import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import {
  getGlobalLeaderboard,
  getLeaderboard,
  getUserGlobalRank,
  initializeLeaderboardsForUser,
} from "../services/scoreService";
import { GAMES_DATA } from "../constants/gamesData";
import { countries } from "../constants/countries";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";

// === LEADERBOARDGAME.JS REELLEMENT CHARGE ===

// Fallback pour les pays en cas de problème d'import
const FALLBACK_COUNTRIES = [
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "US", name: "États-Unis", flag: "🇺🇸" },
  { code: "GB", name: "Royaume-Uni", flag: "🇬🇧" },
  { code: "DE", name: "Allemagne", flag: "🇩🇪" },
  { code: "ES", name: "Espagne", flag: "🇪🇸" },
  { code: "IT", name: "Italie", flag: "🇮🇹" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australie", flag: "🇦🇺" },
];

/**
 * Composant de classement pour les jeux (GameDetailsScreen)
 * Style identique à GameDetailsScreen
 */
const LeaderboardGame = ({ style }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("global");
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (user?.id) {
      setSelectedCountry(user.country || "France");
      initializeLeaderboards();
    }
  }, [user]);

  useEffect(() => {
    if (user?.id && initialized) {
      loadLeaderboard();
    }
  }, [activeTab, selectedCountry, user, initialized]);

  const initializeLeaderboards = async () => {
    if (!user?.id || initialized) return;

    try {
      await initializeLeaderboardsForUser(user.id);
      setInitialized(true);
    } catch (error) {
      setInitialized(true); // Continuer même en cas d'erreur
    }
  };

  const loadLeaderboard = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      let data = [];

      if (activeTab === "global") {
        console.log("[LEADERBOARD] Calcul du classement MONDE");
        const rawData = await getGlobalLeaderboard(50);
        data = await Promise.all(
          rawData.map(async (entry, index) => {
            let userData = {};
            try {
              const userDoc = await getDoc(doc(db, "users", entry.userId));
              userData = userDoc.exists() ? userDoc.data() : {};
            } catch (e) {}
            const player = {
              ...entry,
              username: userData.username || "",
              avatar:
                userData.photoURL ||
                userData.avatar ||
                userData.avatarUrl ||
                "👤",
              country: userData.country ? userData.country.toUpperCase() : null,
              rank: index + 1,
            };
            console.log(
              `[MONDE] Rang #${player.rank} | ${player.username} | ${player.totalPoints} pts | country: ${player.country}`
            );
            return player;
          })
        );
        const rankData = await getUserGlobalRank(user.id);
        setUserRank(rankData);
      } else if (activeTab === "country") {
        const countryCode = selectedCountry;
        console.log(`[LEADERBOARD] Calcul du classement PAYS (${countryCode})`);
        const globalData = await getGlobalLeaderboard(1000);
        const enrichedData = await Promise.all(
          globalData.map(async (entry) => {
            let userData = {};
            try {
              const userDoc = await getDoc(doc(db, "users", entry.userId));
              userData = userDoc.exists() ? userDoc.data() : {};
            } catch (e) {}
            return {
              ...entry,
              username:
                userData.username || `Joueur ${entry.userId.slice(0, 6)}`,
              avatar:
                userData.photoURL ||
                userData.avatar ||
                userData.avatarUrl ||
                "👤",
              country: userData.country ? userData.country.toUpperCase() : null,
            };
          })
        );
        const filtered = enrichedData.filter(
          (player) => player.country === countryCode
        );
        data = filtered
          .sort((a, b) => b.totalPoints - a.totalPoints)
          .map((player, index) => {
            const rang = index + 1;
            console.log(
              `[TEST PAYS] Rang #${rang} | ${player.username} | ${player.totalPoints} pts | country: ${player.country}`
            );
            return {
              ...player,
              rank: rang,
            };
          })
          .slice(0, 50);
        const userEntry = data.find((player) => player.userId === user.id);
        if (userEntry) {
          setUserRank({ rank: userEntry.rank, total: data.length });
        } else {
          setUserRank(null);
        }
      }

      setLeaderboard(data);
    } catch (error) {
      setLeaderboard([]);
      setUserRank(null);
    } finally {
      setLoading(false);
    }
  };

  const getCountryName = (code) => {
    const countriesList = countries || FALLBACK_COUNTRIES;
    if (!countriesList || !Array.isArray(countriesList)) {
      return code;
    }
    return countriesList.find((country) => country.code === code)?.name || code;
  };

  const getCountryFlag = (code) => {
    const countriesList = countries || FALLBACK_COUNTRIES;
    if (!countriesList || !Array.isArray(countriesList)) {
      return "🏳️";
    }
    return countriesList.find((country) => country.code === code)?.flag || "🏳️";
  };

  const renderPlayer = ({ item, index }) => {
    const isCurrentUser = item.userId === user?.id;
    const rank = index + 1;

    // Médaille pour les 3 premiers
    let medal = null;
    if (rank === 1) medal = "🥇";
    else if (rank === 2) medal = "🥈";
    else if (rank === 3) medal = "🥉";

    const countryObj =
      item.country && typeof item.country === "string"
        ? countries.find((c) => c.code === item.country)
        : null;
    const flagToShow = countryObj && countryObj.flag ? countryObj.flag : "🌍";
    const nameToShow =
      countryObj && countryObj.name ? ` ${countryObj.name}` : "";

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: isCurrentUser ? "rgba(102,126,234,0.10)" : "#fff",
          borderRadius: 18,
          paddingVertical: 12,
          paddingHorizontal: 16,
          marginBottom: 12,
          shadowColor: isCurrentUser ? "#667eea" : "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isCurrentUser ? 0.18 : 0.08,
          shadowRadius: isCurrentUser ? 8 : 3,
          elevation: isCurrentUser ? 7 : 3,
          borderWidth: isCurrentUser ? 2 : 0,
          borderColor: isCurrentUser ? "#667eea" : "transparent",
        }}>
        <Text
          style={{
            width: 48,
            fontWeight: "bold",
            color:
              rank === 1
                ? "#FFD700"
                : rank === 2
                ? "#C0C0C0"
                : rank === 3
                ? "#CD7F32"
                : "#23272a",
            fontSize: 18,
            textAlign: "center",
          }}>
          {medal ? `${medal} #${rank}` : `#${rank}`}
        </Text>

        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "#f7faff",
            alignItems: "center",
            justifyContent: "center",
            marginHorizontal: 8,
            borderWidth: 2,
            borderColor: isCurrentUser ? "#667eea" : "#e0e3ea",
            overflow: "hidden",
          }}>
          {item.avatar && item.avatar.startsWith("http") ? (
            <Image
              source={{ uri: item.avatar }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
              }}
              resizeMode='cover'
              defaultSource={require("../../assets/icon.png")}
              onError={() => {
                console.log("Erreur chargement avatar:", item.avatar);
              }}
            />
          ) : (
            <Text style={{ fontSize: 28 }}>{item.avatar || "👤"}</Text>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 16,
              color: isCurrentUser ? "#667eea" : "#23272a",
            }}>
            {item.username}
          </Text>
          <Text style={{ fontSize: 12, color: "#6c757d" }}>
            {flagToShow}
            {nameToShow}
          </Text>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 16,
              color: isCurrentUser ? "#667eea" : "#23272a",
            }}>
            {item.totalPoints}
          </Text>
          <Text style={{ fontSize: 12, color: "#6c757d" }}>points</Text>
        </View>
      </View>
    );
  };

  const renderUserRank = () => {
    if (!userRank || !user?.id) return null;

    return (
      <View style={styles.userRankContainer}>
        <Text style={styles.userRankText}>
          Votre position : {userRank.rank ? `#${userRank.rank}` : "Non classé"}
          {userRank.total > 0 && ` sur ${userRank.total} joueurs`}
        </Text>
      </View>
    );
  };

  // Log à chaque rendu du composant
  console.log("[DEBUG RENDER] activeTab:", activeTab);
  console.log(
    "=== TEST LOG PAYS ===",
    activeTab,
    selectedCountry,
    leaderboard.length
  );

  if (!user?.id) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.errorText}>
          Connectez-vous pour voir les classements
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {console.log("=== RENDER LEADERBOARDGAME ===")}
      {/* Onglets - Style identique à GameDetailsScreen */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginBottom: 12,
          gap: 10,
        }}>
        <TouchableOpacity
          style={{
            backgroundColor: activeTab === "global" ? "#667eea" : "#f1f3f4",
            borderRadius: 16,
            paddingVertical: 7,
            paddingHorizontal: 18,
            marginHorizontal: 2,
          }}
          onPress={() => setActiveTab("global")}>
          <Text
            style={{
              color: activeTab === "global" ? "#fff" : "#667eea",
              fontWeight: "bold",
              fontSize: 15,
            }}>
            Mondial
          </Text>
        </TouchableOpacity>

        {user?.country && (
          <TouchableOpacity
            style={{
              backgroundColor: activeTab === "country" ? "#667eea" : "#f1f3f4",
              borderRadius: 16,
              paddingVertical: 7,
              paddingHorizontal: 18,
              marginHorizontal: 2,
            }}
            onPress={() => {
              console.log("[DEBUG UI] Switch pays cliqué");
              setActiveTab("country");
            }}>
            <Text
              style={{
                color: activeTab === "country" ? "#fff" : "#667eea",
                fontWeight: "bold",
                fontSize: 15,
              }}>
              {getCountryName(selectedCountry)}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* En-tête du classement - Style identique à GameDetailsScreen */}
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#333",
            marginBottom: 5,
          }}>
          {activeTab === "global"
            ? "Classement Général (Mondial)"
            : `Classement - ${getCountryFlag(selectedCountry)} ${getCountryName(
                selectedCountry
              )}`}
        </Text>
        <Text style={{ fontSize: 14, color: "#6c757d" }}>
          {activeTab === "global"
            ? "Top des meilleurs joueurs tous pays"
            : `${getCountryFlag(selectedCountry)} ${getCountryName(
                selectedCountry
              )}`}
        </Text>
        {/* Rang de l'utilisateur connecté */}
        {userRank && (
          <Text
            style={{
              marginTop: 8,
              color: "#667eea",
              fontWeight: "bold",
            }}>
            Ton rang : #{userRank.rank}
          </Text>
        )}
      </View>

      {/* Position de l'utilisateur */}
      {renderUserRank()}

      {/* Liste du classement */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#007AFF' />
          <Text style={styles.loadingText}>Chargement du classement...</Text>
        </View>
      ) : leaderboard.length > 0 ? (
        <FlatList
          data={leaderboard}
          renderItem={renderPlayer}
          keyExtractor={(item) => item.userId}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {activeTab === "global"
              ? "Aucun joueur classé pour le moment"
              : `Aucun joueur classé en ${getCountryName(selectedCountry)}`}
          </Text>
          <Text style={styles.emptySubtext}>
            Jouez pour apparaître dans le classement !
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  userRankContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userRankText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#667eea",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 50,
  },
});

export default LeaderboardGame;
