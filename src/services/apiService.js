// Service API avec Axios pour les appels HTTP
// Centralise la configuration et les requêtes vers le serveur

import axios from "axios";
import { auth } from "../utils/firebaseConfig";
import {
  handleApiError,
  handleNetworkError,
  logInfo,
  logSuccess,
} from "../utils/errorHandler";

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
    // Gestion des erreurs HTTP avec le nouveau système
    if (error.response) {
      // Erreur de réponse du serveur
      handleApiError(error, "ApiService.interceptor");
    } else if (error.request) {
      // Erreur de requête (pas de réponse)
      handleNetworkError(error, "ApiService.interceptor");
    } else {
      // Erreur de configuration
      handleApiError(error, "ApiService.interceptor");
    }
    return Promise.reject(error);
  }
);

class ApiService {
  // Méthodes GET
  async get(endpoint, params = {}) {
    try {
      logInfo(`GET ${endpoint}`, "ApiService.get");

      const response = await apiClient.get(endpoint, { params });

      logSuccess(`GET ${endpoint} - Succès`, "ApiService.get");

      return { success: true, data: response.data, error: null };
    } catch (error) {
      const apiError = handleApiError(error, `ApiService.get - ${endpoint}`);
      return { success: false, data: null, error: apiError.error };
    }
  }

  // Méthodes POST
  async post(endpoint, data = {}) {
    try {
      logInfo(`POST ${endpoint}`, "ApiService.post");

      const response = await apiClient.post(endpoint, data);

      logSuccess(`POST ${endpoint} - Succès`, "ApiService.post");

      return { success: true, data: response.data, error: null };
    } catch (error) {
      const apiError = handleApiError(error, `ApiService.post - ${endpoint}`);
      return { success: false, data: null, error: apiError.error };
    }
  }

  // Méthodes PUT
  async put(endpoint, data = {}) {
    try {
      logInfo(`PUT ${endpoint}`, "ApiService.put");

      const response = await apiClient.put(endpoint, data);

      logSuccess(`PUT ${endpoint} - Succès`, "ApiService.put");

      return { success: true, data: response.data, error: null };
    } catch (error) {
      const apiError = handleApiError(error, `ApiService.put - ${endpoint}`);
      return { success: false, data: null, error: apiError.error };
    }
  }

  // Méthodes DELETE
  async delete(endpoint) {
    try {
      logInfo(`DELETE ${endpoint}`, "ApiService.delete");

      const response = await apiClient.delete(endpoint);

      logSuccess(`DELETE ${endpoint} - Succès`, "ApiService.delete");

      return { success: true, data: response.data, error: null };
    } catch (error) {
      const apiError = handleApiError(error, `ApiService.delete - ${endpoint}`);
      return { success: false, data: null, error: apiError.error };
    }
  }

  // Gestion des erreurs (maintenu pour compatibilité)
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
