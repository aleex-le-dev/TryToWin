// Service RGPD: archivage + anonymisation d'un compte utilisateur
import { auth } from '../utils/firebaseConfig';
import { db } from '../utils/firebaseConfig';
import { doc, getDoc, setDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { authService } from './authService';
import { getAuth, deleteUser } from 'firebase/auth';

// Hash utilitaire SHA-256 en hex. Préfère Expo Crypto par défaut, avec fallbacks
async function sha256Hex(input) {
  const value = String(input || '');
  // 1) Expo Crypto (par défaut)
  try {
    // eslint-disable-next-line global-require
    const ExpoCrypto = require('expo-crypto');
    if (ExpoCrypto?.digestStringAsync) {
      return await ExpoCrypto.digestStringAsync(ExpoCrypto.CryptoDigestAlgorithm.SHA256, value);
    }
  } catch {}
  // 2) Node crypto si présent
  try {
    // eslint-disable-next-line global-require
    const nodeCrypto = require('crypto');
    if (nodeCrypto?.createHash) {
      return nodeCrypto.createHash('sha256').update(value).digest('hex');
    }
  } catch {}
  // 3) Implémentation SHA-256 en pur JS
  function rotr(n, x) { return (x >>> n) | (x << (32 - n)); }
  function ch(x, y, z) { return (x & y) ^ (~x & z); }
  function maj(x, y, z) { return (x & y) ^ (x & z) ^ (y & z); }
  function sigma0(x) { return rotr(2, x) ^ rotr(13, x) ^ rotr(22, x); }
  function sigma1(x) { return rotr(6, x) ^ rotr(11, x) ^ rotr(25, x); }
  function gamma0(x) { return rotr(7, x) ^ rotr(18, x) ^ (x >>> 3); }
  function gamma1(x) { return rotr(17, x) ^ rotr(19, x) ^ (x >>> 10); }
  const K = [
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
  ];
  function toBytes(str) {
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (code < 0x80) bytes.push(code);
      else if (code < 0x800) { bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f)); }
      else if (code < 0xd800 || code >= 0xe000) {
        bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
      } else {
        i++;
        const codePoint = 0x10000 + (((code & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
        bytes.push(0xf0 | (codePoint >> 18), 0x80 | ((codePoint >> 12) & 0x3f), 0x80 | ((codePoint >> 6) & 0x3f), 0x80 | (codePoint & 0x3f));
      }
    }
    return bytes;
  }
  const msg = toBytes(value);
  const l = msg.length * 8;
  msg.push(0x80);
  while ((msg.length % 64) !== 56) msg.push(0);
  const lenHi = Math.floor(l / 0x100000000);
  const lenLo = l >>> 0;
  for (let i = 3; i >= 0; i--) msg.push((lenHi >>> (i * 8)) & 0xff);
  for (let i = 3; i >= 0; i--) msg.push((lenLo >>> (i * 8)) & 0xff);
  let H0 = 0x6a09e667, H1 = 0xbb67ae85, H2 = 0x3c6ef372, H3 = 0xa54ff53a,
      H4 = 0x510e527f, H5 = 0x9b05688c, H6 = 0x1f83d9ab, H7 = 0x5be0cd19;
  const W = new Array(64);
  for (let i = 0; i < msg.length; i += 64) {
    for (let t = 0; t < 16; t++) {
      W[t] = (msg[i + (t * 4)] << 24) | (msg[i + (t * 4) + 1] << 16) | (msg[i + (t * 4) + 2] << 8) | (msg[i + (t * 4) + 3]);
    }
    for (let t = 16; t < 64; t++) W[t] = (gamma1(W[t - 2]) + W[t - 7] + gamma0(W[t - 15]) + W[t - 16]) >>> 0;
    let a = H0, b = H1, c = H2, d = H3, e = H4, f = H5, g = H6, h = H7;
    for (let t = 0; t < 64; t++) {
      const T1 = (h + sigma1(e) + ch(e, f, g) + K[t] + W[t]) >>> 0;
      const T2 = (sigma0(a) + maj(a, b, c)) >>> 0;
      h = g; g = f; f = e; e = (d + T1) >>> 0; d = c; c = b; b = a; a = (T1 + T2) >>> 0;
    }
    H0 = (H0 + a) >>> 0; H1 = (H1 + b) >>> 0; H2 = (H2 + c) >>> 0; H3 = (H3 + d) >>> 0;
    H4 = (H4 + e) >>> 0; H5 = (H5 + f) >>> 0; H6 = (H6 + g) >>> 0; H7 = (H7 + h) >>> 0;
  }
  function toHex(n) { return ('00000000' + n.toString(16)).slice(-8); }
  return (toHex(H0) + toHex(H1) + toHex(H2) + toHex(H3) + toHex(H4) + toHex(H5) + toHex(H6) + toHex(H7));
}

// Ancienne copie d'archives supprimée: nous anonymisons directement le document users/{uid}

export const privacyService = {
  // Archive l'utilisateur courant et anonymise son compte actif
  async archiveAndAnonymizeCurrentUser() {
    const current = auth.currentUser;
    if (!current?.uid) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    try {
      const uid = current.uid;
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      const userData = snap.exists() ? snap.data() : {};

      // Anonymisation directe dans users/{uid}: remplacer champs identifiants par leurs hash
      const emailHash = await sha256Hex(current.email || userData.email || '');
      const usernameHash = await sha256Hex(userData.username || '');

      const batch = writeBatch(db);
      batch.set(userRef, {
        email: emailHash,
        username: usernameHash,
        photoURL: '',
        avatar: '👤',
        bio: '',
        country: null,
        anonymizedAt: new Date().toISOString(),
        isAnonymized: true,
      }, { merge: true });

      await batch.commit();

      // Tentative de suppression du compte auth (si Google/Firebase permet)
      try {
        const a = getAuth();
        if (a?.currentUser?.uid === uid) {
          await deleteUser(a.currentUser);
        }
      } catch {}
      // Déconnexion pour finaliser (si non déjà supprimé)
      try { await authService.logout(); } catch {}
      return { success: true };
    } catch (e) {
      return { success: false, error: e?.message || 'Erreur inconnue' };
    }
  },
};

export default privacyService;


