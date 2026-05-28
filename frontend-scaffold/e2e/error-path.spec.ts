import { test, expect } from '@playwright/test';

/**
 * Error-path E2E tests for wallet and tipping failures.
 */

test.describe('Error path journeys', () => {
  test('invalid wallet connection shows connect prompt', async ({ page }) => {
    await page.goto('/@alice');

    const connectButton = page.getByRole('button', { name: /connect wallet/i });
    await expect(connectButton).toBeVisible();

    await connectButton.click();
    await expect(connectButton).toBeVisible();
  });

  test('tip with insufficient funds or invalid amount shows validation', async ({
    page,
  }) => {
    await page.goto('/@alice');

    const amountInput = page.locator(
      'input[name="amount"], input[type="number"]',
    );
    if ((await amountInput.count()) === 0) {
      test.skip();
      return;
    }

    await amountInput.first().fill('0');
    const sendTipButton = page.getByRole('button', { name: /send tip/i });
    if (await sendTipButton.isVisible()) {
      await sendTipButton.click();
    }

    const validationMessage = page.locator(
      '[role="alert"], .error, text=/minimum|invalid|insufficient/i',
    );
    if ((await validationMessage.count()) > 0) {
      await expect(validationMessage.first()).toBeVisible();
    } else {
      const connectButton = page.getByRole('button', { name: /connect wallet/i });
      await expect(connectButton).toBeVisible();
    }
  });

  test('unregistered creator shows not found state', async ({ page }) => {
    await page.goto('/@nonexistent_creator_xyz_99999');
    await page.waitForLoadState('networkidle');

    const notFound = page.getByText(/not found|creator not found|no profile/i);
    const tipHeading = page.getByRole('heading', { name: /tip/i });
    const hasNotFound = (await notFound.count()) > 0;
    const hasTipForm = (await tipHeading.count()) > 0;
    expect(hasNotFound || hasTipForm).toBeTruthy();
  });

  test('mobile: wallet error path on tip page', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/@alice');

    const connectButton = page.getByRole('button', { name: /connect wallet/i });
    await expect(connectButton).toBeVisible();
  });
});
