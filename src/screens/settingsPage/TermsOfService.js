import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/colors";

const TermsOfService = ({ navigation }) => {
  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Conditions d'utilisation</Text>
        </View>

        {/* Contenu */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Acceptation des Conditions</Text>
            <Text style={styles.text}>
              En utilisant l'application TryToWin, vous acceptez d'être lié par ces conditions d'utilisation. 
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'application.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Description du Service</Text>
            <Text style={styles.text}>
              TryToWin est une application de jeux compétitifs qui permet aux utilisateurs de jouer à divers jeux, 
              de participer à des classements et de défier d'autres joueurs.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Compte Utilisateur</Text>
            <Text style={styles.text}>
              Vous devez créer un compte pour utiliser l'application. Vous êtes responsable de maintenir 
              la confidentialité de vos informations de connexion et de toutes les activités qui se produisent 
              sous votre compte.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Règles de Conduite</Text>
            <Text style={styles.text}>
              Vous vous engagez à ne pas utiliser l'application pour des activités illégales, 
              à ne pas harceler d'autres utilisateurs, et à respecter les règles de chaque jeu.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Propriété Intellectuelle</Text>
            <Text style={styles.text}>
              L'application et son contenu sont protégés par les droits de propriété intellectuelle. 
              Vous ne pouvez pas copier, modifier ou distribuer le contenu sans autorisation.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Limitation de Responsabilité</Text>
            <Text style={styles.text}>
              TryToWin n'est pas responsable des dommages indirects, accessoires ou consécutifs 
              résultant de l'utilisation de l'application.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Modifications</Text>
            <Text style={styles.text}>
              Nous nous réservons le droit de modifier ces conditions à tout moment. 
              Les modifications prendront effet immédiatement après leur publication.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Contact</Text>
            <Text style={styles.text}>
              Pour toute question concernant ces conditions, contactez-nous à : 
              alexandre.janacek@gmail.com
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 70,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 25,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 24,
  },
  footer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    fontStyle: "italic",
  },
});

export default TermsOfService;
