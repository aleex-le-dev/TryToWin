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

const GameLeaderboard = ({
  leaderboardData,
  leaderboardType,
  setLeaderboardType,
  userCountry,
  currentUserRank,
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
}) => {
  return (
    <View style={styles.leaderboardContent}>
      <View style={styles.leaderboardHeader}>
        <Text style={styles.leaderboardTitle}>Classement {game.title}</Text>
        <Text style={styles.leaderboardSubtitle}>
          {currentUserRank
            ? `Votre position : #${currentUserRank}`
            : "Non classé"}
        </Text>
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
            setTimeout(scrollToUserInWorld, 400);
          }}>
          <Text
            style={[
              styles.leaderboardSwitchText,
              leaderboardType === "global" &&
                styles.leaderboardSwitchTextActive,
            ]}>
            Mondial
          </Text>
        </TouchableOpacity>
        {userCountry && (
          <TouchableOpacity
            style={[
              styles.leaderboardSwitchBtn,
              leaderboardType === "country" && styles.leaderboardSwitchActive,
            ]}
            onPress={() => {
              setLeaderboardType("country");
              setPendingScrollToUserCountry(true);
            }}>
            <Text
              style={[
                styles.leaderboardSwitchText,
                leaderboardType === "country" &&
                  styles.leaderboardSwitchTextActive,
              ]}>
              {countries.find((c) => c.code === userCountry)?.flag || "🌍"}{" "}
              {countries.find((c) => c.code === userCountry)?.name ||
                userCountry}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Liste du classement */}
      <View style={styles.leaderboardList}>
        <FlatList
          ref={flatListRef}
          data={centeredLeaderboardData}
          renderItem={({ item, index }) =>
            item.placeholder ? (
              <View key={item.key} style={{ height: 40 }} />
            ) : (
              <View style={styles.leaderboardItem}>
                <View style={styles.rankContainer}>
                  <Text style={styles.rankText}>#{item.rank}</Text>
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
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text style={{ fontSize: 18, marginRight: 5 }}>
                        {item.country?.flag || "🌍"}
                      </Text>
                      <Text style={styles.username}>{item.username}</Text>
                    </View>
                    <Text style={styles.userStats}>
                      {item.gamesPlayed} parties • {item.winRate}% victoires
                    </Text>
                  </View>
                </View>
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreText}>{item.score}</Text>
                  <Text style={styles.scoreLabel}>points</Text>
                </View>
              </View>
            )
          }
          keyExtractor={(item, index) =>
            item.key ||
            item.userId ||
            item.id ||
            `player_${item.rank}` ||
            `item_${index}`
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          onScrollToIndexFailed={handleScrollToIndexFailed}
          onContentSizeChange={() => {
            if (pendingScrollToUserCountry) {
              const userIndex = getUserIndexWithPlaceholders();
              if (userIndex !== -1 && flatListRef.current) {
                flatListRef.current.scrollToIndex({
                  index: userIndex,
                  animated: true,
                  viewPosition: 0.5,
                });
              }
              setPendingScrollToUserCountry(false);
            }
          }}
        />
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
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
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
};

export default GameLeaderboard;
