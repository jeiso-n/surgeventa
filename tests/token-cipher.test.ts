import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  decryptToken,
  encryptToken,
  parseEncryptionKey,
} from "@/server/security/token-cipher";

const VALID_KEY = randomBytes(32).toString("hex");
const OTHER_KEY = randomBytes(32).toString("hex");

describe("token-cipher (AES-256-GCM)", () => {
  it("encrypts and decrypts OAuth tokens losslessly with random IVs", () => {
    const token = "oauth2_access_token_example_9f8e7d6c5b4a";
    const encryptedA = encryptToken(token, VALID_KEY);
    const encryptedB = encryptToken(token, VALID_KEY);

    expect(encryptedA).not.toBe(token);
    expect(encryptedA).not.toBe(encryptedB);
    expect(encryptedA.startsWith("v1:")).toBe(true);

    expect(decryptToken(encryptedA, VALID_KEY)).toBe(token);
    expect(decryptToken(encryptedB, VALID_KEY)).toBe(token);
  });

  it("rejects decryption with the wrong key", () => {
    const encrypted = encryptToken("secret-refresh-token", VALID_KEY);
    expect(() => decryptToken(encrypted, OTHER_KEY)).toThrow();
  });

  it("detects ciphertext tampering", () => {
    const encrypted = encryptToken("sensitive-token-value", VALID_KEY);
    const parts = encrypted.split(":");
    const tamperedPayload = `${parts[0]}:${parts[1]}:${parts[2]}:AAAA${parts[3].slice(4)}`;
    expect(() => decryptToken(tamperedPayload, VALID_KEY)).toThrow();
  });

  it("rejects invalid encryption key formats", () => {
    expect(() => parseEncryptionKey("too-short")).toThrow(/64-character hexadecimal/);
    expect(() => parseEncryptionKey("z".repeat(64))).toThrow(/64-character hexadecimal/);
  });

  it("rejects empty plaintext tokens", () => {
    expect(() => encryptToken("", VALID_KEY)).toThrow(/empty token/i);
  });
});
