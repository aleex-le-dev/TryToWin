import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  TextInput,
  Platform,
  Modal,
  Button,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "../../hooks/useAuth";
import { messages } from "../../constants/config";
import { doc, getDoc, updateDoc, setDoc, collection } from "firebase/firestore";
import { db } from "../../utils/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProfileAvatar from "../../components/ProfileAvatar";
import * as DocumentPicker from "expo-document-picker";
import AvatarLibrary from "../../components/AvatarLibrary";
import ProfileHeaderAvatar from "../../components/ProfileHeaderAvatar";
import ProfileTab from "../../components/ProfileTab";
import LeaderboardProfil from "../../components/LeaderboardProfil";
import ProfileStats from "../../components/ProfileStats";
import WheelColorPicker from "react-native-wheel-color-picker";
import SettingsScreen from "../social/SettingsScreen";
import {
  getUserGameScore,
  getUserAllGameStats,
  recordGameResult,
  initializeLeaderboardsForUser,
} from "../../services/scoreService";
import { GAME_POINTS } from "../../constants/gamePoints";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { uploadProfilePhoto } from "../../services/storageService";
import { uploadToCloudinary } from "../../services/cloudinaryService";
import * as ImageManipulator from "expo-image-manipulator";
import SkeletonProfile from "../../components/SkeletonProfile";
import { useTheme } from "../../contexts/ThemeContext";
import ThemedLayout from "../../components/ThemedLayout";

const { width } = Dimensions.get("window");

import { countries } from "../../constants/countries";

// Bannière par défaut (placeholder) via Placeholders.xyz
const DEFAULT_BANNER =
  "https://placeholders.xyz/800x200/667eea/FFFFFF?text=Ma+Banni%C3%A8re";

// Fonction utilitaire pour sauvegarder le profil localement
const saveProfileLocally = async (userId, profileData) => {
  try {
    await AsyncStorage.setItem(
      `profile_${userId}`,
      JSON.stringify(profileData)
    );
  } catch (e) {}
};

