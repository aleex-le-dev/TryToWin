// Composant ProfileHeaderAvatar : affiche la photo de profil (ou fallback moderne) dans le header du profil
// Utilisé dans le header du profil à la place de l'emoji couronne
import React from "react";
import { View, Image, Text } from "react-native";

const COLORS = ["#667eea", "#45B7D1", "#FF6B6B", "#4ECDC4", "#FFD700"];

function getRandomColor(email) {
  if (!email) return COLORS[0];
  let sum = 0;
  for (let i = 0; i < email.length; i++) sum += email.charCodeAt(i);
  return COLORS[sum % COLORS.length];
}

/**
 * Affiche la photo de profil dans le header du profil.
 * Props :
 *   - photoURL : string | null (URL de la photo)
 *   - size : number (par défaut 48)
 *   - displayName : string (nom à afficher pour l'initiale)
 *   - email : string (pour couleur stable)
 *   - avatar : string | null (avatar type flag-xx)
 */
const ProfileHeaderAvatar = ({
  photoURL,
  size = 48,
  displayName,
  email,
  avatar,
}) => {
  const color = getRandomColor(email);
  const initial = (displayName || email || "U")[0].toUpperCase();

  // Gestion drapeau
  let flagUrl = null;
  if (avatar && typeof avatar === "string" && avatar.startsWith("flag-")) {
    const code = avatar.replace("flag-", "").toLowerCase();
    flagUrl = `https://flagcdn.com/w80/${code}.png`;
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: "hidden",
        backgroundColor: photoURL || flagUrl ? "#eee" : color,
        justifyContent: "center",
        alignItems: "center",
      }}>
      {photoURL ? (
        <Image
          source={{ uri: photoURL }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : flagUrl ? (
        <Image
          source={{ uri: flagUrl }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <Text style={{ color: "#fff", fontSize: size / 2, fontWeight: "bold" }}>
          {initial}
        </Text>
      )}
    </View>
  );
};

export default ProfileHeaderAvatar;
