import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'tipz_onboarding';
const EVENT_NAME = 'tipz:onboarding-start';

const hasCompletedOnboarding = () => {
  if (typeof window === 'undefined') return true;

  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'completed';
  } catch {
    return false;
  }
};

export const startOnboardingTour = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(EVENT_NAME));
};

export const useOnboarding = () => {
  const [completed, setCompleted] = useState(() => hasCompletedOnboarding());
  const [isTourOpen, setIsTourOpen] = useState(() => !hasCompletedOnboarding());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStart = () => {
      setIsTourOpen(true);
      setCompleted(false);
    };

    window.addEventListener(EVENT_NAME, handleStart);

    return () => {
      window.removeEventListener(EVENT_NAME, handleStart);
    };
  }, []);

  const completeTour = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, 'completed');
    } catch {
      // Keep the current session quiet even if storage is unavailable.
    }
    setCompleted(true);
    setIsTourOpen(false);
  }, []);

  const skipTour = useCallback(() => {
    completeTour();
  }, [completeTour]);

  const resetTour = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // The replay event still opens the tour for this session.
    }
    setCompleted(false);
    setIsTourOpen(true);
  }, []);

  return {
    isTourOpen,
    completed,
    completeTour,
    skipTour,
    resetTour,
  };
};
