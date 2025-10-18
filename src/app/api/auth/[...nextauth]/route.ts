import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import YahooProvider from "next-auth/providers/yahoo";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    YahooProvider({
      clientId: process.env.YAHOO_CLIENT_ID!,
      clientSecret: process.env.YAHOO_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid profile email fspt-r", // fantasy read
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    // Keep only non-sensitive IDs + minimal profile
    async jwt({ token, account, profile, user }) {
      if (account) {
        // Yahoo-specific data
        if (account.provider === "yahoo") {
          token.yah = {
            sub: profile?.sub,
            email: profile?.email,
            expires_at: account.expires_at,
          };
        }
        
        // Attach user ID from database
        if (user) {
          token.userId = user.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Add user ID and Yahoo context to session
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.sub = (token as any)?.yah?.sub ?? null;
      }
      return session;
    },
  },
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/',
    error: '/',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
