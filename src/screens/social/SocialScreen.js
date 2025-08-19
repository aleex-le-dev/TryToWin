// SocialScreen.js - Écran social pour ajouter des amis et chatter
// Utilisé dans la barre de navigation principale (onglet Social)
import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import Toast from "react-native-toast-message";
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from "../../hooks/useAuth";
import { doc, getDoc, getDocs, collection, setDoc, deleteDoc, onSnapshot, updateDoc, serverTimestamp, query, orderBy, where, addDoc } from "firebase/firestore";
import { db } from "../../utils/firebaseConfig";
import { subscribeFriends, subscribeBlocked, addFriend as addFriendSvc, removeFriend as removeFriendSvc } from "../../services/friendsService";
import { useFocusEffect } from "@react-navigation/native";
import { getUserAllGameStats } from "../../services/scoreService";
import { gamesData } from "../../constants/gamesData";
import { countries } from "../../constants/countries";
import { useAccessibility } from "../../contexts/AccessibilityContext";
import { useTheme } from "../../contexts/ThemeContext";
import ThemedLayout from "../../components/ThemedLayout";

// Données fictives pour la démonstration (utilisateurs non connectés)
// const allUsers = [
//   { id: "1", username: "MariePro" },
//   { id: "2", username: "PierreMaster" },
//   { id: "3", username: "SophieWin" },
//   { id: "4", username: "LucasChamp" },
// ];

