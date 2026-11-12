/**
 * Centralized Advanced Phone and Email Validation Utility for FleetFlow SaaS
 * Strictly validates mobile numbers and email addresses to protect telecom gateways,
 * prevent OTP abuse, reject dummy/test inputs, and ensure multi-tenant security.
 */

// Known synthetic/dummy domains that should not receive real transactional emails
const SYNTHETIC_OR_DUMMY_DOMAINS = new Set([
  'example.com',
  'example.org',
  'example.net',
  'test.com',
  'fake.com',
  'mailinator.com',
  'tempmail.com',
  'throwaway.com',
  'guerrillamail.com',
  '10minutemail.com',
  'yopmail.com',
  'trashmail.com',
  'gamil.com',
  'gemail.com',
  'hotmial.com',
  'yahuo.com',
]);

// Known dummy / placeholder 10-digit mobile numbers
const KNOWN_DUMMY_MOBILE_PATTERNS = new Set([
  '0000000000',
  '1111111111',
  '2222222222',
  '3333333333',
  '4444444444',
  '5555555555',
  '6666666666',
  '7777777777',
  '8888888888',
  '9999999999',
  '1234567890',
  '0123456789',
  '2345678901',
  '8765432109',
  '9000000000',
  '9100000000',
  '9999900000',
  '9876500000',
  '9123456789',
]);

/**
 * Validates and normalizes Indian mobile numbers.
 * Enforces:
 * 1. Exactly 10 digits.
 * 2. Starts with 6, 7, 8, or 9 (TRAI standard).
 * 3. Rejects identical repeating digits (e.g. 0000000000, 1111111111, 9999999999).
 * 4. Rejects sequential series and known dummy/placeholder patterns.
 * 5. Rejects 2-digit alternating cycles (e.g. 9898989898, 9090909090).
 */
export function validateMobileRecipient(phone?: string | null): {
  valid: boolean;
  normalizedPhone: string;
  error?: string;
} {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, normalizedPhone: '', error: 'Mobile number is required.' };
  }

  const trimmed = phone.trim();
  if (!trimmed) {
    return { valid: false, normalizedPhone: '', error: 'Mobile number cannot be empty.' };
  }

  // Strip spaces, hyphens, brackets, dots, leading '+'
  let cleaned = trimmed.replace(/[\s\-\(\)\.]/g, '');
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // Extract digits only
  let digitsOnly = cleaned.replace(/\D/g, '');

  // Strip leading 91 prefixes until 10 digits remain (e.g. +919876543210 or 91919876543210)
  while (digitsOnly.startsWith('91') && digitsOnly.length > 10) {
    digitsOnly = digitsOnly.substring(2);
  }

  // Strip single leading 0 (STD prefix) if resulting length is 10
  if (digitsOnly.startsWith('0') && digitsOnly.length === 11) {
    digitsOnly = digitsOnly.substring(1);
  }

  // Validate exact 10 digits
  if (digitsOnly.length !== 10) {
    return {
      valid: false,
      normalizedPhone: digitsOnly,
      error: `Mobile number must be exactly 10 digits (${digitsOnly.length} digits entered).`,
    };
  }

  // Validate TRAI mobile series (must start with 6, 7, 8, or 9)
  if (!/^[6-9]/.test(digitsOnly)) {
    return {
      valid: false,
      normalizedPhone: digitsOnly,
      error: 'Please enter a valid Indian mobile number starting with 6, 7, 8, or 9.',
    };
  }

  // Reject identical repeating digits (e.g. 9999999999, 8888888888, 7777777777, 6666666666)
  if (/^(\d)\1{9}$/.test(digitsOnly)) {
    return {
      valid: false,
      normalizedPhone: digitsOnly,
      error: 'This mobile number appears to be a test or placeholder number.',
    };
  }

  // Reject known sequential series & placeholders
  if (KNOWN_DUMMY_MOBILE_PATTERNS.has(digitsOnly)) {
    return {
      valid: false,
      normalizedPhone: digitsOnly,
      error: 'This mobile number appears to be a test or placeholder number.',
    };
  }

  // Reject 9876543210 in production mode
  if (digitsOnly === '9876543210' && process.env.NODE_ENV === 'production') {
    return {
      valid: false,
      normalizedPhone: digitsOnly,
      error: 'This mobile number appears to be a test or placeholder number.',
    };
  }

  // Reject 2-digit alternating repetitive cycles (e.g. 9898989898, 9090909090, 9191919191)
  if (/^(\d{2})\1{4}$/.test(digitsOnly)) {
    return {
      valid: false,
      normalizedPhone: digitsOnly,
      error: 'This mobile number appears to be a repetitive test pattern.',
    };
  }

  return {
    valid: true,
    normalizedPhone: digitsOnly,
  };
}

/**
 * Validates and normalizes recipient email addresses.
 * Enforces RFC-compliant formatting and checks against known dummy/synthetic domains.
 */
export function validateEmailRecipient(email?: string | null): {
  valid: boolean;
  normalizedEmail: string;
  error?: string;
} {
  if (!email || typeof email !== 'string') {
    return { valid: false, normalizedEmail: '', error: 'Email address is required.' };
  }

  const trimmed = email.trim().toLowerCase();
  if (!trimmed) {
    return { valid: false, normalizedEmail: '', error: 'Email address cannot be empty.' };
  }

  // Standard RFC 5322 regex validation
  const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!EMAIL_REGEX.test(trimmed)) {
    return {
      valid: false,
      normalizedEmail: trimmed,
      error: 'Please enter a valid email address format (e.g. user@domain.com).',
    };
  }

  const domain = trimmed.split('@')[1];
  if (domain && SYNTHETIC_OR_DUMMY_DOMAINS.has(domain)) {
    return {
      valid: false,
      normalizedEmail: trimmed,
      error: `Email address domain "@${domain}" is not accepted. Please provide a genuine email address.`,
    };
  }

  return {
    valid: true,
    normalizedEmail: trimmed,
  };
}

/**
 * Masks a phone number for secure logging and UI display.
 * Shows only the last 4 digits (e.g. ******0818).
 */
export function maskPhoneNumber(phone?: string | null): string {
  if (!phone || typeof phone !== 'string') return 'UNKNOWN';
  const clean = phone.replace(/\s+/g, '');
  if (clean.length <= 4) return '****';
  return '*'.repeat(clean.length - 4) + clean.slice(-4);
}

/**
 * Masks an email address for secure logging and UI display.
 * e.g. s***a@gmail.com
 */
export function maskEmail(email?: string | null): string {
  if (!email || typeof email !== 'string' || !email.includes('@')) return 'UNKNOWN';
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) {
    return `${localPart[0]}*@${domain}`;
  }
  return `${localPart[0]}${'*'.repeat(Math.max(1, localPart.length - 2))}${localPart[localPart.length - 1]}@${domain}`;
}
