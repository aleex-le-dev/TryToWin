// VisualStatsTab.js
// Composant de statistiques visuelles 100% compatible Expo Go
// Utilise react-native-chart-kit pour BarChart multicolore, PieChart et ProgressChart

import React from "react";
import {
  View,
  Text,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { gamesData } from "../constants/gamesData";

const screenWidth = Dimensions.get("window").width;
const gameColors = Object.fromEntries(
  gamesData.map((g) => [g.id.toLowerCase(), g.color])
);

const VisualStatsTab = ({
  userStats,
  statsByGame,
  generateAllGamesTestData,
}) => {
  // Chips stats clés
  const chips = [
    {
      icon: "trophy",
      color: "#FFD700",
      label: "Points",
      value: userStats?.totalScore ?? 0,
    },
    {
      icon: "game-controller",
      color: "#4ECDC4",
      label: "Parties",
      value: userStats?.gamesPlayed ?? 0,
    },
    {
      icon: "flame",
      color: "#FF9800",
      label: "Série",
      value: userStats?.currentStreak ?? 0,
    },
    {
      icon: "stats-chart-outline",
      color: "#4ECDC4",
      label: "Victoires",
      value:
        userStats && userStats.gamesPlayed > 0
          ? Math.round((userStats.gamesWon / userStats.gamesPlayed) * 100) + "%"
          : "-",
    },
  ];

  return (
    <ScrollView
      contentContainerStyle={{ alignItems: "center", paddingBottom: 32 }}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: "#667eea",
          marginVertical: 12,
        }}>
        Mes statistiques
      </Text>
      {/* Chips chiffres clés */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: 18,
        }}>
        {chips.map((chip) => (
          <View
            key={chip.label}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#fff",
              borderRadius: 18,
              paddingVertical: 8,
              paddingHorizontal: 14,
              margin: 4,
              shadowColor: chip.color + "55",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 3,
              elevation: 2,
              minWidth: 70,
              minHeight: 44,
            }}>
            <Ionicons
              name={chip.icon}
              size={18}
              color={chip.color}
              style={{ marginRight: 4 }}
            />
            <View style={{ alignItems: "center" }}>
              <Text
                style={{ fontWeight: "bold", fontSize: 15, color: "#23272a" }}>
                {chip.value}
              </Text>
              <Text style={{ fontSize: 11, color: "#6c757d", marginTop: -2 }}>
                {chip.label}
              </Text>
            </View>
          </View>
        ))}
      </View>
      {/* Stats détaillées par jeu */}
      {statsByGame && Object.keys(statsByGame).length > 0 && (
        <View
          style={{
            width: "100%",
            backgroundColor: "#fff",
            borderRadius: 15,
            padding: 20,
            marginTop: 18,
            marginBottom: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
          }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "#333",
              marginBottom: 15,
            }}>
            Par jeu
          </Text>
          {Object.entries(statsByGame).map(([jeu, stats]) => (
            <View
              key={String(jeu)}
              style={{
                marginBottom: 18,
                padding: 12,
                backgroundColor: "#f7faff",
                borderRadius: 12,
              }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  marginBottom: 8,
                  color: "#667eea",
                }}>
                {String(jeu ?? "")}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}>
                <MiniStat
                  label='Parties'
                  value={String(stats?.totalGames ?? 0)}
                />
                <MiniStat label='Victoires' value={String(stats?.wins ?? 0)} />
                <MiniStat label='Nuls' value={String(stats?.draws ?? 0)} />
                <MiniStat label='Défaites' value={String(stats?.loses ?? 0)} />
                <MiniStat label='Points' value={String(stats?.points ?? 0)} />
                <MiniStat
                  label='Winrate'
                  value={String(stats?.winrate ?? 0) + "%"}
                />
              </View>
            </View>
          ))}
        </View>
      )}
      {/* Bouton DEBUG : Générer des données de test (toujours visible, centré) */}
      {typeof generateAllGamesTestData === "function" && (
        <View style={{ alignItems: "center", marginTop: 10, marginBottom: 20 }}>
          <TouchableOpacity
            style={{
              backgroundColor: "#667eea",
              borderRadius: 18,
              paddingVertical: 10,
              paddingHorizontal: 22,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={generateAllGamesTestData}>
            <Ionicons name='refresh-outline' size={20} color='#fff' />
            <Text style={{ color: "#fff", fontWeight: "bold", marginLeft: 8 }}>
              Générer des données de test pour tous les jeux
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const MiniStat = ({ label, value }) => (
  <View
    style={{
      alignItems: "center",
      marginHorizontal: 4,
      paddingVertical: 6,
      flex: 1,
    }}>
    <Text style={{ fontSize: 15, fontWeight: "bold", color: "#667eea" }}>
      {String(value ?? "0")}
    </Text>
    <Text style={{ fontSize: 11, color: "#23272a", marginTop: 2 }}>
      {String(label ?? "")}
    </Text>
  </View>
);

export default VisualStatsTab;
