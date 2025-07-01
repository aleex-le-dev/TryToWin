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
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const icons = {
  success: "checkmark-circle-outline",
  error: "close-circle-outline",
  info: "information-circle-outline",
};
const gradients = {
  success: ["#43e97b", "#38f9d7"],
  error: ["#fa709a", "#fee140"],
  info: ["#667eea", "#764ba2"],
};

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
      <LinearGradient
        colors={gradients[type] || gradients.info}
        style={styles.toast}>
        <Ionicons
          name={icons[type] || icons.info}
          size={28}
          color='#fff'
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          <Text style={styles.message}>{message}</Text>
        </View>
        <TouchableOpacity onPress={onHide} style={styles.closeBtn}>
          <Ionicons name='close' size={20} color='#fff' />
        </TouchableOpacity>
      </LinearGradient>
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
    flexDirection: "row",
    alignItems: "center",
    minWidth: "80%",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: { marginRight: 12 },
  textContainer: { flex: 1 },
  title: { color: "#fff", fontWeight: "bold", fontSize: 16, marginBottom: 2 },
  message: { color: "#fff", fontSize: 15 },
  closeBtn: { marginLeft: 10, padding: 4 },
});

export default CustomToast;
