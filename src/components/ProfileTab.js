// Composant de l'onglet Profil du ProfileScreen
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import ProfileHeaderAvatar from "./ProfileHeaderAvatar";
import { Button } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { gamesData } from "../constants/gamesData";

const ProfileTab = ({
  user,
  profile,
  profilePhoto,
  profileBanner,
  bannerColor,
  countries,
  userStats,
  profileUpdateSuccess,
  openEditModal,
  onLogout,
}) => {
  const fondBanniere = profileBanner
    ? { flex: 1, width: "100%", height: "100%" }
    : {
        flex: 1,
        width: "100%",
        height: "100%",
        backgroundColor: bannerColor || "#fff",
      };

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 24,
        backgroundColor: "#18191c",
      }}>
      {/* Bannière dynamique uniquement en haut */}
      {profileBanner ? (
        <Image
          source={{ uri: profileBanner }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 140,
            zIndex: 1,
            backgroundColor: bannerColor || "#fff",
          }}
          resizeMode='cover'
        />
      ) : (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 140,
            zIndex: 1,
            backgroundColor: bannerColor ? bannerColor : "#fff",
          }}
        />
      )}
      {/* Fond blanc sur la moitié haute - SUPPRIMÉ */}
      {/* Fond noir sur la moitié basse - SUPPRIMÉ car tout le fond est noir */}
      {/* Bannière en arrière-plan, en haut */}
      {/* Carte de joueur principale en overlay */}
      <View
        style={{
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
        }}>
        {/* Bouton modifier le profil en haut à droite */}
        <TouchableOpacity
          onPress={openEditModal}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            backgroundColor: "#667eea",
            borderRadius: 20,
            width: 36,
            height: 36,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.14,
            shadowRadius: 4,
            elevation: 5,
            zIndex: 10,
          }}>
          <MaterialCommunityIcons name='pencil' size={18} color='#fff' />
        </TouchableOpacity>
        {/* Avatar circulaire mis en avant, débordant */}
        <View
          style={{
            marginTop: -50,
            marginBottom: 6,
            width: 100,
            height: 100,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3,
          }}>
          <ProfileHeaderAvatar
            photoURL={
              profile?.avatar && profile.avatar.startsWith("http")
                ? profile.avatar
                : null
            }
            size={100}
            displayName={profile?.username || user?.displayName}
            email={user?.email}
          />
        </View>
        {/* Pseudo, tag et pays dynamiques */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 4,
            gap: 6,
          }}>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: "#23272a" }}>
            {profile?.username || user?.displayName || "Utilisateur"}
          </Text>
          <Text
            style={{
              backgroundColor: "#667eea",
              color: "#fff",
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 2,
              fontSize: 13,
              fontWeight: "bold",
              marginLeft: 6,
            }}>
            #{profile?.tag || "----"}
          </Text>
        </View>
        {/* Pays dynamique (drapeau + nom) */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginLeft: 6,
          }}>
          <Text style={{ fontSize: 22, marginRight: 4 }}>
            {countries.find((c) => c.code === profile?.country)?.flag || "🌍"}
          </Text>
          <Text style={{ color: "#23272a", fontSize: 14 }}>
            {countries.find((c) => c.code === profile?.country)?.name ||
              "Pays inconnu"}
          </Text>
        </View>
        {/* Statistiques clés sous forme de mini-cartes */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            width: "100%",
            marginVertical: 8,
            gap: 4,
          }}>
          <View
            style={{
              flex: 1,
              backgroundColor: "#f8f9fa",
              borderRadius: 14,
              alignItems: "center",
              paddingVertical: 12,
              margin: 8,
              elevation: 2,
            }}>
            <Ionicons name='trophy' size={20} color='#FFD700' />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#23272a",
                marginTop: 2,
              }}>
              {userStats.totalScore}
            </Text>
            <Text style={{ fontSize: 11, color: "#6c757d", marginTop: 1 }}>
              Points
            </Text>
          </View>
          {/* Meilleur jeu */}
          <View
            style={{
              flex: 1,
              backgroundColor: "#f8f9fa",
              borderRadius: 14,
              alignItems: "center",
              paddingVertical: 12,
              margin: 8,
              elevation: 2,
            }}>
            <View style={{ height: 8 }} />
            {/* Affichage conditionnel emoji ou image pour le meilleur jeu */}
            {(() => {
              // Si l'utilisateur a des points, il a forcément un meilleur jeu
              if (userStats.totalScore > 0 && userStats.bestGame) {
                const gameData = gamesData.find((g) => g.id === userStats.bestGame);
                if (gameData) {
                  const img = gameData.image;
                  if (typeof img === "string") {
                    return (
                      <Text
                        style={{
                          fontSize: 24,
                          fontWeight: "bold",
                          color: "#23272a",
                          marginBottom: 10,
                        }}>
                        {img}
                      </Text>
                    );
                  }
                  return (
                    <Image
                      source={img}
                      style={{ width: 32, height: 32, marginBottom: 10 }}
                      resizeMode='contain'
                    />
                  );
                }
              }
              // Si pas de points ou pas de meilleur jeu, ne rien afficher
              return null;
            })()}
            <Text style={{ fontSize: 11, color: "#6c757d" }}>
              {userStats.totalScore > 0 && userStats.bestGame ? "Meilleur jeu" : ""}
            </Text>
          </View>

          {/* Victoire */}
          <View
            style={{
              flex: 1,
              backgroundColor: "#f8f9fa",
              borderRadius: 14,
              alignItems: "center",
              paddingVertical: 12,
              margin: 8,
              elevation: 2,
            }}>
            <Ionicons name='trending-up' size={20} color='#96CEB4' />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#23272a",
                marginTop: 2,
              }}>
              {userStats.winRate}%
            </Text>
            <Text style={{ fontSize: 11, color: "#6c757d", marginTop: 1 }}>
              Victoires
            </Text>
          </View>
        </View>
        {/* Bio du joueur */}
        <Text
          style={{
            fontSize: 15,
            color: "#667eea",
            fontStyle: "italic",
            textAlign: "center",
            marginTop: 6,
            marginBottom: 20,
          }}>
          {profile?.bio ? `« ${profile.bio} »` : ""}
        </Text>
      </View>
    </View>
  );
};

export default ProfileTab;
