import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH_BYTES = 12;
const AUTH_TAG_LENGTH_BYTES = 16;
const KEY_LENGTH_BYTES = 32;
const PAYLOAD_VERSION = "v1";

/**
 * Validates and decodes a 64-character hexadecimal AES-256 key.
 */
export function parseEncryptionKey(hexKey: string): Buffer {
  const trimmed = hexKey.trim();
  if (!/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    throw new Error(
      "TOKEN_ENCRYPTION_KEY must be a 64-character hexadecimal string (32 bytes for AES-256-GCM).",
    );
  }
  const keyBuffer = Buffer.from(trimmed, "hex");
  if (keyBuffer.length !== KEY_LENGTH_BYTES) {
    throw new Error("Invalid encryption key length.");
  }
  return keyBuffer;
}

/**
 * Encrypts a sensitive OAuth access/refresh token using AES-256-GCM.
 * Format: v1:<iv_base64>:<authTag_base64>:<ciphertext_base64>
 */
export function encryptToken(plaintext: string, hexKey: string): string {
  if (!plaintext) {
    throw new Error("Cannot encrypt an empty token.");
  }
  const key = parseEncryptionKey(hexKey);
  const iv = randomBytes(IV_LENGTH_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH_BYTES,
  });

  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [
    PAYLOAD_VERSION,
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}

/**
 * Decrypts a versioned AES-256-GCM token payload and verifies integrity.
 * Throws if the payload is malformed, tampered with, or decrypted with the wrong key.
 */
export function decryptToken(payload: string, hexKey: string): string {
  const parts = payload.split(":");
  if (parts.length !== 4 || parts[0] !== PAYLOAD_VERSION) {
    throw new Error("Unsupported or malformed encrypted token payload.");
  }

  const [, ivB64, authTagB64, ciphertextB64] = parts;
  const key = parseEncryptionKey(hexKey);
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const ciphertext = Buffer.from(ciphertextB64, "base64");

  if (iv.length !== IV_LENGTH_BYTES || authTag.length !== AUTH_TAG_LENGTH_BYTES) {
    throw new Error("Encrypted token metadata length mismatch.");
  }

  const decipher = createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH_BYTES,
  });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString("utf8");
}
