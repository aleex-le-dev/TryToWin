import { db } from "../utils/firebaseConfig";
import { doc, setDoc, collection, addDoc, serverTimestamp, getDocs, query, where } from "firebase/firestore";

export async function recordConsent(userId, { type, version, accepted }) {
  if (!userId || !type) return;
  const col = collection(db, 'users', userId, 'consents');
  await addDoc(col, {
    type, // terms | privacy | cookies
    version: version || 'v1',
    accepted: !!accepted,
    createdAt: serverTimestamp(),
  });
}

export async function listConsents(userId) {
  if (!userId) return [];
  const col = collection(db, 'users', userId, 'consents');
  const snap = await getDocs(col);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getLastConsent(userId, type) {
  if (!userId || !type) return null;
  const col = collection(db, 'users', userId, 'consents');
  const q = query(col, where('type', '==', type));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  docs.sort((a,b) => {
    const ta = a.createdAt?.seconds || 0;
    const tb = b.createdAt?.seconds || 0;
    if (tb !== ta) return tb - ta;
    return (b.id > a.id ? 1 : -1);
  });
  return docs[0];
}


