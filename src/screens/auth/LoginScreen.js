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
import { auth } from "../../utils/firebaseConfig";
import { authService } from "../../services/authService";
import { authSchemas, validateForm } from "../../schemas/validationSchemas";
import { useAuth } from "../../hooks/useAuth";
import { colors } from "../../constants/colors";
import { messages } from "../../constants/config";
import { logError, logSuccess, logInfo } from "../../utils/errorHandler";
import FormErrorMessage from "../../components/FormErrorMessage";
import EmailVerificationRequiredPopup from "../../components/EmailVerificationRequiredPopup";
import { useToast } from "../../contexts/ToastContext";


// Écran de connexion principal avec design moderne et interactif
const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  // Utilisation du hook d'authentification
  const { login } = useAuth();
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const { showToast } = useToast();



  // Auth Google supprimée

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
        // Bloquer l'accès si l'email n'est pas vérifié: afficher le popup et rester sur la pile d'auth
        if (!result.user?.emailVerified) {
          setVerificationEmail(email);
          setShowVerificationPopup(true);
          await authService.logout();
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

  const handleGoogleLogin = async () => {};

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
            <Ionicons name="game-controller" size={50} color="white" />
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

            {/* Connexion rapide retirée */}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <EmailVerificationRequiredPopup
        visible={showVerificationPopup}
        email={verificationEmail}
        onClose={() => setShowVerificationPopup(false)}
        onResendEmail={() => {}}
      />
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
