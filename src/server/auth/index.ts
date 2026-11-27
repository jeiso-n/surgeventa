import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { bearer } from "better-auth/plugins/bearer";
import { parseEnv } from "@/lib/env";
import { getDb } from "@/server/db";
import {
  authAccounts,
  authSessions,
  authVerifications,
  users,
} from "@/server/db/schema";

const SESSION_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7; // 7 days
const SESSION_UPDATE_AGE_SECONDS = 60 * 60 * 24; // Refresh expiry daily while active

function createAuthInstance() {
  const env = parseEnv();
  const baseURL = process.env.BETTER_AUTH_URL ?? env.NEXT_PUBLIC_APP_URL;
  const secret = process.env.BETTER_AUTH_SECRET ?? env.AUTH_SECRET;
  const isHttpsDeployment = baseURL.startsWith("https://");

  const trustedOrigins = Array.from(
    new Set([
      baseURL,
      env.NEXT_PUBLIC_APP_URL,
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      ...(process.env.NODE_ENV !== "production" || !isHttpsDeployment
        ? ["http://localhost:3099", "http://127.0.0.1:3099", "http://localhost:3100", "http://127.0.0.1:3100"]
        : []),
    ]),
  );

  return betterAuth({
    appName: "Surgeventa",
    baseURL,
    secret,
    trustedOrigins,
    database: drizzleAdapter(getDb(), {
      provider: "pg",
      schema: {
        user: users,
        session: authSessions,
        account: authAccounts,
        verification: authVerifications,
      },
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      autoSignIn: true,
    },
    user: {
      fields: {
        name: "displayName",
      },
      additionalFields: {
        timezone: {
          type: "string",
          required: false,
          defaultValue: "UTC",
        },
      },
      changeEmail: {
        enabled: true,
        updateEmailWithoutVerification: true,
      },
    },
    session: {
      expiresIn: SESSION_EXPIRES_IN_SECONDS,
      updateAge: SESSION_UPDATE_AGE_SECONDS,
      // Disable cookie caching so DB session revocations take effect immediately.
      cookieCache: {
        enabled: false,
      },
    },
    advanced: {
      database: {
        generateId: "uuid",
      },
      cookiePrefix: "surgeventa",
      useSecureCookies: process.env.NODE_ENV === "production" && isHttpsDeployment,
    },
    plugins: [
      // Bearer token support lets the planned Flutter Android client share the exact same auth backend.
      bearer(),
      // Synchronizes Set-Cookie headers cleanly in Next.js App Router server actions & handlers.
      nextCookies(),
    ],
  });
}

type SurgeventaAuth = ReturnType<typeof createAuthInstance>;

declare global {
  var __surgeventaAuth: SurgeventaAuth | undefined;
}

/**
 * Lazy Better Auth singleton so importing server modules during static analysis
 * or unit tests without DATABASE_URL does not open DB connections prematurely.
 */
export function getAuth(): SurgeventaAuth {
  if (!globalThis.__surgeventaAuth) {
    globalThis.__surgeventaAuth = createAuthInstance();
  }
  return globalThis.__surgeventaAuth;
}

export const SESSION_COOKIE_NAMES = [
  "surgeventa.session_token",
  "__Secure-surgeventa.session_token",
] as const;
