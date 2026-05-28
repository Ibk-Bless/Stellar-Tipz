import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Keyboard, Moon, Sun, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { getModifierKey } from "@/hooks/useKeyboardShortcuts";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useTheme } from "@/hooks/useTheme";
import { useWallet } from "@/hooks/useWallet";
import { useI18n } from "@/i18n";
import NetworkBadge from "../shared/NetworkBadge";
import WalletSwitcher from "../shared/WalletSwitcher";
import Button from "../ui/Button";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navDashboard: React.ReactNode;
  onKeyboardShortcuts: () => void;
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

interface MobileNavItem {
  to: string;
  label?: string;
  labelKey?: string;
}

const navItems: MobileNavItem[] = [
  { to: "/leaderboard", labelKey: "nav.leaderboard" },
  { to: "/dashboard", labelKey: "nav.dashboard" },
  { to: "/transactions", label: "Transactions" },
  { to: "/profile", labelKey: "nav.profile" },
];

const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  navDashboard,
  onKeyboardShortcuts,
}) => {
  const { t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { connected, publicKey, connect, disconnect } = useWallet();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const drawerRef = useRef<HTMLDivElement>(null);
  const pointerStartX = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = Array.from<HTMLElement>(
        drawerRef.current?.querySelectorAll(FOCUSABLE) ?? [],
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    drawerRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const walletLabel =
    connected && publicKey
      ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`
      : t("wallet.connect");

  const shadow =
    theme === "dark"
      ? "4px 4px 0px 0px rgba(255,255,255,1)"
      : "4px 4px 0px 0px rgba(0,0,0,1)";

  const handleWalletAction = () => {
    if (connected) {
      disconnect();
    } else {
      void connect();
    }
    onClose();
  };

  const handleKeyboardShortcuts = () => {
    onKeyboardShortcuts();
    onClose();
  };

  const navLinkClass =
    "block border-2 px-4 py-3 text-base font-black uppercase tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
          onMouseDown={onClose}
        >
          <motion.div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="ml-auto flex h-full w-full max-w-sm flex-col border-l-3 border-black bg-white text-black shadow-brutalist dark:border-white dark:bg-black dark:text-white"
            initial={{ x: shouldReduceMotion ? 0 : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: shouldReduceMotion ? 0 : "100%" }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: "easeOut" }}
            onPointerDown={(event) => {
              pointerStartX.current = event.clientX;
            }}
            onPointerUp={(event) => {
              const startX = pointerStartX.current;
              pointerStartX.current = null;
              if (!shouldReduceMotion && startX !== null && event.clientX - startX > 80) {
                onClose();
              }
            }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b-3 border-black px-4 py-4 dark:border-white">
              <Link
                to="/"
                className="text-2xl font-black tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 dark:focus-visible:ring-white"
                onClick={onClose}
              >
                TIPZ*
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-10 min-w-10 items-center justify-center border-2 border-black bg-white p-2 dark:border-white dark:bg-black"
                aria-label="Close navigation menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-5">
              <nav aria-label="Mobile navigation">
                <ul className="flex flex-col gap-3">
                  {navItems.map((item) => {
                    const isCurrent = location.pathname === item.to;
                    const label =
                      item.to === "/dashboard"
                        ? navDashboard
                        : item.label ?? t(item.labelKey ?? "");

                    return (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          onClick={onClose}
                          aria-current={isCurrent ? "page" : undefined}
                          className={`${navLinkClass} ${
                            isCurrent
                              ? "border-black bg-yellow-200 text-black dark:border-white dark:bg-yellow-300"
                              : "border-black bg-white dark:border-white dark:bg-black dark:text-white"
                          }`}
                        >
                          {label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="mt-auto flex flex-col gap-3 border-t-2 border-black pt-4 dark:border-white">
                <div className="flex items-center justify-between gap-3 px-1">
                  <span className="text-xs font-bold uppercase tracking-wide">
                    {t("nav.theme")}
                  </span>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="inline-flex min-h-10 min-w-10 items-center justify-center border-2 border-black bg-white p-2 transition-opacity hover:opacity-70 dark:border-white dark:bg-black"
                    style={{ boxShadow: shadow }}
                    aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                  >
                    {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3 px-1">
                  <span className="text-xs font-bold uppercase tracking-wide">
                    {t("nav.network")}
                  </span>
                  <NetworkBadge />
                </div>

                <button
                  type="button"
                  onClick={handleKeyboardShortcuts}
                  className="flex min-h-10 items-center justify-between border-2 border-black bg-white px-3 py-2 text-xs font-bold uppercase dark:border-white dark:bg-black dark:text-white"
                >
                  Keyboard shortcuts ({getModifierKey()} + /)
                  <Keyboard size={16} aria-hidden="true" />
                </button>

                {connected ? (
                  <>
                    <WalletSwitcher onAddWallet={connect} />
                    <Button className="w-full" variant="outline" onClick={handleWalletAction}>
                      Disconnect {walletLabel}
                    </Button>
                  </>
                ) : (
                  <Button className="w-full" onClick={handleWalletAction}>
                    {walletLabel}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileDrawer;
