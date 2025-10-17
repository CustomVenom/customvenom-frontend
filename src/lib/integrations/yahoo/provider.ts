/**
 * Yahoo OAuth Provider for NextAuth
 * 
 * App ID: DwjgwnmJ
 * Docs: https://developer.yahoo.com/oauth2/guide/
 */

export const YahooProvider = {
  id: "yahoo",
  name: "Yahoo",
  type: "oauth" as const,
  checks: ["pkce", "state"],
  authorization: {
    url: "https://api.login.yahoo.com/oauth2/request_auth",
    params: {
      scope: "fspt-r openid profile email",
      response_type: "code",
    },
  },
  token: "https://api.login.yahoo.com/oauth2/get_token",
  userinfo: { 
    url: "https://api.login.yahoo.com/openid/v1/userinfo",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async request({ tokens }: any) {
      const response = await fetch("https://api.login.yahoo.com/openid/v1/userinfo", {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });
      return response.json();
    },
  },
  clientId: process.env.YAHOO_CLIENT_ID!,
  clientSecret: process.env.YAHOO_CLIENT_SECRET!,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile(profile: any) {
    return {
      id: profile.sub ?? profile.user_id ?? "",
      name: profile.name ?? profile.nickname ?? "",
      email: profile.email ?? null,
      image: profile.picture ?? null,
    };
  },
};

