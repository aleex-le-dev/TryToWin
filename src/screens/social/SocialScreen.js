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
  ActivityIndicator,
  Dimensions,
  AppState,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import Toast from "react-native-toast-message";
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from "../../hooks/useAuth";
import { doc, getDoc, getDocs, collection, setDoc, deleteDoc, onSnapshot, updateDoc, serverTimestamp, query, orderBy, where, addDoc, writeBatch } from "firebase/firestore";
import { db } from "../../utils/firebaseConfig";
import { subscribeFriends, subscribeBlocked, addFriend as addFriendSvc, removeFriend as removeFriendSvc } from "../../services/friendsService";
import { useFocusEffect } from "@react-navigation/native";
import { getUserAllGameStats } from "../../services/scoreService";
import { gamesData } from "../../constants/gamesData";
import { countries } from "../../constants/countries";
import { useAccessibility } from "../../contexts/AccessibilityContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useUnreadMessages } from "../../contexts/UnreadMessagesContext";
import ThemedLayout from "../../components/ThemedLayout";
import * as Brightness from 'expo-brightness';

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
  const { unreadMessages, updateUnreadMessages, markAllAsRead } = useUnreadMessages();
  const insets = useSafeAreaInsets();
  const messagesListRef = useRef(null);
  
  // Fonction pour forcer le scroll vers le dernier message
  const scrollToBottom = useCallback((animated = true) => {
    if (messagesListRef.current && messages && messages.length > 0) {
      setTimeout(() => {
        try {
          messagesListRef.current?.scrollToEnd({ animated });
        } catch (error) {
          // Fallback: scroll vers l'index du dernier message
          messagesListRef.current?.scrollToIndex({ 
            index: messages.length - 1, 
            animated,
            viewPosition: 1
          });
        }
      }, 100);
    }
  }, []);

  // Fonction de scroll immédiat (sans délai)
  const scrollToBottomImmediate = useCallback(() => {
    if (messagesListRef.current && messages && messages.length > 0) {
      try {
        messagesListRef.current.scrollToEnd({ animated: false });
      } catch (error) {
        messagesListRef.current.scrollToIndex({ 
          index: messages.length - 1, 
          animated: false,
          viewPosition: 1
        });
      }
    }
  }, []);
  
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

  // Écouter le statut en ligne des amis en temps réel
  useEffect(() => {
    if (!friendsRaw || friendsRaw.length === 0) return;

    const unsubscribers = friendsRaw.map(friend => {
      const userRef = doc(db, 'users', friend.id);
      return onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          const isOnline = userData.isOnline || false;
          setOnlineStatus(prev => ({
            ...prev,
            [friend.id]: isOnline
          }));
        }
      }, (error) => {
        // Erreur lors de l'écoute du statut
      });
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [friendsRaw]);

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
  const [showFriendCard, setShowFriendCard] = useState(false);

  const [friendProfile, setFriendProfile] = useState(null);
  const [friendStats, setFriendStats] = useState(null);
  const [friendLoading, setFriendLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [qrCodeExpanded, setQrCodeExpanded] = useState(false);
  const [originalBrightness, setOriginalBrightness] = useState(null);

  // Debug: montage et changements d'état clés
  useEffect(() => {
  }, []);

  useEffect(() => {
  }, [selectedFriend?.id]);

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

  // Réinitialiser l'écran (fermer la conversation) à chaque focus sur l'onglet Social
  useFocusEffect(
    React.useCallback(() => {
      setSelectedFriend(null);
      setLongPressedFriendId(null);
      setSelectedUser(null);
      setSearchResults([]);
      
      // Mettre à jour le statut en ligne de l'utilisateur actuel
      if (user?.id) {
        const userRef = doc(db, 'users', user.id);
        updateDoc(userRef, {
          isOnline: true,
          lastSeen: serverTimestamp()
        }).catch(error => {
          // Erreur lors de la mise à jour du statut en ligne
        });
      }
    }, [user?.id])
  );

  // Mettre à jour le statut hors ligne quand l'utilisateur quitte l'écran
  useEffect(() => {
    const handleAppStateChange = () => {
      if (user?.id) {
        const userRef = doc(db, 'users', user.id);
        updateDoc(userRef, {
          isOnline: false,
          lastSeen: serverTimestamp()
        }).catch(error => {
        });
      }
    };

    // Écouter les changements d'état de l'app
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
      // Mettre à jour le statut hors ligne au démontage
      handleAppStateChange();
    };
  }, [user?.id]);







  // Écouter les messages en temps réel (désactivé temporairement)
  useEffect(() => {
    if (!friendsRaw || !user?.id) return;

    // Écouter les messages non lus de tous les amis
    const unsubscribers = friendsRaw.map(friend => {
      const chatId = [user.id, friend.id].sort().join('_');
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      
      // Requête simplifiée sans index composite
      return onSnapshot(messagesRef, (snapshot) => {
        let unreadCount = 0;
        snapshot.forEach((doc) => {
          const messageData = doc.data();
          // Compter les messages non lus de l'ami (pas de l'utilisateur actuel)
          if (messageData.senderId !== user.id && !messageData.read) {
            unreadCount++;
          }
        });
        updateUnreadMessages(friend.id, unreadCount);
      }, (err) => {
        // Erreur lors de l'écoute des messages non lus
      });
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [friendsRaw, user?.id, updateUnreadMessages]);

  // Écouter les messages en temps réel pour le chat actuel
  useEffect(() => {
    if (!selectedFriend || !user?.id) {
      return;
    }

    const chatId = [user.id, selectedFriend.id].sort().join('_');
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const qMsg = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(qMsg, (snapshot) => {
      const newMessages = [];
      snapshot.forEach((d) => {
        newMessages.push({ id: d.id, ...d.data() });
      });
      setMessages(newMessages);
      
      // Marquer les messages comme lus quand on ouvre le chat
      if (selectedFriend) {
        markAllAsRead(selectedFriend.id);
        // Marquer aussi les messages comme lus dans Firestore
        markMessagesAsReadInFirestore(chatId);
      }
      
      // Scroll automatique vers le dernier message quand de nouveaux messages arrivent
      scrollToBottomImmediate();
    }, (err) => {
      Toast.show({ type: 'error', text1: 'Erreur messages', text2: 'Permissions insuffisantes', position: 'top', topOffset: 40 });
    });

    return () => {
      unsubscribe();
    };
  }, [selectedFriend?.id, user?.id, markAllAsRead]);

  // Vider les messages et scroll automatique quand on change d'ami
  useEffect(() => {
    if (selectedFriend) {
      setMessages([]);
    }
  }, [selectedFriend?.id]);

  // Scroll automatique quand les messages changent (seulement si on a des messages)
  useEffect(() => {
    if (selectedFriend && messages && messages.length > 0) {
      scrollToBottomImmediate();
    }
  }, [messages.length, scrollToBottomImmediate]);

  // Marquer les messages comme lus dans Firestore
  const markMessagesAsReadInFirestore = async (chatId) => {
    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      
      // Récupérer tous les messages et filtrer côté client
      const snapshot = await getDocs(messagesRef);
      const batch = writeBatch(db);
      let hasUpdates = false;
      
      snapshot.forEach((doc) => {
        const messageData = doc.data();
        // Marquer comme lus seulement les messages non lus de l'ami (pas de l'utilisateur actuel)
        if (messageData.senderId !== user?.id && !messageData.read) {
          batch.update(doc.ref, { read: true });
          hasUpdates = true;
        }
      });
      
      if (hasUpdates) {
        await batch.commit();
      }
    } catch (error) {
      // Erreur lors du marquage des messages comme lus
    }
  };

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
      
      // Scroll automatique vers le dernier message après envoi
      scrollToBottomImmediate();
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Envoi échoué', position: 'top', topOffset: 40 });
    }
  }, [input, selectedFriend, user, handleTyping, isTyping, messages]);

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

  // Fonction pour agrandir le QR code en plein écran
  const expandQRCode = async () => {
    try {
      // Sauvegarder la luminosité actuelle
      const currentBrightness = await Brightness.getBrightnessAsync();
      setOriginalBrightness(currentBrightness);
      
      // Mettre la luminosité au maximum
      await Brightness.setBrightnessAsync(1.0);
      
      // Afficher le QR code en plein écran
      setQrCodeExpanded(true);
    } catch (error) {
      // Erreur lors de l'expansion du QR code
    }
  };

  // Fonction pour fermer le QR code agrandi
  const closeExpandedQRCode = async () => {
    try {
      // Restaurer la luminosité originale
      if (originalBrightness !== null) {
        await Brightness.setBrightnessAsync(originalBrightness);
      }
      
      // Fermer l'affichage plein écran
      setQrCodeExpanded(false);
      setOriginalBrightness(null);
    } catch (error) {
      // Erreur lors de la fermeture du QR code
    }
  };

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
      
      
      const users = [];
      
      snapshot.forEach((doc) => {
        const userData = doc.data();
        const username = userData.username || '';
        
        
        
        // Filtrer par nom d'utilisateur (insensible à la casse)
        if (username.toLowerCase().includes(searchTerm.toLowerCase())) {
          
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
          }
        } else {
          
        }
      });
      
      
      setSearchResults(users);
    } catch (error) {
      // Erreur lors de la recherche d'utilisateurs
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
      // Erreur lors du chargement du profil utilisateur
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
            { backgroundColor: isMine ? theme.primary : theme.card, borderColor: isMine ? theme.primary : theme.border }
          ]}>
          <Text style={[
            styles.messageText, 
            { color: isMine ? '#fff' : theme.text }
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.messageTime, 
            { color: isMine ? 'rgba(255,255,255,0.7)' : theme.textSecondary }
          ]}>
            {messageTime}
          </Text>
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
           {item.photoURL ? (
             <Image source={{ uri: item.photoURL }} style={styles.friendAvatar} />
           ) : (
             <Text style={[styles.friendAvatarText, { color: theme.primary }]}>{item.avatar || '👤'}</Text>
           )}
         </View>
        <View style={styles.friendInfo}>
          <Text style={[styles.friendName, { color: theme.text }]}>{item.username}</Text>
          <View style={styles.friendStatusRow}>
            <Text style={[styles.onlineStatus, { color: theme.textSecondary }]}>
              {onlineStatus[item.id] ? 'En ligne' : 'Hors ligne'}
            </Text>
            <View style={{ width: 6 }} />
            <View style={[
              styles.onlineIndicatorInline,
              { backgroundColor: onlineStatus[item.id] ? '#4cd137' : '#ff6b6b' }
            ]} />
          </View>
        </View>
        <View style={styles.friendActions}>
          <Ionicons name='chatbubble-ellipses' size={20} color={theme.accent} />
          {unreadMessages[item.id] > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {unreadMessages[item.id] > 99 ? '99+' : unreadMessages[item.id]}
              </Text>
            </View>
          )}
        </View>
        {longPressedFriendId === item.id && (
          <TouchableOpacity
            onPress={() => removeFriend(item.id)}
            style={[styles.deleteIcon, { backgroundColor: theme.card }]}>
            <Ionicons name='trash' size={22} color='#FF6B6B' />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    ),
    [longPressedFriendId, removeFriend, onlineStatus, theme, unreadMessages]
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
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingTop: 0, // Supprimer le padding top
        paddingBottom: 0, // Supprimer le padding bottom
      }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* En-tête du chat */}
                    <View style={[styles.chatHeader, { 
          backgroundColor: theme.card, 
          borderBottomColor: theme.border,
          paddingTop: insets.top, // Utiliser seulement le safe area minimum
        }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setSelectedFriend(null)}>
          <Ionicons name='arrow-back' size={24} color={theme.primary} />
        </TouchableOpacity>
        <View style={styles.chatHeaderInfo}>
          <Text style={[styles.chatTitle, { color: theme.text }]}>{selectedFriend?.username}</Text>
          <View style={styles.chatStatus}>
            <Text style={[styles.chatStatusText, { color: theme.textSecondary }]}>
              {onlineStatus[selectedFriend?.id] ? 'En ligne' : 'Hors ligne'}
            </Text>
            <View style={{ width: 6 }} />
            <View style={[
              styles.onlineIndicatorInline,
              { backgroundColor: onlineStatus[selectedFriend?.id] ? '#4cd137' : '#ff6b6b' }
            ]} />
          </View>
        </View>
        <View style={styles.chatHeaderActions}>
          <TouchableOpacity
            accessibilityLabel="Voir la carte du joueur"
            onPress={() => setShowFriendCard(true)}
            style={[styles.miniProfileCard, { borderColor: theme.border, backgroundColor: theme.card }]}
            activeOpacity={0.8}
          >
            {friendProfile?.photoURL || selectedFriend?.photoURL ? (
              <Image source={{ uri: friendProfile?.photoURL || selectedFriend?.photoURL }} style={styles.miniProfileAvatar} />
            ) : (
              <View style={[styles.miniProfileAvatar, { backgroundColor: theme.primary }]}> 
                <Text style={styles.miniProfileAvatarText}>{friendProfile?.avatar || selectedFriend?.avatar || '👤'}</Text>
              </View>
            )}
            <View style={{ width: 8 }} />
            <View style={{ justifyContent: 'center' }}>
              <Text style={[styles.miniProfileTextTitle, { color: theme.text }]}>Voir la carte</Text>
              <Text style={[styles.miniProfileTextSub, { color: theme.textSecondary }]} numberOfLines={1}>
                {selectedFriend?.username || 'Joueur'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Zone des messages */}
      <View style={[styles.messagesContainer, { paddingHorizontal: 16, paddingBottom: 8 }]}>
        {messages && (
          <FlatList
            ref={messagesListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            style={{ flex: 1 }}
            ListEmptyComponent={
              <View style={{ paddingVertical: 50, alignItems: 'center' }}>
                <Ionicons name='chatbubbles-outline' size={48} color={theme.textSecondary} />
                <Text style={{ color: theme.textSecondary, marginTop: 16, fontSize: 16 }}>
                  Commencez la conversation
                </Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: 20 }}
            keyboardShouldPersistTaps='handled'
            keyboardDismissMode='interactive'
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10,
            }}
            onLayout={() => {
              // Scroll automatique quand la liste se charge
              if (messages && messages.length > 0) {
                scrollToBottomImmediate();
              }
            }}
            onContentSizeChange={() => {
              // Scroll automatique quand le contenu change
              if (messages && messages.length > 0) {
                scrollToBottomImmediate();
              }
            }}
            onScrollBeginDrag={() => {
              // Désactiver le scroll automatique quand l'utilisateur scroll manuellement
            }}
          />
        )}
      </View>

                                                       {/* Zone de saisie */}
         <View
           style={[
             styles.inputRow,
             {
               backgroundColor: theme.card,
               borderTopWidth: 1,
               borderTopColor: theme.border,
               paddingBottom: Math.max(insets.bottom, 8), // Même espace minimum en bas
               paddingTop: 8, // Espace en haut
               marginBottom: 0, // Supprimer la marge du bas
               paddingHorizontal: 16, // Assurer l'espacement horizontal uniforme
             },
           ]}
         >
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }
          ]}
          value={input}
          onChangeText={setInput}
          placeholder='Votre message...'
          placeholderTextColor={theme.placeholder}
          multiline={false}
        />
        <TouchableOpacity 
          onPress={sendMessage} 
          style={styles.sendButton}
          disabled={!input.trim()}>
          <Ionicons 
            name='send' 
            size={24} 
            color={input.trim() ? theme.primary : theme.textSecondary} 
          />
        </TouchableOpacity>
      </View>

      {/* Overlay Carte Joueur */}
      {showFriendCard && (
        <View style={styles.userCardOverlay}>
          <View style={[styles.userCardOverlayContent, { backgroundColor: theme.card }]}>
            <TouchableOpacity
              style={styles.userCardCloseButton}
              onPress={() => setShowFriendCard(false)}
              accessibilityLabel="Fermer la carte joueur"
            >
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>

            {friendLoading ? (
              <View style={styles.userCardLoading}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.userCardLoadingText, { color: theme.textSecondary }]}>Chargement…</Text>
              </View>
            ) : (
              <>
                {/* Bannière en haut de la carte */}
                {friendProfile?.bannerImage ? (
                  <Image
                    source={{ uri: friendProfile.bannerImage }}
                    style={styles.userCardBanner}
                    resizeMode='cover'
                  />
                ) : (
                  <View
                    style={[
                      styles.userCardBanner,
                      { backgroundColor: friendProfile?.bannerColor || theme.surface },
                    ]}
                  />
                )}
                
                {/* Avatar centré sur la bannière */}
                <View style={styles.userCardAvatarWrap}>
                  {friendProfile?.photoURL ? (
                    <Image 
                      source={{ uri: friendProfile.photoURL }} 
                      style={[styles.userCardAvatar, { borderColor: theme.card }]} 
                    />
                  ) : (
                    <View 
                      style={[
                        styles.userCardAvatarPlaceholder, 
                        { 
                          backgroundColor: theme.primary,
                          borderColor: theme.card 
                        }
                      ]}
                    >
                      <Text style={styles.userCardAvatarText}>{friendProfile?.avatar || '👤'}</Text>
                    </View>
                  )}
                </View>
                
                {/* Nom du joueur */}
                <Text style={[styles.userCardName, { color: theme.text }]}>
                  {friendProfile?.username || selectedFriend?.username || 'Joueur'}
                </Text>
                
                {/* Pays */}
                {!!friendProfile?.country && (
                  <View style={styles.userCardCountryRow}>
                    <Text style={styles.userCardCountryFlag}>
                      {(countries.find(c => c.code === friendProfile.country)?.flag) || '🏳️'}
                    </Text>
                    <Text style={[styles.userCardCountryName, { color: theme.textSecondary }]}>
                      {(countries.find(c => c.code === friendProfile.country)?.nameFr) || friendProfile.country}
                    </Text>
                  </View>
                )}
                
                {/* Bio */}
                {friendProfile?.bio && (
                  <Text style={[styles.userCardBio, { color: theme.textSecondary }]}>
                    {friendProfile.bio}
                  </Text>
                )}
                
                {/* Stats */}
                <View style={styles.userCardStatsRow}>
                  <View style={styles.userCardStat}>
                    <Text style={[styles.userCardStatValue, { color: theme.text }]}>{friendStats?.totalPoints ?? 0}</Text>
                    <Text style={[styles.userCardStatLabel, { color: theme.textSecondary }]}>Points</Text>
                  </View>
                  <View style={styles.userCardStat}>
                    <Text style={[styles.userCardStatValue, { color: theme.text }]}>{friendStats?.winRate ?? 0}%</Text>
                    <Text style={[styles.userCardStatLabel, { color: theme.textSecondary }]}>Winrate</Text>
                  </View>
                  <View style={styles.userCardStat}>
                    <Text style={[styles.userCardStatValue, { color: theme.text }]}> 
                      {friendStats?.bestGameId ? (gamesData.find(g => g.id === friendStats.bestGameId)?.name || friendStats.bestGameId) : '-'}
                    </Text>
                    <Text style={[styles.userCardStatLabel, { color: theme.textSecondary }]}>Meilleur jeu</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );

  // Affichage principal : recherche, liste d'amis et d'utilisateurs
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingTop: insets.top + 10,
        paddingBottom: Math.max(insets.bottom, 8),
      }}
    >
        {selectedFriend ? (
          // Afficher le chat si un ami est sélectionné
          renderChat()
        ) : (
          // Afficher la liste des amis et la recherche si aucun ami n'est sélectionné
          <>
            {/* Section Partager mon profil (affichée uniquement hors conversation) */}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Partager mon profil</Text>
            <View style={[styles.shareProfileSection, { backgroundColor: theme.card }, largerSpacing && { padding: 24, marginBottom: 24 }]}>
              <View style={styles.qrAndLinkRow}>
                <TouchableOpacity onPress={expandQRCode} activeOpacity={0.7}>
                  <QRCode value={myProfileLink} size={90} />
                </TouchableOpacity>
                <View style={[styles.separator, { backgroundColor: theme.border }]} />
                <TouchableOpacity
                  style={[styles.copyButton, { backgroundColor: theme.surface }]}
                  onPress={openGallery}>
                  <Ionicons name='qr-code' size={20} color={theme.primary} />
                  <Text style={[styles.copyButtonText, { color: theme.primary }]}>Scanner un QR code</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* QR Code agrandi en plein écran */}
            {qrCodeExpanded && (
              <View style={styles.qrCodeExpandedOverlay}>
                <View style={styles.qrCodeExpandedContent}>
                  <TouchableOpacity
                    style={styles.qrCodeCloseButton}
                    onPress={closeExpandedQRCode}>
                    <Ionicons name="close" size={30} color="#fff" />
                  </TouchableOpacity>
                  <View style={styles.qrCodeExpandedContainer}>
                    <QRCode value={myProfileLink} size={300} />
                    <Text style={styles.qrCodeExpandedText}>Scannez ce QR code pour ajouter {user?.displayName || user?.email || 'cet utilisateur'} comme ami</Text>
                  </View>
                </View>
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
      {/* Toast pour feedback */}
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 10,
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
    borderRadius: 8,
  },
  userName: { flex: 1, fontSize: 16, marginLeft: 10 },
  emptyText: {
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 10,
    marginHorizontal: 16,
  },
  chatContainer: { 
    flex: 1
  },
  messagesContainer: { 
    flex: 1,
    paddingHorizontal: 16
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    elevation: 2,
  },
  chatHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  profileButton: {
    padding: 6,
    borderRadius: 16,
  },
  miniProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  miniProfileAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniProfileAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  miniProfileTextTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  miniProfileTextSub: {
    fontSize: 11,
    maxWidth: 120,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  chatStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  chatStatusText: {
    fontSize: 13,
    marginLeft: 6,
  },
  onlineIndicatorInline: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginVertical: 6,
    maxWidth: "80%",
    borderWidth: 1,
  },
  myMessage: { 
    alignSelf: "flex-end"
  },
  theirMessage: { 
    alignSelf: "flex-start"
  },
  messageText: { 
    fontSize: 16,
    color: '#fff',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 6,
    alignSelf: "flex-end",
    opacity: 0.7,
  },
                                               inputRow: { 
        flexDirection: "row", 
        alignItems: "center", 
        paddingHorizontal: 16,
        paddingTop: 8, // Espace en haut
        paddingBottom: 8, // Même espace en bas
        marginBottom: 0, // Supprimer la marge du bas
        justifyContent: 'center'
      },
     input: {
     flex: 1,
     borderRadius: 20,
     paddingHorizontal: 16,
     paddingVertical: 12,
     fontSize: 16,
     borderWidth: 1,
     marginRight: 12,
     textAlignVertical: 'center',
   },
  sendButton: {
    padding: 12,
    borderRadius: 20
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
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    alignItems: "center",
    flexDirection: "column",
  },

  qrAndLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  separator: {
    width: 1,
    height: 80,
    marginHorizontal: 20,
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
  onlineIndicatorInline: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  friendAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  friendAvatarText: {
    fontSize: 20,
    width: 28,
    height: 28,
    textAlign: 'center',
    lineHeight: 28,
  },
  friendInfo: {
    flex: 1,
  },
  onlineStatus: {
    fontSize: 12,
  },
     friendStatusRow: {
     flexDirection: 'row',
     alignItems: 'center',
     marginTop: 2,
     marginLeft: 10,
   },
  friendActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  unreadBadge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 5,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
    paddingVertical: 8,
  },
  userCardAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  userCardAvatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userCardAvatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  userCardUsername: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  userCardCountryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
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
    lineHeight: 20,
  },
  userCardStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 8,
  },
  userCardStat: {
    alignItems: 'center',
    minWidth: 80,
  },
  userCardStatValue: {
    fontWeight: 'bold',
    marginTop: 4,
    fontSize: 16,
    marginBottom: 4,
  },
  userCardStatLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  userCardSeparator: {
    height: 1,
    width: '100%',
    marginVertical: 15,
  },
  userCardBioSection: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  userCardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Plus sombre pour plus de contraste
    justifyContent: 'center',
    alignItems: 'center',
  },
  userCardOverlayContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 24, // Plus de padding
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1, // Ajouter une bordure
  },
  userCardCloseButton: {
    position: 'absolute',
    top: -15,
    right: -15,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  userCardBanner: {
    width: '100%',
    height: 80,
    borderRadius: 12,
    marginBottom: 0,
  },
  userCardAvatarWrap: {
    alignItems: 'center',
    marginTop: -30,
    marginBottom: 16,
  },
  userCardAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#fff', // Valeur statique
  },
  userCardAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#fff', // Valeur statique
    alignItems: 'center',
    justifyContent: 'center',
  },
  userCardAvatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userCardName: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 6,
    marginBottom: 8,
  },
  userCardCountryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  userCardCountryFlag: {
    fontSize: 18,
  },
  userCardCountryName: {
    textAlign: 'center',
    fontSize: 12,
  },
  userCardBio: {
    textAlign: 'center',
    fontStyle: 'italic',
    paddingBottom: 10,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  userCardStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  userCardStat: {
    alignItems: 'center',
    minWidth: 80,
  },
  userCardStatValue: {
    fontWeight: 'bold',
    marginTop: 2,
    fontSize: 16,
    marginBottom: 4,
  },
  userCardStatLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  qrCodeExpandedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  qrCodeExpandedContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  qrCodeExpandedContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  qrCodeExpandedText: {
    color: '#333',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 15,
    paddingHorizontal: 20,
  },
  qrCodeCloseButton: {
    position: 'absolute',
    top: -50,
    right: 0,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
});