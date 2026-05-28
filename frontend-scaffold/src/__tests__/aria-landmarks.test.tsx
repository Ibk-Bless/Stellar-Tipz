import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import App from "@/App";
import Header from "@/components/layout/Header";
import LandingPage from "@/features/landing/LandingPage";
import { I18nProvider } from "@/i18n";

vi.mock("@/services/serviceWorker", () => ({
  onUpdateAvailable: vi.fn(() => () => {}),
  skipWaiting: vi.fn(),
}));

vi.mock("@/hooks/useOfflineStatus", () => ({
  useOfflineStatus: () => ({ isOffline: false }),
}));

vi.mock("@/hooks/useWallet", () => ({
  useWallet: () => ({
    connected: false,
    publicKey: null,
    connect: vi.fn(),
    disconnect: vi.fn(),
  }),
}));

vi.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({
    theme: "light",
    toggleTheme: vi.fn(),
  }),
}));

vi.mock("@/components/shared/WalletSwitcher", () => ({
  default: () => <div>Wallet switcher</div>,
}));

vi.mock("@/components/shared/KeyboardShortcutsProvider", () => ({
  default: () => null,
}));

vi.mock("@/components/shared/ToastContainer", () => ({
  default: () => null,
}));

vi.mock("@/components/shared/PageTransition", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/features/landing/StatsSection", () => ({
  default: () => (
    <section role="region" aria-labelledby="stats-heading">
      <h2 id="stats-heading">Tipz vs Traditional</h2>
    </section>
  ),
}));

vi.mock("@/features/landing/TopCreatorsSection", () => ({
  default: () => (
    <section role="region" aria-labelledby="top-creators-heading">
      <h2 id="top-creators-heading">Top Creators</h2>
    </section>
  ),
}));

vi.mock("@/features/landing/TrendingCreatorsSection", () => ({
  default: () => (
    <section role="region" aria-labelledby="trending-heading">
      <h2 id="trending-heading">Hot right now</h2>
    </section>
  ),
}));

vi.mock("@/features/landing/CTASection", () => ({
  default: () => (
    <section role="region" aria-labelledby="landing-cta-heading">
      <h2 id="landing-cta-heading">Start Receiving Tips Today</h2>
    </section>
  ),
}));

const renderLandingPage = () =>
  render(
    <BrowserRouter>
      <I18nProvider>
        <LandingPage />
      </I18nProvider>
    </BrowserRouter>,
  );

describe("ARIA landmarks", () => {
  it("has main landmark", () => {
    renderLandingPage();

    expect(screen.getByRole("main", { name: /landing page content/i })).toBeInTheDocument();
  });

  it("has navigation landmark", () => {
    render(
      <BrowserRouter>
        <I18nProvider>
          <Header />
        </I18nProvider>
      </BrowserRouter>,
    );

    expect(screen.getByRole("navigation", { name: /primary navigation/i })).toBeInTheDocument();
  });

  it("has skip nav link", () => {
    render(
      <I18nProvider>
        <App />
      </I18nProvider>,
    );

    expect(screen.getByText(/skip to main content|skip to content/i)).toBeInTheDocument();
  });

  it("has proper heading hierarchy", () => {
    renderLandingPage();

    const headings = screen.getAllByRole("heading");
    expect(headings[0].tagName).toBe("H1");
  });
});
