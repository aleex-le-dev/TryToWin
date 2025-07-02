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
import { useAuth } from "../hooks/useAuth";
import { messages } from "../constants/config";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProfileAvatar from "../components/ProfileAvatar";
import * as ImagePicker from "expo-image-picker";
import { uploadProfilePhoto } from "../services/storageService";
import AvatarLibrary from "../components/AvatarLibrary";
import ProfileHeaderAvatar from "../components/ProfileHeaderAvatar";
import ProfileTab from "../components/ProfileTab";
import StatsTab from "../components/StatsTab";
import LeaderboardTab from "../components/LeaderboardTab";
import WheelColorPicker from "react-native-wheel-color-picker";
import SettingsScreen from "./SettingsScreen";

const { width } = Dimensions.get("window");

// Données du classement
const leaderboardData = [
  {
    id: "1",
    username: "AlexGamer",
    rank: 1,
    score: 2847,
    gamesPlayed: 45,
    avatar: "👑",
    isCurrentUser: true,
  },
  {
    id: "2",
    username: "MariePro",
    rank: 2,
    score: 2654,
    gamesPlayed: 38,
    avatar: "🎮",
    isCurrentUser: false,
  },
  {
    id: "3",
    username: "PierreMaster",
    rank: 3,
    score: 2489,
    gamesPlayed: 42,
    avatar: "⚡",
    isCurrentUser: false,
  },
  {
    id: "4",
    username: "SophieWin",
    rank: 4,
    score: 2312,
    gamesPlayed: 35,
    avatar: "🌟",
    isCurrentUser: false,
  },
  {
    id: "5",
    username: "LucasChamp",
    rank: 5,
    score: 2156,
    gamesPlayed: 29,
    avatar: "🏆",
    isCurrentUser: false,
  },
  {
    id: "6",
    username: "EmmaStar",
    rank: 6,
    score: 1987,
    gamesPlayed: 33,
    avatar: "💎",
    isCurrentUser: false,
  },
  {
    id: "7",
    username: "ThomasElite",
    rank: 7,
    score: 1845,
    gamesPlayed: 27,
    avatar: "🔥",
    isCurrentUser: false,
  },
  {
    id: "8",
    username: "JulieQueen",
    rank: 8,
    score: 1723,
    gamesPlayed: 31,
    avatar: "👸",
    isCurrentUser: false,
  },
];

// Liste de pays avec drapeau (emoji)
const countries = [
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "US", name: "États-Unis", flag: "🇺🇸" },
  { code: "DE", name: "Allemagne", flag: "🇩🇪" },
  { code: "ES", name: "Espagne", flag: "🇪🇸" },
  { code: "IT", name: "Italie", flag: "🇮🇹" },
  { code: "GB", name: "Royaume-Uni", flag: "🇬🇧" },
  { code: "MA", name: "Maroc", flag: "🇲🇦" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "JP", name: "Japon", flag: "🇯🇵" },
  { code: "BR", name: "Brésil", flag: "🇧🇷" },
];

// Bannière par défaut (placeholder) via Placeholders.xyz
const DEFAULT_BANNER =
  "https://placeholders.xyz/800x200/667eea/FFFFFF?text=Ma+Banni%C3%A8re";

// Génère un tag unique à 4 chiffres
function generateTag() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Fonction utilitaire pour sauvegarder le profil localement
const saveProfileLocally = async (userId, profileData) => {
  try {
    await AsyncStorage.setItem(
      `profile_${userId}`,
      JSON.stringify(profileData)
    );
    console.log("Profil sauvegardé localement");
  } catch (e) {
    console.log("Erreur lors de la sauvegarde locale du profil", e);
  }
};

// Fonction utilitaire pour charger le profil local
const loadProfileLocally = async (userId) => {
  try {
    const data = await AsyncStorage.getItem(`profile_${userId}`);
    if (data) {
      console.log("Profil chargé depuis le cache local");
      return JSON.parse(data);
    }
  } catch (e) {
    console.log("Erreur lors du chargement du profil local", e);
  }
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
    console.log("Modification ajoutée à la queue de synchronisation");
  } catch (e) {
    console.log("Erreur lors de l'ajout à la queue", e);
  }
};

