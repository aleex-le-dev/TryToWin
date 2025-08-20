// Page Paramètres > Données et confidentialité (RGPD)
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAuth } from "../../hooks/useAuth";
import { recordConsent, getLastConsent } from "../../services/consentService";
import * as Linking from "expo-linking";

const PrivacySettings = ({ navigation }) => {
  const { user } = useAuth();

  const [privacyAccepted, setPrivacyAccepted] = useState(null);

  const refreshPrivacyStatus = async () => {
    if (!user?.id) return;
    const last = await getLastConsent(user.id, 'privacy');
    if (last) {
      setPrivacyAccepted(!!last.accepted);
    } else {
      // Par défaut: accepté et journalisé
      try { await recordConsent(user.id, { type: 'privacy', accepted: true, version: 'v1' }); } catch {}
      setPrivacyAccepted(true);
    }
  };

  useEffect(() => { refreshPrivacyStatus(); }, [user?.id]);

  const saveConsent = async (type, accepted) => {
    try {
      await recordConsent(user.id, { type, accepted, version: 'v1' });
      await refreshPrivacyStatus();
    } catch {}
  };

  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name='arrow-back' size={22} color={theme.icon} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Données et confidentialité</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
        {/* Mentions légales et politique */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Mentions légales & Politique</Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>Consultez les mentions légales et la politique de confidentialité.</Text>
          <View style={styles.rowBtns}>
            <OutlineBtn label='Mentions légales' onPress={() => navigation.navigate('LegalMentions')} />
            <OutlineBtn label='Politique de confidentialité' onPress={() => navigation.navigate('PrivacyPolicy') } />
          </View>
        </View>

        {/* Consentements */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Consentements</Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>Vous pouvez accepter ou retirer vos consentements à tout moment.</Text>
          <Text style={[styles.paragraph, { marginTop: 4, color: theme.text }]}>État actuel: {privacyAccepted === null ? '—' : (privacyAccepted ? 'accepté' : 'retiré')}</Text>
          <View style={styles.rowBtns}>
            <SolidBtn label='Accepter la politique' onPress={() => saveConsent('privacy', true)} />
            <OutlineBtn label='Retirer' onPress={() => saveConsent('privacy', false)} />
          </View>
          {/* Historique retiré: les consentements sont journalisés en interne mais non listés ici. */}
        </View>

        {/* Données personnelles */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Données personnelles</Text>
          <Text style={[styles.listItem, { color: theme.text }]}>• Données collectées: profil, email, scores, interactions sociales</Text>
          <Text style={[styles.listItem, { color: theme.text }]}>• Finalités: fonctionnement, personnalisation, sécurité</Text>
          <Text style={[styles.listItem, { color: theme.text }]}>• Conservation: limitée au nécessaire; voir politique</Text>
          <Text style={[styles.listItem, { color: theme.text }]}>• Tiers: Firebase/Google, analytics éventuels</Text>
          <Text style={[styles.listItem, { color: theme.text }]}>• Base légale: exécution du service, consentement</Text>
        </View>

        {/* Droits utilisateurs */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Vos droits</Text>
          <Text style={styles.listItem}>• Accès, rectification, suppression, portabilité, opposition</Text>
          <Text style={styles.listItem}>• Réponse sous 30 jours, par email et confirmation</Text>
          <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL('mailto:dpo@trytowin.app?subject=Droits%20RGPD')}>
            <Ionicons name='mail' size={18} color='#fff' />
            <Text style={styles.contactText}>Exercer mes droits</Text>
          </TouchableOpacity>
        </View>

        {/* Registre & Responsable */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Registre & Responsable</Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>Un registre des traitements est tenu à jour (finalité, base légale, destinataire, durée, sécurité). Responsable & DPO: contact dans la politique.</Text>
        </View>

        {/* Sécurité & notifications */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Sécurité & notifications</Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>Chiffrement, accès restreints, minimisation. En cas d’incident ou de modification importante, information des utilisateurs et notification à la CNIL si nécessaire.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const OutlineBtn = ({ label, onPress }) => (
  <TouchableOpacity style={styles.outlineBtn} onPress={onPress}>
    <Text style={styles.outlineBtnText}>{label}</Text>
  </TouchableOpacity>
);

const SolidBtn = ({ label, onPress }) => (
  <TouchableOpacity style={styles.solidBtn} onPress={onPress}>
    <Text style={styles.solidBtnText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingBottom: 12, paddingTop: 50 },
  backBtn: { marginRight: 10, padding: 4 },
  title: { color: '#23272a', fontSize: 22, fontWeight: 'bold' },
  card: { backgroundColor: '#f8f9fa', marginHorizontal: 16, marginTop: 12, borderRadius: 14, padding: 16 },
  cardTitle: { color: '#23272a', fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  paragraph: { color: '#23272a', fontSize: 14 },
  listItem: { color: '#23272a', fontSize: 14, marginTop: 4 },
  note: { color: '#6c757d', fontSize: 12, marginTop: 6 },
  rowBtns: { flexDirection: 'row', gap: 10, marginTop: 10 },
  outlineBtn: { borderColor: '#667eea', borderWidth: 1, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12 },
  outlineBtnText: { color: '#667eea', fontWeight: 'bold' },
  solidBtn: { backgroundColor: '#667eea', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12 },
  solidBtnText: { color: '#fff', fontWeight: 'bold' },
  contactBtn: { marginTop: 10, backgroundColor: '#667eea', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start' },
  contactText: { color: '#fff', fontWeight: 'bold' },
});

export default PrivacySettings;
