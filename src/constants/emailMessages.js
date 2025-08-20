// Messages et constantes liés à la gestion des emails déjà utilisés
// Centralise tous les messages d'erreur et d'information pour une meilleure maintenance

export const EMAIL_MESSAGES = {
  // Messages d'erreur
  UNVERIFIED_ACCOUNT: {
    title: "Compte non validé",
    message: "Votre compte précédent n'a pas été validé. Vérifiez votre boîte mail et cliquez sur le lien de validation.",
    shortMessage: "Compte non validé",
  },
  
  // Messages d'information
  VERIFICATION_REQUIRED: {
    title: "Vérification requise",
    message: "Votre compte a été créé mais nécessite une vérification par email. Vérifiez votre boîte mail et cliquez sur le lien de validation.",
  },
  
  // Messages d'action
  ACTIONS: {
    VERIFY_EMAIL: "Vérifier mon email",
    USE_ANOTHER_EMAIL: "Utiliser un autre email",
    RESEND_EMAIL: "Renvoyer l'email",
    CLOSE: "Fermer",
  },
  
  // Messages de nettoyage
  CLEANUP: {
    title: "Nettoyage de compte",
    message: "Cette fonctionnalité nécessite une confirmation. Contactez le support pour plus d'informations.",
    warning: "⚠️ L'option de nettoyage supprimera définitivement votre compte précédent",
    success: "Compte non validé nettoyé avec succès",
    error: "Impossible de nettoyer le compte pour le moment",
  },
  
  // Messages de succès
  SUCCESS: {
    ACCOUNT_CREATED: "Compte créé avec succès",
    EMAIL_SENT: "Email de vérification envoyé",
    ACCOUNT_VERIFIED: "Compte vérifié avec succès",
    EMAIL_RESENT: "Email de vérification renvoyé",
  },
  
  // Messages d'aide
  HELP: {
    CHECK_SPAM: "Vérifiez votre dossier spam si vous ne recevez pas l'email",
    RESEND_EMAIL: "Vous pouvez demander un nouvel email de vérification",
    CONTACT_SUPPORT: "Si le problème persiste, contactez notre support",
  },
};

// Codes d'erreur spécifiques
export const EMAIL_ERROR_CODES = {
  ALREADY_IN_USE: "auth/email-already-in-use",
  INVALID_EMAIL: "auth/invalid-email",
  USER_NOT_FOUND: "auth/user-not-found",
  WEAK_PASSWORD: "auth/weak-password",
};

// Délais et timeouts
export const EMAIL_TIMEOUTS = {
  VERIFICATION_LINK_EXPIRY: 24 * 60 * 60 * 1000, // 24 heures en millisecondes
  RESEND_COOLDOWN: 60 * 1000, // 1 minute en millisecondes
  TOAST_DISPLAY: 4000, // 4 secondes
};

// Configuration des actions
export const EMAIL_ACTIONS_CONFIG = {
  SHOW_CLEANUP_OPTION: true,
  ALLOW_RESEND: true,
  MAX_ATTEMPTS: 3,
  CLEANUP_CONFIRMATION_REQUIRED: true,
};
