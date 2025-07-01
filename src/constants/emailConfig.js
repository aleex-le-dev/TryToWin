// Configuration des emails et SMTP
// Paramètres pour l'envoi d'emails via Firebase avec SMTP personnalisé

import {
  GMAIL_EMAIL,
  GMAIL_APP_PASSWORD,
  EMAIL_VERIFICATION_URL,
  PASSWORD_RESET_URL,
} from "@env";

export const emailConfig = {
  // Configuration SMTP avec votre email personnel
  smtp: {
    enabled: true,
    sender: GMAIL_EMAIL || "alexandre.janacek@gmail.com",
    host: "smtp.gmail.com",
    port: 587,
    username: GMAIL_EMAIL || "alexandre.janacek@gmail.com",
    password: GMAIL_APP_PASSWORD || "naid lwpq sudt ctky",
    security: "STARTTLS",
  },

  // URLs de redirection pour les emails
  urls: {
    emailVerification:
      EMAIL_VERIFICATION_URL || "https://trytowin.com/verify-email",
    passwordReset: PASSWORD_RESET_URL || "https://trytowin.com/reset-password",
    welcome: "https://trytowin.com/welcome",
  },

  // Templates d'emails personnalisés
  templates: {
    emailVerification: {
      subject: "Vérifiez votre email - TryToWin",
      body: `
        <h2>Bienvenue sur TryToWin !</h2>
        <p>Merci de vous être inscrit. Pour activer votre compte, veuillez cliquer sur le lien ci-dessous :</p>
        <a href="{{LINK}}">Vérifier mon email</a>
        <p>Si le lien ne fonctionne pas, copiez cette URL dans votre navigateur :</p>
        <p>{{LINK}}</p>
        <p>Cordialement,<br>L'équipe TryToWin</p>
      `,
    },

    passwordReset: {
      subject: "Réinitialisation de mot de passe - TryToWin",
      body: `
        <h2>Réinitialisation de mot de passe</h2>
        <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous :</p>
        <a href="{{LINK}}">Réinitialiser mon mot de passe</a>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        <p>Cordialement,<br>L'équipe TryToWin</p>
      `,
    },

    welcome: {
      subject: "Bienvenue sur TryToWin !",
      body: `
        <h2>Bienvenue {{DISPLAY_NAME}} !</h2>
        <p>Votre compte a été créé avec succès. Vous pouvez maintenant :</p>
        <ul>
          <li>Jouer à nos jeux passionnants</li>
          <li>Grimper dans les classements</li>
          <li>Défier vos amis</li>
          <li>Gagner des récompenses</li>
        </ul>
        <p>Commencez dès maintenant :</p>
        <a href="https://trytowin.com">Jouer maintenant</a>
        <p>Cordialement,<br>L'équipe TryToWin</p>
      `,
    },
  },

  // Paramètres d'envoi
  settings: {
    handleCodeInApp: true, // Gérer les codes dans l'app
    sendEmailVerification: true, // Envoyer l'email de vérification
    sendWelcomeEmail: true, // Envoyer l'email de bienvenue
  },
};

// Fonction pour obtenir la configuration SMTP
export const getSmtpConfig = () => {
  return emailConfig.smtp;
};

// Fonction pour obtenir les URLs
export const getEmailUrls = () => {
  return emailConfig.urls;
};

// Fonction pour obtenir les templates
export const getEmailTemplates = () => {
  return emailConfig.templates;
};
