import React, { useMemo } from "react";

import { useBalance } from "@/hooks/useBalance";
import { useWalletStore } from "@/store/walletStore";

const DEFAULT_PRESETS = [1, 5, 10, 25, 50, 100];

interface TipAmountPresetsProps {
  value?: string;
  onChange?: (amount: number) => void;
  presets?: number[];
  balance?: number;
}

const TipAmountPresets: React.FC<TipAmountPresetsProps> = ({
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  balance,
}) => {
  const { publicKey } = useWalletStore();
  const { balance: walletBalance } = useBalance(publicKey);
  const availableBalance = useMemo(() => {
    if (typeof balance === "number") return balance;
    return walletBalance ? Number(walletBalance) : undefined;
  }, [balance, walletBalance]);

  return (
    <div className="space-y-2">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-800 dark:text-gray-200">
        Quick amount
      </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {presets.map((preset) => {
          const selected = Number(value) === preset;
          const disabled =
            typeof availableBalance === "number" && preset > availableBalance;

          return (
            <button
              key={preset}
              type="button"
              disabled={disabled}
              onClick={() => onChange?.(preset)}
              className={`min-h-11 border-2 border-black px-2 text-sm font-black uppercase transition-transform ${
                selected ? "bg-black text-white" : "bg-white text-black"
              } ${
                disabled
                  ? "cursor-not-allowed opacity-40"
                  : "hover:-translate-x-0.5 hover:-translate-y-0.5"
              }`}
            >
              {preset} XLM
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TipAmountPresets;
