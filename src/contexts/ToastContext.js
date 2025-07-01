// Contexte Toast pour affichage global de notifications stylées
// Utilisation : const { showToast } = useToast();
import React, { createContext, useContext, useState, useCallback } from "react";
import CustomToast from "../components/CustomToast";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({
    visible: false,
    type: "info",
    title: "",
    message: "",
  });

  const showToast = useCallback(
    ({ type = "info", title = "", message = "" }) => {
      setToast({ visible: true, type, title, message });
    },
    []
  );

  const hideToast = useCallback(() => {
    setToast((t) => ({ ...t, visible: false }));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <CustomToast {...toast} onHide={hideToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
