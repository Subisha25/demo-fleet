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
      error: 'Phone number must be exactly 10 digits.',
    };
  }

  // Validate TRAI mobile series (must start with 6, 7, 8, or 9)
  if (!/^[6-9]/.test(digitsOnly)) {
    return {
      valid: false,
      normalizedPhone: digitsOnly,
      error: 'Phone number must start with 6, 7, 8, or 9.',
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

export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
export const PINCODE_REGEX = /^[1-9][0-9]{5}$/;
export const VEHICLE_REG_REGEX = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$/;

export function validatePan(pan?: string | null, isRequired = false): { valid: boolean; normalized: string; error?: string } {
  if (!pan || typeof pan !== 'string' || !pan.trim()) {
    if (isRequired) return { valid: false, normalized: '', error: 'Please enter the PAN number.' };
    return { valid: true, normalized: '' };
  }
  const normalized = pan.trim().toUpperCase();
  if (normalized.length !== 10 || !PAN_REGEX.test(normalized)) {
    return { valid: false, normalized, error: 'Please enter a valid 10-character PAN number.' };
  }
  return { valid: true, normalized };
}

export function validateGstin(gstin?: string | null, isRequired = false): { valid: boolean; normalized: string; error?: string } {
  if (!gstin || typeof gstin !== 'string' || !gstin.trim()) {
    if (isRequired) return { valid: false, normalized: '', error: 'Please enter the GST number.' };
    return { valid: true, normalized: '' };
  }
  const normalized = gstin.trim().toUpperCase();
  if (normalized.length !== 15 || !GSTIN_REGEX.test(normalized)) {
    return { valid: false, normalized, error: 'Please enter a valid 15-character GST number.' };
  }
  return { valid: true, normalized };
}

export function validatePinCode(pin?: string | null, isRequired = false): { valid: boolean; normalized: string; error?: string } {
  if (!pin || typeof pin !== 'string' || !pin.trim()) {
    if (isRequired) return { valid: false, normalized: '', error: 'Please enter a valid 6-digit pincode.' };
    return { valid: true, normalized: '' };
  }
  const normalized = pin.trim().replace(/\D/g, '');
  if (normalized.length !== 6 || !PINCODE_REGEX.test(normalized)) {
    return { valid: false, normalized, error: 'Please enter a valid 6-digit pincode.' };
  }
  return { valid: true, normalized };
}

export function validateVehicleRegistration(reg?: string | null): { valid: boolean; normalized: string; error?: string } {
  if (!reg || typeof reg !== 'string') return { valid: false, normalized: '', error: 'Vehicle Registration number is required.' };
  const normalized = reg.trim().toUpperCase().replace(/[\s\-]/g, '');
  if (normalized.length < 5 || normalized.length > 13) {
    return { valid: false, normalized, error: 'Vehicle registration must be between 5 and 13 characters.' };
  }
  if (!VEHICLE_REG_REGEX.test(normalized)) {
    return { valid: false, normalized, error: 'Invalid Indian vehicle registration format (e.g. MH01AB1234 or DL1CA9999).' };
  }
  return { valid: true, normalized };
}

/**
 * Validates non-empty string with optional minimum length.
 */
export function validateRequired(
  val?: any,
  fieldLabel = 'This field',
  minLength = 1
): { valid: boolean; error?: string; normalized: string } {
  if (val === undefined || val === null) {
    return { valid: false, error: `${fieldLabel} is required.`, normalized: '' };
  }
  const str = String(val).trim();
  if (str.length === 0) {
    return { valid: false, error: `${fieldLabel} cannot be empty.`, normalized: '' };
  }
  if (str.length < minLength) {
    return {
      valid: false,
      error: `${fieldLabel} must be at least ${minLength} characters.`,
      normalized: str,
    };
  }
  return { valid: true, normalized: str };
}

/**
 * Validates numeric fields (e.g., amounts, rates, distances, capacities).
 */
export function validatePositiveNumber(
  val?: any,
  fieldLabel = 'Amount',
  allowZero = false
): { valid: boolean; error?: string; value: number } {
  if (val === undefined || val === null || val === '') {
    return { valid: false, error: `${fieldLabel} is required.`, value: NaN };
  }
  const num = Number(val);
  if (isNaN(num)) {
    return { valid: false, error: `${fieldLabel} must be a valid number.`, value: NaN };
  }
  if (allowZero ? num < 0 : num <= 0) {
    return {
      valid: false,
      error: allowZero
        ? `${fieldLabel} cannot be negative.`
        : `${fieldLabel} must be greater than zero.`,
      value: num,
    };
  }
  return { valid: true, value: num };
}

/**
 * Validates integer values (e.g. seat count, passenger count, duration).
 */
export function validateInteger(
  val?: any,
  fieldLabel = 'Value',
  min = 1
): { valid: boolean; error?: string; value: number } {
  const result = validatePositiveNumber(val, fieldLabel, min <= 0);
  if (!result.valid) return result;
  if (!Number.isInteger(result.value)) {
    return { valid: false, error: `${fieldLabel} must be a whole number (integer).`, value: result.value };
  }
  if (result.value < min) {
    return { valid: false, error: `${fieldLabel} must be at least ${min}.`, value: result.value };
  }
  return { valid: true, value: result.value };
}

/**
 * Validates date ranges (e.g., start date vs end date).
 */
export function validateDateRange(
  startVal: any,
  endVal: any,
  startLabel = 'Start date',
  endLabel = 'End date'
): { valid: boolean; error?: string } {
  if (!startVal) return { valid: false, error: `${startLabel} is required.` };
  if (!endVal) return { valid: false, error: `${endLabel} is required.` };

  const start = new Date(startVal);
  const end = new Date(endVal);

  if (isNaN(start.getTime())) return { valid: false, error: `Invalid ${startLabel} format.` };
  if (isNaN(end.getTime())) return { valid: false, error: `Invalid ${endLabel} format.` };

  if (end < start) {
    return { valid: false, error: `${endLabel} cannot be before ${startLabel}.` };
  }
  return { valid: true };
}

/**
 * Authoritative Database Error and Unique Constraint Handler.
 * Catches MySQL 1062 duplicate-entry and Sequelize UniqueConstraintError,
 * maps them to precise, field-specific error messages with HTTP 409,
 * and handles Sequelize ValidationError with HTTP 400.
 */
export function handleDatabaseError(
  err: any,
  res: any,
  fallbackMessage = 'An unexpected error occurred. Please try again.'
) {
  // Check for Sequelize UniqueConstraintError or MySQL 1062 ER_DUP_ENTRY
  const isUniqueConstraint =
    err?.name === 'SequelizeUniqueConstraintError' ||
    err?.original?.code === 'ER_DUP_ENTRY' ||
    err?.original?.errno === 1062 ||
    err?.code === 'ER_DUP_ENTRY' ||
    err?.errno === 1062 ||
    (typeof err?.message === 'string' && err.message.includes('Duplicate entry'));

  if (isUniqueConstraint) {
    const errorMsg = String(err?.original?.sqlMessage || err?.message || '');
    let field = 'item';
    let specificMsg = 'A record with this value already exists.';

    if (err?.errors && Array.isArray(err.errors) && err.errors.length > 0) {
      field = err.errors[0]?.path || field;
    } else {
      const keyMatch = errorMsg.match(/for key ['`]([^'`]+)['`]/i);
      if (keyMatch) {
        field = keyMatch[1];
      }
    }

    const lowerField = field.toLowerCase();
    if (lowerField.includes('phone') || lowerField.includes('phno') || lowerField.includes('mobile')) {
      specificMsg = 'This phone number is already registered.';
      field = 'phone';
    } else if (lowerField.includes('email')) {
      specificMsg = 'This email address is already registered.';
      field = 'email';
    } else if (lowerField.includes('gst') || lowerField.includes('gstin')) {
      specificMsg = 'This GST number is already registered.';
      field = 'gstNo';
    } else if (lowerField.includes('vehiclenumber') || lowerField.includes('reg') || lowerField.includes('plate')) {
      specificMsg = 'This vehicle number is already registered.';
      field = 'vehicleNumber';
    } else if (lowerField.includes('companyname') || lowerField.includes('name')) {
      specificMsg = 'This name is already registered.';
      field = 'companyName';
    } else if (lowerField.includes('companycode') || lowerField.includes('code') || lowerField.includes('businesscode')) {
      specificMsg = 'This business code is already in use.';
      field = 'companyCode';
    } else if (lowerField.includes('pan')) {
      specificMsg = 'This PAN is already registered.';
      field = 'pan';
    } else if (lowerField.includes('subdomain') || lowerField.includes('slug')) {
      specificMsg = 'This domain or URL slug is already taken.';
      field = 'subdomain';
    } else if (lowerField.includes('transaction')) {
      specificMsg = 'This transaction ID has already been recorded.';
      field = 'transactionId';
    }

    return res.status(409).json({
      success: false,
      message: specificMsg,
      field,
      errors: { [field]: specificMsg },
    });
  }

  // Handle Sequelize validation errors
  if (err?.name === 'SequelizeValidationError' && Array.isArray(err.errors)) {
    const errors: Record<string, string> = {};
    err.errors.forEach((e: any) => {
      if (e.path) errors[e.path] = e.message;
    });
    const firstMsg = Object.values(errors)[0] || 'Validation failed. Please correct the highlighted fields.';
    return res.status(400).json({
      success: false,
      message: firstMsg,
      errors,
    });
  }

  // Log internal error safely without returning stack traces or database credentials
  console.error('[Database Operation Error]:', err?.message || err);
  return res.status(500).json({
    success: false,
    message: fallbackMessage,
  });
}

