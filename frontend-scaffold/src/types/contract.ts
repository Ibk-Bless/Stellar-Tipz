/**
 * Raw profile shape returned by the Soroban contract before key mapping.
 * Field names match the Rust struct fields (snake_case).
 */
export interface RawProfile {
  owner: string;
  username: string;
  display_name: string;
  bio: string;
  image_url: string;
  x_handle: string;
  x_followers: number;
  x_engagement_avg: number;
  credit_score: number;
  total_tips_received: string;
  total_tips_count: number;
  balance: string;
  registered_at: number;
  updated_at: number;
  verification?: {
    is_verified: boolean;
    verification_type?: string;
    verified_at?: number;
    revoked_at?: number;
  };
  domain?: string;
  domain_verified?: boolean;
  domain_verified_at?: number;
  custom_min_tip?: string;
}

/** Raw tip record as returned by the contract before key mapping. */
export interface RawTip {
  id: number;
  tipper: string;
  creator: string;
  amount: string;
  message: string;
  timestamp: number;
  is_encrypted?: boolean;
}

/** Raw leaderboard entry before key mapping. */
export interface RawLeaderboardEntry {
  address: string;
  username: string;
  total_tips_received: string;
  credit_score: number;
}

/** Raw contract stats before key mapping. */
export interface RawContractStats {
  total_creators: number;
  total_tips_count: number;
  total_tips_volume: string;
  total_fees_collected: string;
  fee_bps: number;
}

/** Profile data from the Tipz contract */
export interface Profile {
  owner: string;
  username: string;
  displayName: string;
  bio: string;
  imageUrl: string;
  xHandle: string;
  xFollowers: number;
  xEngagementAvg: number;
  creditScore: number;
  totalTipsReceived: string; // i128 as string
  totalTipsCount: number;
  balance: string; // i128 as string
  registeredAt: number;
  updatedAt: number;
  streak?: number;
  domain?: string;
  domainVerified?: boolean;
  domainVerifiedAt?: number;
  customMinTip?: string;
  verification?: {
    isVerified: boolean;
    verificationType?: string;
    verifiedAt?: number;
    revokedAt?: number;
  };
}

/** Tip record from the contract */
export interface Tip {
  id: number;
  tipper: string;
  creator: string;
  amount: string; // i128 as string
  message: string;
  timestamp: number;
  isEncrypted?: boolean;
}

/** Leaderboard entry */
export interface LeaderboardEntry {
  address: string;
  username: string;
  totalTipsReceived: string;
  creditScore: number;
}

/** Global contract statistics */
export interface ContractStats {
  totalCreators: number;
  totalTipsCount: number;
  totalTipsVolume: string;
  totalFeesCollected: string;
  feeBps: number;
}

/** Supporter streak for a creator/supporter pair. */
export interface Streak {
  supporter: string;
  creator: string;
  current: number;
  longest: number;
  lastTipDay: number | null;
  bonusPoints: number;
}

/** Credit score tiers */
export type CreditTier = "new" | "bronze" | "silver" | "gold" | "diamond";

export const getCreditTier = (score: number): CreditTier => {
  if (score >= 80) return "diamond";
  if (score >= 60) return "gold";
  if (score >= 40) return "silver";
  if (score >= 20) return "bronze";
  return "new";
};

/** Fundraising goal for a creator */
export interface Goal {
  creator: string;
  title: string;
  description: string;
  targetAmount: string; // i128 as string (stroops)
  raisedAmount: string;
  supporters: number;
  startDate: number;
  endDate: number;
  active: boolean;
  completed: boolean;
  completedAt?: number;
}

/** Recurring tip subscription from the contract */
export interface Subscription {
  subscriber: string;
  creator: string;
  amount: string;
  intervalDays: number;
  nextDue: number;
  active: boolean;
}

/** Raw subscription record as returned by the contract before key mapping. */
export interface RawSubscription {
  subscriber: string;
  creator: string;
  amount: string;
  interval_days: number;
  next_due: number;
  active: boolean;
}
