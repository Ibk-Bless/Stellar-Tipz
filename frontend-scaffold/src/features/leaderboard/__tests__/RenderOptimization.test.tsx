import React, { useMemo, useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import LeaderboardRow from "../LeaderboardRow";
import type { LeaderboardEntry } from "@/types/contract";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../../../store", () => ({
  useWalletStore: (selector?: (state: { connected: boolean; publicKey: string | null }) => unknown) => {
    const state = { connected: false, publicKey: null };
    return selector ? selector(state) : state;
  },
}));

vi.mock("../../../hooks/useFavorites", () => ({
  useFavorites: () => ({
    isFavorite: vi.fn(() => false),
    toggleFavorite: vi.fn(),
  }),
}));

const entry: LeaderboardEntry = {
  address: "GABC123",
  username: "alice",
  totalTipsReceived: "10000000",
  creditScore: 750,
};

function RenderCounterHarness() {
  const [unrelatedCount, setUnrelatedCount] = useState(0);

  return (
    <div>
      <button type="button" onClick={() => setUnrelatedCount((count) => count + 1)}>
        Update parent {unrelatedCount}
      </button>
      <table>
        <tbody>
          <LeaderboardRow entry={entry} rank={1} />
        </tbody>
      </table>
    </div>
  );
}

function MemoizedCalculationHarness({ calc }: { calc: () => string }) {
  const [unrelatedCount, setUnrelatedCount] = useState(0);
  const computedValue = useMemo(() => calc(), [calc]);

  return (
    <div>
      <button type="button" onClick={() => setUnrelatedCount((count) => count + 1)}>
        Re-render {unrelatedCount}
      </button>
      <span>{computedValue}</span>
    </div>
  );
}

describe("Render optimization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.__TIPZ_RENDER_COUNTS__ = {};
  });

  it("LeaderboardRow does not re-render when unrelated parent state changes", () => {
    render(<RenderCounterHarness />);

    const renderKey = `LeaderboardRow:${entry.address}`;
    expect(window.__TIPZ_RENDER_COUNTS__?.[renderKey]).toBe(1);

    fireEvent.click(screen.getByRole("button", { name: /update parent/i }));

    expect(window.__TIPZ_RENDER_COUNTS__?.[renderKey]).toBe(1);
  });

  it("useMemo prevents recalculation during unrelated re-renders", () => {
    const calcSpy = vi.fn(() => "memoized amount");
    render(<MemoizedCalculationHarness calc={calcSpy} />);

    expect(calcSpy).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /re-render/i }));
    fireEvent.click(screen.getByRole("button", { name: /re-render/i }));

    expect(calcSpy).toHaveBeenCalledTimes(1);
  });
});
