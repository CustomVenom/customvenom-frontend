/**
 * Yahoo OAuth Provider for NextAuth v4
 *
 * App ID: hLyo9VQ2
 * Docs: https://developer.yahoo.com/oauth2/guide/
 */

export const YahooProvider = {
  id: 'yahoo',
  name: 'Yahoo',
  type: 'oauth' as const,
  authorization: {
    url: 'https://api.login.yahoo.com/oauth2/request_auth',
    params: { scope: 'fspt-r', response_type: 'code' },
  },
  token: { url: 'https://api.login.yahoo.com/oauth2/get_token' },
  userinfo: {
    url: 'https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1?format=json',
  },
  clientId: process.env['YAHOO_CLIENT_ID']!,
  clientSecret: process.env['YAHOO_CLIENT_SECRET']!,
  // NOTE: omit `checks` entirely → v4 stays state-only (no PKCE)
  profile(profile: {
    sub?: string;
    user_id?: string;
    name?: string;
    nickname?: string;
    email?: string;
    picture?: string;
  }) {
    return {
      id: profile.sub ?? profile.user_id ?? '',
      name: profile.name ?? profile.nickname ?? '',
      email: profile.email ?? null,
      image: profile.picture ?? null,
    };
  },
};