// Vide la queue locale (après synchro réussie)
const clearProfileQueue = async (userId) => {
  try {
    await AsyncStorage.removeItem(`profile_queue_${userId}`);
    console.log("Queue de synchronisation vidée");
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

// SkeletonProfile custom Expo sans dépendance externe
/**
 * Composant SkeletonProfile : affiche un loader premium avec shimmer animé.
 * Utilisé dans ProfileScreen lors du chargement du profil Firestore.
 */
const SkeletonProfile = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [shimmerAnim]);

  // Dégradé shimmer horizontal
  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-150, 300],
  });

  // Utilitaire pour block skeleton
  const Block = ({ style }) => (
    <View style={[{ backgroundColor: "#e9ecef", overflow: "hidden" }, style]}>
      <Animated.View
        style={[
          {
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 150,
            backgroundColor: "#f4f6fa",
            opacity: 0.6,
            transform: [{ translateX: shimmerTranslate }],
          },
        ]}
      />
    </View>
  );

  return (
    <View style={{ alignItems: "center", width: "100%" }}>
      {/* Bannière */}
      <Block style={{ width: "100%", height: 140, borderRadius: 0 }} />
      {/* Avatar */}
      <Block
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          marginTop: -60,
          marginBottom: 16,
        }}
      />
      {/* Nom */}
      <Block
        style={{ width: 120, height: 22, borderRadius: 8, marginBottom: 10 }}
      />
      {/* Tag */}
      <Block
        style={{ width: 60, height: 16, borderRadius: 8, marginBottom: 18 }}
      />
      {/* Stats (4 blocs) */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "90%",
        }}>
        {[1, 2, 3, 4].map((_, i) => (
          <Block
            key={i}
            style={{
              width: 70,
              height: 60,
              borderRadius: 14,
              marginHorizontal: 6,
            }}
          />
        ))}
      </View>
      {/* Bio */}
      <Block
        style={{ width: "60%", height: 16, borderRadius: 8, marginTop: 18 }}
      />
    </View>
  );
};

