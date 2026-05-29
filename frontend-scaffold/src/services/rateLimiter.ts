/**
 * Rate Limiter Service
 * Implements client-side rate limiting to prevent abuse and protect contract from excessive calls
 * Issue #552
 */

interface RateLimiterConfig {
  maxPerSecond: number;
  queueSize?: number;
}

interface QueuedRequest<T> {
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
  timestamp: number;
}

export class RateLimiter {
  private queue: QueuedRequest<unknown>[] = [];
  private processing = false;
  private requestTimestamps: number[] = [];
  private readonly maxPerSecond: number;
  private readonly queueSize: number;

  constructor(config: RateLimiterConfig) {
    this.maxPerSecond = config.maxPerSecond;
    this.queueSize = config.queueSize ?? 100;
  }

  /**
   * Execute a function with rate limiting
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      if (this.queue.length >= this.queueSize) {
        reject(new Error('Rate limiter queue is full. Please try again later.'));
        return;
      }

      this.queue.push({
        fn,
        resolve,
        reject,
        timestamp: Date.now(),
      });

      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      // Clean up old timestamps (older than 1 second)
      const now = Date.now();
      this.requestTimestamps = this.requestTimestamps.filter(
        (ts) => now - ts < 1000
      );

      // Check if we can process the next request
      if (this.requestTimestamps.length >= this.maxPerSecond) {
        // Wait until we can process more requests
        const oldestTimestamp = Math.min(...this.requestTimestamps);
        const waitTime = 1000 - (now - oldestTimestamp);
        if (waitTime > 0) {
          await this.wait(waitTime);
        }
        continue;
      }

      // Process the next request
      const request = this.queue.shift();
      if (!request) break;

      this.requestTimestamps.push(Date.now());

      try {
        const result = await request.fn();
        request.resolve(result);
      } catch (error) {
        request.reject(error);
      }
    }

    this.processing = false;
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get current queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Clear the queue
   */
  clear(): void {
    this.queue.forEach((request) => {
      request.reject(new Error('Rate limiter queue cleared'));
    });
    this.queue = [];
    this.requestTimestamps = [];
  }
}

/**
 * Create a rate limiter instance
 */
export function createRateLimiter(config: RateLimiterConfig): RateLimiter {
  return new RateLimiter(config);
}

/**
 * Exponential backoff retry logic for 429 responses
 */
export async function withExponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error;

      // Check if it's a 429 (Too Many Requests) error
      const is429 =
        error?.response?.status === 429 ||
        error?.status === 429 ||
        error?.message?.includes('429') ||
        error?.message?.toLowerCase().includes('rate limit');

      if (!is429 || attempt === maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      const jitter = Math.random() * 1000; // Add jitter to prevent thundering herd
      await new Promise((resolve) => setTimeout(resolve, delay + jitter));
    }
  }

  throw lastError;
}

// Default rate limiter for Soroban RPC calls (10 requests per second)
export const sorobanRateLimiter = createRateLimiter({ maxPerSecond: 10 });

// Stricter rate limiter for write operations (5 requests per second)
export const writeRateLimiter = createRateLimiter({ maxPerSecond: 5 });
