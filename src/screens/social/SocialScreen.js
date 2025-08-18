// SocialScreen.js - Écran social pour ajouter des amis et chatter
// Utilisé dans la barre de navigation principale (onglet Social)
import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import Toast from "react-native-toast-message";
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from "../../hooks/useAuth";
import { doc, getDoc, collection, addDoc, onSnapshot, updateDoc, serverTimestamp, query, orderBy, where } from "firebase/firestore";
import { db } from "../../utils/firebaseConfig";

// Données fictives pour la démonstration (utilisateurs non connectés)
// const allUsers = [
//   { id: "1", username: "MariePro" },
//   { id: "2", username: "PierreMaster" },
//   { id: "3", username: "SophieWin" },
//   { id: "4", username: "LucasChamp" },
// ];

export default function SocialScreen() {
  const { user } = useAuth();
  // Liste d'amis simulée
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [longPressedFriendId, setLongPressedFriendId] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState({});
  const [typingStatus, setTypingStatus] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [testMode, setTestMode] = useState(false);

  // Mode test : simuler un ami fictif
  const enableTestMode = useCallback(() => {
    const testFriend = {
      id: "test-user-123",
      username: "TestUser",
      avatar: "🧪",
      photoURL: "",
      bio: "Utilisateur de test",
      country: "Test",
      isOnline: true,
    };
    
    setFriends([testFriend]);
    setOnlineStatus({ "test-user-123": true });
    setTestMode(true);
    
    Toast.show({
      type: 'success',
      text1: 'Mode test activé',
      text2: 'TestUser a été ajouté pour tester le chat',
      position: 'top',
      topOffset: 40,
      visibilityTime: 2000,
    });
  }, []);

  // Simuler des messages automatiques en mode test
  useEffect(() => {
    if (!testMode || !selectedFriend || selectedFriend.id !== "test-user-123") return;

    const simulateMessages = [
      "Salut ! Comment ça va ?",
      "Je teste le chat en temps réel",
      "C'est vraiment cool !",
      "Les messages s'affichent instantanément",
      "Et l'indicateur de frappe fonctionne aussi !"
    ];

    let messageIndex = 0;
    const interval = setInterval(() => {
      if (messageIndex < simulateMessages.length) {
        const newMessage = {
          id: `test-msg-${Date.now()}`,
          text: simulateMessages[messageIndex],
          senderId: "test-user-123",
          senderName: "TestUser",
          timestamp: new Date(),
          read: false
        };
        
        setMessages(prev => [...prev, newMessage]);
        messageIndex++;
      } else {
        clearInterval(interval);
      }
    }, 3000); // Nouveau message toutes les 3 secondes

    return () => clearInterval(interval);
  }, [testMode, selectedFriend]);

  // Simuler l'indicateur de frappe en mode test
  useEffect(() => {
    if (!testMode || !selectedFriend || selectedFriend.id !== "test-user-123") return;

    const simulateTyping = () => {
      setTypingStatus(prev => ({ ...prev, "test-user-123": true }));
      
      setTimeout(() => {
        setTypingStatus(prev => ({ ...prev, "test-user-123": false }));
      }, 2000);
    };

    const typingInterval = setInterval(simulateTyping, 8000); // Toutes les 8 secondes
    return () => clearInterval(typingInterval);
  }, [testMode, selectedFriend]);

  // Écouter les messages en temps réel (désactivé temporairement)
  // useEffect(() => {
  //   if (!selectedFriend || !user?.id) return;

  //   const chatId = [user.id, selectedFriend.id].sort().join('_');
  //   const messagesRef = collection(db, 'chats', chatId, 'messages');
  //   const q = query(messagesRef, orderBy('timestamp', 'asc'));

  //   const unsubscribe = onSnapshot(q, (snapshot) => {
  //     const newMessages = [];
  //     snapshot.forEach((doc) => {
  //       newMessages.push({ id: doc.id, ...doc.data() });
  //     });
  //     setMessages(newMessages);
  //   });

  //   return unsubscribe;
  // }, [selectedFriend, user?.id]);

  // Écouter le statut en ligne des amis (désactivé temporairement)
  // useEffect(() => {
  //   if (!friends.length) return;

  //   const unsubscribes = friends.map(friend => {
  //     const userRef = doc(db, 'users', friend.id);
  //     return onSnapshot(userRef, (doc) => {
  //         if (doc.exists()) {
  //           const data = doc.data();
  //           setOnlineStatus(prev => ({
  //             ...prev,
  //             [friend.id]: data.isOnline || false
  //           }));
  //         }
  //       });
  //     });

  //     return () => unsubscribes.forEach(unsub => unsub());
  //   }, [friends]);

  // Écouter le statut de frappe (désactivé temporairement)
  // useEffect(() => {
  //   if (!selectedFriend || !user?.id) return;

  //   const chatId = [user.id, selectedFriend.id].sort().join('_');
  //   const typingRef = doc(db, 'chats', chatId, 'typing', selectedFriend.id);

  //   const unsubscribe = onSnapshot(typingRef, (doc) => {
  //     if (doc.exists()) {
  //       setTypingStatus(prev => ({
  //         ...prev,
  //         [selectedFriend.id]: doc.data().isTyping || false
  //       }));
  //     }
  //   });

  //   return unsubscribe;
  // }, [selectedFriend, user?.id]);

  // Mettre à jour le statut en ligne (désactivé temporairement)
  // useEffect(() => {
  //   if (!user?.id) return;

  //   const userRef = doc(db, 'users', user.id);
  //   const updateOnlineStatus = async () => {
  //     await updateDoc(userRef, {
  //       isOnline: true,
  //       lastSeen: serverTimestamp()
  //     });
  //   };

  //   updateOnlineStatus();

  //   // Mettre à jour le statut hors ligne quand l'app se ferme
  //   const handleAppStateChange = () => {
  //     updateDoc(userRef, {
  //       isOnline: false,
  //       lastSeen: serverTimestamp()
  //     });
  //   };

  //   // Écouter les changements d'état de l'app
  //   return () => {
  //     handleAppStateChange();
  //   };
  // }, [user?.id]);

  // Gérer la frappe (désactivé temporairement)
  const handleTyping = useCallback(async (isTyping) => {
    // Fonctionnalité désactivée temporairement
  }, [selectedFriend, user?.id]);

  // Envoyer un message en temps réel
  const sendMessage = useCallback(async () => {
    if (!input.trim() || !selectedFriend || !user?.id) return;

    // En mode test, ajouter le message localement
    if (testMode && selectedFriend.id === "test-user-123") {
      const newMessage = {
        id: `msg-${Date.now()}`,
        text: input.trim(),
        senderId: user.id,
        senderName: user.displayName || user.email,
        timestamp: new Date(),
        read: false
      };
      
      setMessages(prev => [...prev, newMessage]);
      setInput("");
      handleTyping(false);
      
      Toast.show({
        type: 'success',
        text1: 'Message envoyé',
        text2: 'Message ajouté localement',
        position: 'top',
        topOffset: 40,
        visibilityTime: 2000,
      });
    } else {
      Toast.show({
        type: 'info',
        text1: 'Mode test requis',
        text2: 'Activez le mode test pour envoyer des messages',
        position: 'top',
        topOffset: 40,
        visibilityTime: 2000,
      });
    }
  }, [input, selectedFriend, user, handleTyping, testMode]);

  // Demander les permissions de galerie quand le scan est activé
  useEffect(() => {
    if (scanning) {
      (async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission requise',
            'L\'accès à la galerie est nécessaire pour sélectionner des images de QR code.',
            [{ text: 'OK' }]
          );
          setScanning(false);
          setSelectedImage(null);
        }
      })();
    }
  }, [scanning]);

  // Ouvrir la galerie pour sélectionner une image
  const openGallery = async () => {
    const hasPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (hasPermission.status !== 'granted') {
      Alert.alert(
        'Permission requise',
        'L\'accès à la galerie est nécessaire pour sélectionner des images de QR code.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setScanning(true);
        // Simuler le traitement du QR code (dans une vraie app, on utiliserait une librairie de décodage)
        simulateQRCodeProcessing();
      }
    } catch (error) {
      console.error('Erreur lors de la sélection d\'image:', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible d\'ouvrir la galerie',
        position: 'top',
        topOffset: 40,
        visibilityTime: 3000,
      });
    }
  };

  // Simuler le traitement du QR code (remplacez par une vraie librairie de décodage)
  const simulateQRCodeProcessing = () => {
    // Simulation d'un délai de traitement
    setTimeout(() => {
      // Pour la démonstration, on simule un QR code valide
      const simulatedQRData = `trytowin://addfriend/test-user-${Date.now()}`;
      handleQRCodeData(simulatedQRData);
    }, 2000);
  };

  // Récupérer les informations d'un utilisateur depuis Firestore
  const getUserFromFirestore = async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        return {
          id: userId,
          username: userData.username || "Utilisateur",
          avatar: userData.avatar || "👤",
          photoURL: userData.photoURL || "",
          bio: userData.bio || "",
          country: userData.country || "",
          isOnline: userData.isOnline || false,
        };
      }
      return null;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      return null;
    }
  };

  // Traiter les données du QR code
  const handleQRCodeData = async (data) => {
    setScanning(false);
    setSelectedImage(null);
    
    try {
      // Vérifier si le lien est un lien de profil TryToWin
      if (data.startsWith('trytowin://addfriend/')) {
        const userId = data.split('/').pop();
        
        if (userId === user?.id) {
          Toast.show({
            type: 'error',
            text1: 'Erreur',
            text2: 'Vous ne pouvez pas vous ajouter vous-même !',
            position: 'top',
            topOffset: 40,
            visibilityTime: 3000,
          });
          return;
        }

        // Récupérer les informations de l'utilisateur depuis Firestore
        const scannedUser = await getUserFromFirestore(userId);
        
        if (scannedUser) {
          // Vérifier si l'utilisateur est déjà un ami
          if (friends.find(f => f.id === userId)) {
            Toast.show({
              type: 'info',
              text1: 'Déjà ami',
              text2: `${scannedUser.username} est déjà dans votre liste d'amis`,
              position: 'top',
              topOffset: 40,
              visibilityTime: 3000,
            });
            return;
          }

          // Ajouter l'utilisateur comme ami
          addFriend(scannedUser);
          
          Toast.show({
            type: 'success',
            text1: 'Ami ajouté !',
            text2: `${scannedUser.username} a été ajouté à vos amis`,
            position: 'top',
            topOffset: 40,
            visibilityTime: 3000,
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Utilisateur non trouvé',
            text2: 'Ce QR code ne correspond à aucun utilisateur valide',
            position: 'top',
            topOffset: 40,
            visibilityTime: 3000,
          });
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'QR code invalide',
          text2: 'Ce QR code n\'est pas un lien de profil TryToWin valide',
          position: 'top',
          topOffset: 40,
          visibilityTime: 3000,
        });
      }
    } catch (error) {
      console.error('Erreur lors du traitement:', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible de traiter ce QR code',
        position: 'top',
        topOffset: 40,
        visibilityTime: 3000,
      });
    }
  };

  // Lien unique de profil avec le vrai ID de l'utilisateur connecté
  const myProfileLink = user?.id ? `trytowin://addfriend/${user.id}` : `trytowin://addfriend/1234`;

  // Ajouter un ami avec vérification
  const addFriend = useCallback(
    (user) => {
      if (user && user.id && !friends.find((f) => f.id === user.id)) {
        setFriends((prev) => [...prev, user]);
      }
    },
    [friends]
  );

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
  // const filteredUsers = allUsers.filter(
  //   (u) =>
  //     u &&
  //     u.id &&
  //     u.username &&
  //     !friends.find((f) => f.id === u.id) &&
  //     u.username.toLowerCase().includes(search.toLowerCase())
  // );

  // Rendu optimisé des messages
  const renderMessage = useCallback(
    ({ item }) => {
      // Formater l'heure du message
      let messageTime = 'Maintenant';
      if (item.timestamp) {
        if (item.timestamp.toDate) {
          // Timestamp Firestore
          messageTime = item.timestamp.toDate().toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
        } else if (item.timestamp instanceof Date) {
          // Date JavaScript
          messageTime = item.timestamp.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
        } else if (typeof item.timestamp === 'string') {
          // String timestamp
          const date = new Date(item.timestamp);
          messageTime = date.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
        }
      }

      return (
        <View
          style={[
            styles.messageBubble,
            item.senderId === user?.id ? styles.myMessage : styles.theirMessage,
          ]}>
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.messageTime}>{messageTime}</Text>
        </View>
      );
    },
    [user?.id]
  );

  // Rendu optimisé des amis avec statut en ligne
  const renderFriend = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.friendItem}
        onPress={() => setSelectedFriend(item)}
        onLongPress={() => setLongPressedFriendId(item.id)}
        activeOpacity={0.7}>
        <View style={styles.avatarContainer}>
          <Ionicons name='person-circle' size={28} color='#667eea' />
          <View style={[
            styles.onlineIndicator,
            { backgroundColor: onlineStatus[item.id] ? '#4cd137' : '#ff6b6b' }
          ]} />
        </View>
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.username}</Text>
          <Text style={styles.onlineStatus}>
            {onlineStatus[item.id] ? 'En ligne' : 'Hors ligne'}
          </Text>
        </View>
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
    [longPressedFriendId, removeFriend, onlineStatus]
  );

  // Rendu optimisé des utilisateurs
  // const renderUser = useCallback(
  //   ({ item }) => (
  //     <View style={styles.userItem}>
  //       <Ionicons name='person-add' size={24} color='#FFD700' />
  //       <Text style={styles.userName}>{item.username}</Text>
  //       <TouchableOpacity onPress={() => addFriend(item)}>
  //         <Ionicons name='add-circle' size={24} color='#4ECDC4' />
  //       </TouchableOpacity>
  //     </View>
  //   ),
  //   [addFriend]
  // );

  // Affichage du chat avec un ami
  const renderChat = () => (
    <View style={styles.chatContainer}>
      <View style={styles.chatHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setSelectedFriend(null)}>
          <Ionicons name='arrow-back' size={20} color='#667eea' />
        </TouchableOpacity>
        <View style={styles.chatHeaderInfo}>
          <Text style={styles.chatTitle}>{selectedFriend?.username}</Text>
          <View style={styles.chatStatus}>
            <View style={[
              styles.onlineIndicator,
              { backgroundColor: onlineStatus[selectedFriend?.id] ? '#4cd137' : '#ff6b6b' }
            ]} />
            <Text style={styles.chatStatusText}>
              {onlineStatus[selectedFriend?.id] ? 'En ligne' : 'Hors ligne'}
            </Text>
          </View>
        </View>
      </View>
      
      {typingStatus[selectedFriend?.id] && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>{selectedFriend?.username} est en train d'écrire...</Text>
        </View>
      )}

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        style={{ flex: 1 }}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        inverted={false}
      />
      
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={(text) => {
            setInput(text);
            if (text.length > 0 && !isTyping) {
              setIsTyping(true);
              handleTyping(true);
            } else if (text.length === 0 && isTyping) {
              setIsTyping(false);
              handleTyping(false);
            }
          }}
          placeholder='Votre message...'
          multiline={false}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Ionicons name='send' size={24} color='#667eea' />
        </TouchableOpacity>
      </View>
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
        </View>
        <TouchableOpacity
          style={[styles.copyButton, { marginTop: 16, alignSelf: 'center' }]}
          onPress={openGallery}>
          <Ionicons name='qr-code' size={18} color='#667eea' />
          <Text style={styles.copyButtonText}>Scanner un QR code</Text>
        </TouchableOpacity>
        
        {/* Bouton Mode Test pour appareil unique */}
        <TouchableOpacity
          style={[styles.testButton, { marginTop: 12, alignSelf: 'center' }]}
          onPress={enableTestMode}>
          <Ionicons name='flask' size={18} color='#fff' />
          <Text style={styles.testButtonText}>Test QR code</Text>
        </TouchableOpacity>
      </View>

      {/* Scanner QR Code - Interface de traitement */}
      {scanning && (
        <View style={styles.scannerOverlay}>
          <View style={styles.scannerContent}>
            <Text style={styles.scannerTitle}>Traitement du QR code</Text>
            {selectedImage && (
              <Image 
                source={{ uri: selectedImage }} 
                style={styles.selectedImage}
                resizeMode="contain"
              />
            )}
            <Text style={styles.scannerMessage}>
              Analyse de l'image en cours...
            </Text>
            <View style={styles.loadingIndicator}>
              <Ionicons name="sync" size={24} color="#667eea" />
              <Text style={styles.loadingText}>Traitement...</Text>
            </View>
            <TouchableOpacity 
              onPress={() => {
                setScanning(false);
                setSelectedImage(null);
              }} 
              style={styles.scannerButton}>
              <Text style={styles.scannerButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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
          {/* <Text style={styles.sectionTitle}>Ajouter des personnes</Text>
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
          /> */}
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
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  backButton: {
    padding: 5,
  },
  chatHeaderInfo: {
    flex: 1,
    marginLeft: 10,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#667eea",
  },
  chatStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  chatStatusText: {
    fontSize: 13,
    color: "#6c757d",
    marginLeft: 5,
  },
  typingIndicator: {
    alignSelf: "center",
    backgroundColor: "#e0e0e0",
    padding: 8,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  typingText: {
    fontSize: 14,
    color: "#333",
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
  messageTime: {
    fontSize: 11,
    color: "#666",
    marginTop: 4,
    alignSelf: "flex-end",
    fontStyle: "italic",
  },
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
  sendButton: {
    padding: 5,
  },
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
  avatarContainer: {
    position: "relative",
    marginRight: 10,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  friendInfo: {
    flex: 1,
  },
  onlineStatus: {
    fontSize: 12,
    color: "#999",
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50', // Vert foncé
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
    elevation: 3,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 1000,
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  scanner: {
    flex: 1,
  },
  scannerOverlayContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  scannerCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#667eea',
    borderWidth: 3,
  },
  scannerCornerTopRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  scannerCornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  scannerCornerBottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scannerInstruction: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
  },
  scannerCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 10,
  },
  scannerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  scannerTitle: {
    color: '#667eea',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scannerMessage: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  scannerButton: {
    backgroundColor: '#667eea',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  scannerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#667eea',
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#667eea',
  },
  scannerNote: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
});
