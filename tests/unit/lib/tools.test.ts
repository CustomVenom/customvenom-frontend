// tests/unit/lib/tools.test.ts
import { mapExplanationToReason } from '@/lib/tools';

describe('mapExplanationToReason', () => {
  it('returns null for undefined explanation', () => {
    expect(mapExplanationToReason(undefined)).toBeNull();
  });

  it('returns null for null explanation', () => {
    expect(mapExplanationToReason(null as any)).toBeNull();
  });

  it('returns null when text is missing', () => {
    expect(mapExplanationToReason({ type: 'reason', confidence: 0.8 })).toBeNull();
  });

  it('returns null when text is not a string', () => {
    expect(
      mapExplanationToReason({ type: 'reason', text: 123 as any, confidence: 0.8 }),
    ).toBeNull();
  });

  it('parses points from text', () => {
    const result = mapExplanationToReason({
      type: 'reason',
      text: 'Favorable secondary +1.8 pts',
      confidence: 0.86,
    });

    expect(result).not.toBeNull();
    expect(result?.delta_points).toBe(1.8);
    expect(result?.unit).toBe('points');
    expect(result?.confidence).toBe(0.86);
  });

  it('parses percentage from text', () => {
    const result = mapExplanationToReason({
      type: 'reason',
      text: 'High volume +15%',
      confidence: 0.75,
    });

    expect(result).not.toBeNull();
    expect(result?.delta_points).toBe(0.15);
    expect(result?.unit).toBe('percent');
  });

  it('handles negative deltas', () => {
    const result = mapExplanationToReason({
      type: 'reason',
      text: 'Tough matchup -2.5 pts',
      confidence: 0.7,
    });

    expect(result).not.toBeNull();
    expect(result?.delta_points).toBe(-2.5);
  });

  it('defaults confidence to 0 when missing', () => {
    const result = mapExplanationToReason({
      type: 'reason',
      text: 'Some reason +1.0 pts',
    });

    expect(result).not.toBeNull();
    expect(result?.confidence).toBe(0);
  });

  it('maps component based on type', () => {
    const methodResult = mapExplanationToReason({
      type: 'method',
      text: 'Method explanation +1.0 pts',
      confidence: 0.8,
    });
    expect(methodResult?.component).toBe('⚙️');

    const sourcesResult = mapExplanationToReason({
      type: 'sources',
      text: 'Sources explanation +1.0 pts',
      confidence: 0.8,
    });
    expect(sourcesResult?.component).toBe('📊');

    const reasonResult = mapExplanationToReason({
      type: 'reason',
      text: 'Reason explanation +1.0 pts',
      confidence: 0.8,
    });
    expect(reasonResult?.component).toBe('💡');

    const unknownResult = mapExplanationToReason({
      type: 'unknown',
      text: 'Unknown type +1.0 pts',
      confidence: 0.8,
    });
    expect(unknownResult?.component).toBe('📈');
  });

  it('handles text without delta pattern', () => {
    const result = mapExplanationToReason({
      type: 'reason',
      text: 'Just a description without numbers',
      confidence: 0.8,
    });

    expect(result).not.toBeNull();
    expect(result?.delta_points).toBe(0);
    expect(result?.unit).toBeUndefined();
  });
});
