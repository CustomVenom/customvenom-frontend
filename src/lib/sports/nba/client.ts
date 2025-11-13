import {
  SportClient,
  Sport,
  ApiClient,
  ProjectionParams,
  ProjectionResponse,
} from '../base/SportClient';

/**
 * NBA implementation - STUB for now
 * Returns mock data until pipeline is ready
 */
export class NBAClient extends SportClient {
  constructor(api: ApiClient) {
    super(api);
  }

  getSportId(): Sport {
    return 'nba';
  }

  getDisplayName(): string {
    return 'NBA';
  }

  getScoringFormats() {
    return [
      { value: 'points', label: 'Points' },
      { value: '8cat', label: '8-Category' },
      { value: '9cat', label: '9-Category' },
    ];
  }

  getDefaultScoringFormat(): string {
    return 'points';
  }

  async fetchProjections(params: ProjectionParams): Promise<ProjectionResponse> {
    // STUB: Return empty projections with proper structure
    return {
      schema_version: 'v2.1',
      last_refresh: new Date().toISOString(),
      sport: 'nba',
      week: params.week,
      scoring_format: params.scoringFormat || this.getDefaultScoringFormat(),
      projections: [],
    };
  }

  isAvailable(): boolean {
    return false; // NBA not ready yet
  }
}
