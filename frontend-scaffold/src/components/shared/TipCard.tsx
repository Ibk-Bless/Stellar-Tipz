import React, { useMemo } from "react";
import Avatar from "../ui/Avatar";
import Card from "../ui/Card";
import AmountDisplay from "./AmountDisplay";
import type { Tip } from "../../types";
import { truncateString } from "../../helpers/format";
import Skeleton from "../ui/Skeleton";
import { useRenderCount } from "../../hooks/useRenderCount";

interface TipCardProps {
  tip: Tip;
  showSender?: boolean;
  showReceiver?: boolean;
}

const formatRelativeTimestamp = (timestamp: number): string => {
  const normalizedTimestamp =
    timestamp < 1_000_000_000_000 ? timestamp * 1000 : timestamp;
  const diffSeconds = Math.max(
    0,
    Math.floor((Date.now() - normalizedTimestamp) / 1000),
  );

  if (diffSeconds < 60) return "just now";
  if (diffSeconds < 3600) {
    const minutes = Math.floor(diffSeconds / 60);
    return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  }
  if (diffSeconds < 86400) {
    const hours = Math.floor(diffSeconds / 3600);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  const days = Math.floor(diffSeconds / 86400);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

const TipCard: React.FC<TipCardProps> = ({
  tip,
  showSender = true,
  showReceiver = true,
}) => {
  useRenderCount("TipCard", `${tip.tipper}:${tip.creator}:${tip.timestamp}`);

  const primaryAddress = useMemo(
    () => (showSender ? tip.tipper : tip.creator),
    [showSender, tip.creator, tip.tipper],
  );
  const primaryLabel = useMemo(() => (showSender ? "From" : "To"), [showSender]);
  const secondaryAddress = useMemo(
    () =>
      showSender && showReceiver
        ? tip.creator
        : showReceiver
          ? tip.tipper
          : null,
    [showReceiver, showSender, tip.creator, tip.tipper],
  );
  const secondaryLabel = useMemo(
    () => (showSender && showReceiver ? "To" : showReceiver ? "From" : null),
    [showReceiver, showSender],
  );
  const primaryAddressLabel = useMemo(
    () => truncateString(primaryAddress),
    [primaryAddress],
  );
  const secondaryAddressLabel = useMemo(
    () => (secondaryAddress ? truncateString(secondaryAddress) : null),
    [secondaryAddress],
  );
  const relativeTimestamp = useMemo(
    () => formatRelativeTimestamp(tip.timestamp),
    [tip.timestamp],
  );

  return (
    <button
      type="button"
      className="block w-full text-left"
      aria-label={`Open tip card for ${primaryAddressLabel}`}
    >
      <Card hover className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar
              address={primaryAddress}
              alt={`${primaryLabel} ${primaryAddress}`}
              size="md"
            />
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-800 dark:text-gray-200">
                {primaryLabel}
              </p>
              <p className="truncate text-sm font-black">
                {primaryAddressLabel}
              </p>
              {secondaryAddressLabel && secondaryLabel && (
                <p className="mt-1 truncate text-xs font-bold text-gray-600">
                  {secondaryLabel}: {secondaryAddressLabel}
                </p>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 border-2 border-black bg-yellow-100 px-3 py-2">
            <AmountDisplay amount={tip.amount} />
          </div>
        </div>

        <p
          className="overflow-hidden text-sm font-medium leading-6 text-gray-700"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {tip.message || "No message attached."}
        </p>

        <div className="flex items-center justify-between border-t-2 border-dashed border-black pt-3">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-800 dark:text-gray-200">
            Tip activity
          </span>
          <span className="text-xs font-bold">
            {relativeTimestamp}
          </span>
        </div>
      </Card>
    </button>
  );
};

export default React.memo(TipCard);

export const TipCardSkeleton: React.FC = () => {
  return (
    <div role="status" aria-busy="true" className="block w-full">
      <Card className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Skeleton variant="circle" width={40} height={40} />
            <div className="min-w-0 space-y-2">
              <Skeleton variant="text" width="50px" height={10} />
              <Skeleton variant="text" width="180px" height={14} />
              <Skeleton variant="text" width="140px" height={12} />
            </div>
          </div>

          <div className="flex-shrink-0 border-2 border-black bg-yellow-100 px-3 py-2">
            <Skeleton variant="text" width="72px" height={18} />
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton variant="text" width="100%" height={14} />
          <Skeleton variant="text" width="85%" height={14} />
        </div>

        <div className="flex items-center justify-between border-t-2 border-dashed border-black pt-3">
          <Skeleton variant="text" width="90px" height={10} />
          <Skeleton variant="text" width="80px" height={12} />
        </div>
      </Card>
    </div>
  );
};
