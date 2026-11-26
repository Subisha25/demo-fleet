/**
 * Standardized Form Validation and Formatting Helpers for FleetFlow Frontend
 */

export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
export const PHONE_REGEX = /^[6-9]\d{9}$/;
export const PINCODE_REGEX = /^[1-9][0-9]{5}$/;
export const VEHICLE_REG_REGEX = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$/;

/**
 * Validates 10-digit Indian Mobile Number
 */
export function validateMobile(val?: string | null, isRequired = true): { valid: boolean; error?: string } {
  if (!val || typeof val !== 'string' || !val.trim()) {
    if (isRequired) return { valid: false, error: 'Phone number must be exactly 10 digits.' };
    return { valid: true };
  }
  const digits = val.replace(/\D/g, '');
  if (digits.length !== 10) return { valid: false, error: 'Phone number must be exactly 10 digits.' };
  if (!PHONE_REGEX.test(digits)) return { valid: false, error: 'Phone number must be exactly 10 digits.' };
  return { valid: true };
}

/**
 * Formats user typing for mobile input: strips non-digits and restricts to 10 digits.
 */
export function formatMobileInput(val: string): string {
  if (!val) return '';
  return val.replace(/\D/g, '').slice(0, 10);
}

/**
 * Validates Indian PAN
 */
export function validatePan(val?: string | null, isRequired = false): { valid: boolean; error?: string } {
  if (!val || typeof val !== 'string' || !val.trim()) {
    if (isRequired) return { valid: false, error: 'Please enter the PAN number.' };
    return { valid: true };
  }
  const cleaned = val.trim().toUpperCase();
  if (cleaned.length !== 10 || !PAN_REGEX.test(cleaned)) {
    return { valid: false, error: 'Please enter a valid 10-character PAN number.' };
  }
  return { valid: true };
}

/**
 * Formats user typing for PAN input: letters & digits only, uppercase, max 10 chars.
 */
export function formatPanInput(val: string): string {
  if (!val) return '';
  return val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10);
}

/**
 * Validates Indian GSTIN
 */
export function validateGstin(val?: string | null, isRequired = false): { valid: boolean; error?: string } {
  if (!val || typeof val !== 'string' || !val.trim()) {
    if (isRequired) return { valid: false, error: 'Please enter the GST number.' };
    return { valid: true };
  }
  const cleaned = val.trim().toUpperCase();
  if (cleaned.length !== 15 || !GSTIN_REGEX.test(cleaned)) {
    return { valid: false, error: 'Please enter a valid 15-character GST number.' };
  }
  return { valid: true };
}

/**
 * Formats user typing for GSTIN input: alphanumeric only, uppercase, max 15 chars.
 */
export function formatGstinInput(val: string): string {
  if (!val) return '';
  return val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 15);
}

/**
 * Validates 6-digit PIN code
 */
export function validatePinCode(val?: string | null, isRequired = false): { valid: boolean; error?: string } {
  if (!val || typeof val !== 'string' || !val.trim()) {
    if (isRequired) return { valid: false, error: 'Please enter a valid 6-digit pincode.' };
    return { valid: true };
  }
  const digits = val.replace(/\D/g, '');
  if (digits.length !== 6 || !PINCODE_REGEX.test(digits)) {
    return { valid: false, error: 'Please enter a valid 6-digit pincode.' };
  }
  return { valid: true };
}

/**
 * Formats user typing for PIN code input: digits only, max 6 digits.
 */
export function formatPinCodeInput(val: string): string {
  if (!val) return '';
  return val.replace(/\D/g, '').slice(0, 6);
}

/**
 * Formats vehicle registration input: uppercase alphanumeric without extra symbols.
 */
export function formatVehicleRegInput(val: string): string {
  if (!val) return '';
  return val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 12);
}

/**
 * Validates vehicle registration number
 */
export function validateVehicleReg(val?: string | null): { valid: boolean; error?: string } {
  if (!val || typeof val !== 'string') return { valid: false, error: 'Vehicle registration is required.' };
  const cleaned = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (cleaned.length < 5) return { valid: false, error: 'Vehicle registration is too short.' };
  if (!VEHICLE_REG_REGEX.test(cleaned)) {
    return { valid: false, error: 'Invalid Indian vehicle registration format (e.g. MH01AB1234).' };
  }
  return { valid: true };
}

export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Validates Email address
 */
export function validateEmail(val?: string | null, isRequired = true): { valid: boolean; error?: string } {
  if (!val || typeof val !== 'string' || !val.trim()) {
    if (isRequired) return { valid: false, error: 'Please enter a valid email address.' };
    return { valid: true };
  }
  const trimmed = val.trim().toLowerCase();
  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }
  return { valid: true };
}

/**
 * Automatically scrolls to the first invalid input field and focuses it.
 */
