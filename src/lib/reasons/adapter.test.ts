import { describe, it, expect } from 'vitest';
import { toReasonChips } from './adapter';
import { parseRawReasons } from './schema';

describe('parseRawReasons', () => {
  it('accepts valid array', () => {
    const out = parseRawReasons([{ key: 'a', effect: 0.01 }]);
    expect(out.length).toBe(1);
  });

  it('returns [] on invalid input', () => {
    const out = parseRawReasons({ not: 'an array' });
    expect(out).toEqual([]);
  });

  it('returns [] on null/undefined', () => {
    expect(parseRawReasons(null)).toEqual([]);
    expect(parseRawReasons(undefined)).toEqual([]);
  });
});

describe('toReasonChips', () => {
  it('returns empty on bad input', () => {
    expect(toReasonChips(undefined)).toEqual([]);
    expect(toReasonChips(null)).toEqual([]);
    expect(toReasonChips({ not: 'an array' })).toEqual([]);
  });

  it('limits to max 2 chips and clamps to ±3.5%', () => {
    const chips = toReasonChips([
      { key: 'market_delta:up', effect: 0.06 },     // 6% → clamp to 3.5
      { key: 'injury:workload_guard', effect: -7 }, // -7% → clamp to -3.5 (already percent)
      { key: 'volatility', effect: 0.005 },         // 0.5% → eligible but should be dropped (top2 rule)
    ]);
    expect(chips.length).toBe(2);
    // Sorted by absolute magnitude, first two remain
    expect(Math.abs(chips[0].effectPct)).toBe(3.5);
    expect(Math.abs(chips[1].effectPct)).toBe(3.5);
  });

  it('converts fractional effects (0.021) to percent (2.1)', () => {
    const chips = toReasonChips([{ key: 'market_delta:up', effect: 0.021 }]);
    expect(chips[0].effectPct).toBeCloseTo(2.1, 1);
  });

  it('infers label when API label missing', () => {
    const chips = toReasonChips([{ key: 'market_delta:up', effect: 0.01 }]);
    expect(chips[0].label.toLowerCase()).toContain('market');
  });

  it('assigns type by sign', () => {
    const chips = toReasonChips([
      { key: 'a', effect: 0.01 },  // +1.0%
      { key: 'b', effect: -0.01 }, // -1.0%
    ]);
    expect(chips[0].type).toBe('positive');
    expect(chips[1].type).toBe('warning');
  });

  it('filters out zero effect chips', () => {
    const chips = toReasonChips([{ key: 'c', effect: 0 }]);
    // Zero-effect chips are filtered out
    expect(chips.length).toBe(0);
  });

  it('uses LABEL_MAP when key matches', () => {
    const chips = toReasonChips([{ key: 'usage:increase', effect: 0.02 }]);
    expect(chips[0].label).toBe('Usage ↑');
  });

  it('humanizes unknown keys', () => {
    const chips = toReasonChips([{ key: 'some_unknown:thing', effect: 0.01 }]);
    expect(chips[0].label).toContain('Unknown');
    expect(chips[0].label).toContain('thing');
  });

  it('uses API-provided label over defaults', () => {
    const chips = toReasonChips([
      { key: 'usage:increase', label: 'Custom Label', effect: 0.02 }
    ]);
    expect(chips[0].label).toBe('Custom Label');
  });

  // Edge case tests for bug fixes
  it('filters out near-zero-effect chips', () => {
    const chips = toReasonChips([
      { key: 'a', effect: 0 },
      { key: 'b', effect: 0.0001 }, // 0.01% after conversion, at threshold
      { key: 'c', effect: 0.02 }     // 2.0% after conversion, should show
    ]);
    // Only 'c' should show (2.0%)
    expect(chips.length).toBe(1);
    expect(chips[0].effectPct).toBeCloseTo(2.0, 1);
  });

  it('handles negative zero correctly', () => {
    const chips = toReasonChips([{ key: 'a', effect: -0 }]);
    // Should filter out as zero-effect
    expect(chips.length).toBe(0);
  });

  it('Zod rejects NaN and Infinity at validation layer', () => {
    // Zod's number type rejects NaN and Infinity
    const chips = toReasonChips([
      { key: 'a', effect: NaN },
      { key: 'b', effect: Infinity },
      { key: 'c', effect: -Infinity },
      { key: 'd', effect: 0.02 } // Valid one
    ]);
    // Zod filters out invalid numbers, returns empty array
    expect(chips.length).toBe(0);
  });

  it('uses improved fraction detection (< 1.0)', () => {
    const chips = toReasonChips([
      { key: 'a', effect: 0.5 },   // 0.5 as fraction → 50%
      { key: 'b', effect: 1.0 },   // 1.0 as percent → 1.0%
      { key: 'c', effect: 0.99 }   // 0.99 as fraction → 99% → clamped to 3.5%
    ]);
    expect(chips.length).toBe(2); // Max 2 chips
    // First should be clamped 50% → 3.5%
    expect(chips[0].effectPct).toBe(3.5);
    // Second should be clamped 99% → 3.5%
    expect(chips[1].effectPct).toBe(3.5);
  });

  it('maintains stable sort order', () => {
    // Same absolute effects should maintain input order
    const chips = toReasonChips([
      { key: 'a', effect: 2.0 },
      { key: 'b', effect: -2.0 },
      { key: 'c', effect: 2.0 }
    ]);
    // All have same abs value, should be in input order
    // But limited to 2 chips, so first two
    expect(chips.length).toBe(2);
    expect(chips[0].effectPct).toBe(2.0);
    expect(chips[1].effectPct).toBe(-2.0);
  });
});

