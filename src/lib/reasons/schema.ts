import { z } from 'zod';
import { logger } from '@/lib/logger';

export const RawReasonSchema = z.object({
  key: z.string(),                 // e.g., "market_delta:up"
  label: z.string().optional(),    // optional friendly label
  effect: z.number().optional()    // may be 0.021 (2.1%) or 2.1
});

export const RawReasonsSchema = z.array(RawReasonSchema);

/**
 * Safe parse helper:
 * - Returns [] on invalid input (fail-closed)
 * - Logs a concise message in dev
 */
export function parseRawReasons(input: unknown) {
  const result = RawReasonsSchema.safeParse(input);
  if (!result.success) {
    logger.warn('Invalid reasons payload', { issues: result.error.issues });
    return [];
  }
  return result.data;
}

