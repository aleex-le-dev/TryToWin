// Composant de l'onglet Classement du ProfileScreen
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Animated,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const LeaderboardTab = ({
  leaderboardType,
  setLeaderboardType,
  selectedCountry,
  setSelectedCountry,
  top10Global,
  top10Country,
  countries,
  selectedGame,
  setSelectedGame,
  userRank,
  userId,
}) => {
  // Animation d'apparition
  const animatedValues = top10Global.map(() => new Animated.Value(0));
  React.useEffect(() => {
    Animated.stagger(
      80,
      animatedValues.map((a) =>
        Animated.timing(a, { toValue: 1, duration: 400, useNativeDriver: true })
      )
    ).start();
  }, [top10Global]);

  // Score max pour la barre de progression
  const maxScore = top10Global.length > 0 ? top10Global[0].totalPoints : 1;

  return (
    <View style={{ padding: 20 }}>
      {/* Switch Mondial / Par pays */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginBottom: 12,
          gap: 10,
        }}>
        <TouchableOpacity
          style={{
            backgroundColor:
              leaderboardType === "global" ? "#667eea" : "#f1f3f4",
            borderRadius: 16,
            paddingVertical: 7,
            paddingHorizontal: 18,
            marginHorizontal: 2,
          }}
          onPress={() => setLeaderboardType("global")}>
          <Text
            style={{
              color: leaderboardType === "global" ? "#fff" : "#667eea",
              fontWeight: "bold",
              fontSize: 15,
            }}>
            Mondial
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor:
              leaderboardType === "country" ? "#667eea" : "#f1f3f4",
            borderRadius: 16,
            paddingVertical: 7,
            paddingHorizontal: 18,
            marginHorizontal: 2,
          }}
          onPress={() => setLeaderboardType("country")}>
          <Text
            style={{
              color: leaderboardType === "country" ? "#fff" : "#667eea",
              fontWeight: "bold",
              fontSize: 15,
            }}>
            {selectedCountry.flag} {selectedCountry.name}
          </Text>
        </TouchableOpacity>
      </View>
      {/* En-tête du classement */}
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#333",
            marginBottom: 5,
          }}>
          {leaderboardType === "global"
            ? "Classement Mondial"
            : `Top 10 - ${selectedCountry.name}`}
        </Text>
        <Text style={{ fontSize: 14, color: "#6c757d" }}>
          {leaderboardType === "global"
            ? "Top 10 des meilleurs joueurs tous pays"
            : `Joueurs du pays : ${selectedCountry.flag} ${selectedCountry.name}`}
        </Text>
        {/* Rang de l'utilisateur connecté */}
        {userRank && (
          <Text style={{ marginTop: 8, color: "#667eea", fontWeight: "bold" }}>
            Ton rang : #{userRank}
          </Text>
        )}
      </View>
      {/* Liste du classement */}
      <FlatList
        data={leaderboardType === "global" ? top10Global : top10Country}
        renderItem={({ item, index }) => {
          // Médaille animée top 3
          let medal = null;
          if (index === 0) medal = "🥇";
          else if (index === 1) medal = "🥈";
          else if (index === 2) medal = "🥉";
          // Highlight joueur connecté
          const isCurrentUser = item.userId === userId;
          return (
            <Animated.View
              style={{
                opacity: animatedValues[index],
                transform: [
                  {
                    translateY: animatedValues[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
                marginBottom: 12,
              }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: isCurrentUser
                    ? "rgba(102,126,234,0.10)"
                    : "#fff",
                  borderRadius: 18,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
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
                    width: 28,
                    fontWeight: "bold",
                    color:
                      index === 0
                        ? "#FFD700"
                        : index === 1
                        ? "#C0C0C0"
                        : index === 2
                        ? "#CD7F32"
                        : "#23272a",
                    fontSize: 18,
                    textAlign: "center",
                  }}>
                  {medal || `#${index + 1}`}
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
                  }}>
                  <Text style={{ fontSize: 28 }}>{item.avatar}</Text>
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
                    {item.country
                      ? countries.find((c) => c.code === item.country)?.flag
                      : "🌍"}
                  </Text>
                  {/* Barre de progression */}
                  <View
                    style={{
                      height: 6,
                      backgroundColor: "#e0e3ea",
                      borderRadius: 3,
                      marginTop: 4,
                      overflow: "hidden",
                    }}>
                    <View
                      style={{
                        width: `${Math.max(
                          8,
                          (item.totalPoints / maxScore) * 100
                        )}%`,
                        height: 6,
                        backgroundColor: isCurrentUser ? "#667eea" : "#a5b4fc",
                        borderRadius: 3,
                      }}
                    />
                  </View>
                </View>
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 16,
                    color: "#23272a",
                    marginLeft: 8,
                  }}>
                  {item.totalPoints} pts
                </Text>
              </View>
            </Animated.View>
          );
        }}
        keyExtractor={(item) => item.userId}
        scrollEnabled={false}
        style={{ marginBottom: 20 }}
        ListEmptyComponent={
          <Text
            style={{ color: "#6c757d", textAlign: "center", marginTop: 20 }}>
            Aucun joueur trouvé pour ce pays.
          </Text>
        }
      />
      {/* Informations supplémentaires */}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 15,
          padding: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3.84,
          elevation: 5,
        }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons
            name='information-circle-outline'
            size={20}
            color='#667eea'
          />
          <Text
            style={{ fontSize: 14, color: "#6c757d", marginLeft: 10, flex: 1 }}>
            Le classement est mis à jour en temps réel
          </Text>
        </View>
      </View>
    </View>
  );
};

export default LeaderboardTab;
