import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type StoredPayload<T extends Record<string, unknown>> = {
  version: 1;
  savedAt: number;
  data: T;
};

export type UseFormAutosaveOptions<T extends Record<string, unknown>> = {
  storageKey: string;
  data: T;
  onRestore: (data: T) => void;
  enabled?: boolean;
  intervalMs?: number;
  ttlMs?: number;
  restorePrompt?: string;
};

export type UseFormAutosaveResult = {
  hasRestorableData: boolean;
  clearSaved: () => void;
};

const DEFAULT_INTERVAL_MS = 5_000;
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1_000;

function safeParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function useFormAutosave<T extends Record<string, unknown>>(
  options: UseFormAutosaveOptions<T>,
): UseFormAutosaveResult {
  const {
    storageKey,
    data,
    onRestore,
    enabled = true,
    intervalMs = DEFAULT_INTERVAL_MS,
    ttlMs = DEFAULT_TTL_MS,
    restorePrompt = "Restore saved data?",
  } = options;

  const dataRef = useRef(data);
  dataRef.current = data;

  const [hasRestorableData, setHasRestorableData] = useState(false);

  const clearSaved = useCallback(() => {
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      // ignore storage failures
    } finally {
      setHasRestorableData(false);
    }
  }, [storageKey]);

  const now = useMemo(() => Date.now(), []);

  useEffect(() => {
    if (!enabled) return;

    let raw: string | null = null;
    try {
      raw = sessionStorage.getItem(storageKey);
    } catch {
      raw = null;
    }

    if (!raw) return;

    const parsed = safeParse<StoredPayload<T>>(raw);
    if (!parsed || parsed.version !== 1 || typeof parsed.savedAt !== "number") {
      clearSaved();
      return;
    }

    if (now - parsed.savedAt > ttlMs) {
      clearSaved();
      return;
    }

    setHasRestorableData(true);
    const shouldRestore = (() => {
      try {
        return window.confirm(restorePrompt);
      } catch {
        return false;
      }
    })();

    if (shouldRestore) {
      onRestore(parsed.data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, enabled, ttlMs, restorePrompt, clearSaved]);

  useEffect(() => {
    if (!enabled) return;

    const id = window.setInterval(() => {
      const payload: StoredPayload<T> = {
        version: 1,
        savedAt: Date.now(),
        data: dataRef.current,
      };

      try {
        sessionStorage.setItem(storageKey, JSON.stringify(payload));
        setHasRestorableData(true);
      } catch {
        // ignore storage failures
      }
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [storageKey, enabled, intervalMs]);

  return { hasRestorableData, clearSaved };
}

