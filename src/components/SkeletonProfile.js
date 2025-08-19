import React, { useRef, useEffect } from "react";
import { View, Animated, Easing } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

/**
 * SkeletonProfile (version carte joueur):
 * - Bannière en haut
 * - Carte joueur plus haute (mêmes arrondis)
 * - Avatar chevauchant la carte
 * - 3 mini-cartes stats (Points / Meilleur jeu / Victoires) en placeholders
 */
const SkeletonProfile = () => {
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

  const baseColor = theme.surface;
  const highlightColor = isDarkMode ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.60)";

  const Block = ({ style }) => (
    <View style={[{ backgroundColor: baseColor, overflow: "hidden", borderRadius: 8 }, style]}>
      <Animated.View
        style={[
          {
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 150,
            backgroundColor: highlightColor,
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

      {/* Carte joueur */}
      <View
        style={{
          width: "92%",
          backgroundColor: theme.card,
          borderRadius: 24,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          alignItems: "center",
          paddingVertical: 20,
          paddingHorizontal: 16,
          marginTop: -135,
          marginBottom: 16,
          elevation: 8,
        }}>
        {/* Avatar */}
        <Block
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            marginTop: -60,
            marginBottom: 10,
            borderWidth: 2,
            borderColor: theme.border,
          }}
        />

        {/* Nom / ligne */}
        <Block style={{ width: 160, height: 22, borderRadius: 8, marginBottom: 8 }} />

        {/* Pays (drapeau + nom) */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <Block style={{ width: 24, height: 18, borderRadius: 4, marginRight: 8 }} />
          <Block style={{ width: 100, height: 14, borderRadius: 6 }} />
        </View>

        {/* Mini-cartes (3) */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={{
                flex: 1,
                backgroundColor: theme.surface,
                borderRadius: 14,
                paddingVertical: 12,
                marginHorizontal: 6,
                alignItems: "center",
                borderWidth: 1,
                borderColor: theme.border,
              }}>
              {/* Icône placeholder */}
              <Block style={{ width: 24, height: 24, borderRadius: 12, marginBottom: 8 }} />
              {/* Valeur */}
              <Block style={{ width: 50, height: 16, borderRadius: 6, marginBottom: 6 }} />
              {/* Libellé */}
              <Block style={{ width: 70, height: 12, borderRadius: 6 }} />
            </View>
          ))}
        </View>

        {/* Bio */}
        <Block style={{ width: "70%", height: 16, borderRadius: 8, marginTop: 16 }} />
      </View>
    </View>
  );
};

export default SkeletonProfile;
