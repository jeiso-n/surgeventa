import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import {
  DEFAULT_PUBLISHING_PREFERENCES,
  normalizeTimezone,
  type PublishingPreferences,
} from "@/domain/settings";
import { getDb } from "@/server/db";
import { users } from "@/server/db/schema";
import { getAuth, SESSION_COOKIE_NAMES } from "./index";

export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  timezone: string;
  defaultPublishingPreferences: PublishingPreferences;
  createdAt: Date;
}

export interface AuthenticatedSession {
  id: string;
  userId: string;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface ServerAuthContext {
  user: AuthenticatedUser;
  session: AuthenticatedSession;
}

function mergePublishingPreferences(
  raw: Partial<PublishingPreferences> | null | undefined,
): PublishingPreferences {
  return {
    ...DEFAULT_PUBLISHING_PREFERENCES,
    ...(raw ?? {}),
    defaultPlatforms: Array.isArray(raw?.defaultPlatforms) ? raw.defaultPlatforms : [],
  };
}

/**
 * Validates the current request's Better Auth session against PostgreSQL and
 * loads the authoritative user record. Returns null if unauthenticated, expired,
 * or revoked.
 */
export async function getServerAuthContext(
  requestHeaders?: Headers,
): Promise<ServerAuthContext | null> {
  const incomingHeaders = requestHeaders ?? (await headers());
  const sessionPayload = await getAuth().api.getSession({
    headers: incomingHeaders,
  });

  if (!sessionPayload?.user?.id || !sessionPayload?.session?.id) {
    return null;
  }

  const db = getDb();
  const [userRow] = await db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      emailVerified: users.emailVerified,
      timezone: users.timezone,
      defaultPublishingPreferences: users.defaultPublishingPreferences,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, sessionPayload.user.id))
    .limit(1);

  if (!userRow) {
    return null;
  }

  return {
    user: {
      id: userRow.id,
      email: userRow.email,
      displayName: userRow.displayName,
      emailVerified: userRow.emailVerified,
      timezone: normalizeTimezone(userRow.timezone),
      defaultPublishingPreferences: mergePublishingPreferences(
        userRow.defaultPublishingPreferences,
      ),
      createdAt: userRow.createdAt,
    },
    session: {
      id: sessionPayload.session.id,
      userId: sessionPayload.session.userId,
      expiresAt: new Date(sessionPayload.session.expiresAt),
      ipAddress: sessionPayload.session.ipAddress ?? null,
      userAgent: sessionPayload.session.userAgent ?? null,
    },
  };
}

/**
 * Enforces server-side authentication inside protected Server Components.
 * Distinguishes missing sessions from expired/revoked cookies.
 */
export async function requireServerSession(redirectPath = "/"): Promise<ServerAuthContext> {
  const authContext = await getServerAuthContext();
  if (authContext) {
    return authContext;
  }

  const cookieStore = await cookies();
  const hadSessionCookie = SESSION_COOKIE_NAMES.some((name) => Boolean(cookieStore.get(name)));
  const reason = hadSessionCookie ? "session_expired" : "auth_required";
  const nextParam =
    redirectPath && redirectPath !== "/" ? `&next=${encodeURIComponent(redirectPath)}` : "";

  redirect(`/login?reason=${reason}${nextParam}`);
}

/**
 * Enforces server-side authentication inside versioned REST API routes
 * (`/api/v1/*`) used by both the web workspace and future Flutter Android app.
 */
export async function requireApiSession(
  request: Request,
): Promise<
  | { ok: true; context: ServerAuthContext }
  | { ok: false; response: Response }
> {
  const context = await getServerAuthContext(request.headers);
  if (!context) {
    return {
      ok: false,
      response: Response.json(
        {
          error: "Authentication required. Please sign in again.",
          code: "UNAUTHORIZED",
        },
        { status: 401 },
      ),
    };
  }
  return { ok: true, context };
}
