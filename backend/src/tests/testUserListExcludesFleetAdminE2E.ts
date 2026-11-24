import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { User } from '../models/user';
import { Company } from '../models/company';
import { Employee } from '../models/employee';
import { Tenant } from '../models/tenant';
import { TenantRegistrationRequest } from '../models/tenantRegistrationRequest';
import { TenantActivationToken } from '../models/tenantActivationToken';
import { ROOT_TENANT_ID } from '../context/tenantContext';
import { getAllUsers, getUsersByStatus, getUsersByConfirmationStatus, getUsersByGender } from '../services/userServices';
import { getFilteredUsers } from '../services/userfilterServices';
import { submitFleetRegistration, approveRegistrationRequest, completeAccountActivation } from '../services/registrationService';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

function mockReqRes(query = {}, headers = {}, body = {}, params = {}) {
  const req: any = {
    query,
    headers,
    body,
    params,
    tenantId: ROOT_TENANT_ID,
  };
  let statusCode = 200;
  let responseData: any = null;
  const res: any = {
    status: (code: number) => {
      statusCode = code;
      return res;
    },
    json: (data: any) => {
      responseData = data;
      return res;
    },
  };
  return { req, res, getResult: () => ({ statusCode, responseData }) };
}

async function runTest() {
  console.log('--- Starting User List & Fleet Registration Filtering Test ---');
  let testCompany: any = null;
  let normalUser: any = null;
  let fleetAdminUser: any = null;
  let superadminUser: any = null;
  let orphanUser: any = null;
  let testTenant: any = null;
  let registrationRecord: any = null;

  try {
    // 1. Get or create a test Company
    let company = await Company.findOne();
    if (!company) {
      company = await Company.create({
        companyId: uuidv4(),
        companyName: 'Test Corporate Client Inc',
        tenantId: ROOT_TENANT_ID,
        email: 'corp@testclient.com',
        mobile: '9876543210',
        status: 'active',
      });
      console.log('Created test company:', company.companyId);
    } else {
      console.log('Using existing company:', company.companyName, company.companyId);
    }
    testCompany = company;

    // 2. Create test users
    const uniqueSuffix = Date.now().toString().slice(-6);

    // Normal user (Belongs to Company, role: 'user')
    normalUser = await User.create({
      userId: uuidv4(),
      username: `NormalCorporateUser_${uniqueSuffix}`,
      email: `normaluser_${uniqueSuffix}@corp.com`,
      mobile: `9111${uniqueSuffix}`,
      password: await bcrypt.hash('secret123', 10),
      companyId: testCompany.companyId,
      role: 'user',
      tenantId: ROOT_TENANT_ID,
      status: 'active',
      isConfirmed: true,
    });
    console.log('Created normal corporate user:', normalUser.username, normalUser.userId);

    // Fleet Admin user (companyId: null, role: 'fleet_admin')
    fleetAdminUser = await User.create({
      userId: uuidv4(),
      username: `FleetAdminUser_${uniqueSuffix}`,
      email: `fleetadmin_${uniqueSuffix}@fleet.com`,
      mobile: `9222${uniqueSuffix}`,
      password: await bcrypt.hash('secret123', 10),
      companyId: null,
      role: 'fleet_admin',
      tenantId: ROOT_TENANT_ID,
      status: 'active',
      isConfirmed: true,
    });
    console.log('Created fleet admin user:', fleetAdminUser.username, fleetAdminUser.userId);

    // SuperAdmin user (companyId: null, role: 'superadmin')
    superadminUser = await User.create({
      userId: uuidv4(),
      username: `SuperAdminUser_${uniqueSuffix}`,
      email: `superadmin_${uniqueSuffix}@platform.com`,
      mobile: `9333${uniqueSuffix}`,
      password: await bcrypt.hash('secret123', 10),
      companyId: null,
      role: 'superadmin',
      tenantId: ROOT_TENANT_ID,
      status: 'active',
      isConfirmed: true,
    });
    console.log('Created superadmin user:', superadminUser.username, superadminUser.userId);

    // Orphan user (companyId: null, role: 'user')
    orphanUser = await User.create({
      userId: uuidv4(),
      username: `OrphanUser_${uniqueSuffix}`,
      email: `orphan_${uniqueSuffix}@test.com`,
      mobile: `9444${uniqueSuffix}`,
      password: await bcrypt.hash('secret123', 10),
      companyId: null,
      role: 'user',
      tenantId: ROOT_TENANT_ID,
      status: 'active',
      isConfirmed: true,
    });
    console.log('Created orphan user (no company):', orphanUser.username, orphanUser.userId);

    // 3. Test getAllUsers endpoint
    console.log('\n--- Testing getAllUsers ---');
    const { req: req1, res: res1, getResult: getRes1 } = mockReqRes();
    await getAllUsers(req1, res1);
    const result1 = getRes1();

    if (result1.statusCode !== 200 || !result1.responseData?.success) {
      throw new Error(`getAllUsers failed with status ${result1.statusCode}: ${JSON.stringify(result1.responseData)}`);
    }

    const returnedUsers: any[] = result1.responseData.data;
    console.log(`getAllUsers returned ${returnedUsers.length} users.`);

    const foundNormal = returnedUsers.some(u => u.userId === normalUser.userId);
    const foundFleetAdmin = returnedUsers.some(u => u.userId === fleetAdminUser.userId);
    const foundSuperadmin = returnedUsers.some(u => u.userId === superadminUser.userId);
    const foundOrphan = returnedUsers.some(u => u.userId === orphanUser.userId);

    console.log(`- Normal Corporate User in list: ${foundNormal} (Expected: true)`);
    console.log(`- Fleet Admin User in list: ${foundFleetAdmin} (Expected: false)`);
    console.log(`- SuperAdmin User in list: ${foundSuperadmin} (Expected: false)`);
    console.log(`- Orphan User in list: ${foundOrphan} (Expected: false)`);

    if (!foundNormal) throw new Error('FAIL: Normal corporate user was not found in getAllUsers!');
    if (foundFleetAdmin) throw new Error('FAIL: Fleet Admin appeared in getAllUsers!');
    if (foundSuperadmin) throw new Error('FAIL: SuperAdmin appeared in getAllUsers!');
    if (foundOrphan) throw new Error('FAIL: Orphan user (no company) appeared in getAllUsers!');

    // Check that every returned user has a companyId and company association
    for (const u of returnedUsers) {
      if (!u.companyId) {
        throw new Error(`FAIL: User ${u.userId} (${u.username}) has no companyId!`);
      }
      if (['fleet_admin', 'superadmin', 'admin'].includes(u.role)) {
        throw new Error(`FAIL: User ${u.userId} (${u.username}) has role ${u.role}!`);
      }
    }
    console.log('✓ PASS: All returned users have valid company and valid roles!');

    // 3b. Test getUsersByStatus, getUsersByConfirmationStatus, getUsersByGender
    console.log('\n--- Testing Status, Confirmation, Gender Endpoints ---');
    const { req: reqStatus, res: resStatus, getResult: getResStatus } = mockReqRes({}, {}, {}, { status: 'active' });
    await getUsersByStatus(reqStatus, resStatus);
    const statusUsers: any[] = getResStatus().responseData.data;
    if (!statusUsers.some(u => u.userId === normalUser.userId)) throw new Error('FAIL: Normal user not in getUsersByStatus!');
    if (statusUsers.some(u => u.userId === fleetAdminUser.userId)) throw new Error('FAIL: Fleet Admin in getUsersByStatus!');
    console.log('✓ PASS: getUsersByStatus correctly includes normal user and excludes fleet admin.');

    const { req: reqConf, res: resConf, getResult: getResConf } = mockReqRes({}, {}, {}, { confirmed: 'true' });
    await getUsersByConfirmationStatus(reqConf, resConf);
    const confUsers: any[] = getResConf().responseData.data;
    if (!confUsers.some(u => u.userId === normalUser.userId)) throw new Error('FAIL: Normal user not in getUsersByConfirmationStatus!');
    if (confUsers.some(u => u.userId === fleetAdminUser.userId)) throw new Error('FAIL: Fleet Admin in getUsersByConfirmationStatus!');
    console.log('✓ PASS: getUsersByConfirmationStatus correctly includes normal user and excludes fleet admin.');

    // 4. Test getFilteredUsers endpoint
    console.log('\n--- Testing getFilteredUsers ---');
    const { req: req2, res: res2, getResult: getRes2 } = mockReqRes({ search: normalUser.username });
    await getFilteredUsers(req2, res2);
    const result2 = getRes2();

    const filteredUsers: any[] = result2.responseData.data;
    console.log(`getFilteredUsers for search="${normalUser.username}" returned ${filteredUsers.length} users.`);
    const filteredFoundNormal = filteredUsers.some(u => u.userId === normalUser.userId);
    if (!filteredFoundNormal) throw new Error('FAIL: Normal user not returned in search filter!');
    console.log('✓ PASS: Normal user found by name in getFilteredUsers.');

    // Search for fleet admin name in getFilteredUsers
    const { req: req3, res: res3, getResult: getRes3 } = mockReqRes({ search: fleetAdminUser.username });
    await getFilteredUsers(req3, res3);
    const result3 = getRes3();
    const filteredFleetAdmin: any[] = result3.responseData.data;
    console.log(`getFilteredUsers for search="${fleetAdminUser.username}" returned ${filteredFleetAdmin.length} users.`);
    if (filteredFleetAdmin.length > 0) {
      throw new Error('FAIL: Fleet Admin appeared in search results of getFilteredUsers!');
    }
    console.log('✓ PASS: Fleet Admin NOT returned in getFilteredUsers search.');

    // 5. Test Fleet Registration -> Approval -> Account Activation Workflow
    console.log('\n--- Testing Fleet Registration & Activation Lifecycle ---');
    const adminEmail = `fleet_applicant_${uniqueSuffix}@example.com`;
    const adminPhone = `9555${uniqueSuffix}`;
    const regReqData = {
      fleetName: `TestFleetFlow_${uniqueSuffix}`,
      businessCode: `BF${uniqueSuffix.slice(-4)}`,
      ownerName: `Owner_${uniqueSuffix}`,
      contactEmail: adminEmail,
      contactPhone: adminPhone,
      adminName: `Admin_${uniqueSuffix}`,
      adminEmail: adminEmail,
      adminPhone: adminPhone,
      city: 'Chennai',
      state: 'Tamil Nadu',
      notes: 'Automated test registration',
      status: 'pending' as const,
    };

    const registration = await TenantRegistrationRequest.create({
      requestId: uuidv4(),
      ...regReqData,
    });
    registrationRecord = registration;
    console.log('Created registration request:', registration.requestId);

    // Verify it is NOT in User list
    const { req: req4, res: res4, getResult: getRes4 } = mockReqRes();
    await getAllUsers(req4, res4);
    const check4 = getRes4().responseData.data;
    const foundApplicantBeforeActivation = check4.some((u: any) => u.email === regReqData.adminEmail);
    console.log(`Applicant in User List while pending: ${foundApplicantBeforeActivation} (Expected: false)`);
    if (foundApplicantBeforeActivation) throw new Error('FAIL: Pending registration applicant appeared in User List!');

    // Simulate SuperAdmin Approval & Account Activation
    const crypto = await import('crypto');
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const tokenRecord = await TenantActivationToken.create({
      tokenId: uuidv4(),
      tokenHash,
      tenantId: ROOT_TENANT_ID,
      adminEmail: regReqData.adminEmail,
      adminPhone: regReqData.adminPhone,
      adminName: regReqData.adminName,
      expiresAt: new Date(Date.now() + 86400000),
    });

    const activateReq = {
      body: {
        token: rawToken,
        password: 'Password@123',
        confirmPassword: 'Password@123',
        phone: regReqData.adminPhone,
      }
    };
    const { res: activateRes, getResult: getActivateRes } = mockReqRes({}, {}, activateReq.body);
    await completeAccountActivation(activateReq as any, activateRes);
    const activateResult = getActivateRes();
    console.log('Activation response status:', activateResult.statusCode);

    // Check Employee was created for login
    const activatedEmployee = await Employee.findOne({ where: { email: regReqData.adminEmail } });
    console.log('Activated Employee created:', !!activatedEmployee, 'Role:', activatedEmployee?.role);
    if (!activatedEmployee) throw new Error('FAIL: Activated fleet admin Employee record was not created!');

    // Now re-check User List!
    const { req: req5, res: res5, getResult: getRes5 } = mockReqRes();
    await getAllUsers(req5, res5);
    const check5 = getRes5().responseData.data;
    const foundApplicantAfterActivation = check5.some((u: any) => u.email === regReqData.adminEmail);
    console.log(`Applicant in User List AFTER activation: ${foundApplicantAfterActivation} (Expected: false)`);
    if (foundApplicantAfterActivation) {
      throw new Error('FAIL: Activated Fleet Admin appeared in User List!');
    }
    console.log('✓ PASS: Activated Fleet Admin does NOT appear in normal User List!');

    // Also check Employee password verification for Fleet Admin login
    const isPasswordValid = await bcrypt.compare('Password@123', activatedEmployee.password);
    console.log('Fleet Admin password match for login:', isPasswordValid);
    if (!isPasswordValid) throw new Error('FAIL: Fleet Admin login password comparison failed!');
    console.log('✓ PASS: Fleet Admin login credentials intact.');

    console.log('\n======================================================');
    console.log('ALL TESTS PASSED SUCCESSFULLY!');
    console.log('======================================================\n');

  } finally {
    // Cleanup test data created during test
    console.log('Cleaning up test records...');
    if (normalUser) await normalUser.destroy({ force: true }).catch(() => {});
    if (fleetAdminUser) await fleetAdminUser.destroy({ force: true }).catch(() => {});
    if (superadminUser) await superadminUser.destroy({ force: true }).catch(() => {});
    if (orphanUser) await orphanUser.destroy({ force: true }).catch(() => {});
    if (registrationRecord) {
      await Employee.destroy({ where: { email: registrationRecord.adminEmail }, force: true }).catch(() => {});
      await User.destroy({ where: { email: registrationRecord.adminEmail }, force: true }).catch(() => {});
      await TenantActivationToken.destroy({ where: { adminEmail: registrationRecord.adminEmail }, force: true }).catch(() => {});
      await TenantRegistrationRequest.destroy({ where: { requestId: registrationRecord.requestId }, force: true }).catch(() => {});
    }
    console.log('Cleanup completed.');
  }
}

runTest().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error('Test FAILED with error:', err);
  process.exit(1);
});
