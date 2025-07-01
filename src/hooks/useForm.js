// Hook personnalisé pour la gestion des formulaires avec validation
// Simplifie la gestion des formulaires avec Yup

import { useState, useCallback } from "react";
import { validateForm } from "../schemas/validationSchemas";

export const useForm = (initialValues = {}, validationSchema = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mise à jour des valeurs
  const handleChange = useCallback(
    (name, value) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      // Effacer l'erreur si le champ est modifié
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [errors]
  );

  // Gestion du focus/blur
  const handleBlur = useCallback(
    (name) => {
      setTouched((prev) => ({ ...prev, [name]: true }));

      // Validation en temps réel si un schéma est fourni
      if (validationSchema) {
        validateField(name, values[name]);
      }
    },
    [validationSchema, values]
  );

  // Validation d'un champ spécifique
  const validateField = useCallback(
    async (name, value) => {
      if (!validationSchema) return;

      try {
        await validationSchema.validateAt(name, { [name]: value });
        setErrors((prev) => ({ ...prev, [name]: "" }));
      } catch (error) {
        setErrors((prev) => ({ ...prev, [name]: error.message }));
      }
    },
    [validationSchema]
  );

  // Validation complète du formulaire
  const validateForm = useCallback(async () => {
    if (!validationSchema) return { isValid: true, errors: {} };

    try {
      await validationSchema.validate(values, { abortEarly: false });
      setErrors({});
      return { isValid: true, errors: {} };
    } catch (error) {
      const newErrors = {};
      error.inner.forEach((err) => {
        newErrors[err.path] = err.message;
      });
      setErrors(newErrors);
      return { isValid: false, errors: newErrors };
    }
  }, [validationSchema, values]);

  // Soumission du formulaire
  const handleSubmit = useCallback(
    async (onSubmit) => {
      setIsSubmitting(true);

      const validation = await validateForm();

      if (validation.isValid) {
        try {
          await onSubmit(values);
        } catch (error) {
          console.warn("Erreur lors de la soumission:", error);
        }
      }

      setIsSubmitting(false);
    },
    [validateForm, values]
  );

  // Réinitialisation du formulaire
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Vérification si le formulaire est valide
  const isValid =
    Object.keys(errors).length === 0 &&
    Object.keys(values).every(
      (key) => values[key] !== "" && values[key] !== null
    );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues,
    setErrors,
  };
};
