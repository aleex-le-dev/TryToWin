import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// Écran de connexion principal avec design moderne et interactif
const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }
    // Simulation de connexion réussie
    Alert.alert("Succès", "Connexion réussie !", [
      {
        text: "OK",
        onPress: () => navigation.navigate("MainTabs"),
      },
    ]);
  };

  const handleRegister = () => {
    navigation.navigate("Register");
  };

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Logo et titre */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name='game-controller' size={60} color='#fff' />
            </View>
            <Text style={styles.title}>TryToWin</Text>
            <Text style={styles.subtitle}>Votre destination de jeux</Text>
          </View>

          {/* Formulaire de connexion */}
          <View style={styles.formContainer}>
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

            {/* Bouton de connexion */}
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <LinearGradient
                colors={["#ff6b6b", "#ee5a24"]}
                style={styles.gradientButton}>
                <Text style={styles.loginButtonText}>Se connecter</Text>
                <Ionicons name='arrow-forward' size={20} color='#fff' />
              </LinearGradient>
            </TouchableOpacity>

            {/* Séparateur */}
            <View style={styles.separator}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>ou</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* Bouton d'inscription */}
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}>
              <Text style={styles.registerButtonText}>Créer un compte</Text>
            </TouchableOpacity>

            {/* Connexion rapide */}
            <View style={styles.quickLogin}>
              <Text style={styles.quickLoginText}>Connexion rapide</Text>
              <View style={styles.socialButtons}>
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name='logo-google' size={24} color='#fff' />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name='logo-facebook' size={24} color='#fff' />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name='logo-apple' size={24} color='#fff' />
                </TouchableOpacity>
              </View>
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
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  header: {
    alignItems: "center",
    marginBottom: 50,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
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
  loginButton: {
    marginTop: 20,
    borderRadius: 25,
    overflow: "hidden",
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 30,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  separatorText: {
    color: "rgba(255,255,255,0.8)",
    marginHorizontal: 20,
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 30,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  quickLogin: {
    alignItems: "center",
  },
  quickLoginText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginBottom: 15,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "center",
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
});

export default LoginScreen;
