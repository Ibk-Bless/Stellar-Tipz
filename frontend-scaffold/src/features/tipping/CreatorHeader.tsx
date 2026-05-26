import React from "react";
import { Users } from "lucide-react";

import AmountDisplay from "../../components/shared/AmountDisplay";
import CreditBadge from "../../components/shared/CreditBadge";
import Avatar from "../../components/ui/Avatar";
import { Profile } from "../../types";
import XHandleLink from "../profile/XHandleLink";

interface CreatorHeaderProps {
  profile: Profile;
}

const CreatorHeader: React.FC<CreatorHeaderProps> = ({ profile }) => {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <Avatar
        src={profile.imageUrl || undefined}
        alt={profile.displayName}
        fallback={profile.displayName}
        address={profile.owner}
        size="xl"
      />

      <div className="space-y-1">
        <h1 className="text-3xl font-black uppercase leading-tight">{profile.displayName}</h1>
        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">@{profile.username}</p>
      </div>

      <CreditBadge score={profile.creditScore} />

      {profile.bio && (
        <p className="max-w-sm text-sm font-medium leading-6 text-gray-700">{profile.bio}</p>
      )}

      {profile.xHandle && (
        <XHandleLink handle={profile.xHandle} followers={profile.xFollowers} />
      )}

      <div className="flex items-center gap-2 border-2 border-black bg-yellow-100 px-5 py-3">
        <Users size={16} className="text-gray-600" />
        <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-600">
          Total tips received
        </span>
        <AmountDisplay amount={profile.totalTipsReceived} className="text-base" />
      </div>
    </div>
  );
};

export default CreatorHeader;
