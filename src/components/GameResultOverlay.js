import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const GameResultOverlay = ({
  isVisible,
  result, // "win", "lose", "draw"
  points,
  multiplier,
  streak,
  onAnimationComplete,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let timeout;
    if (isVisible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after 3 seconds
      timeout = setTimeout(() => {
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        });
      }, 3000);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const getResultConfig = () => {
    switch (result) {
      case "win":
        return {
          icon: "trophy",
          title:
            multiplier > 0 ? `🔥 Victoire ! Série de ${streak}` : "Victoire !",
          color: "#4CAF50",
          bgColor: "#E8F5E8",
        };
      case "lose":
        return {
          icon: "close-circle",
          title: "Défaite",
          color: "#F44336",
          bgColor: "#FFEBEE",
        };
      case "draw":
        return {
          icon: "remove-circle",
          title: "Match nul",
          color: "#FF9800",
          bgColor: "#FFF3E0",
        };
      default:
        return {
          icon: "help-circle",
          title: "Partie terminée",
          color: "#9E9E9E",
          bgColor: "#F5F5F5",
        };
    }
  };

  const config = getResultConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}>
      <View style={[styles.overlay, { backgroundColor: config.bgColor }]}>
        <View style={styles.iconContainer}>
          <Ionicons name={config.icon} size={48} color={config.color} />
        </View>
        <Text style={[styles.title, { color: config.color }]}>
          {config.title}
        </Text>
        <Text style={styles.points}>
          +{points} points
          {multiplier > 0 && (
            <Text style={styles.multiplier}>
              {" "}
              (x{(1 + multiplier).toFixed(2)})
            </Text>
          )}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  overlay: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
    minWidth: 280,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  points: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  multiplier: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
});

export default GameResultOverlay;
