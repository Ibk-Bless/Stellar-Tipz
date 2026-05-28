import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

import EarningsChart from "./EarningsChart";

// Mock the dashboard hook so <EarningsChart /> can be rendered without props.
vi.mock("../../hooks/useDashboard", () => ({
  useDashboard: vi.fn(),
}));

import { useDashboard } from "../../hooks/useDashboard";

describe("EarningsChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDashboard).mockReturnValue({
      profile: null,
      tips: [],
      stats: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it("renders chart with tip data", () => {
    const earnings = [
      { date: "2026-04-01", amount: 100 },
      { date: "2026-04-02", amount: 150 },
    ];
    render(<EarningsChart earningsData={earnings} />);
    expect(screen.getByTestId("earnings-chart")).toBeInTheDocument();
  });

  it("toggles between time periods", async () => {
    const user = userEvent.setup();
    render(<EarningsChart earningsData={[{ date: "2026-04-01", amount: 1 }]} />);
    await user.click(screen.getByText("Weekly"));
    expect(screen.getByText(/this week/i)).toBeInTheDocument();
  });

  it("shows empty state when no data", () => {
    const earnings: Array<{ date: string; amount: number }> = [];
    render(<EarningsChart earningsData={earnings} />);
    expect(screen.getByText(/no earnings yet/i)).toBeInTheDocument();
  });
});

