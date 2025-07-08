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
import { ANDROID_CLIENT_ID, EXPO_CLIENT_ID } from "../../utils/googleAuthConfig";
import { auth } from "../../utils/firebaseConfig";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { authService } from "../../services/authService";
import { authSchemas, validateForm } from "../../schemas/validationSchemas";
import { useAuth } from "../../hooks/useAuth";
import { colors } from "../../constants/colors";
import { messages } from "../../constants/config";
import { logError, logSuccess, logInfo } from "../../utils/errorHandler";
import FormErrorMessage from "../../components/FormErrorMessage";
import { useToast } from "../../contexts/ToastContext";

WebBrowser.maybeCompleteAuthSession();

// Écran de connexion principal avec design moderne et interactif
const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Utilisation du hook d'authentification
  const { login } = useAuth();
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  // Google Auth avec logs de débogage
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: EXPO_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
  });

  const { showToast } = useToast();

  logInfo(
    `Google Auth - Request: ${request ? "Prêt" : "Non prêt"}`,
    "LoginScreen"
  );
  logInfo(`Google Auth - Response: ${JSON.stringify(response)}`, "LoginScreen");

  React.useEffect(() => {
    logInfo(
      `Google Auth - Response changed: ${JSON.stringify(response)}`,
      "LoginScreen"
    );

    if (response?.type === "success") {
      logInfo("Google Auth - Success response received", "LoginScreen");
      const { id_token } = response.params;
      logInfo(
        `Google Auth - ID Token: ${id_token ? "Présent" : "Manquant"}`,
        "LoginScreen"
      );

      const credential = GoogleAuthProvider.credential(id_token);
      setLoadingEmail(true);

      signInWithCredential(auth, credential)
        .then((result) => {
          logSuccess(
            `Google Auth - Firebase signin success: ${result.user.email}`,
            "LoginScreen"
          );
          Alert.alert("Succès", "Connecté avec Google !");
          navigation.navigate("MainTabs");
        })
        .catch((err) => {
          logError(err, "LoginScreen.GoogleAuth");
          Alert.alert("Erreur", err.message);
        })
        .finally(() => setLoadingEmail(false));
    } else if (response?.type === "error") {
      logError(
        new Error(`Google Auth Error: ${response.error}`),
        "LoginScreen.GoogleAuth"
      );
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
    setLoadingEmail(true);
    try {
      logInfo("Tentative de connexion", "LoginScreen.handleLogin");

      // Validation complète du formulaire
      const validation = await validateForm(authSchemas.login, {
        email,
        password,
      });

      if (!validation.isValid) {
        logError(
          new Error(`Validation errors: ${JSON.stringify(validation.errors)}`),
          "LoginScreen.handleLogin"
        );
        setErrors(validation.errors);
        setTouched({
          email: true,
          password: true,
        });
        return;
      }

      // Utilisation du service d'authentification
      const result = await login(email, password);

      if (result.success) {
        // Vérification de l'email
        if (!result.user?.emailVerified) {
          Alert.alert(
            "Validation requise",
            "Merci de valider votre adresse e-mail avant de vous connecter. Vérifie ta boîte mail et clique sur le lien de validation."
          );
          return;
        }
        logSuccess(
          `Connexion réussie pour: ${email}`,
          "LoginScreen.handleLogin"
        );
      } else {
        logError(
          new Error(`Login failed: ${result.error}`),
          "LoginScreen.handleLogin"
        );
        showToast({
          type: "error",
          title: "Erreur de connexion",
          message: result.error,
        });
      }
    } catch (error) {
      logError(error, "LoginScreen.handleLogin");
      showToast({
        type: "error",
        title: "Erreur inattendue",
        message: "Une erreur est survenue lors de la connexion",
      });
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    try {
      logInfo("Google Auth - Button pressed", "LoginScreen.handleGoogleLogin");
      logInfo(
        `Google Auth - Request available: ${!!request}`,
        "LoginScreen.handleGoogleLogin"
      );
      logInfo(
        `Google Auth - Loading state: ${loadingGoogle}`,
        "LoginScreen.handleGoogleLogin"
      );

      if (!request) {
        logError(
          new Error("Configuration Google non prête"),
          "LoginScreen.handleGoogleLogin"
        );
        setLoadingGoogle(false);
        return;
      }

      if (loadingGoogle) {
        logInfo(
          "Google Auth - Already loading",
          "LoginScreen.handleGoogleLogin"
        );
        setLoadingGoogle(false);
        return;
      }

      logInfo("Google Auth - Starting prompt", "LoginScreen.handleGoogleLogin");
      await promptAsync();
    } catch (error) {
      logError(error, "LoginScreen.handleGoogleLogin");
      Alert.alert(
        "Erreur",
        "Erreur lors du lancement de l'authentification Google"
      );
    } finally {
      setLoadingGoogle(false);
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
              {/* Icône supprimée ici */}
            </View>
            <Text style={styles.title}>TryToWin</Text>
            <Text style={styles.subtitle}>Votre destination de jeux</Text>
          </View>

          {/* Formulaire de connexion */}
          <View style={styles.formContainer}>
            {/* Champ Email */}
            <FormErrorMessage
              message={touched.email && errors.email ? errors.email : ""}
            />
            <View
              style={[
                styles.inputContainer,
                touched.email && errors.email && styles.inputError,
              ]}>
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
                onChangeText={(value) => handleFieldChange("email", value)}
                onBlur={() => handleFieldBlur("email")}
                keyboardType='email-address'
                autoCapitalize='none'
              />
            </View>

            {/* Champ Mot de passe */}
            <FormErrorMessage
              message={
                touched.password && errors.password ? errors.password : ""
              }
            />
            <View
              style={[
                styles.inputContainer,
                touched.password && errors.password && styles.inputError,
              ]}>
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
                onChangeText={(value) => handleFieldChange("password", value)}
                onBlur={() => handleFieldBlur("password")}
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
            <TouchableOpacity
              style={[
                styles.loginButton,
                loadingEmail && styles.disabledButton,
              ]}
              onPress={handleLogin}
              disabled={loadingEmail}>
              <LinearGradient
                colors={["#ff6b6b", "#ee5a24"]}
                style={styles.gradientButton}>
                {loadingEmail ? (
                  <ActivityIndicator size='small' color='#fff' />
                ) : (
                  <>
                    <Ionicons
                      name='log-in-outline'
                      size={20}
                      color='#fff'
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.loginButtonText}>Se connecter</Text>
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
                  disabled={loadingGoogle}>
                  {loadingGoogle ? (
                    <ActivityIndicator size='small' color='#fff' />
                  ) : (
                    <Ionicons name='logo-google' size={24} color='#fff' />
                  )}
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
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginLeft: 20,
    backgroundColor: "rgba(231, 76, 60, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 6,
    flex: 1,
  },
});

export default LoginScreen;
