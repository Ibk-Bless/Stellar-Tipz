import React, { useEffect, useMemo, useRef, useState } from "react";

import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import { useWalletStore } from "../../store/walletStore";
import type { LeaderboardEntry } from "../../types/contract";
import LeaderboardRow from "./LeaderboardRow";

const PAGE_SIZE = 25;

// ---------------------------------------------------------------------------
// LeaderboardTable
// ---------------------------------------------------------------------------
export interface LeaderboardTableProps {
  /**
   * Leaderboard entries starting from rank 4 (index 3 of the full list).
   * The rank of each row is derived as: 4 + pageOffset + localIndex.
   */
  entries: LeaderboardEntry[];
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ entries }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const publicKey = useWalletStore((state) => state.publicKey);
  const connected = useWalletStore((state) => state.connected);

  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  // Find the current user's position in this sub-list (entries start at rank 4).
  // Guard typeof publicKey === 'string' because test mocks may pass the full
  // state object when they don't apply the selector.
  const userIndex = useMemo(() => {
    if (!connected || typeof publicKey !== "string") return -1;
    return entries.findIndex(
      (e) => e.address.toLowerCase() === publicKey.toLowerCase(),
    );
  }, [entries, publicKey, connected]);

  // Global rank (1-based); null when the user is not in this sub-list.
  const userGlobalRank = userIndex >= 0 ? userIndex + 4 : null;

  // Which page the user is on (1-based).
  const userPage = userIndex >= 0 ? Math.floor(userIndex / PAGE_SIZE) + 1 : null;

  // Jump to the user's page on first load. Using a ref so the effect is
  // idempotent — it fires at most once regardless of re-renders.
  const hasAutoJumpedRef = useRef(false);
  useEffect(() => {
    if (!hasAutoJumpedRef.current && userPage !== null) {
      hasAutoJumpedRef.current = true;
      setCurrentPage(userPage);
    }
  }, [userPage]);

  const pageEntries = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return entries.slice(start, start + PAGE_SIZE);
  }, [entries, safeCurrentPage]);

  // Ranks are 1-based over the full list; this slice begins at rank 4.
  const rankOffset = 4 + (safeCurrentPage - 1) * PAGE_SIZE;

  if (entries.length === 0) {
    return (
      <EmptyState
        title="No more creators"
        description="Only the top 3 have tips so far. Check back as more creators join."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Current-user rank banner — always visible regardless of current page */}
      {userGlobalRank !== null && userPage !== null && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded border-2 border-black bg-yellow-100 px-4 py-3">
          <span className="text-sm font-black uppercase">
            Your rank: #{userGlobalRank}
          </span>
          {safeCurrentPage !== userPage && (
            <button
              type="button"
              onClick={() => setCurrentPage(userPage!)}
              className="border-2 border-black bg-black px-3 py-1 text-xs font-black uppercase text-white transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            >
              Jump to my rank
            </button>
          )}
        </div>
      )}

      <div className="overflow-x-auto border-2 border-black">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-black bg-black text-left text-white">
              <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.2em]">
                Rank
              </th>
              <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.2em]">
                Creator
              </th>
              <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.2em]">
                Total Tips
              </th>
              <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.2em]">
                Credit Score
              </th>
            </tr>
          </thead>
          <tbody>
            {pageEntries.map((entry, index) => (
              <LeaderboardRow
                key={entry.address}
                entry={entry}
                rank={rankOffset + index}
              />
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default LeaderboardTable;
