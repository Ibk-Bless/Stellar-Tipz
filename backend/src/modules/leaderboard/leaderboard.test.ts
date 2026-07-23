/**
 * Unit tests for the leaderboard module.
 * Issue #933 – Leaderboard: Leaderboard by credit score variant.
 *
 * DB calls are mocked so no real database is needed.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock env & Prisma ─────────────────────────────────────────────────────────
vi.mock("@/config/env.js", () => ({
  env: {
    NODE_ENV: "test",
    PORT: 4000,
    API_BASE_PATH: "/api/v1",
    CORS_ORIGIN: "http://localhost:5173",
    JWT_SECRET: "test-secret",
    JWT_EXPIRES_IN: "15m",
    REFRESH_TOKEN_EXPIRES_IN: "7d",
    AUTH_CHALLENGE_TTL_SECONDS: 300,
    LOG_LEVEL: "silent",
  },
}));

vi.mock("@/db/prisma.js", () => ({
  prisma: {
    user: { findMany: vi.fn(), count: vi.fn(), findUnique: vi.fn() },
    tip: { groupBy: vi.fn(), count: vi.fn() },
    leaderboardSnapshot: { findMany: vi.fn(), count: vi.fn() },
    streak: { findUnique: vi.fn() },
    xAccount: { findUnique: vi.fn() },
  },
}));

import { getLeaderboard } from "./leaderboard.service.js";
import { prisma } from "@/db/prisma.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fakeUsers = [
  { id: "u1", stellarAddress: "GAAA", username: "alice", displayName: "Alice", xHandle: null },
  { id: "u2", stellarAddress: "GBBB", username: "bob", displayName: "Bob", xHandle: null },
];

// ── Tips leaderboard – ALL_TIME ───────────────────────────────────────────────

describe("getLeaderboard – tips / ALL_TIME (issue #933)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns entries ranked by totalTipsStroops", async () => {
    vi.mocked(prisma.tip.groupBy)
      // page call
      .mockResolvedValueOnce([
        { toAddress: "GAAA", _sum: { amountStroops: 5000n } } as never,
        { toAddress: "GBBB", _sum: { amountStroops: 2000n } } as never,
      ] as never)
      // total call
      .mockResolvedValueOnce([{}, {}] as never);

    vi.mocked(prisma.user.findUnique)
      .mockResolvedValueOnce(fakeUsers[0] as never)
      .mockResolvedValueOnce(fakeUsers[1] as never);

    const result = await getLeaderboard("tips", "ALL_TIME", 1, 20);

    expect(result.variant).toBe("tips");
    expect(result.period).toBe("ALL_TIME");
    expect(result.entries).toHaveLength(2);
    expect(result.entries[0].rank).toBe(1);
    expect(result.entries[0].totalTipsStroops).toBe("5000");
  });
});

// ── Tips leaderboard – WEEKLY (snapshot) ─────────────────────────────────────

describe("getLeaderboard – tips / WEEKLY snapshot (issue #933)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses LeaderboardSnapshot for WEEKLY period", async () => {
    vi.mocked(prisma.leaderboardSnapshot.findMany).mockResolvedValueOnce([
      {
        rank: 1,
        totalTips: 9000n,
        user: fakeUsers[0],
      },
    ] as never);
    vi.mocked(prisma.leaderboardSnapshot.count).mockResolvedValueOnce(1 as never);

    const result = await getLeaderboard("tips", "WEEKLY", 1, 20);

    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].rank).toBe(1);
    expect(result.entries[0].totalTipsStroops).toBe("9000");
    expect(prisma.leaderboardSnapshot.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { period: "WEEKLY" } }),
    );
  });
});

// ── Credit leaderboard ────────────────────────────────────────────────────────

describe("getLeaderboard – credit variant (issue #933)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns entries with a creditScore field in [0, 100]", async () => {
    vi.mocked(prisma.user.findMany).mockResolvedValueOnce(fakeUsers as never);
    vi.mocked(prisma.user.count).mockResolvedValueOnce(2 as never);

    // Tip counts: tipsSent, tipsReceived, selfTips per user × 2 users
    vi.mocked(prisma.tip.count)
      .mockResolvedValue(0 as never);

    vi.mocked(prisma.streak.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.xAccount.findUnique).mockResolvedValue(null);

    const result = await getLeaderboard("credit", "ALL_TIME", 1, 20);

    expect(result.variant).toBe("credit");
    expect(result.entries).toHaveLength(2);
    for (const entry of result.entries) {
      expect(entry.creditScore).toBeGreaterThanOrEqual(0);
      expect(entry.creditScore).toBeLessThanOrEqual(100);
    }
  });

  it("ranks users in descending credit score order", async () => {
    // User u1 has tips, u2 has none → u1 should rank first.
    vi.mocked(prisma.user.findMany).mockResolvedValueOnce(fakeUsers as never);
    vi.mocked(prisma.user.count).mockResolvedValueOnce(2 as never);
    vi.mocked(prisma.streak.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.xAccount.findUnique).mockResolvedValue(null);

    // u1: 100 sent, 50 received, 0 self
    // u2: 0 sent, 0 received, 0 self
    vi.mocked(prisma.tip.count)
      .mockResolvedValueOnce(100 as never) // u1 sent
      .mockResolvedValueOnce(50 as never)  // u1 received
      .mockResolvedValueOnce(0 as never)   // u1 self
      .mockResolvedValueOnce(0 as never)   // u2 sent
      .mockResolvedValueOnce(0 as never)   // u2 received
      .mockResolvedValueOnce(0 as never);  // u2 self

    const result = await getLeaderboard("credit", "ALL_TIME", 1, 20);

    expect(result.entries[0].creditScore!).toBeGreaterThanOrEqual(
      result.entries[1].creditScore!,
    );
  });

  it("returns pagination metadata", async () => {
    vi.mocked(prisma.user.findMany).mockResolvedValueOnce([] as never);
    vi.mocked(prisma.user.count).mockResolvedValueOnce(0 as never);

    const result = await getLeaderboard("credit", "ALL_TIME", 2, 10);

    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
    expect(result.total).toBe(0);
  });
});
