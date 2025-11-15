import { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import { Redis } from "@upstash/redis";

/**
 * NextAuth Configuration
 *
 * Uses Magic Link email authentication with Upstash Redis adapter
 * for storing user sessions and verification tokens.
 *
 * @see https://next-auth.js.org/configuration/options
 */

// Initialize Upstash Redis client for NextAuth adapter
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export const authOptions: NextAuthOptions = {
  adapter: UpstashRedisAdapter(redis),

  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      maxAge: 10 * 60, // Magic links are valid for 10 minutes
    }),
  ],

  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
    error: "/auth/error",
  },

  callbacks: {
    /**
     * Session callback - runs whenever a session is checked
     * With database adapter, we get user from database, not JWT
     */
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        session.user.email = user.email!;
      }
      return session;
    },

    /**
     * Sign in callback - control if a user is allowed to sign in
     * Add domain restrictions or other validation here
     */
    async signIn({ user, account, email }) {
      // Allow all sign-ins for now
      // You can add domain restrictions here, e.g.:
      // const allowedDomains = ['clauger.com'];
      // return allowedDomains.some(domain => user.email?.endsWith(`@${domain}`));
      return true;
    },
  },

  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === "development",
};
