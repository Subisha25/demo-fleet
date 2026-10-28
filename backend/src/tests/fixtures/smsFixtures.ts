/**
 * Shared SMS and recipient routing test fixtures.
 * Used across test suites to verify dynamic contact resolution, applicant routing,
 * and fail-safe behavior without scattering raw literal numbers across test files.
 */

// Test recipient used to verify that valid applicants entering this number are permitted
export const APPLICANT_TEST_PHONE = '9003241571';

export const APPLICANT_FORMATTED_VARIANTS = [
  APPLICANT_TEST_PHONE,
  `+91${APPLICANT_TEST_PHONE}`,
  `+91 90032 41571`,
  `91-90032-41571`,
  `90032-41571`,
  `  ${APPLICANT_TEST_PHONE}  `,
];

export const SUPERADMIN_EXPECTED_PHONE = '9080280818';
export const SUPERADMIN_EXPECTED_EMAIL = 'subisha2002.m@gmail.com';
export const CUSTOMER_TEST_PHONE = '9789012345';
