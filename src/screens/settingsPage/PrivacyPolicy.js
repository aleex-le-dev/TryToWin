import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const PrivacyPolicy = ({ navigation }) => {
  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name='arrow-back' size={22} color='#fff' />
          </TouchableOpacity>
          <Text style={styles.title}>Politique de confidentialité</Text>
        </View>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Protection des Données</Text>
            <Text style={styles.text}>
              Nous attachons une importance essentielle à la protection de vos données. Cette politique présente clairement quelles informations nous collectons, dans quel but, pendant combien de temps nous les conservons et avec qui elles peuvent être partagées. Elle détaille également les mesures de sécurité mises en place et vos droits, conformément au RGPD.
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Données et finalités</Text>
            <Text style={styles.text}>
              Nous traitons des données de profil (nom d'utilisateur, avatar, pays), vos identifiants de compte (email), vos scores et interactions sociales. Ces informations sont utilisées pour assurer le fonctionnement de l'application, personnaliser l'expérience (classements, statistiques) et garantir la sécurité (prévention des abus, lutte contre la fraude).
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Durée & destinataires</Text>
            <Text style={styles.text}>
              Vos données sont conservées pendant une durée strictement nécessaire aux finalités décrites. Les traitements sont opérés par TryToWin et ses sous-traitants techniques (notamment Firebase/Google). En cas de transfert hors UE, des garanties adéquates sont mises en place (clauses contractuelles types).
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sécurité</Text>
            <Text style={styles.text}>
              Nous appliquons des mesures proportionnées: chiffrement en transit et au repos lorsque pertinent, contrôle fin des accès, minimisation des données, sauvegardes régulières, supervision et journalisation des accès sensibles.
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Droits</Text>
            <Text style={styles.text}>
              Vous disposez des droits d'accès, de rectification, d'effacement, de portabilité et d'opposition. Pour toute demande, contactez notre DPO à l'adresse dpo@trytowin.app. Nous répondons sous 30 jours et vous tenons informé par email de l'avancement.
            </Text>
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 24, 
    paddingBottom: 12, 
    paddingTop: 70 
  },
  backBtn: { 
    marginRight: 10, 
    padding: 4 
  },
  title: { 
    color: '#fff', 
    fontSize: 22, 
    fontWeight: 'bold' 
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: { 
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    marginHorizontal: 16, 
    marginTop: 12, 
    borderRadius: 14, 
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16, 
    marginBottom: 8 
  },
  text: { 
    color: 'rgba(255, 255, 255, 0.9)', 
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    fontStyle: "italic",
  },
});

export default PrivacyPolicy;


