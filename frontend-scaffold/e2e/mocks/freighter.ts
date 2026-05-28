/**
 * Reusable Freighter wallet mock for Playwright E2E tests.
 *
 * Usage: call the appropriate helper before page.goto() so the init script
 * is injected into the page before any application code runs.
 *
 * Each helper calls page.addInitScript({ content: <js string> }) which
 * evaluates the snippet in the page context at document creation time,
 * guaranteeing that window.freighter is (or is not) defined when the
 * React tree mounts.
 */

import type { Page } from '@playwright/test';

/** Shape of options accepted by each mock helper. */
export interface FreighterMockOptions {
  /** Stellar public key to return from getPublicKey (default: test key). */
  publicKey?: string;
  /** Network name to return from getNetwork (default: 'TESTNET'). */
  network?: string;
  /** Whether isConnected() resolves true (default: true). */
  connected?: boolean;
  /** If set, getPublicKey rejects with this message instead of resolving. */
  rejectMessage?: string;
}

const DEFAULT_PUBLIC_KEY =
  'GBVKN6YMDXP4FKXB26BWZJHXPGQPZLWXHKJM5YXJKTZRQPLTKLPXNQK';

/**
 * Does NOT inject window.freighter — simulates the extension not being
 * installed at all. The application should detect the absence of
 * window.freighter and render an install prompt.
 */
export async function injectFreighterNotInstalled(page: Page): Promise<void> {
  // Explicitly delete any previously set mock so the page starts clean.
  await page.addInitScript({
    content: `delete window.freighter;`,
  });
}

/**
 * Injects a Freighter mock where the wallet is installed but the user has
 * not yet connected (isConnected resolves false, getPublicKey rejects).
 */
export async function injectFreighterNotConnected(
  page: Page,
  options: Pick<FreighterMockOptions, 'network'> = {},
): Promise<void> {
  const network = options.network ?? 'TESTNET';
  await page.addInitScript({
    content: `
      window.freighter = {
        isConnected: function() {
          return Promise.resolve(false);
        },
        getPublicKey: function() {
          return Promise.reject(new Error('Wallet not connected'));
        },
        getNetwork: function() {
          return Promise.resolve({ network: '${network}', networkPassphrase: '' });
        },
        signTransaction: function(xdr) {
          return Promise.reject(new Error('Wallet not connected'));
        },
      };
    `,
  });
}

/**
 * Injects a fully-connected Freighter mock that resolves a public key and
 * the requested network.
 */
export async function injectFreighterConnected(
  page: Page,
  options: FreighterMockOptions = {},
): Promise<void> {
  const publicKey = options.publicKey ?? DEFAULT_PUBLIC_KEY;
  const network = options.network ?? 'TESTNET';

  await page.addInitScript({
    content: `
      window.freighter = {
        isConnected: function() {
          return Promise.resolve(true);
        },
        getPublicKey: function() {
          return Promise.resolve('${publicKey}');
        },
        getNetwork: function() {
          return Promise.resolve({ network: '${network}', networkPassphrase: '' });
        },
        signTransaction: function(xdr) {
          return Promise.resolve(xdr);
        },
      };
    `,
  });
}

/**
 * Injects a connected wallet mock but returns a mismatched network so the
 * application should render a network-mismatch warning.
 *
 * @param expectedNetwork  The network the app expects (e.g. 'TESTNET').
 * @param actualNetwork    The network the mock wallet reports (e.g. 'PUBLIC').
 */
export async function injectFreighterNetworkMismatch(
  page: Page,
  expectedNetwork = 'TESTNET',
  actualNetwork = 'PUBLIC',
): Promise<void> {
  const publicKey = DEFAULT_PUBLIC_KEY;
  await page.addInitScript({
    content: `
      window.freighter = {
        _expectedNetwork: '${expectedNetwork}',
        _actualNetwork: '${actualNetwork}',
        isConnected: function() {
          return Promise.resolve(true);
        },
        getPublicKey: function() {
          return Promise.resolve('${publicKey}');
        },
        getNetwork: function() {
          return Promise.resolve({ network: '${actualNetwork}', networkPassphrase: '' });
        },
        signTransaction: function(xdr) {
          return Promise.reject(new Error('Network mismatch'));
        },
      };
    `,
  });
}

/**
 * Injects a Freighter mock that simulates the user clicking "Reject" in the
 * connection popup — isConnected is false and getPublicKey rejects with a
 * user-rejection error.
 */
export async function injectFreighterUserRejected(page: Page): Promise<void> {
  await page.addInitScript({
    content: `
      window.freighter = {
        isConnected: function() {
          return Promise.resolve(false);
        },
        getPublicKey: function() {
          return Promise.reject(new Error('User rejected the request'));
        },
        getNetwork: function() {
          return Promise.resolve({ network: 'TESTNET', networkPassphrase: '' });
        },
        signTransaction: function(xdr) {
          return Promise.reject(new Error('User rejected the request'));
        },
      };
    `,
  });
}

/**
 * Generic helper — injects a Freighter mock with full control over every
 * return value. Use when none of the scenario-specific helpers fits.
 */
export async function injectFreighterMock(
  page: Page,
  options: FreighterMockOptions = {},
): Promise<void> {
  const publicKey = options.publicKey ?? DEFAULT_PUBLIC_KEY;
  const network = options.network ?? 'TESTNET';
  const connected = options.connected ?? true;
  const rejectMessage = options.rejectMessage;

  const getPublicKeyImpl = rejectMessage
    ? `return Promise.reject(new Error(${JSON.stringify(rejectMessage)});`
    : `return Promise.resolve(${JSON.stringify(publicKey)});`;

  await page.addInitScript({
    content: `
      window.freighter = {
        isConnected: function() {
          return Promise.resolve(${connected});
        },
        getPublicKey: function() {
          ${getPublicKeyImpl}
        },
        getNetwork: function() {
          return Promise.resolve({ network: ${JSON.stringify(network)}, networkPassphrase: '' });
        },
        signTransaction: function(xdr) {
          ${rejectMessage
            ? `return Promise.reject(new Error(${JSON.stringify(rejectMessage)}));`
            : `return Promise.resolve(xdr);`}
        },
      };
    `,
  });
}
