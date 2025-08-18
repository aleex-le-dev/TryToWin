// Service centralisé pour la gestion d'amis/bloqués
import { db } from "../utils/firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

export function subscribeFriends(currentUserId, callback) {
  if (!currentUserId) return () => {};
  const col = collection(db, "users", currentUserId, "friends");
  const q = query(col, orderBy("username", "asc"));
  return onSnapshot(q, (snap) => {
    const items = [];
    snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
    console.log("[friendsService] subscribeFriends -> count:", items.length, items.map(i => i.id));
    callback(items);
  });
}

export function subscribeBlocked(currentUserId, callback, onError) {
  if (!currentUserId) return () => {};
  const col = collection(db, "users", currentUserId, "blocked");
  return onSnapshot(
    col,
    (snap) => {
      const ids = snap.docs.map((d) => d.id);
      console.log("[friendsService] subscribeBlocked -> ids:", ids);
      callback(ids);
    },
    onError || (() => {})
  );
}

export async function isBlocked(currentUserId, targetUserId) {
  if (!currentUserId || !targetUserId) return false;
  const ref = doc(db, "users", currentUserId, "blocked", targetUserId);
  const snap = await getDoc(ref);
  console.log("[friendsService] isBlocked:", targetUserId, "->", snap.exists());
  return snap.exists();
}

export async function isFriend(currentUserId, targetUserId) {
  if (!currentUserId || !targetUserId) return false;
  const ref = doc(db, "users", currentUserId, "friends", targetUserId);
  const snap = await getDoc(ref);
  console.log("[friendsService] isFriend:", targetUserId, "->", snap.exists());
  return snap.exists();
}

export async function addFriend(currentUserId, friendUser) {
  if (!currentUserId || !friendUser?.id) return { ok: false, reason: "bad-params" };
  console.log("[friendsService] addFriend start:", currentUserId, "->", friendUser.id);
  // Empêcher si bloqué
  if (await isBlocked(currentUserId, friendUser.id)) {
    console.log("[friendsService] addFriend aborted: user is blocked", friendUser.id);
    return { ok: false, reason: "blocked" };
  }
  const ref = doc(db, "users", currentUserId, "friends", friendUser.id);
  const existing = await getDoc(ref);
  if (existing.exists()) return { ok: true, already: true };
  try {
    await setDoc(
      ref,
      {
        username:
          friendUser.username || friendUser.displayName || friendUser.email || "Joueur",
        avatar: friendUser.avatar || friendUser.photoURL || "",
        photoURL: friendUser.photoURL || "",
        country: friendUser.country || "",
        addedAt: serverTimestamp(),
      },
      { merge: true }
    );
    const verify = await getDoc(ref);
    console.log("[friendsService] addFriend verify exists:", verify.exists());
    return { ok: verify.exists() };
  } catch (e) {
    console.log("[friendsService] addFriend error:", e);
    return { ok: false, error: e?.message || 'write-failed' };
  }
}

export async function removeFriend(currentUserId, friendId) {
  if (!currentUserId || !friendId) return;
  console.log("[friendsService] removeFriend:", currentUserId, friendId);
  await deleteDoc(doc(db, "users", currentUserId, "friends", friendId));
}

export async function blockUser(currentUserId, targetUser) {
  if (!currentUserId || !targetUser?.id) return;
  console.log("[friendsService] blockUser:", currentUserId, targetUser.id);
  await setDoc(
    doc(db, "users", currentUserId, "blocked", targetUser.id),
    {
      username: targetUser.username || "Utilisateur",
      photoURL: targetUser.photoURL || "",
      avatar: targetUser.avatar || "",
      blockedAt: serverTimestamp(),
    },
    { merge: true }
  );
  // Supprimer des amis si présent
  await removeFriend(currentUserId, targetUser.id);
}

export async function unblockUser(currentUserId, targetUserId) {
  if (!currentUserId || !targetUserId) return;
  console.log("[friendsService] unblockUser:", currentUserId, targetUserId);
  await deleteDoc(doc(db, "users", currentUserId, "blocked", targetUserId));
}


