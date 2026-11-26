import { describe, expect, it } from "vitest";
import {
  TARGET_PLATFORMS,
  getPlatformById,
  getPlatformsByMode,
  type PlatformId,
} from "@/domain/platforms";

describe("TARGET_PLATFORMS registry", () => {
  it("defines all 9 required target platforms uniquely", () => {
    const expected: PlatformId[] = [
      "facebook",
      "instagram",
      "tiktok",
      "youtube",
      "reddit",
      "pinterest",
      "linkedin",
      "x",
      "threads",
    ];

    expect(TARGET_PLATFORMS).toHaveLength(9);
    const ids = TARGET_PLATFORMS.map((p) => p.id);
    expect(new Set(ids).size).toBe(9);
    for (const id of expected) {
      expect(ids).toContain(id);
    }
  });

  it("enforces zero-spending compliance by defaulting X and Reddit to assisted_manual", () => {
    expect(getPlatformById("x").publishingMode).toBe("assisted_manual");
    expect(getPlatformById("reddit").publishingMode).toBe("assisted_manual");
    expect(getPlatformsByMode("assisted_manual").map((p) => p.id).sort()).toEqual([
      "reddit",
      "x",
    ]);
    expect(TARGET_PLATFORMS.every((p) => p.zeroSpendCompatible)).toBe(true);
  });

  it("accurately marks personal account restrictions for Facebook and Instagram", () => {
    expect(getPlatformById("facebook").personalAccountSupported).toBe(false);
    expect(getPlatformById("instagram").personalAccountSupported).toBe(false);
    expect(getPlatformById("youtube").personalAccountSupported).toBe(true);
    expect(getPlatformById("linkedin").personalAccountSupported).toBe(true);
  });
});
