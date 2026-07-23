/**
 * Unit tests for the credit module.
 * Tests cover:
 *   #922 – Credit: Credit score anti-gaming safeguards
 *   #919 – Credit: Credit score recompute on X metrics refresh
 *   #920 – Credit: Credit score bounds + normalization
 *
 * Pure formula functions are tested without a DB or env; DB-backed
 * service functions use Vitest mocks.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock env & Prisma so no real DB is needed ─────────────────────────────────
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
    user: { findUnique: vi.fn(), count: vi.fn() },
    tip: { count: vi.fn() },
    streak: { findUnique: vi.fn() },
    xAccount: { findUnique: vi.fn() },
  },
}));

import {
  clamp,
  normalise,
  computeAntiGamingPenalty,
  computeCreditScore,
  ANTI_GAMING,
  getCreditScore,
  recomputeCreditScore,
} from "./credit.service.js";
import { prisma } from "@/db/prisma.js";
import type { CreditSignals } from "./credit.types.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

const baseSignals = (): CreditSignals => ({
  tipsSent: 100,
  tipsReceived: 50,
  streak: 30,
  xFollowers: 5000,
  xEngagement: 0.05,
  selfTips: 0,
  washTipRatio: 0,
});

const fakeUser = {
  id: "user_01",
  stellarAddress: "GABC123",
  xHandle: "testhandle",
};

// ── Issue #920: clamp ─────────────────────────────────────────────────────────

describe("clamp (issue #920)", () => {
  it("returns the value when within range", () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });

  it("clamps to min when below range", () => {
    expect(clamp(-10, 0, 100)).toBe(0);
  });

  it("clamps to max when above range", () => {
    expect(clamp(150, 0, 100)).toBe(100);
  });

  it("clamps boundary values correctly", () => {
    expect(clamp(0, 0, 100)).toBe(0);
    expect(clamp(100, 0, 100)).toBe(100);
  });
});

// ── Issue #920: normalise ─────────────────────────────────────────────────────

describe("normalise (issue #920)", () => {
  it("returns 0 when value is 0", () => {
    expect(normalise(0, 500)).toBe(0);
  });

  it("returns 100 when value equals maxExpected", () => {
    expect(normalise(500, 500)).toBe(100);
  });

  it("clamps to 100 when value exceeds maxExpected", () => {
    expect(normalise(1000, 500)).toBe(100);
  });

  it("normalises proportionally", () => {
    expect(normalise(250, 500)).toBe(50);
  });

  it("returns 0 when maxExpected is 0 (guard against division by zero)", () => {
    expect(normalise(100, 0)).toBe(0);
  });
});

// ── Issue #922: anti-gaming penalty ──────────────────────────────────────────

describe("computeAntiGamingPenalty (issue #922)", () => {
  it("returns 0 when there are no self-tips and no wash-tipping", () => {
    expect(computeAntiGamingPenalty(0, 0)).toBe(0);
  });

  it("penalises each self-tip by SELF_TIP_PENALTY_PER_TIP", () => {
    const penalty = computeAntiGamingPenalty(1, 0);
    expect(penalty).toBe(ANTI_GAMING.SELF_TIP_PENALTY_PER_TIP);
  });

  it("caps self-tip penalty at MAX_SELF_TIP_PENALTY", () => {
    // 100 self-tips × 2 = 200, capped at 20
    const penalty = computeAntiGamingPenalty(100, 0);
    expect(penalty).toBe(ANTI_GAMING.MAX_SELF_TIP_PENALTY);
  });

  it("penalises a full wash-tip ratio by WASH_TIP_WEIGHT", () => {
    const penalty = computeAntiGamingPenalty(0, 1);
    expect(penalty).toBe(ANTI_GAMING.WASH_TIP_WEIGHT);
  });

  it("combines both penalties and caps total at 50", () => {
    // 100 self-tips (cap 20) + wash 1.0 (30) = 50
    const penalty = computeAntiGamingPenalty(100, 1);
    expect(penalty).toBe(50);
  });

  it("clamps washTipRatio to [0, 1]", () => {
    const overPenalty = computeAntiGamingPenalty(0, 5);
    const normalPenalty = computeAntiGamingPenalty(0, 1);
    expect(overPenalty).toBe(normalPenalty);
  });
});

// ── Issue #920 + #922: computeCreditScore (pure formula) ─────────────────────

describe("computeCreditScore (issues #920 & #922)", () => {
  it("returns a score in [0, 100]", () => {
    const result = computeCreditScore("u1", baseSignals());
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("returns score 0 when all signals are zero", () => {
    const signals: CreditSignals = {
      tipsSent: 0,
      tipsReceived: 0,
      streak: 0,
      xFollowers: 0,
      xEngagement: null,
      selfTips: 0,
      washTipRatio: 0,
    };
    const result = computeCreditScore("u1", signals);
    expect(result.score).toBe(0);
  });

  it("returns a lower score when anti-gaming signals are high", () => {
    const clean = computeCreditScore("u1", baseSignals());
    const gamed = computeCreditScore("u1", {
      ...baseSignals(),
      selfTips: 100,
      washTipRatio: 1,
    });
    expect(gamed.score).toBeLessThan(clean.score);
  });

  it("breaks down sub-scores in the result", () => {
    const result = computeCreditScore("u1", baseSignals());
    expect(result.breakdown).toMatchObject({
      volumeScore: expect.any(Number),
      streakScore: expect.any(Number),
      socialScore: expect.any(Number),
      antiGamingPenalty: expect.any(Number),
    });
  });

  it("includes computedAt as a valid ISO string", () => {
    const result = computeCreditScore("u1", baseSignals());
    expect(() => new Date(result.computedAt).toISOString()).not.toThrow();
  });

  it("score is identical given the same inputs (pure function)", () => {
    const r1 = computeCreditScore("u1", baseSignals());
    const r2 = computeCreditScore("u1", baseSignals());
    expect(r1.score).toBe(r2.score);
  });
});

// ── Issue #919: getCreditScore (DB-backed, mocked) ────────────────────────────

describe("getCreditScore – DB integration (issue #919)", () => {
  beforeEach(() => vi.clearAllMocks());

  function setupMocks(
    overrides: Partial<{
      streak: number | null;
      xFollowers: number;
      xEngagement: number | null;
      tipsSent: number;
      tipsReceived: number;
      selfTips: number;
    }> = {},
  ) {
    const opts = {
      streak: 10,
      xFollowers: 1000,
      xEngagement: 0.03,
      tipsSent: 50,
      tipsReceived: 30,
      selfTips: 0,
      ...overrides,
    };

    vi.mocked(prisma.user.findUnique)
      .mockResolvedValueOnce(fakeUser as never) // initial exists check
      .mockResolvedValueOnce(fakeUser as never) // buildSignalsForUser user
      .mockResolvedValueOnce(fakeUser as never); // buildSignalsForUser xHandle lookup

    vi.mocked(prisma.streak.findUnique).mockResolvedValueOnce(
      opts.streak !== null
        ? ({ currentStreak: opts.streak } as never)
        : null,
    );

    vi.mocked(prisma.xAccount.findUnique).mockResolvedValueOnce(
      opts.xFollowers !== undefined
        ? ({ followers: opts.xFollowers, engagement: opts.xEngagement } as never)
        : null,
    );

    // tip counts: [sent, received, selfTips]
    vi.mocked(prisma.tip.count)
      .mockResolvedValueOnce(opts.tipsSent as never)
      .mockResolvedValueOnce(opts.tipsReceived as never)
      .mockResolvedValueOnce(opts.selfTips as never);
  }

  it("returns a CreditScore with a numeric score", async () => {
    setupMocks();
    const result = await getCreditScore("user_01");
    expect(typeof result.score).toBe("number");
    expect(result.userId).toBe("user_01");
  });

  it("throws NotFoundError when user does not exist", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
    await expect(getCreditScore("ghost")).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

// ── Issue #919: recomputeCreditScore ─────────────────────────────────────────

describe("recomputeCreditScore (issue #919)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns a fresh CreditScore after recompute", async () => {
    vi.mocked(prisma.user.findUnique)
      .mockResolvedValueOnce(fakeUser as never)
      .mockResolvedValueOnce(fakeUser as never);

    vi.mocked(prisma.streak.findUnique).mockResolvedValueOnce(
      { currentStreak: 5 } as never,
    );
    vi.mocked(prisma.xAccount.findUnique).mockResolvedValueOnce(
      { followers: 200, engagement: 0.01 } as never,
    );
    vi.mocked(prisma.tip.count)
      .mockResolvedValueOnce(10 as never)
      .mockResolvedValueOnce(5 as never)
      .mockResolvedValueOnce(0 as never);

    const result = await recomputeCreditScore("user_01");
    expect(result.userId).toBe("user_01");
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
