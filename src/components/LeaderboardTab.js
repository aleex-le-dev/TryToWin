// Composant de l'onglet Classement du ProfileScreen
import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const LeaderboardTab = ({
  leaderboardType,
  setLeaderboardType,
  selectedCountry,
  setSelectedCountry,
  top10Global,
  top10Country,
  renderLeaderboardItem,
  countries,
}) => (
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
          backgroundColor: leaderboardType === "global" ? "#667eea" : "#f1f3f4",
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
    </View>
    {/* Liste du classement */}
    <FlatList
      data={leaderboardType === "global" ? top10Global : top10Country}
      renderItem={renderLeaderboardItem}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      style={{ marginBottom: 20 }}
      ListEmptyComponent={
        <Text style={{ color: "#6c757d", textAlign: "center", marginTop: 20 }}>
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
        <Ionicons name='information-circle-outline' size={20} color='#667eea' />
        <Text
          style={{ fontSize: 14, color: "#6c757d", marginLeft: 10, flex: 1 }}>
          Le classement est mis à jour toutes les heures
        </Text>
      </View>
    </View>
  </View>
);

export default LeaderboardTab;
