// Composant popup pour validation d'email requise
// Affiche un message informatif avec option de renvoi d'email
// Style identique à UnverifiedAccountPopup pour la cohérence

import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { EMAIL_MESSAGES } from "../constants/emailMessages";
import { authService } from "../services/authService";
import Toast from "react-native-toast-message";

const EmailVerificationRequiredPopup = ({ 
  visible, 
  onClose, 
  onResendEmail, 
  email 
}) => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleResendEmail = async () => {
    console.log(`[EmailVerificationRequiredPopup] Début de handleResendEmail pour: ${email}`);
    
    if (!password.trim()) {
      console.log(`[EmailVerificationRequiredPopup] Mot de passe requis pour: ${email}`);
      setPasswordError("Mot de passe obligatoire");
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Veuillez entrer votre mot de passe",
        position: "top",
        topOffset: 40,
        visibilityTime: 3000,
      });
      return;
    }

    // Effacer l'erreur si le mot de passe est saisi
    setPasswordError("");
    setLoading(true);
    setEmailSent(false);
    
    try {
      console.log(`[EmailVerificationRequiredPopup] Utilisation de la méthode avec mot de passe pour: ${email}`);
      
      // Utiliser la méthode fonctionnelle avec mot de passe
      const result = await authService.resendEmailVerificationForUnverifiedAccount(email, password);
      console.log(`[EmailVerificationRequiredPopup] Résultat avec mot de passe:`, result);
      
      if (result.success) {
        console.log(`[EmailVerificationRequiredPopup] Succès de l'envoi pour: ${email}`);
        setEmailSent(true);
        Toast.show({
          type: "success",
          text1: "Succès",
          text2: result.message,
          position: "top",
          topOffset: 40,
          visibilityTime: 4000,
        });
        // Ne pas fermer automatiquement, laisser l'utilisateur voir la confirmation
      }
    } catch (error) {
      console.error(`[EmailVerificationRequiredPopup] Erreur lors de l'envoi pour: ${email}:`, error);
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: error.message,
        position: "top",
        topOffset: 40,
        visibilityTime: 4000,
      });
    } finally {
      console.log(`[EmailVerificationRequiredPopup] Fin de handleResendEmail pour: ${email}`);
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    console.log(`[EmailVerificationRequiredPopup] Mot de passe oublié pour: ${email}`);
    try {
      const result = await authService.resetPassword(email);
      if (result.success) {
        Toast.show({
          type: "success",
          text1: "Succès",
          text2: "Email de réinitialisation envoyé ! Vérifiez votre boîte mail",
          position: "top",
          topOffset: 40,
          visibilityTime: 4000,
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: error.message,
        position: "top",
        topOffset: 40,
        visibilityTime: 4000,
      });
    }
  };

  const handleClose = () => {
    setEmailSent(false);
    setPassword("");
    setShowPassword(false);
    setPasswordError("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.popupContainer}>
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            style={styles.popupGradient}
          >
            {/* Icône d'information */}
            <View style={styles.iconContainer}>
              <Ionicons name="mail-outline" size={50} color="#fff" />
            </View>

            {/* Titre */}
            <Text style={styles.title}>{EMAIL_MESSAGES.VERIFICATION_REQUIRED.title}</Text>

            {/* Message */}
            <Text style={styles.message}>
              {EMAIL_MESSAGES.VERIFICATION_REQUIRED.message}
            </Text>

            {/* Actions */}
            <View style={styles.actionsContainer}>
              {/* Champ mot de passe */}
              <View style={styles.passwordContainer}>
                <Text style={styles.passwordLabel}>Mot de passe :</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Entrez votre mot de passe"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      // Effacer l'erreur quand l'utilisateur tape
                      if (passwordError) {
                        setPasswordError("");
                      }
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>
                {passwordError ? (
                  <Text style={styles.passwordErrorText}>{passwordError}</Text>
                ) : null}
              </View>

              {/* Bouton Renvoyer l'email */}
              <TouchableOpacity
                style={[styles.resendButton, loading && styles.disabledButton]}
                onPress={handleResendEmail}
                disabled={loading}
              >
                <LinearGradient
                  colors={["#ff6b6b", "#ee5a24"]}
                  style={styles.buttonGradient}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="mail-outline" size={20} color="#fff" />
                      <Text style={styles.buttonText}>
                        Renvoyer l'email
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Message de confirmation */}
              {emailSent && (
                <View style={styles.confirmationContainer}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.confirmationText}>
                    Email envoyé avec succès ! Vérifiez votre boîte mail.
                  </Text>
                </View>
              )}

              {/* Bouton Mot de passe oublié */}
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={handleForgotPassword}
                disabled={loading}
              >
                <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
              </TouchableOpacity>

              {/* Bouton Fermer */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={styles.closeButtonText}>{EMAIL_MESSAGES.ACTIONS.CLOSE}</Text>
              </TouchableOpacity>
            </View>

            {/* Note d'aide */}
            <Text style={styles.helpText}>
              💡 {EMAIL_MESSAGES.HELP.CHECK_SPAM}
            </Text>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  popupContainer: {
    width: "85%",
    maxWidth: 400,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  popupGradient: {
    padding: 30,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 25,
  },
  actionsContainer: {
    width: "100%",
    gap: 15,
  },
  passwordContainer: {
    width: "100%",
    marginBottom: 15,
  },
  passwordLabel: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "bold",
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  passwordInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 5,
  },
  resendButton: {
    borderRadius: 25,
    overflow: "hidden",
    marginBottom: 10,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  forgotPasswordButton: {
    marginTop: 10,
    marginBottom: 10,
  },
  forgotPasswordText: {
    color: "#fff",
    fontSize: 14,
    textDecorationLine: "underline",
    textAlign: "center",
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  helpText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    marginTop: 20,
    fontStyle: "italic",
  },
  disabledButton: {
    opacity: 0.7,
  },
  confirmationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 10,
    marginBottom: 10,
  },
  confirmationText: {
    color: "#4CAF50",
    fontSize: 14,
    marginLeft: 8,
    fontWeight: "bold",
  },
  passwordErrorText: {
    color: "#ff6b6b",
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
  },
});

export default EmailVerificationRequiredPopup;
