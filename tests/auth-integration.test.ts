import dotenv from "dotenv";
import { randomUUID } from "node:crypto";
import { inArray } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";
import { DEFAULT_PUBLISHING_PREFERENCES } from "@/domain/settings";
import { getEnvironmentReadiness } from "@/lib/env";
import { getAuth } from "@/server/auth";
import { getDb } from "@/server/db";
import { posts, users } from "@/server/db/schema";
import {
  changeUserEmail,
  getUserProfileById,
  getUserWorkspaceSummary,
  listUserSessions,
  revokeUserSessionById,
  updateUserSettings,
} from "@/server/services/user-settings";

dotenv.config({ path: ".env.local" });

const dbReady = getEnvironmentReadiness().databaseConfigured;
const createdUserIds: string[] = [];

describe.skipIf(!dbReady)("Better Auth & user settings integration (Neon PostgreSQL)", () => {
  const runSuffix = randomUUID().slice(0, 8);
  const emailA = `vitest-a-${runSuffix}@test.surgeventa.invalid`;
  const emailAUpdated = `vitest-a-updated-${runSuffix}@test.surgeventa.invalid`;
  const emailB = `vitest-b-${runSuffix}@test.surgeventa.invalid`;
  const passwordA = "StrongPass!2026A";
  const passwordB = "StrongPass!2026B";

  let userAId = "";
  let userBId = "";
  let userAToken = "";
  let userBToken = "";
  let userBSessionId = "";

  afterAll(async () => {
    if (createdUserIds.length > 0) {
      await getDb().delete(users).where(inArray(users.id, createdUserIds));
    }
  });

  it("registers a new user with scrypt-hashed password and default UTC timezone", async () => {
    const auth = getAuth();
    const res = await auth.api.signUpEmail({
      body: {
        name: "Integration User A",
        email: emailA,
        password: passwordA,
      },
    });

    expect(res.user.id).toBeTruthy();
    expect(res.user.email).toBe(emailA);
    expect(res.token).toBeTruthy();

    userAId = res.user.id;
    userAToken = res.token ?? "";
    createdUserIds.push(userAId);

    const profile = await getUserProfileById(userAId);
    expect(profile).not.toBeNull();
    expect(profile?.displayName).toBe("Integration User A");
    expect(profile?.timezone).toBe("UTC");
  });

  it("rejects login with invalid credentials and succeeds with valid credentials", async () => {
    const auth = getAuth();

    await expect(
      auth.api.signInEmail({
        body: {
          email: emailA,
          password: "WrongPassword999!",
        },
      }),
    ).rejects.toThrow();

    const validLogin = await auth.api.signInEmail({
      body: {
        email: emailA,
        password: passwordA,
      },
    });
    expect(validLogin.user.id).toBe(userAId);
    expect(validLogin.token).toBeTruthy();
    userAToken = validLogin.token;
  });

  it("validates database sessions via Bearer token (web + future Flutter API parity)", async () => {
    const auth = getAuth();
    const session = await auth.api.getSession({
      headers: new Headers({
        Authorization: `Bearer ${userAToken}`,
      }),
    });

    expect(session).not.toBeNull();
    expect(session?.user.id).toBe(userAId);

    const invalidSession = await auth.api.getSession({
      headers: new Headers({
        Authorization: "Bearer invalid-token-value",
      }),
    });
    expect(invalidSession).toBeNull();
  });

  it("persists display name, timezone, publishing preferences, and password-confirmed email changes", async () => {
    const updated = await updateUserSettings(userAId, {
      displayName: "Updated Creator A",
      timezone: "Africa/Kampala",
      defaultPublishingPreferences: {
        ...DEFAULT_PUBLISHING_PREFERENCES,
        defaultPublishMode: "schedule",
        defaultVisibility: "private",
        defaultPlatforms: ["youtube", "linkedin"],
      },
    });

    expect(updated.displayName).toBe("Updated Creator A");
    expect(updated.timezone).toBe("Africa/Kampala");
    expect(updated.defaultPublishingPreferences.defaultPublishMode).toBe("schedule");
    expect(updated.defaultPublishingPreferences.defaultPlatforms).toEqual([
      "youtube",
      "linkedin",
    ]);

    const wrongPwdEmail = await changeUserEmail(userAId, "IncorrectPwd!", emailAUpdated);
    expect(wrongPwdEmail.ok).toBe(false);
    if (!wrongPwdEmail.ok) {
      expect(wrongPwdEmail.status).toBe(401);
    }

    const okEmail = await changeUserEmail(userAId, passwordA, emailAUpdated);
    expect(okEmail.ok).toBe(true);

    const reloaded = await getUserProfileById(userAId);
    expect(reloaded?.email).toBe(emailAUpdated);
    expect(reloaded?.timezone).toBe("Africa/Kampala");
  });

  it("enforces strict user isolation across workspace records and session revocation", async () => {
    const auth = getAuth();
    const resB = await auth.api.signUpEmail({
      body: {
        name: "Integration User B",
        email: emailB,
        password: passwordB,
      },
    });
    userBId = resB.user.id;
    userBToken = resB.token ?? "";
    createdUserIds.push(userBId);

    // Insert a private draft post owned strictly by User B
    await getDb().insert(posts).values({
      userId: userBId,
      title: "Private Draft B",
      baseCaption: "Confidential B",
      status: "draft",
    });

    const summaryA = await getUserWorkspaceSummary(userAId);
    const summaryB = await getUserWorkspaceSummary(userBId);
    expect(summaryA.draftPostsCount).toBe(0);
    expect(summaryB.draftPostsCount).toBe(1);

    const sessionBPayload = await auth.api.getSession({
      headers: new Headers({ Authorization: `Bearer ${userBToken}` }),
    });
    expect(sessionBPayload?.session.id).toBeTruthy();
    userBSessionId = sessionBPayload!.session.id;

    // User A must NOT be able to revoke User B's session
    const crossRevoke = await revokeUserSessionById(userAId, userBSessionId);
    expect(crossRevoke).toBe(false);

    // User B's session must remain active
    const stillValidB = await auth.api.getSession({
      headers: new Headers({ Authorization: `Bearer ${userBToken}` }),
    });
    expect(stillValidB?.user.id).toBe(userBId);
  });

  it("immediately invalidates a session upon revocation / logout", async () => {
    const auth = getAuth();
    const currentB = await auth.api.getSession({
      headers: new Headers({ Authorization: `Bearer ${userBToken}` }),
    });
    expect(currentB?.session.id).toBe(userBSessionId);

    const sessionsBefore = await listUserSessions(userBId, userBSessionId);
    expect(sessionsBefore.some((s) => s.id === userBSessionId)).toBe(true);

    const revoked = await revokeUserSessionById(userBId, userBSessionId);
    expect(revoked).toBe(true);

    const afterRevoke = await auth.api.getSession({
      headers: new Headers({ Authorization: `Bearer ${userBToken}` }),
    });
    expect(afterRevoke).toBeNull();
  });
});
