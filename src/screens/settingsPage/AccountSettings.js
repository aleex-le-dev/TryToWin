// Page Paramètres > Compte
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const AccountSettings = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Compte</Text>
    <Text style={styles.placeholder}>Paramètres du compte à venir…</Text>
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

export default AccountSettings;
