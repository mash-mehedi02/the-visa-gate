import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { config } from '../config';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard for GCM
const SALT_ROUNDS = 12;

/**
 * Encrypt sensitive string data (e.g., NID, Passport Number) using AES-256-GCM
 */
export function encryptSensitiveData(text: string): string {
  if (!text) return '';
  const key = Buffer.from(config.encryption.key, 'hex');
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt sensitive string data
 */
export function decryptSensitiveData(encryptedPayload: string): string {
  if (!encryptedPayload || !encryptedPayload.includes(':')) return '';
  try {
    const [ivHex, authTagHex, encryptedText] = encryptedPayload.split(':');
    const key = Buffer.from(config.encryption.key, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return '[Encrypted Data]';
  }
}

/**
 * Mask sensitive numbers for UI display
 * e.g., "A12345678" -> "A123****78"
 * e.g., "1990123456789" -> "1990******789"
 */
export function maskSensitiveIdentifier(raw: string): string {
  if (!raw) return '';
  const clean = raw.trim();
  if (clean.length <= 4) return '****';

  const visibleStart = Math.min(3, Math.floor(clean.length / 3));
  const visibleEnd = Math.min(2, Math.floor(clean.length / 4));
  const startPart = clean.slice(0, visibleStart);
  const endPart = clean.slice(-visibleEnd);
  const maskedLength = Math.max(4, clean.length - (visibleStart + visibleEnd));

  return `${startPart}${'*'.repeat(maskedLength)}${endPart}`;
}

/**
 * Hash password securely with bcrypt
 */
export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

/**
 * Compare plain password against stored hash
 */
export async function comparePassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

/**
 * Normalize passport or login identifier for collision-free comparison
 */
export function normalizeIdentifier(input: string): string {
  return input.trim().replace(/\s+/g, '').toUpperCase();
}
