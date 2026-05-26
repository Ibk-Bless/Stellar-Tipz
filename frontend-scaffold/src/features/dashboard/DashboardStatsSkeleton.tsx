import React from "react";
import Skeleton from "@/components/ui/Skeleton";
import { StatsCardSkeleton } from "@/components/ui/StartCard";

const DashboardStatsSkeleton: React.FC = () => {
  return (
    <section
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-atomic="true"
    >
      <StatsCardSkeleton />
      <StatsCardSkeleton />
      <StatsCardSkeleton />
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-atomic="true"
        className="flex flex-col gap-2 border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
      >
        <Skeleton variant="text" width="120px" height="14px" />
        <div className="mt-1">
          <div className="flex items-center gap-2">
            <Skeleton variant="circle" width={16} height={16} />
            <Skeleton variant="rect" width={34} height={18} />
          </div>
        </div>
        <Skeleton variant="text" width="55%" height="44px" className="mt-auto" />
      </div>
    </section>
  );
};

export default DashboardStatsSkeleton;
