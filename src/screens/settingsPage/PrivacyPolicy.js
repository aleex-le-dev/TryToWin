import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from "../../contexts/ThemeContext";

const PrivacyPolicy = ({ navigation }) => {
  const { theme } = useTheme();
  return (
  <View style={[styles.container, { backgroundColor: theme.background }]}> 
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name='arrow-back' size={22} color={theme.icon} />
      </TouchableOpacity>
      <Text style={[styles.title, { color: theme.text }]}>Politique de confidentialité</Text>
    </View>
    <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
      <View style={styles.card}>
        <Text style={[styles.paragraph, { color: theme.text }]}>
          Nous attachons une importance essentielle à la protection de vos données. Cette politique présente clairement quelles informations nous collectons, dans quel but, pendant combien de temps nous les conservons et avec qui elles peuvent être partagées. Elle détaille également les mesures de sécurité mises en place et vos droits, conformément au RGPD.
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Données et finalités</Text>
        <Text style={[styles.paragraph, { color: theme.text }]}>
          Nous traitons des données de profil (nom d’utilisateur, avatar, pays), vos identifiants de compte (email), vos scores et interactions sociales. Ces informations sont utilisées pour assurer le fonctionnement de l’application, personnaliser l’expérience (classements, statistiques) et garantir la sécurité (prévention des abus, lutte contre la fraude).
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Durée & destinataires</Text>
        <Text style={[styles.paragraph, { color: theme.text }]}>
          Vos données sont conservées pendant une durée strictement nécessaire aux finalités décrites. Les traitements sont opérés par TryToWin et ses sous-traitants techniques (notamment Firebase/Google). En cas de transfert hors UE, des garanties adéquates sont mises en place (clauses contractuelles types).
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Sécurité</Text>
        <Text style={[styles.paragraph, { color: theme.text }]}>
          Nous appliquons des mesures proportionnées: chiffrement en transit et au repos lorsque pertinent, contrôle fin des accès, minimisation des données, sauvegardes régulières, supervision et journalisation des accès sensibles.
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Droits</Text>
        <Text style={[styles.paragraph, { color: theme.text }]}>
          Vous disposez des droits d’accès, de rectification, d’effacement, de portabilité et d’opposition. Pour toute demande, contactez notre DPO à l’adresse dpo@trytowin.app. Nous répondons sous 30 jours et vous tenons informé par email de l’avancement.
        </Text>
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

export default PrivacyPolicy;


