import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PrivacyPolicy = ({ navigation }) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name='arrow-back' size={22} color='#23272a' />
      </TouchableOpacity>
      <Text style={styles.title}>Politique de confidentialité</Text>
    </View>
    <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
      <View style={styles.card}>
        <Text style={styles.paragraph}>
          Nous attachons une importance essentielle à la protection de vos données. Cette politique présente clairement quelles informations nous collectons, dans quel but, pendant combien de temps nous les conservons et avec qui elles peuvent être partagées. Elle détaille également les mesures de sécurité mises en place et vos droits, conformément au RGPD.
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Données et finalités</Text>
        <Text style={styles.paragraph}>
          Nous traitons des données de profil (nom d’utilisateur, avatar, pays), vos identifiants de compte (email), vos scores et interactions sociales. Ces informations sont utilisées pour assurer le fonctionnement de l’application, personnaliser l’expérience (classements, statistiques) et garantir la sécurité (prévention des abus, lutte contre la fraude).
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Durée & destinataires</Text>
        <Text style={styles.paragraph}>
          Vos données sont conservées pendant une durée strictement nécessaire aux finalités décrites. Les traitements sont opérés par TryToWin et ses sous-traitants techniques (notamment Firebase/Google). En cas de transfert hors UE, des garanties adéquates sont mises en place (clauses contractuelles types).
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sécurité</Text>
        <Text style={styles.paragraph}>
          Nous appliquons des mesures proportionnées: chiffrement en transit et au repos lorsque pertinent, contrôle fin des accès, minimisation des données, sauvegardes régulières, supervision et journalisation des accès sensibles.
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Droits</Text>
        <Text style={styles.paragraph}>
          Vous disposez des droits d’accès, de rectification, d’effacement, de portabilité et d’opposition. Pour toute demande, contactez notre DPO à l’adresse dpo@trytowin.app. Nous répondons sous 30 jours et vous tenons informé par email de l’avancement.
        </Text>
      </View>
    </ScrollView>
  </View>
);

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


