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
import { useAuth } from "../../hooks/useAuth";

const SettingsScreen = ({ navigation, route }) => {
  const { logout } = useAuth();
  const handleLogout = async () => {
    await logout();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View
        style={[
          styles.header,
          { backgroundColor: "#fff", borderBottomColor: "#e9ecef" },
        ]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Ionicons name='arrow-back' size={24} color='#23272a' />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: "#23272a" }]}>
          Paramètres
        </Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 18 }}>
        {/* Section Compte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Compte</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Données et confidentialité</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Appareil</Text>
          </TouchableOpacity>
        </View>
        {/* Section Abonnement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Abonnement</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Boutique</Text>
          </TouchableOpacity>
        </View>
        {/* Section Application */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Apparence</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Accessibilité</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Langue</Text>
          </TouchableOpacity>
        </View>
        {/* Section Assistance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assistance</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Contact</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Payer un café</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutBtnSmall} onPress={handleLogout}>
          <Text style={styles.logoutTextSmall}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#23272a",
    paddingTop: 18,
    paddingBottom: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#36393f",
  },
  backBtn: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: "#6c757d",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  footer: {
    padding: 18,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
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
    color: "#23272a",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 18,
    alignSelf: "flex-start",
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#f8f9fa",
    marginBottom: 8,
  },
  menuItemText: {
    color: "#23272a",
    fontSize: 16,
  },
});

export default SettingsScreen;
