import { z } from "zod";
import { TARGET_PLATFORMS, type PlatformId } from "@/domain/platforms";

export const DEFAULT_TIMEZONE = "UTC";

export type DefaultPublishMode = "draft" | "schedule" | "publish_now";
export type DefaultVisibility = "public" | "private";

export interface PublishingPreferences {
  defaultPublishMode: DefaultPublishMode;
  defaultVisibility: DefaultVisibility;
  autoSaveDrafts: boolean;
  notifyOnFailure: boolean;
  defaultPlatforms: PlatformId[];
}

export const DEFAULT_PUBLISHING_PREFERENCES: PublishingPreferences = {
  defaultPublishMode: "draft",
  defaultVisibility: "public",
  autoSaveDrafts: true,
  notifyOnFailure: true,
  defaultPlatforms: [],
};

const PLATFORM_IDS = TARGET_PLATFORMS.map((p) => p.id) as [PlatformId, ...PlatformId[]];

/**
 * Validates an IANA timezone identifier (always accepts "UTC").
 */
export function isValidTimezone(timezone: string): boolean {
  const trimmed = timezone.trim();
  if (!trimmed) return false;
  if (trimmed === "UTC") return true;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: trimmed });
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns a safe IANA timezone string, falling back to UTC if missing or invalid.
 */
export function normalizeTimezone(timezone?: string | null): string {
  if (!timezone) return DEFAULT_TIMEZONE;
  const trimmed = timezone.trim();
  return isValidTimezone(trimmed) ? trimmed : DEFAULT_TIMEZONE;
}

/**
 * Formats a timestamp in the user's selected timezone (defaults to UTC).
 * Used for both UI timestamps and scheduled-post display conversions.
 */
export function formatDateInTimezone(
  dateInput: Date | string,
  timezone?: string | null,
): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const tz = normalizeTimezone(timezone);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

/**
 * Lists supported IANA timezones with UTC guaranteed first.
 */
export function getSupportedTimezones(): string[] {
  const fallback = [
    "UTC",
    "Africa/Kampala",
    "Africa/Nairobi",
    "Africa/Lagos",
    "Africa/Johannesburg",
    "Europe/London",
    "Europe/Berlin",
    "America/New_York",
    "America/Chicago",
    "America/Los_Angeles",
    "Asia/Dubai",
    "Asia/Singapore",
    "Asia/Tokyo",
    "Australia/Sydney",
  ];

  if (typeof Intl.supportedValuesOf === "function") {
    try {
      const supported = Intl.supportedValuesOf("timeZone");
      return ["UTC", ...supported.filter((tz) => tz !== "UTC")];
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export const publishingPreferencesSchema = z.object({
  defaultPublishMode: z.enum(["draft", "schedule", "publish_now"]).default("draft"),
  defaultVisibility: z.enum(["public", "private"]).default("public"),
  autoSaveDrafts: z.boolean().default(true),
  notifyOnFailure: z.boolean().default(true),
  defaultPlatforms: z
    .array(z.enum(PLATFORM_IDS))
    .max(TARGET_PLATFORMS.length)
    .default([])
    .transform((items) => Array.from(new Set(items))),
});

export const updateSettingsSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters.")
    .max(80, "Display name must be 80 characters or fewer."),
  timezone: z
    .string()
    .trim()
    .default(DEFAULT_TIMEZONE)
    .refine(isValidTimezone, "Please choose a valid IANA timezone."),
  defaultPublishingPreferences: publishingPreferencesSchema,
});

export const changeEmailSchema = z.object({
  newEmail: z.string().trim().toLowerCase().email("Please enter a valid email address."),
  currentPassword: z
    .string()
    .min(1, "Enter your current password to confirm this email change."),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password."),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters.")
    .max(128, "New password must be 128 characters or fewer."),
  revokeOtherSessions: z.boolean().default(true),
});

export const registerInputSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters.")
    .max(80, "Display name must be 80 characters or fewer."),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password must be 128 characters or fewer."),
  timezone: z
    .string()
    .trim()
    .optional()
    .transform((val) => normalizeTimezone(val)),
});

export const loginInputSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address."),
  password: z.string().min(1, "Please enter your password."),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
