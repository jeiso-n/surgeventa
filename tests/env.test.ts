import { describe, expect, it } from "vitest";
import { getEnvironmentReadiness, parseEnv } from "@/lib/env";

describe("environment validation and readiness", () => {
  it("parses cleanly with safe defaults when optional credentials are omitted", () => {
    const env = parseEnv({});
    expect(env.NEXT_PUBLIC_APP_NAME).toBe("Surgeventa");
    expect(env.DEFAULT_TIMEZONE).toBe("UTC");
    expect(env.MEDIA_STORAGE_PROVIDER).toBe("local");
    expect(env.DATABASE_URL).toBeUndefined();
  });

  it("treats template placeholders as unconfigured", () => {
    const readiness = getEnvironmentReadiness({
      DATABASE_URL:
        "postgresql://USER:PASSWORD@YOUR-NEON-ENDPOINT-pooler.REGION.aws.neon.tech/surgeventa?sslmode=require",
      AUTH_SECRET: "REPLACE_WITH_64_CHAR_HEX_AUTH_SECRET",
      TOKEN_ENCRYPTION_KEY: "REPLACE_WITH_64_CHAR_HEX_ENCRYPTION_KEY",
      CRON_SECRET: "REPLACE_WITH_RANDOM_CRON_SECRET",
    });

    expect(readiness.databaseConfigured).toBe(false);
    expect(readiness.authSecretConfigured).toBe(false);
    expect(readiness.tokenEncryptionKeyValid).toBe(false);
    expect(readiness.cronSecretConfigured).toBe(false);
  });

  it("reports ready when valid non-placeholder values are supplied", () => {
    const readiness = getEnvironmentReadiness({
      DATABASE_URL: "postgresql://app:realpass@ep-cool-sky-123-pooler.us-east-2.aws.neon.tech/surgeventa?sslmode=require",
      AUTH_SECRET: "a".repeat(64),
      TOKEN_ENCRYPTION_KEY: "0123456789abcdef".repeat(4),
      CRON_SECRET: "cron-secret-value-123456",
    });

    expect(readiness.databaseConfigured).toBe(true);
    expect(readiness.authSecretConfigured).toBe(true);
    expect(readiness.tokenEncryptionKeyValid).toBe(true);
    expect(readiness.cronSecretConfigured).toBe(true);
  });
});
