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
export function validateMobile(val?: string | null): { valid: boolean; error?: string } {
  if (!val || typeof val !== 'string') return { valid: false, error: 'Mobile number is required.' };
  const digits = val.replace(/\D/g, '');
  if (digits.length !== 10) return { valid: false, error: 'Mobile number must be exactly 10 digits.' };
  if (!PHONE_REGEX.test(digits)) return { valid: false, error: 'Mobile number must start with 6, 7, 8, or 9.' };
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
export function validatePan(val?: string | null): { valid: boolean; error?: string } {
  if (!val || typeof val !== 'string') return { valid: false, error: 'PAN is required.' };
  const cleaned = val.trim().toUpperCase();
  if (cleaned.length !== 10) return { valid: false, error: 'PAN must be exactly 10 characters.' };
  if (!PAN_REGEX.test(cleaned)) return { valid: false, error: 'Invalid PAN format (e.g. ABCDE1234F).' };
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
export function validateGstin(val?: string | null): { valid: boolean; error?: string } {
  if (!val || typeof val !== 'string') return { valid: false, error: 'GSTIN is required.' };
  const cleaned = val.trim().toUpperCase();
  if (cleaned.length !== 15) return { valid: false, error: 'GSTIN must be exactly 15 characters.' };
  if (!GSTIN_REGEX.test(cleaned)) return { valid: false, error: 'Invalid GSTIN format (e.g. 22AAAAA0000A1Z5).' };
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
export function validatePinCode(val?: string | null): { valid: boolean; error?: string } {
  if (!val || typeof val !== 'string') return { valid: false, error: 'PIN Code is required.' };
  const digits = val.replace(/\D/g, '');
  if (digits.length !== 6) return { valid: false, error: 'PIN Code must be exactly 6 digits.' };
  if (!PINCODE_REGEX.test(digits)) return { valid: false, error: 'Invalid PIN Code format.' };
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

