import { z } from "zod";

const nonEmptyOptional = z
  .string()
  .trim()
  .optional()
  .transform((val) => (val && val.length > 0 ? val : undefined));

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_NAME: z.string().trim().min(1).default("Surgevanta"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  DEFAULT_TIMEZONE: z.string().trim().min(1).default("UTC"),

  DATABASE_URL: nonEmptyOptional,
  DATABASE_URL_UNPOOLED: nonEmptyOptional,

  AUTH_SECRET: nonEmptyOptional,
  TOKEN_ENCRYPTION_KEY: nonEmptyOptional,
  CRON_SECRET: nonEmptyOptional,

  MEDIA_STORAGE_PROVIDER: z.enum(["local", "s3"]).default("local"),
  LOCAL_MEDIA_DIR: z.string().trim().min(1).default("./storage/local"),
  MAX_MEDIA_UPLOAD_MB: z.coerce.number().int().positive().max(500).default(50),
});

export type AppEnv = z.infer<typeof envSchema>;

export interface EnvironmentReadiness {
  databaseConfigured: boolean;
  authSecretConfigured: boolean;
  tokenEncryptionKeyValid: boolean;
  cronSecretConfigured: boolean;
  mediaStorageProvider: "local" | "s3";
}

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  const upper = value.toUpperCase();
  return (
    upper.includes("REPLACE_WITH") ||
    upper.includes("YOUR-NEON-ENDPOINT") ||
    upper.startsWith("POSTGRESQL://USER:PASSWORD@")
  );
}

/**
 * Parses and validates server environment variables without throwing when
 * optional database/OAuth credentials have not been supplied yet.
 */
export function parseEnv(source: Record<string, string | undefined> = process.env): AppEnv {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${formatted}`);
  }
  return result.data;
}

/**
 * Evaluates readiness flags safely (boolean only; never returns secret values).
 */
export function getEnvironmentReadiness(
  source: Record<string, string | undefined> = process.env,
): EnvironmentReadiness {
  const env = parseEnv(source);
  const databaseConfigured = !isPlaceholder(env.DATABASE_URL);
  const authSecretConfigured =
    !isPlaceholder(env.AUTH_SECRET) && (env.AUTH_SECRET?.length ?? 0) >= 32;
  const tokenEncryptionKeyValid =
    !isPlaceholder(env.TOKEN_ENCRYPTION_KEY) &&
    /^[0-9a-fA-F]{64}$/.test(env.TOKEN_ENCRYPTION_KEY ?? "");
  const cronSecretConfigured =
    !isPlaceholder(env.CRON_SECRET) && (env.CRON_SECRET?.length ?? 0) >= 16;

  return {
    databaseConfigured,
    authSecretConfigured,
    tokenEncryptionKeyValid,
    cronSecretConfigured,
    mediaStorageProvider: env.MEDIA_STORAGE_PROVIDER,
  };
}
