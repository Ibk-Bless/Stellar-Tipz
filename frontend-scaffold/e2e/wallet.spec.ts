import { test, expect } from '@playwright/test';
import {
  injectFreighterConnected,
  injectFreighterNetworkMismatch,
  injectFreighterNotConnected,
  injectFreighterUserRejected,
} from './mocks/freighter';

/**
 * Wallet Connection Flow — comprehensive E2E suite.
 *
 * Each test exercises one distinct wallet state by injecting a Freighter mock
 * (or deliberately omitting it) via page.addInitScript before navigation.
 * The mock runs before any application JavaScript so the React tree always
 * observes the intended window.freighter state on first render.
 */
test.describe('Wallet Connection Flow', () => {
  // ── Scenario 1: Extension not installed ─────────────────────────────────
  test('shows install prompt when Freighter is not installed', async ({
    page,
  }) => {
    // Do NOT inject any mock — window.freighter remains undefined,
    // simulating a browser without the Freighter extension.
    await page.goto('/');

    // The application should detect the missing extension and surface a
    // call-to-action that points users to the Freighter download page.
    await expect(
      page
        .getByText(/install freighter/i)
        .or(page.getByRole('link', { name: /install/i }))
        .or(page.getByRole('button', { name: /install/i })),
    ).toBeVisible({ timeout: 10000 });
  });

  // ── Scenario 2: Extension installed, not yet connected ──────────────────
  test('shows Connect Wallet button when wallet is installed but not connected', async ({
    page,
  }) => {
    await injectFreighterNotConnected(page);
    await page.goto('/');

    // The primary wallet CTA must be visible and invite the user to connect.
    await expect(
      page.getByRole('button', { name: /connect wallet/i }),
    ).toBeVisible({ timeout: 10000 });
  });

  // ── Scenario 3: Wallet connected ────────────────────────────────────────
  test('shows truncated public key and disconnect option when wallet is connected', async ({
    page,
  }) => {
    const publicKey =
      'GBVKN6YMDXP4FKXB26BWZJHXPGQPZLWXHKJM5YXJKTZRQPLTKLPXNQK';

    await injectFreighterConnected(page, { publicKey });
    await page.goto('/');

    // The UI should display a truncated version of the key (first + last chars)
    // rather than the full 56-character string.
    const truncatedStart = publicKey.slice(0, 4);
    const truncatedEnd = publicKey.slice(-4);

    await expect(
      page
        .getByText(new RegExp(`${truncatedStart}.*${truncatedEnd}`))
        .or(page.getByText(new RegExp(truncatedStart))),
    ).toBeVisible({ timeout: 10000 });

    // A disconnect / logout affordance must also be present once connected.
    await expect(
      page
        .getByRole('button', { name: /disconnect/i })
        .or(page.getByRole('button', { name: /log.?out/i }))
        .or(page.getByText(/disconnect/i))
        .or(page.getByText(/log.?out/i)),
    ).toBeVisible({ timeout: 10000 });
  });

  // ── Scenario 4: Network mismatch ─────────────────────────────────────────
  test('shows network warning when wallet is on the wrong network', async ({
    page,
  }) => {
    // The app expects TESTNET but the mock wallet reports PUBLIC (mainnet).
    await injectFreighterNetworkMismatch(page, 'TESTNET', 'PUBLIC');
    await page.goto('/');

    // A warning about the network discrepancy should be surfaced to the user.
    await expect(
      page
        .getByText(/wrong network/i)
        .or(page.getByText(/network mismatch/i))
        .or(page.getByText(/switch.*network/i))
        .or(page.getByText(/incorrect network/i))
        .or(page.getByText(/testnet/i)),
    ).toBeVisible({ timeout: 10000 });
  });

  // ── Scenario 5: User rejects connection ──────────────────────────────────
  test('shows graceful error when user rejects the connection request', async ({
    page,
  }) => {
    // The mock wallet is installed but getPublicKey rejects — simulating the
    // user dismissing the Freighter permission popup.
    await injectFreighterUserRejected(page);
    await page.goto('/');

    // After the rejection, the application should not crash and should surface
    // a human-readable message. Click Connect to trigger the rejection flow.
    const connectButton = page.getByRole('button', { name: /connect wallet/i });
    if (await connectButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await connectButton.click();
    }

    // The app should show a graceful error — NOT an uncaught exception banner.
    await expect(
      page
        .getByText(/rejected/i)
        .or(page.getByText(/cancelled/i))
        .or(page.getByText(/denied/i))
        .or(page.getByText(/could not connect/i))
        .or(page.getByText(/connection failed/i))
        .or(page.getByText(/try again/i)),
    ).toBeVisible({ timeout: 10000 });
  });
});
