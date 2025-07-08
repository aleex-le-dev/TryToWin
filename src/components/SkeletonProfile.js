import React, { useRef, useEffect } from "react";
import { View, Animated, Easing } from "react-native";

/**
 * Composant SkeletonProfile : affiche un loader premium avec shimmer animé.
 * Utilisable partout dans l’application.
 */
const SkeletonProfile = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

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

  // Dégradé shimmer horizontal
  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-150, 300],
  });

  // Utilitaire pour block skeleton
  const Block = ({ style }) => (
    <View style={[{ backgroundColor: "#e9ecef", overflow: "hidden" }, style]}>
      <Animated.View
        style={[
          {
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 150,
            backgroundColor: "#f4f6fa",
            opacity: 0.6,
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
      {/* Avatar */}
      <Block
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          marginTop: -60,
          marginBottom: 16,
        }}
      />
      {/* Nom */}
      <Block
        style={{ width: 120, height: 22, borderRadius: 8, marginBottom: 10 }}
      />
      {/* Stats (4 blocs) */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "90%",
        }}>
        {[1, 2, 3, 4].map((_, i) => (
          <Block
            key={i}
            style={{
              width: 70,
              height: 60,
              borderRadius: 14,
              marginHorizontal: 6,
            }}
          />
        ))}
      </View>
      {/* Bio */}
      <Block
        style={{ width: "60%", height: 16, borderRadius: 8, marginTop: 18 }}
      />
    </View>
  );
};

export default SkeletonProfile;
