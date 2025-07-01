// Constantes de configuration pour l'application
// Centralise toutes les configurations et paramètres

export const config = {
  // Configuration de l'application
  app: {
    name: 'TryToWin',
    version: '1.0.0',
    buildNumber: '1',
  },

  // Configuration Firebase
  firebase: {
    authDomain: 'trytowin-app.firebaseapp.com',
    projectId: 'trytowin-app',
    storageBucket: 'trytowin-app.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:abcdef123456',
  },

  // Configuration API
  api: {
    baseURL: 'https://api.trytowin.com',
    timeout: 10000,
    retryAttempts: 3,
  },

  // Configuration des jeux
  games: {
    maxPlayers: 4,
    minPlayers: 1,
    defaultTimeLimit: 300, // 5 minutes
    categories: ['puzzle', 'action', 'strategy', 'arcade'],
    difficulties: ['easy', 'medium', 'hard'],
  },

  // Configuration des scores
  scores: {
    maxLeaderboardEntries: 100,
    scoreMultiplier: 1,
    bonusPoints: {
      perfect: 100,
      speed: 50,
      accuracy: 25,
    },
  },

  // Configuration de l'interface
  ui: {
    animationDuration: 300,
    toastDuration: 3000,
    debounceDelay: 500,
    maxRetries: 3,
  },

  // Configuration de sécurité
  security: {
    passwordMinLength: 6,
    passwordMaxLength: 50,
    sessionTimeout: 3600000, // 1 heure
    maxLoginAttempts: 5,
    lockoutDuration: 900000, // 15 minutes
  },
};

// Configuration des routes
export const routes = {
  // Routes d'authentification
  auth: {
    login: 'Login',
    register: 'Register',
    forgotPassword: 'ForgotPassword',
  },

  // Routes principales
  main: {
    home: 'Home',
    games: 'Games',
    profile: 'Profile',
    social: 'Social',
  },

  // Routes de jeux
  games: {
    list: 'GamesList',
    details: 'GameDetails',
    play: 'GamePlay',
    leaderboard: 'Leaderboard',
  },
};

// Configuration des messages
export const messages = {
  // Messages de succès
  success: {
    login: 'Connexion réussie !',
    register: 'Compte créé avec succès !',
    logout: 'Déconnexion réussie !',
    profileUpdate: 'Profil mis à jour !',
    scoreSaved: 'Score enregistré !',
  },

  // Messages d'erreur
  error: {
    network: 'Erreur de connexion réseau',
    server: 'Erreur serveur',
    unknown: 'Une erreur inattendue est survenue',
    validation: 'Veuillez vérifier vos données',
  },

  // Messages de validation
  validation: {
    required: 'Ce champ est requis',
    email: 'Format d\'email invalide',
    password: 'Le mot de passe doit contenir au moins 6 caractères',
    passwordMatch: 'Les mots de passe ne correspondent pas',
  },
}; 