/**
 * Tests for #942 (withdrawal minimum + validation) and
 * #943 (withdrawal status tracking via indexer).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/config/env.js", () => ({
  env: {
    NODE_ENV: "test",
    PORT: 4000,
    API_BASE_PATH: "/api/v1",
    CORS_ORIGIN: "http://localhost:5173",
    JWT_SECRET: "test-secret",
    JWT_EXPIRES_IN: "15m",
    LOG_LEVEL: "silent",
    WITHDRAWAL_MIN_AMOUNT_STROOPS: 10_000_000,
  },
}));

vi.mock("@/db/prisma.js", () => ({
  prisma: {
    withdrawal: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from "@/db/prisma.js";
import { createWithdrawalSchema } from "./withdrawals.schema.js";
import {
  requestWithdrawal,
  getWithdrawalById,
  listWithdrawals,
  updateWithdrawalStatus,
} from "./withdrawals.service.js";

const fakeWithdrawal = {
  id: "wd_01",
  userId: "user_01",
  amount: 10_000_000n,
  fee: 0n,
  status: "PENDING",
  txHash: null,
  requestedAt: new Date("2026-01-01T00:00:00Z"),
  confirmedAt: null,
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ── #942 createWithdrawalSchema (minimum + validation) ────────────────────────

describe("createWithdrawalSchema (issue #942)", () => {
  it("accepts an amount at exactly the minimum", () => {
    const result = createWithdrawalSchema.safeParse({ amount: "10000000" });
    expect(result.success).toBe(true);
  });

  it("rejects an amount below the minimum", () => {
    const result = createWithdrawalSchema.safeParse({ amount: "9999999" });
    expect(result.success).toBe(false);
  });

  it("rejects a non-numeric amount", () => {
    const result = createWithdrawalSchema.safeParse({ amount: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects zero and negative amounts", () => {
    expect(createWithdrawalSchema.safeParse({ amount: "0" }).success).toBe(false);
    expect(createWithdrawalSchema.safeParse({ amount: "-5" }).success).toBe(false);
  });
});

describe("requestWithdrawal (issue #942)", () => {
  it("creates a withdrawal and serialises BigInt amounts to strings", async () => {
    vi.mocked(prisma.withdrawal.create).mockResolvedValue(fakeWithdrawal as never);

    const result = await requestWithdrawal("user_01", { amount: "10000000" });

    expect(prisma.withdrawal.create).toHaveBeenCalledWith({
      data: { userId: "user_01", amount: 10_000_000n, fee: 0n },
    });
    expect(result.amount).toBe("10000000");
    expect(result.status).toBe("PENDING");
  });
});

// ── #943 withdrawal status tracking via indexer ───────────────────────────────

describe("getWithdrawalById / listWithdrawals (issue #943)", () => {
  it("throws NotFoundError when the withdrawal belongs to another user", async () => {
    vi.mocked(prisma.withdrawal.findUnique).mockResolvedValue(fakeWithdrawal as never);

    await expect(getWithdrawalById("wd_01", "someone_else")).rejects.toThrow(
      "Withdrawal not found",
    );
  });

  it("returns the withdrawal when owned by the requesting user", async () => {
    vi.mocked(prisma.withdrawal.findUnique).mockResolvedValue(fakeWithdrawal as never);

    const result = await getWithdrawalById("wd_01", "user_01");
    expect(result.id).toBe("wd_01");
  });

  it("lists withdrawals ordered by most recent", async () => {
    vi.mocked(prisma.withdrawal.findMany).mockResolvedValue([fakeWithdrawal] as never);

    const result = await listWithdrawals("user_01");

    expect(prisma.withdrawal.findMany).toHaveBeenCalledWith({
      where: { userId: "user_01" },
      orderBy: { requestedAt: "desc" },
    });
    expect(result).toHaveLength(1);
  });
});

describe("updateWithdrawalStatus (issue #943)", () => {
  it("throws NotFoundError for an unknown withdrawal", async () => {
    vi.mocked(prisma.withdrawal.findUnique).mockResolvedValue(null);

    await expect(
      updateWithdrawalStatus("missing", "CONFIRMED", "0xabc"),
    ).rejects.toThrow("Withdrawal not found");
  });

  it("confirms a withdrawal and sets confirmedAt + txHash", async () => {
    vi.mocked(prisma.withdrawal.findUnique).mockResolvedValue(fakeWithdrawal as never);
    vi.mocked(prisma.withdrawal.update).mockResolvedValue({
      ...fakeWithdrawal,
      status: "CONFIRMED",
      txHash: "0xabc",
      confirmedAt: new Date("2026-01-02T00:00:00Z"),
    } as never);

    const result = await updateWithdrawalStatus("wd_01", "CONFIRMED", "0xabc");

    expect(result.status).toBe("CONFIRMED");
    expect(result.txHash).toBe("0xabc");
    expect(result.confirmedAt).not.toBeNull();
  });

  it("marks a withdrawal as failed without setting confirmedAt", async () => {
    vi.mocked(prisma.withdrawal.findUnique).mockResolvedValue(fakeWithdrawal as never);
    vi.mocked(prisma.withdrawal.update).mockResolvedValue({
      ...fakeWithdrawal,
      status: "FAILED",
      txHash: "0xdef",
    } as never);

    const result = await updateWithdrawalStatus("wd_01", "FAILED", "0xdef");

    expect(result.status).toBe("FAILED");
    expect(result.confirmedAt).toBeNull();
  });
});
