// tests/unit/adapters/projections-adapter.test.ts
import { adaptProjections } from '@customvenom/lib/adapters/projections-adapter';

describe('projections-adapter', () => {
  describe('adaptProjections', () => {
    it('accepts legacy explanation shape (driver/label)', () => {
      const payload = {
        projections: [
          {
            player_id: 'test-1',
            player_name: 'Test Player',
            team: 'BUF',
            position: 'QB',
            floor: 10,
            median: 15,
            ceiling: 20,
            confidence: 0.8,
            chips: [
              { driver: 'matchup', label: 'Favorable', delta_pct: 1.5, confidence: 0.75 },
              { driver: 'usage', label: 'High volume', delta_pct: 1.0, confidence: 0.7 },
            ],
          },
        ],
      };

      const result = adaptProjections(payload);
      expect(result).toHaveLength(1);
      expect(result[0].chips).toHaveLength(2);
      expect(result[0].chips[0].driver).toBe('matchup');
      expect(result[0].chips[0].label).toBe('Favorable');
    });

    it('accepts new explanation shape (type/text)', () => {
      const payload = {
        projections: [
          {
            player_id: 'test-2',
            player_name: 'Test Player 2',
            team: 'SF',
            position: 'RB',
            floor: 12,
            median: 18,
            ceiling: 25,
            confidence: 0.85,
            explanations: [
              { type: 'reason', text: 'Workhorse role +2.2 pts', confidence: 0.9 },
              { type: 'reason', text: 'Red zone advantage +1.0 pts', confidence: 0.74 },
            ],
          },
        ],
      };

      const result = adaptProjections(payload);
      expect(result).toHaveLength(1);
      expect(result[0].chips).toHaveLength(2);
      expect(result[0].chips[0].label).toBe('Workhorse role +2.2 pts');
      expect(result[0].chips[0].driver).toBe('reason');
    });

    it('filters to ≤2 chips', () => {
      const payload = {
        projections: [
          {
            player_id: 'test-3',
            player_name: 'Test Player 3',
            team: 'MIN',
            position: 'WR',
            floor: 8,
            median: 14,
            ceiling: 22,
            confidence: 0.75,
            chips: [
              { driver: 'a', label: 'Chip 1', delta_pct: 1.0, confidence: 0.8 },
              { driver: 'b', label: 'Chip 2', delta_pct: 0.9, confidence: 0.75 },
              { driver: 'c', label: 'Chip 3', delta_pct: 0.8, confidence: 0.7 },
            ],
          },
        ],
      };

      const result = adaptProjections(payload);
      expect(result[0].chips).toHaveLength(2);
    });

    it('filters chips with confidence < 0.65', () => {
      const payload = {
        projections: [
          {
            player_id: 'test-4',
            player_name: 'Test Player 4',
            team: 'KC',
            position: 'TE',
            floor: 5,
            median: 10,
            ceiling: 15,
            confidence: 0.7,
            chips: [
              { driver: 'a', label: 'High confidence', delta_pct: 1.0, confidence: 0.8 },
              { driver: 'b', label: 'Low confidence', delta_pct: 0.5, confidence: 0.5 },
            ],
          },
        ],
      };

      const result = adaptProjections(payload);
      expect(result[0].chips).toHaveLength(1);
      expect(result[0].chips[0].label).toBe('High confidence');
    });

    it('ignores malformed explanations safely', () => {
      const payload = {
        projections: [
          {
            player_id: 'test-5',
            player_name: 'Test Player 5',
            team: 'DAL',
            position: 'K',
            floor: 3,
            median: 8,
            ceiling: 12,
            confidence: 0.8,
            chips: [
              { driver: 'valid', label: 'Valid chip', delta_pct: 1.0, confidence: 0.75 },
              null,
              undefined,
              { invalid: 'data' },
              { driver: 'no-label', confidence: 0.7 }, // Missing label
              { label: 'no-confidence', driver: 'test' }, // Missing confidence
            ],
          },
        ],
      };

      const result = adaptProjections(payload);
      expect(result[0].chips).toHaveLength(1);
      expect(result[0].chips[0].label).toBe('Valid chip');
    });

    it('filters players with confidence < 0.65', () => {
      const payload = {
        projections: [
          {
            player_id: 'low-conf',
            player_name: 'Low Confidence',
            team: 'NYG',
            position: 'QB',
            floor: 5,
            median: 10,
            ceiling: 15,
            confidence: 0.5,
            chips: [],
          },
          {
            player_id: 'high-conf',
            player_name: 'High Confidence',
            team: 'BUF',
            position: 'QB',
            floor: 15,
            median: 20,
            ceiling: 25,
            confidence: 0.8,
            chips: [],
          },
        ],
      };

      const result = adaptProjections(payload);
      expect(result).toHaveLength(1);
      expect(result[0].playerId).toBe('high-conf');
    });

    it('handles empty payload gracefully', () => {
      expect(adaptProjections({})).toEqual([]);
      expect(adaptProjections({ projections: [] })).toEqual([]);
      expect(adaptProjections(null as any)).toEqual([]);
    });
  });
});
