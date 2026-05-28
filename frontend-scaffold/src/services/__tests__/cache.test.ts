import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildContractCacheKey,
  buildContractCacheKeyPrefix,
  ContractQueryCache,
} from '../cache';

describe('Contract query cache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('returns cached result on repeated query', async () => {
    const cache = new ContractQueryCache();
    const fetcher = vi.fn(async () => ({ username: 'alice' }));
    const key = buildContractCacheKey('get_profile', 'TESTNET', 'contract-1', 'GA...');

    await cache.getOrFetch(key, 30_000, fetcher);
    await cache.getOrFetch(key, 30_000, fetcher);

    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('invalidates on write', async () => {
    const cache = new ContractQueryCache();
    const fetcher = vi.fn(async () => ({ username: 'alice' }));
    const key = buildContractCacheKey('get_profile', 'TESTNET', 'contract-1', 'GA...');

    await cache.getOrFetch(key, 30_000, fetcher);
    cache.invalidateAll();
    await cache.getOrFetch(key, 30_000, fetcher);

    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('refreshes stale entries in background', async () => {
    const cache = new ContractQueryCache();
    const fetcher = vi
      .fn<() => Promise<string>>()
      .mockResolvedValueOnce('v1')
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve('v2'), 50);
          }),
      );
    const key = buildContractCacheKey('get_profile', 'TESTNET', 'contract-1', 'GA...');

    const initial = await cache.getOrFetch(key, 30_000, fetcher);
    expect(initial).toBe('v1');

    vi.advanceTimersByTime(31_000);

    const staleResult = await cache.getOrFetch(key, 30_000, fetcher);
    expect(staleResult).toBe('v1');
    expect(fetcher).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(50);
    await vi.runAllTimersAsync();

    const refreshed = await cache.getOrFetch(key, 30_000, fetcher);
    expect(refreshed).toBe('v2');
  });

  it('enforces max cache size', async () => {
    const cache = new ContractQueryCache(2);

    await cache.getOrFetch(buildContractCacheKey('get_profile', 'a'), 30_000, async () => 'a');
    vi.advanceTimersByTime(1);
    await cache.getOrFetch(buildContractCacheKey('get_profile', 'b'), 30_000, async () => 'b');
    vi.advanceTimersByTime(1);
    await cache.getOrFetch(buildContractCacheKey('get_profile', 'c'), 30_000, async () => 'c');

    expect(cache.size()).toBe(2);
  });

  it('evicts the least recently *accessed* entry (true LRU)', async () => {
    const cache = new ContractQueryCache(2);
    const keyA = buildContractCacheKey('get_profile', 'a');
    const keyB = buildContractCacheKey('get_profile', 'b');
    const keyC = buildContractCacheKey('get_profile', 'c');

    await cache.getOrFetch(keyA, 30_000, async () => 'a');
    vi.advanceTimersByTime(1);
    await cache.getOrFetch(keyB, 30_000, async () => 'b');
    vi.advanceTimersByTime(1);

    // Re-access A so B is now the LRU.
    await cache.getOrFetch(keyA, 30_000, async () => 'a-refetch');
    vi.advanceTimersByTime(1);

    await cache.getOrFetch(keyC, 30_000, async () => 'c');

    expect(cache.size()).toBe(2);
    // A survives, B got evicted, fresh fetcher proves it.
    const fetcherForB = vi.fn(async () => 'b-fresh');
    await cache.getOrFetch(keyB, 30_000, fetcherForB);
    expect(fetcherForB).toHaveBeenCalledTimes(1);
  });

  it('invalidates entries by prefix after a write', async () => {
    const cache = new ContractQueryCache();
    const balanceKey = buildContractCacheKey('balance', 'token-1', 'GA...');
    const profileKey = buildContractCacheKey('get_profile', 'alice');

    await cache.getOrFetch(balanceKey, 30_000, async () => '10');
    await cache.getOrFetch(profileKey, 30_000, async () => ({ name: 'alice' }));

    const removed = cache.invalidateByPrefix(buildContractCacheKeyPrefix('balance'));

    expect(removed).toBe(1);
    expect(cache.size()).toBe(1);

    const balanceFetcher = vi.fn(async () => '20');
    await cache.getOrFetch(balanceKey, 30_000, balanceFetcher);
    expect(balanceFetcher).toHaveBeenCalledTimes(1);
  });

  it('tracks hit/miss metrics', async () => {
    const cache = new ContractQueryCache();
    const fetcher = vi.fn(async () => 'data');
    const key = buildContractCacheKey('get_profile', 'alice');

    await cache.getOrFetch(key, 30_000, fetcher); // miss
    await cache.getOrFetch(key, 30_000, fetcher); // hit
    await cache.getOrFetch(key, 30_000, fetcher); // hit

    const metrics = cache.metrics();
    expect(metrics.misses).toBe(1);
    expect(metrics.hits).toBe(2);
    expect(metrics.hitRate).toBeCloseTo(2 / 3);
  });
});
