// Page de validation d'email personnalisée (web)
// À utiliser comme page de redirection dans le modèle d'email Firebase

import React, { useEffect, useState } from "react";
import { getAuth, applyActionCode } from "firebase/auth";

const EmailVerifyPage = () => {
  const [status, setStatus] = useState("pending"); // 'pending', 'success', 'error'
  const [message, setMessage] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const oobCode = urlParams.get("oobCode");
    if (!oobCode) {
      setStatus("error");
      setMessage("Lien de validation invalide ou expiré.");
      return;
    }
    const auth = getAuth();
    applyActionCode(auth, oobCode)
      .then(() => {
        setStatus("success");
        setMessage(
          "Votre adresse e-mail a bien été validée ! Vous pouvez maintenant vous connecter."
        );
      })
      .catch((error) => {
        setStatus("error");
        setMessage(
          "Erreur lors de la validation : " +
            (error.message || "Lien invalide ou expiré.")
        );
      });
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg,#667eea,#764ba2)",
      }}>
      <div
        style={{
          background: "white",
          borderRadius: 16,
          padding: 32,
          boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
          maxWidth: 400,
          textAlign: "center",
        }}>
        <h2 style={{ color: "#667eea" }}>Validation de l'adresse e-mail</h2>
        {status === "pending" && <p>Validation en cours...</p>}
        {status === "success" && (
          <p style={{ color: "green", fontWeight: "bold" }}>{message}</p>
        )}
        {status === "error" && (
          <p style={{ color: "red", fontWeight: "bold" }}>{message}</p>
        )}
        <a
          href='/'
          style={{
            marginTop: 24,
            display: "inline-block",
            color: "#667eea",
            textDecoration: "underline",
          }}>
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
};

export default EmailVerifyPage;
