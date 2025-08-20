// Composant popup pour validation d'email requise
// Affiche un message informatif avec option de renvoi d'email
// Style identique à UnverifiedAccountPopup pour la cohérence

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { EMAIL_MESSAGES } from "../constants/emailMessages";

const EmailVerificationRequiredPopup = ({ 
  visible, 
  onClose, 
  onResendEmail, 
  email 
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.popupContainer}>
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            style={styles.popupGradient}
          >
            {/* Icône d'information */}
            <View style={styles.iconContainer}>
              <Ionicons name="mail-check-outline" size={50} color="#fff" />
            </View>

            {/* Titre */}
            <Text style={styles.title}>{EMAIL_MESSAGES.VERIFICATION_REQUIRED.title}</Text>

            {/* Message */}
            <Text style={styles.message}>
              {EMAIL_MESSAGES.VERIFICATION_REQUIRED.message}
            </Text>

            {/* Actions */}
            <View style={styles.actionsContainer}>
              {/* Bouton Renvoyer l'email */}
              <TouchableOpacity
                style={styles.resendButton}
                onPress={() => onResendEmail(email)}
              >
                <LinearGradient
                  colors={["#ff6b6b", "#ee5a24"]}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="mail-outline" size={20} color="#fff" />
                  <Text style={styles.buttonText}>{EMAIL_MESSAGES.ACTIONS.RESEND_EMAIL}</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Bouton Fermer */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
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
});

export default EmailVerificationRequiredPopup;
