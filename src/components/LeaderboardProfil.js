import React, { useState, useEffect, useRef } from "react";
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
  getUserAllGameStats,
} from "../services/scoreService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import { countries } from "../constants";
import { AVATAR_COLLECTIONS } from "../constants/avatars";
import SkeletonProfile from "./SkeletonProfile";

/**
 * Composant de classement pour le profil utilisateur (ProfileScreen)
 * Style identique à GameDetailsScreen
 */
const LeaderboardProfil = ({
  style,
  userId,
  gameColor = "#667eea",
  showUserPosition = false,
  isProfileView = true,
  profile = null,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("global");
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const flatListRef = useRef(null);

  // Utiliser l'userId passé en prop ou celui de l'utilisateur connecté
  const currentUserId = userId || user?.id;

  // Dans le composant LeaderboardProfil, je force isProfileView à true pour TOUS les usages
  const effectiveIsProfileView = true;

  // Fonction pour récupérer l'URL de l'avatar à partir de sa clé
  const getAvatarUrl = (avatarKey) => {
    if (!avatarKey || typeof avatarKey !== "string") return null;

    // Si c'est déjà une URL, la retourner directement
    if (avatarKey.startsWith("http")) return avatarKey;

    // Chercher dans toutes les collections d'avatars
    for (const collection of AVATAR_COLLECTIONS) {
      const avatar = collection.avatars.find((av) => av.key === avatarKey);
      if (avatar) return avatar.url;
    }

    return null;
  };

  useEffect(() => {
    if (currentUserId) {
      // Utiliser le pays du profil en priorité, sinon celui de l'utilisateur connecté, sinon France par défaut
      const userCountry = profile?.country || user?.country || "FR";
      setSelectedCountry(userCountry);
      initializeLeaderboards();
    }
  }, [currentUserId, user, profile]);

  useEffect(() => {
    if (currentUserId && initialized) {
      loadLeaderboard();
    }
  }, [activeTab, selectedCountry, currentUserId, initialized]);

  // Scroll vers l'utilisateur quand le leaderboard est chargé
  useEffect(() => {
    if (leaderboard.length > 0 && effectiveIsProfileView) {
      const userIndex = leaderboard.findIndex(
        (player) => player.userId === currentUserId
      );
      if (userIndex !== -1 && flatListRef.current) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: userIndex,
            animated: true,
            viewPosition: 0.3, // Positionne l'utilisateur à 30% du haut de l'écran
          });
        }, 500); // Délai pour laisser le temps au FlatList de se rendre
      }
    }
  }, [leaderboard, currentUserId, effectiveIsProfileView, activeTab]);

  const initializeLeaderboards = async () => {
    if (!currentUserId || initialized) return;

    try {
      await initializeLeaderboardsForUser(currentUserId);
      setInitialized(true);
    } catch (error) {
      setInitialized(true); // Continuer même en cas d'erreur
    }
  };

  // Récupérer les vraies statistiques de l'utilisateur
  const getUserRealStats = async () => {
    if (!currentUserId) return null;

    try {
      const allStats = await getUserAllGameStats(currentUserId);
      let totalPoints = 0;
      let totalGames = 0;
      let totalWins = 0;

      // Calculer les statistiques globales
      Object.values(allStats.gamesPlayed || {}).forEach((gameStats) => {
        totalPoints += gameStats.totalPoints || 0;
        totalGames += gameStats.totalGames || 0;
        totalWins += gameStats.win || 0;
      });

      const winRate =
        totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

      return {
        totalPoints,
        totalGames,
        totalWins,
        winRate,
      };
    } catch (error) {
      console.log("Erreur lors de la récupération des stats:", error);
      return null;
    }
  };

  const loadLeaderboard = async () => {
    if (!currentUserId) return;

    setLoading(true);
    try {
      let data = [];

      // Si c'est une vue de profil, afficher seulement l'utilisateur actuel
      if (effectiveIsProfileView) {
        if (activeTab === "global") {
          // Récupérer les vraies statistiques de l'utilisateur
          const realStats = await getUserRealStats();

          data = [
            {
              userId: currentUserId,
              username: user?.username || profile?.username || "Vous",
              avatar:
                profile?.photoURL || user?.photoURL
                  ? undefined
                  : getAvatarUrl(profile?.avatar) ||
                    getAvatarUrl(user?.avatar) ||
                    "👤",
              photoURL: profile?.photoURL || user?.photoURL || null,
              country: user?.country || profile?.country || "FR",
              totalPoints: realStats?.totalPoints || 0,
              totalGames: realStats?.totalGames || 0,
              win: realStats?.totalWins || 0,
              winRate: realStats?.winRate || 0,
              rank: 1,
            },
          ];

          setUserRank({
            rank: 1,
            total: 1,
          });
        } else if (activeTab === "country") {
          // Récupérer les vraies statistiques de l'utilisateur
          const realStats = await getUserRealStats();

          data = [
            {
              userId: currentUserId,
              username: user?.username || profile?.username || "Vous",
              avatar:
                profile?.photoURL || user?.photoURL
                  ? undefined
                  : getAvatarUrl(profile?.avatar) ||
                    getAvatarUrl(user?.avatar) ||
                    "👤",
              photoURL: profile?.photoURL || user?.photoURL || null,
              country: user?.country || profile?.country || selectedCountry,
              totalPoints: realStats?.totalPoints || 0,
              totalGames: realStats?.totalGames || 0,
              win: realStats?.totalWins || 0,
              winRate: realStats?.winRate || 0,
              rank: 1,
            },
          ];

          setUserRank({
            rank: 1,
            total: 1,
          });
        }
      } else {
        // Logique existante pour les vues de jeux
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
                username:
                  userData.username || `Joueur ${entry.userId.slice(0, 6)}`,
                avatar: userData.photoURL
                  ? undefined
                  : getAvatarUrl(userData.avatar) ||
                    userData.avatar ||
                    undefined,
                photoURL: userData.photoURL || null,
                country: userData.country
                  ? userData.country.toUpperCase()
                  : null,
                rank: index + 1,
              };
            })
          );

          const rankData = await getUserGlobalRank(currentUserId);
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
                avatar: userData.photoURL
                  ? undefined
                  : getAvatarUrl(userData.avatar) ||
                    userData.avatar ||
                    undefined,
                photoURL: userData.photoURL || null,
                country: userData.country
                  ? userData.country.toUpperCase()
                  : null,
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
              photoURL: player.photoURL || null,
            }))
            .slice(0, 50);

          const userEntry = data.find(
            (player) => player.userId === currentUserId
          );
          if (userEntry) {
            setUserRank({ rank: userEntry.rank, total: data.length });
          } else {
            setUserRank(null);
          }
        }
      }

      console.log("[DEBUG] leaderboard JEUX", data);
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

  const renderPlayer = ({ item, index }) => {
    return (
      <View
        style={[
          styles.playerItem,
          item.userId === currentUserId && { backgroundColor: gameColor },
        ]}>
        <View style={styles.rankContainer}>
          <Text
            style={[
              styles.rankText,
              item.userId === currentUserId && styles.currentUserText,
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
        <View style={styles.avatarContainer}>
          {item.photoURL &&
          typeof item.photoURL === "string" &&
          item.photoURL.trim() !== "" ? (
            <Image
              key={item.photoURL}
              source={{ uri: item.photoURL }}
              style={styles.avatarImage}
              resizeMode='cover'
              defaultSource={require("../../assets/icon.png")}
              onError={() => {}}
              accessibilityLabel={`Photo de profil de ${item.username}`}
            />
          ) : typeof item.avatar === "string" &&
            item.avatar.startsWith("flag-") ? (
            <Image
              key={item.avatar}
              source={{
                uri: `https://flagcdn.com/w80/${item.avatar
                  .replace("flag-", "")
                  .toLowerCase()}.png`,
              }}
              style={styles.avatarImage}
              resizeMode='cover'
              defaultSource={require("../../assets/icon.png")}
              onError={() => {}}
              accessibilityLabel={`Drapeau de ${item.username}`}
            />
          ) : typeof item.avatar === "string" &&
            item.avatar.startsWith("http") ? (
            <Image
              key={item.avatar}
              source={{ uri: item.avatar }}
              style={styles.avatarImage}
              resizeMode='cover'
              defaultSource={require("../../assets/icon.png")}
              onError={() => {}}
              accessibilityLabel={`Avatar de ${item.username}`}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>
                {(item.username || "U")[0].toUpperCase()}
              </Text>
            </View>
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
                item.userId === currentUserId && styles.currentUserText,
              ]}>
              {item.username}
            </Text>
          </View>
          <Text
            style={[
              styles.userStats,
              item.userId === currentUserId && styles.currentUserText,
            ]}>
            {item.totalGames || 0} parties • {item.win || 0} victoires
          </Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text
            style={[
              styles.scoreText,
              item.userId === currentUserId && styles.currentUserText,
              { color: item.userId === currentUserId ? "#fff" : gameColor },
            ]}>
            {item.totalPoints}
          </Text>
          <Text
            style={[
              styles.scoreLabel,
              item.userId === currentUserId && styles.currentUserText,
            ]}>
            points
          </Text>
        </View>
      </View>
    );
  };

  const renderUserRank = () => {
    if (!userRank || !currentUserId) return null;

    return (
      <View style={[styles.userRankContainer, { backgroundColor: gameColor }]}>
        <Text style={styles.userRankText}>
          Votre position : {userRank.rank ? `#${userRank.rank}` : "Non classé"}
          {userRank.total > 0 && ` sur ${userRank.total} joueurs`}
        </Text>
      </View>
    );
  };

  if (!currentUserId) {
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
            backgroundColor: activeTab === "global" ? gameColor : "#f1f3f4",
            borderRadius: 16,
            paddingVertical: 7,
            paddingHorizontal: 18,
            marginHorizontal: 2,
          }}
          onPress={() => setActiveTab("global")}>
          <Text
            style={{
              color: activeTab === "global" ? "#fff" : gameColor,
              fontWeight: "bold",
              fontSize: 14,
            }}>
            🌍 Mondial
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: activeTab === "country" ? gameColor : "#f1f3f4",
            borderRadius: 16,
            paddingVertical: 7,
            paddingHorizontal: 18,
            marginHorizontal: 2,
          }}
          onPress={() => setActiveTab("country")}>
          <Text
            style={{
              color: activeTab === "country" ? "#fff" : gameColor,
              fontWeight: "bold",
              fontSize: 14,
            }}>
            {getCountryFlag(selectedCountry)} {getCountryName(selectedCountry)}
          </Text>
        </TouchableOpacity>
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
      </View>

      {/* Liste du classement */}
      {loading ? (
        <SkeletonProfile />
      ) : leaderboard.length > 0 ? (
        <FlatList
          ref={flatListRef}
          data={leaderboard}
          renderItem={renderPlayer}
          keyExtractor={(item) => item.userId}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          onScrollToIndexFailed={(info) => {
            // Fallback: scroll vers le haut
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          }}
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
    backgroundColor: "#667eea", // Sera remplacé dynamiquement
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
  userAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  userAvatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  userAvatarText: {
    fontSize: 20,
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
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e9ecef",
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
    color: "#667eea", // Sera remplacé dynamiquement
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

export default LeaderboardProfil;