export function scrollToFirstError(fieldNames: string[]) {
  if (typeof document === 'undefined') return;
  for (const name of fieldNames) {
    const el = document.querySelector(`[name="${name}"], #${name}`) as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        try {
          el.focus();
        } catch {}
      }, 250);
      break;
    }
  }
}

/**
 * Validates Name field (rejects empty/whitespace, min length)
 */
export function validateName(val?: string | null, label = 'Name', minLength = 2): { valid: boolean; error?: string } {
  if (!val || typeof val !== 'string' || !val.trim()) {
    return { valid: false, error: `Please enter the ${label.toLowerCase()}.` };
  }
  const trimmed = val.trim();
  if (trimmed.length < minLength) {
    return { valid: false, error: `${label} must be at least ${minLength} characters.` };
  }
  return { valid: true };
}

/**
 * Validates required field
 */
export function validateRequired(val?: any, label = 'This field', minLength = 1): { valid: boolean; error?: string } {
  if (val === undefined || val === null) {
    return { valid: false, error: `${label} is required.` };
  }
  const str = String(val).trim();
  if (str.length === 0) {
    return { valid: false, error: `${label} is required.` };
  }
  if (str.length < minLength) {
    return { valid: false, error: `${label} must be at least ${minLength} characters.` };
  }
  return { valid: true };
}

/**
 * Validates required dropdown selection (rejects empty or placeholder values)
 */
export function validateSelect(val?: any, label = 'an option'): { valid: boolean; error?: string } {
  if (!val || val === '' || val === 'Select' || val === '-- Select --' || val === '0') {
    return { valid: false, error: `Please select ${label}.` };
  }
  return { valid: true };
}

/**
 * Validates numeric fields (rates, amounts, distances)
 */
export function validatePositiveNumber(
  val?: any,
  label = 'Amount',
  allowZero = false
): { valid: boolean; error?: string; value: number } {
  if (val === undefined || val === null || val === '') {
    return { valid: false, error: `${label} is required.`, value: NaN };
  }
  const num = Number(val);
  if (isNaN(num)) {
    return { valid: false, error: `${label} must be a valid number.`, value: NaN };
  }
  if (allowZero ? num < 0 : num <= 0) {
    return {
      valid: false,
      error: allowZero ? `${label} cannot be negative.` : `${label} must be greater than zero.`,
      value: num,
    };
  }
  return { valid: true, value: num };
}

/**
 * Validates integer values (seats, passenger count)
 */
export function validateInteger(
  val?: any,
  label = 'Value',
  min = 1
): { valid: boolean; error?: string; value: number } {
  const result = validatePositiveNumber(val, label, min <= 0);
  if (!result.valid) return result;
  if (!Number.isInteger(result.value)) {
    return { valid: false, error: `${label} must be a whole number.`, value: result.value };
  }
  if (result.value < min) {
    return { valid: false, error: `${label} must be at least ${min}.`, value: result.value };
  }
  return { valid: true, value: result.value };
}

/**
 * Validates date ranges
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

  if (isNaN(start.getTime())) return { valid: false, error: `Invalid ${startLabel.toLowerCase()} format.` };
  if (isNaN(end.getTime())) return { valid: false, error: `Invalid ${endLabel.toLowerCase()} format.` };

  if (end < start) {
    return { valid: false, error: `${endLabel} cannot be before ${startLabel.toLowerCase()}.` };
  }
  return { valid: true };
}

/**
 * Extracts a specific, human-readable error message from any API error response,
 * eliminating generic fallbacks whenever the actual reason is known.
 */
export function extractApiErrorMessage(err: any, fallback = 'An unexpected error occurred. Please try again.'): string {
  if (!err) return fallback;

  // Check structured backend response
  const data = err.response?.data;
  if (data) {
    if (typeof data === 'string') return data;
    if (data.message && typeof data.message === 'string' && data.message.trim()) {
      return data.message.trim();
    }
    if (data.error && typeof data.error === 'string' && data.error.trim()) {
      return data.error.trim();
    }
    if (data.errors && typeof data.errors === 'object') {
      const firstErrorVal = Object.values(data.errors)[0];
      if (typeof firstErrorVal === 'string' && firstErrorVal.trim()) {
        return firstErrorVal.trim();
      }
    }
  }

  // Network / client errors
  if (err.message) {
    if (err.message.includes('Network Error')) {
      return 'Unable to connect to the server. Please check your network connection.';
    }
    if (err.message.includes('timeout')) {
      return 'The server took too long to respond. Please try again.';
    }
  }

  return fallback;
}

/**
 * Extracts field-specific errors map from API error response
 */
export function extractFieldErrors(err: any): Record<string, string> {
  const data = err?.response?.data;
  if (!data) return {};

  if (data.errors && typeof data.errors === 'object') {
    const res: Record<string, string> = {};
    for (const [k, v] of Object.entries(data.errors)) {
      if (typeof v === 'string') res[k] = v;
    }
    return res;
  }

  if (data.field && data.message) {
    return { [data.field]: data.message };
  }

  return {};
}


