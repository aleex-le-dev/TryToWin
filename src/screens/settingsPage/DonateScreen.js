// Page Assistance > Payer un café
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const DonateScreen = ({ navigation }) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name='arrow-back' size={22} color='#23272a' />
      </TouchableOpacity>
      <Text style={styles.title}>Payer un café</Text>
    </View>
    <Text style={styles.placeholder}>Soutenir le projet à venir…</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  backBtn: { marginRight: 6, padding: 4 },
  title: { color: '#23272a', fontSize: 22, fontWeight: 'bold', marginBottom: 0 },
  placeholder: { color: '#6c757d', fontSize: 16 },
});

export default DonateScreen;
