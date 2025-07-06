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
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";
import {
  getGlobalLeaderboard,
  getUserGlobalRank,
  initializeLeaderboardsForUser,
} from "../services/scoreService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import { countries } from "../constants";

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
        const rawData = await getGlobalLeaderboard(50);
        data = await Promise.all(
          rawData.map(async (entry, index) => {
            let userData = {};
            try {
              const userDoc = await getDoc(doc(db, "users", entry.userId));
              userData = userDoc.exists() ? userDoc.data() : {};
            } catch (e) {}

            return {
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
          })
        );

        const rankData = await getUserGlobalRank(user.id);
        setUserRank(rankData);
      } else if (activeTab === "country") {
        const countryCode = selectedCountry;
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
          .map((player, index) => ({
            ...player,
            rank: index + 1,
          }))
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

  const getCountryFlag = (countryCode) => {
    const country = countries.find((c) => c.code === countryCode);
    return country ? country.flag : "🌍";
  };

  const getCountryName = (countryCode) => {
    const country = countries.find((c) => c.code === countryCode);
    return country ? country.name : "Monde";
  };

  const renderPlayer = ({ item, index }) => (
    <View
      style={[
        styles.playerItem,
        item.userId === user?.id && styles.currentUserItem,
      ]}>
      <View style={styles.rankContainer}>
        <Text
          style={[
            styles.rankText,
            item.userId === user?.id && styles.currentUserText,
          ]}>
          #{item.rank}
        </Text>
        {item.rank <= 3 && (
          <Ionicons
            name='trophy'
            size={16}
            color={
              item.rank === 1
                ? "#FFD700"
                : item.rank === 2
                ? "#C0C0C0"
                : "#CD7F32"
            }
          />
        )}
      </View>

      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          {item.avatar && item.avatar.startsWith("http") ? (
            <Image
              source={{ uri: item.avatar }}
              style={styles.avatarImage}
              resizeMode='cover'
              defaultSource={require("../../assets/icon.png")}
              onError={() => {}}
            />
          ) : (
            <Text style={styles.avatarText}>{item.avatar || "👤"}</Text>
          )}
        </View>

        <View style={styles.userDetails}>
          <View style={styles.usernameRow}>
            <Text style={styles.countryFlag}>
              {item.country
                ? countries.find((c) => c.code === item.country)?.flag || "🌍"
                : "🌍"}
            </Text>
            <Text
              style={[
                styles.username,
                item.userId === user?.id && styles.currentUserText,
              ]}>
              {item.username}
            </Text>
          </View>
          <Text
            style={[
              styles.userStats,
              item.userId === user?.id && styles.currentUserText,
            ]}>
            {item.totalGames || 0} parties • {item.winRate || 0}% victoires
          </Text>
        </View>
      </View>

      <View style={styles.scoreContainer}>
        <Text
          style={[
            styles.scoreText,
            item.userId === user?.id && styles.currentUserText,
          ]}>
          {item.totalPoints}
        </Text>
        <Text
          style={[
            styles.scoreLabel,
            item.userId === user?.id && styles.currentUserText,
          ]}>
          points
        </Text>
      </View>
    </View>
  );

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
      {/* Onglets - Style identique à GameDetailsScreen */}
      <View style={styles.tabContainer}>
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
              fontSize: 14,
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
            onPress={() => setActiveTab("country")}>
            <Text
              style={{
                color: activeTab === "country" ? "#fff" : "#667eea",
                fontWeight: "bold",
                fontSize: 14,
              }}>
              {getCountryFlag(selectedCountry)}{" "}
              {getCountryName(selectedCountry)}
            </Text>
          </TouchableOpacity>
        )}
      </View>

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
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  playerItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  currentUserItem: {
    backgroundColor: "#667eea",
  },
  rankContainer: {
    width: 40,
    alignItems: "center",
    marginRight: 15,
  },
  rankText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  currentUserText: {
    color: "#fff",
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarText: {
    fontSize: 28,
  },
  userDetails: {
    flex: 1,
  },
  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  countryFlag: {
    fontSize: 18,
    marginRight: 5,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  userStats: {
    fontSize: 12,
    color: "#6c757d",
  },
  scoreContainer: {
    alignItems: "flex-end",
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#667eea",
  },
  scoreLabel: {
    fontSize: 12,
    color: "#6c757d",
  },
  userRankContainer: {
    backgroundColor: "#667eea",
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  userRankText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6c757d",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
  },
  listContainer: {
    paddingBottom: 20,
  },
  errorText: {
    textAlign: "center",
    fontSize: 16,
    color: "#6c757d",
    marginTop: 50,
  },
});

export default LeaderboardGame;
