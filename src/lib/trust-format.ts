// Trust format utilities for consistent schema version display

/**
 * Format schema version string, stripping accidental "vv" prefixes
 * and ensuring valid v<digits>[.<digits>] format
 */
export function formatSchema(v?: string | null): string {
  if (!v) return '—';

  // Strip accidental "vv" or "v v"
  const cleaned = v.replace(/^v+/i, 'v');

  // Allow only v<digits>[.<digits>]
  const m = cleaned.match(/^v\d+(\.\d+)?/i);
  return m ? m[0] : cleaned;
}
