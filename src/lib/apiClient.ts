// Simple typed API client without OpenAPI generator
export interface HealthResponse {
  ok: boolean;
  ready: boolean;
  schema_version: string;
  last_refresh: string;
  r2_key: string;
}

export interface ProjectionsResponse {
  [key: string]: unknown; // Generic object for now
}

export interface YahooMeResponse {
  user?: {
    guid?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface YahooLeaguesResponse {
  league_keys?: string[];
  [key: string]: unknown;
}

export class ApiClient {
  constructor(private basePath: string) {}

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.basePath}${path}`;
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        accept: 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  async healthGet(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }

  async projectionsGet(params: { week: string }): Promise<ProjectionsResponse> {
    const searchParams = new URLSearchParams({ week: params.week });
    return this.request<ProjectionsResponse>(`/projections?${searchParams}`);
  }

  async yahooMeGet(): Promise<YahooMeResponse> {
    return this.request<YahooMeResponse>('/yahoo/me');
  }

  async yahooLeaguesGet(params: { format?: string } = {}): Promise<YahooLeaguesResponse> {
    const searchParams = new URLSearchParams();
    if (params.format) {
      searchParams.set('format', params.format);
    }
    const query = searchParams.toString();
    return this.request<YahooLeaguesResponse>(`/yahoo/leagues${query ? `?${query}` : ''}`);
  }
}

export function makeApi(basePath: string): ApiClient {
  return new ApiClient(basePath);
}
