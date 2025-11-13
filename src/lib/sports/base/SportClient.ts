/**
 * Abstract base class for sport-specific API clients
 * Each sport (NFL, NBA) implements this interface
 */

export type Sport = 'nfl' | 'nba';

export interface ApiClient {
  get: (path: string) => Promise<unknown>;
}

export interface ProjectionParams {
  week: string;
  scoringFormat?: string;
  leagueKey?: string;
}

export interface Projection {
  player_id: string;
  player_name: string;
  position: string;
  team: string;
  projected_points: {
    floor: number;
    median: number;
    ceiling: number;
  };
  confidence: number;
  explanations: string[];
}

export interface ProjectionResponse {
  schema_version: string;
  last_refresh: string;
  sport: Sport;
  week: string;
  scoring_format: string;
  projections: Projection[];
}

export abstract class SportClient {
  protected api: ApiClient;

  constructor(api: ApiClient) {
    this.api = api;
  }

  abstract getSportId(): Sport;
  abstract getDisplayName(): string;
  abstract getScoringFormats(): { value: string; label: string }[];
  abstract getDefaultScoringFormat(): string;
  abstract fetchProjections(params: ProjectionParams): Promise<ProjectionResponse>;
  abstract isAvailable(): boolean;
}
