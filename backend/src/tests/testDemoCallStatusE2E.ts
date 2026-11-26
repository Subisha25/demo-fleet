import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/dbConfig';
import { Tenant } from '../models/tenant';
import { TenantSubscription } from '../models/tenantSubscription';
import { TenantRegistrationRequest } from '../models/tenantRegistrationRequest';
import { TenantActivationToken } from '../models/tenantActivationToken';
import { calculateDemoCallStatus } from '../utils/demoCallUtils';
import { getAllTenants, getTenantById, getFleetInspectionProfile } from '../services/tenantService';
import { approveRegistrationRequest } from '../services/registrationService';
import { runWithTenantContext, ROOT_TENANT_ID, ROOT_TENANT_CODE } from '../context/tenantContext';

interface TestResult {
  suite: string;
  test: string;
  status: 'PASS' | 'FAIL';
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, test: string, suite: string, details?: string) {
  if (condition) {
    results.push({ suite, test, status: 'PASS', details });
    console.log(`  [PASS] ${test}`);
  } else {
    results.push({ suite, test, status: 'FAIL', details });
    console.error(`  [FAIL] ${test} - ${details || 'Assertion failed'}`);
  }
}

function mockResponse() {
  const res: any = {};
  res.statusCode = 200;
  res.data = null;
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload: any) => {
    res.data = payload;
    return res;
  };
  return res;
}

function mockRequest(params: any = {}, body: any = {}, query: any = {}, user: any = null) {
  return {
    params,
    body,
    query,
    user: user || {
      userId: 'superadmin-e2e',
      role: 'superadmin',
      isSuperAdmin: true,
      email: 'admin@cabz.com',
    },
    headers: {},
  } as any;
}

