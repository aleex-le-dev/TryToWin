import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SkeletonProfile from "./SkeletonProfile";
import Toast from "react-native-toast-message";

const GameLeaderboard = ({
  leaderboardData,
  leaderboardType,
  setLeaderboardType,
  userCountry,
  currentUserRank,
  userCountryRank,
  game,
  filteredLeaderboardData,
  centeredLeaderboardData,
  flatListRef,
  handleScrollToIndexFailed,
  pendingScrollToUserCountry,
  setPendingScrollToUserCountry,
  getUserIndexWithPlaceholders,
  loading,
  renderLeaderboardItem,
  scrollToUserInWorld,
  countries,
  // Nouveau: scroll en mode pays
  scrollToUserInCountry,
}) => {
  // Calcul dynamique de la position utilisateur dans la liste affichée
  const userIndex = centeredLeaderboardData.findIndex(
    (item) => item.isCurrentUser
  );
  const userPosition = userIndex !== -1 ? userIndex + 1 : "-";

  return (
    <View style={styles.leaderboardContent}>
      <View style={styles.leaderboardHeader}>
        <Text style={styles.leaderboardTitle}>Classement {game.title}</Text>
        <Text style={styles.leaderboardSubtitle}>{`Votre position : #${userPosition}`}</Text>
        {/* Bouton Aller à ma position (mondial/pays) */}
        {centeredLeaderboardData.length > 0 && (
          <TouchableOpacity
            style={{
              backgroundColor: game.color,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 18,
              marginTop: 8,
              alignSelf: "center",
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
            onPress={() => {
              try {
                if (leaderboardType === "global") {
                  scrollToUserInWorld && scrollToUserInWorld();
                } else {
                  // si pas de pays défini, afficher un toast
                  if (!userCountry || userCountry === "") {
                    Toast.show({
                      type: "info",
                      text1: "Veuillez entrer votre pays dans le profil",
                      position: "top",
                    });
                    return;
                  }
                  if (scrollToUserInCountry) {
                    scrollToUserInCountry();
                  } else {
                    // fallback: activer la logique existante
                    setPendingScrollToUserCountry && setPendingScrollToUserCountry(true);
                  }
                }
              } catch (e) {}
            }}>
            <Ionicons name='locate' size={16} color='#fff' />
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Aller à ma position</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Onglets de classement */}
      <View style={styles.leaderboardSwitchRow}>
        <TouchableOpacity
          style={[
            styles.leaderboardSwitchBtn,
            leaderboardType === "global" && styles.leaderboardSwitchActive,
          ]}
          onPress={() => {
            setLeaderboardType("global");
            setTimeout(() => {
              try {
                scrollToUserInWorld && scrollToUserInWorld();
              } catch (e) {}
            }, 400);
          }}>
          <Text
            style={[
              styles.leaderboardSwitchText,
              leaderboardType === "global" && styles.leaderboardSwitchTextActive,
            ]}>
            Mondial
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.leaderboardSwitchBtn,
            leaderboardType === "country" && styles.leaderboardSwitchActive,
            (!userCountry || userCountry === "") && { opacity: 0.5 },
          ]}
          // Toujours actif pour permettre le toast
          disabled={false}
          onPress={() => {
            if (!userCountry || userCountry === "") {
              Toast.show({
                type: "info",
                text1: "Veuillez entrer votre pays dans le profil",
                position: "top",
              });
              return;
            }
            setLeaderboardType("country");
            setPendingScrollToUserCountry && setPendingScrollToUserCountry(true);
          }}>
          <Text
            style={[
              styles.leaderboardSwitchText,
              leaderboardType === "country" && styles.leaderboardSwitchTextActive,
              (!userCountry || userCountry === "") && { color: "#aaa" },
            ]}>
            {(countries.find((c) => c.code === userCountry)?.flag || "🌍") +
              " " +
              (countries.find((c) => c.code === userCountry)?.name || "Pays")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Liste du classement */}
      <View style={styles.leaderboardList}>
        {loading ? (
          <SkeletonProfile />
        ) : centeredLeaderboardData.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Aucun joueur n'a encore joué à ce jeu
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Soyez le premier à marquer des points !
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={centeredLeaderboardData}
            renderItem={({ item, index }) =>
              item.placeholder ? (
                <View key={item.key} style={{ height: 40 }} />
              ) : (
                <View
                  style={[
                    styles.leaderboardItem,
                    item.isCurrentUser && { backgroundColor: game.color },
                  ]}>
                  <View style={styles.rankContainer}>
                    <Text
                      style={[
                        styles.rankText,
                        item.isCurrentUser && { color: "#fff" },
                      ]}>
                      #{item.rank}
                    </Text>
                    {index < 3 && (
                      <Ionicons
                        name='trophy'
                        size={16}
                        color={
                          index === 0
                            ? "#FFD700"
                            : index === 1
                            ? "#C0C0C0"
                            : "#CD7F32"
                        }
                      />
                    )}
                  </View>
                  <View style={styles.userInfo}>
                    <View style={styles.userAvatar}>
                      {item.avatar && item.avatar.startsWith("http") ? (
                        <Image
                          source={{ uri: item.avatar }}
                          style={{ width: 40, height: 40, borderRadius: 20 }}
                          resizeMode='cover'
                        />
                      ) : (
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: "#bbb",
                            justifyContent: "center",
                            alignItems: "center",
                          }}>
                          <Text
                            style={{
                              color: "#fff",
                              fontSize: 22,
                              fontWeight: "bold",
                            }}>
                            {item.username && item.username.length > 0
                              ? item.username[0].toUpperCase()
                              : item.email && item.email.length > 0
                              ? item.email[0].toUpperCase()
                              : "U"}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.userDetails}>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text style={{ fontSize: 18, marginRight: 5 }}>
                          {item.country?.flag || "🌍"}
                        </Text>
                        <Text
                          style={[
                            styles.username,
                            item.isCurrentUser && { color: "#fff" },
                          ]}>
                          {item.username}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.userStats,
                          item.isCurrentUser && { color: "#fff" },
                        ]}>
                        {item.gamesPlayed} parties • {item.win || 0} victoires
                      </Text>
                    </View>
                  </View>
                  <View style={styles.scoreContainer}>
                    <Text
                      style={[
                        styles.scoreText,
                        item.isCurrentUser
                          ? { color: "#fff" }
                          : { color: game.color, fontWeight: "bold" },
                      ]}>
                      {item.score}
                    </Text>
                    <Text
                      style={[
                        styles.scoreLabel,
                        item.isCurrentUser && { color: "#fff" },
                      ]}>
                      points
                    </Text>
                  </View>
                </View>
              )
            }
            keyExtractor={(item, index) =>
              item.key || item.userId || item.id || `player_${item.rank}` || `item_${index}`
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            onScrollToIndexFailed={handleScrollToIndexFailed}
            onContentSizeChange={() => {
              if (pendingScrollToUserCountry) {
                try {
                  const userIdx = getUserIndexWithPlaceholders();
                  const total = centeredLeaderboardData.length;
                  if (
                    typeof userIdx === "number" &&
                    userIdx >= 0 &&
                    total > 0 &&
                    userIdx < total &&
                    flatListRef.current
                  ) {
                    flatListRef.current.scrollToIndex({
                      index: userIdx,
                      animated: true,
                      viewPosition: 0.5,
                    });
                  }
                } catch (e) {}
                setPendingScrollToUserCountry(false);
              }
            }}
          />
        )}
      </View>
    </View>
  );
};

const styles = {
  leaderboardContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  leaderboardHeader: {
    marginBottom: 16,
    alignItems: "center",
  },
  leaderboardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  leaderboardSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  leaderboardSwitchRow: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 4,
  },
  leaderboardSwitchBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  leaderboardSwitchActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  leaderboardSwitchText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  leaderboardSwitchTextActive: {
    color: "#333",
    fontWeight: "600",
  },
  leaderboardList: {
    flex: 1,
  },
  // Styles pour chaque carte joueur (rectangle arrondi, ombre, fond blanc ou bleu)
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
    marginHorizontal: 2,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  rankContainer: {
    width: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 15,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  userDetails: {
    marginLeft: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  userStats: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  scoreContainer: {
    width: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  scoreLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: "#666",
  },
};

export default GameLeaderboard;
