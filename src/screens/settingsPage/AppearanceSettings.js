// Page Application > Apparence
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../../contexts/ThemeContext";
import ThemedLayout from "../../components/ThemedLayout";

const AppearanceSettings = ({ navigation }) => {
  const { isDarkMode, setDarkMode, theme } = useTheme();

  return (
    <ThemedLayout style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name='arrow-back' size={22} color={theme.icon} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Apparence</Text>
      </View>
      
      <View style={[styles.settingItem, { borderBottomColor: theme.divider }]}>
        <View style={styles.settingInfo}>
          <Ionicons 
            name={isDarkMode ? 'moon' : 'sunny'} 
            size={24} 
            color={theme.icon} 
          />
          <View style={styles.settingText}>
            <Text style={[styles.settingTitle, { color: theme.text }]}>
              Mode sombre
            </Text>
            <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
              Activer le thème sombre pour l'application
            </Text>
          </View>
        </View>
        <Switch
          value={isDarkMode}
          onValueChange={setDarkMode}
          trackColor={{ false: theme.border, true: theme.primary }}
          thumbColor={isDarkMode ? theme.surface : theme.surface}
          ios_backgroundColor={theme.border}
        />
      </View>
    </ThemedLayout>
  );
};

const styles = StyleSheet.create({
  container: { 
    padding: 24 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 32,
    paddingTop: 50,
  },
  backBtn: { 
    marginRight: 6, 
    padding: 4 
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default AppearanceSettings;
