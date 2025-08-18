import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../utils/firebaseConfig";
import { countries } from "../../constants/countries";
import { gamesData } from "../../constants/gamesData";
import ProfileHeaderAvatar from "../../components/ProfileHeaderAvatar";
import { useAuth } from "../../hooks/useAuth";
import { getUserAllGameStats } from "../../services/scoreService";
import { setDoc, doc as fsDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { deleteDoc } from "firebase/firestore";
import { addFriend as addFriendSvc, blockUser as blockUserSvc, removeFriend as removeFriendSvc } from "../../services/friendsService";
import { isFriend as isFriendSvc, isBlocked as isBlockedSvc } from "../../services/friendsService";

// Écran carte joueur identique à l'onglet profil avec bannière, stats des jeux, bio et bouton Ajouter en ami
const PlayerCardScreen = ({ route, navigation }) => {
  const { userId } = route.params || {};
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [userStats, setUserStats] = useState({
    totalScore: 0,
    gamesPlayed: 0,
    winRate: 0,
    bestGame: null,
  });
  const [isFriend, setIsFriend] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isAddingFriend, setIsAddingFriend] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", userId));
        if (snap.exists()) {
          const data = snap.data();
          setUserData(data);
          // Récupérer les stats réelles
          const allStats = await getUserAllGameStats(userId);
          let totalPoints = allStats.totalPoints || 0;
          let totalGames = allStats.totalGames || 0;
          let wins = allStats.totalWins || 0;
          let winrate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
          // Détecter le meilleur jeu via le score max
          let bestGame = null;
          let bestPts = 0;
          if (allStats.gamesPlayed) {
            for (const [gameId, s] of Object.entries(allStats.gamesPlayed)) {
              const pts = s?.totalPoints || 0;
              if (pts > bestPts) {
                bestPts = pts;
                bestGame = gameId;
              }
            }
          }
          setUserStats({ totalScore: totalPoints, gamesPlayed: totalGames, winRate: winrate, bestGame });
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  // Écoute en temps réel de la relation d'amitié
  useEffect(() => {
    if (!user?.id || !userId || user.id === userId) return;
    const ref = fsDoc(db, 'users', user.id, 'friends', userId);
    const unsub = onSnapshot(ref, (snap) => setIsFriend(snap.exists()));
    return () => unsub();
  }, [user?.id, userId]);

  // Écoute en temps réel du statut bloqué
  useEffect(() => {
    if (!user?.id || !userId || user.id === userId) return;
    const ref = fsDoc(db, 'users', user.id, 'blocked', userId);
    const unsub = onSnapshot(ref, (snap) => setIsBlocked(snap.exists()));
    return () => unsub();
  }, [user?.id, userId]);

  // Vérification initiale robuste (au cas où l’événement snapshot tarderait)
  useEffect(() => {
    (async () => {
      if (!user?.id || !userId || user.id === userId) return;
      try {
        const [f, b] = await Promise.all([
          isFriendSvc(user.id, userId),
          isBlockedSvc(user.id, userId),
        ]);
        setIsFriend(!!f);
        setIsBlocked(!!b);
      } catch {}
    })();
  }, [user?.id, userId]);

  const handleAddFriend = async () => {
    try {
      if (!user?.id || !userId || isFriend || isBlocked || isAddingFriend) return;
      setIsAddingFriend(true);
      const res = await addFriendSvc(user.id, { id: userId, ...userData });
      if (res.ok) {
        setIsFriend(true);
        Toast.show({ type: 'success', text1: res.already ? 'Déjà ami' : 'Ami ajouté', position: 'top', topOffset: 40 });
      } else if (res.reason === 'blocked') {
        Toast.show({ type: 'error', text1: 'Joueur bloqué', text2: 'Débloquez avant d\'ajouter', position: 'top', topOffset: 40 });
      } else {
        Toast.show({ type: 'error', text1: 'Erreur', text2: "Impossible d'ajouter l'ami", position: 'top', topOffset: 40 });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: "Impossible d'ajouter l'ami", position: 'top', topOffset: 40 });
    } finally {
      setIsAddingFriend(false);
    }
  };

  const handleRemoveFriend = async () => {
    try {
      if (!user?.id || !userId) return;
      await removeFriendSvc(user.id, userId);
      Toast.show({ type: 'success', text1: 'Ami supprimé', position: 'top', topOffset: 40 });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: "Impossible de supprimer l'ami", position: 'top', topOffset: 40 });
    }
  };

  const handleBlockUser = async () => {
    try {
      if (!user?.id || !userId) return;
      await blockUserSvc(user.id, { id: userId, ...userData });
      Toast.show({ type: 'success', text1: 'Utilisateur bloqué', position: 'top', topOffset: 40 });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible de bloquer', position: 'top', topOffset: 40 });
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profil du joueur</Text>
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#667eea" />
        </View>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profil du joueur</Text>
        </View>
        <View style={styles.loadingWrap}>
          <Text style={{ color: "#6c757d" }}>Utilisateur introuvable</Text>
        </View>
      </View>
    );
  }

  const fondBanniere = userData.bannerImage
    ? { flex: 1, width: "100%", height: "100%" }
    : {
        flex: 1,
        width: "100%",
        height: "100%",
        backgroundColor: userData.bannerColor || "#fff",
      };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil du joueur</Text>
      </View>
      
      <View style={styles.profileContainer}>
        {/* Bannière dynamique en haut */}
        {userData.bannerImage ? (
          <Image
            source={{ uri: userData.bannerImage }}
            style={styles.banner}
            resizeMode='cover'
          />
        ) : (
          <View
            style={[
              styles.banner,
              { backgroundColor: userData.bannerColor || "#fff" }
            ]}
          />
        )}
        
        {/* Carte de joueur principale en overlay */}
        <View style={styles.playerCard}>
          {/* Avatar circulaire mis en avant, débordant */}
          <View style={styles.avatarContainer}>
            <ProfileHeaderAvatar
              photoURL={
                typeof userData.photoURL === "string" &&
                userData.photoURL.trim() !== ""
                  ? userData.photoURL
                  : null
              }
              avatar={
                typeof userData.photoURL === "string" &&
                userData.photoURL.trim() !== ""
                  ? ""
                  : typeof userData.avatar === "string"
                  ? userData.avatar
                  : ""
              }
              size={100}
              displayName={userData.username || "Joueur"}
              email=""
            />
          </View>
          
          {/* Pseudo */}
          <Text style={styles.playerName}>
            {userData.username || "Joueur"}
          </Text>
          
          {/* Pays dynamique (drapeau + nom) */}
          <View style={styles.countryContainer}>
            <Text style={styles.countryFlag}>
              {countries.find((c) => c.code === userData.country)?.flag || "🌍"}
            </Text>
            <Text style={styles.countryName}>
              {countries.find((c) => c.code === userData.country)?.name || "Pays inconnu"}
            </Text>
          </View>
          
          {/* Statistiques clés sous forme de mini-cartes */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name='trophy' size={20} color='#FFD700' />
              <Text style={styles.statValue}>{userStats.totalScore}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            
            {/* Meilleur jeu */}
            <View style={styles.statCard}>
              <View style={{ height: 8 }} />
              {(() => {
                if (userStats.totalScore > 0 && userStats.bestGame) {
                  const gameData = gamesData.find(
                    (g) => g.id === userStats.bestGame
                  );
                  if (gameData) {
                    const img = gameData.image;
                    if (typeof img === "string") {
                      return (
                        <Text style={styles.gameEmoji}>
                          {img}
                        </Text>
                      );
                    }
                    return (
                      <Image
                        source={img}
                        style={styles.gameImage}
                        resizeMode='contain'
                      />
                    );
                  }
                }
                return (
                  <View style={styles.noGameContainer}>
                    <Text style={styles.noGameText}>
                      Pas de jeux préférés
                    </Text>
                  </View>
                );
              })()}
              <Text style={styles.statLabel}>
                {userStats.totalScore > 0 && userStats.bestGame ? "Meilleur jeu" : ""}
              </Text>
            </View>

            {/* Victoire */}
            <View style={styles.statCard}>
              <Ionicons name='trending-up' size={20} color='#96CEB4' />
              <Text style={styles.statValue}>{userStats.winRate}%</Text>
              <Text style={styles.statLabel}>Victoires</Text>
            </View>
          </View>
          
          {/* Bio du joueur */}
          {userData.bio && (
            <Text style={styles.bio}>
              « {userData.bio} »
            </Text>
          )}
          
          {/* Bouton Ajouter en ami */}
          {user?.id !== userId && !isFriend && !isBlocked && (
            <TouchableOpacity style={[styles.addFriendBtn, isAddingFriend && { opacity: 0.6 }]} onPress={handleAddFriend} disabled={isAddingFriend}>
              <Ionicons name={isAddingFriend ? 'time' : 'person-add'} size={18} color="#fff" />
              <Text style={styles.addFriendText}>{isAddingFriend ? 'Ajout...' : 'Ajouter en ami'}</Text>
            </TouchableOpacity>
          )}
          {user?.id !== userId && isFriend && !isBlocked && (
            <TouchableOpacity
              style={styles.messageBtn}
              onPress={() => navigation.getParent()?.navigate('Social', { initialFriendId: userId })}
            >
              <Ionicons name='chatbubble-ellipses' size={18} color='#fff' />
              <Text style={styles.messageText}>Envoyer un message</Text>
            </TouchableOpacity>
          )}
          {user?.id !== userId && isFriend && !isBlocked && (
            <View style={styles.friendActionsRow}>
              <TouchableOpacity style={[styles.iconOnlyBtn, { backgroundColor: '#FF6B6B' }]} onPress={handleRemoveFriend}>
                <Ionicons name='person-remove' size={20} color='#fff' />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconOnlyBtn, { backgroundColor: '#999' }]} onPress={handleBlockUser}>
                <Ionicons name='hand-left' size={20} color='#fff' />
              </TouchableOpacity>
            </View>
          )}
          {user?.id !== userId && isBlocked && (
            <View style={styles.blockedBadge}>
              <Ionicons name='lock-closed' size={16} color='#fff' />
              <Text style={styles.blockedText}>Joueur bloqué</Text>
            </View>
          )}
        </View>
      </View>
      
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#18191c" 
  },
  header: {
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: "#667eea",
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: { 
    padding: 6, 
    marginRight: 8 
  },
  headerTitle: { 
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: 18 
  },
  loadingWrap: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center" 
  },
  profileContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 24,
  },
  banner: {
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
    paddingVertical: 16,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 60,
    marginBottom: 10,
    zIndex: 2,
    alignSelf: "center",
  },
  avatarContainer: {
    marginTop: -50,
    marginBottom: 6,
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  playerName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#23272a",
    marginBottom: 4,
  },
  countryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  countryFlag: {
    fontSize: 22,
    marginRight: 4,
  },
  countryName: {
    color: "#23272a",
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 8,
    gap: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 14,
    alignItems: "center",
    paddingVertical: 12,
    margin: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#23272a",
    marginTop: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#6c757d",
    marginTop: 1,
  },
  gameEmoji: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#23272a",
    marginBottom: 10,
  },
  gameImage: {
    width: 32,
    height: 32,
    marginBottom: 10,
  },
  noGameContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 32,
  },
  noGameText: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 10,
    textAlign: "center",
  },
  bio: {
    fontSize: 15,
    color: "#667eea",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
  },
  addFriendBtn: {
    backgroundColor: "#667eea",
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addFriendText: {
    color: "#fff",
    fontWeight: "bold",
  },
  messageBtn: {
    marginTop: 10,
    backgroundColor: '#667eea',
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  messageText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  friendActionsRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
  },
  iconOnlyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockedBadge: {
    marginTop: 10,
    backgroundColor: '#FF6B6B',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  blockedText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default PlayerCardScreen;


