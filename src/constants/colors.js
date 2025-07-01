// Constantes de couleurs pour l'application
// Centralise toutes les couleurs utilisées dans l'app

export const colors = {
  // Couleurs principales
  primary: "#667eea",
  primaryDark: "#5a6fd8",
  primaryLight: "#7c8ff0",

  // Couleurs secondaires
  secondary: "#ff6b6b",
  secondaryDark: "#ee5a24",
  secondaryLight: "#ff8a80",

  // Couleurs d'accent
  accent: "#4ecdc4",
  accentDark: "#44a08d",
  accentLight: "#6ee7df",

  // Couleurs de fond
  background: "#f8f9fa",
  backgroundDark: "#2c3e50",
  surface: "#ffffff",
  surfaceDark: "#34495e",

  // Couleurs de texte
  text: "#2c3e50",
  textLight: "#7f8c8d",
  textDark: "#1a252f",
  textInverse: "#ffffff",

  // Couleurs d'état
  success: "#27ae60",
  warning: "#f39c12",
  error: "#e74c3c",
  info: "#3498db",

  // Couleurs de bordure
  border: "#e9ecef",
  borderDark: "#495057",

  // Couleurs d'ombre
  shadow: "rgba(0, 0, 0, 0.1)",
  shadowDark: "rgba(0, 0, 0, 0.3)",

  // Couleurs de transparence
  overlay: "rgba(0, 0, 0, 0.5)",
  overlayLight: "rgba(255, 255, 255, 0.9)",
};

// Gradients prédéfinis
export const gradients = {
  primary: ["#667eea", "#764ba2"],
  secondary: ["#ff6b6b", "#ee5a24"],
  accent: ["#4ecdc4", "#44a08d"],
  sunset: ["#ff9a9e", "#fecfef"],
  ocean: ["#667eea", "#764ba2"],
  forest: ["#11998e", "#38ef7d"],
};

// Couleurs pour les thèmes
export const themes = {
  light: {
    background: colors.background,
    surface: colors.surface,
    text: colors.text,
    textSecondary: colors.textLight,
    border: colors.border,
  },
  dark: {
    background: colors.backgroundDark,
    surface: colors.surfaceDark,
    text: colors.textInverse,
    textSecondary: colors.textLight,
    border: colors.borderDark,
  },
};
