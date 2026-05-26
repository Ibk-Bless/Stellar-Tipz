import React from 'react';
import { CalendarDays } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import CopyButton from '@/components/ui/CopyButton';
import CreditBadge from '@/components/shared/CreditBadge';
import AmountDisplay from '@/components/shared/AmountDisplay';
import XHandleLink from './XHandleLink';
import type { Profile } from '@/types/contract';

interface ProfileViewProps {
  profile: Profile;
}

/**
 * Large profile view card showing all profile information in a responsive brutalist layout.
 */
const ProfileView: React.FC<ProfileViewProps> = ({ profile }) => {
  const registeredDate = new Date(profile.registeredAt * 1000).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="w-full bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Left: Avatar and Tier */}
        <div className="md:w-72 flex flex-col items-center justify-center p-8 bg-amber-400 border-b-4 md:border-b-0 md:border-r-4 border-black">
          <div className="relative">
            <Avatar 
              src={profile.imageUrl} 
              alt={profile.displayName} 
              size="xl" 
              address={profile.owner}
              fallback={profile.displayName} 
            />
          </div>
          <div className="mt-6 w-full flex justify-center">
            <CreditBadge score={profile.creditScore} showScore={true} clickable={true} />
          </div>
        </div>

        {/* Right: Info */}
        <div className="flex-1 p-8 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl font-black uppercase tracking-tight text-black leading-none mb-2">
                  {profile.displayName}
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-600">@{profile.username}</span>
                  <CopyButton text={profile.username} className="h-8 w-8 !p-0" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-800 dark:text-gray-200 bg-gray-100 px-3 py-1 border-2 border-black h-fit">
                <CalendarDays size={14} />
                Joined {registeredDate}
              </div>
            </div>

            <p className="text-lg font-bold leading-relaxed text-gray-800 mb-8 border-l-4 border-black pl-5 italic">
              {profile.bio || "No bio available."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-6 border-t-2 border-black/5">
            <XHandleLink handle={profile.xHandle} followers={profile.xFollowers} />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-t-4 border-black bg-white">
        <div className="p-6 border-r-4 border-black group hover:bg-black hover:text-white transition-colors">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-800 dark:text-gray-200 group-hover:text-gray-700 dark:text-gray-300 mb-2">Total Tips</p>
          <AmountDisplay amount={profile.totalTipsReceived} className="text-xl md:text-2xl" />
        </div>
        <div className="p-6 border-r-0 md:border-r-4 border-black group hover:bg-black hover:text-white transition-colors">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-800 dark:text-gray-200 group-hover:text-gray-700 dark:text-gray-300 mb-2">Tip Count</p>
          <p className="text-2xl md:text-3xl font-black">{profile.totalTipsCount}</p>
        </div>
        <div className="p-6 border-t-4 border-r-4 md:border-t-0 md:border-r-4 border-black group hover:bg-black hover:text-white transition-colors">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-800 dark:text-gray-200 group-hover:text-gray-700 dark:text-gray-300 mb-2">Credit Score</p>
          <p className="text-2xl md:text-3xl font-black">{profile.creditScore}</p>
        </div>
        <div className="p-6 border-t-4 md:border-t-0 border-black group hover:bg-black hover:text-white transition-colors">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-800 dark:text-gray-200 group-hover:text-gray-700 dark:text-gray-300 mb-2">Balance</p>
          <AmountDisplay amount={profile.balance} className="text-xl md:text-2xl" />
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
