/**
 * Node.js crypto module for encryption/decryption operations
 */
import crypto from "crypto";
/**
 * Environment variables module
 */
import { env } from "./env.js";

/**
 * Encryption configuration
 * The secret is padded to 32 bytes as required by AES-256-CBC
 */
const encryptionSecret = env.ENCRYPTION_SECRET.padEnd(32, "0"); // Must be 32 bytes
const IV = crypto.randomBytes(16);
const encryptionAlgorithm = "aes-256-cbc";

/**
 * Encrypts text using AES-256-CBC algorithm
 * @param {string} text - Plain text to encrypt
 * @returns {string} Encrypted text with IV prefixed (format: iv:encryptedText)
 */
export function encrypt(text) {
  const cipher = crypto.createCipheriv(encryptionAlgorithm, Buffer.from(encryptionSecret), IV);
  let encrypted = cipher.update(text, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return IV.toString("hex") + ":" + encrypted;
}

/**
 * Decrypts text that was encrypted with the encrypt function
 * @param {string} text - Encrypted text in format iv:encryptedText
 * @returns {string|null} Decrypted text or null if input is falsy
 */
export function decrypt(text) {
  if (!text) {
    return null;
  }

  const [ivHex, encrypted] = text.split(":");
  const decipher = crypto.createDecipheriv(
    encryptionAlgorithm,
    Buffer.from(encryptionSecret),
    Buffer.from(ivHex, "hex")
  );
  let decrypted = decipher.update(encrypted, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
}
