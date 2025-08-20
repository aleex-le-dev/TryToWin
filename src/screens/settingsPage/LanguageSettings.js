// Page Application > Langue
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../../contexts/ThemeContext";

const LanguageSettings = ({ navigation }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name='arrow-back' size={22} color={theme.icon} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Langue</Text>
      </View>
      <Text style={[styles.placeholder, { color: theme.textSecondary }]}>Paramètres de langue à venir…</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, paddingTop: 50 },
  backBtn: { marginRight: 6, padding: 4 },
  title: {
    color: "#23272a",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 0,
  },
  placeholder: { color: "#6c757d", fontSize: 16 },
});

export default LanguageSettings;
