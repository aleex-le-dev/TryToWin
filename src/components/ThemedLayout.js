import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

// Composant de layout qui applique automatiquement le thème
const ThemedLayout = ({ children, style, ...props }) => {
  const { theme } = useTheme();

  return (
    <View 
      style={[
        styles.container, 
        { backgroundColor: theme.background },
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ThemedLayout;
