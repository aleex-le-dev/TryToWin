// Page Paramètres > Compte
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Modal } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../utils/firebaseConfig";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

const AccountSettings = ({ navigation }) => {
  const { theme } = useTheme();
  const { user, updateUserProfile } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // États pour le changement de mot de passe
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // États pour le changement de nom d'utilisateur
  const [newUsername, setNewUsername] = useState("");
  const [isChangingUsername, setIsChangingUsername] = useState(false);
  
  // États pour le changement d'email
  const [newEmail, setNewEmail] = useState("");
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return;
    }
    
    if (newPassword.length < 6) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setIsChangingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      
      Alert.alert("Succès", "Mot de passe modifié avec succès");
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      if (error.code === "auth/wrong-password") {
        Alert.alert("Erreur", "Mot de passe actuel incorrect");
      } else {
        Alert.alert("Erreur", "Impossible de modifier le mot de passe");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleChangeUsername = async () => {
    if (newUsername.trim().length < 3) {
      Alert.alert("Erreur", "Le nom d'utilisateur doit contenir au moins 3 caractères");
      return;
    }

    setIsChangingUsername(true);
    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        username: newUsername.trim()
      });
      
      await updateUserProfile({ username: newUsername.trim() });
      Alert.alert("Succès", "Nom d'utilisateur modifié avec succès");
      setShowUsernameModal(false);
      setNewUsername("");
    } catch (error) {
      Alert.alert("Erreur", "Impossible de modifier le nom d'utilisateur");
    } finally {
      setIsChangingUsername(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail.includes("@")) {
      Alert.alert("Erreur", "Veuillez entrer une adresse email valide");
      return;
    }

    setIsChangingEmail(true);
    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        email: newEmail.trim()
      });
      
      Alert.alert("Succès", "Email modifié avec succès");
      setShowEmailModal(false);
      setNewEmail("");
    } catch (error) {
      Alert.alert("Erreur", "Impossible de modifier l'email");
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Supprimer le compte",
      "Cette action est irréversible. Toutes vos données seront définitivement supprimées.",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive",
          onPress: () => {
            // Logique de suppression du compte
            Alert.alert("Fonctionnalité à venir", "La suppression de compte sera bientôt disponible");
          }
        }
      ]
    );
  };

  const renderSettingItem = ({ icon, title, subtitle, onPress, isDestructive = false }) => (
    <TouchableOpacity 
      style={[styles.settingItem, { borderBottomColor: theme.border }]} 
      onPress={onPress}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, isDestructive && styles.iconContainerDestructive]}>
          <Ionicons 
            name={icon} 
            size={20} 
            color={isDestructive ? "#ef4444" : theme.primary} 
          />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
    </TouchableOpacity>
  );

  const renderModal = ({ visible, onClose, title, children, onConfirm, confirmText, isLoading }) => (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          {children}
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalButtonCancel, { borderColor: theme.border }]} 
              onPress={onClose}
            >
              <Text style={[styles.modalButtonText, { color: theme.textSecondary }]}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: theme.primary }]} 
              onPress={onConfirm}
              disabled={isLoading}
            >
              <Text style={[styles.modalButtonText, { color: "#fff" }]}>
                {isLoading ? "Chargement..." : confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name='arrow-back' size={22} color={theme.icon} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Compte</Text>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Informations personnelles</Text>
          
          {renderSettingItem({
            icon: "person-outline",
            title: "Nom d'utilisateur",
            subtitle: user?.username || "Non défini",
            onPress: () => setShowUsernameModal(true)
          })}
          
          {renderSettingItem({
            icon: "mail-outline",
            title: "Adresse email",
            subtitle: user?.email || "Non défini",
            onPress: () => setShowEmailModal(true)
          })}
          
          {renderSettingItem({
            icon: "lock-closed-outline",
            title: "Mot de passe",
            subtitle: "Modifier le mot de passe",
            onPress: () => setShowPasswordModal(true)
          })}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Sécurité</Text>
          
          {renderSettingItem({
            icon: "shield-checkmark-outline",
            title: "Authentification à deux facteurs",
            subtitle: "Ajouter une couche de sécurité",
            onPress: () => Alert.alert("Fonctionnalité à venir", "L'authentification à deux facteurs sera bientôt disponible")
          })}
          
          {renderSettingItem({
            icon: "notifications-outline",
            title: "Notifications de connexion",
            subtitle: "Être alerté des nouvelles connexions",
            onPress: () => Alert.alert("Fonctionnalité à venir", "Les notifications de connexion seront bientôt disponibles")
          })}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Données</Text>
          
          {renderSettingItem({
            icon: "download-outline",
            title: "Exporter mes données",
            subtitle: "Télécharger toutes mes informations",
            onPress: () => Alert.alert("Fonctionnalité à venir", "L'export des données sera bientôt disponible")
          })}
          
          {renderSettingItem({
            icon: "trash-outline",
            title: "Supprimer mon compte",
            subtitle: "Supprimer définitivement toutes mes données",
            onPress: handleDeleteAccount,
            isDestructive: true
          })}
        </View>
      </ScrollView>

      {/* Modal changement de mot de passe */}
      {renderModal({
        visible: showPasswordModal,
        onClose: () => setShowPasswordModal(false),
        title: "Modifier le mot de passe",
        onConfirm: handleChangePassword,
        confirmText: "Modifier",
        isLoading: isChangingPassword,
        children: (
          <View style={styles.modalBody}>
            <TextInput
              style={[styles.modalInput, { 
                backgroundColor: theme.surface, 
                borderColor: theme.border,
                color: theme.text 
              }]}
              placeholder="Mot de passe actuel"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TextInput
              style={[styles.modalInput, { 
                backgroundColor: theme.surface, 
                borderColor: theme.border,
                color: theme.text 
              }]}
              placeholder="Nouveau mot de passe"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={[styles.modalInput, { 
                backgroundColor: theme.surface, 
                borderColor: theme.border,
                color: theme.text 
              }]}
              placeholder="Confirmer le nouveau mot de passe"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
        )
      })}

      {/* Modal changement de nom d'utilisateur */}
      {renderModal({
        visible: showUsernameModal,
        onClose: () => setShowUsernameModal(false),
        title: "Modifier le nom d'utilisateur",
        onConfirm: handleChangeUsername,
        confirmText: "Modifier",
        isLoading: isChangingUsername,
        children: (
          <View style={styles.modalBody}>
            <TextInput
              style={[styles.modalInput, { 
                backgroundColor: theme.surface, 
                borderColor: theme.border,
                color: theme.text 
              }]}
              placeholder="Nouveau nom d'utilisateur"
              placeholderTextColor={theme.textSecondary}
              value={newUsername}
              onChangeText={setNewUsername}
            />
          </View>
        )
      })}

      {/* Modal changement d'email */}
      {renderModal({
        visible: showEmailModal,
        onClose: () => setShowEmailModal(false),
        title: "Modifier l'adresse email",
        onConfirm: handleChangeEmail,
        confirmText: "Modifier",
        isLoading: isChangingEmail,
        children: (
          <View style={styles.modalBody}>
            <TextInput
              style={[styles.modalInput, { 
                backgroundColor: theme.surface, 
                borderColor: theme.border,
                color: theme.text 
              }]}
              placeholder="Nouvelle adresse email"
              placeholderTextColor={theme.textSecondary}
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
            />
          </View>
        )
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff", 
    padding: 24 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 18, 
    paddingTop: 50 
  },
  backBtn: { 
    marginRight: 6, 
    padding: 4 
  },
  title: {
    color: "#23272a",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 0,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  iconContainerDestructive: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalButtonCancel: {
    borderWidth: 1,
  },
  modalButtonConfirm: {
    backgroundColor: "#667eea",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AccountSettings;
