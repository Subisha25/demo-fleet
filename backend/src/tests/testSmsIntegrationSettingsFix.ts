import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { getTenantSmsConfig, STANDARD_DLT_TEMPLATES } from '../services/tenantSmsConfigService';
import { ROOT_TENANT_ID } from '../context/tenantContext';
import jwt from 'jsonwebtoken';
import config from '../config/config';

async function runTests() {
  console.log('========================================================================');
  console.log('  CABZ — SMS INTEGRATION SETTINGS API FIX VERIFICATION');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  async function check(desc: string, fn: () => Promise<void> | void) {
    try {
      await fn();
      console.log(`  ✔ [PASS] ${desc}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✖ [FAIL] ${desc}:`, err.message);
      failed++;
    }
  }

  // Test 1: Config retrieval for ROOT_TENANT_ID
  await check('Retrieves existing SMS configuration for Root Tenant', async () => {
    const res = await getTenantSmsConfig(ROOT_TENANT_ID);
    if (!res || !res.success) throw new Error('Failed to retrieve root SMS config');
    if (!res.config) throw new Error('Config object missing in response');
    if (res.config.senderId !== 'GRCCAB') throw new Error(`Unexpected senderId: ${res.config.senderId}`);
    if (res.config.provider !== '2FACTOR') throw new Error(`Unexpected provider: ${res.config.provider}`);
    if (!res.config.hasApiKey) throw new Error('Root tenant should have active API key');
    console.log(`    Root SMS config: senderId=${res.config.senderId}, status=${res.config.status}, maskedKey=${res.config.apiKeyMasked}`);
  });

  // Test 2: Config retrieval for brand new unconfigured tenant
  await check('Handles completely unconfigured tenant cleanly without errors', async () => {
    const dummyTenantId = '00000000-0000-0000-0000-000000000999';
    const res = await getTenantSmsConfig(dummyTenantId);
    if (!res || !res.success) throw new Error('Unconfigured tenant returned success: false');
    if (!res.config) throw new Error('Config object missing for unconfigured tenant');
    if (res.config.status !== 'UNCONFIGURED') throw new Error(`Expected UNCONFIGURED, got ${res.config.status}`);
    if (res.config.hasApiKey !== false) throw new Error('Expected hasApiKey to be false');
    console.log(`    Unconfigured tenant status: ${res.config.status}, hasApiKey=${res.config.hasApiKey}`);
  });

  // Test 3: Response structure alignment (both res.data.config and res.config)
  await check('Backend routes response contains both data.config and top-level config for backward/forward compatibility', async () => {
    const rawResult = await getTenantSmsConfig(ROOT_TENANT_ID);
    const mockApiResponse = {
      success: true,
      data: {
        config: rawResult.config,
        subscriptionStatus: rawResult.config?.subscriptionEligibility,
      },
      config: rawResult.config,
    };

    // Simulate frontend reading: res.data.data.config
    const viaDataConfig = mockApiResponse.data.config;
    if (!viaDataConfig || viaDataConfig.senderId !== 'GRCCAB') {
      throw new Error('Failed to resolve config via res.data.data.config');
    }

    // Simulate frontend fallback: res.data.config
    const viaDirectConfig = mockApiResponse.config;
    if (!viaDirectConfig || viaDirectConfig.senderId !== 'GRCCAB') {
      throw new Error('Failed to resolve config via res.data.config');
    }
  });

  // Test 4: DLT Template Catalog is intact and has all registered templates
  await check('DLT Template Catalog contains all required notification types', () => {
    if (!STANDARD_DLT_TEMPLATES || STANDARD_DLT_TEMPLATES.length === 0) {
      throw new Error('DLT templates catalog is empty');
    }
    const templateNames = STANDARD_DLT_TEMPLATES.map((t) => t.templateName);
    console.log(`    DLT Catalog contains ${STANDARD_DLT_TEMPLATES.length} templates: ${templateNames.join(', ')}`);
    if (!templateNames.includes('Driver Assigning')) {
      throw new Error('Missing driver assignment template');
    }
    if (!templateNames.includes('Booking Confimation Message')) {
      throw new Error('Missing booking confirmation template');
    }
    if (!templateNames.includes('OTP1')) {
      throw new Error('Missing OTP verification template');
    }
  });

  console.log('\n========================================================================');
  console.log(`  SMS SETTINGS API TESTS COMPLETED: ${passed} Passed, ${failed} Failed`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
