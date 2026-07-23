/**
 * Shared types for the withdrawals module.
 */

export interface WithdrawalResponse {
  id: string;
  userId: string;
  amount: string;
  fee: string;
  status: string;
  txHash: string | null;
  requestedAt: string;
  confirmedAt: string | null;
}
