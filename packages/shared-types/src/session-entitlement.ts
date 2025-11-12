export interface YahooTokens {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  scope: string;
  expires_at: number;
  linked_at: string;
}

export interface SessionSelection {
  active_league_key?: string;
  active_team_key?: string;
  pinned?: boolean;
  pinned_at?: string;
  updated_at?: string;
}

export interface YahooSession {
  uid: string;
  created_at: string;
  updated_at: string;
  yahoo?: {
    access_token: string;
    refresh_token?: string;
    expires_at: number;
  };
  selection?: SessionSelection;
}

export interface SharedEntitlements {
  role: string;
  isAdmin: boolean;
  isPro: boolean;
  isTeam: boolean;
  isFree: boolean;
  features: Record<string, boolean>;
}
