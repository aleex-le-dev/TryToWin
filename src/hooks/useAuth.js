// Hook personnalisé pour l'authentification
// Simplifie l'utilisation de l'authentification dans les composants

import { useState, useEffect } from "react";
import { authService } from "../services/authService";
import { User } from "../models/User";

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

    const result = await authService.loginWithEmail(email, password);

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
    return result;
  };

  const register = async (email, password, displayName) => {
    setLoading(true);
    setError(null);

    const result = await authService.registerWithEmail(
      email,
      password,
      displayName
    );

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
    return result;
  };

  const logout = async () => {
    setLoading(true);
    setError(null);

    const result = await authService.logout();

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
    return result;
  };

  const resetPassword = async (email) => {
    setLoading(true);
    setError(null);

    const result = await authService.resetPassword(email);

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
    return result;
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
