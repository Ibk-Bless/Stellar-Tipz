import React from "react";
import { Link } from "react-router-dom";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";
import { useTrendingCreators } from "@/hooks/useTrendingCreators";
import TrendingCreatorCard from "./TrendingCreatorCard";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";

const TOP_N = 6;

const CardSkeleton: React.FC = () => (
  <div className="border-[3px] border-black bg-white p-5 space-y-4">
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

/**
 * Standalone trending creators component showing the top 6 creators
 * by tip velocity (tips in the last 7 days).
 * Falls back to all-time top creators when no recent data is available.
 * Auto-refreshes every 5 minutes via the useTrendingCreators hook cache.
 */
const TrendingCreators: React.FC = () => {
  const { creators, loading, isFallback } = useTrendingCreators(TOP_N);

  if (loading) {
    return (
      <div
        className="grid grid-cols-2 gap-4 sm:grid-cols-3"
        aria-busy="true"
        aria-label="Loading trending creators"
      >
        {Array.from({ length: TOP_N }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (creators.length === 0) {
    return (
      <div className="border-[3px] border-black bg-white">
        <EmptyState
          icon={<Flame />}
          title="No trending creators yet"
          description="Be the first to tip a creator and start the trend!"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isFallback && (
        <p className="text-xs font-bold text-gray-600">
          Showing all-time top creators — check back soon for weekly rankings.
        </p>
      )}
      <motion.div
        className="grid grid-cols-2 gap-4 sm:grid-cols-3"
        role="list"
        aria-label="Trending creators"
      >
        {creators.map((creator, index) => (
          <div key={creator.address} role="listitem">
            <Link
              to={`/profile/${creator.username}`}
              aria-label={`View profile of ${creator.username}`}
              className="block"
            >
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
            </Link>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default TrendingCreators;
