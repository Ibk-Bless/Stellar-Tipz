import React from "react";
import { Trophy } from "lucide-react";

import PageContainer from "../../components/layout/PageContainer";
import Card from "../../components/ui/Card";
import Skeleton from "../../components/ui/Skeleton";

const LeaderboardSkeleton: React.FC<{ count?: number }> = ({ count = 10 }) => {
  return (
    <PageContainer
      maxWidth="xl"
      className="space-y-8 py-10"
      role="status"
      aria-label="Loading leaderboard"
      aria-live="polite"
      aria-busy="true"
      aria-atomic="true"
    >
      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="space-y-5 bg-yellow-100" padding="lg">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-gray-600">
            Leaderboard
          </p>
          <h1 className="flex items-center gap-3 text-4xl font-black uppercase">
            <Trophy size={34} />
            Top creators
          </h1>
          <p className="max-w-2xl text-base leading-7 text-gray-700">
            Loading leaderboard statistics...
          </p>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="space-y-4" padding="lg">
              <div className="flex items-center justify-between gap-3">
                <Skeleton variant="text" width="40px" height="20px" />
                <div className="flex items-center gap-1">
                  <Skeleton variant="circle" width="16px" height="16px" />
                  <Skeleton variant="rect" width="30px" height="15px" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton variant="circle" width="3rem" height="3rem" />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" width="80%" height="20px" />
                  <Skeleton variant="text" width="60%" height="16px" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <Card className="space-y-6" padding="lg">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-black uppercase">Full rankings</h2>
            <Skeleton variant="text" width="150px" height="20px" />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-black text-left">
                  <th className="px-4 py-3"><Skeleton variant="text" width="40px" /></th>
                  <th className="px-4 py-3"><Skeleton variant="text" width="80px" /></th>
                  <th className="px-4 py-3"><Skeleton variant="text" width="60px" /></th>
                  <th className="px-4 py-3"><Skeleton variant="text" width="60px" /></th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: count }).map((_, i) => (
                  <tr key={i} role="status" aria-busy="true" className="border-b border-gray-300">
                    <td className="px-4 py-4 text-sm font-black text-gray-700 dark:text-gray-300">{i + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton variant="circle" width="2.5rem" height="2.5rem" />
                        <Skeleton variant="text" width="100px" height="20px" />
                      </div>
                    </td>
                    <td className="px-4 py-4"><Skeleton variant="text" width="80px" height="20px" /></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Skeleton variant="circle" width="16px" height="16px" />
                        <Skeleton variant="rect" width="30px" height="20px" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </PageContainer>
  );
};

export default LeaderboardSkeleton;
