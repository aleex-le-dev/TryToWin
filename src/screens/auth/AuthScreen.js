// AuthScreen.js - Écran d'authentification (email/mot de passe + Google)
// À utiliser dans la navigation principale pour l'inscription/connexion des utilisateurs

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { auth } from "../../utils/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { androidClientId, expoClientId } from "../../utils/googleAuthConfig";

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Google Auth
  const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: expoClientId,
    androidClientId: androidClientId,
    redirectUri,
  });

  React.useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      setLoading(true);
      signInWithCredential(auth, credential)
        .then(() => Alert.alert("Succès", "Connecté avec Google !"))
        .catch((err) => Alert.alert("Erreur", err.message))
        .finally(() => setLoading(false));
    }
  }, [response]);

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert("Succès", "Compte créé !");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        Alert.alert("Succès", "Connecté !");
      }
    } catch (err) {
      Alert.alert("Erreur", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSignUp ? "Inscription" : "Connexion"}</Text>
      <TextInput
        style={styles.input}
        placeholder='Email'
        value={email}
        onChangeText={setEmail}
        autoCapitalize='none'
        keyboardType='email-address'
      />
      <TextInput
        style={styles.input}
        placeholder='Mot de passe'
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleAuth}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color='#fff' />
        ) : (
          <Text style={styles.buttonText}>
            {isSignUp ? "S'inscrire" : "Se connecter"}
          </Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsSignUp((v) => !v)}>
        <Text style={styles.switchText}>
          {isSignUp
            ? "Déjà un compte ? Se connecter"
            : "Pas de compte ? S'inscrire"}
        </Text>
      </TouchableOpacity>
      <View style={styles.divider} />
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#4285F4" }]}
        onPress={() => promptAsync()}
        disabled={!request || loading}>
        <Text style={styles.buttonText}>Continuer avec Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#667eea",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    width: "100%",
    backgroundColor: "#667eea",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  switchText: { color: "#667eea", marginBottom: 16 },
  divider: {
    height: 1,
    width: "100%",
    backgroundColor: "#e9ecef",
    marginVertical: 16,
  },
});
