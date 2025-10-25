import { describe, it, expect } from 'vitest';

import { parseProjectionsPayload } from '../src/lib/projections/schema';
import { toReasonChips } from '../src/lib/reasons/adapter';

describe('projections E2E', () => {
  it('validates payload and adapts reasons to clamped chips', () => {
    const payload = {
      ok: true,
      schema_version: "v1",
      last_refresh: "2025-10-16T00:00:00Z",
      items: [{
        id: "p_123",
        player: { id: "p_123", name: "A. Example", team: "EX", pos: "WR" },
        schema_version: "v1",
        last_refresh: "2025-10-16T00:00:00Z",
        median: 12.3,
        reasons: [
          { key: "market_delta:up", effect: 0.06 },   // 6% fraction → clamp to 3.5
          { key: "injury:workload_guard", effect: -7 }, // -7% percent → clamp to -3.5
          { key: "volatility", effect: 0.005 }          // 0.5% fraction → dropped (top2 rule)
        ]
      }]
    };

    const parsed = parseProjectionsPayload(payload);
    expect(parsed).not.toBeNull();
    const item = parsed!.items[0];

    // Guardrail fields present
    expect(item.schema_version).toBeTruthy();
    expect(item.last_refresh).toBeTruthy();

    const chips = toReasonChips(item.reasons);
    expect(chips.length).toBe(2);
    // Top 2 by absolute effect, clamped to ±3.5
    expect(Math.abs(chips[0].effectPct)).toBe(3.5);
    expect(Math.abs(chips[1].effectPct)).toBe(3.5);
  });

  it('fails closed on invalid payload', () => {
    const parsed = parseProjectionsPayload({ items: "not-an-array" });
    expect(parsed).toBeNull();
  });

  it('handles missing reasons gracefully', () => {
    const payload = {
      ok: true,
      schema_version: "v1",
      last_refresh: "2025-10-16T00:00:00Z",
      items: [{
        id: "p_456",
        player: { id: "p_456", name: "B. Sample" },
        schema_version: "v1",
        last_refresh: "2025-10-16T00:00:00Z",
        median: 10.5
        // no reasons field
      }]
    };

    const parsed = parseProjectionsPayload(payload);
    expect(parsed).not.toBeNull();
    const item = parsed!.items[0];
    const chips = toReasonChips(item.reasons);
    expect(chips).toEqual([]);
  });

  it('transforms numeric IDs to strings', () => {
    const payload = {
      ok: true,
      schema_version: 1,  // number
      last_refresh: "2025-10-16T00:00:00Z",
      items: [{
        id: 789,  // number
        player: { id: 789, name: "C. Test" },
        schema_version: 1,
        last_refresh: "2025-10-16T00:00:00Z"
      }]
    };

    const parsed = parseProjectionsPayload(payload);
    expect(parsed).not.toBeNull();
    expect(typeof parsed!.schema_version).toBe('string');
    expect(parsed!.schema_version).toBe('1');
    expect(typeof parsed!.items[0].id).toBe('string');
    expect(parsed!.items[0].id).toBe('789');
  });
});

