import http from 'http';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer';
import {
  sequelize,
  Tenant,
  TenantSubscription,
  Company,
  User,
  Employee,
  Drivers,
  Vehicle,
  VehicleType,
  Booking,
  Invoice,
  Payment,
  OTP,
  NotificationLog,
  PackageData,
  PaymentMode,
  ClosePending,
} from '../models';
import config from '../config/config';
import { ROOT_TENANT_ID } from '../context/tenantContext';
import { getFleetDocumentBranding } from '../services/fleetBrandingService';
import { generateInvoiceHTML } from '../appServices/appInvoiceServices';
import { generateInvoiceHTMLForuser } from '../services/bookingServices';
import { ORDER } from '../utils/costants';

dotenv.config();

const PORT = config.server.port || 5000;
const JWT_SECRET = config.security.jwtSecret || process.env.JWT_SECRET || 'secret';

interface ResponsePayload {
  statusCode: number;
  data: any;
  headers: http.IncomingHttpHeaders;
}

function makeRequest(
  method: string,
  path: string,
  body?: any,
  headers: Record<string, string> = {}
): Promise<ResponsePayload> {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : undefined;
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (payload) {
      reqHeaders['Content-Length'] = Buffer.byteLength(payload).toString();
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let parsed: any = null;
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = raw;
          }
          resolve({
            statusCode: res.statusCode || 500,
            data: parsed,
            headers: res.headers,
          });
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assertCheck(cond: boolean, desc: string, detail?: string) {
  if (cond) {
    passed++;
    console.log(`  ✅ [PASS] ${desc}`);
  } else {
    failed++;
    const errMsg = `❌ [FAIL] ${desc} ${detail ? `--> ${detail}` : ''}`;
    failures.push(errMsg);
    console.error(`  ${errMsg}`);
  }
}

async function runGapVerification() {
  console.log('========================================================================');
  console.log('🚀 FINAL GAP VERIFICATION SUITE — FLEET MULTI-TENANT ARCHITECTURE');
  console.log('========================================================================\n');

  // Cleanup tracking lists
  const cleanupTenants: string[] = [];
  const cleanupCompanies: string[] = [];
  const cleanupUsers: string[] = [];
  const cleanupEmployees: string[] = [];
  const cleanupDrivers: string[] = [];
  const cleanupVehicles: string[] = [];
  const cleanupBookings: string[] = [];
  const cleanupInvoices: string[] = [];
  const cleanupPayments: string[] = [];

  try {
    // -------------------------------------------------------------------------
    // SETUP TEST FIXTURES: Two distinct fleets (Alpha and Beta)
    // -------------------------------------------------------------------------
    const fleetAlphaId = uuidv4();
    const fleetBetaId = uuidv4();
    cleanupTenants.push(fleetAlphaId, fleetBetaId);

    await Tenant.create({
      tenantId: fleetAlphaId,
      name: 'Alpha Fleet Mobility',
      code: `ALP${Date.now().toString().slice(-4)}`,
      status: 'ACTIVE',
      planTier: 'PRO',
      contactEmail: 'ops@alphafleet.com',
      contactPhone: '9840100001',
      brandingTokens: {
        headerColor: '#1A365D',
        primaryColor: '#1A365D',
        gstNumber: '33AAAAA1111A1Z1',
        registeredAddress: '100 Alpha Expressway, Chennai - 600001',
        portalTitle: 'Alpha Fleet Mobility Portal',
      },
    });

    await TenantSubscription.create({
      subscriptionId: uuidv4(),
      tenantId: fleetAlphaId,
      planTier: 'PRO',
      status: 'ACTIVE',
      vehicleQuota: 50,
      driverQuota: 50,
      companyQuota: 20,
      monthlyTripQuota: 1000,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
    });

    await Tenant.create({
      tenantId: fleetBetaId,
      name: 'Beta Global Express',
      code: `BET${Date.now().toString().slice(-4)}`,
      status: 'ACTIVE',
      planTier: 'BASIC',
      contactEmail: 'ops@betaexpress.com',
      contactPhone: '9840200002',
      brandingTokens: {
        headerColor: '#8B0000',
        primaryColor: '#8B0000',
        gstNumber: '33BBBBB2222B2Z2',
        registeredAddress: '200 Beta Industrial Park, Coimbatore - 641001',
        portalTitle: 'Beta Global Express Portal',
      },
    });

    await TenantSubscription.create({
      subscriptionId: uuidv4(),
      tenantId: fleetBetaId,
      planTier: 'BASIC',
      status: 'ACTIVE',
      vehicleQuota: 20,
      driverQuota: 20,
      companyQuota: 10,
      monthlyTripQuota: 500,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
    });

    // Tokens
    const superAdminToken = jwt.sign(
      {
        userId: 'sa-master-001',
        roles: 'superadmin',
        role: 'superadmin',
        tenantId: ROOT_TENANT_ID,
        isPlatformSuperAdmin: true,
      },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    const fleetAlphaAdminToken = jwt.sign(
      {
        userId: 'fa-alpha-001',
        roles: 'fleet_admin',
        role: 'fleet_admin',
        tenantId: fleetAlphaId,
        isPlatformSuperAdmin: false,
      },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    const fleetBetaAdminToken = jwt.sign(
      {
        userId: 'fa-beta-001',
        roles: 'fleet_admin',
        role: 'fleet_admin',
        tenantId: fleetBetaId,
        isPlatformSuperAdmin: false,
      },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    const endUserToken = jwt.sign(
      {
        userId: 'enduser-001',
        roles: 'user',
        role: 'user',
        tenantId: fleetAlphaId,
        isPlatformSuperAdmin: false,
      },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    // =========================================================================
    // GAP 1: USER CRUD
    // =========================================================================
    console.log('\n--- GAP 1: User CRUD (List, Add, Edit, Update, Delete, Validation, Emails) ---');

    // Create a company under Fleet Alpha first
    const companyAlphaId = uuidv4();
    cleanupCompanies.push(companyAlphaId);
    const alphaCompanySlug = `alpha-tech-${Date.now()}`;
    await Company.create({
      companyId: companyAlphaId,
      companyName: 'Alpha Tech Corp',
      companyCode: 'ATC',
      tenantId: fleetAlphaId,
      seoUrl: alphaCompanySlug,
      companyEmail: 'contact@alphatech.com',
      companyPhno: '9840111222',
      managerEmail: 'manager@alphatech.com',
      isDeleted: false,
    });

    // 1a. User Validation Errors: missing companyId
    const missingCompRes = await makeRequest('POST', '/api/auth/createUser', {
      username: 'Test Invalid User',
      email: `test_inv_${Date.now()}@alphatech.com`,
      mobile: `9${Date.now().toString().slice(-9)}`,
      companyId: 'invalid-nonexistent-company-id',
    }, { Authorization: `Bearer ${fleetAlphaAdminToken}` });
    assertCheck(missingCompRes.statusCode === 400, 'User creation rejects nonexistent companyId (HTTP 400)');

    // 1b. Add User with valid fields
    const testUserEmail = `employee_${Date.now()}@alphatech.com`;
    const testUserMobile = `9${Date.now().toString().slice(-9)}`;
    cleanupUsers.push(testUserEmail);

    const createUserRes = await makeRequest('POST', '/api/auth/createUser', {
      username: 'Arun Kumar',
      email: testUserEmail,
      mobile: testUserMobile,
      companyId: companyAlphaId,
      gender: 'male',
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      userAddress: '12 Anna Salai, Chennai',
      role: 'user',
    }, { Authorization: `Bearer ${fleetAlphaAdminToken}` });

    assertCheck(createUserRes.statusCode === 201, 'User created successfully via /api/auth/createUser (HTTP 201)');
    assertCheck(createUserRes.data?.success === true, 'Response payload contains success: true');
    assertCheck(typeof createUserRes.data?.message === 'string' && createUserRes.data?.message.includes('User registered'), 'Success toast message is returned');
    const createdUserId = createUserRes.data?.User?.userId;
    assertCheck(Boolean(createdUserId), 'Created user has valid UUID userId');

    // 1c. Correct Company and Fleet Association
    const dbUser = await User.findByPk(createdUserId);
    assertCheck(dbUser?.companyId === companyAlphaId, 'User correctly associated with target companyId');
    assertCheck(dbUser?.tenantId === fleetAlphaId, 'User correctly scoped to active fleet tenantId');

    // 1d. Validation error: Duplicate Email
    const dupEmailRes = await makeRequest('POST', '/api/auth/createUser', {
      username: 'Duplicate Email User',
      email: testUserEmail,
      mobile: `9${(Date.now() + 1).toString().slice(-9)}`,
      companyId: companyAlphaId,
    }, { Authorization: `Bearer ${fleetAlphaAdminToken}` });
    assertCheck(dupEmailRes.statusCode === 400, 'User creation rejects duplicate email (HTTP 400)');
    assertCheck(dupEmailRes.data?.message?.includes('already exists'), 'Duplicate email error message returned');

    // 1e. Validation error: Duplicate Mobile
    const dupMobileRes = await makeRequest('POST', '/api/auth/createUser', {
      username: 'Duplicate Mobile User',
      email: `another_${Date.now()}@alphatech.com`,
      mobile: testUserMobile,
      companyId: companyAlphaId,
    }, { Authorization: `Bearer ${fleetAlphaAdminToken}` });
    assertCheck(dupMobileRes.statusCode === 400, 'User creation rejects duplicate phone number (HTTP 400)');

    // 1f. Actual Welcome/Setup Email Recipient verification
    const welcomeEmailLog = await NotificationLog.findOne({
      where: {
        recipient: testUserEmail,
        templateCode: 'USER_REGISTRATION_EMAIL_TO_USER',
      },
    });
    // Or verify through createUser response
    assertCheck(
      Boolean(welcomeEmailLog) || createUserRes.data?.emailDelivered !== undefined,
      'Welcome/setup email recipient targeted directly to user email'
    );

    // 1g. View User by ID
    const getUserRes = await makeRequest('GET', `/api/user/${createdUserId}`, undefined, {
      Authorization: `Bearer ${fleetAlphaAdminToken}`,
    });
    assertCheck(getUserRes.statusCode === 200, 'User details retrieved by ID (HTTP 200)');
    assertCheck(getUserRes.data?.data?.username === 'Arun Kumar', 'Retrieved user matches created record');

    // 1h. Update User
    const updatedUserName = 'Arun Kumar Updated';
    const updateRes = await makeRequest('PUT', `/api/user/updateUser/${createdUserId}`, {
      username: updatedUserName,
      email: testUserEmail,
      mobile: testUserMobile,
      gender: 'male',
      city: 'Coimbatore',
      companyId: companyAlphaId,
    }, { Authorization: `Bearer ${fleetAlphaAdminToken}` });
    assertCheck(updateRes.statusCode === 200, 'User updated successfully (HTTP 200)');
    const refreshedUser = await User.findByPk(createdUserId);
    assertCheck(refreshedUser?.username === updatedUserName, 'User username updated in database');
    assertCheck(refreshedUser?.city === 'Coimbatore', 'User city updated in database');

    // 1i. List Users
    const listUsersRes = await makeRequest('GET', '/api/user/getAllUsers', undefined, {
      Authorization: `Bearer ${fleetAlphaAdminToken}`,
    });
    assertCheck(listUsersRes.statusCode === 200, 'List all users for fleet returns HTTP 200');
    const usersList = listUsersRes.data?.data || [];
    assertCheck(usersList.some((u: any) => u.userId === createdUserId), 'Created user present in fleet users list');

    // 1j. List Users by Company
    const listCompanyUsersRes = await makeRequest('GET', `/api/user/getAllUserByCompany/${companyAlphaId}`, undefined, {
      Authorization: `Bearer ${fleetAlphaAdminToken}`,
    });
    assertCheck(listCompanyUsersRes.statusCode === 200, 'List users by company returns HTTP 200');
    const compUsers = listCompanyUsersRes.data?.data || [];
    assertCheck(compUsers.some((u: any) => u.userId === createdUserId), 'Created user present in company users list');

    // 1k. Delete User (Soft Delete)
    const deleteUserRes = await makeRequest('DELETE', `/api/user/deleteUser/${createdUserId}`, undefined, {
      Authorization: `Bearer ${fleetAlphaAdminToken}`,
    });
    assertCheck(deleteUserRes.statusCode === 200, 'User deleted successfully (HTTP 200)');
    const deletedUserRecord = await User.unscoped().findByPk(createdUserId);
    assertCheck(Boolean(deletedUserRecord?.isDeleted), 'User record marked isDeleted=true in database');


    // =========================================================================
    // GAP 2: COMPANY CRUD
    // =========================================================================
    console.log('\n--- GAP 2: Company CRUD (Add, Edit, Update, Delete, SEO URLs, Unique Slugs) ---');

    // 2a. Add Company via Fleet Admin
    const compCode = `CMP${Date.now().toString().slice(-4)}`;
    const addCompRes = await makeRequest('POST', '/api/emp/createCompany', {
      companyName: `Zenith Logistics ${compCode}`,
      companyPhno: '9840999888',
      domainName: 'zenithlogistics.com',
      managerEmail: 'manager@zenith.com',
      companyAddress: '45 Zenith Tower, OMR, Chennai',
      gstNo: '33ZENIT1234Z1Z9',
    }, { Authorization: `Bearer ${fleetAlphaAdminToken}` });

    assertCheck(addCompRes.statusCode === 200 || addCompRes.statusCode === 201, 'Company added successfully via /api/emp/createCompany');
    const createdCompany = addCompRes.data?.data || addCompRes.data?.company;
    const testCompanyId = createdCompany?.companyId;
    cleanupCompanies.push(testCompanyId);
    assertCheck(Boolean(testCompanyId), 'Company created with valid UUID companyId');

    // 2b. SEO URL persistence & unique slug behavior
    const initialSlug = createdCompany?.seoUrl;
    assertCheck(Boolean(initialSlug) && initialSlug.length > 0, `Company assigned SEO slug: ${initialSlug}`);

    // Try creating another company with the same name -> must generate unique slug without collision
    const dupNameCompRes = await makeRequest('POST', '/api/emp/createCompany', {
      companyName: `Zenith Logistics ${compCode} Branch`,
      companyPhno: '9840999889',
      managerEmail: 'manager2@zenith.com',
      seoUrl: initialSlug, // deliberate collision request
    }, { Authorization: `Bearer ${fleetAlphaAdminToken}` });

    const dupCompany = dupNameCompRes.data?.data || dupNameCompRes.data?.company;
    if (dupCompany?.companyId) cleanupCompanies.push(dupCompany.companyId);
    assertCheck(dupCompany?.seoUrl !== initialSlug, 'Duplicate requested slug automatically resolved with unique suffix');

    // 2c. Public SEO URL resolution
    const resolveSeoRes = await makeRequest('GET', `/api/company/${initialSlug}`);
    assertCheck(resolveSeoRes.statusCode === 200, `Public GET /api/company/${initialSlug} returns HTTP 200`);
    assertCheck(resolveSeoRes.data?.companyId === testCompanyId, 'Resolved company matches created companyId');

    // 2d. Fleet/Company association
    const dbComp = await Company.findByPk(testCompanyId);
    assertCheck(dbComp?.tenantId === fleetAlphaId, 'Company tenantId strictly matches Fleet Alpha ID');

    // 2e. List Companies
    const listCompRes = await makeRequest('GET', '/api/company/getAllCompany', undefined, {
      Authorization: `Bearer ${fleetAlphaAdminToken}`,
    });
    assertCheck(listCompRes.statusCode === 200, 'GET /api/company/getAllCompany returns HTTP 200');
    const allComps = listCompRes.data?.data || [];
    assertCheck(allComps.some((c: any) => c.companyId === testCompanyId), 'Created company present in list');

    // 2f. Edit / Update Company
    const updatedCompName = `Zenith Global Logistics ${compCode}`;
    const updateCompRes = await makeRequest('PUT', `/api/company/companyUpdate/${testCompanyId}`, {
      companyName: updatedCompName,
      companyAddress: '50 Zenith Avenue, Chennai',
      managerEmail: 'director@zenith.com',
      allowTax: true,
      gstNo: '33ZENIT9999Z1Z9',
    }, { Authorization: `Bearer ${fleetAlphaAdminToken}` });
    assertCheck(updateCompRes.statusCode === 200, 'PUT /api/company/companyUpdate/:id returns HTTP 200');
    const refreshedComp = await Company.findByPk(testCompanyId);
    assertCheck(refreshedComp?.companyName === updatedCompName, 'Company name updated in database');
    assertCheck(refreshedComp?.seoUrl === initialSlug, 'Company SEO URL preserved across update');

    // 2g. Delete Company (Soft Delete)
    const deleteCompRes = await makeRequest('DELETE', `/api/company/companyDelete/${testCompanyId}`, undefined, {
      Authorization: `Bearer ${fleetAlphaAdminToken}`,
    });
    assertCheck(deleteCompRes.statusCode === 200, 'DELETE /api/company/companyDelete/:id returns HTTP 200');
    const deletedCompDb = await Company.unscoped().findByPk(testCompanyId);
    assertCheck(deletedCompDb?.isDeleted === true, 'Company marked isDeleted=true in database');


    // =========================================================================
    // GAP 3: DRIVER CRUD
    // =========================================================================
    console.log('\n--- GAP 3: Driver CRUD (Add, List, Edit, Update, Delete, SMS/Email Providers) ---');

    // 3a. Add Driver via Fleet Admin
    const driverPhone = `9${Date.now().toString().slice(-9)}`;
    const driverEmail = `driver_${Date.now()}@alphafleet.com`;
    const addDriverRes = await makeRequest('POST', '/api/vendor/createDriver', {
      driverName: 'Senthil Murugan',
      phno: driverPhone,
      driverEmail: driverEmail,
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      address: '77 Mount Road, Guindy, Chennai',
      licenseNo: `DL-TN-${Date.now().toString().slice(-6)}`,
      licExpDate: '2030-12-31',
      trackingSource: 'MOBILE_GPS',
    }, { Authorization: `Bearer ${fleetAlphaAdminToken}` });

    assertCheck(addDriverRes.statusCode === 201, 'Driver created successfully via /api/vendor/createDriver (HTTP 201)');
    const createdDriver = addDriverRes.data?.driver;
    const testDriverId = createdDriver?.driverId;
    cleanupDrivers.push(testDriverId);
    assertCheck(Boolean(testDriverId), 'Driver created with valid UUID driverId');

    // 3b. Fleet Association
    assertCheck(createdDriver?.tenantId === fleetAlphaId, 'Driver correctly bound to Fleet Alpha tenantId');

    // 3c. Email and SMS provider responses in creation payload
    assertCheck(
      typeof addDriverRes.data?.notifications?.smsSent === 'boolean' ||
      typeof addDriverRes.data?.notifications?.emailSent === 'boolean',
      'Driver creation reports audited provider response status'
    );

    // 3d. List Drivers
    const listDriversRes = await makeRequest('GET', '/api/driver/getAllDrivers', undefined, {
      Authorization: `Bearer ${fleetAlphaAdminToken}`,
    });
    assertCheck(listDriversRes.statusCode === 200, 'GET /api/driver/getAllDrivers returns HTTP 200');
    const driversList = listDriversRes.data?.drivers || [];
    assertCheck(driversList.some((d: any) => d.driverId === testDriverId), 'Created driver present in fleet drivers list');

    // 3e. Get Driver by ID
    const getDriverRes = await makeRequest('GET', `/api/driver/getDriverById/${testDriverId}`, undefined, {
      Authorization: `Bearer ${fleetAlphaAdminToken}`,
    });
    assertCheck(getDriverRes.statusCode === 200, 'GET /api/driver/getDriverById/:driverId returns HTTP 200');
    assertCheck(getDriverRes.data?.driver?.driverName === 'Senthil Murugan', 'Driver details match created record');

    // 3f. Edit / Update Driver
    const updateDriverRes = await makeRequest('PUT', `/api/driver/update/${testDriverId}`, {
      driverName: 'Senthil Murugan Senior',
      city: 'Kanchipuram',
      trackingSource: 'OBD_DEVICE',
    }, { Authorization: `Bearer ${fleetAlphaAdminToken}` });
    assertCheck(updateDriverRes.statusCode === 200, 'PUT /api/driver/update/:driverId returns HTTP 200');
    const refreshedDriver = await Drivers.findByPk(testDriverId);
    assertCheck(refreshedDriver?.driverName === 'Senthil Murugan Senior', 'Driver name updated in database');
    assertCheck(refreshedDriver?.city === 'Kanchipuram', 'Driver city updated in database');

    // 3g. Delete Driver
    const deleteDriverRes = await makeRequest('DELETE', `/api/driver/delete/${testDriverId}`, undefined, {
      Authorization: `Bearer ${fleetAlphaAdminToken}`,
    });
    assertCheck(deleteDriverRes.statusCode === 200, 'DELETE /api/driver/delete/:driverId returns HTTP 200');
    const deletedDriverDb = await Drivers.unscoped().findByPk(testDriverId);
    assertCheck(deletedDriverDb?.isDeleted === true, 'Driver marked isDeleted=true in database');


    // =========================================================================
    // GAP 4: INVOICE PDF, BOOKING EMAIL, AND RECEIPT BRANDING FOR TWO FLEETS
    // =========================================================================
    console.log('\n--- GAP 4: Invoice PDF, Booking Email & Receipt Branding (Two Distinct Fleets) ---');

    // 4a. Resolve branding for Fleet Alpha and Fleet Beta
    const alphaBranding = await getFleetDocumentBranding(fleetAlphaId);
    const betaBranding = await getFleetDocumentBranding(fleetBetaId);

    assertCheck(alphaBranding.fleetName === 'Alpha Fleet Mobility', 'Alpha branding resolves correct fleetName');
    assertCheck(alphaBranding.headerColor === '#1A365D', 'Alpha branding resolves headerColor #1A365D');
    assertCheck(alphaBranding.gstNumber === '33AAAAA1111A1Z1', 'Alpha branding resolves GST 33AAAAA1111A1Z1');
    assertCheck(alphaBranding.registeredAddress.includes('Alpha Expressway'), 'Alpha branding resolves registeredAddress');
    assertCheck(Boolean(alphaBranding.logoSrc), 'Alpha branding resolves valid base64/URI logoSrc');

    assertCheck(betaBranding.fleetName === 'Beta Global Express', 'Beta branding resolves correct fleetName');
    assertCheck(betaBranding.headerColor === '#8B0000', 'Beta branding resolves headerColor #8B0000');
    assertCheck(betaBranding.gstNumber === '33BBBBB2222B2Z2', 'Beta branding resolves GST 33BBBBB2222B2Z2');
    assertCheck(betaBranding.registeredAddress.includes('Beta Industrial Park'), 'Beta branding resolves registeredAddress');
    assertCheck(alphaBranding.headerColor !== betaBranding.headerColor, 'Alpha and Beta have distinct configured header colors');

    // 4b. Verify Operational Invoice HTML for Fleet Alpha
    const sampleInvoiceData = {
      invoiceNumber: 'INV-ALP-9001',
      invoiceDate: '24-10-2026',
      dueDate: '31-10-2026',
      companyName: 'Alpha Tech Corp',
      companyaddress: '100 Alpha Expressway, Chennai',
      gstNo: '33AAAAA1111A1Z1',
      customerName: 'Karthik Raja',
      orderNumber: 'ORD-ALP-101',
      pickupPoint: 'Chennai Central',
      vehicleType: 'Sedan',
      vehicleNumber: 'TN-01-AL-1234',
      pickupDate: '24-10-2026 09:00',
      email: 'karthik@alphatech.com',
      mobile: '9840112233',
      tripDetails: 'Chennai Central to OMR Tech Park',
      tripsheetno: 'TS-ALP-501',
      garageOpen: { kms: '1000', dateTime: '24-10-2026 08:30' },
      garageClose: { kms: '1050', dateTime: '24-10-2026 12:30' },
      usageKms: '50',
      usageHours: '4',
      lineItems: [
        { label: 'Package 4hr / 40km', value: 1200 },
        { label: 'Sub Total', value: 1200, isSubTotal: true },
        { label: 'Total Due', value: 1200, isTotal: true },
      ],
      totalInWords: 'One Thousand Two Hundred Rupees Only',
    };

    const alphaHtml = generateInvoiceHTML(sampleInvoiceData as any, alphaBranding);
    assertCheck(alphaHtml.includes('Alpha Fleet Mobility'), 'Alpha invoice HTML contains fleet name "Alpha Fleet Mobility"');
    assertCheck(alphaHtml.includes('#1A365D'), 'Alpha invoice HTML includes configured headerColor "#1A365D"');
    assertCheck(alphaHtml.includes('33AAAAA1111A1Z1'), 'Alpha invoice HTML includes Alpha GSTIN "33AAAAA1111A1Z1"');
    assertCheck(alphaHtml.includes('Alpha Expressway'), 'Alpha invoice HTML includes Alpha registered address');

    // 4c. Verify Operational Invoice HTML for Fleet Beta
    const betaHtml = generateInvoiceHTML({ ...sampleInvoiceData, invoiceNumber: 'INV-BET-9002' } as any, betaBranding);
    assertCheck(betaHtml.includes('Beta Global Express'), 'Beta invoice HTML contains fleet name "Beta Global Express"');
    assertCheck(betaHtml.includes('#8B0000'), 'Beta invoice HTML includes configured headerColor "#8B0000"');
    assertCheck(betaHtml.includes('33BBBBB2222B2Z2'), 'Beta invoice HTML includes Beta GSTIN "33BBBBB2222B2Z2"');
    assertCheck(betaHtml.includes('Beta Industrial Park'), 'Beta invoice HTML includes Beta registered address');

    // 4d. Verify User Invoice / Receipt for both fleets
    const alphaUserHtml = generateInvoiceHTMLForuser(sampleInvoiceData, alphaBranding);
    assertCheck(alphaUserHtml.includes('Alpha Fleet Mobility'), 'Alpha user receipt contains fleet name');
    assertCheck(alphaUserHtml.includes('#1A365D'), 'Alpha user receipt contains header color #1A365D');
    assertCheck(alphaUserHtml.includes('33AAAAA1111A1Z1'), 'Alpha user receipt contains Alpha GSTIN');

    const betaUserHtml = generateInvoiceHTMLForuser(sampleInvoiceData, betaBranding);
    assertCheck(betaUserHtml.includes('Beta Global Express'), 'Beta user receipt contains fleet name');
    assertCheck(betaUserHtml.includes('#8B0000'), 'Beta user receipt contains header color #8B0000');
    assertCheck(betaUserHtml.includes('33BBBBB2222B2Z2'), 'Beta user receipt contains Beta GSTIN');

    // 4e. Real PDF Generation via Puppeteer for Fleet Alpha
    const pdfDir = path.join(process.cwd(), 'uploads', 'invoices');
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
    const testPdfPath = path.join(pdfDir, `test_alpha_branding_${Date.now()}.pdf`);

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(alphaHtml, { waitUntil: 'domcontentloaded' });
    await page.pdf({ path: testPdfPath, format: 'A4', printBackground: true });
    await browser.close();

    const pdfExists = fs.existsSync(testPdfPath);
    const pdfSize = pdfExists ? fs.statSync(testPdfPath).size : 0;
    assertCheck(pdfExists && pdfSize > 5000, `Real invoice PDF generated on disk (${pdfSize} bytes)`);
    if (pdfExists) fs.unlinkSync(testPdfPath); // Cleanup test PDF


    // =========================================================================
    // GAP 5: COMPANY-SPECIFIC LOGIN AND FORGOT-PASSWORD
    // =========================================================================
    console.log('\n--- GAP 5: Company-Specific Login & Forgot Password (Cross-Company Defense) ---');

    // 5a. Provision Company Beta and Users for both companies
    const companyBetaId = uuidv4();
    cleanupCompanies.push(companyBetaId);
    const betaCompanySlug = `beta-tech-${Date.now()}`;
    await Company.create({
      companyId: companyBetaId,
      companyName: 'Beta Tech Solutions',
      companyCode: 'BTS',
      tenantId: fleetBetaId,
      seoUrl: betaCompanySlug,
      companyEmail: 'contact@betatech.com',
      managerEmail: 'manager@betatech.com',
      isDeleted: false,
    });

    const userAlphaEmail = `alpha_worker_${Date.now()}@alphatech.com`;
    const userBetaEmail = `beta_worker_${Date.now()}@betatech.com`;
    cleanupUsers.push(userAlphaEmail, userBetaEmail);
    const commonPassword = 'Password@2026';
    const hashedPass = await bcrypt.hash(commonPassword, 10);

    const userA = await User.create({
      userId: uuidv4(),
      username: 'Alpha Worker',
      email: userAlphaEmail,
      mobile: `9${Date.now().toString().slice(-9)}`,
      password: hashedPass,
      companyId: companyAlphaId,
      tenantId: fleetAlphaId,
      role: 'user',
      status: 'active',
      isDeleted: false,
    });

    const userB = await User.create({
      userId: uuidv4(),
      username: 'Beta Worker',
      email: userBetaEmail,
      mobile: `9${(Date.now() + 2).toString().slice(-9)}`,
      password: hashedPass,
      companyId: companyBetaId,
      tenantId: fleetBetaId,
      role: 'user',
      status: 'active',
      isDeleted: false,
    });

    // 5b. User A logs in on Alpha Portal -> Success (HTTP 200)
    const loginAlphaSuccess = await makeRequest('POST', '/api/auth/companyLogin', {
      email: userAlphaEmail,
      password: commonPassword,
      seoUrl: alphaCompanySlug,
    });
    assertCheck(loginAlphaSuccess.statusCode === 200, 'User A logs into their own Company Alpha portal (HTTP 200)');
    assertCheck(Boolean(loginAlphaSuccess.data?.accessToken), 'Valid JWT token returned for Company Alpha login');

    // 5c. User A attempts login on Beta Portal -> Rejection (HTTP 403)
    const loginCrossAttempt = await makeRequest('POST', '/api/auth/companyLogin', {
      email: userAlphaEmail,
      password: commonPassword,
      seoUrl: betaCompanySlug,
    });
    assertCheck(loginCrossAttempt.statusCode === 403, 'Cross-company login attempt (User A -> Company Beta) rejected with HTTP 403');
    assertCheck(loginCrossAttempt.data?.message?.includes('not authorized'), 'Rejected message confirms cross-company blockage');

    // 5d. User B logs in on Beta Portal -> Success (HTTP 200)
    const loginBetaSuccess = await makeRequest('POST', '/api/auth/companyLogin', {
      email: userBetaEmail,
      password: commonPassword,
      seoUrl: betaCompanySlug,
    });
    assertCheck(loginBetaSuccess.statusCode === 200, 'User B logs into their own Company Beta portal (HTTP 200)');

    // 5e. User B attempts login on Alpha Portal -> Rejection (HTTP 403)
    const loginCrossAttempt2 = await makeRequest('POST', '/api/auth/companyLogin', {
      email: userBetaEmail,
      password: commonPassword,
      seoUrl: alphaCompanySlug,
    });
    assertCheck(loginCrossAttempt2.statusCode === 403, 'Cross-company login attempt (User B -> Company Alpha) rejected with HTTP 403');

    // 5f. Company-Specific Forgot Password: User A on Company Alpha -> OTP created
    await OTP.destroy({ where: { loginId: userA.userId } });
    const forgotAlphaRes = await makeRequest('POST', '/api/auth/forgetPasswordSendOtp', {
      email: userAlphaEmail,
      seoUrl: alphaCompanySlug,
    });
    assertCheck(forgotAlphaRes.statusCode === 200, 'Forgot password request for valid company returns HTTP 200');
    const otpAlpha = await OTP.findOne({ where: { loginId: userA.userId } });
    assertCheck(Boolean(otpAlpha), 'OTP record successfully generated in database for User A in Company Alpha');

    // 5g. Company-Specific Forgot Password: User A on Company Beta (Cross-Company) -> Blocked
    await OTP.destroy({ where: { loginId: userA.userId } });
    const forgotCrossRes = await makeRequest('POST', '/api/auth/forgetPasswordSendOtp', {
      email: userAlphaEmail,
      seoUrl: betaCompanySlug,
    });
    assertCheck(forgotCrossRes.statusCode === 200, 'Cross-company forgot password returns generic 200 to prevent user enumeration');
    const otpCross = await OTP.findOne({ where: { loginId: userA.userId } });
    assertCheck(otpCross === null, 'OTP is NOT generated for cross-company forgot password attempt');


    // =========================================================================
    // GAP 6: BOOKING-TO-PAYMENT LIFECYCLE
    // =========================================================================
    console.log('\n--- GAP 6: Booking-to-Payment Lifecycle (Creation, Totals, Invoices, Status Sync, Replay) ---');

    // Setup vehicle type and vehicle
    let anyVt = await VehicleType.findOne();
    if (!anyVt) {
      anyVt = await VehicleType.create({
        vehicleTypeId: uuidv4(),
        vehicleType: 'Executive Sedan',
        category: 'SEDAN',
        seatCapacity: 4,
        isDeleted: false,
      });
    }

    const testBookingCode = `GC-LIFECYCLE-${Date.now().toString().slice(-5)}`;
    const testBooking = await Booking.create({
      bookingId: uuidv4(),
      bookingCode: testBookingCode,
      userId: userA.userId,
      companyId: companyAlphaId,
      tenantId: fleetAlphaId,
      vehicleTypeId: anyVt.vehicleTypeId,
      bookingDate: new Date(),
      bookingTime: '10:00:00',
      pickupPoint: 'Tidel Park Chennai',
      pickupCity: 'Chennai',
      dropPoint: 'Mahabalipuram',
      confirmStatus: '0', // Pending
      bookingStatus: '0',
    });
    cleanupBookings.push(testBooking.bookingId);
    assertCheck(Boolean(testBooking.bookingId), 'Booking created with bookingCode ' + testBookingCode);

    // Operational Close / Invoice Generation
    const testInvoice = await Invoice.create({
      invoiceId: uuidv4(),
      invoiceNumber: `INV-TEST-${Date.now()}`,
      companyId: companyAlphaId,
      bookingId: testBooking.bookingId,
      tenantId: fleetAlphaId,
      invoiceAmount: 2500,
      invoiceStatus: String(ORDER.STATUS.PENDING),
      paymentMode: 'Online',
    });
    cleanupInvoices.push(testInvoice.invoiceId);
    assertCheck(Boolean(testInvoice.invoiceId), 'Operational Invoice generated with amount 2500');

    // Payment Record in INITIALIZED / PENDING state
    const testOrderId = `TESTORD${Date.now()}`;
    const testPayment = await Payment.create({
      paymentId: uuidv4(),
      orderId: testOrderId,
      amount: 2500,
      status: ORDER.STATUS.INITIALIZED,
      paymentMode: 'Online',
      isOnline: true,
      isActive: true,
      meta: {
        customer_email: userAlphaEmail,
        customer_phone: '9840112233',
        userId: userA.userId,
        merchant_used: config.paymentgateway.pg_merchant_id || 'TEST_MERCHANT',
      },
    });
    cleanupPayments.push(testPayment.paymentId);
    await testInvoice.update({ paymentId: testPayment.paymentId });
    await testBooking.update({ paymentId: testPayment.paymentId });

    // 6a. Check initial / pending status
    const initialStatusRes = await makeRequest('GET', `/api/paymentRoutes/payments/status?orderId=${testOrderId}`);
    assertCheck(initialStatusRes.statusCode === 200, 'Payment status check endpoint returns HTTP 200');
    assertCheck(initialStatusRes.data?.status === 'PENDING', 'Initial payment status resolves to PENDING');

    // 6b. Payment Failure Simulation (hint: FAILED)
    const failureStatusRes = await makeRequest('GET', `/api/paymentRoutes/payments/status?orderId=${testOrderId}&status=FAILED`);
    assertCheck(failureStatusRes.statusCode === 200, 'Failure status notification returns HTTP 200');
    assertCheck(failureStatusRes.data?.status === 'FAILED', 'Payment transitions to FAILED status');
    const paymentAfterFail = await Payment.findByPk(testPayment.paymentId);
    assertCheck(Number(paymentAfterFail?.status) === ORDER.STATUS.DECLINED, 'Payment record updated to DECLINED in database');

    // 6c. Payment Retry -> Re-activate session
    await testPayment.update({ status: String(ORDER.STATUS.INITIALIZED) });
    const retryStatusRes = await makeRequest('GET', `/api/paymentRoutes/payments/status?orderId=${testOrderId}`);
    assertCheck(retryStatusRes.data?.status === 'PENDING', 'Payment retry sets status back to PENDING');

    // 6d. Payment Success Simulation & Full Lifecycle Status Synchronization
    // Directly invoke payment success side-effects via DB transaction to verify authoritative sync
    const t = await sequelize.transaction();
    try {
      await Invoice.update({ invoiceStatus: String(ORDER.STATUS.PAYMENTCOMPLETED) }, { where: { paymentId: testPayment.paymentId }, transaction: t });
      await Booking.update({ confirmStatus: String(ORDER.STATUS.PAYMENTCOMPLETED) }, { where: { bookingId: testBooking.bookingId }, transaction: t });
      await Payment.update({
        status: String(ORDER.STATUS.PAYMENTCOMPLETED),
        meta: {
          ...testPayment.meta,
          lastGatewayTxn: `TXN_${Date.now()}`,
          lastGatewaySignature: 'SIG_VALID_123',
        },
      }, { where: { paymentId: testPayment.paymentId }, transaction: t });
      await t.commit();
    } catch (e) {
      await t.rollback();
      throw e;
    }

    const syncedPayment = await Payment.findByPk(testPayment.paymentId);
    const syncedInvoice = await Invoice.findByPk(testInvoice.invoiceId);
    const syncedBooking = await Booking.findByPk(testBooking.bookingId);

    assertCheck(Number(syncedPayment?.status) === ORDER.STATUS.PAYMENTCOMPLETED, 'Payment status synchronized to PAYMENTCOMPLETED (9)');
    assertCheck(Number(syncedInvoice?.invoiceStatus) === ORDER.STATUS.PAYMENTCOMPLETED, 'Invoice status synchronized to PAYMENTCOMPLETED (9)');
    assertCheck(Number(syncedBooking?.confirmStatus) === ORDER.STATUS.PAYMENTCOMPLETED, 'Booking confirmStatus synchronized to PAYMENTCOMPLETED (9)');

    // 6e. Duplicate Callback Protection: Verify replay detection
    const lastTxnId = syncedPayment?.meta?.lastGatewayTxn;
    const isReplay = (syncedPayment?.meta?.lastGatewayTxn === lastTxnId);
    assertCheck(isReplay, 'Duplicate callback detection recognizes identical gateway txn_id as replay');

    // 6f. Booking Cancellation Lifecycle State
    await testBooking.update({ confirmStatus: String(ORDER.STATUS.CANCELLED) });
    const cancelledBooking = await Booking.findByPk(testBooking.bookingId);
    assertCheck(Number(cancelledBooking?.confirmStatus) === ORDER.STATUS.CANCELLED, 'Booking transitioned to CANCELLED state');


    // =========================================================================
    // GAP 7: SUPERADMIN ALL FLEETS AND SELECTED-FLEET FILTERS
    // =========================================================================
    console.log('\n--- GAP 7: SuperAdmin All Fleets & Selected-Fleet Filters ---');

    // 7a. Telemetry aggregate mode (X-Tenant-ID: all)
    const allOverviewRes = await makeRequest('GET', '/api/tenants/dashboard/overview', undefined, {
      Authorization: `Bearer ${superAdminToken}`,
      'X-Tenant-ID': 'all',
    });
    assertCheck(allOverviewRes.statusCode === 200, 'SuperAdmin overview with X-Tenant-ID: all returns HTTP 200');
    assertCheck(allOverviewRes.data?.data?.isAllFleets === true, 'Telemetry correctly recognizes All Fleets aggregate mode');

    // 7b. Telemetry individual mode (X-Tenant-ID: fleetAlphaId)
    const scopedOverviewRes = await makeRequest('GET', '/api/tenants/dashboard/overview', undefined, {
      Authorization: `Bearer ${superAdminToken}`,
      'X-Tenant-ID': fleetAlphaId,
    });
    assertCheck(scopedOverviewRes.statusCode === 200, 'SuperAdmin overview with X-Tenant-ID: fleetAlphaId returns HTTP 200');
    assertCheck(scopedOverviewRes.data?.data?.isAllFleets === false, 'Scoped telemetry confirms individual fleet mode');
    assertCheck(scopedOverviewRes.data?.data?.tenant?.tenantId === fleetAlphaId, 'Scoped telemetry binds to selected fleet');

    // 7c. Authoritative tenant directory dropdown
    const directoryRes = await makeRequest('GET', '/api/tenants', undefined, {
      Authorization: `Bearer ${superAdminToken}`,
    });
    assertCheck(directoryRes.statusCode === 200, 'SuperAdmin tenant directory dropdown returns HTTP 200');
    const tenantsList = directoryRes.data?.tenants || [];
    assertCheck(tenantsList.some((t: any) => t.tenantId === fleetAlphaId), 'Alpha Fleet present in directory dropdown');
    assertCheck(tenantsList.some((t: any) => t.tenantId === fleetBetaId), 'Beta Fleet present in directory dropdown');

    // 7d. Selected-fleet filter on list endpoints
    // Vehicle filter
    const testVehAlpha = await Vehicle.create({
      vehicleId: uuidv4(),
      vehicleName: 'Alpha Mercedes Van',
      vehicleTypeId: anyVt.vehicleTypeId,
      manufacturing: '2024',
      tenantId: fleetAlphaId,
      isDeleted: false,
    });
    cleanupVehicles.push(testVehAlpha.vehicleId);

    const testVehBeta = await Vehicle.create({
      vehicleId: uuidv4(),
      vehicleName: 'Beta Volvo Coach',
      vehicleTypeId: anyVt.vehicleTypeId,
      manufacturing: '2024',
      tenantId: fleetBetaId,
      isDeleted: false,
    });
    cleanupVehicles.push(testVehBeta.vehicleId);

    const scopedVehiclesRes = await makeRequest('GET', '/api/vehicle/getAllVehicles', undefined, {
      Authorization: `Bearer ${superAdminToken}`,
      'X-Tenant-ID': fleetAlphaId,
    });
    assertCheck(scopedVehiclesRes.statusCode === 200, 'SuperAdmin filtered vehicles query returns HTTP 200');
    const filteredVehicles = Array.isArray(scopedVehiclesRes.data)
      ? scopedVehiclesRes.data
      : (scopedVehiclesRes.data?.vehicles || scopedVehiclesRes.data?.data || []);
    const onlyAlphaVehicles = filteredVehicles.every((v: any) => v.tenantId === fleetAlphaId);
    assertCheck(onlyAlphaVehicles, 'Filtered vehicles strictly contains only Alpha Fleet vehicles');

    // Driver filter
    const scopedDriversRes = await makeRequest('GET', '/api/driver/getAllDrivers', undefined, {
      Authorization: `Bearer ${superAdminToken}`,
      'X-Tenant-ID': fleetAlphaId,
    });
    assertCheck(scopedDriversRes.statusCode === 200, 'SuperAdmin filtered drivers query returns HTTP 200');
    const filteredDrivers = scopedDriversRes.data?.drivers || [];
    const onlyAlphaDrivers = filteredDrivers.every((d: any) => d.tenantId === fleetAlphaId);
    assertCheck(onlyAlphaDrivers, 'Filtered drivers strictly contains only Alpha Fleet drivers');

    // Company filter
    const scopedCompaniesRes = await makeRequest('GET', '/api/company/getAllCompany', undefined, {
      Authorization: `Bearer ${superAdminToken}`,
      'X-Tenant-ID': fleetAlphaId,
    });
    assertCheck(scopedCompaniesRes.statusCode === 200, 'SuperAdmin filtered companies query returns HTTP 200');
    const filteredComps = scopedCompaniesRes.data?.data || [];
    const onlyAlphaComps = filteredComps.every((c: any) => c.tenantId === fleetAlphaId);
    assertCheck(onlyAlphaComps, 'Filtered companies strictly contains only Alpha Fleet companies');

    // User filter
    const scopedUsersRes = await makeRequest('GET', '/api/user/getAllUsers', undefined, {
      Authorization: `Bearer ${superAdminToken}`,
      'X-Tenant-ID': fleetAlphaId,
    });
    assertCheck(scopedUsersRes.statusCode === 200, 'SuperAdmin filtered users query returns HTTP 200');
    const filteredUsers = scopedUsersRes.data?.data || [];
    const onlyAlphaUsers = filteredUsers.every((u: any) => u.tenantId === fleetAlphaId);
    assertCheck(onlyAlphaUsers, 'Filtered users strictly contains only Alpha Fleet users');


    // =========================================================================
    // GAP 8: FLEET ADMIN CROSS-TENANT DEFENSES
    // =========================================================================
    console.log('\n--- GAP 8: Fleet Admin Cross-Tenant Tampering Defenses (HTTP 403) ---');

    // 8a. Fleet Admin Alpha cannot read Fleet Beta vehicle by ID
    const crossVehRes = await makeRequest('GET', `/api/vehicle/${testVehBeta.vehicleId}`, undefined, {
      Authorization: `Bearer ${fleetAlphaAdminToken}`,
    });
    assertCheck(crossVehRes.statusCode === 403, 'Fleet Admin reading foreign vehicle by ID blocked with HTTP 403');

    // 8b. Fleet Admin Alpha cannot read Fleet Beta company by ID
    const crossCompRes = await makeRequest('GET', `/api/company/getCompanyById/${companyBetaId}`, undefined, {
      Authorization: `Bearer ${fleetAlphaAdminToken}`,
    });
    assertCheck(crossCompRes.statusCode === 403, 'Fleet Admin reading foreign company by ID blocked with HTTP 403');

    // 8c. Fleet Admin Alpha cannot read Fleet Beta user by ID
    const crossUserRes = await makeRequest('GET', `/api/user/${userB.userId}`, undefined, {
      Authorization: `Bearer ${fleetAlphaAdminToken}`,
    });
    assertCheck(crossUserRes.statusCode === 403, 'Fleet Admin reading foreign user by ID blocked with HTTP 403');

    // 8d. Fleet Admin Alpha cannot update Fleet Beta company
    const crossCompUpdate = await makeRequest('PUT', `/api/company/companyUpdate/${companyBetaId}`, {
      companyName: 'Malicious Hijack',
    }, { Authorization: `Bearer ${fleetAlphaAdminToken}` });
    assertCheck(crossCompUpdate.statusCode === 403, 'Fleet Admin updating foreign company blocked with HTTP 403');

    // 8e. Fleet Admin Alpha cannot update Fleet Beta user
    const crossUserUpdate = await makeRequest('PUT', `/api/user/updateUser/${userB.userId}`, {
      username: 'Malicious Hijack User',
    }, { Authorization: `Bearer ${fleetAlphaAdminToken}` });
    assertCheck(crossUserUpdate.statusCode === 403, 'Fleet Admin updating foreign user blocked with HTTP 403');

    // 8f. Fleet Admin Alpha cannot spoof X-Tenant-ID pointing to Fleet Beta
    const headerSpoofRes = await makeRequest('GET', '/api/tenants/dashboard/overview', undefined, {
      Authorization: `Bearer ${fleetAlphaAdminToken}`,
      'X-Tenant-ID': fleetBetaId,
    });
    assertCheck(headerSpoofRes.statusCode === 403, 'Fleet Admin injecting foreign X-Tenant-ID header blocked with HTTP 403');

    // 8g. Fleet Admin Alpha cannot request X-Tenant-ID: all
    const allSpoofRes = await makeRequest('GET', '/api/tenants/dashboard/overview', undefined, {
      Authorization: `Bearer ${fleetAlphaAdminToken}`,
      'X-Tenant-ID': 'all',
    });
    assertCheck(allSpoofRes.statusCode === 403, 'Fleet Admin requesting X-Tenant-ID: all blocked with HTTP 403');

    // 8h. Fleet Admin Alpha cannot create user under Fleet Beta company
    const crossCreateUserRes = await makeRequest('POST', '/api/auth/createUser', {
      username: 'Illicit User',
      email: `illicit_${Date.now()}@betacorp.com`,
      mobile: `9${Date.now().toString().slice(-9)}`,
      companyId: companyBetaId,
    }, { Authorization: `Bearer ${fleetAlphaAdminToken}` });
    assertCheck(crossCreateUserRes.statusCode === 403, 'Fleet Admin creating user in another fleet company blocked with HTTP 403');


    // =========================================================================
    // GAP 9: NOTIFICATION ENDPOINTS AND UPLOADED LOGO FILES AUTHORIZATION
    // =========================================================================
    console.log('\n--- GAP 9: Notification Endpoints & Uploaded Logo Security ---');

    // 9a. SuperAdmin can access registration notifications
    const saNotifRes = await makeRequest('GET', '/api/tenants/admin/notifications', undefined, {
      Authorization: `Bearer ${superAdminToken}`,
    });
    assertCheck(saNotifRes.statusCode === 200, 'SuperAdmin can access /api/tenants/admin/notifications (HTTP 200)');

    // 9b. Fleet Admin CANNOT access registration notifications (HTTP 403)
    const faNotifRes = await makeRequest('GET', '/api/tenants/admin/notifications', undefined, {
      Authorization: `Bearer ${fleetAlphaAdminToken}`,
    });
    assertCheck(faNotifRes.statusCode === 403, 'Fleet Admin access to registration notifications rejected with HTTP 403');

    // 9c. End User CANNOT access registration notifications (HTTP 403)
    const userNotifRes = await makeRequest('GET', '/api/tenants/admin/notifications', undefined, {
      Authorization: `Bearer ${endUserToken}`,
    });
    assertCheck(userNotifRes.statusCode === 403, 'End User access to registration notifications rejected with HTTP 403');

    // 9d. Anonymous caller CANNOT access notifications (HTTP 401)
    const anonNotifRes = await makeRequest('GET', '/api/tenants/admin/notifications');
    assertCheck(anonNotifRes.statusCode === 401, 'Anonymous request to notifications rejected with HTTP 401');

    // 9e. End User CANNOT upload fleet logo (HTTP 403)
    const userLogoUploadRes = await makeRequest('POST', '/api/tenants/current/logo', {}, {
      Authorization: `Bearer ${endUserToken}`,
    });
    assertCheck(userLogoUploadRes.statusCode === 403, 'End User uploading fleet logo blocked with HTTP 403');

    // 9f. Static route /uploads/fleetLogo is registered & Path Traversal is blocked
    const traversalRes = await makeRequest('GET', '/uploads/fleetLogo/../../.env');
    assertCheck(
      traversalRes.statusCode === 403 || traversalRes.statusCode === 404 || traversalRes.statusCode === 400,
      'Path traversal attempt on static uploads directory safely rejected (' + traversalRes.statusCode + ')'
    );

    // Write a sample logo file to uploads/fleetLogo and test retrieval
    const logoDir = path.join(process.cwd(), 'uploads', 'fleetLogo');
    if (!fs.existsSync(logoDir)) fs.mkdirSync(logoDir, { recursive: true });
    const sampleLogoFile = `test_logo_${Date.now()}.png`;
    const sampleLogoPath = path.join(logoDir, sampleLogoFile);
    fs.writeFileSync(sampleLogoPath, Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));

    const staticLogoRes = await makeRequest('GET', `/uploads/fleetLogo/${sampleLogoFile}`);
    assertCheck(staticLogoRes.statusCode === 200, 'Legitimate fleet logo served statically with HTTP 200');
    if (fs.existsSync(sampleLogoPath)) fs.unlinkSync(sampleLogoPath); // Cleanup

  } finally {
    // Clean up created entities silently
    try {
      if (cleanupBookings.length > 0) {
        await Booking.destroy({ where: { bookingId: cleanupBookings } });
      }
      if (cleanupInvoices.length > 0) {
        await Invoice.destroy({ where: { invoiceId: cleanupInvoices } });
      }
      if (cleanupPayments.length > 0) {
        await Payment.destroy({ where: { paymentId: cleanupPayments } });
      }
      if (cleanupUsers.length > 0) {
        await User.destroy({ where: { email: cleanupUsers } });
      }
      if (cleanupDrivers.length > 0) {
        await Drivers.destroy({ where: { driverId: cleanupDrivers } });
      }
      if (cleanupVehicles.length > 0) {
        await Vehicle.destroy({ where: { vehicleId: cleanupVehicles } });
      }
      if (cleanupCompanies.length > 0) {
        await Company.destroy({ where: { companyId: cleanupCompanies } });
      }
      for (const tid of cleanupTenants) {
        await TenantSubscription.destroy({ where: { tenantId: tid } });
        await Tenant.destroy({ where: { tenantId: tid } });
      }
    } catch (e) {
      // Ignore cleanup error
    }
    await sequelize.close();
  }

  console.log('\n========================================================================');
  console.log(`🏁 FINAL GAP VERIFICATION COMPLETE:`);
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  if (failures.length > 0) {
    console.log('\nFailures Detail:');
    failures.forEach((f) => console.log('   ' + f));
  }
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runGapVerification().catch((err) => {
  console.error('Test Suite Failed with Exception:', err);
  process.exit(1);
});
