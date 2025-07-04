// GameLayout.js
// Layout commun pour tous les jeux avec header, score, multiplicateur de série et contenu spécifique

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import Toast from "react-native-toast-message";

/**
 * Layout commun pour les jeux
 * @param {Object} props
 * @param {string} props.title - Titre du jeu
 * @param {Object} props.stats - Statistiques du joueur pour le jeu (doit contenir totalPoints)
 * @param {number} props.streak - Série de victoires en cours
 * @param {function} [props.onBack] - Callback retour
 * @param {React.ReactNode} props.children - Contenu spécifique au jeu
 */
const GameLayout = ({ title, stats, streak, onBack, children }) => {
  return (
    <View style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
      {/* Header */}
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={{ paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
          {onBack && (
            <TouchableOpacity style={{ padding: 8 }} onPress={onBack}>
              <Ionicons name='arrow-back' size={24} color='#fff' />
            </TouchableOpacity>
          )}
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "#fff" }}>
            {title}
          </Text>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#fff" }}>
              {stats?.totalPoints || 0}
            </Text>
            <Text style={{ fontSize: 12, color: "#fff", opacity: 0.8 }}>
              points
            </Text>
          </View>
        </View>
      </LinearGradient>
      {/* Contenu spécifique au jeu */}
      <View style={{ flex: 1 }}>{children}</View>
      {/* Toast global pour tous les jeux */}
      <Toast />
    </View>
  );
};

export default GameLayout;
