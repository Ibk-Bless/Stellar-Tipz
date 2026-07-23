import type { Withdrawal } from "@prisma/client";
import { prisma } from "@/db/prisma.js";
import { logger } from "@/common/utils/logger.js";
import { NotFoundError } from "@/common/errors/AppError.js";
import type { CreateWithdrawalInput } from "./withdrawals.schema.js";
import type { WithdrawalResponse } from "./withdrawals.types.js";

function toResponse(withdrawal: Withdrawal): WithdrawalResponse {
  return {
    id: withdrawal.id,
    userId: withdrawal.userId,
    amount: withdrawal.amount.toString(),
    fee: withdrawal.fee.toString(),
    status: withdrawal.status,
    txHash: withdrawal.txHash,
    requestedAt: withdrawal.requestedAt.toISOString(),
    confirmedAt: withdrawal.confirmedAt?.toISOString() ?? null,
  };
}

/**
 * Creates a withdrawal request for a user (#942).
 * `input.amount` has already been validated against the configured minimum
 * by `createWithdrawalSchema`.
 */
export async function requestWithdrawal(
  userId: string,
  input: CreateWithdrawalInput,
): Promise<WithdrawalResponse> {
  const withdrawal = await prisma.withdrawal.create({
    data: {
      userId,
      amount: BigInt(input.amount),
      fee: 0n,
    },
  });

  logger.info(
    { userId, withdrawalId: withdrawal.id, amount: input.amount },
    "Withdrawal requested",
  );

  return toResponse(withdrawal);
}

/**
 * Gets a single withdrawal owned by the user.
 */
export async function getWithdrawalById(
  id: string,
  userId: string,
): Promise<WithdrawalResponse> {
  const withdrawal = await prisma.withdrawal.findUnique({ where: { id } });

  if (!withdrawal || withdrawal.userId !== userId) {
    throw new NotFoundError("Withdrawal not found");
  }

  return toResponse(withdrawal);
}

/**
 * Lists all withdrawals for a user, most recent first.
 */
export async function listWithdrawals(userId: string): Promise<WithdrawalResponse[]> {
  const withdrawals = await prisma.withdrawal.findMany({
    where: { userId },
    orderBy: { requestedAt: "desc" },
  });

  return withdrawals.map(toResponse);
}

/**
 * Updates a withdrawal's status from an on-chain confirmation (#943).
 *
 * This is the integration seam for the indexer: once the indexer module
 * observes `txHash` land on-chain (or fail), it calls this to transition the
 * withdrawal out of PENDING. Not exposed over HTTP — only the indexer should
 * be able to confirm a withdrawal.
 */
export async function updateWithdrawalStatus(
  withdrawalId: string,
  status: "CONFIRMED" | "FAILED",
  txHash: string,
): Promise<WithdrawalResponse> {
  const withdrawal = await prisma.withdrawal.findUnique({
    where: { id: withdrawalId },
  });

  if (!withdrawal) {
    throw new NotFoundError("Withdrawal not found");
  }

  const updated = await prisma.withdrawal.update({
    where: { id: withdrawalId },
    data: {
      status,
      txHash,
      confirmedAt: status === "CONFIRMED" ? new Date() : withdrawal.confirmedAt,
    },
  });

  logger.info({ withdrawalId, status, txHash }, "Withdrawal status updated by indexer");

  return toResponse(updated);
}
