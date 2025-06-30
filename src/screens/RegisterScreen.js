import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

// Écran d'inscription avec validation des champs
const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = () => {
    if (!username || !email || !password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Veuillez remplir tous les champs",
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Les mots de passe ne correspondent pas",
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }

    if (password.length < 6) {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Le mot de passe doit contenir au moins 6 caractères",
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }

    // Inscription directe pour les tests
    navigation.navigate("MainTabs");
  };

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header avec bouton retour */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Ionicons name='arrow-back' size={24} color='#fff' />
            </TouchableOpacity>
            <Text style={styles.title}>Créer un compte</Text>
            <Text style={styles.subtitle}>Rejoignez TryToWin</Text>
          </View>

          {/* Formulaire d'inscription */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons
                name='person-outline'
                size={20}
                color='#fff'
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Nom d'utilisateur"
                placeholderTextColor='rgba(255,255,255,0.7)'
                value={username}
                onChangeText={setUsername}
                autoCapitalize='none'
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name='mail-outline'
                size={20}
                color='#fff'
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder='Email'
                placeholderTextColor='rgba(255,255,255,0.7)'
                value={email}
                onChangeText={setEmail}
                keyboardType='email-address'
                autoCapitalize='none'
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name='lock-closed-outline'
                size={20}
                color='#fff'
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder='Mot de passe'
                placeholderTextColor='rgba(255,255,255,0.7)'
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}>
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color='#fff'
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name='lock-closed-outline'
                size={20}
                color='#fff'
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder='Confirmer le mot de passe'
                placeholderTextColor='rgba(255,255,255,0.7)'
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}>
                <Ionicons
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color='#fff'
                />
              </TouchableOpacity>
            </View>

            {/* Conditions d'utilisation */}
            <View style={styles.termsContainer}>
              <TouchableOpacity style={styles.checkbox}>
                <Ionicons name='checkbox-outline' size={20} color='#fff' />
              </TouchableOpacity>
              <Text style={styles.termsText}>
                J'accepte les{" "}
                <Text style={styles.termsLink}>conditions d'utilisation</Text>{" "}
                et la{" "}
                <Text style={styles.termsLink}>
                  politique de confidentialité
                </Text>
              </Text>
            </View>

            {/* Bouton d'inscription */}
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}>
              <LinearGradient
                colors={["#ff6b6b", "#ee5a24"]}
                style={styles.gradientButton}>
                <Text style={styles.registerButtonText}>Créer mon compte</Text>
                <Ionicons name='person-add' size={20} color='#fff' />
              </LinearGradient>
            </TouchableOpacity>

            {/* Lien vers connexion */}
            <View style={styles.loginLink}>
              <Text style={styles.loginLinkText}>Déjà un compte ? </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.loginLinkButton}>Se connecter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 50,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  backButton: {
    position: "absolute",
    left: 0,
    top: 0,
    padding: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 25,
    marginBottom: 20,
    paddingHorizontal: 20,
    height: 50,
  },
  inputIcon: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  eyeIcon: {
    padding: 5,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 30,
  },
  checkbox: {
    marginRight: 10,
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    color: "#fff",
    textDecorationLine: "underline",
  },
  registerButton: {
    borderRadius: 25,
    overflow: "hidden",
    marginBottom: 20,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
  loginLink: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginLinkText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
  },
  loginLinkButton: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

export default RegisterScreen;
