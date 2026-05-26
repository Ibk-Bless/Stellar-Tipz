import React from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowDownToLine,
  ExternalLink,
} from "lucide-react";
import { Transaction } from "../../hooks/useTransactionHistory";
import { stroopToXlm } from "../../helpers/format";
import { useWalletStore } from "../../store/walletStore";

interface TransactionRowProps {
  tx: Transaction;
}

function truncateAddress(addr: string): string {
  if (!addr || addr.length <= 12) return addr || "—";
  return `${addr.slice(0, 6)}…${addr.slice(-6)}`;
}

function formatDate(seconds: number): string {
  return new Date(seconds * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TYPE_CONFIG = {
  received: {
    label: "Received",
    icon: <ArrowDownLeft size={16} />,
    bg: "bg-green-50",
    border: "border-green-400",
    text: "text-green-700",
    amountColor: "text-green-700",
    amountPrefix: "+",
  },
  sent: {
    label: "Sent",
    icon: <ArrowUpRight size={16} />,
    bg: "bg-red-50",
    border: "border-red-400",
    text: "text-red-700",
    amountColor: "text-red-700",
    amountPrefix: "−",
  },
  withdrawal: {
    label: "Withdrawal",
    icon: <ArrowDownToLine size={16} />,
    bg: "bg-blue-50",
    border: "border-blue-400",
    text: "text-blue-700",
    amountColor: "text-blue-700",
    amountPrefix: "↓",
  },
} as const;

const TransactionRow: React.FC<TransactionRowProps> = ({ tx }) => {
  const { network } = useWalletStore();
  const cfg = TYPE_CONFIG[tx.type];

  const explorerBase =
    network === "PUBLIC"
      ? "https://stellar.expert/explorer/public"
      : "https://stellar.expert/explorer/testnet";

  const explorerUrl = tx.txHash
    ? `${explorerBase}/tx/${tx.txHash}`
    : tx.counterparty
    ? `${explorerBase}/account/${tx.counterparty}`
    : null;

  return (
    <article
      className={`flex flex-col gap-3 border-[3px] border-black p-4 transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:flex-row sm:items-start sm:gap-4 ${cfg.bg}`}
    >
      {/* Type badge */}
      <div className="flex shrink-0 items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 border-2 ${cfg.border} ${cfg.text} px-2.5 py-1 text-xs font-black uppercase tracking-wide`}
        >
          {cfg.icon}
          {cfg.label}
        </span>
      </div>

      {/* Main info */}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        {/* Counterparty */}
        {tx.counterparty && (
          <p className="text-xs font-black uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200">
            {tx.type === "received"
              ? "From"
              : tx.type === "sent"
              ? "To"
              : "Account"}
            {": "}
            <span className="font-mono text-black">
              {truncateAddress(tx.counterparty)}
            </span>
          </p>
        )}

        {/* Message */}
        {tx.message && (
          <p className="truncate text-sm font-medium text-gray-700 italic">
            "{tx.message}"
          </p>
        )}

        {/* Withdrawal fee breakdown */}
        {tx.type === "withdrawal" && tx.fee && tx.net && (
          <p className="text-xs text-gray-800 dark:text-gray-200 font-medium">
            Fee: {stroopToXlm(tx.fee, 7)} XLM &nbsp;·&nbsp; Net:{" "}
            {stroopToXlm(tx.net, 7)} XLM
          </p>
        )}
      </div>

      {/* Right side: amount + date + explorer */}
      <div className="flex shrink-0 flex-col items-end gap-1 text-right">
        <p className={`text-lg font-black ${cfg.amountColor}`}>
          {cfg.amountPrefix}
          {stroopToXlm(tx.amount, 7)} XLM
        </p>
        <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
          {formatDate(tx.date)}
        </p>
        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-black underline hover:no-underline"
            aria-label="View on Stellar Explorer"
          >
            Explorer <ExternalLink size={11} />
          </a>
        )}
      </div>
    </article>
  );
};

export default TransactionRow;
