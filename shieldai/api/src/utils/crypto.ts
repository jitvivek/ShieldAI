import crypto from 'crypto';

const API_KEY_PREFIX = 'sk-shield-';
const KEY_LENGTH = 40; // 40 hex chars = 160 bits of entropy

/**
 * Generate a new API key with the sk-shield- prefix followed by 40 hex chars.
 */
export function generateApiKey(): string {
  const randomPart = crypto.randomBytes(KEY_LENGTH / 2).toString('hex');
  return `${API_KEY_PREFIX}${randomPart}`;
}

/**
 * Hash an API key using SHA-256 for secure storage.
 */
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Extract the prefix from an API key for identification.
 */
export function getKeyPrefix(key: string): string {
  return key.substring(0, API_KEY_PREFIX.length + 8);
}

/**
 * Validate the format of an API key.
 */
export function isValidKeyFormat(key: string): boolean {
  const pattern = new RegExp(`^${API_KEY_PREFIX}[a-f0-9]{${KEY_LENGTH}}$`);
  return pattern.test(key);
}

/**
 * Hash arbitrary input using SHA-256 (e.g., for scan log input hashing).
 */
export function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}
