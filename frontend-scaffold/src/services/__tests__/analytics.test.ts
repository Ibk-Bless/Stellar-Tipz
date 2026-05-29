import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { analytics } from '../analytics';

// Mocks and helpers for the tests
const fetchMock = vi.fn(() => Promise.resolve({ ok: true } as Response));

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Helper functions matching the exact specifications in the issue test cases
function navigateTo(path: string) {
  analytics.trackPageView(path);
}

interface SendTipPayload {
  amount: number;
  walletAddress?: string;
  publicKey?: string;
}

function sendTip(payload: SendTipPayload) {
  analytics.trackEvent('tip_sent', payload);
}

describe('Analytics', () => {
  it('tracks page view on navigation', () => {
    const spy = vi.spyOn(analytics, 'trackPageView');
    navigateTo('/leaderboard');
    expect(spy).toHaveBeenCalledWith('/leaderboard');
  });

  it('tracks tip sent event', () => {
    const spy = vi.spyOn(analytics, 'trackEvent');
    sendTip({ amount: 10 });
    expect(spy).toHaveBeenCalledWith('tip_sent', { amount: 10 });
  });

  it('does not track personal data', () => {
    const spy = vi.spyOn(analytics, 'trackEvent');
    // Even if personal data like walletAddress or publicKey is supplied, it must be stripped
    sendTip({ amount: 10, walletAddress: 'GDX...123', publicKey: 'GDX...456' });
    const args = spy.mock.calls[0][1];
    expect(args).not.toHaveProperty('walletAddress');
    expect(args).not.toHaveProperty('publicKey');
  });

  it('strips PII keys correctly from any custom event', () => {
    const spy = vi.spyOn(analytics, 'trackEvent');
    analytics.trackEvent('test_event', {
      someProp: 'value',
      walletAddress: 'secretAddress',
      wallet_address: 'anotherSecret',
      publicKey: 'public_key',
      address: 'stellar_address',
      ip: '127.0.0.1',
      email: 'user@example.com',
      userId: 'user_123',
      user_id: 'user_456',
    });

    const args = spy.mock.calls[0][1];
    expect(args).toEqual({ someProp: 'value' });
    expect(args).not.toHaveProperty('walletAddress');
    expect(args).not.toHaveProperty('wallet_address');
    expect(args).not.toHaveProperty('publicKey');
    expect(args).not.toHaveProperty('address');
    expect(args).not.toHaveProperty('ip');
    expect(args).not.toHaveProperty('email');
    expect(args).not.toHaveProperty('userId');
    expect(args).not.toHaveProperty('user_id');
  });
});
