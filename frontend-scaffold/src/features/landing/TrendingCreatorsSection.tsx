import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Flame, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useTrendingCreators } from "@/hooks/useTrendingCreators";
import TrendingCreatorCard from "./TrendingCreatorCard";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";

const CARD_COUNT = 10;

// ── Skeleton placeholder ──────────────────────────────────────────────────
const CardSkeleton: React.FC = () => (
  <div className="w-64 flex-shrink-0 border-[3px] border-black bg-white p-5 space-y-4 md:w-auto">
    <div className="flex items-start justify-between gap-2">
      <Skeleton variant="rect" className="h-16 w-16" />
      <Skeleton variant="rect" className="h-6 w-20" />
    </div>
    <div className="space-y-2">
      <Skeleton variant="text" className="h-4 w-3/4" />
      <Skeleton variant="text" className="h-3 w-1/2" />
    </div>
    <div className="border-t-2 border-black pt-3 space-y-1">
      <Skeleton variant="text" className="h-3 w-1/3" />
      <Skeleton variant="text" className="h-6 w-1/2" />
    </div>
  </div>
);

// ── Main section ──────────────────────────────────────────────────────────
const TrendingCreatorsSection: React.FC = () => {
  const { creators, loading, error, isFallback, refetch } =
    useTrendingCreators(CARD_COUNT);
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section
      id="trending"
      role="region"
      className="overflow-hidden bg-white py-24 px-6"
      aria-labelledby="trending-heading"
    >
      <div className="mx-auto max-w-7xl space-y-10">
        {/* ── Header row ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        >
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 border-2 border-black bg-orange-100 px-3 py-1 text-xs font-black uppercase tracking-widest">
              <Flame size={13} className="text-orange-500" />
              Trending this week
            </div>
            <h2
              id="trending-heading"
              className="text-4xl font-black uppercase leading-none md:text-5xl"
            >
              Hot right now
            </h2>
            <p className="max-w-xl text-base font-bold text-gray-600">
              {isFallback
                ? "Showing all-time top creators — check back soon for weekly rankings."
                : "Creators who received the most tips in the last 7 days."}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Refresh button */}
            <button
              type="button"
              onClick={refetch}
              disabled={loading}
              aria-label="Refresh trending creators"
              className="inline-flex items-center gap-1.5 border-2 border-black bg-white px-3 py-2 text-xs font-black uppercase tracking-wide transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            {/* View all link */}
            <Link
              to="/leaderboard"
              className="group inline-flex items-center gap-2 text-sm font-black uppercase tracking-wider hover:underline"
              aria-label="View full leaderboard"
            >
              View all
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </motion.div>

        {/* ── Fallback notice ── */}
        {isFallback && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-flex items-center gap-2 border-2 border-black bg-yellow-50 px-4 py-2 text-xs font-bold"
          >
            <span className="text-yellow-600">⚠</span>
            No recent tip activity found — showing overall top creators instead.
          </motion.div>
        )}

        {/* ── Error notice (non-fatal, still shows fallback data) ── */}
        {error && creators.length > 0 && (
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
            Could not load weekly data — showing overall rankings.
          </p>
        )}

        {/* ── Card list ── */}
        {loading ? (
          /* Skeleton row */
          <div
            className="flex gap-5 overflow-x-auto pb-6 -mx-6 px-6 no-scrollbar md:grid md:grid-cols-5 md:overflow-visible md:pb-0 md:mx-0 md:px-0"
            aria-busy="true"
            aria-label="Loading trending creators"
          >
            {Array.from({ length: CARD_COUNT }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : creators.length === 0 ? (
          <div className="border-[3px] border-black bg-white">
            <EmptyState
              icon={<Flame />}
              title="No trending creators yet"
              description="Be the first to tip a creator and start the trend!"
            />
          </div>
        ) : (
          /* Horizontal scroll on mobile, 5-col grid on desktop */
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-6 -mx-6 px-6 no-scrollbar md:grid md:grid-cols-5 md:overflow-visible md:pb-0 md:mx-0 md:px-0"
            role="list"
            aria-label="Trending creators"
          >
            {creators.map((creator, index) => (
              <div key={creator.address} role="listitem">
                <TrendingCreatorCard
                  rank={index + 1}
                  address={creator.address}
                  username={creator.username}
                  creditScore={creator.creditScore}
                  weeklyTips={
                    isFallback ? creator.totalTipsReceived : creator.weeklyTips
                  }
                  isFallback={isFallback}
                  animationDelay={index * 0.07}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── Bottom CTA ── */}
        {!loading && creators.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex justify-center pt-2"
          >
            <Link
              to="/leaderboard"
              className="group inline-flex items-center gap-3 border-[3px] border-black bg-black px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-transform hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              See full leaderboard
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default TrendingCreatorsSection;
