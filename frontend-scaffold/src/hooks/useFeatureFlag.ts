import { useState, useEffect, useCallback } from 'react';
import { isFeatureEnabled, getFeatureValue } from '@/services/featureFlags';

type FlagValue = boolean | number | string;

export function useFeatureFlag(name: string, defaultValue: boolean = false): boolean {
  const [enabled, setEnabled] = useState(() => isFeatureEnabled(name, defaultValue));

  useEffect(() => {
    setEnabled(isFeatureEnabled(name, defaultValue));
  }, [name, defaultValue]);

  return enabled;
}

export function useFeatureValue(name: string, defaultValue?: FlagValue): FlagValue | undefined {
  const [value, setValue] = useState(() => getFeatureValue(name, defaultValue));

  useEffect(() => {
    setValue(getFeatureValue(name, defaultValue));
  }, [name, defaultValue]);

  return value;
}

const listeners: Record<string, Set<() => void>> = {};

export function notifyFlagChange(name: string): void {
  listeners[name]?.forEach((listener) => listener());
}

export function useFlagChange(name: string): void {
  const callback = useCallback(() => {
    notifyFlagChange(name);
  }, [name]);

  useEffect(() => {
    if (!listeners[name]) {
      listeners[name] = new Set();
    }
    listeners[name].add(callback);
    return () => {
      listeners[name]?.delete(callback);
    };
  }, [name, callback]);
}
