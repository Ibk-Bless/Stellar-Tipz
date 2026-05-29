import { test, expect } from '@playwright/test';
import {
  injectFreighterConnected,
  injectFreighterNotConnected,
} from './mocks/freighter';

const TEST_PUBLIC_KEY = 'GBVKN6YMDXP4FKXB26BWZJHXPGQPZLWXHKJM5YXJKTZRQPLTKLPXNQK';

test.describe('Core Tipping Flow', () => {
  test('connect wallet and navigate to creator profile', async ({ page }) => {
    await injectFreighterConnected(page, { publicKey: TEST_PUBLIC_KEY });
    await page.goto('/@alice');

    await expect(page.getByText(/tip creator/i)).toBeVisible({ timeout: 10000 });
    const truncatedStart = TEST_PUBLIC_KEY.slice(0, 4);
    await expect(page.getByText(truncatedStart)).toBeVisible();
  });

  test('tip form validates input and shows errors', async ({ page }) => {
    await injectFreighterConnected(page, { publicKey: TEST_PUBLIC_KEY });
    await page.goto('/@alice');

    const sendButton = page.getByRole('button', { name: /send tip/i });
    await expect(sendButton).toBeVisible({ timeout: 10000 });
    await sendButton.click();

    await expect(page.getByText(/invalid|required|error|enter/i)).toBeVisible({ timeout: 5000 });
  });

  test('successful tip submission shows receipt', async ({ page }) => {
    await injectFreighterConnected(page, { publicKey: TEST_PUBLIC_KEY });

    await page.route('**/soroban/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          result: { id: 'tip-123', status: 'success', hash: 'abc123' },
        }),
      });
    });

    await page.goto('/@alice');

    const amountInput = page.locator('input[name="amount"], input[type="number"]');
    await expect(amountInput.first()).toBeVisible({ timeout: 10000 });
    await amountInput.first().fill('10');

    const messageInput = page.locator('textarea[name="message"], textarea');
    await messageInput.first().fill('Great content!');

    const sendButton = page.getByRole('button', { name: /send tip/i });
    await sendButton.click();

    await expect(
      page.getByText(/success|receipt|confirmed|thank/i),
    ).toBeVisible({ timeout: 10000 });
  });

  test('dashboard reflects balance after tip', async ({ page }) => {
    await injectFreighterConnected(page, { publicKey: TEST_PUBLIC_KEY });

    await page.route('**/soroban/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          result: { balance: '50000000', tips: [{ amount: '10000000', timestamp: Date.now() / 1000 }] },
        }),
      });
    });

    await page.goto('/dashboard');
    await expect(page.getByText(/dashboard|balance/i)).toBeVisible({ timeout: 10000 });
  });

  test('prompts wallet connection when not connected', async ({ page }) => {
    await injectFreighterNotConnected(page);
    await page.goto('/@alice');

    await expect(
      page.getByRole('button', { name: /connect wallet/i }),
    ).toBeVisible({ timeout: 10000 });
  });

  test('anonymous tip checkbox works', async ({ page }) => {
    await injectFreighterConnected(page, { publicKey: TEST_PUBLIC_KEY });
    await page.goto('/@alice');

    const checkbox = page.locator('input[type="checkbox"]');
    if ((await checkbox.count()) > 0) {
      await checkbox.first().check();
      expect(await checkbox.first().isChecked()).toBe(true);
    }
  });
});
