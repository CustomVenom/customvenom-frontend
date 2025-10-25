// src/lib/upstream.ts
// Server-side resilience with circuit breaker and bulkhead patterns

interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  state: 'closed' | 'open' | 'half-open';
}

interface BulkheadState {
  active: number;
  max: number;
}

class ResilienceManager {
  private circuitBreakers = new Map<string, CircuitBreakerState>();
  private bulkheads = new Map<string, BulkheadState>();

  // Circuit breaker configuration
  private readonly FAILURE_THRESHOLD = 5;
  private readonly COOLDOWN_PERIOD = 30000; // 30 seconds

  // Bulkhead configuration
  private readonly MAX_CONCURRENT = 20;

  /**
   * Check if circuit breaker allows the request
   */
  canMakeRequest(service: string): boolean {
    const breaker = this.circuitBreakers.get(service) || {
      failures: 0,
      lastFailure: 0,
      state: 'closed' as const,
    };

    if (breaker.state === 'open') {
      const now = Date.now();
      if (now - breaker.lastFailure > this.COOLDOWN_PERIOD) {
        breaker.state = 'half-open';
        this.circuitBreakers.set(service, breaker);
        return true;
      }
      return false;
    }

    return true;
  }

  /**
   * Record a successful request
   */
  recordSuccess(service: string): void {
    const breaker = this.circuitBreakers.get(service);
    if (breaker) {
      breaker.failures = 0;
      breaker.state = 'closed';
      this.circuitBreakers.set(service, breaker);
    }
  }

  /**
   * Record a failed request
   */
  recordFailure(service: string): void {
    const breaker = this.circuitBreakers.get(service) || {
      failures: 0,
      lastFailure: 0,
      state: 'closed' as const,
    };

    breaker.failures++;
    breaker.lastFailure = Date.now();

    if (breaker.failures >= this.FAILURE_THRESHOLD) {
      breaker.state = 'open';
    }

    this.circuitBreakers.set(service, breaker);
  }

  /**
   * Check if bulkhead allows the request
   */
  canAcquireBulkhead(service: string): boolean {
    const bulkhead = this.bulkheads.get(service) || {
      active: 0,
      max: this.MAX_CONCURRENT,
    };

    return bulkhead.active < bulkhead.max;
  }

  /**
   * Acquire bulkhead slot
   */
  acquireBulkhead(service: string): boolean {
    const bulkhead = this.bulkheads.get(service) || {
      active: 0,
      max: this.MAX_CONCURRENT,
    };

    if (bulkhead.active < bulkhead.max) {
      bulkhead.active++;
      this.bulkheads.set(service, bulkhead);
      return true;
    }

    return false;
  }

  /**
   * Release bulkhead slot
   */
  releaseBulkhead(service: string): void {
    const bulkhead = this.bulkheads.get(service);
    if (bulkhead && bulkhead.active > 0) {
      bulkhead.active--;
      this.bulkheads.set(service, bulkhead);
    }
  }
}

const resilienceManager = new ResilienceManager();

/**
 * Resilient fetch with circuit breaker and bulkhead
 */
export async function resilientFetch(
  url: string,
  options: RequestInit & {
    service?: string;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
  } = {}
): Promise<Response> {
  const {
    service = 'default',
    timeout = 2500, // 2.5s timeout
    retries = 2,
    retryDelay = 200, // Base delay
    ...fetchOptions
  } = options;

  // Check circuit breaker
  if (!resilienceManager.canMakeRequest(service)) {
    throw new Error(`Circuit breaker open for ${service}`);
  }

  // Check bulkhead
  if (!resilienceManager.canAcquireBulkhead(service)) {
    throw new Error(`Bulkhead full for ${service}`);
  }

  if (!resilienceManager.acquireBulkhead(service)) {
    throw new Error(`Failed to acquire bulkhead for ${service}`);
  }

  let lastError: Error | null = null;

  try {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          resilienceManager.recordSuccess(service);
          return response;
        } else if (response.status >= 500) {
          // Server error - retry with exponential backoff
          const delay = retryDelay * Math.pow(2, attempt) + Math.random() * 100; // Jitter
          if (attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
        }

        // Client error or max retries reached
        resilienceManager.recordFailure(service);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error as Error;

        if (attempt < retries) {
          const delay = retryDelay * Math.pow(2, attempt) + Math.random() * 100; // Jitter
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        resilienceManager.recordFailure(service);
        throw error;
      }
    }

    throw lastError || new Error('Max retries exceeded');
  } finally {
    resilienceManager.releaseBulkhead(service);
  }
}

/**
 * Create a response with stale data indicator
 */
export function createStaleResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'x-stale': 'true',
      'x-request-id': crypto.randomUUID(),
    },
  });
}