export default function SocialScreen({ route, navigation }) {
  const { user } = useAuth();
  const { highContrast, largeTouchTargets, largerSpacing } = useAccessibility();
  const { theme } = useTheme();
  // Liste d'amis simulée
  const [friends, setFriends] = useState([]);
  const [friendsRaw, setFriendsRaw] = useState([]);
  const [blockedIds, setBlockedIds] = useState([]);
  // Charger les amis depuis Firestore (collection users/{uid}/friends)
  useEffect(() => {
    if (!user?.id) return;
    const unsub = subscribeFriends(user.id, (items) => setFriendsRaw(items));
    return () => unsub();
  }, [user?.id]);

  // Charger la liste des bloqués
  useEffect(() => {
    if (!user?.id) return;
    const unsub = subscribeBlocked(user.id, (ids) => setBlockedIds(ids));
    return () => unsub();
  }, [user?.id]);

  // Recalcule la liste d'amis visible en excluant les bloqués
  useEffect(() => {
    if (!friendsRaw) return;
    setFriends(friendsRaw.filter((f) => !blockedIds.includes(f.id)));
  }, [friendsRaw, blockedIds]);
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
  const [friendProfile, setFriendProfile] = useState(null);
  const [friendStats, setFriendStats] = useState(null);
  const [friendLoading, setFriendLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [userLoading, setUserLoading] = useState(false);

  // Charger la carte joueur de l’ami sélectionné
  useEffect(() => {
    const loadFriend = async () => {
      if (!selectedFriend?.id) {
        setFriendProfile(null);
        setFriendStats(null);
        return;
      }
      setFriendLoading(true);
      try {
        const userSnap = await getDoc(doc(db, 'users', selectedFriend.id));
        if (userSnap.exists()) {
          const prof = userSnap.data();
          setFriendProfile(prof);
        } else {
          setFriendProfile({ username: selectedFriend.username });
        }
        const allStats = await getUserAllGameStats(selectedFriend.id);
        let bestGameId = null;
        let bestPts = 0;
        if (allStats?.gamesPlayed) {
          for (const [gid, s] of Object.entries(allStats.gamesPlayed)) {
            const pts = s?.totalPoints || 0;
            if (pts > bestPts) { bestPts = pts; bestGameId = gid; }
          }
        }
        const winRate = allStats?.totalGames > 0 ? Math.round((allStats.totalWins / allStats.totalGames) * 100) : 0;
        setFriendStats({
          totalPoints: allStats?.totalPoints || 0,
          winRate,
          bestGameId,
        });
      } catch {
      } finally {
        setFriendLoading(false);
      }
    };
    loadFriend();
  }, [selectedFriend?.id]);

  // Réinitialiser l’écran (fermer la conversation) à chaque focus sur l’onglet Social
  useFocusEffect(
    React.useCallback(() => {
      setSelectedFriend(null);
      setLongPressedFriendId(null);
      setSelectedUser(null);
      setSearchResults([]);
    }, [])
  );

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
  useEffect(() => {
    if (!selectedFriend || !user?.id) return;

    const chatId = [user.id, selectedFriend.id].sort().join('_');
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const qMsg = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(qMsg, (snapshot) => {
      const newMessages = [];
      snapshot.forEach((d) => {
        newMessages.push({ id: d.id, ...d.data() });
      });
      setMessages(newMessages);
    }, (err) => {
      Toast.show({ type: 'error', text1: 'Erreur messages', text2: 'Permissions insuffisantes', position: 'top', topOffset: 40 });
    });

    return unsubscribe;
  }, [selectedFriend, user?.id]);

  // Gérer la frappe (désactivé temporairement)
  const handleTyping = useCallback(async (isTyping) => {
    // Fonctionnalité désactivée temporairement
  }, [selectedFriend, user?.id]);

  // Envoyer un message en temps réel
  const sendMessage = useCallback(async () => {
    if (!input.trim() || !selectedFriend || !user?.id) return;

    try {
      const chatId = [user.id, selectedFriend.id].sort().join('_');
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        text: input.trim(),
        senderId: user.id,
        senderName: user.displayName || user.email,
        timestamp: serverTimestamp(),
        read: false,
      });
      setInput("");
      if (isTyping) {
        setIsTyping(false);
        handleTyping(false);
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Envoi échoué', position: 'top', topOffset: 40 });
    }
  }, [input, selectedFriend, user, handleTyping, isTyping]);

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

  // Rechercher des utilisateurs en base de données
  const searchUsers = useCallback(async (searchTerm) => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    try {
      const usersRef = collection(db, 'users');
      // Récupérer tous les utilisateurs et filtrer côté client
      const snapshot = await getDocs(usersRef);
      console.log(`[searchUsers] Total utilisateurs en BDD : ${snapshot.size}`);
      
      const users = [];
      
      snapshot.forEach((doc) => {
        const userData = doc.data();
        const username = userData.username || '';
        
        console.log(`[searchUsers] Utilisateur ${doc.id}: username="${username}", searchTerm="${searchTerm}"`);
        
        // Filtrer par nom d'utilisateur (insensible à la casse)
        if (username.toLowerCase().includes(searchTerm.toLowerCase())) {
          console.log(`[searchUsers] Match trouvé pour ${username}`);
          // Exclure seulement l'utilisateur connecté, permettre de voir les amis
          if (doc.id !== user?.id) {
            users.push({
              id: doc.id,
              username: userData.username || 'Utilisateur',
              avatar: userData.avatar || '👤',
              photoURL: userData.photoURL || '',
              bio: userData.bio || '',
              country: userData.country || '',
              isOnline: userData.isOnline || false,
              isFriend: friends.find(f => f.id === doc.id) ? true : false, // Indiquer si c'est un ami
            });
          } else {
            console.log(`[searchUsers] ${username} exclu (utilisateur connecté)`);
          }
        } else {
          console.log(`[searchUsers] Pas de match pour ${username}`);
        }
      });
      
      console.log(`[searchUsers] Recherche "${searchTerm}" : ${users.length} utilisateurs trouvés`);
      setSearchResults(users);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur de recherche',
        text2: 'Impossible de rechercher les utilisateurs',
        position: 'top',
        topOffset: 40,
      });
    } finally {
      setSearchLoading(false);
    }
  }, [user?.id, friends]);

  // Charger le profil d'un utilisateur sélectionné
  const loadUserProfile = useCallback(async (userId) => {
    if (!userId) {
      setUserProfile(null);
      setUserStats(null);
      return;
    }
    
    setUserLoading(true);
    try {
      const userSnap = await getDoc(doc(db, 'users', userId));
      if (userSnap.exists()) {
        const prof = userSnap.data();
        setUserProfile(prof);
      } else {
        setUserProfile({ username: 'Utilisateur' });
      }
      
      const allStats = await getUserAllGameStats(userId);
      let bestGameId = null;
      let bestPts = 0;
      if (allStats?.gamesPlayed) {
        for (const [gid, s] of Object.entries(allStats.gamesPlayed)) {
          const pts = s?.totalPoints || 0;
          if (pts > bestPts) { bestPts = pts; bestGameId = gid; }
        }
      }
      const winRate = allStats?.totalGames > 0 ? Math.round((allStats.totalWins / allStats.totalGames) * 100) : 0;
      setUserStats({
        totalPoints: allStats?.totalPoints || 0,
        winRate,
        bestGameId,
      });
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    } finally {
      setUserLoading(false);
    }
  }, []);

  // Sélectionner un utilisateur pour voir son profil
  const handleUserSelect = useCallback((userData) => {
    setSelectedUser(userData);
    loadUserProfile(userData.id);
  }, [loadUserProfile]);

  // Ajouter un ami avec vérification
  const addFriend = useCallback(
    async (friendUser) => {
      if (!user?.id || !friendUser?.id) return;
      try {
        const res = await addFriendSvc(user.id, friendUser);
        if (res.ok) {
          Toast.show({ type: 'success', text1: res.already ? 'Déjà ami' : 'Ami ajouté', position: 'top', topOffset: 40 });
        } else if (res.reason === 'blocked') {
          Toast.show({ type: 'error', text1: 'Joueur bloqué', text2: 'Débloquez avant d\'ajouter', position: 'top', topOffset: 40 });
        } else {
          Toast.show({ type: 'error', text1: 'Erreur', text2: "Impossible d'ajouter l'ami", position: 'top', topOffset: 40 });
        }
      } catch (e) {
        Toast.show({ type: 'error', text1: 'Erreur', text2: "Impossible d'ajouter l'ami", position: 'top', topOffset: 40 });
      }
    },
    [user?.id, friends]
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
          onPress: async () => {
            try { if (user?.id) await removeFriendSvc(user.id, id); } catch {}
            setFriends((prev) => prev.filter((f) => f.id !== id));
            setLongPressedFriendId(null);
          },
        },
      ]
    );
  }, [user?.id]);

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

      const isMine = item.senderId === user?.id;

      return (
        <View
          style={[
            styles.messageBubble,
            isMine ? styles.myMessage : styles.theirMessage,
            { backgroundColor: isMine ? theme.surface : theme.card, borderColor: theme.border }
          ]}>
          <Text style={[styles.messageText, { color: theme.text }]}>{item.text}</Text>
          <Text style={[styles.messageTime, { color: theme.textSecondary }]}>{messageTime}</Text>
        </View>
      );
    },
    [user?.id, theme]
  );

  // Rendu optimisé des amis avec statut en ligne
  const renderFriend = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={[styles.friendItem, { backgroundColor: theme.card }]}
        onPress={() => setSelectedFriend(item)}
        onLongPress={() => setLongPressedFriendId(item.id)}
        activeOpacity={0.7}>
        <View style={styles.avatarContainer}>
          <Ionicons name='person-circle' size={28} color={theme.primary} />
          <View style={[
            styles.onlineIndicator,
            { backgroundColor: onlineStatus[item.id] ? '#4cd137' : '#ff6b6b' }
          ]} />
        </View>
        <View style={styles.friendInfo}>
          <Text style={[styles.friendName, { color: theme.text }]}>{item.username}</Text>
          <Text style={[styles.onlineStatus, { color: theme.textSecondary }]}>
            {onlineStatus[item.id] ? 'En ligne' : 'Hors ligne'}
          </Text>
        </View>
        <Ionicons name='chatbubble-ellipses' size={20} color={theme.accent} />
        {longPressedFriendId === item.id && (
          <TouchableOpacity
            onPress={() => removeFriend(item.id)}
            style={[styles.deleteIcon, { backgroundColor: theme.card }]}>
            <Ionicons name='trash' size={22} color='#FF6B6B' />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    ),
    [longPressedFriendId, removeFriend, onlineStatus, theme]
  );

  // Rendu des résultats de recherche
  const renderSearchResult = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={[styles.userItem, { backgroundColor: theme.card }]}
        onPress={() => handleUserSelect(item)}
        activeOpacity={0.7}>
        <View style={styles.avatarContainer}>
          {item.photoURL ? (
            <Image source={{ uri: item.photoURL }} style={styles.userAvatar} />
          ) : (
            <Text style={[styles.userAvatarText, { color: theme.primary }]}>{item.avatar}</Text>
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: theme.text }]}>{item.username}</Text>
          {item.bio && (
            <Text style={[styles.userBio, { color: theme.textSecondary }]} numberOfLines={1}>
              {item.bio}
            </Text>
          )}
          {item.isFriend && (
            <Text style={[styles.userFriendStatus, { color: theme.primary }]}>
              ✓ Déjà ami
            </Text>
          )}
        </View>
        {!item.isFriend ? (
          <TouchableOpacity
            onPress={() => addFriend(item)}
            style={[styles.addFriendButton, { backgroundColor: theme.primary }]}>
            <Ionicons name='add' size={20} color='#fff' />
          </TouchableOpacity>
        ) : (
          <View style={[styles.friendIndicator, { backgroundColor: theme.primary }]}>
            <Ionicons name='checkmark' size={20} color='#fff' />
          </View>
        )}
      </TouchableOpacity>
    ),
    [handleUserSelect, addFriend, theme]
  );

  const consumedInitialParam = useRef(false);
  useEffect(() => {
    const initialFriendId = route?.params?.initialFriendId;
    if (!consumedInitialParam.current && initialFriendId && friends.length > 0) {
      const target = friends.find((f) => f.id === initialFriendId);
      if (target) {
        setSelectedFriend(target);
        consumedInitialParam.current = true;
        // Nettoyer le paramètre pour ne pas rouvrir automatiquement la prochaine fois
        try { navigation.setParams({ initialFriendId: undefined }); } catch {}
      }
    }
  }, [route?.params?.initialFriendId, friends, navigation]);

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
      <View style={[styles.chatHeader, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.backButton, largeTouchTargets && { padding: 10 }]}
          onPress={() => setSelectedFriend(null)}>
          <Ionicons name='arrow-back' size={22} color={theme.primary} />
        </TouchableOpacity>
        <View style={styles.chatHeaderInfo}>
          <Text style={[styles.chatTitle, { color: theme.text }]}>{selectedFriend?.username}</Text>
          <View style={styles.chatStatus}>
            <View style={[
              styles.onlineIndicator,
              { backgroundColor: onlineStatus[selectedFriend?.id] ? '#4cd137' : '#ff6b6b' }
            ]} />
            <Text style={[styles.chatStatusText, { color: theme.textSecondary }]}>
              {onlineStatus[selectedFriend?.id] ? 'En ligne' : 'Hors ligne'}
            </Text>
          </View>
        </View>
      </View>
      
      {typingStatus[selectedFriend?.id] && (
        <View style={[styles.typingIndicator, { backgroundColor: theme.surface }]}>
          <Text style={[styles.typingText, { color: theme.text }]}>{selectedFriend?.username} est en train d'écrire...</Text>
        </View>
      )}

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        style={{ flex: 1 }}
        ListHeaderComponent={selectedFriend ? (
          <View style={[styles.friendCard, { backgroundColor: theme.card }]}>
            {friendProfile?.bannerImage ? (
              <Image source={{ uri: friendProfile.bannerImage }} style={styles.friendCardBanner} resizeMode='cover' />
            ) : (
              <View style={[styles.friendCardBanner, { backgroundColor: friendProfile?.bannerColor || theme.surface }]} />
            )}
            <View style={styles.friendCardAvatarWrap}>
              {friendProfile?.photoURL ? (
                <Image source={{ uri: friendProfile.photoURL }} style={styles.friendCardAvatar} />
              ) : (
                <View style={[styles.friendCardAvatar, { backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}>
                    {(friendProfile?.username || selectedFriend?.username || 'U').slice(0,1).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.friendCardName, { color: theme.text }]}>{friendProfile?.username || selectedFriend?.username || 'Utilisateur'}</Text>
            <View style={styles.friendCardCountryRow}>
              <Text style={styles.friendCardCountryFlag}>
                {countries.find((c) => c.code === friendProfile?.country)?.flag || '🌍'}
              </Text>
              <Text style={[styles.friendCardCountryName, { color: theme.textSecondary }]}>
                {countries.find((c) => c.code === friendProfile?.country)?.name || ''}
              </Text>
            </View>
            <View style={styles.friendCardStatsRow}>
              <View style={styles.friendCardStat}>
                <Ionicons name='trophy' size={18} color='#FFD700' />
                <Text style={[styles.friendCardStatValue, { color: theme.text }]}>{friendStats?.totalPoints ?? 0}</Text>
                <Text style={[styles.friendCardStatLabel, { color: theme.textSecondary }]}>Points</Text>
              </View>
              <View style={styles.friendCardStat}>
                {(() => {
                  const gd = gamesData.find(g => g.id === friendStats?.bestGameId);
                  if (!gd) return <Ionicons name='extension-puzzle' size={18} color={theme.primary} />;
                  const img = gd.image;
                  if (typeof img === 'string') {
                    return <Text style={{ fontSize: 18 }}>{img}</Text>;
                  }
                  return <Image source={img} style={{ width: 22, height: 22 }} resizeMode='contain' />;
                })()}
                <Text style={[styles.friendCardStatValue, { color: theme.text }]}>{friendStats?.bestGameId || '-'}</Text>
                <Text style={[styles.friendCardStatLabel, { color: theme.textSecondary }]}>Meilleur jeu</Text>
              </View>
              <View style={styles.friendCardStat}>
                <Ionicons name='trending-up' size={18} color='#96CEB4' />
                <Text style={[styles.friendCardStatValue, { color: theme.text }]}>{friendStats?.winRate ?? 0}%</Text>
                <Text style={[styles.friendCardStatLabel, { color: theme.textSecondary }]}>Victoires</Text>
              </View>
            </View>
            {!!friendProfile?.bio && (
              <Text style={[styles.friendCardBio, { color: theme.primary }]}>« {friendProfile.bio} »</Text>
            )}
          </View>
        ) : null}
        ListHeaderComponentStyle={{ zIndex: 1, elevation: 2 }}
        ListEmptyComponent={selectedFriend ? (
          <View style={{ paddingVertical: 24, alignItems: 'center' }}>
            <Ionicons name='chatbubbles-outline' size={22} color={theme.textSecondary} />
            <Text style={{ color: theme.textSecondary, marginTop: 6 }}>Commencez la conversation</Text>
          </View>
        ) : null}
        contentContainerStyle={{ paddingBottom: largerSpacing ? 120 : 80 }}
        keyboardShouldPersistTaps='handled'
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        inverted={false}
      />
      
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, 
            { backgroundColor: theme.card, color: theme.text, borderColor: theme.border },
            largeTouchTargets && { paddingVertical: 12, fontSize: 16 }
          ]}
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
          placeholderTextColor={theme.placeholder}
          multiline={false}
        />
        <TouchableOpacity onPress={sendMessage} style={[styles.sendButton, largeTouchTargets && { padding: 10 }]} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name='send' size={26} color={theme.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Affichage principal : recherche, liste d'amis et d'utilisateurs
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Section Partager mon profil (affichée uniquement hors conversation) */}
      {!selectedFriend && (
        <View style={[styles.shareProfileSection, { backgroundColor: theme.card }, largerSpacing && { padding: 24, marginBottom: 24 }]}>
          <Text style={[styles.shareTitle, { color: theme.primary }]}>Partager mon profil</Text>
          <View style={styles.qrAndLinkRow}>
            <QRCode value={myProfileLink} size={90} />
          </View>
          <TouchableOpacity
            style={[styles.copyButton, { marginTop: 16, alignSelf: 'center', backgroundColor: theme.surface }]}
            onPress={openGallery}>
            <Ionicons name='qr-code' size={20} color={theme.primary} />
            <Text style={[styles.copyButtonText, { color: theme.primary }]}>Scanner un QR code</Text>
          </TouchableOpacity>
          {/* Bouton Mode Test pour appareil unique */}
          <TouchableOpacity
            style={styles.testButton}
            onPress={enableTestMode}>
            <Ionicons name='flask' size={18} color='#fff' />
            <Text style={styles.testButtonText}>Test QR code</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Scanner QR Code - Interface de traitement */}
      {scanning && (
        <View style={styles.scannerOverlay}>
          <View style={styles.scannerContent}>
            <Text style={[styles.scannerTitle, { color: theme.primary }]}>Traitement du QR code</Text>
            {selectedImage && (
              <Image 
                source={{ uri: selectedImage }} 
                style={[styles.selectedImage, { borderColor: theme.primary }]}
                resizeMode="contain"
              />
            )}
            <Text style={[styles.scannerMessage, { color: theme.textSecondary }]}>
              Analyse de l'image en cours...
            </Text>
            <View style={styles.loadingIndicator}>
              <Ionicons name="sync" size={24} color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.primary }]}>Traitement...</Text>
            </View>
            <TouchableOpacity 
              onPress={() => {
                setScanning(false);
                setSelectedImage(null);
              }} 
              style={[styles.scannerButton, { backgroundColor: theme.primary }]}>
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
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Rechercher une personne</Text>
          <View style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons
              name='search'
              size={20}
              color={theme.primary}
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Nom d'utilisateur..."
              placeholderTextColor={theme.placeholder}
              value={search}
              onChangeText={(text) => {
                setSearch(text);
                // Ne lancer la recherche qu'après 2 caractères
                if (text.length >= 2) {
                  searchUsers(text);
                } else if (text.length < 2) {
                  setSearchResults([]);
                  setSearchLoading(false);
                }
              }}
              multiline={false}
            />
          </View>

          {/* Résultats de recherche */}
          {searchLoading && search.length >= 2 && (
            <View style={styles.searchLoadingContainer}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={[styles.searchLoadingText, { color: theme.textSecondary }]}>Recherche en cours...</Text>
            </View>
          )}

          {searchResults.length > 0 && (
            <View style={styles.searchResultsContainer}>
              {searchResults.map((item) => (
                <View key={item.id} style={[
                  styles.userItemContainer,
                  selectedUser && selectedUser.id === item.id && {
                    ...styles.userItemContainerExpanded,
                    backgroundColor: theme.card,
                    borderWidth: 1,
                    borderColor: theme.border,
                    position: 'relative',
                    zIndex: selectedUser && selectedUser.id === item.id ? 10 : 1,
                  }
                ]}>
                  {/* Ligne du joueur qui s'agrandit vers le haut */}
                  <View style={[
                    styles.userItemExpanded,
                    selectedUser && selectedUser.id === item.id && {
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      minHeight: 300,
                      backgroundColor: theme.card,
                      borderWidth: 1,
                      borderColor: theme.border,
                      borderRadius: 12,
                      zIndex: selectedUser && selectedUser.id === item.id ? 10 : 1,
                      elevation: selectedUser && selectedUser.id === item.id ? 5 : 1,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: -2 },
                      shadowOpacity: selectedUser && selectedUser.id === item.id ? 0.1 : 0,
                      shadowRadius: 4,
                    }
                  ]}>
                    {/* Ligne du joueur - reste en bas */}
                    <TouchableOpacity
                      style={[
                        styles.userItem, 
                        { 
                          backgroundColor: theme.card,
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                        }
                      ]}
                      onPress={() => selectedUser && selectedUser.id === item.id ? setSelectedUser(null) : handleUserSelect(item)}
                      activeOpacity={0.7}>
                      <View style={styles.avatarContainer}>
                        {item.photoURL ? (
                          <Image source={{ uri: item.photoURL }} style={styles.userAvatar} />
                        ) : (
                          <Text style={[styles.userAvatarText, { color: theme.primary }]}>{item.avatar}</Text>
                        )}
                      </View>
                      <View style={styles.userInfo}>
                        <Text style={[styles.userName, { color: theme.text }]}>{item.username}</Text>
                        {item.bio && (
                          <Text style={[styles.userBio, { color: theme.textSecondary }]} numberOfLines={1}>
                            {item.bio}
                          </Text>
                        )}
                        {item.isFriend && (
                          <Text style={[styles.userFriendStatus, { color: theme.primary }]}>
                            ✓ Déjà ami
                          </Text>
                        )}
                      </View>
                      {!item.isFriend ? (
                        <TouchableOpacity
                          onPress={() => addFriend(item)}
                          style={[styles.addFriendButton, { backgroundColor: theme.primary }]}>
                          <Ionicons name='add' size={20} color='#fff' />
                        </TouchableOpacity>
                      ) : (
                        <View style={[styles.friendIndicator, { backgroundColor: theme.primary }]}>
                          <Ionicons name='checkmark' size={20} color='#fff' />
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Message quand la recherche est vide mais qu'il y a du texte */}
          {search.length >= 2 && !searchLoading && searchResults.length === 0 && (
            <View style={styles.searchEmptyContainer}>
              <Text style={[styles.searchEmptyText, { color: theme.textSecondary }]}>
                Aucun utilisateur trouvé pour "{search}"
              </Text>
            </View>
          )}

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Amis</Text>
          <FlatList
            data={friends}
            keyExtractor={(item) => item.id}
            renderItem={renderFriend}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Aucun ami pour l'instant.</Text>
            }
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    marginHorizontal: 16,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    marginHorizontal: 16,
    elevation: 2,
  },
  friendName: { flex: 1, fontSize: 16, marginLeft: 10 },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  userName: { flex: 1, fontSize: 16, marginLeft: 10 },
  emptyText: {
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 10,
    marginHorizontal: 16,
  },
  chatContainer: { flex: 1 },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
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
  },
  chatStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  chatStatusText: {
    fontSize: 13,
    marginLeft: 5,
  },
  typingIndicator: {
    alignSelf: "center",
    padding: 8,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  typingText: {
    fontSize: 14,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 4,
    maxWidth: "80%",
    borderWidth: 1,
  },
  myMessage: { alignSelf: "flex-end" },
  theirMessage: { alignSelf: "flex-start" },
  messageText: { fontSize: 15 },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: "flex-end",
    fontStyle: "italic",
  },
  inputRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    marginRight: 10,
  },
  sendButton: {
    padding: 6,
  },
  backText: { marginLeft: 5, fontSize: 15 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
    marginHorizontal: 16,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 15 },
  deleteIcon: {
    marginLeft: 10,
    padding: 4,
    borderRadius: 12,
    elevation: 2,
  },
  shareProfileSection: {
    marginHorizontal: 16,
    marginTop: 40,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    alignItems: "center",
    flexDirection: "column",
  },
  shareTitle: {
    fontSize: 17,
    fontWeight: "bold",
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
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  copyButtonText: {
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
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
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
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 16,
  },
  scannerNote: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  friendCard: {
    borderRadius: 16,
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  friendCardBanner: { width: '100%', height: 80 },
  friendCardAvatarWrap: { alignItems: 'center', marginTop: -24 },
  friendCardAvatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: '#fff' },
  friendCardName: { textAlign: 'center', fontWeight: 'bold', fontSize: 16, marginTop: 6 },
  friendCardCountryRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  friendCardCountryFlag: { fontSize: 18 },
  friendCardCountryName: { textAlign: 'center', fontSize: 12 },
  friendCardStatsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10 },
  friendCardStat: { alignItems: 'center' },
  friendCardStatValue: { fontWeight: 'bold', marginTop: 2 },
  friendCardStatLabel: { fontSize: 11 },
  friendCardBio: { textAlign: 'center', fontStyle: 'italic', paddingBottom: 10 },
  
  // Styles pour la recherche et la carte utilisateur
  searchLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    marginHorizontal: 16,
  },
  searchLoadingText: {
    marginLeft: 10,
    fontSize: 14,
  },
  searchEmptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  searchEmptyText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  userItemContainer: {
    marginBottom: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'visible',
    elevation: 1,
    position: 'relative',
    zIndex: 1,
  },
  userItemContainerExpanded: {
    marginBottom: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'visible',
    elevation: 1,
    position: 'relative',
    zIndex: 10,
  },
  userItemExpanded: {
    flexDirection: 'column',
    transition: 'min-height 0.3s ease',
    position: 'relative',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userAvatarText: {
    fontSize: 24,
    width: 40,
    height: 40,
    textAlign: 'center',
    lineHeight: 40,
  },
  userInfo: {
    flex: 1,
    marginLeft: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userBio: {
    fontSize: 12,
    marginTop: 2,
  },
  userFriendStatus: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  addFriendButton: {
    padding: 8,
    borderRadius: 20,
  },
  friendIndicator: {
    padding: 8,
    borderRadius: 20,
  },
  userCardAbsolute: {
    position: 'absolute',
    top: -20, // Position au-dessus de la ligne
    left: 0,
    right: 0,
    zIndex: 1,
    elevation: 3,
    borderRadius: 16,
    marginHorizontal: 12,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userCardIntegrated: {
    padding: 20,
    borderBottomWidth: 1,
    marginBottom: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backToSearchButton: {
    padding: 8,
    marginRight: 12,
  },
  userCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  userCardLoading: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  userCardLoadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  userCardAvatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userCardAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  userCardAvatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  userCardAvatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  userCardUsername: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  userCardCountryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userCardCountryFlag: {
    fontSize: 18,
  },
  userCardCountryName: {
    fontSize: 14,
  },
  userCardBio: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  userCardStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  userCardStat: {
    alignItems: 'center',
  },
  userCardStatValue: {
    fontWeight: 'bold',
    marginTop: 4,
    fontSize: 16,
  },
  userCardStatLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  addFriendFromCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'center',
  },
  addFriendFromCardText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  friendFromCardIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'center',
  },
  friendFromCardText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  userCardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userCardOverlayContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  searchResultsContainer: {
    marginTop: 80,
    marginHorizontal: 16,
  },
  searchResultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
});