async function runTests() {
  await runWithTenantContext(
    {
      tenantId: ROOT_TENANT_ID,
      tenantCode: ROOT_TENANT_CODE,
      isPlatformSuperAdmin: true,
    },
    async () => {
      console.log('===============================================================');
      console.log('CABZ - SUPERADMIN DEMO CALL STATUS & INDEPENDENCE E2E SUITE');
      console.log('===============================================================\n');

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');

  // Format today, tomorrow, yesterday in Asia/Kolkata
  const kolkataNowStr = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now);

  console.log(`Current Server Time (Asia/Kolkata IST): ${kolkataNowStr}\n`);

  // -------------------------------------------------------------
  // SUITE 1: UNIT CALCULATIONS & TIME PARSING
  // -------------------------------------------------------------
  console.log('--- SUITE 1: Comprehensive Date/Time Parsing & Status Calculation ---');

  // 1. Tomorrow appointment -> ACTIVE
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomDateStr = `${pad(tomorrow.getDate())}-${pad(tomorrow.getMonth() + 1)}-${tomorrow.getFullYear()}`;
  const resTomorrow = calculateDemoCallStatus(tomDateStr, '11:00 AM', now);
  assert(resTomorrow.demoCallStatus === 'ACTIVE', 'Tomorrow 11:00 AM returns ACTIVE', 'Unit Calculations', `Got ${resTomorrow.demoCallStatus}`);

  // 2. Yesterday appointment -> INACTIVE
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yestDateStr = `${pad(yesterday.getDate())}-${pad(yesterday.getMonth() + 1)}-${yesterday.getFullYear()}`;
  const resYesterday = calculateDemoCallStatus(yestDateStr, '11:00 AM', now);
  assert(resYesterday.demoCallStatus === 'INACTIVE', 'Yesterday 11:00 AM returns INACTIVE', 'Unit Calculations', `Got ${resYesterday.demoCallStatus}`);

  // 3. Same Day Future Time (5 hours in future)
  const futureHourDate = new Date(now.getTime() + 5 * 60 * 60 * 1000);
  const sameDayDateStr = `${pad(futureHourDate.getDate())}-${pad(futureHourDate.getMonth() + 1)}-${futureHourDate.getFullYear()}`;
  const futureHours = futureHourDate.getHours();
  const futureMeridiem = futureHours >= 12 ? 'PM' : 'AM';
  const future12Hour = futureHours % 12 || 12;
  const futureTimeStr = `${pad(future12Hour)}:${pad(futureHourDate.getMinutes())} ${futureMeridiem}`;
  const resSameDayFuture = calculateDemoCallStatus(sameDayDateStr, futureTimeStr, now);
  assert(resSameDayFuture.demoCallStatus === 'ACTIVE', 'Same day future time returns ACTIVE (complete date-time comparison)', 'Unit Calculations', `Time: ${futureTimeStr}, Status: ${resSameDayFuture.demoCallStatus}`);

  // 4. Same Day Past Time (3 hours ago)
  const pastHourDate = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const sameDayPastDateStr = `${pad(pastHourDate.getDate())}-${pad(pastHourDate.getMonth() + 1)}-${pastHourDate.getFullYear()}`;
  const pastHours = pastHourDate.getHours();
  const pastMeridiem = pastHours >= 12 ? 'PM' : 'AM';
  const past12Hour = pastHours % 12 || 12;
  const pastTimeStr = `${pad(past12Hour)}:${pad(pastHourDate.getMinutes())} ${pastMeridiem}`;
  const resSameDayPast = calculateDemoCallStatus(sameDayPastDateStr, pastTimeStr, now);
  assert(resSameDayPast.demoCallStatus === 'INACTIVE', 'Same day past time returns INACTIVE (has already passed)', 'Unit Calculations', `Time: ${pastTimeStr}, Status: ${resSameDayPast.demoCallStatus}`);

  // 5. Missing date or time -> NOT SCHEDULED
  const resMissing = calculateDemoCallStatus(null, null, now);
  assert(resMissing.demoCallStatus === 'NOT SCHEDULED', 'Missing date and time returns NOT SCHEDULED', 'Unit Calculations');

  // 6. Slot range format support: "11:00 AM - 11:45 AM"
  const resSlot = calculateDemoCallStatus(tomDateStr, '11:00 AM - 11:45 AM', now);
  assert(resSlot.demoCallStatus === 'ACTIVE', 'Slot range format "11:00 AM - 11:45 AM" parses correctly to ACTIVE', 'Unit Calculations');

  // 7. YYYY-MM-DD ISO format support
  const tomIsoDate = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;
  const resIso = calculateDemoCallStatus(tomIsoDate, '02:30 PM', now);
  assert(resIso.demoCallStatus === 'ACTIVE', 'YYYY-MM-DD ISO date format parses correctly to ACTIVE', 'Unit Calculations');

  // -------------------------------------------------------------
  // SUITE 2: DATABASE INTEGRATION & API ENDPOINTS
  // -------------------------------------------------------------
  console.log('\n--- SUITE 2: Fleet Registration, Approval & API Resolution ---');

  const testCode = `DEMO${Date.now().toString().slice(-4)}`;
  const testEmail = `fleet_${testCode.toLowerCase()}@cabztesting.com`;
  let testRequestId: string = '';
  let createdTenantId: string = '';

  try {
    // 1. Create a TenantRegistrationRequest with tomorrow's demo appointment
    const regReq = await TenantRegistrationRequest.create({
      requestId: uuidv4(),
      fleetName: `${testCode} Apex Mobility`,
      displayName: `${testCode} Apex Mobility`,
      legalName: `${testCode} Apex Mobility Private Limited`,
      businessCode: testCode,
      ownerName: 'Vikramaditya Roy',
      contactEmail: testEmail,
      contactPhone: '+91 98765 43210',
      city: 'Bengaluru',
      state: 'Karnataka',
      requestedPlanTier: 'PRO',
      billingCycle: 'MONTHLY',
      demoCallDate: tomDateStr,
      demoCallTime: '11:00 AM',
      demoCallStatus: 'Requested',
      status: 'PENDING',
    });
    testRequestId = regReq.requestId;
    assert(!!testRequestId, 'Test registration request created with demo appointment', 'DB Integration');

    // 2. SuperAdmin Approves the Registration -> Tenant and 7-Day Free Trial Created
    const appReq = mockRequest({ requestId: testRequestId }, { reviewNotes: 'Approved for demo status test.' });
    const appRes = mockResponse();
    await approveRegistrationRequest(appReq, appRes);

    assert(appRes.statusCode === 200, 'SuperAdmin approves fleet registration (HTTP 200)', 'DB Integration');

    const updatedReg = await TenantRegistrationRequest.findByPk(testRequestId);
    createdTenantId = updatedReg?.tenantId || '';
    assert(!!createdTenantId, `Tenant provisioned with tenantId: ${createdTenantId}`, 'DB Integration');
    assert(updatedReg?.status === 'APPROVED', 'Registration status is APPROVED', 'DB Integration');

    // 3. Test getAllTenants API: Fleet List
    console.log('\n--- SUITE 3: SuperAdmin Fleet List (getAllTenants) Verification ---');
    const listReq = mockRequest();
    const listRes = mockResponse();
    await getAllTenants(listReq, listRes);

    assert(listRes.statusCode === 200, 'getAllTenants returns HTTP 200', 'Fleet List API');
    const returnedTenants = listRes.data?.tenants || [];
    const matchedTenant = returnedTenants.find((t: any) => t.tenantId === createdTenantId);
    assert(!!matchedTenant, 'Created fleet found in getAllTenants response', 'Fleet List API');
    assert(matchedTenant?.demoCallStatus === 'ACTIVE', 'Fleet List returns demoCallStatus === "ACTIVE"', 'Fleet List API', `Got: ${matchedTenant?.demoCallStatus}`);
    assert(matchedTenant?.demoCallDate === tomDateStr, `Fleet List returns demoCallDate === "${tomDateStr}"`, 'Fleet List API', `Got: ${matchedTenant?.demoCallDate}`);
    assert(matchedTenant?.demoCallTime === '11:00 AM', 'Fleet List returns demoCallTime === "11:00 AM"', 'Fleet List API', `Got: ${matchedTenant?.demoCallTime}`);
    assert(!!matchedTenant?.demoCall?.registrationDate, 'Fleet List demoCall includes registrationDate', 'Fleet List API');
    assert(!!matchedTenant?.demoCall?.approvalDate, 'Fleet List demoCall includes approvalDate', 'Fleet List API');

    // 4. Test getTenantById API
    console.log('\n--- SUITE 4: SuperAdmin Tenant Profile (getTenantById) Verification ---');
    const byIdReq = mockRequest({ tenantId: createdTenantId });
    const byIdRes = mockResponse();
    await getTenantById(byIdReq, byIdRes);

    assert(byIdRes.statusCode === 200, 'getTenantById returns HTTP 200', 'Tenant Profile API');
    assert(byIdRes.data?.data?.demoCallStatus === 'ACTIVE', 'getTenantById returns demoCallStatus === "ACTIVE"', 'Tenant Profile API');
    assert(byIdRes.data?.data?.demoCall?.demoCallDate === tomDateStr, 'getTenantById returns correct demoCallDate', 'Tenant Profile API');

    // 5. Test getFleetInspectionProfile API: Fleet Inspection Details
    console.log('\n--- SUITE 5: SuperAdmin Fleet Inspection Profile Verification ---');
    const inspectReq = mockRequest({ tenantId: createdTenantId });
    const inspectRes = mockResponse();
    await getFleetInspectionProfile(inspectReq, inspectRes);

    assert(inspectRes.statusCode === 200, 'getFleetInspectionProfile returns HTTP 200', 'Fleet Inspection API');
    const inspectData = inspectRes.data?.data;
    assert(inspectData?.demoCallStatus === 'ACTIVE', 'Fleet Inspection returns demoCallStatus === "ACTIVE"', 'Fleet Inspection API', `Got: ${inspectData?.demoCallStatus}`);
    assert(inspectData?.demoCallDate === tomDateStr, 'Fleet Inspection returns demoCallDate', 'Fleet Inspection API');
    assert(inspectData?.demoCallTime === '11:00 AM', 'Fleet Inspection returns demoCallTime', 'Fleet Inspection API');
    assert(!!inspectData?.demoCall?.formattedAppointment, 'Fleet Inspection returns formatted appointment', 'Fleet Inspection API', `Got: ${inspectData?.demoCall?.formattedAppointment}`);
    assert(!!inspectData?.registrationDate, 'Fleet Inspection data includes registrationDate', 'Fleet Inspection API');
    assert(!!inspectData?.approvalDate, 'Fleet Inspection data includes approvalDate', 'Fleet Inspection API');

    // -------------------------------------------------------------
    // SUITE 6: DYNAMIC TRANSITION TO INACTIVE & TRIAL INDEPENDENCE
    // -------------------------------------------------------------
    console.log('\n--- SUITE 6: Dynamic Transition to INACTIVE & Strict Trial Independence ---');

    // Update registration request demoCallDate to yesterday (simulating appointment passing)
    await updatedReg?.update({
      demoCallDate: yestDateStr,
      demoCallTime: '10:00 AM',
    });

    const listRes2 = mockResponse();
    await getAllTenants(listReq, listRes2);
    const matchedTenant2 = (listRes2.data?.tenants || []).find((t: any) => t.tenantId === createdTenantId);
    assert(matchedTenant2?.demoCallStatus === 'INACTIVE', 'When appointment has passed, demoCallStatus dynamically transitions to "INACTIVE"', 'Status Transition', `Got: ${matchedTenant2?.demoCallStatus}`);

    // Verify Fleet Inspection Profile also reflects INACTIVE
    const inspectRes2 = mockResponse();
    await getFleetInspectionProfile(inspectReq, inspectRes2);
    assert(inspectRes2.data?.data?.demoCallStatus === 'INACTIVE', 'Fleet Inspection Profile dynamically reflects "INACTIVE"', 'Status Transition');

    // CRITICAL SAAS REGRESSION RULE:
    // Verify that Free Trial status remains active and unaffected by Demo Call becoming INACTIVE
    const sub = await TenantSubscription.findOne({ where: { tenantId: createdTenantId } });
    assert(sub?.status === 'TRIALING', 'TenantSubscription status remains strictly "TRIALING"', 'Trial Independence', `Sub status: ${sub?.status}`);
    assert(matchedTenant2?.trialStatus === 'TRIAL_ACTIVE', 'Fleet List trialStatus remains strictly "TRIAL_ACTIVE"', 'Trial Independence', `Trial status: ${matchedTenant2?.trialStatus}`);
    assert(matchedTenant2?.status === 'ACTIVE', 'Tenant status remains strictly "ACTIVE"', 'Trial Independence', `Tenant status: ${matchedTenant2?.status}`);

    // -------------------------------------------------------------
    // SUITE 7: UNCONFIGURED DEMO CALL -> NOT SCHEDULED
    // -------------------------------------------------------------
    console.log('\n--- SUITE 7: Unconfigured Demo Call -> NOT SCHEDULED ---');

    await updatedReg?.update({
      demoCallDate: null,
      demoCallTime: null,
    });

    const listRes3 = mockResponse();
    await getAllTenants(listReq, listRes3);
    const matchedTenant3 = (listRes3.data?.tenants || []).find((t: any) => t.tenantId === createdTenantId);
    assert(matchedTenant3?.demoCallStatus === 'NOT SCHEDULED', 'Fleet with null demo call date/time returns "NOT SCHEDULED"', 'Unscheduled Handling', `Got: ${matchedTenant3?.demoCallStatus}`);

  } catch (err: any) {
    console.error('Test execution error:', err);
    assert(false, `Unexpected exception: ${err.message}`, 'Execution');
  } finally {
    // Clean up created test data
    console.log('\n--- Cleaning up test records ---');
    if (createdTenantId) {
      await TenantActivationToken.destroy({ where: { tenantId: createdTenantId } });
      await TenantSubscription.destroy({ where: { tenantId: createdTenantId } });
      await Tenant.destroy({ where: { tenantId: createdTenantId } });
    }
    if (testRequestId) {
      await TenantRegistrationRequest.destroy({ where: { requestId: testRequestId } });
    }
    console.log('Test cleanup complete.');
  }

  // Summary
  console.log('\n===============================================================');
  console.log('CABZ TEST SUMMARY');
  console.log('===============================================================');
  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  console.log(`Total Assertions: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
    }
  );
}

runTests().then(() => {
  console.log('All tests passed successfully.');
  process.exit(0);
}).catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
