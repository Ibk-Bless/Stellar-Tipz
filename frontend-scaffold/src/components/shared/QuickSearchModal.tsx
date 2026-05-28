import React, { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Profile } from "@/types";
import CreatorSearch from "./CreatorSearch";

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const backdropRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSelect = (profile: Profile) => {
    onClose();
    navigate(`/@${profile.username}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
        role="presentation"
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-lg border-[3px] border-black bg-white"
        style={{ boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)" }}
        role="dialog"
        aria-modal="true"
        aria-label="Quick search"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-[3px] border-black px-4 py-3">
          <div className="flex items-center gap-2">
            <Search size={16} className="text-gray-800 dark:text-gray-200" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-800 dark:text-gray-200">
              Quick search
            </span>
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center border-2 border-black p-1 hover:bg-black hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            aria-label="Close search"
          >
            <X size={14} />
          </button>
        </div>

        {/* Search input */}
        <div className="p-4">
          <CreatorSearch
            onSelect={handleSelect}
            placeholder="Search by username or Stellar address…"
          />
        </div>

        {/* Footer hint */}
        <div className="border-t-2 border-black px-4 py-2">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Press{" "}
            <kbd className="border border-gray-300 px-1 font-mono text-xs">
              Esc
            </kbd>{" "}
            to close
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuickSearchModal;
