import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../contexts/ThemeContext';

// Composant qui adapte la barre de statut au thème
const ThemedStatusBar = () => {
  const { isDarkMode } = useTheme();

  return (
    <StatusBar 
      style={isDarkMode ? 'light' : 'dark'} 
    />
  );
};

export default ThemedStatusBar;
