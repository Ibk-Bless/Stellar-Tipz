import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Avatar from "@/components/ui/Avatar";
import CreditBadge from "@/components/shared/CreditBadge";
import { stroopToXlm } from "@/helpers/format";
import { getTierFromScore } from "@/helpers/badge";

interface TrendingCreatorCardProps {
  rank: number;
  address: string;
  username: string;
  displayName?: string;
  creditScore: number;
  weeklyTips: string; // stroops as string
  isFallback: boolean;
  animationDelay?: number;
}

const RANK_STYLES: Record<
  number,
  { bg: string; border: string; rankBg: string }
> = {
  1: {
    bg: "bg-yellow-50",
    border: "border-yellow-400",
    rankBg: "bg-yellow-400",
  },
  2: { bg: "bg-gray-50", border: "border-gray-400", rankBg: "bg-gray-400" },
  3: {
    bg: "bg-orange-50",
    border: "border-orange-400",
    rankBg: "bg-orange-400",
  },
};

const DEFAULT_STYLE = {
  bg: "bg-white",
  border: "border-black",
  rankBg: "bg-black",
};

const TrendingCreatorCard: React.FC<TrendingCreatorCardProps> = ({
  rank,
  address,
  username,
  displayName,
  creditScore,
  weeklyTips,
  isFallback,
  animationDelay = 0,
}) => {
  const navigate = useNavigate();
  const style = RANK_STYLES[rank] ?? DEFAULT_STYLE;
  const tier = getTierFromScore(creditScore);
  const hasWeeklyTips = BigInt(weeklyTips) > BigInt(0);

  const tierEmoji: Record<string, string> = {
    new: "⭐",
    bronze: "🥉",
    silver: "🥈",
    gold: "🥇",
    diamond: "💎",
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: animationDelay, ease: "easeOut" }}
      className={`group relative flex w-64 flex-shrink-0 cursor-pointer flex-col gap-4 border-[3px] ${style.border} ${style.bg} p-5 transition-transform duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:w-auto`}
      onClick={() => navigate(`/@${username}`)}
      role="button"
      tabIndex={0}
      aria-label={`View profile of ${displayName || username}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/@${username}`);
        }
      }}
    >
      {/* Rank badge */}
      <div
        className={`absolute -right-3 -top-3 flex h-7 w-7 items-center justify-center border-2 border-black ${style.rankBg} text-xs font-black text-white`}
      >
        {rank}
      </div>

      {/* Avatar + credit badge row */}
      <div className="flex items-start justify-between gap-2">
        <Avatar
          address={address}
          alt={displayName || username}
          fallback={displayName || username}
          size="lg"
        />
        <CreditBadge score={creditScore} showScore={false} />
      </div>

      {/* Name */}
      <div className="min-w-0">
        {displayName && (
          <p className="truncate text-base font-black uppercase leading-tight">
            {displayName}
          </p>
        )}
        <p className="truncate text-sm font-bold text-gray-800 dark:text-gray-200">@{username}</p>
        <p className="mt-0.5 text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300">
          {tierEmoji[tier]} {tier}
        </p>
      </div>

      {/* Weekly tips stat */}
      <div
        className={`border-t-2 border-black pt-3 ${
          hasWeeklyTips ? "" : "opacity-60"
        }`}
      >
        <p className="mb-1 flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.15em] text-gray-800 dark:text-gray-200">
          {isFallback || !hasWeeklyTips ? (
            <>
              <TrendingUp size={11} />
              All-time tips
            </>
          ) : (
            <>
              <Zap size={11} className="text-yellow-500" />
              This week
            </>
          )}
        </p>
        <p className="text-xl font-black tabular-nums">
          {stroopToXlm(weeklyTips, 2)} XLM
        </p>
      </div>

      {/* Hover CTA */}
      <div className="absolute inset-x-0 bottom-0 translate-y-full overflow-hidden transition-all duration-200 group-hover:translate-y-0">
        <div className="border-t-[3px] border-black bg-black py-2 text-center text-xs font-black uppercase tracking-widest text-white">
          View profile →
        </div>
      </div>
    </motion.article>
  );
};

export default TrendingCreatorCard;
