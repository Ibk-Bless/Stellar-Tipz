import React, { useEffect, useMemo } from "react";
import { AlertTriangle, CheckCircle2, Clock3, ExternalLink, RotateCcw, X } from "lucide-react";

import CopyButton from "@/components/ui/CopyButton";
import Button from "@/components/ui/Button";
import { useWallet } from "@/hooks/useWallet";

export type TransactionTrackerStatus =
  | "preparing"
  | "signing"
  | "submitting"
  | "confirming"
  | "success"
  | "error";

interface TransactionTrackerProps {
  status: TransactionTrackerStatus;
  txHash?: string;
  errorMessage?: string;
  onRetry?: () => void;
  onCancel?: () => void;
}

const STORAGE_KEY = "tipz_transaction_tracker";

const steps: Array<{
  id: Exclude<TransactionTrackerStatus, "error">;
  label: string;
  estimate: string;
}> = [
  { id: "preparing", label: "Preparing", estimate: "~2 sec" },
  { id: "signing", label: "Signing", estimate: "~10 sec" },
  { id: "submitting", label: "Submitting", estimate: "~8 sec" },
  { id: "confirming", label: "Confirming", estimate: "~12 sec" },
  { id: "success", label: "Complete", estimate: "Done" },
];

const TransactionTracker: React.FC<TransactionTrackerProps> = ({
  status,
  txHash,
  errorMessage,
  onRetry,
  onCancel,
}) => {
  const { network } = useWallet();
  const currentIndex = status === "error"
    ? steps.length - 1
    : Math.max(0, steps.findIndex((step) => step.id === status));
  const isBusy = status !== "success" && status !== "error";

  useEffect(() => {
    const payload = {
      status,
      txHash: txHash ?? null,
      errorMessage: errorMessage ?? null,
      updatedAt: Date.now(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [errorMessage, status, txHash]);

  const explorerHref = useMemo(() => {
    if (!txHash) return null;
    const base =
      network === "PUBLIC"
        ? "https://stellar.expert/explorer/public/tx/"
        : "https://stellar.expert/explorer/testnet/tx/";
    return `${base}${txHash}`;
  }, [network, txHash]);

  const headline =
    status === "error"
      ? "Transaction failed"
      : status === "success"
      ? "Transaction complete"
      : steps[currentIndex]?.label ?? "Preparing";

  return (
    <section
      role={status === "error" ? "alert" : "status"}
      aria-live={status === "error" ? "assertive" : "polite"}
      aria-busy={isBusy ? "true" : "false"}
      aria-label="Transaction progress"
      className="space-y-4 border-3 border-black bg-white p-4 shadow-brutalist dark:border-white dark:bg-black"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-gray-700 dark:text-gray-200">
            Soroban transaction
          </p>
          <h3 className="mt-1 flex items-center gap-2 text-xl font-black uppercase">
            {status === "error" ? (
              <AlertTriangle size={20} aria-hidden="true" />
            ) : status === "success" ? (
              <CheckCircle2 size={20} aria-hidden="true" />
            ) : (
              <Clock3 size={20} aria-hidden="true" />
            )}
            {headline}
          </h3>
        </div>
        {onCancel && (status === "preparing" || status === "signing") && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex min-h-10 min-w-10 items-center justify-center border-2 border-black bg-white p-2 dark:border-white dark:bg-black"
            aria-label="Cancel transaction"
          >
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>

      <ol className="grid gap-2 sm:grid-cols-5">
        {steps.map((step, index) => {
          const isCurrent = status !== "error" && index === currentIndex;
          const isComplete = status === "success" || index < currentIndex;

          return (
            <li
              key={step.id}
              className={`border-2 p-3 ${
                isComplete
                  ? "border-black bg-yellow-100 text-black"
                  : isCurrent
                  ? "border-black bg-black text-white dark:border-white"
                  : "border-gray-300 bg-gray-50 text-gray-700 dark:bg-zinc-900 dark:text-gray-200"
              }`}
              aria-current={isCurrent ? "step" : undefined}
            >
              <span className="block text-xs font-black uppercase">{step.label}</span>
              <span className="mt-1 block text-xs font-bold">{step.estimate}</span>
            </li>
          );
        })}
      </ol>

      {txHash && (
        <div className="space-y-3 border-2 border-black bg-gray-50 p-3 dark:border-white dark:bg-zinc-900">
          <p className="break-all text-xs font-bold">Hash: {txHash}</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {explorerHref && (
              <a
                href={explorerHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center justify-center gap-2 border-2 border-black bg-white px-3 py-2 text-xs font-black uppercase dark:border-white dark:bg-black"
              >
                View on Stellar Expert
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            )}
            <CopyButton text={txHash} label="Copy TX Hash" />
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col gap-3 border-2 border-red-900 bg-red-50 p-3 text-red-950 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold">
            {errorMessage || "The transaction could not be completed."}
          </p>
          {onRetry && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<RotateCcw size={16} />}
              onClick={onRetry}
            >
              Retry
            </Button>
          )}
        </div>
      )}
    </section>
  );
};

export default TransactionTracker;
