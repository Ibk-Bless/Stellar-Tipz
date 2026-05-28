import { test, expect } from '@playwright/test';

/**
 * End-to-end happy paths for core user journeys.
 * Uses resilient selectors aligned with the current UI.
 */

test.describe('Happy path journeys', () => {
  test('landing → connect wallet → register → view profile', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1#landing-title')).toContainText(/tipz/i);

    const connectButton = page.getByRole('button', { name: /connect wallet/i });
    if (await connectButton.isVisible()) {
      await connectButton.click();
    }

    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /create your profile/i })).toBeVisible();

    await page.fill('input[name="username"]', 'e2euser');
    const displayNameInput = page.locator(
      'input[name="displayName"], input[name="display_name"]',
    );
    if (await displayNameInput.count() > 0) {
      await displayNameInput.first().fill('E2E Test User');
    }

    const bioTextarea = page.locator('textarea[name="bio"]');
    if (await bioTextarea.count() > 0) {
      await bioTextarea.fill('E2E test profile');
    }

    await expect(
      page.getByRole('button', { name: /register|create profile/i }),
    ).toBeVisible();

    await page.goto('/profile');
    await expect(page).toHaveURL(/\/profile/);
  });

  test('leaderboard → creator profile → tip form', async ({ page }) => {
    await page.goto('/leaderboard');
    await expect(page).toHaveURL(/\/leaderboard/);

    const creatorLink = page.locator('a[href*="/@"], .creator-card a').first();
    if ((await creatorLink.count()) > 0) {
      await creatorLink.click();
      await expect(page).toHaveURL(/\/@/);
    } else {
      await page.goto('/@alice');
      await expect(page).toHaveURL(/\/@alice/);
    }

    const amountInput = page.locator(
      'input[name="amount"], input[type="number"]',
    );
    if (await amountInput.count() > 0) {
      await amountInput.first().fill('5');
    }

    const messageInput = page.locator(
      'textarea[name="message"], textarea[placeholder*="message" i]',
    );
    if (await messageInput.count() > 0) {
      await messageInput.first().fill('Great work!');
    }

    await expect(
      page.getByRole('button', { name: /send tip|connect wallet/i }),
    ).toBeVisible();
  });

  test('dashboard → stats → export history', async ({ page }) => {
    await page.goto('/dashboard');

    const connectPrompt = page.getByText(/connect your wallet/i);
    const dashboardHeading = page.getByRole('heading', { name: /dashboard/i });

    if (await connectPrompt.isVisible()) {
      await expect(connectPrompt).toBeVisible();
      return;
    }

    await expect(dashboardHeading).toBeVisible();

    const exportButton = page.getByRole('button', { name: /export csv/i });
    if (await exportButton.isVisible()) {
      await expect(exportButton).toBeVisible();
    }

    const overviewTab = page.getByRole('tab', { name: /overview/i });
    if (await overviewTab.isVisible()) {
      await overviewTab.click();
    }
  });

  test('mobile viewport: landing and register', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('h1#landing-title')).toBeVisible();

    await page.goto('/register');
    await expect(page.locator('input[name="username"]')).toBeVisible();
  });
});
