import { useEffect, useState } from 'react';

type ReduceMotionPreference = 'auto' | 'always';

const SETTINGS_STORAGE_KEY = 'tipz_settings';
export const REDUCED_MOTION_SETTINGS_EVENT = 'tipz:settings-updated';

const readReduceMotionPreference = (): ReduceMotionPreference => {
  if (typeof window === 'undefined') {
    return 'auto';
  }

  try {
    const saved = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!saved) {
      return 'auto';
    }

    const parsed = JSON.parse(saved) as { reduceMotion?: string };
    return parsed?.reduceMotion === 'always' ? 'always' : 'auto';
  } catch {
    return 'auto';
  }
};

const getReducedMotionMediaQuery = () => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return null;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)');
};

const shouldReduceMotion = () => {
  return readReduceMotionPreference() === 'always' || getReducedMotionMediaQuery()?.matches === true;
};

export const notifyReducedMotionSettingsChanged = () => {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new Event(REDUCED_MOTION_SETTINGS_EVENT));
};

export const useReducedMotion = (): boolean => {
  const [reduceMotion, setReduceMotion] = useState(() => shouldReduceMotion());

  useEffect(() => {
    const updatePreference = () => {
      setReduceMotion(shouldReduceMotion());
    };

    const mediaQuery = getReducedMotionMediaQuery();

    const handleMediaChange = () => {
      if (readReduceMotionPreference() === 'auto') {
        updatePreference();
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === SETTINGS_STORAGE_KEY || event.key === null) {
        updatePreference();
      }
    };

    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else if (mediaQuery?.addListener) {
      mediaQuery.addListener(handleMediaChange);
    }

    window.addEventListener('storage', handleStorage);
    window.addEventListener(REDUCED_MOTION_SETTINGS_EVENT, updatePreference);

    return () => {
      if (mediaQuery?.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else if (mediaQuery?.removeListener) {
        mediaQuery.removeListener(handleMediaChange);
      }

      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(REDUCED_MOTION_SETTINGS_EVENT, updatePreference);
    };
  }, []);

  return reduceMotion;
};

