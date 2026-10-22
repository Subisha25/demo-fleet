import { CompanyPolicy, CompanyPolicyData } from '../models/companyPolicy';
import { Company } from '../models/company';
import { ROOT_TENANT_ID } from '../context/tenantContext';

const DEFAULT_GENERIC_POLICY: CompanyPolicyData = {
  identity: {
    allowedEmailDomains: [],
    employeeIdLabel: 'Employee ID',
    requireCostCenter: false,
    requireDepartment: false,
  },
  bookingRules: {
    requireManagerApproval: false,
    allowSelfBookingOnBehalf: true,
    minAdvanceBookingMinutes: 60,
    allowNightTravel: true,
  },
  invoicing: {
    billingMode: 'SINGLE_TRIP',
    taxExempt: false,
  },
};

const DANFOSS_FALLBACK_POLICY: CompanyPolicyData = {
  identity: {
    allowedEmailDomains: ['@danfoss.com'],
    employeeIdLabel: 'Danfoss User ID',
    employeeIdRegex: '^\\d{6}$',
    requireCostCenter: true,
    requireDepartment: false,
  },
  bookingRules: {
    requireManagerApproval: true,
    allowSelfBookingOnBehalf: true,
    minAdvanceBookingMinutes: 60,
    allowNightTravel: true,
  },
  invoicing: {
    billingMode: 'MONTHLY',
    taxExempt: false,
    customInvoicePrefix: 'DAN',
  },
};

/**
 * Retrieves the effective policy for a company.
 * Falls back to Danfoss-compatible rules if company is Danfoss, preserving 100% backward compatibility.
 */
export const getCompanyPolicy = async (companyId?: string): Promise<CompanyPolicyData> => {
  if (!companyId) {
    return DEFAULT_GENERIC_POLICY;
  }

  try {
    const existingPolicy = await CompanyPolicy.findOne({ where: { companyId } });
    if (existingPolicy && existingPolicy.policySettings) {
      return existingPolicy.policySettings;
    }

    // Check company name for Danfoss backward compatibility
    const company = await Company.findByPk(companyId);
    if (company) {
      const name = (company.companyName || '').toLowerCase();
      const code = (company.companyCode || '').toUpperCase();
      if (name.includes('danfoss') || code.includes('DAN')) {
        return DANFOSS_FALLBACK_POLICY;
      }
    }

    return DEFAULT_GENERIC_POLICY;
  } catch (error) {
    console.error('Error fetching company policy, falling back to defaults:', error);
    return DEFAULT_GENERIC_POLICY;
  }
};

/**
 * Validates registration data against the dynamic company policy.
 */
export const validateRegistrationAgainstPolicy = async (
  companyId: string | undefined,
  email: string,
  corporateEmpId?: string
): Promise<{ valid: boolean; message?: string }> => {
  if (!companyId) {
    return { valid: true };
  }

  const policy = await getCompanyPolicy(companyId);

  // 1. Email domain check
  const allowedDomains = policy.identity.allowedEmailDomains || [];
  if (allowedDomains.length > 0) {
    const lowerEmail = email.toLowerCase().trim();
    const domainMatch = allowedDomains.some((domain) => lowerEmail.endsWith(domain.toLowerCase()));
    if (!domainMatch) {
      return {
        valid: false,
        message: `Email must belong to one of the authorized domains: ${allowedDomains.join(', ')}`,
      };
    }
  }

  // 2. Employee ID regex check
  if (policy.identity.employeeIdRegex) {
    if (!corporateEmpId) {
      return {
        valid: false,
        message: `${policy.identity.employeeIdLabel || 'Corporate Employee ID'} is required for this company.`,
      };
    }
    const regex = new RegExp(policy.identity.employeeIdRegex);
    if (!regex.test(corporateEmpId)) {
      return {
        valid: false,
        message: `${policy.identity.employeeIdLabel || 'Corporate Employee ID'} must match required format: ${policy.identity.employeeIdRegex}`,
      };
    }
  }

  return { valid: true };
};

/**
 * Creates or updates policy settings for a corporate client.
 */
export const upsertCompanyPolicy = async (
  companyId: string,
  tenantId: string,
  settings: Partial<CompanyPolicyData>
): Promise<CompanyPolicy> => {
  let policy = await CompanyPolicy.findOne({ where: { companyId } });

  const mergedSettings: CompanyPolicyData = {
    identity: {
      ...DEFAULT_GENERIC_POLICY.identity,
      ...(policy?.policySettings?.identity || {}),
      ...(settings.identity || {}),
    },
    bookingRules: {
      ...DEFAULT_GENERIC_POLICY.bookingRules,
      ...(policy?.policySettings?.bookingRules || {}),
      ...(settings.bookingRules || {}),
    },
    invoicing: {
      ...DEFAULT_GENERIC_POLICY.invoicing,
      ...(policy?.policySettings?.invoicing || {}),
      ...(settings.invoicing || {}),
    },
  };

  if (policy) {
    await policy.update({
      tenantId: tenantId || ROOT_TENANT_ID,
      policySettings: mergedSettings,
    });
  } else {
    policy = await CompanyPolicy.create({
      companyId,
      tenantId: tenantId || ROOT_TENANT_ID,
      policySettings: mergedSettings,
    });
  }

  return policy;
};
