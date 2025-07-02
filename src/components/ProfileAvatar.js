// Composant ProfileAvatar : affiche la photo de profil (ou fallback)
import React from "react";
import { View, Image, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * ProfileAvatar
 * Affiche la photo de profil de l'utilisateur (cercle), ou un avatar par défaut si aucune photo.
 * Props :
 *   - photoURL : string | null (URL de la photo)
 *   - size : number (taille du cercle)
 */
const ProfileAvatar = ({ photoURL, size = 80 }) => {
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
    </View>
  );
};

export default ProfileAvatar;