// Écran de profil avec classement et statistiques
const ProfileScreen = ({ navigation }) => {
  const { logout, user, loading } = useAuth();
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
  const [leaderboardType, setLeaderboardType] = useState("global");
  const [profile, setProfile] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState({
    username: "",
    avatar: "",
    bio: "",
    country: "",
    bannerColor: null,
    bannerImage: null,
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

  const userStats = {
    totalScore: 2847,
    gamesPlayed: 45,
    gamesWon: 32,
    winRate: 71,
    bestGame: "Memory Game",
    currentStreak: 8,
    totalTime: "12h 34m",
  };

  const leaderboardDataWithCountry = leaderboardData.map((item, idx) => ({
    ...item,
    country: countries[idx % countries.length],
  }));

  const top10Global = leaderboardDataWithCountry.slice(0, 10);
  const top10Country = leaderboardDataWithCountry
    .filter((item) => item.country.code === selectedCountry.code)
    .slice(0, 10);

  // Récupération du profil Firestore à l'ouverture
  useEffect(() => {
    console.log("ProfileScreen - Loading:", loading);
    console.log("ProfileScreen - User state:", user);
    console.log("ProfileScreen - User ID:", user?.id);
    console.log("ProfileScreen - User email:", user?.email);

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
            if (!data.tag) {
              // Génère un tag localement
              const newTag = generateTag();
              console.log("Tag généré localement :", newTag);
              setProfile({ ...data, tag: newTag });
              saveProfileLocally(user.id, { ...data, tag: newTag });
              // Tente de le sauvegarder en BDD (en arrière-plan)
              try {
                await updateDoc(docRef, { tag: newTag });
                console.log("Tag sauvegardé en BDD :", newTag);
              } catch (e) {
                console.log(
                  "Impossible de sauvegarder le tag en BDD (mode hors-ligne ou erreur Firestore)"
                );
                // Ajoute à la queue
                addToProfileQueue(user.id, { tag: newTag });
                setSyncPending(true);
              }
              setProfileFromFirestoreLoaded(true);
            } else {
              setProfile(data);
              saveProfileLocally(user.id, data); // Ecrase le cache local avec la version serveur
              if (data.photoURL) setProfilePhoto(data.photoURL);
              setProfileFromFirestoreLoaded(true);
            }
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
          console.log("Firestore inaccessible, profil local utilisé si dispo");
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
    }
  }, [user, loading]);

  // Ajoute un useEffect pour synchroniser bannerHex avec profile?.bannerColor :
  useEffect(() => {
    if (profile?.bannerColor) {
      setBannerHex(profile.bannerColor);
    } else {
      setBannerHex("#fff");
    }
  }, [profile?.bannerColor]);

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

  const renderLeaderboardItem = ({ item, index }) => (
    <View
      style={[
        styles.leaderboardItem,
        item.isCurrentUser && styles.currentUserItem,
      ]}>
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>#{item.rank}</Text>
        {item.rank <= 3 && (
          <Ionicons
            name='trophy'
            size={16}
            color={
              item.rank === 1
                ? "#FFD700"
                : item.rank === 2
                ? "#C0C0C0"
                : "#CD7F32"
            }
          />
        )}
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.userAvatar}>{item.avatar}</Text>
        <View style={styles.userDetails}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {/* Affiche le drapeau du pays dans le classement mondial */}
            {leaderboardType === "global" && item.country && (
              <Text style={{ fontSize: 18, marginRight: 5 }}>
                {item.country.flag}
              </Text>
            )}
            <Text
              style={[
                styles.username,
                item.isCurrentUser && styles.currentUsername,
              ]}>
              {item.username}
            </Text>
          </View>
          <Text style={styles.userStats}>
            {item.gamesPlayed} parties • {item.score} pts
          </Text>
        </View>
      </View>

      <View style={styles.scoreContainer}>
        <Text
          style={[styles.scoreText, item.isCurrentUser && { color: "#fff" }]}>
          {item.score}
        </Text>
        <Text
          style={[styles.scoreLabel, item.isCurrentUser && { color: "#fff" }]}>
          points
        </Text>
      </View>
    </View>
  );

  const renderStatCard = (icon, value, label, color) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color='#fff' />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  // Ouvre le modal avec les valeurs actuelles
  const openEditModal = () => {
    setShowAvatarLibrary(false);
    console.log("Ouverture modal - User:", user);
    console.log("Ouverture modal - User ID:", user?.id);
    console.log("Ouverture modal - Profile:", profile);

    setEditData({
      username: profile?.username || user?.displayName || "",
      avatar: profile?.avatar || "👑",
      bio: profile?.bio || "",
      country: profile?.country || "",
      bannerColor: profile?.bannerColor || null,
      bannerImage: profile?.bannerImage || null,
    });
    setEditModalVisible(true);
  };

  // Sauvegarde les modifications
  const handleSaveProfile = async () => {
    try {
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

      // Mise à jour Firestore directe (création si besoin)
      const userRef = doc(db, "users", user.id);
      let photoURL = editData.photoURL;
      if (photoURL && photoURL.startsWith("file")) {
        photoURL = await uploadProfilePhoto(user.id, photoURL);
        setProfilePhoto(photoURL);
      }
      await setDoc(
        userRef,
        {
          username: editData.username.trim(),
          avatar: editData.avatar,
          bio: editData.bio,
          country: editData.country,
          photoURL: photoURL || profilePhoto || "",
          bannerColor: editData.bannerColor || null,
          bannerImage: editData.bannerImage || null,
        },
        { merge: true }
      );

      // Mise à jour immédiate de l'état local
      setProfile((prev) => ({
        ...prev,
        ...editData,
        photoURL: photoURL || profilePhoto || "",
      }));
      setProfilePhoto(photoURL || profilePhoto || "");
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data());
        setProfilePhoto(docSnap.data().photoURL || "");
      }
      setEditModalVisible(false);
      Toast.show({
        type: "success",
        text1: "Profil mis à jour",
        position: "top",
        topOffset: 40,
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du profil:", error);
      Toast.show({
        type: "error",
        text1: "Erreur de sauvegarde",
        text2: "Impossible de sauvegarder les modifications",
        position: "top",
        topOffset: 40,
        visibilityTime: 2000,
      });
    }
  };

  const handleOpenSettings = () => {
    navigation.navigate("Settings");
  };

  if (!profileFromFirestoreLoaded || !profile?.username) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#fff",
          justifyContent: "center",
          alignItems: "center",
        }}>
        <SkeletonProfile />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
                photoURL={profilePhoto}
                size={48}
                displayName={profile?.username}
                email={user?.email}
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
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "profile" && styles.activeTab]}
          onPress={() => setActiveTab("profile")}>
          <Text
            style={[
              styles.tabText,
              activeTab === "profile" && styles.activeTabText,
            ]}>
            Profil
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "leaderboard" && styles.activeTab]}
          onPress={() => setActiveTab("leaderboard")}>
          <Text
            style={[
              styles.tabText,
              activeTab === "leaderboard" && styles.activeTabText,
            ]}>
            Classement
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "stat" && styles.activeTab]}
          onPress={() => setActiveTab("stat")}>
          <Text
            style={[
              styles.tabText,
              activeTab === "stat" && styles.activeTabText,
            ]}>
            Statistique
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === "profile" ? (
          <ProfileTab
            user={user}
            profile={profile}
            profilePhoto={profilePhoto}
            profileBanner={profileBanner}
            bannerColor={profile?.bannerColor}
            countries={countries}
            userStats={userStats}
            openEditModal={openEditModal}
            onOpenSettings={undefined}
          />
        ) : activeTab === "leaderboard" ? (
          <LeaderboardTab
            leaderboardType={leaderboardType}
            setLeaderboardType={setLeaderboardType}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
            top10Global={top10Global}
            top10Country={top10Country}
            renderLeaderboardItem={renderLeaderboardItem}
            countries={countries}
          />
        ) : (
          <StatsTab
            userStats={userStats}
            styles={styles}
            renderStatCard={renderStatCard}
          />
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
                backgroundColor: "#fff",
                borderRadius: 18,
                padding: 24,
                width: "85%",
              }}>
              <Text
                style={{ fontWeight: "bold", fontSize: 18, marginBottom: 12 }}>
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
                  }}>
                  Bannière
                </Text>
                {/* Aperçu de la bannière */}
                <View
                  style={{
                    width: "100%",
                    height: 80,
                    borderRadius: 12,
                    marginBottom: 12,
                    backgroundColor: editData.bannerColor || "#fff",
                    overflow: "hidden",
                    justifyContent: "center",
                    alignItems: "center",
                  }}>
                  {editData.bannerImage && (
                    <Image
                      source={{ uri: editData.bannerImage }}
                      style={{ width: "100%", height: 80, resizeMode: "cover" }}
                    />
                  )}
                </View>
                {/* Bouton upload image */}
                <Button
                  title='Télécharger une image'
                  onPress={async () => {
                    const result = await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: ImagePicker.MediaTypeOptions.Images,
                      allowsEditing: true,
                      aspect: [3, 1],
                      quality: 0.7,
                    });
                    if (
                      !result.canceled &&
                      result.assets &&
                      result.assets[0].uri
                    ) {
                      setEditData((d) => ({
                        ...d,
                        bannerImage: result.assets[0].uri,
                        bannerColor: null,
                      }));
                    }
                  }}
                  color='#667eea'
                />
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 12,
                    marginBottom: 8,
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
                      marginRight: 8,
                      backgroundColor: "#fff",
                    }}
                    autoCapitalize='none'
                    autoCorrect={false}
                    placeholder='#RRGGBB'
                  />
                  <TouchableOpacity
                    onPress={() => setShowColorWheel((v) => !v)}>
                    <Ionicons name='color-palette' size={24} color='#667eea' />
                  </TouchableOpacity>
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
                              backgroundColor: "#fff",
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
                    onPress={() =>
                      setEditData((d) => ({
                        ...d,
                        bannerImage: null,
                        bannerColor: null,
                      }))
                    }
                    style={{ marginTop: 8, marginBottom: 12 }}>
                    <Text style={{ color: "#FF6B6B", fontSize: 13 }}>
                      Supprimer la bannière
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                placeholder="Nom d'utilisateur"
                value={editData.username}
                onChangeText={(v) =>
                  setEditData((d) => ({ ...d, username: v }))
                }
                style={{
                  borderBottomWidth: 1,
                  borderColor: "#ccc",
                  marginBottom: 12,
                  fontSize: 16,
                }}
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
                }}
                multiline
              />
              <Text style={{ marginBottom: 4, fontWeight: "bold" }}>Pays</Text>
              <Picker
                selectedValue={editData.country}
                onValueChange={(v) =>
                  setEditData((d) => ({ ...d, country: v }))
                }
                style={{
                  backgroundColor: "#f3f3f3",
                  borderRadius: 12,
                  marginBottom: 16,
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
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}>
                <Button
                  title={
                    editData.photoURL && editData.photoURL.startsWith("http")
                      ? "Changer la photo"
                      : "Choisir une photo"
                  }
                  onPress={async () => {
                    setShowAvatarLibrary(false);
                    const result = await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: ImagePicker.MediaTypeOptions.Images,
                      allowsEditing: true,
                      aspect: [1, 1],
                      quality: 0.7,
                    });
                    if (
                      !result.canceled &&
                      result.assets &&
                      result.assets[0].uri
                    ) {
                      setEditData((d) => ({
                        ...d,
                        photoURL: result.assets[0].uri,
                      }));
                    }
                  }}
                />
                <Button
                  title='Choisir un avatar'
                  onPress={() => setShowAvatarLibrary((v) => !v)}
                  color='#667eea'
                />
              </View>
              {showAvatarLibrary && (
                <AvatarLibrary
                  onSelect={(url) => {
                    setEditData((d) => ({ ...d, photoURL: url }));
                    setShowAvatarLibrary(false);
                  }}
                />
              )}
              {editData.photoURL && (
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
                  onPress={handleSaveProfile}
                />
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
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
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
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
    color: "#6c757d",
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
    backgroundColor: "#fff",
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
    color: "#333",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#6c757d",
    textAlign: "center",
  },
  detailedStats: {
    backgroundColor: "#fff",
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
    color: "#333",
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
    color: "#333",
    marginLeft: 10,
  },
  statRowValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#667eea",
  },
  quickActions: {
    backgroundColor: "#fff",
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
  leaderboardSubtitle: {
    fontSize: 14,
    color: "#6c757d",
  },
  leaderboardList: {
    marginBottom: 20,
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  currentUserItem: {
    backgroundColor: "#667eea",
  },
  rankContainer: {
    width: 40,
    alignItems: "center",
    marginRight: 15,
  },
  rankText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    fontSize: 24,
    marginRight: 10,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  currentUsername: {
    color: "#fff",
  },
  userStats: {
    fontSize: 12,
    color: "#6c757d",
  },
  scoreContainer: {
    alignItems: "center",
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#667eea",
  },
  scoreLabel: {
    fontSize: 10,
    color: "#6c757d",
  },
  leaderboardInfo: {
    backgroundColor: "#fff",
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
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    fontSize: 14,
    color: "#6c757d",
    marginLeft: 10,
    flex: 1,
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
  profileTagRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  profileTag: {
    backgroundColor: "#5865f2",
    color: "#fff",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 13,
    marginRight: 6,
    fontWeight: "bold",
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
  playerTag: {
    backgroundColor: "#667eea",
    color: "#fff",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 13,
    fontWeight: "bold",
    marginLeft: 6,
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
