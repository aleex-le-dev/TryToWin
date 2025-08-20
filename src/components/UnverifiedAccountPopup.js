// Composant popup pour compte non validé
// Affiche un message informatif avec option de renvoi d'email
// Style identique à EmailVerificationRequiredPopup pour la cohérence

import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { EMAIL_MESSAGES } from "../constants/emailMessages";
import { authService } from "../services/authService";
import Toast from "react-native-toast-message";

const UnverifiedAccountPopup = ({ 
  visible, 
  onClose, 
  onResendEmail, 
  email 
}) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResendEmail = async () => {
    console.log(`[UnverifiedAccountPopup] Début de handleResendEmail pour: ${email}`);
    
    if (!password.trim()) {
      console.log(`[UnverifiedAccountPopup] Mot de passe vide pour: ${email}`);
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

    console.log(`[UnverifiedAccountPopup] Tentative d'envoi avec mot de passe pour: ${email}`);
    setLoading(true);
    setEmailSent(false);
    try {
      const result = await authService.resendEmailVerificationForUnverifiedAccount(email, password);
      console.log(`[UnverifiedAccountPopup] Résultat de l'envoi:`, result);
      
      if (result.success) {
        console.log(`[UnverifiedAccountPopup] Succès de l'envoi pour: ${email}`);
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
      console.error(`[UnverifiedAccountPopup] Erreur lors de l'envoi pour: ${email}:`, error);
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: error.message,
        position: "top",
        topOffset: 40,
        visibilityTime: 4000,
      });
    } finally {
      console.log(`[UnverifiedAccountPopup] Fin de handleResendEmail pour: ${email}`);
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setShowPassword(false);
    setEmailSent(false);
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
            {/* Icône d'avertissement */}
            <View style={styles.iconContainer}>
              <Ionicons name="warning-outline" size={50} color="#fff" />
            </View>

            {/* Titre */}
            <Text style={styles.title}>{EMAIL_MESSAGES.UNVERIFIED_ACCOUNT.title}</Text>

            {/* Message */}
            <Text style={styles.message}>
              {EMAIL_MESSAGES.UNVERIFIED_ACCOUNT.message}
            </Text>

            {/* Champ mot de passe */}
            <View style={styles.passwordContainer}>
              <Text style={styles.passwordLabel}>Mot de passe :</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Entrez votre mot de passe"
                  placeholderTextColor="rgba(255, 255, 255, 0.7)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
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
                      <Text style={styles.buttonText}>{EMAIL_MESSAGES.ACTIONS.RESEND_EMAIL}</Text>
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
  passwordContainer: {
    width: "100%",
    marginBottom: 20,
  },
  passwordLabel: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
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
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 5,
  },
  actionsContainer: {
    width: "100%",
    gap: 15,
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
    marginBottom: 15,
    width: "100%",
    alignSelf: "center",
  },
  confirmationText: {
    color: "#4CAF50",
    fontSize: 14,
    marginLeft: 10,
    fontWeight: "bold",
  },
});

export default UnverifiedAccountPopup;
