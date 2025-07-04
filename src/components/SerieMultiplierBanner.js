// SerieMultiplierBanner.js
// Composant réutilisable pour afficher le multiplicateur de série actif dans tous les jeux
// Props : streak (number)

import React from "react";
import { View, Text } from "react-native";
import { getSerieMultiplier } from "../constants/gamePoints";

/**
 * Affiche le multiplicateur de série si streak >= 5
 * @param {Object} props
 * @param {number} props.streak - Série de victoires en cours
 */
const SerieMultiplierBanner = ({ streak }) => {
  if (!streak || streak < 5) return null;
  const mult = getSerieMultiplier(streak);
  return (
    <View style={{ alignItems: "center", marginVertical: 8 }}>
      <Text style={{ color: "#4ECDC4", fontWeight: "bold", fontSize: 16 }}>
        🔥 Série : {streak} — Multiplicateur x{(1 + mult).toFixed(2)}
      </Text>
    </View>
  );
};

export default SerieMultiplierBanner;
