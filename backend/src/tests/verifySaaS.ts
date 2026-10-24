/**
 * Multi-Tenant SaaS & Security Verification Test Suite
 * Validates security hardening, tenant context, quota enforcement, and dynamic policy engine.
 */

import { getCompanyPolicy, validateRegistrationAgainstPolicy } from '../services/policyService';
import { PLAN_LIMITS } from '../services/quotaService';
import { runWithTenantContext, getTenantContext, ROOT_TENANT_ID, ROOT_TENANT_CODE } from '../context/tenantContext';
import { assertTenantOwnership, CrossTenantAccessError } from '../utils/tenantGuard';
import jwt from 'jsonwebtoken';
import sequelize from '../config/dbConfig';


let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n============================================================');
  console.log('🧪 GRACE CABS MULTI-TENANT SAAS & SECURITY VERIFICATION');
  console.log('============================================================\n');

  // TEST SUITE 1: JWT Standardization & Typing
  console.log('🔹 [Suite 1] JWT Claims & Standardization');
  const secret = 'test-secret-key-123';
  process.env.JWT_SECRET = secret;

  const samplePayload = {
    userId: 'c1234567-89ab-cdef-0123-456789abcdef',
    roles: 'admin',
    tenantId: ROOT_TENANT_ID,
    companyId: 'company-uuid-001',
    email: 'admin@gracecabs.in',
  };

  const token = jwt.sign(samplePayload, secret);
  const decoded: any = jwt.verify(token, secret);

  assert(typeof decoded.userId === 'string', 'Decoded userId is a standardized string UUID');
  assert(decoded.tenantId === ROOT_TENANT_ID, 'Decoded token contains valid tenantId');
  assert(decoded.roles === 'admin', 'Decoded token contains roles string');

  // TEST SUITE 2: AsyncLocalStorage Tenant Context & Isolation
  console.log('\n🔹 [Suite 2] AsyncLocalStorage Tenant Context & Isolation');

  await runWithTenantContext(
    {
      tenantId: 'tenant-apex-mobility-001',
      tenantCode: 'APX',
      role: 'tenant_admin',
      userId: 'user-apex-01',
      isPlatformSuperAdmin: false,
    },
    async () => {
      const activeCtx = getTenantContext();
      assert(activeCtx !== undefined, 'Tenant context is active inside runWithTenantContext');
      assert(activeCtx?.tenantId === 'tenant-apex-mobility-001', 'Tenant ID is correctly isolated');
      assert(activeCtx?.tenantCode === 'APX', 'Tenant Code matches APX');

      // Test cross-tenant access rejection
      let crossTenantCaught = false;
      try {
        assertTenantOwnership(
          { tenantId: 'tenant-grace-cabs-001' },
          'Vehicle'
        );
      } catch (err: any) {
        if (err instanceof CrossTenantAccessError) {
          crossTenantCaught = true;
        }
      }
      assert(crossTenantCaught, 'assertTenantOwnership blocks cross-tenant resource access');

      // Test same-tenant access allowance
      let sameTenantAllowed = false;
      try {
        assertTenantOwnership(
          { tenantId: 'tenant-apex-mobility-001' },
          'Vehicle'
        );
        sameTenantAllowed = true;
      } catch {
        sameTenantAllowed = false;
      }
      assert(sameTenantAllowed, 'assertTenantOwnership allows access to same-tenant resource');
    }
  );

  // Outside context, should be undefined
  const outsideCtx = getTenantContext();
  assert(outsideCtx === undefined, 'Tenant context is cleanly cleared outside runWithTenantContext');

  // TEST SUITE 3: Quota Engine Tier Limits
  console.log('\n🔹 [Suite 3] Plan Entitlements & Quotas');
  assert(PLAN_LIMITS.BASIC.vehicles === 15, 'Basic Tier vehicle quota is hard-capped at 15');
  assert(PLAN_LIMITS.BASIC.drivers === 15, 'Basic Tier driver quota is hard-capped at 15');
  assert(PLAN_LIMITS.BASIC.companies === 3, 'Basic Tier company quota is hard-capped at 3');
  assert(PLAN_LIMITS.PRO.vehicles === 75, 'Pro Tier vehicle quota is 75');
  assert(PLAN_LIMITS.ENTERPRISE.vehicles >= 250, 'Enterprise Tier provides high-capacity vehicle fleet (250+)');

  // TEST SUITE 4: Dynamic Company Policy Engine & Danfoss Decoupling
  console.log('\n🔹 [Suite 4] Dynamic Company Policy Engine');

  // Test generic default policy
  const defaultPolicy = await getCompanyPolicy(undefined);
  assert(defaultPolicy.identity.allowedEmailDomains?.length === 0, 'Generic policy allows any email domain by default');
  assert(defaultPolicy.bookingRules.requireManagerApproval === false, 'Generic policy does not force manager approval');

  // Test Danfoss validation rules
  const danfossValidationPass = await validateRegistrationAgainstPolicy(
    'non-existent-generic-company',
    'employee@anycompany.com'
  );
  assert(danfossValidationPass.valid === true, 'Generic company allows valid standard registration');

  console.log('\n============================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('============================================================\n');

  await sequelize.close();

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
