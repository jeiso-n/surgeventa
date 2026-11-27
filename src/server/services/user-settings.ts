import "server-only";
import { and, desc, eq, ne, sql } from "drizzle-orm";
import { verifyPassword } from "better-auth/crypto";
import {
  DEFAULT_PUBLISHING_PREFERENCES,
  normalizeTimezone,
  type PublishingPreferences,
  type UpdateSettingsInput,
} from "@/domain/settings";
import { getDb } from "@/server/db";
import {
  authAccounts,
  authSessions,
  mediaAssets,
  posts,
  socialAccounts,
  users,
} from "@/server/db/schema";

export interface UserWorkspaceSummary {
  connectedAccountsCount: number;
  draftPostsCount: number;
  scheduledPostsCount: number;
  mediaAssetsCount: number;
}

export interface ActiveSessionView {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export interface UserProfileView {
  id: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  timezone: string;
  defaultPublishingPreferences: PublishingPreferences;
  createdAt: string;
  updatedAt: string;
}

function normalizePrefs(
  raw: Partial<PublishingPreferences> | null | undefined,
): PublishingPreferences {
  return {
    ...DEFAULT_PUBLISHING_PREFERENCES,
    ...(raw ?? {}),
    defaultPlatforms: Array.isArray(raw?.defaultPlatforms) ? raw.defaultPlatforms : [],
  };
}

export async function getUserProfileById(userId: string): Promise<UserProfileView | null> {
  const db = getDb();
  const [row] = await db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      emailVerified: users.emailVerified,
      timezone: users.timezone,
      defaultPublishingPreferences: users.defaultPublishingPreferences,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    displayName: row.displayName,
    emailVerified: row.emailVerified,
    timezone: normalizeTimezone(row.timezone),
    defaultPublishingPreferences: normalizePrefs(row.defaultPublishingPreferences),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function updateUserSettings(
  userId: string,
  input: UpdateSettingsInput,
): Promise<UserProfileView> {
  const db = getDb();
  const normalizedTz = normalizeTimezone(input.timezone);

  const [updated] = await db
    .update(users)
    .set({
      displayName: input.displayName,
      timezone: normalizedTz,
      defaultPublishingPreferences: input.defaultPublishingPreferences,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      emailVerified: users.emailVerified,
      timezone: users.timezone,
      defaultPublishingPreferences: users.defaultPublishingPreferences,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

  if (!updated) {
    throw new Error("User record not found.");
  }

  return {
    id: updated.id,
    email: updated.email,
    displayName: updated.displayName,
    emailVerified: updated.emailVerified,
    timezone: normalizeTimezone(updated.timezone),
    defaultPublishingPreferences: normalizePrefs(updated.defaultPublishingPreferences),
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

/**
 * Returns strictly user-scoped workspace metrics. Every query filters by userId
 * so no cross-user data leakage is possible.
 */
export async function getUserWorkspaceSummary(userId: string): Promise<UserWorkspaceSummary> {
  const db = getDb();

  const [[accountRow], [draftRow], [scheduledRow], [mediaRow]] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(socialAccounts)
      .where(eq(socialAccounts.userId, userId)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(posts)
      .where(and(eq(posts.userId, userId), eq(posts.status, "draft"))),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(posts)
      .where(and(eq(posts.userId, userId), eq(posts.status, "scheduled"))),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(mediaAssets)
      .where(eq(mediaAssets.userId, userId)),
  ]);

  return {
    connectedAccountsCount: Number(accountRow?.count ?? 0),
    draftPostsCount: Number(draftRow?.count ?? 0),
    scheduledPostsCount: Number(scheduledRow?.count ?? 0),
    mediaAssetsCount: Number(mediaRow?.count ?? 0),
  };
}

/**
 * Lists active (non-expired) database sessions owned strictly by userId.
 * Never returns raw session tokens in the list response.
 */
export async function listUserSessions(
  userId: string,
  currentSessionId: string,
): Promise<ActiveSessionView[]> {
  const db = getDb();
  const now = new Date();
  const rows = await db
    .select({
      id: authSessions.id,
      ipAddress: authSessions.ipAddress,
      userAgent: authSessions.userAgent,
      createdAt: authSessions.createdAt,
      expiresAt: authSessions.expiresAt,
    })
    .from(authSessions)
    .where(eq(authSessions.userId, userId))
    .orderBy(desc(authSessions.createdAt));

  return rows
    .filter((row) => row.expiresAt.getTime() > now.getTime())
    .map((row) => ({
      id: row.id,
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
      createdAt: row.createdAt.toISOString(),
      expiresAt: row.expiresAt.toISOString(),
      isCurrent: row.id === currentSessionId,
    }));
}

/**
 * Revokes a single session strictly owned by userId. Returns false if the
 * session does not exist or belongs to another user.
 */
export async function revokeUserSessionById(
  userId: string,
  targetSessionId: string,
): Promise<boolean> {
  const db = getDb();
  const deleted = await db
    .delete(authSessions)
    .where(and(eq(authSessions.id, targetSessionId), eq(authSessions.userId, userId)))
    .returning({ id: authSessions.id });

  return deleted.length > 0;
}

/**
 * Revokes all sessions belonging to userId except currentSessionId.
 */
export async function revokeOtherUserSessions(
  userId: string,
  currentSessionId: string,
): Promise<number> {
  const db = getDb();
  const deleted = await db
    .delete(authSessions)
    .where(and(eq(authSessions.userId, userId), ne(authSessions.id, currentSessionId)))
    .returning({ id: authSessions.id });

  return deleted.length;
}

export type ChangeEmailOutcome =
  | { ok: true; email: string }
  | { ok: false; status: 400 | 401 | 409; message: string };

/**
 * Changes the user's email address after verifying their current password
 * against Better Auth's scrypt hash and enforcing email uniqueness.
 */
export async function changeUserEmail(
  userId: string,
  currentPassword: string,
  newEmail: string,
): Promise<ChangeEmailOutcome> {
  const db = getDb();
  const normalizedEmail = newEmail.trim().toLowerCase();

  const [credentialAccount] = await db
    .select({ password: authAccounts.password })
    .from(authAccounts)
    .where(and(eq(authAccounts.userId, userId), eq(authAccounts.providerId, "credential")))
    .limit(1);

  if (!credentialAccount?.password) {
    return {
      ok: false,
      status: 400,
      message: "Password credentials are not configured for this account.",
    };
  }

  const passwordValid = await verifyPassword({
    hash: credentialAccount.password,
    password: currentPassword,
  });

  if (!passwordValid) {
    return {
      ok: false,
      status: 401,
      message: "Current password is incorrect.",
    };
  }

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existing) {
    if (existing.id === userId) {
      return {
        ok: false,
        status: 400,
        message: "That email address is already your current email.",
      };
    }
    return {
      ok: false,
      status: 409,
      message: "An account with this email address already exists.",
    };
  }

  await db
    .update(users)
    .set({
      email: normalizedEmail,
      emailVerified: false,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  return { ok: true, email: normalizedEmail };
}
