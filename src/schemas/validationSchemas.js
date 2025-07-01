// Schémas de validation Yup centralisés
// Utilisé dans tous les formulaires pour valider les données

import * as yup from "yup";

// Schéma de base pour l'email
const emailSchema = yup
  .string()
  .email("Format d'email invalide")
  .required("L'email est requis")
  .trim()
  .max(100, "L'email est trop long");

// Schéma de base pour le mot de passe
const passwordSchema = yup
  .string()
  .required("Le mot de passe est requis")
  .min(6, "Le mot de passe doit contenir au moins 6 caractères")
  .max(50, "Le mot de passe est trop long")
  .matches(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
  .matches(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
  .matches(
    /[@$!%*?&]/,
    "Le mot de passe doit contenir au moins un caractère spécial (@$!%*?&)"
  );

// Schémas d'authentification
export const authSchemas = {
  login: yup.object().shape({
    email: emailSchema,
    password: yup
      .string()
      .required("Le mot de passe est requis")
      .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  }),

  register: yup.object().shape({
    username: yup
      .string()
      .required("Le nom d'utilisateur est requis")
      .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
      .max(20, "Le nom d'utilisateur est trop long")
      .matches(
        /^[a-zA-Z0-9_]+$/,
        "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores"
      )
      .trim(),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: yup
      .string()
      .required("La confirmation du mot de passe est requise")
      .oneOf(
        [yup.ref("password"), null],
        "Les mots de passe ne correspondent pas"
      ),
    acceptTerms: yup
      .boolean()
      .oneOf([true], "Vous devez accepter les conditions d'utilisation"),
  }),
};

// Schémas de profil utilisateur
export const profileSchemas = {
  updateProfile: yup.object().shape({
    displayName: yup
      .string()
      .min(2, "Le nom doit contenir au moins 2 caractères")
      .max(50, "Le nom est trop long")
      .trim(),
    bio: yup.string().max(200, "La bio est trop longue").trim(),
    country: yup.string().max(3, "Code pays invalide"),
  }),
};

// Schémas de jeu
export const gameSchemas = {
  createGame: yup.object().shape({
    name: yup
      .string()
      .required("Le nom du jeu est requis")
      .min(3, "Le nom doit contenir au moins 3 caractères")
      .max(50, "Le nom est trop long"),
    description: yup.string().max(500, "La description est trop longue"),
    category: yup.string().required("La catégorie est requise"),
    difficulty: yup
      .string()
      .oneOf(["easy", "medium", "hard"], "Difficulté invalide"),
  }),
};

// Fonction utilitaire pour valider
export const validateForm = async (schema, data) => {
  try {
    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    const errors = {};
    error.inner.forEach((err) => {
      errors[err.path] = err.message;
    });
    return { isValid: false, errors };
  }
};

// Fonction pour vérifier la force du mot de passe
export const checkPasswordStrength = (password) => {
  const checks = {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[@$!%*?&]/.test(password),
  };

  const strength = Object.values(checks).filter(Boolean).length;

  let strengthText = "";
  let strengthColor = "";

  if (strength <= 2) {
    strengthText = "Faible";
    strengthColor = "#ff6b6b";
  } else if (strength <= 4) {
    strengthText = "Moyen";
    strengthColor = "#ffa726";
  } else {
    strengthText = "Fort";
    strengthColor = "#4caf50";
  }

  return {
    checks,
    strength,
    strengthText,
    strengthColor,
    isValid: strength >= 4,
  };
};
