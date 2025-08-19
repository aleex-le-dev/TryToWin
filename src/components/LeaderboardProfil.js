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
import SkeletonLeaderboard from "./SkeletonLeaderboard";
import { useTheme } from "../contexts/ThemeContext";

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
  const { theme } = useTheme();
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
    if (!effectiveIsProfileView) return;
    if (!flatListRef.current) return;
    if (!currentUserId) return;
    if (!leaderboard || leaderboard.length === 0) return;

    const userIndex = leaderboard.findIndex((player) => player.userId === currentUserId);
    if (userIndex === -1) return;

    setTimeout(() => {
      try {
        flatListRef.current?.scrollToIndex({
          index: userIndex,
          animated: true,
          viewPosition: 0.3,
        });
      } catch (error) {
        try {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        } catch {}
      }
    }, 400);
  }, [leaderboard, currentUserId, effectiveIsProfileView, activeTab]);

  // Fonction pour aller manuellement à la position de l'utilisateur
  const scrollToUserPosition = () => {
    if (!flatListRef.current || leaderboard.length === 0) return;
    
    const userIndex = leaderboard.findIndex(
      (player) => player.userId === currentUserId
    );
    
    if (userIndex !== -1 && userIndex < leaderboard.length) {
      try {
        console.log("[DEBUG] Scroll manuel vers l'index:", userIndex);
        flatListRef.current.scrollToIndex({
          index: userIndex,
          animated: true,
          viewPosition: 0.3,
        });
      } catch (error) {
        console.log("[DEBUG] Erreur scroll manuel:", error);
        // Fallback vers le haut
        try {
          flatListRef.current.scrollToOffset({ offset: 0, animated: true });
        } catch (fallbackError) {
          console.log("[DEBUG] Fallback échoué:", fallbackError);
        }
      }
    }
  };

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

      // Charger le vrai classement global même en vue de profil
      if (activeTab === "global") {
        const rawData = await getGlobalLeaderboard(50);
        data = await Promise.all(
          rawData.map(async (entry, index) => {
            let userData = {};
            try {
              const userDoc = await getDoc(doc(db, "users", entry.userId));
              userData = userDoc.exists() ? userDoc.data() : {};
            } catch (error) {
              console.log("Erreur lors de la récupération des données utilisateur:", error);
            }

            return {
              userId: entry.userId,
              username: userData.username || userData.displayName || `Joueur ${entry.userId.slice(0, 6)}`,
              avatar: userData.photoURL ? undefined : getAvatarUrl(userData.avatar) || "👤",
              photoURL: userData.photoURL || null,
              country: userData.country || "FR",
              totalPoints: entry.totalPoints || 0,
              totalGames: entry.totalGames || 0,
              win: entry.win || 0,
              winRate: entry.winRate || 0,
              rank: index + 1,
              isCurrentUser: entry.userId === currentUserId,
            };
          })
        );

        // Trouver le rang de l'utilisateur actuel
        const currentUserEntry = data.find(player => player.userId === currentUserId);
        if (currentUserEntry) {
          setUserRank({
            rank: currentUserEntry.rank,
            total: data.length,
          });
        } else {
          // Si l'utilisateur n'est pas dans le top 50, récupérer son vrai rang
          const rankData = await getUserGlobalRank(currentUserId);
          setUserRank(rankData);
        }
      } else if (activeTab === "country") {
        // Charger tous les joueurs et filtrer par pays
        const rawData = await getGlobalLeaderboard(1000); // Charger plus de joueurs pour avoir une meilleure couverture
        
        console.log("[DEBUG] Données brutes:", {
          totalPlayers: rawData.length,
          selectedCountry,
          userCountry: profile?.country || user?.country || "FR",
          sampleEntries: rawData.slice(0, 5).map(e => ({ 
            userId: e.userId, 
            country: e.country, 
            points: e.totalPoints,
            hasCountry: !!e.country
          }))
        });
        
        // Filtrer uniquement les joueurs du pays sélectionné
        let countryPlayers = [];
        
        // D'abord, essayer de filtrer par le pays stocké dans les données de score
        countryPlayers = rawData.filter(entry => {
          return entry.country === selectedCountry;
        });
        
        // Si aucun joueur trouvé, essayer de récupérer les données utilisateur pour vérifier le pays
        if (countryPlayers.length === 0) {
          console.log("[DEBUG] Aucun joueur trouvé avec le pays dans les scores, vérification des profils utilisateurs...");
          
          // Récupérer les données utilisateur pour les premiers joueurs
          const userDataPromises = rawData.slice(0, 20).map(async (entry) => {
            try {
              const userDoc = await getDoc(doc(db, "users", entry.userId));
              const userData = userDoc.exists() ? userDoc.data() : {};
              return {
                ...entry,
                userCountry: userData.country || "FR"
              };
            } catch (error) {
              return { ...entry, userCountry: "FR" };
            }
          });
          
          const usersWithCountry = await Promise.all(userDataPromises);
          countryPlayers = usersWithCountry.filter(entry => 
            entry.userCountry === selectedCountry
          );
        }
        
        // Si toujours aucun joueur trouvé, inclure au moins l'utilisateur actuel
        if (countryPlayers.length === 0) {
          console.log("[DEBUG] Aucun joueur du pays trouvé, ajout de l'utilisateur actuel");
          const userStats = await getUserRealStats();
          if (userStats) {
            countryPlayers.push({
              userId: currentUserId,
              totalPoints: userStats.totalPoints || 0,
              totalGames: userStats.totalGames || 0,
              win: userStats.totalWins || 0,
              country: selectedCountry,
            });
          }
        }
        
        console.log("[DEBUG] Filtrage par pays:", {
          selectedCountry,
          totalPlayers: rawData.length,
          countryPlayers: countryPlayers.length,
          userCountry: profile?.country || user?.country || "FR",
          countryPlayersDetails: countryPlayers.map(p => ({ userId: p.userId, points: p.totalPoints }))
        });
        
        // Trier par points décroissants
        countryPlayers.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
        
        data = await Promise.all(
          countryPlayers.map(async (entry, index) => {
            let userData = {};
            try {
              const userDoc = await getDoc(doc(db, "users", entry.userId));
              userData = userDoc.exists() ? userDoc.data() : {};
            } catch (error) {
              console.log("Erreur lors de la récupération des données utilisateur:", error);
            }
            
            return {
              userId: entry.userId,
              username: userData.username || userData.displayName || `Joueur ${entry.userId.slice(0, 6)}`,
              avatar: userData.photoURL ? undefined : getAvatarUrl(userData.avatar) || "👤",
              photoURL: userData.photoURL || null,
              country: entry.country || selectedCountry,
              totalPoints: entry.totalPoints || 0,
              totalGames: entry.totalGames || 0,
              win: entry.win || 0,
              winRate: entry.winRate || 0,
              rank: index + 1,
              isCurrentUser: entry.userId === currentUserId,
            };
          })
        );

        // Trouver le rang de l'utilisateur actuel dans le classement du pays
        const currentUserEntry = data.find(player => player.userId === currentUserId);
        if (currentUserEntry) {
          setUserRank({
            rank: currentUserEntry.rank,
            total: data.length,
          });
        } else {
          // Si l'utilisateur n'est pas dans le top du pays, calculer son rang
          const userStats = await getUserRealStats();
          if (userStats && userStats.totalPoints > 0) {
            // Trouver combien de joueurs du pays ont plus de points que l'utilisateur
            const betterPlayers = countryPlayers.filter(player => 
              (player.totalPoints || 0) > userStats.totalPoints
            );
            const userRankInCountry = betterPlayers.length + 1;
            
            setUserRank({
              rank: userRankInCountry,
              total: data.length,
            });
          } else {
            setUserRank({
              rank: null,
              total: data.length,
            });
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
          { backgroundColor: theme.card },
          item.userId === currentUserId && { backgroundColor: gameColor },
        ]}>
        <View style={styles.rankContainer}>
          <Text
            style={[
              styles.rankText,
              { color: item.userId === currentUserId ? "#fff" : theme.text },
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
            <View style={[styles.avatarFallback, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.avatarText, { color: theme.text }]}>
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
                { color: item.userId === currentUserId ? "#fff" : theme.text },
              ]}>
              {item.username}
            </Text>
          </View>
          <Text
            style={[
              styles.userStats,
              { color: item.userId === currentUserId ? "#fff" : theme.textSecondary },
            ]}>
            {item.totalGames || 0} parties • {item.win || 0} victoires
          </Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text
            style={[
              styles.scoreText,
              { color: item.userId === currentUserId ? "#fff" : gameColor },
            ]}>
            {item.totalPoints}
          </Text>
          <Text
            style={[
              styles.scoreLabel,
              { color: item.userId === currentUserId ? "#fff" : theme.textSecondary },
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
    <View style={[styles.container, { backgroundColor: theme.background }, style]}>
      {/* Onglets - Style identique à GameDetailsScreen */}
      <View style={[styles.tabContainer, { backgroundColor: theme.card }]}>
        <TouchableOpacity
          style={{
            backgroundColor: activeTab === "global" ? gameColor : theme.surface,
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
            backgroundColor: activeTab === "country" ? gameColor : theme.surface,
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
            color: theme.text,
            marginBottom: 5,
          }}>
          {activeTab === "global"
            ? "Classement Général (Mondial)"
            : `Classement ${getCountryFlag(selectedCountry)} ${getCountryName(selectedCountry)}`}
        </Text>
        <Text style={{ fontSize: 14, color: theme.textSecondary }}>
          {activeTab === "global"
            ? "Top des meilleurs joueurs tous pays"
            : `Top des meilleurs joueurs de ${getCountryName(selectedCountry)}`}
        </Text>
      </View>

      {/* Liste du classement */}
      {loading ? (
        <SkeletonLeaderboard />
      ) : leaderboard.length > 0 ? (
        <FlatList
          ref={flatListRef}
          data={leaderboard}
          renderItem={renderPlayer}
          keyExtractor={(item) => item.userId}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          onScrollToIndexFailed={(info) => {
            try {
              const target = Math.max(0, info?.highestMeasuredFrameIndex || 0);
              flatListRef.current?.scrollToIndex({
                index: target,
                animated: true,
                viewPosition: 0.3,
              });
            } catch {
              flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
            }
          }}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.text }]}>
            {activeTab === "global"
              ? "Aucun joueur classé pour le moment"
              : `Aucun joueur classé en ${getCountryName(selectedCountry)}`}
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            {activeTab === "global"
              ? "Jouez pour apparaître dans le classement !"
              : `Jouez pour apparaître dans le classement de ${getCountryName(selectedCountry)} !`}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 10,
  },
  playerItem: {
    flexDirection: "row",
    alignItems: "center",
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
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
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
  },
  userStats: {
    fontSize: 12,
  },
  scoreContainer: {
    alignItems: "flex-end",
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  scoreLabel: {
    fontSize: 12,
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
    textAlign: "center",
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  listContainer: {
    paddingBottom: 20,
  },
  errorText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 50,
  },
});

export default LeaderboardProfil;
