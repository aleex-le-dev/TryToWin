import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Image } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAuth } from "../../hooks/useAuth";
import { db } from "../../utils/firebaseConfig";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import Toast from "react-native-toast-message";

const BlockedUsersScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [blocked, setBlocked] = useState([]);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const col = collection(db, "users", user.id, "blocked");
    const q = query(col, orderBy("username", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const items = [];
        snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
        setBlocked(items);
        setPermissionDenied(false);
      },
      (error) => {
        setPermissionDenied(true);
        setBlocked([]);
        Toast.show({ type: "error", text1: "Permissions insuffisantes", position: "top", topOffset: 40 });
      }
    );
    return () => unsub();
  }, [user?.id]);

  const unblock = useCallback(async (id) => {
    try {
      if (!user?.id || !id) return;
      await deleteDoc(doc(db, "users", user.id, "blocked", id));
      Toast.show({ type: "success", text1: "Joueur débloqué", position: "top", topOffset: 40 });
    } catch (e) {
      Toast.show({ type: "error", text1: "Erreur", text2: "Impossible de débloquer", position: "top", topOffset: 40 });
    }
  }, [user?.id]);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.avatarWrap}>
        {item.photoURL ? (
          <Image source={{ uri: item.photoURL }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              {(item.username || "U").slice(0, 1).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.username || "Utilisateur"}</Text>
      </View>
      <TouchableOpacity
        style={[styles.iconOnlyBtn, permissionDenied && { opacity: 0.5 } ]}
        onPress={() => !permissionDenied && unblock(item.id)}
        disabled={permissionDenied}
      >
        <Ionicons name='lock-open' size={20} color='#fff' />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={[styles.header, { backgroundColor: "#fff", borderBottomColor: "#e9ecef" }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name='arrow-back' size={24} color='#23272a' />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: "#23272a" }]}>Joueurs bloqués</Text>
      </View>
      <FlatList
        data={blocked}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 18 }}
        ListEmptyComponent={<Text style={{ color: "#6c757d", textAlign: "center" }}>{permissionDenied ? "Permissions insuffisantes pour afficher la liste." : "Aucun joueur bloqué."}</Text>}
      />
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 18,
    paddingBottom: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    flex: 1,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  avatarWrap: { marginRight: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarFallback: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#667eea", alignItems: "center", justifyContent: "center" },
  name: { color: "#23272a", fontSize: 16, fontWeight: "500" },
  iconOnlyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#667eea",
  },
});

export default BlockedUsersScreen;


