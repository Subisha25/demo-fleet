/**
 * Centralized Mock Mode Decision Utility for FleetFlow SaaS
 * Decouples Email and SMS mock controls while preserving backwards compatibility.
 */

import dotenv from 'dotenv';
dotenv.config();

export const isEmailMockMode = (): boolean => {
  // Automated test environment is strictly mocked (never send real emails)
  if (process.env.NODE_ENV === 'test') {
    return true;
  }

  // Explicit EMAIL_MOCK_MODE flag takes precedence over everything
  if (process.env.EMAIL_MOCK_MODE !== undefined) {
    const val = String(process.env.EMAIL_MOCK_MODE).trim().toLowerCase();
    return val === 'true' || val === '1';
  }

  // Fallback to legacy NOTIFICATION_MOCK_MODE if EMAIL_MOCK_MODE is not set
  if (process.env.NOTIFICATION_MOCK_MODE !== undefined) {
    const val = String(process.env.NOTIFICATION_MOCK_MODE).trim().toLowerCase();
    return val !== 'false' && val !== '0';
  }

  return true;
};

export const isSmsMockMode = (): boolean => {
  // Automated test environment is strictly mocked (never send real SMS)
  if (process.env.NODE_ENV === 'test') {
    return true;
  }

  // Explicit SMS_MOCK_MODE flag takes precedence over everything
  if (process.env.SMS_MOCK_MODE !== undefined) {
    const val = String(process.env.SMS_MOCK_MODE).trim().toLowerCase();
    return val === 'true' || val === '1';
  }

  // Fallback to legacy NOTIFICATION_MOCK_MODE if SMS_MOCK_MODE is not set
  if (process.env.NOTIFICATION_MOCK_MODE !== undefined) {
    const val = String(process.env.NOTIFICATION_MOCK_MODE).trim().toLowerCase();
    return val !== 'false' && val !== '0';
  }

  return true;
};
