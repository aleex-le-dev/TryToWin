import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SkeletonLeaderboard from "./SkeletonLeaderboard";
import Toast from "react-native-toast-message";
import { useTheme } from "../contexts/ThemeContext";

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
  onPressPlayer,
}) => {
  const { theme } = useTheme();
  const userIndex = centeredLeaderboardData.findIndex((item) => item.isCurrentUser);
  const userPosition = userIndex !== -1 ? userIndex + 1 : "-";

  const isGlobal = leaderboardType === "global";
  const isCountry = leaderboardType === "country";

  return (
    <View style={[styles.leaderboardContent, { backgroundColor: theme.background }]}>
      {/* Switch Monde / Pays avec contraste renforcé */}
      <View style={{
        flexDirection: "row",
        marginTop: 20,
        marginBottom: 16,
        backgroundColor: theme.card,
        borderRadius: 10,
        padding: 4,
        borderWidth: 1,
        borderColor: theme.border,
      }}>
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 10,
            alignItems: "center",
            borderRadius: 8,
            backgroundColor: isGlobal ? theme.primary : "transparent",
          }}
          onPress={() => {
            setLeaderboardType("global");
            setTimeout(() => { try { scrollToUserInWorld && scrollToUserInWorld(); } catch (e) {} }, 400);
          }}>
          <Text style={{
            fontSize: 14,
            fontWeight: "600",
            color: isGlobal ? "#fff" : theme.textSecondary,
          }}>🌍 Mondial</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 10,
            alignItems: "center",
            borderRadius: 8,
            backgroundColor: isCountry ? theme.primary : "transparent",
            opacity: !userCountry ? 0.6 : 1,
          }}
          disabled={false}
          onPress={() => {
            if (!userCountry) {
              Toast.show({ type: "info", text1: "Veuillez entrer votre pays dans le profil", position: "top" });
              return;
            }
            setLeaderboardType("country");
            setPendingScrollToUserCountry && setPendingScrollToUserCountry(true);
          }}>
          <Text style={{
            fontSize: 14,
            fontWeight: "600",
            color: isCountry ? "#fff" : theme.textSecondary,
          }}>
            {(countries.find((c) => c.code === userCountry)?.flag || "🌍") + " " + (countries.find((c) => c.code === userCountry)?.name || "Pays")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Liste du classement */}
      <View style={[styles.leaderboardList, { backgroundColor: theme.background }]}>
        {loading ? (
          <SkeletonLeaderboard />
        ) : centeredLeaderboardData.length === 0 ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <Text style={[styles.emptyStateText, { color: theme.text }]}>Aucun joueur n'a encore joué à ce jeu</Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.textSecondary }]}>Soyez le premier à marquer des points !</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={centeredLeaderboardData}
            renderItem={({ item, index }) =>
              item.placeholder ? (
                <View key={item.key} style={{ height: 40 }} />
              ) : (
                <TouchableOpacity activeOpacity={0.8} onPress={() => onPressPlayer && onPressPlayer(item)}>
                  {(() => { try { console.log("[UI] Render leaderboard item", { userId: item.userId || item.id, rank: item.rank, win: item.win, gamesPlayed: item.gamesPlayed, score: item.score }); } catch {} })()}
                  <View
                    style={[
                      styles.leaderboardItem,
                      { backgroundColor: theme.card, borderRadius: 16 },
                      item.isCurrentUser && { backgroundColor: game.color },
                    ]}>
                    <View style={styles.rankContainer}>
                      <Text style={[styles.rankText, { color: item.isCurrentUser ? "#fff" : theme.text }]}>#{item.rank}</Text>
                      {index < 3 && (
                        <Ionicons name='trophy' size={16} color={index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : "#CD7F32"} />
                      )}
                    </View>
                    <View style={styles.userInfo}>
                      <View style={styles.userAvatar}>
                        {item.avatar && item.avatar.startsWith("http") ? (
                          <Image source={{ uri: item.avatar }} style={{ width: 40, height: 40, borderRadius: 20 }} resizeMode='cover' />
                        ) : (
                          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#bbb", justifyContent: "center", alignItems: "center" }}>
                            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "bold" }}>
                              {item.username && item.username.length > 0 ? item.username[0].toUpperCase() : item.email && item.email.length > 0 ? item.email[0].toUpperCase() : "U"}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.userDetails}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <Text style={{ fontSize: 18, marginRight: 5 }}>{item.country?.flag || "🌍"}</Text>
                          <Text style={[styles.username, { color: item.isCurrentUser ? "#fff" : theme.text }]}>
                            {item.username}
                          </Text>
                        </View>
                        <Text style={[styles.userStats, { color: item.isCurrentUser ? "#fff" : theme.textSecondary }]}>
                          {item.gamesPlayed} parties • {item.win || 0} victoires
                        </Text>
                      </View>
                    </View>
                    <View style={styles.scoreContainer}>
                      <Text style={[styles.scoreText, item.isCurrentUser ? { color: "#fff" } : { color: game.color, fontWeight: "bold" }]}>
                        {item.score}
                      </Text>
                      <Text style={[styles.scoreLabel, { color: item.isCurrentUser ? "#fff" : theme.textSecondary }]}>points</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )
            }
            keyExtractor={(item, index) => item.key || item.userId || item.id || `player_${item.rank}` || `item_${index}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            getItemLayout={(data, index) => ({ length: 80, offset: 80 * index, index })}
            onScrollToIndexFailed={handleScrollToIndexFailed}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  leaderboardContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  leaderboardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  leaderboardSubtitle: {
    fontSize: 14,
  },
  leaderboardList: {
    flex: 1,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  emptyStateSubtext: {
    fontSize: 16,
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
    marginHorizontal: 2,
    paddingVertical: 14,
    paddingHorizontal: 16,
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
  },
  userStats: {
    fontSize: 14,
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
  },
  scoreLabel: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default GameLeaderboard;
