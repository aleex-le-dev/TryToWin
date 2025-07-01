// Service API avec Axios pour les appels HTTP
// Centralise la configuration et les requêtes vers le serveur

import axios from "axios";
import { auth } from "../utils/firebaseConfig";

// Configuration de base d'Axios
const apiClient = axios.create({
  baseURL: "https://api.trytowin.com", // URL de votre API
  timeout: 10000, // Timeout de 10 secondes
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use(
  async (config) => {
    // Ajouter le token d'authentification si disponible
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Gestion des erreurs HTTP
    if (error.response) {
      // Erreur de réponse du serveur
      console.warn("[API Error]", error.response.status, error.response.data);
    } else if (error.request) {
      // Erreur de requête (pas de réponse)
      console.warn("[API Error]", "Pas de réponse du serveur");
    } else {
      // Erreur de configuration
      console.warn("[API Error]", error.message);
    }
    return Promise.reject(error);
  }
);

class ApiService {
  // Méthodes GET
  async get(endpoint, params = {}) {
    try {
      const response = await apiClient.get(endpoint, { params });
      return { success: true, data: response.data, error: null };
    } catch (error) {
      return { success: false, data: null, error: this.handleError(error) };
    }
  }

  // Méthodes POST
  async post(endpoint, data = {}) {
    try {
      const response = await apiClient.post(endpoint, data);
      return { success: true, data: response.data, error: null };
    } catch (error) {
      return { success: false, data: null, error: this.handleError(error) };
    }
  }

  // Méthodes PUT
  async put(endpoint, data = {}) {
    try {
      const response = await apiClient.put(endpoint, data);
      return { success: true, data: response.data, error: null };
    } catch (error) {
      return { success: false, data: null, error: this.handleError(error) };
    }
  }

  // Méthodes DELETE
  async delete(endpoint) {
    try {
      const response = await apiClient.delete(endpoint);
      return { success: true, data: response.data, error: null };
    } catch (error) {
      return { success: false, data: null, error: this.handleError(error) };
    }
  }

  // Gestion des erreurs
  handleError(error) {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          return "Requête invalide";
        case 401:
          return "Non autorisé";
        case 403:
          return "Accès interdit";
        case 404:
          return "Ressource non trouvée";
        case 500:
          return "Erreur serveur";
        default:
          return data?.message || "Une erreur est survenue";
      }
    } else if (error.request) {
      return "Erreur de connexion réseau";
    } else {
      return error.message || "Une erreur est survenue";
    }
  }
}

export const apiService = new ApiService();

// Endpoints spécifiques
export const endpoints = {
  // Utilisateurs
  users: {
    profile: "/users/profile",
    update: "/users/update",
    scores: "/users/scores",
  },

  // Jeux
  games: {
    list: "/games",
    details: (id) => `/games/${id}`,
    scores: (id) => `/games/${id}/scores`,
  },

  // Scores
  scores: {
    create: "/scores",
    leaderboard: "/scores/leaderboard",
    userScores: (userId) => `/scores/user/${userId}`,
  },
};
