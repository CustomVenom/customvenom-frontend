// Yahoo Client Module - safeFetch Usage Snippet
// Copy this pattern for all Yahoo API calls

import { safeFetch } from '@/lib/http-guard';

/**
 * Yahoo Fantasy Sports API Client
 * All endpoints automatically upgraded to HTTPS for security compliance
 */
export class YahooClient {
  private baseUrl = 'https://fantasysports.yahoo.com/fantasy/v2';
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Fetch user's leagues for a season
   * @param season - Year (e.g., 2025)
   */
  async getLeagues(_season: number = new Date().getFullYear()) {
    // ✅ CORRECT: safeFetch automatically upgrades to HTTPS
    const response = await safeFetch(
      `${this.baseUrl}/users;use_login=1/games;game_keys=nfl/leagues`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Yahoo API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Fetch league standings
   * @param leagueKey - Yahoo league key (e.g., "414.l.123456")
   */
  async getStandings(leagueKey: string) {
    // ✅ CORRECT: safeFetch handles HTTPS enforcement
    const response = await safeFetch(`${this.baseUrl}/league/${leagueKey}/standings`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Yahoo API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Fetch team roster
   * @param teamKey - Yahoo team key (e.g., "414.l.123456.t.1")
   */
  async getRoster(teamKey: string) {
    // ✅ CORRECT: safeFetch ensures HTTPS for Yahoo domains
    const response = await safeFetch(`${this.baseUrl}/team/${teamKey}/roster`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Yahoo API error: ${response.status}`);
    }

    return response.json();
  }
}

// ❌ WRONG - Don't use direct fetch for Yahoo endpoints
// const response = await fetch('http://fantasysports.yahoo.com/api', options);

// ✅ CORRECT - Always use safeFetch for Yahoo
// const response = await safeFetch('http://fantasysports.yahoo.com/api', options);
// Automatically becomes: https://fantasysports.yahoo.com/api
