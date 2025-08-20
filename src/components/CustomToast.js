// Composant Toast personnalisé pour notifications harmonisées dans l'app
// Utilisé via le contexte ToastContext, s'affiche en overlay en haut de l'écran
import React, { useEffect, useRef } from "react";
import {
  Animated,
  View,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

const CustomToast = ({ visible, type = "info", title, message, onHide }) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const { theme } = useTheme();

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
      // Auto-hide après 3s
      const timer = setTimeout(() => onHide && onHide(), 3000);
      return () => clearTimeout(timer);
    } else {
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  const maxToastWidth = Math.min(420, Dimensions.get("window").width - 24);
  const accent = type === "success" ? "#43e97b" : type === "error" ? "#ff6b6b" : (theme.primary || "#667eea");

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      <View
        style={[
          styles.toast,
          {
            borderLeftColor: accent,
            backgroundColor: theme.card,
            borderColor: theme.border,
            maxWidth: maxToastWidth,
            alignSelf: "center",
          },
        ]}>
        <Ionicons
          name={
            type === "success"
              ? "checkmark-circle-outline"
              : type === "error"
              ? "close-circle-outline"
              : "information-circle-outline"
          }
          size={22}
          color={accent}
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          {title && message ? (
            <View>
              <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
              <Text style={[styles.message, { color: theme.text }]}>{message}</Text>
            </View>
          ) : (
            <>
              {title ? <Text style={[styles.title, { color: theme.text }]}>{title}</Text> : null}
              {!!message && <Text style={[styles.message, { color: theme.text }]}>{message}</Text>}
            </>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: "center",
  },
  toast: {
    marginTop: 40,
    backgroundColor: "#fff",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  icon: { marginRight: 10 },
  textContainer: { flexShrink: 1 },
  title: {
    color: "#23272a",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 2,
  },
  message: { color: "#23272a", fontSize: 15 },
});

export default CustomToast;
