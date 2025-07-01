// SocialScreen.js - Écran social pour ajouter des amis et chatter
// Utilisé dans la barre de navigation principale (onglet Social)
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Clipboard,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import Toast from "react-native-toast-message";

// Données fictives pour la démonstration
const allUsers = [
  { id: "1", username: "MariePro" },
  { id: "2", username: "PierreMaster" },
  { id: "3", username: "SophieWin" },
  { id: "4", username: "LucasChamp" },
];

export default function SocialScreen() {
  // Liste d'amis simulée
  const [friends, setFriends] = useState([
    { id: "2", username: "PierreMaster" },
  ]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [longPressedFriendId, setLongPressedFriendId] = useState(null);

  // Lien unique de profil (à adapter selon la logique réelle)
  const myProfileLink = `trytowin://addfriend/1234`;

  // Fonction pour copier le lien avec gestion d'erreur
  const copyToClipboard = async () => {
    try {
      await Clipboard.setString(myProfileLink);
      Toast.show({
        type: "success",
        text1: "Lien copié",
        text2: "Le lien de votre profil a été copié !",
        position: "top",
        visibilityTime: 1500,
      });
    } catch (error) {
      console.error("Erreur lors de la copie:", error);
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Impossible de copier le lien",
        position: "top",
        visibilityTime: 1500,
      });
    }
  };

  // Ajouter un ami avec vérification
  const addFriend = useCallback(
    (user) => {
      if (user && user.id && !friends.find((f) => f.id === user.id)) {
        setFriends((prev) => [...prev, user]);
      }
    },
    [friends]
  );

  // Envoyer un message (mock) avec vérification
  const sendMessage = useCallback(() => {
    if (input.trim() && selectedFriend) {
      setMessages((prev) => [...prev, { fromMe: true, text: input.trim() }]);
      setInput("");
    }
  }, [input, selectedFriend]);

  // Supprimer un ami avec confirmation
  const removeFriend = useCallback((id) => {
    Alert.alert(
      "Supprimer l'ami",
      "Êtes-vous sûr de vouloir supprimer cet ami ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            setFriends((prev) => prev.filter((f) => f.id !== id));
            setLongPressedFriendId(null);
          },
        },
      ]
    );
  }, []);

  // Filtrage des utilisateurs selon la recherche
  const filteredUsers = allUsers.filter(
    (u) =>
      u &&
      u.id &&
      u.username &&
      !friends.find((f) => f.id === u.id) &&
      u.username.toLowerCase().includes(search.toLowerCase())
  );

  // Rendu optimisé des messages
  const renderMessage = useCallback(
    ({ item }) => (
      <View
        style={[
          styles.messageBubble,
          item.fromMe ? styles.myMessage : styles.theirMessage,
        ]}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    ),
    []
  );

  // Rendu optimisé des amis
  const renderFriend = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.friendItem}
        onPress={() => setSelectedFriend(item)}
        onLongPress={() => setLongPressedFriendId(item.id)}
        activeOpacity={0.7}>
        <Ionicons name='person-circle' size={28} color='#667eea' />
        <Text style={styles.friendName}>{item.username}</Text>
        <Ionicons name='chatbubble-ellipses' size={20} color='#4ECDC4' />
        {longPressedFriendId === item.id && (
          <TouchableOpacity
            onPress={() => removeFriend(item.id)}
            style={styles.deleteIcon}>
            <Ionicons name='trash' size={22} color='#FF6B6B' />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    ),
    [longPressedFriendId, removeFriend]
  );

  // Rendu optimisé des utilisateurs
  const renderUser = useCallback(
    ({ item }) => (
      <View style={styles.userItem}>
        <Ionicons name='person-add' size={24} color='#FFD700' />
        <Text style={styles.userName}>{item.username}</Text>
        <TouchableOpacity onPress={() => addFriend(item)}>
          <Ionicons name='add-circle' size={24} color='#4ECDC4' />
        </TouchableOpacity>
      </View>
    ),
    [addFriend]
  );

  // Affichage du chat avec un ami
  const renderChat = () => (
    <View style={styles.chatContainer}>
      <Text style={styles.chatTitle}>Chat avec {selectedFriend?.username}</Text>
      <FlatList
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        renderItem={renderMessage}
        style={{ flex: 1 }}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder='Votre message...'
          multiline={false}
        />
        <TouchableOpacity onPress={sendMessage}>
          <Ionicons name='send' size={24} color='#667eea' />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setSelectedFriend(null)}>
        <Ionicons name='arrow-back' size={20} color='#667eea' />
        <Text style={styles.backText}>Retour</Text>
      </TouchableOpacity>
    </View>
  );

  // Affichage principal : recherche, liste d'amis et d'utilisateurs
  return (
    <View style={styles.container}>
      {/* Section Partager mon profil avec QR code et lien */}
      <View style={styles.shareProfileSection}>
        <Text style={styles.shareTitle}>Partager mon profil</Text>
        <View style={styles.qrAndLinkRow}>
          <QRCode value={myProfileLink} size={90} />
          <View style={styles.linkColumn}>
            <Text style={styles.profileLink}>{myProfileLink}</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={copyToClipboard}>
              <Ionicons name='copy' size={18} color='#667eea' />
              <Text style={styles.copyButtonText}>Copier le lien</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* Toast pour feedback */}
      <Toast />
      {selectedFriend ? (
        renderChat()
      ) : (
        <>
          <Text style={styles.sectionTitle}>Rechercher une personne</Text>
          <View style={styles.searchContainer}>
            <Ionicons
              name='search'
              size={20}
              color='#667eea'
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Nom d'utilisateur..."
              value={search}
              onChangeText={setSearch}
              multiline={false}
            />
          </View>
          <Text style={styles.sectionTitle}>Amis</Text>
          <FlatList
            data={friends}
            keyExtractor={(item) => item.id}
            renderItem={renderFriend}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Aucun ami pour l'instant.</Text>
            }
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
          <Text style={styles.sectionTitle}>Ajouter des personnes</Text>
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id}
            renderItem={renderUser}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Aucun utilisateur trouvé.</Text>
            }
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 10,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    elevation: 2,
  },
  friendName: { flex: 1, fontSize: 16, color: "#333", marginLeft: 10 },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
  },
  userName: { flex: 1, fontSize: 16, color: "#333", marginLeft: 10 },
  emptyText: {
    color: "#6c757d",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 10,
  },
  chatContainer: { flex: 1 },
  chatTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#667eea",
    marginBottom: 10,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 4,
    maxWidth: "80%",
  },
  myMessage: { backgroundColor: "#e1f5fe", alignSelf: "flex-end" },
  theirMessage: { backgroundColor: "#f1f3f4", alignSelf: "flex-start" },
  messageText: { fontSize: 15, color: "#333" },
  inputRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#e9ecef",
    marginRight: 10,
  },
  backButton: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  backText: { color: "#667eea", marginLeft: 5, fontSize: 15 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  searchInput: { flex: 1, fontSize: 15, color: "#333" },
  deleteIcon: {
    marginLeft: 10,
    padding: 4,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 2,
  },
  shareProfileSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    alignItems: "center",
    elevation: 3,
    flexDirection: "column",
  },
  shareTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#667eea",
    marginBottom: 10,
  },
  qrAndLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  linkColumn: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginLeft: 10,
    flex: 1,
  },
  profileLink: {
    color: "#23272a",
    fontSize: 13,
    marginBottom: 6,
    maxWidth: 170,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f3f4",
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  copyButtonText: {
    color: "#667eea",
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 13,
  },
});
