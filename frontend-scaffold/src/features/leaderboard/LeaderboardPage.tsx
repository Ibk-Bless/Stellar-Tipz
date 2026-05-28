
import { Link } from "react-router-dom";

import PageContainer from "../../components/layout/PageContainer";
import AmountDisplay from "../../components/shared/AmountDisplay";
import CreditBadge from "../../components/shared/CreditBadge";
import Avatar from "../../components/ui/Avatar";
import Card from "../../components/ui/Card";

import ErrorState from "../../components/shared/ErrorState";
import PullToRefresh from "../../components/shared/PullToRefresh";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useContract } from "@/hooks/useContract";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { categorizeError } from "@/helpers/error";
import { LeaderboardEntry } from "@/types/contract";
import LeaderboardSkeleton from "./LeaderboardSkeleton";
import LeaderboardFilters from "./LeaderboardFilters";


const PAGE_SIZE = 20;

const LeaderboardPage: React.FC = () => {
  usePageTitle('Leaderboard');

  const { getLeaderboard } = useContract();
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch function for infinite scroll
  const fetchLeaderboardData = async (cursor?: string) => {
    const offset = cursor ? parseInt(cursor) : 0;
    const entries = await getLeaderboard(PAGE_SIZE + offset);
    
    // Simulate pagination by slicing the results
    const startIndex = offset;
    const endIndex = offset + PAGE_SIZE;
    const pageEntries = entries.slice(startIndex, endIndex);
    
    return {
      items: pageEntries,
      hasMore: endIndex < entries.length,
      nextCursor: endIndex < entries.length ? endIndex.toString() : undefined,
    };
  };

  const {
    items: entries,
    loading,
    hasMore,
    error,
    observerRef,
  } = useInfiniteScroll<LeaderboardEntry>(fetchLeaderboardData);

  // Top 3 entries for podium display
  const topThree = useMemo(() => entries.slice(0, 3), [entries]);
  const remainingEntries = useMemo(() => entries.slice(3), [entries]);

  const leaderboardAnnouncement = error
    ? `Leaderboard failed to load: ${categorizeError(error).message}`
    : entries.length === 0
    ? "Leaderboard loaded with no creators yet."
    : `Leaderboard loaded with ${entries.length} creators.`;

  if (loading && entries.length === 0 && !error) {
    return <LeaderboardSkeleton count={PAGE_SIZE} />;
  }

  return (
    <PullToRefresh onRefresh={refetch}>
    <PageContainer maxWidth="xl" className="space-y-8 py-10">
      <section aria-labelledby="leaderboard-heading" className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="space-y-5 bg-yellow-100" padding="lg" hover>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-gray-600">
            Leaderboard
          </p>
          <h1 id="leaderboard-heading" className="flex items-center gap-3 text-4xl font-black uppercase">
            <Trophy size={34} />
            Top creators
          </h1>
          <p className="max-w-2xl text-base leading-7 text-gray-700">
            A real-time snapshot of creators earning the most support on Stellar Tipz. These rankings are fetched directly from the Tipz Soroban contract.
          </p>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          {error ? (
            <div className="sm:col-span-3">
              <ErrorState category={categorizeError(error).category} onRetry={() => window.location.reload()} />
            </div>
          ) : (
            topThree.map((entry, index) => {
              const icons = [<Crown key="crown" size={18} />, <Medal key="silver" size={18} />, <Medal key="bronze" size={18} />];
              const labels = ["1st", "2nd", "3rd"];

              return (
                <Card key={entry.address} className="space-y-4" padding="lg" hover>
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-sm font-black uppercase">
                      {icons[index]}
                      {labels[index]}
                    </span>
                    <CreditBadge score={entry.creditScore} showScore={false} />
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar address={entry.address} alt={entry.username} fallback={entry.username} size="lg" />
                    <div>
                      <p className="text-lg font-black uppercase truncate max-w-[120px]">{entry.username}</p>
                      <AmountDisplay amount={entry.totalTipsReceived} className="text-sm" />
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </section>

      <section role="region" aria-labelledby="full-rankings-heading">
        <Card className="space-y-6" padding="lg">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 id="full-rankings-heading" className="text-2xl font-black uppercase">Full rankings</h2>
            <Link to="/dashboard" className="text-sm font-black uppercase underline">
              Open your dashboard
            </Link>
          </div>


              {/* Loading indicator */}
              {loading && (
                <div className="flex items-center justify-center gap-2 p-8 text-gray-600">
                  <Loader2 size={20} className="animate-spin" />
                  <span className="text-sm font-bold uppercase">Loading more creators...</span>
                </div>
              )}

              {/* End of list indicator */}
              {!hasMore && entries.length > 0 && (
                <div className="text-center p-8 border-t-2 border-dashed border-gray-300">
                  <p className="text-sm font-bold text-gray-600 uppercase">
                    🎉 You've reached the end of the leaderboard!
                  </p>
                </div>
              )}

              {/* Intersection observer target */}
              <div ref={observerRef} className="h-4" />
            </div>
          )}
        </Card>
      </section>

      <div role="status" aria-live="polite" className="sr-only">
        {leaderboardAnnouncement}
      </div>
    </PageContainer>
    </PullToRefresh>
  );
};

export default LeaderboardPage;
