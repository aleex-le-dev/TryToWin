// VisualStatsTab.js
// Composant de statistiques ultra-visuel avec graphiques modernes (camembert, barres, radar) et chips de stats clés
// Nécessite : react-native-chart-kit et react-native-svg

import React from "react";
import {
  View,
  Text,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { PieChart, BarChart, ProgressChart } from "react-native-chart-kit";
import Ionicons from "react-native-vector-icons/Ionicons";

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.7,
  useShadowColorFromDataset: false,
};

const VisualStatsTab = ({ userStats, statsByGame }) => {
  // Préparation des données pour les graphiques
  const pieData = [
    {
      name: "Victoires",
      population: userStats?.gamesWon ?? 0,
      color: "#45B7D1",
      legendFontColor: "#45B7D1",
      legendFontSize: 13,
    },
    {
      name: "Nuls",
      population: userStats?.draws ?? 0,
      color: "#A3A3A3",
      legendFontColor: "#A3A3A3",
      legendFontSize: 13,
    },
    {
      name: "Défaites",
      population: userStats?.loses ?? 0,
      color: "#FF6B6B",
      legendFontColor: "#FF6B6B",
      legendFontSize: 13,
    },
  ];

  const barLabels = statsByGame ? Object.keys(statsByGame) : [];
  const barData = {
    labels: barLabels,
    datasets: [
      {
        data: barLabels.map((jeu) => statsByGame[jeu]?.points ?? 0),
      },
    ],
  };

  // Radar chart : profil par jeu (winrate)
  const radarLabels = statsByGame ? Object.keys(statsByGame) : [];
  const progressData = {
    labels: radarLabels,
    data: radarLabels.map((jeu) => (statsByGame[jeu]?.winrate ?? 0) / 100),
  };

  // Chips stats clés
  const chips = [
    {
      icon: "trophy",
      color: "#FFD700",
      label: "Score",
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
      icon: "timer-outline",
      color: "#667eea",
      label: "Best",
      value: userStats?.bestTime ?? "-",
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
        Statistiques visuelles
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
      {/* Pie chart */}
      <Text
        style={{
          fontSize: 16,
          fontWeight: "bold",
          marginTop: 10,
          marginBottom: 2,
        }}>
        Répartition des résultats
      </Text>
      <PieChart
        data={pieData}
        width={screenWidth - 32}
        height={180}
        chartConfig={chartConfig}
        accessor={"population"}
        backgroundColor={"transparent"}
        paddingLeft={"10"}
        absolute
      />
      {/* Bar chart */}
      <Text
        style={{
          fontSize: 16,
          fontWeight: "bold",
          marginTop: 18,
          marginBottom: 2,
        }}>
        Points par jeu
      </Text>
      <BarChart
        data={barData}
        width={screenWidth - 32}
        height={180}
        chartConfig={chartConfig}
        fromZero
        showValuesOnTopOfBars
        style={{ borderRadius: 12 }}
      />
      {/* Progress (radar) chart */}
      <Text
        style={{
          fontSize: 16,
          fontWeight: "bold",
          marginTop: 18,
          marginBottom: 2,
        }}>
        Winrate par jeu
      </Text>
      <ProgressChart
        data={progressData}
        width={screenWidth - 32}
        height={180}
        chartConfig={chartConfig}
        style={{ borderRadius: 12 }}
      />
      {/* Stats par jeu (debug) */}
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
            Par jeu (debug)
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
          {/* Bouton générer des données de test (callback à passer en prop si besoin) */}
          {typeof global.generateAllGamesTestData === "function" && (
            <View style={{ alignItems: "center", marginTop: 10 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: "#667eea",
                  borderRadius: 18,
                  paddingVertical: 10,
                  paddingHorizontal: 22,
                  flexDirection: "row",
                  alignItems: "center",
                }}
                onPress={global.generateAllGamesTestData}>
                <Ionicons name='refresh-outline' size={20} color='#fff' />
                <Text
                  style={{ color: "#fff", fontWeight: "bold", marginLeft: 8 }}>
                  Générer des données de test pour tous les jeux
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
