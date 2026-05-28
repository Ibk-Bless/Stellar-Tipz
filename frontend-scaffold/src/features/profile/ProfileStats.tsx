import React from 'react';
import AmountDisplay from '@/components/shared/AmountDisplay';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';

interface ProfileStatsProps {
  balance: string;
  totalTipsReceived: string;
  totalTipsCount: number;
  xFollowers: number;
  className?: string;
}

/**
 * ProfileStats displays a grid of key performance indicators for the creator profile.
 */
const ProfileStats: React.FC<ProfileStatsProps> = ({
  balance,
  totalTipsReceived,
  totalTipsCount,
  xFollowers,
  className = '',
}) => {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-4 ${className}`}>
      <Card className="hover:bg-gray-50 transition-colors" padding="md">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-800 dark:text-gray-200 mb-1 text-center sm:text-left">Available Balance</p>
        <div className="flex justify-center sm:justify-start">
          <AmountDisplay amount={balance} className="text-2xl" />
        </div>
      </Card>
      
      <Card className="bg-yellow-50 hover:bg-yellow-100 transition-colors" padding="md">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-800 dark:text-gray-200 mb-1 text-center sm:text-left">Lifetime Earnings</p>
        <div className="flex justify-center sm:justify-start">
          <AmountDisplay amount={totalTipsReceived} className="text-2xl" />
        </div>
      </Card>

      <Card className="hover:bg-gray-50 transition-colors" padding="md">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-800 dark:text-gray-200 mb-1 text-center sm:text-left">Total Tips</p>
        <p className="text-3xl font-black text-center sm:text-left">{totalTipsCount}</p>
      </Card>

      <Card className="hover:bg-gray-50 transition-colors" padding="md">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-800 dark:text-gray-200 mb-1 text-center sm:text-left">X Followers</p>
        <p className="text-3xl font-black text-center sm:text-left">{xFollowers.toLocaleString()}</p>
      </Card>
    </div>
  );
};

export default ProfileStats;

export const ProfileStatsSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-4 ${className}`}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} role="status" aria-busy="true">
          <Card padding="md">
            <div className="space-y-2">
              <Skeleton variant="text" width="55%" height="10px" />
              <Skeleton variant="text" width="70%" height="28px" />
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
};
