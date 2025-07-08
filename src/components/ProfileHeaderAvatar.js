// Composant ProfileHeaderAvatar : affiche la photo de profil (ou fallback moderne) dans le header du profil
// Utilisé dans le header du profil à la place de l'emoji couronne
import React from "react";
import { View, Image, Text } from "react-native";

const COLORS = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#A133FF"];

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

  // Correction stricte : si avatar === '👤', on affiche toujours 👤
  const hasPhoto = typeof photoURL === "string" && photoURL.trim() !== "";
  const showDefaultEmoji = avatar === "👤";

  let renderContent;
  if (hasPhoto) {
    renderContent = (
      <Image
        source={{ uri: photoURL }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  } else if (flagUrl) {
    renderContent = (
      <Image
        source={{ uri: flagUrl }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  } else if (avatar && typeof avatar === "string" && avatar.length === 1) {
    // Emoji avatar
    renderContent = (
      <Text style={{ color: "#fff", fontSize: size / 2, fontWeight: "bold" }}>
        {avatar}
      </Text>
    );
  } else if (
    avatar &&
    typeof avatar === "string" &&
    avatar.startsWith("http")
  ) {
    // Avatar image URL
    renderContent = (
      <Image
        source={{ uri: avatar }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  } else {
    // Fallback : bulle grise avec initiale
    renderContent = (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "#bbb",
          justifyContent: "center",
          alignItems: "center",
        }}>
        <Text style={{ color: "#fff", fontSize: size / 2, fontWeight: "bold" }}>
          {initial}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: "hidden",
        backgroundColor: hasPhoto || flagUrl ? "#eee" : color,
        justifyContent: "center",
        alignItems: "center",
      }}>
      {renderContent}
    </View>
  );
};

export default ProfileHeaderAvatar;
