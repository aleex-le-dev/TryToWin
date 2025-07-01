import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { ANDROID_CLIENT_ID, EXPO_CLIENT_ID } from "../utils/googleAuthConfig";
import { auth } from "../utils/firebaseConfig";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { authService } from "../services/authService";
import { authSchemas, validateForm } from "../schemas/validationSchemas";
import { useAuth } from "../hooks/useAuth";
import { colors, messages } from "../constants";

WebBrowser.maybeCompleteAuthSession();

// Écran de connexion principal avec design moderne et interactif
const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Utilisation du hook d'authentification
  const { login, loading } = useAuth();

  // Google Auth avec logs de débogage
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: EXPO_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
  });

  console.warn("[DEBUG] Google Auth - Request:", request ? "Prêt" : "Non prêt");
  console.warn("[DEBUG] Google Auth - Response:", response);

  React.useEffect(() => {
    console.warn("[DEBUG] Google Auth - Response changed:", response);
    if (response?.type === "success") {
      console.warn("[DEBUG] Google Auth - Success response received");
      const { id_token } = response.params;
      console.warn(
        "[DEBUG] Google Auth - ID Token:",
        id_token ? "Présent" : "Manquant"
      );

      const credential = GoogleAuthProvider.credential(id_token);
      setLoading(true);

      signInWithCredential(auth, credential)
        .then((result) => {
          console.warn(
            "[DEBUG] Google Auth - Firebase signin success:",
            result.user.email
          );
          Alert.alert("Succès", "Connecté avec Google !");
          navigation.navigate("MainTabs");
        })
        .catch((err) => {
          console.warn(
            "[DEBUG] Google Auth - Firebase signin error:",
            err.message
          );
          Alert.alert("Erreur", err.message);
        })
        .finally(() => setLoading(false));
    } else if (response?.type === "error") {
      console.warn("[DEBUG] Google Auth - Error response:", response.error);
      Alert.alert("Erreur", "Erreur lors de l'authentification Google");
    }
  }, [response]);

  // Validation en temps réel
  const validateField = async (fieldName, value) => {
    try {
      await authSchemas.login.validateAt(fieldName, { [fieldName]: value });
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, [fieldName]: error.message }));
    }
  };

  // Gestion des changements de champs
  const handleFieldChange = (fieldName, value) => {
    if (fieldName === "email") setEmail(value);
    if (fieldName === "password") setPassword(value);

    // Effacer l'erreur si le champ est modifié
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  // Gestion du focus/blur
  const handleFieldBlur = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, fieldName === "email" ? email : password);
  };

  const handleLogin = async () => {
    // Validation complète du formulaire
    const validation = await validateForm(authSchemas.login, {
      email,
      password,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      Toast.show({
        type: "error",
        text1: "Erreur de validation",
        text2: "Veuillez corriger les erreurs dans le formulaire",
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }

    // Utilisation du service d'authentification
    const result = await login(email, password);

    if (result.success) {
      Toast.show({
        type: "success",
        text1: messages.success.login,
        text2: "Bienvenue sur TryToWin !",
        position: "top",
        visibilityTime: 3000,
      });
      navigation.navigate("MainTabs");
    } else {
      Toast.show({
        type: "error",
        text1: "Erreur de connexion",
        text2: result.error,
        position: "top",
        visibilityTime: 4000,
      });
    }
  };

  const handleGoogleLogin = async () => {
    console.warn("[DEBUG] Google Auth - Button pressed");
    console.warn("[DEBUG] Google Auth - Request available:", !!request);
    console.warn("[DEBUG] Google Auth - Loading state:", loading);

    if (!request) {
      console.warn("[DEBUG] Google Auth - Request not ready");
      Alert.alert("Erreur", "Configuration Google non prête");
      return;
    }

    if (loading) {
      console.warn("[DEBUG] Google Auth - Already loading");
      return;
    }

    try {
      console.warn("[DEBUG] Google Auth - Starting prompt");
      const result = await promptAsync();
      console.warn("[DEBUG] Google Auth - Prompt result:", result);
    } catch (error) {
      console.warn("[DEBUG] Google Auth - Prompt error:", error);
      Alert.alert(
        "Erreur",
        "Erreur lors du lancement de l'authentification Google"
      );
    }
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
                style={[
                  styles.input,
                  errors.email && touched.email && styles.inputError,
                ]}
                placeholder='Email'
                placeholderTextColor='rgba(255,255,255,0.7)'
                value={email}
                onChangeText={(value) => handleFieldChange("email", value)}
                onBlur={() => handleFieldBlur("email")}
                keyboardType='email-address'
                autoCapitalize='none'
              />
            </View>
            {errors.email && touched.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            <View style={styles.inputContainer}>
              <Ionicons
                name='lock-closed-outline'
                size={20}
                color='#fff'
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, errors.password && touched.password && styles.inputError]}
                placeholder='Mot de passe'
                placeholderTextColor='rgba(255,255,255,0.7)'
                value={password}
                onChangeText={(value) => handleFieldChange('password', value)}
                onBlur={() => handleFieldBlur('password')}
                secureTextEntry={!showPassword}
              />
            </View>
            {errors.password && touched.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
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
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={loading}>
              <LinearGradient
                colors={["#ff6b6b", "#ee5a24"]}
                style={styles.gradientButton}>
                {loading ? (
                  <ActivityIndicator size='small' color='#fff' />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>Se connecter</Text>
                    <Ionicons name='arrow-forward' size={20} color='#fff' />
                  </>
                )}
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
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={handleGoogleLogin}
                  disabled={loading}>
                  {loading ? (
                    <ActivityIndicator size='small' color='#fff' />
                  ) : (
                    <Ionicons name='logo-google' size={24} color='#fff' />
                  )}
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
  disabledButton: {
    opacity: 0.6,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 1,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: -15,
    marginBottom: 10,
    marginLeft: 20,
  },
});

export default LoginScreen;
