export type CacheKeyPart = string | number | boolean | null | undefined;

export type CacheEntry<T> = {
  data: T;
  expiresAt: number;
  inFlightRefresh?: Promise<T>;
  lastUpdatedAt: number;
  lastAccessedAt: number;
};

export type CacheMetrics = {
  hits: number;
  misses: number;
  staleHits: number;
  evictions: number;
  invalidations: number;
  size: number;
  hitRate: number;
};

const DEFAULT_MAX_CACHE_SIZE = 200;

export class ContractQueryCache {
  private readonly cache = new Map<string, CacheEntry<unknown>>();
  private hits = 0;
  private misses = 0;
  private staleHits = 0;
  private evictions = 0;
  private invalidations = 0;

  constructor(private readonly maxSize: number = DEFAULT_MAX_CACHE_SIZE) {}

  async getOrFetch<T>(
    key: string,
    ttlMs: number,
    fetcher: () => Promise<T>,
  ): Promise<T> {
    const now = Date.now();
    const cached = this.cache.get(key) as CacheEntry<T> | undefined;

    if (cached) {
      cached.lastAccessedAt = now;

      if (cached.expiresAt > now) {
        this.hits += 1;
        return cached.data;
      }

      // Stale-while-revalidate: return the stale value immediately while a
      // background refresh repopulates the entry.
      this.staleHits += 1;
      if (!cached.inFlightRefresh) {
        cached.inFlightRefresh = this.refreshEntry(key, ttlMs, fetcher, cached);
      }

      return cached.data;
    }

    this.misses += 1;
    const freshValue = await fetcher();
    this.set(key, {
      data: freshValue,
      expiresAt: now + ttlMs,
      lastUpdatedAt: now,
      lastAccessedAt: now,
    });
    return freshValue;
  }

  invalidate(key: string): boolean {
    const removed = this.cache.delete(key);
    if (removed) {
      this.invalidations += 1;
    }
    return removed;
  }

  /**
   * Drop every entry whose key starts with `prefix`.
   * Useful for invalidating all reads tied to a contract or address after a
   * write operation.
   */
  invalidateByPrefix(prefix: string): number {
    let removed = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        removed += 1;
      }
    }
    if (removed > 0) {
      this.invalidations += removed;
    }
    return removed;
  }

  invalidateAll(): void {
    this.invalidations += this.cache.size;
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  metrics(): CacheMetrics {
    const totalLookups = this.hits + this.misses + this.staleHits;
    const hitRate =
      totalLookups === 0 ? 0 : (this.hits + this.staleHits) / totalLookups;
    return {
      hits: this.hits,
      misses: this.misses,
      staleHits: this.staleHits,
      evictions: this.evictions,
      invalidations: this.invalidations,
      size: this.cache.size,
      hitRate,
    };
  }

  resetMetrics(): void {
    this.hits = 0;
    this.misses = 0;
    this.staleHits = 0;
    this.evictions = 0;
    this.invalidations = 0;
  }

  private async refreshEntry<T>(
    key: string,
    ttlMs: number,
    fetcher: () => Promise<T>,
    staleEntry: CacheEntry<T>,
  ): Promise<T> {
    try {
      const refreshed = await fetcher();
      const now = Date.now();
      this.set(key, {
        data: refreshed,
        expiresAt: now + ttlMs,
        lastUpdatedAt: now,
        lastAccessedAt: now,
      });
      return refreshed;
    } catch (error) {
      // Keep stale value if background refresh fails.
      staleEntry.inFlightRefresh = undefined;
      throw error;
    } finally {
      const latest = this.cache.get(key) as CacheEntry<T> | undefined;
      if (latest) {
        latest.inFlightRefresh = undefined;
      }
    }
  }

  private set<T>(key: string, entry: CacheEntry<T>): void {
    this.cache.set(key, entry as CacheEntry<unknown>);
    this.enforceMaxSize();
  }

  private enforceMaxSize(): void {
    if (this.cache.size <= this.maxSize) {
      return;
    }

    // True LRU: evict by oldest lastAccessedAt.
    const sortedByOldest = [...this.cache.entries()].sort(
      (a, b) => a[1].lastAccessedAt - b[1].lastAccessedAt,
    );

    while (this.cache.size > this.maxSize && sortedByOldest.length > 0) {
      const oldest = sortedByOldest.shift();
      if (!oldest) {
        break;
      }
      this.cache.delete(oldest[0]);
      this.evictions += 1;
    }
  }
}

export const buildContractCacheKey = (
  method: string,
  ...params: CacheKeyPart[]
): string => {
  return JSON.stringify([method, ...params]);
};

/**
 * Build a prefix matching every cache key that starts with `method` —
 * useful for invalidating all reads of a method after a write.
 */
export const buildContractCacheKeyPrefix = (method: string): string => {
  // JSON.stringify(["method", ...]) always begins with ["method"
  // (without a trailing closing bracket). We match on the opening fragment.
  return `["${method}"`;
};

export const contractQueryCache = new ContractQueryCache();
