import React from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

import AmountDisplay from "../../components/shared/AmountDisplay";
import CreditBadge from "../../components/shared/CreditBadge";
import Avatar from "../../components/ui/Avatar";
import Skeleton from "../../components/ui/Skeleton";
import { useWalletStore } from "../../store";
import type { LeaderboardEntry } from "../../types/contract";
import { useFavorites } from "../../hooks/useFavorites";

export interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  rank: number;
}

const LeaderboardRow: React.FC<LeaderboardRowProps> = ({ entry, rank }) => {
  const navigate = useNavigate();
  const { connected, publicKey } = useWalletStore();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(entry.address);

  const isOwnProfile =
    connected && Boolean(publicKey) && publicKey?.toLowerCase() === entry.address.toLowerCase();

  const handleNavigate = () => {
    navigate(`/@${entry.username}`);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTableRowElement> = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleNavigate();
    }
  };

  return (
    <tr
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={`cursor-pointer border-b-2 border-black bg-white transition duration-150 ${
        isOwnProfile
          ? "bg-yellow-200/50"
          : "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
      }`}
      aria-label={`View @${entry.username} profile`}
    >
      <td className="px-4 py-4 text-sm font-black tabular-nums">#{rank}</td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar
            address={entry.address}
            alt={entry.username}
            fallback={entry.username}
            size="md"
          />
          <div className="flex items-center gap-2">
            <span className="font-black uppercase">{entry.username}</span>
            {!isOwnProfile && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite({ address: entry.address, username: entry.username });
                }}
                className={`p-1 rounded-full transition-colors ${
                  favorite ? 'text-red-500 bg-red-50' : 'text-gray-700 dark:text-gray-300 hover:text-red-500 hover:bg-gray-100'
                }`}
                aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart size={16} fill={favorite ? "currentColor" : "none"} />
              </button>
            )}
          </div>
          {isOwnProfile && (
            <span className="border-2 border-black bg-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
              You
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-4 text-right">
        <AmountDisplay amount={entry.totalTipsReceived} className="text-sm" />
      </td>
      <td className="px-4 py-4">
        <CreditBadge score={entry.creditScore} />
      </td>
    </tr>
  );
};

export default LeaderboardRow;

export const LeaderboardRowSkeleton: React.FC = () => {
  return (
    <tr role="status" aria-busy="true" className="border-b border-gray-300">
      <td className="px-4 py-4 text-sm font-black tabular-nums text-gray-300">#—</td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <Skeleton variant="circle" width={40} height={40} />
          <Skeleton variant="text" width="120px" height={16} />
        </div>
      </td>
      <td className="px-4 py-4 text-right">
        <Skeleton variant="text" width="80px" height={16} className="ml-auto" />
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <Skeleton variant="circle" width={16} height={16} />
          <Skeleton variant="rect" width={36} height={18} />
        </div>
      </td>
    </tr>
  );
};
