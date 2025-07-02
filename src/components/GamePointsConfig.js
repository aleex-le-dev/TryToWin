// Composant d'administration des points par jeu
// Permet de visualiser et modifier les points attribués pour chaque résultat
import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, FlatList } from "react-native";
import { GAME_POINTS } from "../constants/gamePoints";

/**
 * GamePointsConfig : composant d'édition des barèmes de points par jeu.
 * À intégrer dans une page admin ou paramètres avancés.
 */
const GamePointsConfig = () => {
  // On clone la config pour édition locale
  const [pointsConfig, setPointsConfig] = useState(GAME_POINTS);

  const handleChange = (game, result, value) => {
    setPointsConfig((prev) => ({
      ...prev,
      [game]: {
        ...prev[game],
        [result]: Number(value),
      },
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paramétrage des points par jeu</Text>
      <FlatList
        data={Object.keys(pointsConfig)}
        keyExtractor={(item) => item}
        renderItem={({ item: game }) => (
          <View style={styles.gameBlock}>
            <Text style={styles.gameName}>{game}</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Victoire</Text>
              <TextInput
                style={styles.input}
                keyboardType='numeric'
                value={String(pointsConfig[game].win)}
                onChangeText={(v) => handleChange(game, "win", v)}
              />
              <Text style={styles.label}>Nul</Text>
              <TextInput
                style={styles.input}
                keyboardType='numeric'
                value={String(pointsConfig[game].draw)}
                onChangeText={(v) => handleChange(game, "draw", v)}
              />
              <Text style={styles.label}>Défaite</Text>
              <TextInput
                style={styles.input}
                keyboardType='numeric'
                value={String(pointsConfig[game].lose)}
                onChangeText={(v) => handleChange(game, "lose", v)}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 18, backgroundColor: "#fff", borderRadius: 18 },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 18,
    color: "#23272a",
  },
  gameBlock: {
    marginBottom: 18,
    padding: 12,
    backgroundColor: "#f7faff",
    borderRadius: 12,
  },
  gameName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#667eea",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontSize: 14, color: "#23272a", marginHorizontal: 4 },
  input: {
    width: 40,
    height: 32,
    borderWidth: 1,
    borderColor: "#e0e3ea",
    borderRadius: 6,
    textAlign: "center",
    backgroundColor: "#fff",
    marginHorizontal: 2,
  },
});

export default GamePointsConfig;
