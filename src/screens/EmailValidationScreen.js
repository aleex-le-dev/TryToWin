// Écran de validation d'email après inscription
// Affiche un message et propose de renvoyer l'email ou de retourner à la connexion

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { authService } from "../services/authService";
import { colors } from "../constants/colors";

const EmailValidationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState(null);

  const handleResend = async () => {
    setLoading(true);
    setError(null);
    setResent(false);
    try {
      await authService.resendEmailVerification(email);
      setResent(true);
    } catch (err) {
      setError("Erreur lors de l'envoi de l'email. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.container}>
      <View style={styles.content}>
        <Ionicons
          name='mail-open-outline'
          size={60}
          color='#fff'
          style={{ marginBottom: 20 }}
        />
        <Text style={styles.title}>Vérifie ta boîte mail</Text>
        <Text style={styles.subtitle}>
          Un email de validation a été envoyé à :
        </Text>
        <Text style={styles.email}>{email}</Text>
        <Text style={styles.info}>
          Clique sur le lien dans l'email pour activer ton compte.
        </Text>
        {resent && (
          <Text style={styles.success}>Email de validation renvoyé !</Text>
        )}
        {error && <Text style={styles.error}>{error}</Text>}
        <TouchableOpacity
          style={styles.button}
          onPress={handleResend}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color='#fff' />
          ) : (
            <>
              <Ionicons name='refresh' size={18} color='#fff' />
              <Text style={styles.buttonText}>Renvoyer l'email</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.link}
          onPress={() => navigation.navigate("Login")}>
          <Text style={styles.linkText}>Retour à la connexion</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    width: "90%",
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 5,
    textAlign: "center",
  },
  email: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  info: {
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 20,
    textAlign: "center",
  },
  success: {
    color: colors.success || "#4BB543",
    marginBottom: 10,
    fontWeight: "bold",
  },
  error: {
    color: colors.error,
    marginBottom: 10,
    fontWeight: "bold",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 15,
  },
  link: {
    marginTop: 10,
  },
  linkText: {
    color: colors.primary,
    textDecorationLine: "underline",
    fontWeight: "bold",
    fontSize: 15,
  },
});

export default EmailValidationScreen;
