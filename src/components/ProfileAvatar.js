// Composant ProfileAvatar : affiche la photo de profil (ou fallback) + badge sync
import React from "react";
import { View, Image, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * ProfileAvatar
 * Affiche la photo de profil de l'utilisateur (cercle), ou un avatar par défaut si aucune photo.
 * Affiche un badge de synchronisation cloud si syncPending=true.
 * Props :
 *   - photoURL : string | null (URL de la photo)
 *   - size : number (taille du cercle)
 *   - syncPending : bool (affiche le badge cloud si true)
 */
const ProfileAvatar = ({ photoURL, size = 80, syncPending = false }) => {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: "hidden",
        backgroundColor: "#eee",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
      }}>
      {photoURL ? (
        <Image
          source={{ uri: photoURL }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <Ionicons name='person-circle' size={size} color='#bbb' />
      )}
      {syncPending && (
        <View
          style={{
            position: "absolute",
            bottom: 4,
            right: 4,
            backgroundColor: "#ffb300",
            borderRadius: 8,
            width: 18,
            height: 18,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 2,
            borderColor: "#fff",
          }}>
          <Ionicons name='cloud' size={12} color='#fff' />
        </View>
      )}
    </View>
  );
};

export default ProfileAvatar;
