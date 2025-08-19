import { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// Hook pour créer des styles adaptatifs au thème
export const useThemedStyles = (styleCreator) => {
  const { theme } = useTheme();
  
  return useMemo(() => {
    return styleCreator(theme);
  }, [theme, styleCreator]);
};

// Hook pour obtenir des couleurs spécifiques du thème
export const useThemedColors = () => {
  const { theme } = useTheme();
  
  return {
    ...theme,
    // Couleurs d'accent spécifiques
    primaryLight: theme.isDarkMode ? '#8b9bda' : '#5a6bc7',
    primaryDark: theme.isDarkMode ? '#5a6bc7' : '#8b9bda',
  };
};
