import React, { useState, useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";

const FirstTurnOverlay = ({
  isVisible,
  playerName,
  playerSymbol,
  onAnimationComplete,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (isVisible) {
      // Animation d'apparition
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Animation de disparition après 2 secondes
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 0.8,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        });
      }, 2000);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
        },
      ]}>
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}>
        <Text style={styles.title}>Premier tour</Text>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{playerName}</Text>
          <Text style={styles.playerSymbol}>{playerSymbol}</Text>
        </View>
        <Text style={styles.subtitle}>commence la partie</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  content: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    minWidth: 200,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#667eea",
    marginBottom: 15,
    textAlign: "center",
  },
  playerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  playerName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginRight: 10,
  },
  playerSymbol: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#667eea",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

export default FirstTurnOverlay;
