// src/lib/http-guard.ts
/**
 * Yahoo HTTPS Enforcement
 * Ensures all Yahoo API calls use HTTPS for security compliance
 */

export function enforceYahooHttps(url: string): string {
  // Handle empty strings and non-URL strings
  if (!url || !url.includes('://')) {
    return url;
  }

  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    const isYahoo =
      host === 'yahoo.com' || host.endsWith('.yahoo.com') || host.includes('fantasysports.yahoo');

    // Only upgrade HTTP to HTTPS for Yahoo domains
    if (isYahoo && u.protocol === 'http:') {
      u.protocol = 'https:';
    }

    return u.toString();
  } catch {
    // Non-URL strings or relative paths we couldn't parse: return as-is
    return url;
  }
}

/**
 * Safe fetch wrapper that automatically upgrades Yahoo URLs to HTTPS
 * Use this instead of direct fetch when hitting Yahoo endpoints
 */
export async function safeFetch(input: string | URL, init?: RequestInit): Promise<Response> {
  const raw = typeof input === 'string' ? input : input.toString();
  const guarded = enforceYahooHttps(raw);
  return fetch(guarded, init);
}

/**
 * Validate that a URL is HTTPS for Yahoo domains
 * Throws an error if HTTP is detected for Yahoo domains
 */
export function validateYahooHttps(url: string): void {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    const isYahoo =
      host === 'yahoo.com' || host.endsWith('.yahoo.com') || host.includes('fantasysports.yahoo');

    if (isYahoo && u.protocol !== 'https:') {
      throw new Error(`Yahoo endpoints must use HTTPS. Found: ${url}`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Yahoo endpoints must use HTTPS')) {
      throw error;
    }
    // Ignore URL parsing errors for non-URL strings
  }
}
