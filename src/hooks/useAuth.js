// Hook personnalisé pour l'authentification
// Simplifie l'utilisation de l'authentification dans les composants

import { useState, useEffect } from "react";
import { authService } from "../services/authService";
import { User } from "../models/User";
import { logError, logInfo } from "../utils/errorHandler";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Écouteur d'état d'authentification
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
      setError(null);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const result = await authService.loginWithEmail(email, password);

      if (!result.success) {
        setError(result.error);
        logError(
          new Error(`Login failed in hook: ${result.error}`),
          "useAuth.login"
        );
      }

      setLoading(false);
      return result;
    } catch (error) {
      logError(error, "useAuth.login");
      setError("Une erreur inattendue est survenue");
      setLoading(false);
      return { success: false, error: "Une erreur inattendue est survenue" };
    }
  };

  const register = async (email, password, displayName) => {
    setLoading(true);
    setError(null);

    try {
      const result = await authService.registerWithEmail(
        email,
        password,
        displayName
      );

      if (!result.success) {
        setError(result.error);
        logError(
          new Error(`Registration failed in hook: ${result.error}`),
          "useAuth.register"
        );
      }

      setLoading(false);
      return result;
    } catch (error) {
      logError(error, "useAuth.register");
      setError("Une erreur inattendue est survenue");
      setLoading(false);
      return { success: false, error: "Une erreur inattendue est survenue" };
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await authService.logout();

      if (!result.success) {
        setError(result.error);
        logError(
          new Error(`Logout failed in hook: ${result.error}`),
          "useAuth.logout"
        );
      }

      setLoading(false);
      return result;
    } catch (error) {
      logError(error, "useAuth.logout");
      setError("Une erreur inattendue est survenue");
      setLoading(false);
      return { success: false, error: "Une erreur inattendue est survenue" };
    }
  };

  const resetPassword = async (email) => {
    setLoading(true);
    setError(null);

    try {
      const result = await authService.resetPassword(email);

      if (!result.success) {
        setError(result.error);
        logError(
          new Error(`Password reset failed in hook: ${result.error}`),
          "useAuth.resetPassword"
        );
      }

      setLoading(false);
      return result;
    } catch (error) {
      logError(error, "useAuth.resetPassword");
      setError("Une erreur inattendue est survenue");
      setLoading(false);
      return { success: false, error: "Une erreur inattendue est survenue" };
    }
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
    isAuthenticated: !!user,
  };
};
