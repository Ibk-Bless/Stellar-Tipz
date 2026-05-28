import { test, expect } from "@playwright/test";

/**
 * Visual regression tests for Stellar Tipz.
 *
 * Baselines are committed to tests/visual/__snapshots__ and compared on every PR.
 * Dynamic content (timestamps, random numbers, wallet addresses) is masked before
 * taking screenshots to keep diffs stable.
 *
 * Run baseline generation:
 *   npx playwright test tests/visual --update-snapshots
 *
 * Run comparison:
 *   npx playwright test tests/visual
 */

const VIEWPORTS = {
  desktop: { width: 1280, height: 800 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 812 },
} as const;

/** CSS selectors for content that changes on every render and must be masked. */
const DYNAMIC_SELECTORS = [
  "[data-testid='timestamp']",
  "[data-testid='random-value']",
  "[data-testid='wallet-address']",
  ".recharts-wrapper",
  "time",
];

async function maskDynamic(page: import("@playwright/test").Page) {
  for (const selector of DYNAMIC_SELECTORS) {
    const els = page.locator(selector);
    const count = await els.count();
    for (let i = 0; i < count; i++) {
      await els.nth(i).evaluate((el: HTMLElement) => {
        el.style.visibility = "hidden";
      });
    }
  }
}

// ─── Landing page ──────────────────────────────────────────────────────────

test.describe("Visual regression – Landing page", () => {
  test("desktop light theme", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await maskDynamic(page);
    await expect(page).toHaveScreenshot("landing-desktop-light.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test("desktop dark theme", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Toggle dark mode via the theme button
    await page.getByRole("button", { name: /switch to dark mode/i }).click();
    await maskDynamic(page);
    await expect(page).toHaveScreenshot("landing-desktop-dark.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test("tablet viewport", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.tablet);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await maskDynamic(page);
    await expect(page).toHaveScreenshot("landing-tablet.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test("mobile viewport", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await maskDynamic(page);
    await expect(page).toHaveScreenshot("landing-mobile.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});

// ─── Leaderboard page ──────────────────────────────────────────────────────

test.describe("Visual regression – Leaderboard page", () => {
  test("desktop light theme", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto("/leaderboard");
    await page.waitForLoadState("networkidle");
    await maskDynamic(page);
    await expect(page).toHaveScreenshot("leaderboard-desktop-light.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test("mobile viewport", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto("/leaderboard");
    await page.waitForLoadState("networkidle");
    await maskDynamic(page);
    await expect(page).toHaveScreenshot("leaderboard-mobile.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});

// ─── Help page ─────────────────────────────────────────────────────────────

test.describe("Visual regression – Help page", () => {
  test("desktop light theme", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto("/help");
    await page.waitForLoadState("networkidle");
    await maskDynamic(page);
    await expect(page).toHaveScreenshot("help-desktop-light.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test("mobile viewport", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto("/help");
    await page.waitForLoadState("networkidle");
    await maskDynamic(page);
    await expect(page).toHaveScreenshot("help-mobile.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});

// ─── Register page ─────────────────────────────────────────────────────────

test.describe("Visual regression – Register page", () => {
  test("desktop light theme", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto("/register");
    await page.waitForLoadState("networkidle");
    await maskDynamic(page);
    await expect(page).toHaveScreenshot("register-desktop-light.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test("mobile viewport", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto("/register");
    await page.waitForLoadState("networkidle");
    await maskDynamic(page);
    await expect(page).toHaveScreenshot("register-mobile.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});

// ─── 404 page ──────────────────────────────────────────────────────────────

test.describe("Visual regression – 404 page", () => {
  test("desktop light theme", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto("/this-page-does-not-exist");
    await page.waitForLoadState("networkidle");
    await maskDynamic(page);
    await expect(page).toHaveScreenshot("404-desktop-light.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});
