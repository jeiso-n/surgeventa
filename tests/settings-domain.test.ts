import { describe, expect, it } from "vitest";
import {
  DEFAULT_PUBLISHING_PREFERENCES,
  DEFAULT_TIMEZONE,
  changeEmailSchema,
  changePasswordSchema,
  formatDateInTimezone,
  getSupportedTimezones,
  isValidTimezone,
  normalizeTimezone,
  updateSettingsSchema,
} from "@/domain/settings";

describe("settings & timezone domain validation", () => {
  it("defaults to UTC when timezone is missing or invalid", () => {
    expect(DEFAULT_TIMEZONE).toBe("UTC");
    expect(normalizeTimezone(undefined)).toBe("UTC");
    expect(normalizeTimezone(null)).toBe("UTC");
    expect(normalizeTimezone("")).toBe("UTC");
    expect(normalizeTimezone("Mars/Olympus_Mons")).toBe("UTC");
  });

  it("accepts valid IANA timezones and formats scheduled dates accurately", () => {
    expect(isValidTimezone("UTC")).toBe(true);
    expect(isValidTimezone("Africa/Kampala")).toBe(true);
    expect(isValidTimezone("America/New_York")).toBe(true);
    expect(isValidTimezone("Not/A_Zone")).toBe(false);

    const timezones = getSupportedTimezones();
    expect(timezones[0]).toBe("UTC");
    expect(timezones).toContain("Africa/Kampala");

    const sample = new Date("2026-12-01T12:00:00.000Z");
    const utcFormatted = formatDateInTimezone(sample, "UTC");
    const kampalaFormatted = formatDateInTimezone(sample, "Africa/Kampala");
    expect(utcFormatted).toContain("12:00");
    expect(kampalaFormatted).toContain("03:00");
  });

  it("validates settings payloads and deduplicates preferred platforms", () => {
    const valid = updateSettingsSchema.safeParse({
      displayName: "  Jeison Creator  ",
      timezone: "Africa/Kampala",
      defaultPublishingPreferences: {
        ...DEFAULT_PUBLISHING_PREFERENCES,
        defaultPublishMode: "schedule",
        defaultPlatforms: ["youtube", "linkedin", "youtube"],
      },
    });

    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.displayName).toBe("Jeison Creator");
      expect(valid.data.timezone).toBe("Africa/Kampala");
      expect(valid.data.defaultPublishingPreferences.defaultPlatforms).toEqual([
        "youtube",
        "linkedin",
      ]);
    }

    const invalidTz = updateSettingsSchema.safeParse({
      displayName: "Valid Name",
      timezone: "Invalid/Zone",
      defaultPublishingPreferences: DEFAULT_PUBLISHING_PREFERENCES,
    });
    expect(invalidTz.success).toBe(false);
  });

  it("validates email and password change schemas", () => {
    expect(
      changeEmailSchema.safeParse({
        newEmail: "USER@Example.COM",
        currentPassword: "password123",
      }).success,
    ).toBe(true);

    expect(
      changePasswordSchema.safeParse({
        currentPassword: "oldpassword",
        newPassword: "short",
        revokeOtherSessions: true,
      }).success,
    ).toBe(false);
  });
});
