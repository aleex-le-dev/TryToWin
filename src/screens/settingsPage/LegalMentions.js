import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from "../../contexts/ThemeContext";

const LegalMentions = ({ navigation }) => {
  const { theme } = useTheme();
  return (
  <View style={[styles.container, { backgroundColor: theme.background }]}> 
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name='arrow-back' size={22} color={theme.icon} />
      </TouchableOpacity>
      <Text style={[styles.title, { color: theme.text }]}>Mentions légales</Text>
    </View>
    <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Éditeur de l'application</Text>
        <Text style={[styles.paragraph, { color: theme.text } ]}>TryToWin — Application mobile de jeux et classements.</Text>
        <Text style={[styles.paragraph, { color: theme.text } ]}>Contact légal: alexandre.janacek@gmail.com</Text>
        <Text style={[styles.paragraph, { color: theme.text } ]}>Adresse: 27 rue d'Auchel, 62190 Lière, France</Text>
        <Text style={[styles.paragraph, { color: theme.text } ]}>Directeur de la publication: Alexandre Janacek</Text>
      </View>
      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Hébergeur</Text>
        <Text style={[styles.paragraph, { color: theme.text } ]}>Google Cloud / Firebase — Google Ireland Ltd., Gordon House, Barrow Street, Dublin 4, Irlande.</Text>
      </View>
      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Propriété intellectuelle</Text>
        <Text style={[styles.paragraph, { color: theme.text } ]}>L'ensemble des contenus (textes, visuels, logos, marques) est protégé. Toute reproduction, représentation, modification ou diffusion non autorisée est interdite.</Text>
      </View>
      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Responsabilité</Text>
        <Text style={[styles.paragraph, { color: theme.text } ]}>TryToWin s'efforce d'assurer l'exactitude et la disponibilité du service. L'éditeur ne saurait être tenu responsable des dommages résultant d'une indisponibilité, d'un usage non conforme ou de contenus publiés par des tiers.</Text>
      </View>
      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Données personnelles</Text>
        <Text style={[styles.paragraph, { color: theme.text } ]}>Le traitement des données est décrit dans la Politique de confidentialité accessible depuis l'application. Conformément au RGPD, vous disposez de droits sur vos données (accès, rectification, suppression, etc.).</Text>
      </View>
      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Signalement & contact</Text>
        <Text style={[styles.paragraph, { color: theme.text } ]}>Pour toute question, réclamation ou signalement de contenu, contactez: support@trytowin.app. Nous répondons dans les meilleurs délais.</Text>
      </View>
    </ScrollView>
  </View>
);
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingBottom: 12, paddingTop: 50 },
  backBtn: { marginRight: 10, padding: 4 },
  title: { color: '#23272a', fontSize: 22, fontWeight: 'bold' },
  card: { backgroundColor: '#f8f9fa', marginHorizontal: 16, marginTop: 12, borderRadius: 14, padding: 16 },
  cardTitle: { color: '#23272a', fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  paragraph: { color: '#23272a', fontSize: 14 },
});

export default LegalMentions;


