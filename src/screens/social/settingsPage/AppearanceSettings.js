// Page Application > Apparence
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const AppearanceSettings = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Apparence</Text>
    <Text style={styles.placeholder}>Paramètres d'apparence à venir…</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 24 },
  title: {
    color: "#23272a",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 18,
  },
  placeholder: { color: "#6c757d", fontSize: 16 },
});

export default AppearanceSettings;
