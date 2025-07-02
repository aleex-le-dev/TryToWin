// PaletteColorPicker.js
// Composant maison pour choisir une couleur dans une palette personnalisée
import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Animated,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const DEFAULT_COLORS = [
  "#ffffff",
  "#f8f9fa",
  "#667eea",
  "#764ba2",
  "#FFD700",
  "#4ECDC4",
  "#FF6B6B",
  "#18191c",
  "#23272a",
  "#43e97b",
  "#eeaeca",
  "#a1c4fd",
  "#f7971e",
  "#f953c6",
];

const PaletteColorPicker = ({
  selectedColor,
  onSelect,
  colors = DEFAULT_COLORS,
  style,
}) => {
  const [hex, setHex] = useState(selectedColor || "#ffffff");
  const [showPalette, setShowPalette] = useState(false);
  useEffect(() => {
    setHex(selectedColor || "#ffffff");
  }, [selectedColor]);

  // Animation scale pour chaque pastille
  const scales = colors.map(
    (color) => new Animated.Value(selectedColor === color ? 1.15 : 1)
  );

  const handleSelect = (color, idx) => {
    onSelect(color);
    Animated.spring(scales[idx], {
      toValue: 1.15,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start(() => {
      Animated.spring(scales[idx], {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 8,
      }).start();
    });
    setShowPalette(false); // Ferme la palette après sélection
  };

  // Validation hexadécimal simple
  const isValidHex = (str) => /^#([0-9A-Fa-f]{6})$/.test(str);

  return (
    <View style={[styles.palette, style]}>
      {/* Champ hexadécimal + icône palette */}
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 8,
          justifyContent: "center",
        }}>
        <TextInput
          value={hex}
          onChangeText={(v) => {
            setHex(v);
            if (isValidHex(v)) onSelect(v);
          }}
          maxLength={7}
          style={{
            borderWidth: 1,
            borderColor: isValidHex(hex) ? "#667eea" : "#ccc",
            borderRadius: 8,
            padding: 6,
            width: 100,
            textAlign: "center",
            fontSize: 15,
            marginRight: 8,
            backgroundColor: "#fff",
          }}
          autoCapitalize='none'
          autoCorrect={false}
          placeholder='#RRGGBB'
        />
        <TouchableOpacity onPress={() => setShowPalette((v) => !v)}>
          <Ionicons name='color-palette' size={24} color='#667eea' />
        </TouchableOpacity>
      </View>
      {/* Palette de couleurs animée, affichée seulement si showPalette */}
      {showPalette && (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
          }}>
          {colors.map((color, idx) => (
            <Animated.View
              key={color}
              style={{
                transform: [{ scale: selectedColor === color ? 1.15 : 1 }],
              }}>
              <TouchableOpacity
                style={[
                  styles.swatch,
                  {
                    backgroundColor: color,
                    borderColor:
                      selectedColor === color ? "#667eea" : "#e0e0e0",
                    borderWidth: selectedColor === color ? 3 : 1,
                  },
                ]}
                onPress={() => handleSelect(color, idx)}
                activeOpacity={0.7}>
                {selectedColor === color && (
                  <Ionicons
                    name='checkmark'
                    size={18}
                    color={
                      color === "#18191c" || color === "#23272a"
                        ? "#fff"
                        : "#667eea"
                    }
                  />
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  palette: {
    width: "100%",
    alignItems: "center",
    marginHorizontal: 0,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    margin: 6,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PaletteColorPicker;
