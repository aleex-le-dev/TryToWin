// Composant d'affichage d'un message d'erreur de formulaire
// À placer sous un champ de saisie, avec icône d'alerte et style rouge
// Utilisation : <FormErrorMessage message={errors.email} />

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";

const FormErrorMessage = ({ message }) => {
  if (!message) return null;
  return (
    <View style={styles.container}>
      <Ionicons
        name='alert-circle'
        size={16}
        color={colors.error}
        style={styles.icon}
      />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 0,
    marginBottom: 2,
    marginLeft: 2,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    color: colors.error,
    fontSize: 13,
    fontWeight: "500",
  },
});

export default FormErrorMessage;
