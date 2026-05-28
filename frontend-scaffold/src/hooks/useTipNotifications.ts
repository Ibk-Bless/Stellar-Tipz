import { useCallback, useEffect, useRef, useState } from "react";

import { stroopToXlm } from "@/helpers/format";
import { useContract } from "@/hooks/useContract";
import type { Tip } from "@/types/contract";

const POLL_INTERVAL_MS = 15_000;
const SETTINGS_KEY = "tipz_notification_settings";
const SEEN_KEY_PREFIX = "tipz_seen_tip_ids:";
const UNSEEN_TIPS_KEY = "tipz_unseen_tips";

export interface TipNotificationSettings {
  sound: boolean;
  desktop: boolean;
}

const defaultSettings: TipNotificationSettings = {
  sound: true,
  desktop: false,
};

const readSettings = (): TipNotificationSettings => {
  try {
    const stored = window.localStorage.getItem(SETTINGS_KEY);
    return stored
      ? { ...defaultSettings, ...JSON.parse(stored) }
      : defaultSettings;
  } catch {
    return defaultSettings;
  }
};

const writeSettings = (settings: TipNotificationSettings) => {
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

const emitUnseenChange = () => {
  window.dispatchEvent(new Event("tipz:unseen-tips"));
};

const playTipSound = () => {
  const audio = new Audio(
    "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=",
  );
  audio.volume = 0.22;
  void audio.play().catch(() => undefined);
};

const formatTipTitle = (tip: Tip) => `New tip: ${stroopToXlm(tip.amount)} XLM`;

const formatTipBody = (tip: Tip) => {
  const tipper =
    tip.tipper.length > 12
      ? `${tip.tipper.slice(0, 6)}...${tip.tipper.slice(-6)}`
      : tip.tipper;
  return tip.message ? `${tipper}: ${tip.message}` : `From ${tipper}`;
};

export const useNotificationPreferences = () => {
  const [settings, setSettings] = useState<TipNotificationSettings>(() =>
    readSettings(),
  );

  const updateSettings = useCallback(
    (next: Partial<TipNotificationSettings>) => {
      setSettings((current) => {
        const updated = { ...current, ...next };
        writeSettings(updated);
        return updated;
      });
    },
    [],
  );

  return { settings, updateSettings };
};

export const useTipNotifications = (creatorAddress?: string) => {
  const { getRecentTips } = useContract();
  const { settings, updateSettings } = useNotificationPreferences();
  const [latestTip, setLatestTip] = useState<Tip | null>(null);
  const [unseenCount, setUnseenCount] = useState(() =>
    Number(window.localStorage.getItem(UNSEEN_TIPS_KEY) || "0"),
  );
  const initializedRef = useRef(false);

  const markSeen = useCallback(() => {
    setUnseenCount(0);
    window.localStorage.setItem(UNSEEN_TIPS_KEY, "0");
    emitUnseenChange();
  }, []);

  useEffect(() => {
    if (!creatorAddress) return;

    let cancelled = false;
    const seenKey = `${SEEN_KEY_PREFIX}${creatorAddress}`;

    const notify = async (tip: Tip) => {
      setLatestTip(tip);

      setUnseenCount((current) => {
        const next = current + 1;
        window.localStorage.setItem(UNSEEN_TIPS_KEY, String(next));
        emitUnseenChange();
        return next;
      });

      if (settings.sound) {
        playTipSound();
      }

      if (settings.desktop && "Notification" in window) {
        const show = () =>
          new Notification(formatTipTitle(tip), {
            body: formatTipBody(tip),
          });

        if (Notification.permission === "granted") {
          show();
        } else if (Notification.permission === "default") {
          const permission = await Notification.requestPermission();
          if (permission === "granted") show();
        }
      }
    };

    const poll = async () => {
      try {
        const tips = await getRecentTips(creatorAddress, 10, 0);
        if (cancelled) return;

        const storedSeen = new Set(
          JSON.parse(window.localStorage.getItem(seenKey) || "[]") as number[],
        );

        if (!initializedRef.current) {
          window.localStorage.setItem(
            seenKey,
            JSON.stringify(tips.map((tip) => tip.id)),
          );
          initializedRef.current = true;
          return;
        }

        const newTips = tips
          .filter((tip) => !storedSeen.has(tip.id))
          .sort((a, b) => a.timestamp - b.timestamp);

        if (newTips.length === 0) return;

        window.localStorage.setItem(
          seenKey,
          JSON.stringify(
            [...storedSeen, ...newTips.map((tip) => tip.id)].slice(-100),
          ),
        );

        for (const tip of newTips) {
          await notify(tip);
        }
      } catch (error) {
        console.error("Failed to poll new tips:", error);
      }
    };

    void poll();
    const intervalId = window.setInterval(() => void poll(), POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [creatorAddress, getRecentTips, settings.desktop, settings.sound]);

  return {
    latestTip,
    markSeen,
    settings,
    unseenCount,
    updateSettings,
  };
};
