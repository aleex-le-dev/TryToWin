# 📧 Configuration Gmail SMTP pour Firebase TryToWin

## 🎯 **Objectif**

Utiliser votre email Gmail personnel avec un mot de passe d'application pour envoyer les emails Firebase.

## 📋 **Étapes de configuration**

### **1. Préparation du mot de passe d'application Gmail**

#### **A. Accès aux paramètres Google**

1. Allez sur [Google Account Settings](https://myaccount.google.com/)
2. Connectez-vous avec votre compte Gmail
3. Cliquez sur **"Sécurité"** dans le menu de gauche

#### **B. Activation de la validation en 2 étapes**

1. Trouvez **"Validation en 2 étapes"**
2. Cliquez sur **"Commencer"** si pas encore activée
3. Suivez les étapes pour l'activer
4. **Important** : Cette étape est obligatoire pour créer un mot de passe d'application

#### **C. Création du mot de passe d'application**

1. Retournez à **"Sécurité"**
2. Cliquez sur **"Mots de passe d'application"**
3. Sélectionnez **"Autre (nom personnalisé)"**
4. Nommez-le : `TryToWin Firebase`
5. Cliquez sur **"Générer"**
6. **Copiez le mot de passe de 16 caractères** (ex: `abcd efgh ijkl mnop`)

### **2. Configuration Firebase Console**

#### **A. Accès aux templates Firebase**

1. Allez sur [Console Firebase](https://console.firebase.google.com/)
2. Sélectionnez votre projet `TryToWin`
3. Cliquez sur **"Authentication"** dans le menu
4. Cliquez sur l'onglet **"Templates"**

#### **B. Configuration Email de vérification**

1. Cliquez sur **"Email verification"**
2. Activez **"Customize action URL"**
3. Entrez : `https://trytowin.com/verify-email`
4. Dans **"SMTP Settings"**, configurez :
   ```
   Activer SMTP personnalisé : ✅ ON
   Adresse de l'expéditeur : alexandre.janacek@gmail.com
   Hôte du serveur SMTP : smtp.gmail.com
   Port du serveur SMTP : 587
   Nom d'utilisateur : alexandre.janacek@gmail.com
   Mot de passe : naid lwpq sudt ctky
   Mode de sécurité : STARTTLS
   ```
5. Cliquez sur **"Save"**

#### **C. Configuration Réinitialisation mot de passe**

1. Cliquez sur **"Password reset"**
2. Activez **"Customize action URL"**
3. Entrez : `https://trytowin.com/reset-password`
4. Configurez les mêmes paramètres SMTP
5. Cliquez sur **"Save"**

### **3. Mise à jour du code**

#### **A. Modification du fichier de configuration**

Modifiez `src/constants/emailConfig.js` :

```javascript
export const emailConfig = {
  smtp: {
    enabled: true,
    sender: "votre.email@gmail.com", // Votre vrai email Gmail
    host: "smtp.gmail.com",
    port: 587,
    username: "votre.email@gmail.com", // Votre vrai email Gmail
    password: "abcd efgh ijkl mnop", // Votre mot de passe d'application
    security: "STARTTLS",
  },
  // ...
};
```

#### **B. Sécurisation avec variables d'environnement (Recommandé)**

Créez un fichier `.env` à la racine :

```env
GMAIL_EMAIL=votre.email@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

Puis modifiez `emailConfig.js` :

```javascript
import { GMAIL_EMAIL, GMAIL_APP_PASSWORD } from "@env";

export const emailConfig = {
  smtp: {
    enabled: true,
    sender: GMAIL_EMAIL,
    host: "smtp.gmail.com",
    port: 587,
    username: GMAIL_EMAIL,
    password: GMAIL_APP_PASSWORD,
    security: "STARTTLS",
  },
  // ...
};
```

### **4. Test de la configuration**

#### **A. Test d'envoi d'email**

1. Créez un compte de test dans votre app
2. Vérifiez que l'email de vérification arrive
3. Vérifiez l'expéditeur (doit être votre email Gmail)

#### **B. Test de réinitialisation**

1. Utilisez "Mot de passe oublié"
2. Vérifiez la réception de l'email de reset

### **5. Avantages de cette approche**

✅ **Email personnel** : Utilise votre propre email Gmail
✅ **Sécurité** : Mot de passe d'application sécurisé
✅ **Fiabilité** : Gmail est très fiable pour la livraison
✅ **Gratuit** : Pas de coût supplémentaire
✅ **Quota généreux** : 500 emails/jour avec Gmail

### **6. Limitations Gmail**

⚠️ **Quota quotidien** : 500 emails par jour
⚠️ **Taille des emails** : 25 MB maximum
⚠️ **Taux d'envoi** : Limité pour éviter le spam

### **7. Dépannage**

#### **A. Erreurs courantes**

- **"Invalid credentials"** : Vérifiez le mot de passe d'application
- **"Authentication failed"** : Vérifiez que la 2FA est activée
- **"Connection refused"** : Vérifiez le port 587

#### **B. Vérifications**

- ✅ Validation en 2 étapes activée
- ✅ Mot de passe d'application copié correctement
- ✅ Email Gmail correct
- ✅ Port 587 et STARTTLS

### **8. Sécurité**

#### **A. Protection du mot de passe**

- Ne partagez jamais le mot de passe d'application
- Utilisez des variables d'environnement
- Ne committez pas le fichier `.env`

#### **B. Monitoring**

- Surveillez les emails envoyés dans Gmail
- Vérifiez les logs Firebase
- Surveillez les erreurs d'envoi

## ✅ **Vérification finale**

Après configuration, testez :

1. ✅ Création compte → Email de vérification reçu
2. ✅ Expéditeur = votre.email@gmail.com
3. ✅ Réinitialisation mot de passe → Email reçu
4. ✅ Redirection vers votre site fonctionne

Votre configuration Gmail SMTP est maintenant opérationnelle ! 🎉