// Fonction utilitaire pour charger le profil local
const loadProfileLocally = async (userId) => {
  try {
    const data = await AsyncStorage.getItem(`profile_${userId}`);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {}
  return null;
};

// --- GESTION DE LA QUEUE DE SYNCHRONISATION ---
// Ajoute une modification à la queue locale
const addToProfileQueue = async (userId, modif) => {
  try {
    const key = `profile_queue_${userId}`;
    const queue = JSON.parse(await AsyncStorage.getItem(key)) || [];
    queue.push(modif);
    await AsyncStorage.setItem(key, JSON.stringify(queue));
  } catch (e) {}
};

// Vide la queue locale (après synchro réussie)
const clearProfileQueue = async (userId) => {
  try {
    await AsyncStorage.removeItem(`profile_queue_${userId}`);
  } catch (e) {}
};

// Charge la queue locale
const loadProfileQueue = async (userId) => {
  try {
    const data = await AsyncStorage.getItem(`profile_queue_${userId}`);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

// Déplacer le composant SkeletonProfile dans src/components/SkeletonProfile.js et l'exporter

// Écran de profil avec classement et statistiques
const ProfileScreen = ({ navigation, profileTabResetKey }) => {
  const { logout, user, loading } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");
  const [profileBanner, setProfileBanner] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("👑");
  const [profileName, setProfileName] = useState("AlexGamer");
  const [profileBio, setProfileBio] = useState(
    "Passionné de jeux de stratégie et de logique. Toujours prêt à relever de nouveaux défis !"
  );
  const [editing, setEditing] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [editingField, setEditingField] = useState(null);
  const [bannerColor, setBannerColor] = useState("#fff");
  const [bannerModalVisible, setBannerModalVisible] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [profile, setProfile] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState({
    username: "",
    avatar: "",
    bio: "",
    country: "",
    bannerColor: null,
    bannerImage: null,
    photoURL: "",
  });
  const [syncPending, setSyncPending] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [showAvatarLibrary, setShowAvatarLibrary] = useState(false);
  const [showColorWheel, setShowColorWheel] = useState(false);
  const [bannerHex, setBannerHex] = useState(editData.bannerColor || "#fff");
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileFromFirestoreLoaded, setProfileFromFirestoreLoaded] =
    useState(false);
  const [profileLocal, setProfileLocal] = useState(null);
  const [userScores, setUserScores] = useState({});
  const [userStatsGlobal, setUserStatsGlobal] = useState({
    totalGames: 0,
    wins: 0,
    draws: 0,
    loses: 0,
    totalPoints: 0,
    winrate: 0,
    streak: 0,
  });
  const [userStatsByGame, setUserStatsByGame] = useState({});
  const [userStatsByGameForStatsTab, setUserStatsByGameForStatsTab] = useState(
    {}
  );
  const nav = useNavigation();

  // Ajouter un état d'upload pour la bannière et l'avatar
  const [bannerUploading, setBannerUploading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Calcul des vraies statistiques utilisateur basées sur les données Firestore
  const userStats = {
    totalScore: userStatsGlobal.totalPoints || userStatsGlobal.totalPoints || 0,
    gamesPlayed: userStatsGlobal.totalGames || 0,
    gamesWon: userStatsGlobal.wins || 0,
    winRate: userStatsGlobal.winrate || 0,
    bestGame:
      userStatsByGame && Object.keys(userStatsByGame).length > 0
        ? (() => {
            let best = null;
            let maxPoints = 0;
            for (const [game, stats] of Object.entries(userStatsByGame)) {
              if ((stats.points || stats.totalPoints || 0) > maxPoints) {
                maxPoints = stats.points || stats.totalPoints || 0;
                best = game;
              }
            }
            return maxPoints > 0 ? best : null;
          })()
        : null,
    currentStreak: userStatsGlobal.streak || 0,
    totalGames: userStatsGlobal.totalGames || 0,
  };

  // Récupération du profil Firestore à l'ouverture
  useEffect(() => {
    if (user?.id) {
      const fetchProfile = async () => {
        setProfileLoading(true);
        setProfileFromFirestoreLoaded(false);
        // 1. Charger d'abord le cache local
        const localProfile = await loadProfileLocally(user.id);
        if (localProfile) {
          setProfileLocal(localProfile);
          setProfile(localProfile);
          if (localProfile.photoURL) setProfilePhoto(localProfile.photoURL);
        }
        // 2. Tenter de charger Firestore
        try {
          const docRef = doc(db, "users", user.id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfile(data);
            saveProfileLocally(user.id, data); // Ecrase le cache local avec la version serveur
            if (data.photoURL) setProfilePhoto(data.photoURL);
            setProfileFromFirestoreLoaded(true);
          } else {
            // Si pas de doc, on génère un tag localement aussi
            const newTag = generateTag();
            setProfile({ tag: newTag });
            saveProfileLocally(user.id, { tag: newTag });
            addToProfileQueue(user.id, { tag: newTag });
            setSyncPending(true);
            setProfileFromFirestoreLoaded(true);
          }
        } catch (e) {
          setProfileFromFirestoreLoaded(true);
        }
        // 3. Tente de synchroniser la queue si Firestore est dispo
        try {
          const docRef = doc(db, "users", user.id);
          const queue = await loadProfileQueue(user.id);
          if (queue.length > 0) {
            for (const modif of queue) {
              await updateDoc(docRef, modif);
            }
            await clearProfileQueue(user.id);
            setSyncPending(false);
            Toast.show({
              type: "success",
              text1: "Profil synchronisé",
              text2:
                "Toutes vos modifications ont été enregistrées sur le cloud.",
              position: "top",
              topOffset: 40,
              visibilityTime: 2000,
            });
          }
        } catch (e) {
          if ((await loadProfileQueue(user.id)).length > 0)
            setSyncPending(true);
        }
        setProfileLoading(false);
      };
      fetchProfile();
      // Récupération des scores Firestore réels pour chaque jeu
      fetchScores();
      // Calcul des stats globales et par jeu
      fetchStats();
    }
  }, [user, loading]);

  // Fonction fetchScores déplacée en dehors du useEffect pour être accessible
  const fetchScores = async () => {
    if (!user?.id) return;
    const allStats = await getUserAllGameStats(user.id);
    const scores = {};
    let totalGames = 0,
      wins = 0,
      draws = 0,
      loses = 0,
      totalPoints = 0;

    for (const game of Object.keys(GAME_POINTS)) {
      scores[game] = allStats.gamesPlayed[game] || {
        win: 0,
        draw: 0,
        lose: 0,
        totalPoints: 0,
        totalGames: 0,
        totalDuration: 0,
        winRate: 0,
        currentStreak: 0,
        bestTime: null,
        lastUpdated: null,
        lastPlayed: null,
      };
      totalGames += scores[game].totalGames;
      wins += scores[game].win;
      draws += scores[game].draw;
      loses += scores[game].lose;
      totalPoints += scores[game].totalPoints;
    }
    setUserScores(scores);
    setUserStatsGlobal({
      totalGames,
      wins,
      draws,
      loses,
      totalPoints,
      winrate: totalGames ? Math.round(100 * (wins / totalGames)) : 0,
      streak: Math.max(
        ...Object.values(scores).map((s) => s.currentStreak || 0)
      ),
    });
  };

  // Rafraîchissement automatique des stats quand on revient sur l'écran
  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        fetchStats();
        fetchScores();
      }
    }, [user?.id])
  );

  // Fonction fetchStats déplacée en dehors du useEffect pour être accessible
  const fetchStats = async () => {
    if (!user?.id) return;

    const allStats = await getUserAllGameStats(user.id);
    const statsByGameForStatsTab = {};
    const statsByGameRaw = {};
    let totalGames = 0,
      wins = 0,
      draws = 0,
      loses = 0,
      totalPoints = 0;

    for (const game of Object.keys(GAME_POINTS)) {
      const s = allStats.gamesPlayed[game] || {
        win: 0,
        draw: 0,
        lose: 0,
        totalPoints: 0,
        totalGames: 0,
        totalDuration: 0,
        winRate: 0,
        currentStreak: 0,
        bestTime: null,
        lastUpdated: null,
        lastPlayed: null,
      };
      statsByGameForStatsTab[game] = {
        totalGames: s.totalGames || 0,
        wins: s.win || 0,
        draws: s.draw || 0,
        loses: s.lose || 0,
        points: s.totalPoints || 0,
        winrate: s.winRate || 0,
      };
      statsByGameRaw[game] = s;
      totalGames += s.totalGames || 0;
      wins += s.win || 0;
      draws += s.draw || 0;
      loses += s.lose || 0;
      totalPoints += s.totalPoints || 0;
    }
    setUserStatsByGame(statsByGameRaw);
    setUserStatsByGameForStatsTab(statsByGameForStatsTab);
    setUserStatsGlobal({
      totalGames,
      wins,
      draws,
      loses,
      totalPoints,
      winrate: totalGames ? Math.round(100 * (wins / totalGames)) : 0,
      streak: Math.max(
        ...Object.values(statsByGameForStatsTab).map((s) => s.wins)
      ),
    });
  };

  // Ajoute un useEffect pour synchroniser bannerHex avec profile?.bannerColor :
  useEffect(() => {
    if (profile?.bannerColor) {
      setBannerHex(profile.bannerColor);
    } else {
      setBannerHex("#fff");
    }
  }, [profile?.bannerColor]);

  useEffect(() => {
    const unsubscribe = nav.addListener("tabPress", (e) => {
      if (e?.data?.resetProfileTab) {
        setActiveTab("profile");
      }
    });
    return unsubscribe;
  }, [nav]);

  useEffect(() => {
    setActiveTab("profile");
  }, [profileTabResetKey]);

  const handleLogout = async () => {
    const result = await logout();

    if (result.success) {
      Toast.show({
        type: "success",
        text1: messages.success.logout,
        text2: "Vous avez été déconnecté avec succès",
        position: "top",
        topOffset: 40,
        visibilityTime: 2000,
      });

      // Navigation vers la page de connexion
      setTimeout(() => {
        navigation.navigate("Login");
      }, 1000);
    } else {
      Toast.show({
        type: "error",
        text1: "Erreur de déconnexion",
        text2: result.error,
        position: "top",
        topOffset: 40,
        visibilityTime: 2000,
      });
    }
  };

  const handleCountryChange = async (countryCode) => {
    if (user?.id) {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, { country: countryCode });
      setProfile((prev) => ({ ...prev, country: countryCode }));
    }
  };

  const renderStatCard = (icon, value, label, color) => (
    <View style={[styles.statCard, { backgroundColor: theme.card }]}> 
      <Ionicons name={icon} size={32} color={color} style={styles.statIcon} />
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );

  // Ouvre le modal avec les valeurs actuelles
  const openEditModal = () => {
    setShowAvatarLibrary(false);
    setEditData({
      username: profile?.username || user?.displayName || "",
      avatar: profile?.avatar || "👑",
      bio: profile?.bio || "",
      country: profile?.country || "",
      bannerColor: profile?.bannerColor || null,
      bannerImage: profile?.bannerImage || null,
      photoURL: profile?.photoURL || "",
    });
    setEditModalVisible(true);
  };

  // Sauvegarde les modifications
  const handleSaveProfile = async () => {
    try {
      console.log("[handleSaveProfile] Début", editData);
      if (!editData.username.trim()) {
        Toast.show({
          type: "error",
          text1: "Erreur",
          text2: "Le nom d'utilisateur ne peut pas être vide",
          position: "top",
          topOffset: 40,
          visibilityTime: 2000,
        });
        return;
      }

      if (!user?.id) {
        Toast.show({
          type: "error",
          text1: "Erreur",
          text2: "Impossible de récupérer l'identifiant utilisateur",
          position: "top",
          topOffset: 40,
          visibilityTime: 2000,
        });
        return;
      }

      const userRef = doc(db, "users", user.id);
      let photoURL = editData.photoURL;
      let avatar = editData.avatar;
      let bannerImage = editData.bannerImage;
      // Si une photo a été uploadée, on la compress et on la upload
      if (photoURL && (photoURL.startsWith("file") || photoURL.startsWith("content") || photoURL.startsWith("data") || photoURL.includes("://") === false)) {
        console.log("[handleSaveProfile] Image locale détectée, début compression", photoURL);
        const manipResult = await ImageManipulator.manipulateAsync(
          photoURL,
          [{ resize: { width: 900 } }],
          { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
        );
        console.log(
          "[handleSaveProfile] URI compressée photoURL",
          manipResult.uri
        );
        photoURL = await uploadToCloudinary(manipResult.uri, "trytowin avatar");
        console.log(
          "[handleSaveProfile] photoURL après upload Cloudinary",
          photoURL
        );
        setProfilePhoto(photoURL);
      } else {
        console.log("[handleSaveProfile] Pas d'image locale à traiter, photoURL:", photoURL);
      }
      if (bannerImage && bannerImage.startsWith("file")) {
        console.log(
          "[handleSaveProfile] Début compression bannière",
          bannerImage
        );
        const manipResult = await ImageManipulator.manipulateAsync(
          bannerImage,
          [{ resize: { width: 900 } }],
          { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
        );
        console.log(
          "[handleSaveProfile] URI compressée bannière",
          manipResult.uri
        );
        bannerImage = await uploadToCloudinary(
          manipResult.uri,
          "trytowin banner"
        );
        console.log(
          "[handleSaveProfile] bannerImage après upload Cloudinary",
          bannerImage
        );
      }
      // Si un avatar custom (URL) est choisi, on met à jour avatar uniquement
      // (aucune logique de vidage automatique)
      await setDoc(
        userRef,
        {
          username: editData.username.trim(),
          avatar: avatar || "",
          bio: editData.bio,
          country: editData.country,
          photoURL: photoURL || "",
          bannerColor: editData.bannerColor || null,
          bannerImage: bannerImage || null,
        },
        { merge: true }
      );
      console.log("[handleSaveProfile] après setDoc");
      
      // Mettre à jour l'état local
      setProfile((prev) => ({
        ...prev,
        ...editData,
        avatar: avatar || "",
        photoURL: photoURL || "",
        bannerImage: bannerImage || null,
      }));
      
      // Récupérer le document mis à jour
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data());
        setProfilePhoto(docSnap.data().photoURL || "");
      }
      
      if (typeof fetchProfile === "function") fetchProfile();
      setEditModalVisible(false);
      Toast.show({
        type: "success",
        text1: "Profil mis à jour",
        position: "top",
        topOffset: 40,
        visibilityTime: 2000,
      });
      
      // Retourner l'URL de l'image uploadée (Cloudinary ou locale)
      return photoURL;
    } catch (error) {
      console.log("[handleSaveProfile] ERREUR", error);
      Toast.show({
        type: "error",
        text1: "Erreur de sauvegarde",
        text2: "Impossible de sauvegarder les modifications",
        position: "top",
        topOffset: 40,
        visibilityTime: 2000,
      });
      return null; // Retourne null en cas d'erreur
    }
  };

  const handleOpenSettings = () => {
    navigation.navigate("Settings");
  };

  // Fonction pour générer des données de test pour tous les jeux
  const generateAllGamesTestData = async () => {
    if (user?.id) {
      try {
        // Liste des jeux définis dans GAME_POINTS
        const games = Object.keys(GAME_POINTS);

        // Générer des données de test pour chaque jeu
        for (const gameName of games) {
          // Générer entre 5 et 20 parties par jeu
          const numGames = Math.floor(Math.random() * 16) + 5;

          for (let i = 0; i < numGames; i++) {
            // Résultat aléatoire : win, draw, ou lose
            const results = ["win", "draw", "lose"];
            const result = results[Math.floor(Math.random() * results.length)];

            // Score aléatoire basé sur le résultat
            let score = 0;
            if (result === "win") {
              score = Math.floor(Math.random() * 500) + 100;
            } else if (result === "draw") {
              score = Math.floor(Math.random() * 100) + 20;
            } else {
              score = Math.floor(Math.random() * 50);
            }

            try {
              // Enregistrer le résultat
              await recordGameResult(
                user.id,
                gameName,
                result,
                score
              );
            } catch (error) {}
          }
        }

        // Recharger les statistiques
        fetchStats();

        Toast.show({
          type: "success",
          text1: "Données de test générées",
          text2: "Toutes les statistiques ont été mises à jour",
          position: "top",
          topOffset: 40,
          visibilityTime: 2000,
        });
      } catch (error) {
        // Si c'est une erreur de permissions, proposer une alternative
        if (error.message && error.message.includes("permissions")) {
          Toast.show({
            type: "error",
            text1: "Erreur de permissions",
            text2:
              "Les règles Firestore ne permettent pas l'écriture. Utilisez le mode développement.",
            position: "top",
            topOffset: 40,
            visibilityTime: 4000,
          });
        } else {
          Toast.show({
            type: "error",
            text1: "Erreur",
            text2: "Impossible de générer les données de test",
            position: "top",
            topOffset: 40,
            visibilityTime: 2000,
          });
        }
      }
    }
  };

  // Fonction alternative pour générer des données locales (mode développement)
  const generateLocalTestData = () => {
    try {
      const games = Object.keys(GAME_POINTS);
      const localStats = {};

      // Générer des statistiques locales pour chaque jeu
      for (const gameName of games) {
        const wins = Math.floor(Math.random() * 20) + 5;
        const draws = Math.floor(Math.random() * 10);
        const loses = Math.floor(Math.random() * 15);
        const totalGames = wins + draws + loses;
        const totalPoints =
          wins * (GAME_POINTS[gameName]?.win || 10) +
          draws * (GAME_POINTS[gameName]?.draw || 0) +
          loses * (GAME_POINTS[gameName]?.lose || 0);

        localStats[gameName] = {
          totalGames,
          wins,
          draws,
          loses,
          points: totalPoints,
          winrate: totalGames > 0 ? Math.round(100 * (wins / totalGames)) : 0,
        };
      }

      // Mettre à jour l'état local
      setUserStatsByGame(localStats);

      // Calculer les statistiques globales
      let totalGames = 0,
        wins = 0,
        draws = 0,
        loses = 0,
        totalPoints = 0;
      Object.values(localStats).forEach((stats) => {
        totalGames += stats.totalGames;
        wins += stats.wins;
        draws += stats.draws;
        loses += stats.loses;
        totalPoints += stats.points;
      });

      setUserStatsGlobal({
        totalGames,
        wins,
        draws,
        loses,
        totalPoints,
        winrate: totalGames ? Math.round(100 * (wins / totalGames)) : 0,
        streak: Math.max(...Object.values(localStats).map((s) => s.wins)),
      });

      Toast.show({
        type: "success",
        text1: "Données locales générées",
        text2: "Mode développement - données temporaires",
        position: "top",
        topOffset: 40,
        visibilityTime: 3000,
      });
    } catch (error) {}
  };

  // Permet d'uploader une image pour la bannière
  const pickImageBanner = async () => {
    setBannerUploading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (!result.canceled && result.assets && result.assets[0].uri) {
        setEditData((d) => ({
          ...d,
          bannerImage: result.assets[0].uri,
          bannerColor: null,
        }));
      }
    } finally {
      setBannerUploading(false);
    }
  };

  // Permet d'uploader une image pour l'avatar
  const pickImageAvatar = async () => {
    setAvatarUploading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (!result.canceled && result.assets && result.assets[0].uri) {
        const imageUri = result.assets[0].uri;
        console.log("[pickImageAvatar] Image sélectionnée:", imageUri);
        
        // Compresser et uploader directement l'image
        const manipResult = await ImageManipulator.manipulateAsync(
          imageUri,
          [{ resize: { width: 900 } }],
          { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
        );
        
        const cloudinaryURL = await uploadToCloudinary(manipResult.uri, "trytowin avatar");
        console.log("[pickImageAvatar] URL Cloudinary:", cloudinaryURL);
        
        // Mettre à jour les données
        setEditData((d) => ({
          ...d,
          photoURL: cloudinaryURL,
        }));
        
        // Sauvegarder en base de données
        await setDoc(
          doc(db, "users", user.id),
          { photoURL: cloudinaryURL },
          { merge: true }
        );
        
        // Mettre à jour l'état local
        setProfilePhoto(cloudinaryURL);
        setProfile((prev) => ({
          ...prev,
          photoURL: cloudinaryURL,
        }));
        
        // Sauvegarder localement
        if (user?.id) {
          await saveProfileLocally(user.id, {
            ...profile,
            photoURL: cloudinaryURL,
          });
        }
        
        // Fermer automatiquement la modale
        setEditModalVisible(false);
      }
    } catch (error) {
      console.error("[pickImageAvatar] Erreur:", error);
    } finally {
      setAvatarUploading(false);
    }
  };

  // Lors de la sélection d'un avatar dans l'AvatarLibrary ou autre :
  const handleAvatarSelect = (avatarKey) => {
    setEditData((d) => ({ ...d, avatar: avatarKey, photoURL: "" }));
    setShowAvatarLibrary(false);
  };
  // Lors de la sélection d'une photo de profil :
  const handlePhotoSelect = (photoUrl) => {
    setEditData((d) => ({ ...d, photoURL: photoUrl, avatar: "" }));
  };

  if (!profileFromFirestoreLoaded || !profile?.username) {
    return (
      <ThemedLayout
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}>
        <SkeletonProfile />
      </ThemedLayout>
    );
  }

  if (editModalVisible) {
    console.log("[DEBUG] RENDER MODAL", JSON.stringify(editData));
  }

  return (
    <ThemedLayout style={styles.container}>
      {/* Header du profil */}
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ position: "relative", width: 48, height: 48 }}>
              <ProfileHeaderAvatar
                photoURL={
                  typeof profile?.photoURL === "string" &&
                  profile.photoURL.trim() !== ""
                    ? profile.photoURL
                    : typeof profile?.avatar === "string" &&
                      profile.avatar.startsWith("http")
                    ? profile.avatar
                    : null
                }
                avatar={
                  typeof profile?.avatar === "string" ? profile.avatar : ""
                }
                size={48}
                displayName={
                  typeof profile?.username === "string" &&
                  profile.username.length > 0
                    ? profile.username
                    : typeof user?.displayName === "string" &&
                      user.displayName.length > 0
                    ? user.displayName
                    : typeof user?.email === "string" && user.email.length > 0
                    ? user.email
                    : "Utilisateur"
                }
                email={
                  typeof user?.email === "string"
                    ? user.email
                    : "user@example.com"
                }
              />
              <View
                style={{
                  position: "absolute",
                  bottom: 2,
                  right: 2,
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: "#4cd137", // ou rouge si offline
                  borderWidth: 2,
                  borderColor: "#fff",
                }}
              />
            </View>
            <Text style={[styles.userName, { marginLeft: 14 }]}>
              {profile?.username}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleOpenSettings}
            style={{
              marginLeft: 12,
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: 20,
              width: 40,
              height: 40,
              justifyContent: "center",
              alignItems: "center",
            }}>
            <Ionicons name='settings-outline' size={24} color='#fff' />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Onglets */}
      <View style={[styles.tabsContainer, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "profile" && styles.activeTab]}
          onPress={() => setActiveTab("profile")}>
          <Text
            style={[
              styles.tabText,
              { color: theme.text },
              activeTab === "profile" && { color: theme.primary },
            ]}>
            Profil
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "stat" && styles.activeTab]}
          onPress={() => setActiveTab("stat")}>
          <Text
            style={[
              styles.tabText,
              { color: theme.text },
              activeTab === "stat" && { color: theme.primary },
            ]}>
            Statistique
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "leaderboard" && styles.activeTab]}
          onPress={() => setActiveTab("leaderboard")}>
          <Text
            style={[
              styles.tabText,
              { color: theme.text },
              activeTab === "leaderboard" && { color: theme.primary },
            ]}>
            Classement
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "leaderboard" ? (
        <LeaderboardProfil
          userId={user?.id}
          gameColor='#667eea'
          showUserPosition={true}
          isProfileView={true}
          profile={profile}
        />
      ) : (
        <ScrollView style={[styles.content, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
          {activeTab === "profile" ? (
            <ProfileTab
              user={user}
              profile={profile}
              profilePhoto={profilePhoto}
              profileBanner={profile?.bannerImage}
              bannerColor={profile?.bannerColor}
              countries={countries}
              userStats={userStats}
              openEditModal={openEditModal}
              onLogout={handleLogout}
            />
          ) : (
            <>
              <ProfileStats
                userStats={userStats}
                statsByGame={userStatsByGameForStatsTab}
                statsLoading={false}
                gameColor='#667eea'
                generateAllGamesTestData={generateAllGamesTestData}
              />
            </>
          )}
        </ScrollView>
      )}

      {/* Modal d'édition du profil */}
      <Modal visible={editModalVisible} animationType='slide' transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.3)",
            justifyContent: "center",
            alignItems: "center",
          }}>
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 18,
              padding: 24,
              width: "85%",
            }}>
            <Text
              style={{ fontWeight: "bold", fontSize: 18, marginBottom: 12, color: theme.text }}>
              Modifier le profil
            </Text>
            <View
              style={{
                alignItems: "center",
                marginBottom: 18,
                width: "100%",
              }}>
              {/* Titre bannière */}
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 16,
                  marginBottom: 8,
                  alignSelf: "flex-start",
                  color: theme.text
                }}>
                Bannière
              </Text>
              {/* Aperçu de la bannière */}
              {editData.bannerImage ? (
                <View
                  style={{
                    position: "relative",
                    width: "100%",
                    height: 100,
                    marginBottom: 10,
                    borderWidth: 2,
                    borderColor: theme.border,
                    borderStyle: "dashed",
                    borderRadius: 0,
                    overflow: "hidden",
                  }}>
                  <Image
                    source={{ uri: editData.bannerImage }}
                    style={{ width: "100%", height: "100%", borderRadius: 12 }}
                    resizeMode='cover'
                  />
                  {bannerUploading && (
                    <View
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "rgba(255,255,255,0.5)",
                        zIndex: 2,
                      }}>
                      <ActivityIndicator size='large' color='#667eea' />
                    </View>
                  )}
                </View>
              ) : editData.bannerColor ? (
                <View
                  style={{
                    position: "relative",
                    width: "100%",
                    height: 100,
                    marginBottom: 10,
                    borderWidth: 2,
                    borderColor: theme.border,
                    borderStyle: "dashed",
                    borderRadius: 0,
                    overflow: "hidden",
                  }}>
                  <View
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: 12,
                      backgroundColor: editData.bannerColor,
                    }}
                  />
                  {bannerUploading && (
                    <View
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "rgba(255,255,255,0.5)",
                        zIndex: 2,
                      }}>
                      <ActivityIndicator size='large' color='#667eea' />
                    </View>
                  )}
                </View>
              ) : null}
              {/* Ligne image + couleur */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  marginBottom: 8,
                }}>
                {/* Bouton upload image */}
                <View style={{ marginRight: 15 }}>
                  <Button
                    title='Uploader une image'
                    onPress={pickImageBanner}
                    color='#667eea'
                  />
                </View>
                {/* Champ couleur + palette */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}>
                  <TextInput
                    value={bannerHex}
                    onChangeText={(v) => {
                      setBannerHex(v);
                      if (/^#([0-9A-Fa-f]{6})$/.test(v)) {
                        setEditData((d) => ({
                          ...d,
                          bannerColor: v,
                          bannerImage: null,
                        }));
                      }
                    }}
                    maxLength={7}
                    style={{
                      borderWidth: 1,
                      borderColor: /^#([0-9A-Fa-f]{6})$/.test(bannerHex)
                        ? "#667eea"
                        : "#ccc",
                      borderRadius: 8,
                      padding: 6,
                      width: 100,
                      textAlign: "center",
                      fontSize: 15,
                      backgroundColor: theme.surface,
                      color: theme.text,
                    }}
                    autoCapitalize='none'
                    autoCorrect={false}
                    placeholder='#RRGGBB'
                    placeholderTextColor={theme.placeholder}
                  />
                  <TouchableOpacity
                    onPress={() => setShowColorWheel((v) => !v)}
                    style={{ marginLeft: 4 }}>
                    <Ionicons name='color-palette' size={24} color='#667eea' />
                  </TouchableOpacity>
                </View>
              </View>
              {showColorWheel && (
                <Modal visible transparent animationType='fade'>
                  <TouchableWithoutFeedback
                    onPress={() => setShowColorWheel(false)}>
                    <View
                      style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.25)",
                        justifyContent: "center",
                        alignItems: "center",
                      }}>
                      <TouchableWithoutFeedback>
                        <View
                          style={{
                            backgroundColor: theme.card,
                            borderRadius: 22,
                            padding: 16,
                            alignItems: "center",
                            elevation: 10,
                            maxWidth: 260,
                            width: "92%",
                            aspectRatio: 1,
                            minHeight: 260,
                            shadowColor: "#000",
                            shadowOpacity: 0.15,
                            shadowRadius: 16,
                            shadowOffset: { width: 0, height: 4 },
                          }}>
                          <View
                            style={{
                              width: "100%",
                              flexDirection: "row",
                              justifyContent: "flex-end",
                            }}>
                            <TouchableOpacity
                              onPress={() => setShowColorWheel(false)}>
                              <Ionicons
                                name='close'
                                size={26}
                                color='#667eea'
                              />
                            </TouchableOpacity>
                          </View>
                          <View
                            style={{
                              flex: 1,
                              justifyContent: "center",
                              alignItems: "center",
                              width: "100%",
                            }}>
                            <WheelColorPicker
                              color={editData.bannerColor || "#fff"}
                              onColorChangeComplete={(color) => {
                                setEditData((d) => ({
                                  ...d,
                                  bannerColor: color,
                                  bannerImage: null,
                                }));
                                setBannerHex(color);
                              }}
                              thumbStyle={{
                                borderWidth: 2,
                                borderColor: "#667eea",
                              }}
                              sliderHidden={false}
                              style={{
                                width: 180,
                                height: 180,
                                marginTop: 8,
                                marginBottom: 8,
                              }}
                            />
                          </View>
                        </View>
                      </TouchableWithoutFeedback>
                    </View>
                  </TouchableWithoutFeedback>
                </Modal>
              )}
              {/* Bouton supprimer la bannière */}
              {(editData.bannerImage || editData.bannerColor) && (
                <TouchableOpacity
                  onPress={() => {
                    setEditData((d) => ({
                      ...d,
                      bannerImage: null,
                      bannerColor: null,
                    }));
                  }}
                  style={{
                    marginTop: 8,
                    marginBottom: 12,
                    alignSelf: "flex-start",
                  }}>
                  <Text style={{ color: "#FF6B6B", fontSize: 13 }}>
                    Supprimer la bannière
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              placeholder="Nom d'utilisateur"
              value={editData.username}
              onChangeText={(v) => setEditData((d) => ({ ...d, username: v }))}
              style={{
                borderBottomWidth: 1,
                borderColor: "#ccc",
                marginBottom: 12,
                fontSize: 16,
                color: theme.text,
              }}
              placeholderTextColor={theme.placeholder}
            />
            <TextInput
              placeholder='Bio'
              value={editData.bio}
              onChangeText={(v) => setEditData((d) => ({ ...d, bio: v }))}
              style={{
                borderBottomWidth: 1,
                borderColor: "#ccc",
                marginBottom: 12,
                fontSize: 16,
                color: theme.text,
              }}
              placeholderTextColor={theme.placeholder}
              multiline
            />
            <Text style={{ marginBottom: 4, fontWeight: "bold", color: theme.text }}>Pays</Text>
            <Picker
              selectedValue={editData.country}
              onValueChange={(v) => setEditData((d) => ({ ...d, country: v }))}
              style={{
                backgroundColor: theme.surface,
                borderRadius: 12,
                marginBottom: 16,
                color: theme.text,
              }}>
              <Picker.Item label='Choisir un pays...' value='' />
              {countries.map((c) => (
                <Picker.Item
                  key={c.code}
                  label={`${c.flag} ${c.name}`}
                  value={c.code}
                />
              ))}
            </Picker>
            {/* Section Avatar dans la modale d'édition du profil */}
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 16,
                marginBottom: 8,
                alignSelf: "flex-start",
                marginTop: 18,
                color: theme.text,
              }}>
              Avatar
            </Text>
            {showAvatarLibrary && (
              <AvatarLibrary onSelect={handleAvatarSelect} />
            )}
            {/* Aperçu de l'avatar/photo : */}
            <View style={{ position: "relative", alignSelf: "center" }}>
              {editData.photoURL ? (
                <Image
                  source={{ uri: editData.photoURL }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    alignSelf: "center",
                    marginVertical: 8,
                  }}
                />
              ) : editData.avatar && editData.avatar.startsWith("http") ? (
                <Image
                  source={{ uri: editData.avatar }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    alignSelf: "center",
                    marginVertical: 8,
                  }}
                />
              ) : editData.avatar && editData.avatar.length === 1 ? (
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: "#bbb",
                    justifyContent: "center",
                    alignItems: "center",
                    alignSelf: "center",
                    marginVertical: 8,
                  }}>
                  <Text
                    style={{ color: "#fff", fontSize: 40, fontWeight: "bold" }}>
                    {editData.avatar}
                  </Text>
                </View>
              ) : null}
              {avatarUploading && (
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(255,255,255,0.5)",
                    zIndex: 2,
                  }}>
                  <ActivityIndicator size='large' color='#667eea' />
                </View>
              )}
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 12,
              }}>
              <Button
                title={
                  editData.photoURL && editData.photoURL.startsWith("http")
                    ? "Changer l'image"
                    : "Uploader une image"
                }
                onPress={pickImageAvatar}
              />
              <Button
                title='Choisir un avatar'
                onPress={() => setShowAvatarLibrary((v) => !v)}
                color='#667eea'
              />
            </View>
            {((typeof editData.photoURL === "string" &&
              editData.photoURL.trim().startsWith("http")) ||
              (typeof editData.avatar === "string" &&
                editData.avatar.trim().startsWith("http"))) && (
              <TouchableOpacity
                onPress={() => {
                  setEditData((d) => ({
                    ...d,
                    photoURL: "",
                    avatar: "",
                  }));
                }}
                style={{
                  marginTop: 8,
                  marginBottom: 12,
                  alignSelf: "flex-start",
                }}>
                <Text style={{ color: "#FF6B6B", fontSize: 13 }}>
                  Supprimer l'avatar
                </Text>
              </TouchableOpacity>
            )}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 10,
              }}>
              <Button
                title='Annuler'
                color='#aaa'
                onPress={() => {
                  setEditModalVisible(false);
                  setShowAvatarLibrary(false);
                }}
              />
              <Button
                title='Enregistrer'
                color='#667eea'
                onPress={async () => {
                  setEditModalVisible(false);
                  await handleSaveProfile();
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
      {(bannerUploading || avatarUploading) && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255,255,255,0.6)",
            zIndex: 9999,
            justifyContent: "center",
            alignItems: "center",
          }}>
          <ActivityIndicator size='large' color='#667eea' />
        </View>
      )}
    </ThemedLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 15,
  },
  avatar: {
    fontSize: 50,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#fff",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  userLevel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 5,
  },
  badges: {
    flexDirection: "row",
    gap: 5,
  },
  settingsButton: {
    padding: 10,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#667eea",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#667eea",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  profileContent: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    alignItems: "center",
    alignSelf: "center",
    width: "100%",
    marginBottom: 18,
    backgroundColor: "transparent",
    shadowColor: "transparent",
    padding: 0,
  },
  statCard: {
    width: (width - 60) / 2,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  detailedStats: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f4",
  },
  statRowLabel: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  statRowValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#667eea",
  },
  quickActions: {
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  testDataContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  testDataButton: {
    backgroundColor: "#667eea",
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  testDataButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  actionButton: {
    alignItems: "center",
    padding: 15,
  },
  actionButtonText: {
    fontSize: 12,
    color: "#667eea",
    marginTop: 5,
    fontWeight: "500",
  },
  leaderboardContent: {
    padding: 20,
  },
  leaderboardHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  leaderboardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },

  customProfileContent: {
    backgroundColor: "#18191c",
    flex: 1,
    padding: 0,
    minHeight: "100%",
  },
  bannerContainer: {
    width: "100%",
    height: 120,
    backgroundColor: "#18191c",
    position: "relative",
    marginBottom: 0,
    overflow: "visible",
  },
  banner: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    backgroundColor: "#18191c",
  },
  profileAvatarWrapper: {
    position: "absolute",
    left: 24,
    bottom: -40,
    zIndex: 2,
    backgroundColor: "#18191c",
    borderRadius: 48,
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#23272a",
    elevation: 6,
  },
  avatarBig: {
    fontSize: 48,
  },
  profileMainCard: {
    backgroundColor: "#23272a",
    borderRadius: 18,
    marginTop: 48,
    marginHorizontal: 16,
    padding: 24,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  profileEditRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  editIcon: {
    marginLeft: 8,
    padding: 4,
  },
  profileUserName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 2,
  },
  profileCountry: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  countryFlag: {
    fontSize: 22,
    marginRight: 6,
  },
  profileBio: {
    fontSize: 15,
    color: "#b9bbbe",
    marginTop: 8,
    textAlign: "left",
    marginBottom: 10,
  },
  profileHint: {
    fontSize: 12,
    color: "#6c757d",
    marginTop: 10,
    textAlign: "center",
  },
  saveButtonFixed: {
    backgroundColor: "#667eea",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 36,
    alignSelf: "center",
    marginTop: 18,
    marginBottom: 10,
    elevation: 4,
    zIndex: 200,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  countryPicker: {
    flex: 1,
    height: 40,
    color: "#333",
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
  },
  bannerEditIconFixed: {
    position: "absolute",
    top: 14,
    right: 18,
    backgroundColor: "rgba(0,0,0,0.85)",
    borderRadius: 20,
    padding: 8,
    zIndex: 100,
    borderWidth: 2,
    borderColor: "#fff",
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#23272a",
    borderRadius: 18,
    padding: 24,
    width: "85%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  modalLabel: {
    color: "#b9bbbe",
    marginBottom: 8,
  },
  colorPreview: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#fff",
  },
  colorPreviewText: {
    color: "#fff",
    fontSize: 15,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginTop: 16,
  },
  uploadButtonText: {
    color: "#667eea",
    fontWeight: "bold",
    marginLeft: 8,
  },
  closeModalButton: {
    marginTop: 18,
  },
  closeModalText: {
    color: "#fff",
    fontSize: 15,
    textDecorationLine: "underline",
  },
  bannerDefault: {
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "#18191c",
    borderRadius: 0,
  },
  playerCardWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#18191c",
    paddingTop: 0,
    paddingBottom: 32,
  },
  bannerBg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: 140,
    zIndex: 1,
  },
  playerCard: {
    width: "92%",
    backgroundColor: "#fff",
    borderRadius: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 80,
    marginBottom: 18,
    zIndex: 2,
  },
  playerAvatarContainer: {
    marginTop: -60,
    marginBottom: 12,
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  playerAvatar: {
    fontSize: 60,
  },
  playerIdentityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  playerName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#23272a",
  },
  playerCountry: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  playerFlag: {
    fontSize: 22,
    marginRight: 4,
  },
  playerCountryName: {
    color: "#23272a",
    fontSize: 14,
  },
  playerStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 18,
    gap: 8,
  },
  playerStatCard: {
    flexBasis: "48%",
    maxWidth: "48%",
    minWidth: 140,
    marginVertical: 8,
    marginHorizontal: 0,
    backgroundColor: "#f8f9fa",
    borderRadius: 14,
    alignItems: "center",
    paddingVertical: 12,
    elevation: 2,
  },
  playerStatValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#23272a",
    marginTop: 2,
  },
  playerStatLabel: {
    fontSize: 11,
    color: "#6c757d",
    marginTop: 1,
  },
  playerBio: {
    fontSize: 15,
    color: "#667eea",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 0,
  },
  playerActionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
    marginTop: 8,
  },
  playerActionButton: {
    alignItems: "center",
    padding: 10,
  },
  playerActionText: {
    fontSize: 12,
    color: "#667eea",
    marginTop: 3,
    fontWeight: "500",
  },
  leaderboardSwitchRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
    gap: 10,
  },
  leaderboardSwitchBtn: {
    backgroundColor: "#f1f3f4",
    borderRadius: 16,
    paddingVertical: 7,
    paddingHorizontal: 18,
    marginHorizontal: 2,
  },
  leaderboardSwitchActive: {
    backgroundColor: "#667eea",
  },
  leaderboardSwitchText: {
    color: "#667eea",
    fontWeight: "bold",
    fontSize: 15,
  },
  leaderboardSwitchTextActive: {
    color: "#fff",
  },
  logoutButton: { marginTop: 30, alignSelf: "center", width: "80%" },
  logoutGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
    paddingVertical: 12,
  },
  logoutButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default ProfileScreen;
