import dotenv from "dotenv";
import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { Pool } from "pg";

dotenv.config({ path: ".env.local" });

const runId = randomUUID().slice(0, 8);
const userAEmail = `e2e-a-${runId}@test.surgeventa.invalid`;
const userAUpdatedEmail = `e2e-a-new-${runId}@test.surgeventa.invalid`;
const userAPassword = "E2EPassword!2026A";

const userBEmail = `e2e-b-${runId}@test.surgeventa.invalid`;
const userBPassword = "E2EPassword!2026B";

test.afterAll(async () => {
  if (!process.env.DATABASE_URL) return;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await pool.query("DELETE FROM users WHERE email LIKE '%@test.surgeventa.invalid'");
  } finally {
    await pool.end();
  }
});

test.describe("Surgeventa Auth, Protected Workspace & Settings E2E", () => {
  test("redirects unauthenticated visitors and blocks unauthenticated API access", async ({
    page,
    request,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login\?reason=auth_required/);
    await expect(page.getByRole("heading", { name: /sign in to surgeventa/i })).toBeVisible();

    await page.goto("/settings");
    await expect(page).toHaveURL(/\/login\?reason=auth_required/);

    const meResponse = await request.get("/api/v1/me");
    expect(meResponse.status()).toBe(401);

    const settingsResponse = await request.get("/api/v1/settings");
    expect(settingsResponse.status()).toBe(401);
  });

  test("registers User A, persists settings & timezone, updates email, logs out, and rejects bad login", async ({
    page,
  }) => {
    await page.goto("/register");
    await page.getByLabel("Display name").fill("E2E Creator Alpha");
    await page.getByLabel("Email address").fill(userAEmail);
    await page.getByLabel("Password", { exact: true }).fill(userAPassword);
    await page.getByLabel("Confirm password").fill(userAPassword);
    await page.getByRole("button", { name: /create surgeventa account/i }).click();

    // Redirects into protected workspace with default UTC timezone
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: /welcome back, e2e creator alpha/i })).toBeVisible();
    await expect(page.locator("header")).toContainText("UTC");

    // Navigate to Settings and update display name, timezone, and publishing defaults
    await page.getByRole("link", { name: /^settings$/i }).click();
    await expect(page).toHaveURL(/\/settings$/);
    await expect(page.getByRole("heading", { name: /profile, timezone/i })).toBeVisible();

    await page.locator("#settings-display-name").fill("Alpha Publisher Pro");
    await page.getByLabel("Workspace timezone").selectOption("Africa/Kampala");
    await page.getByLabel("Default publishing action").selectOption("schedule");
    await page.getByLabel("Default post visibility").selectOption("private");
    await page.getByRole("button", { name: /save profile & preferences/i }).click();

    await expect(page.getByText(/settings saved\. scheduled posts will use africa\/kampala/i)).toBeVisible();

    // Reload and confirm PostgreSQL persistence
    await page.reload();
    await expect(page.getByLabel("Display name")).toHaveValue("Alpha Publisher Pro");
    await expect(page.getByLabel("Workspace timezone")).toHaveValue("Africa/Kampala");
    await expect(page.getByLabel("Default publishing action")).toHaveValue("schedule");
    await expect(page.getByLabel("Default post visibility")).toHaveValue("private");
    await expect(page.locator("header")).toContainText("Africa/Kampala");

    // Email change rejects wrong password and accepts valid password
    await page.getByLabel("New email address").fill(userAUpdatedEmail);
    await page.locator("#settings-email-password").fill("WrongPassword!");
    await page.getByRole("button", { name: /update email address/i }).click();
    await expect(page.getByText(/current password is incorrect/i)).toBeVisible();

    await page.locator("#settings-email-password").fill(userAPassword);
    await page.getByRole("button", { name: /update email address/i }).click();
    await expect(page.getByText(/email address updated successfully/i)).toBeVisible();

    // Sign out and verify protected route is blocked again
    await page.getByRole("button", { name: /sign out/i }).click();
    await expect(page).toHaveURL(/\/login\?reason=signed_out/);

    await page.goto("/");
    await expect(page).toHaveURL(/\/login\?reason=auth_required/);

    // Invalid credentials show error
    await page.getByLabel("Email address").fill(userAUpdatedEmail);
    await page.getByLabel("Password").fill("DefinitelyWrong99!");
    await page.getByRole("button", { name: /sign in to workspace/i }).click();
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);

    // Valid login with updated email restores workspace and persisted timezone
    await page.getByLabel("Password").fill(userAPassword);
    await page.getByRole("button", { name: /sign in to workspace/i }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: /welcome back, alpha publisher pro/i })).toBeVisible();
    await expect(page.locator("header")).toContainText("Africa/Kampala");
  });

  test("enforces user isolation between User A and User B sessions and settings", async ({
    browser,
  }) => {
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();

    try {
      const pageA = await contextA.newPage();
      await pageA.goto("/login");
      await pageA.getByLabel("Email address").fill(userAUpdatedEmail);
      await pageA.getByLabel("Password").fill(userAPassword);
      await pageA.getByRole("button", { name: /sign in to workspace/i }).click();
      await expect(pageA).toHaveURL(/\/$/);

      const sessionsARes = await pageA.request.get("/api/v1/settings/sessions");
      expect(sessionsARes.status()).toBe(200);
      const sessionsAData = (await sessionsARes.json()) as {
        sessions: Array<{ id: string }>;
      };
      const sessionAId = sessionsAData.sessions[0]?.id;
      expect(sessionAId).toBeTruthy();

      // Register User B in an isolated context
      const pageB = await contextB.newPage();
      await pageB.goto("/register");
      await pageB.getByLabel("Display name").fill("E2E Creator Beta");
      await pageB.getByLabel("Email address").fill(userBEmail);
      await pageB.getByLabel("Password", { exact: true }).fill(userBPassword);
      await pageB.getByLabel("Confirm password").fill(userBPassword);
      await pageB.getByRole("button", { name: /create surgeventa account/i }).click();
      await expect(pageB).toHaveURL(/\/$/);

      // User B sees ONLY their own profile and default UTC timezone
      await expect(pageB.getByRole("heading", { name: /welcome back, e2e creator beta/i })).toBeVisible();
      await expect(pageB.locator("header")).toContainText("UTC");

      // User B attempting to revoke User A's session must fail with 404
      const crossRevokeRes = await pageB.request.delete("/api/v1/settings/sessions", {
        data: { sessionId: sessionAId },
      });
      expect(crossRevokeRes.status()).toBe(404);

      // User A's session remains completely valid
      const meARes = await pageA.request.get("/api/v1/me");
      expect(meARes.status()).toBe(200);
      const meAData = (await meARes.json()) as { user: { displayName: string; timezone: string } };
      expect(meAData.user.displayName).toBe("Alpha Publisher Pro");
      expect(meAData.user.timezone).toBe("Africa/Kampala");
    } finally {
      await contextA.close();
      await contextB.close();
    }
  });
});
