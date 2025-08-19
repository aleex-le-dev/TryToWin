// Page Application > Apparence
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../../contexts/ThemeContext";

const AppearanceSettings = ({ navigation }) => {
  const { isDarkMode, setDarkMode } = useTheme();

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name='arrow-back' size={22} color={isDarkMode ? '#ffffff' : '#23272a'} />
        </TouchableOpacity>
        <Text style={[styles.title, isDarkMode && styles.titleDark]}>Apparence</Text>
      </View>
      
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons 
            name={isDarkMode ? 'moon' : 'sunny'} 
            size={24} 
            color={isDarkMode ? '#ffffff' : '#23272a'} 
          />
          <View style={styles.settingText}>
            <Text style={[styles.settingTitle, isDarkMode && styles.settingTitleDark]}>
              Mode sombre
            </Text>
            <Text style={[styles.settingDescription, isDarkMode && styles.settingDescriptionDark]}>
              Activer le thème sombre pour l'application
            </Text>
          </View>
        </View>
        <Switch
          value={isDarkMode}
          onValueChange={setDarkMode}
          trackColor={{ false: '#e0e0e0', true: '#7289da' }}
          thumbColor={isDarkMode ? '#ffffff' : '#f4f3f4'}
          ios_backgroundColor="#e0e0e0"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff", 
    padding: 24 
  },
  containerDark: {
    backgroundColor: "#1a1a1a",
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 32 
  },
  backBtn: { 
    marginRight: 6, 
    padding: 4 
  },
  title: {
    color: "#23272a",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 0,
  },
  titleDark: {
    color: "#ffffff",
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    color: '#23272a',
    marginBottom: 4,
  },
  settingTitleDark: {
    color: '#ffffff',
  },
  settingDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  settingDescriptionDark: {
    color: '#a0a0a0',
  },
});

export default AppearanceSettings;
