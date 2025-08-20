// Composant Paramètres façon Discord (squelette)
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../contexts/ThemeContext";
import ThemedLayout from "../components/ThemedLayout";

const SettingsScreen = ({ navigation, route }) => {
  const { logout } = useAuth();
  const { theme } = useTheme();

  const handleLogout = async () => {
    await logout();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ThemedLayout>
        <View
          style={[
            styles.header,
            { borderBottomColor: theme.border, paddingTop: 40 },
          ]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}>
            <Ionicons name='arrow-back' size={24} color={theme.icon} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Paramètres</Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: 18 }}>
          {/* Section Compte */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Compte</Text>
            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.card }]}>
              <Text style={[styles.menuItemText, { color: theme.text }]}>Compte</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.card }]}>
              <Text style={[styles.menuItemText, { color: theme.text }]}>Données et confidentialité</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.card }]}>
              <Text style={[styles.menuItemText, { color: theme.text }]}>Appareil</Text>
            </TouchableOpacity>
          </View>
          {/* Section Abonnement */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Abonnement</Text>
            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.card }]}>
              <Text style={[styles.menuItemText, { color: theme.text }]}>Boutique</Text>
            </TouchableOpacity>
          </View>
          {/* Section Application */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Application</Text>
            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.card }]}
                              onPress={() => navigation.navigate('AppearanceSettings')}>
              <Text style={[styles.menuItemText, { color: theme.text }]}>Apparence</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.card }]}
                              onPress={() => navigation.navigate('AccessibilitySettings')}>
              <Text style={[styles.menuItemText, { color: theme.text }]}>Accessibilité</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.card }]}
                              onPress={() => navigation.navigate('LanguageSettings')}>
              <Text style={[styles.menuItemText, { color: theme.text }]}>Langue</Text>
            </TouchableOpacity>
          </View>
          {/* Section Assistance */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Assistance</Text>
            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.card }]}
                              onPress={() => navigation.navigate('SupportScreen')}>
              <Text style={[styles.menuItemText, { color: theme.text }]}>Contact</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.card }]}
                              onPress={() => navigation.navigate('DonateScreen')}>
              <Text style={[styles.menuItemText, { color: theme.text }]}>Payer un café</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          <TouchableOpacity style={styles.logoutBtnSmall} onPress={handleLogout}>
            <Text style={styles.logoutTextSmall}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </ThemedLayout>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 18,
    paddingBottom: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  footer: {
    padding: 18,
    borderTopWidth: 1,
  },
  logoutBtnSmall: {
    alignItems: "center",
    paddingVertical: 10,
  },
  logoutTextSmall: {
    color: "#FF6B6B",
    fontWeight: "bold",
    fontSize: 15,
    letterSpacing: 0.5,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 18,
    alignSelf: "flex-start",
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  menuItemText: {
    fontSize: 16,
  },
});

export default SettingsScreen;
