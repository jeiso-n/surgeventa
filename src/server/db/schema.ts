import {
  bigint,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const platformEnum = pgEnum("platform", [
  "facebook",
  "instagram",
  "tiktok",
  "youtube",
  "reddit",
  "pinterest",
  "linkedin",
  "x",
  "threads",
]);

export const accountConnectionStatusEnum = pgEnum("account_connection_status", [
  "active",
  "expired",
  "revoked",
  "error",
  "assisted_only",
]);

export const postStatusEnum = pgEnum("post_status", [
  "draft",
  "scheduled",
  "publishing",
  "published",
  "partially_failed",
  "failed",
  "cancelled",
]);

export const targetPublishStatusEnum = pgEnum("target_publish_status", [
  "pending",
  "queued",
  "publishing",
  "published",
  "failed",
  "assisted_ready",
  "assisted_completed",
  "cancelled",
]);

export const mediaKindEnum = pgEnum("media_kind", ["image", "video"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  timezone: text("timezone").notNull().default("UTC"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const socialAccounts = pgTable(
  "social_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    platform: platformEnum("platform").notNull(),
    externalAccountId: text("external_account_id").notNull(),
    displayName: text("display_name").notNull(),
    handle: text("handle"),
    avatarUrl: text("avatar_url"),
    status: accountConnectionStatusEnum("status").notNull().default("active"),
    // Encrypted using AES-256-GCM via src/server/security/token-cipher.ts.
    encryptedAccessToken: text("encrypted_access_token"),
    encryptedRefreshToken: text("encrypted_refresh_token"),
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
    scopes: jsonb("scopes").$type<string[]>().notNull().default([]),
    lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
    lastErrorMessage: text("last_error_message"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("social_accounts_user_platform_external_uidx").on(
      table.userId,
      table.platform,
      table.externalAccountId,
    ),
  ],
);

export const mediaAssets = pgTable("media_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  kind: mediaKindEnum("kind").notNull(),
  originalFilename: text("original_filename").notNull(),
  mimeType: text("mime_type").notNull(),
  storageProvider: text("storage_provider").notNull(),
  storageKey: text("storage_key").notNull().unique(),
  sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
  widthPx: integer("width_px"),
  heightPx: integer("height_px"),
  durationSeconds: integer("duration_seconds"),
  altText: text("alt_text"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title"),
  baseCaption: text("base_caption").notNull().default(""),
  status: postStatusEnum("status").notNull().default("draft"),
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const postTargets = pgTable(
  "post_targets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    socialAccountId: uuid("social_account_id")
      .notNull()
      .references(() => socialAccounts.id, { onDelete: "cascade" }),
    platform: platformEnum("platform").notNull(),
    captionOverride: text("caption_override"),
    platformOptions: jsonb("platform_options").$type<Record<string, unknown>>().notNull().default({}),
    status: targetPublishStatusEnum("status").notNull().default("pending"),
    // Unique idempotency key prevents duplicate publishing on retries or concurrent workers.
    idempotencyKey: text("idempotency_key").notNull().unique(),
    externalPostId: text("external_post_id"),
    externalPostUrl: text("external_post_url"),
    attemptCount: integer("attempt_count").notNull().default(0),
    lastAttemptAt: timestamp("last_attempt_at", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    errorCode: text("error_code"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("post_targets_post_account_uidx").on(table.postId, table.socialAccountId),
  ],
);

export const postMediaAttachments = pgTable(
  "post_media_attachments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    mediaAssetId: uuid("media_asset_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [
    uniqueIndex("post_media_post_asset_uidx").on(table.postId, table.mediaAssetId),
  ],
);
