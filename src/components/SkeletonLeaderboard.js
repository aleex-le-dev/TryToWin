import React, { useRef, useEffect } from "react";
import { View, Animated, Easing } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

// Skeleton pour les écrans de classement (profil et jeux)
// Reprend la structure de lignes joueur (rang, avatar, infos, score) sans barre d'onglets
const SkeletonLeaderboard = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const { theme, isDarkMode } = useTheme();

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

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-150, 300],
  });

  const base = theme.surface;
  const highlight = isDarkMode ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.60)";

  const Block = ({ style }) => (
    <View style={[{ backgroundColor: base, overflow: "hidden", borderRadius: 8 }, style]}>
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: 150,
          backgroundColor: highlight,
          transform: [{ translateX: shimmerTranslate }],
        }}
      />
    </View>
  );

  // Ligne d’item joueur (placeholder)
  const Row = () => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.card,
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginVertical: 6,
        marginHorizontal: 2,
        borderWidth: 1,
        borderColor: theme.border,
      }}>
      {/* Rang */}
      <Block style={{ width: 36, height: 18, borderRadius: 6, marginRight: 12 }} />
      {/* Avatar */}
      <Block style={{ width: 40, height: 40, borderRadius: 20 }} />
      {/* Détails */}
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Block style={{ width: 140, height: 14, borderRadius: 6, marginBottom: 6 }} />
        <Block style={{ width: 110, height: 12, borderRadius: 6 }} />
      </View>
      {/* Score */}
      <Block style={{ width: 60, height: 16, borderRadius: 6, marginLeft: 12 }} />
    </View>
  );

  return (
    <View style={{ paddingHorizontal: 16, width: "100%" }}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Row key={i} />
      ))}
    </View>
  );
};

export default SkeletonLeaderboard;
