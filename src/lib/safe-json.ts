/**
 * Safe JSON parsing utility
 * Returns fallback value on parse errors instead of throwing
 */
export function safeJson<T = unknown>(input: string | null | undefined, fallback: T): T {
  if (!input) return fallback;
  try {
    return JSON.parse(input) as T;
  } catch {
    return fallback;
  }
}

