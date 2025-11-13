import {
  SportClient,
  Sport,
  ApiClient,
  ProjectionParams,
  ProjectionResponse,
} from '../base/SportClient';

/**
 * NFL implementation - fully functional
 * Uses existing /api/projections endpoint with sport=nfl
 */
export class NFLClient extends SportClient {
  constructor(api: ApiClient) {
    super(api);
  }

  getSportId(): Sport {
    return 'nfl';
  }

  getDisplayName(): string {
    return 'NFL';
  }

  getScoringFormats() {
    return [
      { value: 'standard', label: 'Standard' },
      { value: 'half_ppr', label: 'Half PPR' },
      { value: 'full_ppr', label: 'Full PPR' },
    ];
  }

  getDefaultScoringFormat(): string {
    return 'half_ppr';
  }

  async fetchProjections(params: ProjectionParams): Promise<ProjectionResponse> {
    const query = new URLSearchParams({
      week: params.week,
      sport: 'nfl',
      format: params.scoringFormat || this.getDefaultScoringFormat(),
    });

    if (params.leagueKey) {
      query.set('league_key', params.leagueKey);
    }

    const data = await this.api.get(`/projections?${query}`) as {
      schema_version?: string;
      last_refresh?: string;
      last_updated?: string;
      sport?: string;
      week_label?: string;
      scoring_format?: string;
      projections?: Array<{
        player_id: string;
        player_name?: string;
        name?: string;
        position?: string;
        team?: string;
        projected_points?: { floor: number; median: number; ceiling: number };
        floor?: number;
        median?: number;
        ceiling?: number;
        confidence?: number;
        explanations?: Array<string | { description?: string; text?: string }>;
      }>;
    };

    // Transform API response to ProjectionResponse format
    return {
      schema_version: data.schema_version || 'v2.1',
      last_refresh: data.last_refresh || data.last_updated || new Date().toISOString(),
      sport: data.sport || 'nfl',
      week: data.week_label || params.week,
      scoring_format: data.scoring_format || params.scoringFormat || this.getDefaultScoringFormat(),
      projections: (data.projections || []).map((proj) => ({
        player_id: proj.player_id,
        player_name: proj.player_name || proj.name || proj.player_id,
        position: proj.position || '',
        team: proj.team || '',
        projected_points: proj.projected_points || {
          floor: proj.floor ?? 0,
          median: proj.median ?? 0,
          ceiling: proj.ceiling ?? 0,
        },
        confidence: proj.confidence ?? 0.5,
        explanations: (proj.explanations || []).map((exp) => {
          // Handle both string and object explanation formats
          if (typeof exp === 'string') {
            return exp;
          }
          // API returns { type, description, confidence } format
          return exp.description || exp.text || '';
        }),
      })),
    };
  }

  isAvailable(): boolean {
    return true; // NFL is fully operational
  }
}
