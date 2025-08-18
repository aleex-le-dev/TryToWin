import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const A11Y_KEYS = {
  HIGH_CONTRAST: "a11y_high_contrast",
  LARGE_TOUCH_TARGETS: "a11y_large_touch_targets",
  RESPECT_OS_PREFS: "a11y_respect_os_prefs",
  REDUCE_MOTION: "a11y_reduce_motion",
  LARGER_SPACING: "a11y_larger_spacing",
  SHOW_TUTORIALS: "a11y_show_tutorials",
  HAPTICS: "a11y_haptics",
  SOUNDS: "a11y_sounds",
};

const defaultState = {
  highContrast: false,
  largeTouchTargets: false,
  respectOsPrefs: false,
  reduceMotion: false,
  largerSpacing: false,
  showTutorials: false,
  haptics: false,
  sounds: false,
};

const AccessibilityContext = createContext({
  ...defaultState,
  setHighContrast: () => {},
  setLargeTouchTargets: () => {},
  setRespectOsPrefs: () => {},
  setReduceMotion: () => {},
  setLargerSpacing: () => {},
  setShowTutorials: () => {},
  setHaptics: () => {},
  setSounds: () => {},
  refreshFromStorage: async () => {},
});

export const AccessibilityProvider = ({ children }) => {
  const [state, setState] = useState(defaultState);

  useEffect(() => {
    refreshFromStorage();
  }, []);

  const persist = async (key, value) => {
    try { await AsyncStorage.setItem(key, String(value)); } catch {}
  };

  const setHighContrast = (v) => { setState((s) => ({ ...s, highContrast: v })); persist(A11Y_KEYS.HIGH_CONTRAST, v); };
  const setLargeTouchTargets = (v) => { setState((s) => ({ ...s, largeTouchTargets: v })); persist(A11Y_KEYS.LARGE_TOUCH_TARGETS, v); };
  const setRespectOsPrefs = (v) => { setState((s) => ({ ...s, respectOsPrefs: v })); persist(A11Y_KEYS.RESPECT_OS_PREFS, v); };
  const setReduceMotion = (v) => { setState((s) => ({ ...s, reduceMotion: v })); persist(A11Y_KEYS.REDUCE_MOTION, v); };
  const setLargerSpacing = (v) => { setState((s) => ({ ...s, largerSpacing: v })); persist(A11Y_KEYS.LARGER_SPACING, v); };
  const setShowTutorials = (v) => { setState((s) => ({ ...s, showTutorials: v })); persist(A11Y_KEYS.SHOW_TUTORIALS, v); };
  const setHaptics = (v) => { setState((s) => ({ ...s, haptics: v })); persist(A11Y_KEYS.HAPTICS, v); };
  const setSounds = (v) => { setState((s) => ({ ...s, sounds: v })); persist(A11Y_KEYS.SOUNDS, v); };

  const refreshFromStorage = async () => {
    try {
      const keys = Object.values(A11Y_KEYS);
      const arr = await AsyncStorage.multiGet(keys);
      const map = Object.fromEntries(arr);
      setState((s) => ({
        ...s,
        highContrast: map[A11Y_KEYS.HIGH_CONTRAST] ? map[A11Y_KEYS.HIGH_CONTRAST] === "true" : s.highContrast,
        largeTouchTargets: map[A11Y_KEYS.LARGE_TOUCH_TARGETS] ? map[A11Y_KEYS.LARGE_TOUCH_TARGETS] === "true" : s.largeTouchTargets,
        respectOsPrefs: map[A11Y_KEYS.RESPECT_OS_PREFS] ? map[A11Y_KEYS.RESPECT_OS_PREFS] === "true" : s.respectOsPrefs,
        reduceMotion: map[A11Y_KEYS.REDUCE_MOTION] ? map[A11Y_KEYS.REDUCE_MOTION] === "true" : s.reduceMotion,
        largerSpacing: map[A11Y_KEYS.LARGER_SPACING] ? map[A11Y_KEYS.LARGER_SPACING] === "true" : s.largerSpacing,
        showTutorials: map[A11Y_KEYS.SHOW_TUTORIALS] ? map[A11Y_KEYS.SHOW_TUTORIALS] === "true" : s.showTutorials,
        haptics: map[A11Y_KEYS.HAPTICS] ? map[A11Y_KEYS.HAPTICS] === "true" : s.haptics,
        sounds: map[A11Y_KEYS.SOUNDS] ? map[A11Y_KEYS.SOUNDS] === "true" : s.sounds,
      }));
    } catch {}
  };

  return (
    <AccessibilityContext.Provider value={{
      ...state,
      setHighContrast,
      setLargeTouchTargets,
      setRespectOsPrefs,
      setReduceMotion,
      setLargerSpacing,
      setShowTutorials,
      setHaptics,
      setSounds,
      refreshFromStorage,
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => useContext(AccessibilityContext);


