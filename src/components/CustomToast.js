// Composant Toast personnalisé pour notifications harmonisées dans l'app
// Utilisé via le contexte ToastContext, s'affiche en overlay en haut de l'écran
import React, { useEffect, useRef } from "react";
import {
  Animated,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const CustomToast = ({ visible, type = "info", title, message, onHide }) => {
  const translateY = useRef(new Animated.Value(-100)).current;

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

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      <View
        style={[
          styles.toast,
          {
            borderLeftColor:
              type === "success"
                ? "#43e97b"
                : type === "error"
                ? "#ff6b6b"
                : "#667eea",
          },
        ]}>
        <View style={styles.textContainer}>
          <Ionicons
            name={
              type === "success"
                ? "checkmark-circle-outline"
                : type === "error"
                ? "close-circle-outline"
                : "information-circle-outline"
            }
            size={24}
            color={
              type === "success"
                ? "#43e97b"
                : type === "error"
                ? "#ff6b6b"
                : "#667eea"
            }
            style={styles.icon}
          />
          {title ? <Text style={styles.title}>{title}</Text> : null}
          <Text style={styles.message}>{message}</Text>
        </View>
        <TouchableOpacity onPress={onHide} style={styles.closeBtn}>
          <Ionicons name='close' size={20} color='#fff' />
        </TouchableOpacity>
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
    minWidth: 180,
    maxWidth: 340,
    alignSelf: "center",
    marginTop: 40,
    backgroundColor: "#fff",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  icon: { marginRight: 10 },
  textContainer: { flex: 1 },
  title: {
    color: "#23272a",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 2,
  },
  message: { color: "#23272a", fontSize: 15 },
  closeBtn: { marginLeft: 10, padding: 4 },
});

export default CustomToast;
