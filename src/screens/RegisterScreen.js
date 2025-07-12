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
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { authService } from "../services/authService";
import {
  authSchemas,
  validateForm,
  checkPasswordStrength,
} from "../schemas/validationSchemas";
import { useAuth } from "../hooks/useAuth";
import { colors } from "../constants/colors";
import { messages } from "../constants/config";
import { logError, logSuccess, logInfo } from "../utils/errorHandler";
import FormErrorMessage from "../components/FormErrorMessage";

// Écran d'inscription avec validation des champs
const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(null);

  // Utilisation du hook d'authentification
  const { register, loading } = useAuth();

  // Validation en temps réel
  const validateField = async (fieldName, value) => {
    try {
      await authSchemas.register.validateAt(fieldName, { [fieldName]: value });
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, [fieldName]: error.message }));
    }
  };

  // Gestion des changements de champs
  const handleFieldChange = (fieldName, value) => {
    if (fieldName === "username") setUsername(value);
    if (fieldName === "email") setEmail(value);
    if (fieldName === "password") {
      setPassword(value);
      setPasswordStrength(checkPasswordStrength(value));
    }
    if (fieldName === "confirmPassword") setConfirmPassword(value);

    // Effacer l'erreur si le champ est modifié
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  // Gestion du focus/blur
  const handleFieldBlur = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    validateField(
      fieldName,
      fieldName === "username"
        ? username
        : fieldName === "email"
        ? email
        : fieldName === "password"
        ? password
        : confirmPassword
    );
  };

  const handleRegister = async () => {
    try {
      logInfo("Tentative d'inscription", "RegisterScreen.handleRegister");

      // Validation complète du formulaire
      const validation = await validateForm(authSchemas.register, {
        username,
        email,
        password,
        confirmPassword,
        acceptTerms: true, // À implémenter avec une checkbox
      });

      if (!validation.isValid) {
        logError(
          new Error(`Validation errors: ${JSON.stringify(validation.errors)}`),
          "RegisterScreen.handleRegister"
        );
        setErrors(validation.errors);
        setTouched({
          username: true,
          email: true,
          password: true,
          confirmPassword: true,
          // acceptTerms: true, // si tu veux afficher l'erreur sur la checkbox
        });
        return;
      }

      // Utilisation du service d'authentification
      const result = await register(email, password, username);

      if (result.success) {
        await authService.logout();
        logSuccess(
          `Inscription réussie pour: ${email}`,
          "RegisterScreen.handleRegister"
        );
        Toast.show({
          type: "success",
          text1: messages.success.register,
          text2: "Bienvenue sur TryToWin !",
          position: "top",
          topOffset: 40,
          visibilityTime: 2000,
        });
        navigation.navigate("EmailValidation", { email });
      } else {
        logError(
          new Error(`Registration failed: ${result.error}`),
          "RegisterScreen.handleRegister"
        );
        Toast.show({
          type: "error",
          text1: "Erreur d'inscription",
          text2: result.error,
          position: "top",
          topOffset: 40,
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      logError(error, "RegisterScreen.handleRegister");
      Toast.show({
        type: "error",
        text1: "Erreur inattendue",
        text2: "Une erreur est survenue lors de l'inscription",
        position: "top",
        topOffset: 40,
        visibilityTime: 2000,
      });
    }
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
            {/* Champ Nom d'utilisateur */}
            <FormErrorMessage
              message={
                touched.username && errors.username ? errors.username : ""
              }
            />
            <View
              style={[
                styles.inputContainer,
                touched.username && errors.username && styles.inputError,
              ]}>
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
                onChangeText={(value) => handleFieldChange("username", value)}
                onBlur={() => handleFieldBlur("username")}
                autoCapitalize='none'
              />
            </View>

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

            {/* Champ Confirmation mot de passe */}
            <FormErrorMessage
              message={
                touched.confirmPassword && errors.confirmPassword
                  ? errors.confirmPassword
                  : ""
              }
            />
            <View
              style={[
                styles.inputContainer,
                touched.confirmPassword &&
                  errors.confirmPassword &&
                  styles.inputError,
              ]}>
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
                onChangeText={(value) =>
                  handleFieldChange("confirmPassword", value)
                }
                onBlur={() => handleFieldBlur("confirmPassword")}
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
              style={[styles.registerButton, loading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={loading}>
              <LinearGradient
                colors={["#ff6b6b", "#ee5a24"]}
                style={styles.gradientButton}>
                {loading ? (
                  <ActivityIndicator size='small' color='#fff' />
                ) : (
                  <>
                    <Text style={styles.registerButtonText}>
                      Créer mon compte
                    </Text>
                    <Ionicons name='person-add' size={20} color='#fff' />
                  </>
                )}
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

export default RegisterScreen;
