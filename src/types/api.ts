// API response types with trust headers

export interface TrustHeaders {
  schemaVersion: string;
  lastRefresh: string;
  requestId: string;
  stale?: string;
}

export interface ApiResponse<T> {
  data: T;
  trust: TrustHeaders;
}
