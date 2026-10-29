import crypto from 'crypto';

/**
 * Derives a consistent 32-byte key from the server-side encryption key or secret.
 * Held strictly outside the database in process.env.
 * Never uses a hardcoded fallback secret.
 */
function getDerivedKey(): Buffer {
  const secret = (
    process.env.SMS_ENCRYPTION_KEY ||
    process.env.ENCRYPTION_KEY ||
    process.env.JWT_SECRET ||
    ''
  ).trim();

  if (!secret) {
    throw new Error(
      'Security Exception: Encryption secret (SMS_ENCRYPTION_KEY / ENCRYPTION_KEY / JWT_SECRET) is not configured in environment.'
    );
  }

  // Derive a 256-bit (32-byte) key using SHA-256
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts provider credentials (API key) using AES-256-GCM.
 * Output format: iv:authTag:ciphertext (base64 encoded strings)
 */
export function encryptSmsApiKey(plainTextApiKey: string): string {
  if (!plainTextApiKey || typeof plainTextApiKey !== 'string') {
    return '';
  }

  const trimmed = plainTextApiKey.trim();
  if (!trimmed) return '';

  const key = getDerivedKey();
  const iv = crypto.randomBytes(12); // Standard 96-bit IV for GCM

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(trimmed, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
}

/**
 * Decrypts provider credentials using AES-256-GCM.
 * Validates integrity via GCM authentication tag.
 */
export function decryptSmsApiKey(cipherString: string): string {
  if (!cipherString || typeof cipherString !== 'string') {
    return '';
  }

  const parts = cipherString.split(':');
  if (parts.length !== 3) {
    // Malformed or plain text check (do not throw if empty)
    return '';
  }

  const [ivBase64, tagBase64, encryptedBase64] = parts;
  const key = getDerivedKey();
  const iv = Buffer.from(ivBase64, 'base64');
  const tag = Buffer.from(tagBase64, 'base64');
  const encrypted = Buffer.from(encryptedBase64, 'base64');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

/**
 * Masks an API key for safe presentation in user interfaces, audit logs, and API responses.
 * Never exposes full credentials. Example: ••••••••••••abcd
 */
export function maskApiKey(apiKey?: string | null): string {
  if (!apiKey || typeof apiKey !== 'string') return 'Not Configured';
  const clean = apiKey.trim();
  if (clean.length <= 4) {
    return '••••';
  }
  return '••••••••••••' + clean.slice(-4);
}
