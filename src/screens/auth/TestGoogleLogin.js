import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import {
  ANDROID_CLIENT_ID,
  EXPO_CLIENT_ID,
} from "../../utils/googleAuthConfig";
import { auth } from "../../utils/firebaseConfig";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";

WebBrowser.maybeCompleteAuthSession();

export default function TestGoogleLogin() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: EXPO_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
    redirectUri: "https://auth.expo.io/@diiablex62/TryToWin",
  });

  React.useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      setLoading(true);
      setMessage("");
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then((result) => {
          setMessage("Connexion Google réussie : " + result.user.email);
        })
        .catch((err) => {
          setMessage("Erreur Firebase : " + err.message);
        })
        .finally(() => setLoading(false));
    } else if (response?.type === "error") {
      setMessage("Erreur Google : " + response.error);
    }
  }, [response]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
      }}>
      <TouchableOpacity
        style={{
          backgroundColor: "#4285F4",
          padding: 16,
          borderRadius: 8,
          marginBottom: 24,
        }}
        onPress={() => promptAsync()}
        disabled={!request || loading}>
        {loading ? (
          <ActivityIndicator color='#fff' />
        ) : (
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            Connexion Google
          </Text>
        )}
      </TouchableOpacity>
      {message ? (
        <Text style={{ color: message.startsWith("Erreur") ? "red" : "green" }}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}
