import http from 'http';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import {
  sequelize,
  Tenant,
  Company,
  Employee,
  Drivers,
  Vehicle,
  VehicleType,
  VehicleMaster,
  Tax,
  Pickupcity,
  Pickuparea,
  PaymentMode,
  Vendor,
  EmailConfiguration,
  Configuration,
} from '../models';
import { SmsTemplate } from '../models/smsTemplate';
import config from '../config/config';
import { ROOT_TENANT_ID } from '../context/tenantContext';
import { sendEmailFromTemplate } from '../services/emailConfServices';
import { sendSmsFromTemplate } from '../services/smsTemplateServices';

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
          let parsed = raw;
          try {
            parsed = JSON.parse(raw);
          } catch {
            // Keep raw text
          }
          resolve({
            statusCode: res.statusCode || 0,
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

let passedAssertions = 0;
let totalAssertions = 0;

function assertCheck(condition: boolean, description: string, details?: any) {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`  [PASS] Assertion ${totalAssertions}: ${description}`);
  } else {
    console.error(`  [FAIL] Assertion ${totalAssertions}: ${description}`);
    if (details) console.error('         Details:', JSON.stringify(details));
    throw new Error(`Assertion failed: ${description}`);
  }
}

async function runTestSuite() {
  console.log('======================================================================');
  console.log(' MASTER DATA FLEET ISOLATION, CONFIGURATION TEMPLATES & DRIVER SUITE');
  console.log('======================================================================\n');

  await sequelize.authenticate();

  // 1. Setup Test Fleets
  let tenantA = await Tenant.findOne({ where: { code: 'ALPHA' } });
  if (!tenantA) {
    tenantA = await Tenant.create({
      tenantId: 'a1a1a1a1-1111-4111-a111-111111111111',
      name: 'Alpha Fleet Logistics',
      code: 'ALPHA',
      slug: 'alpha-fleet-test',
      contactEmail: 'admin@alphafleet.com',
      contactPhone: '9876543210',
      status: 'ACTIVE',
      planId: 'pro',
      subscriptionStatus: 'ACTIVE',
    });
  }
  const tenantAId = tenantA.tenantId;

  let tenantB = await Tenant.findOne({ where: { code: 'BETA' } });
  if (!tenantB) {
    tenantB = await Tenant.create({
      tenantId: 'b2b2b2b2-2222-4222-b222-222222222222',
      name: 'Beta Fleet Express',
      code: 'BETA',
      slug: 'beta-fleet-test',
      contactEmail: 'admin@betafleet.com',
      contactPhone: '9876543211',
      status: 'ACTIVE',
      planId: 'enterprise',
      subscriptionStatus: 'ACTIVE',
    });
  }
  const tenantBId = tenantB.tenantId;

  const tokenAlpha = jwt.sign(
    {
      userId: 'emp-alpha-admin',
      role: 'admin',
      tenantId: tenantAId,
      email: 'admin@alphafleet.com',
    },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  const tokenBeta = jwt.sign(
    {
      userId: 'emp-beta-admin',
      role: 'admin',
      tenantId: tenantBId,
      email: 'admin@betafleet.com',
    },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  const tokenSuperAdmin = jwt.sign(
    {
      userId: 'superadmin-user',
      role: 'superadmin',
      tenantId: ROOT_TENANT_ID,
      isPlatformSuperAdmin: true,
      email: 'superadmin@platform.com',
    },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  const headersAlpha = { Authorization: `Bearer ${tokenAlpha}` };
  const headersBeta = { Authorization: `Bearer ${tokenBeta}` };
  const headersSuperAdmin = { Authorization: `Bearer ${tokenSuperAdmin}` };

  console.log('[PHASE 1] MASTER DATA ISOLATION ACROSS MODULES');
  console.log('----------------------------------------------------');

  // --- 1.1 TAX MODULE ---
  console.log('  Testing Tax Module Isolation...');
  const taxAlphaRes = await makeRequest(
    'POST',
    '/api/emp/addTax',
    { taxName: `Alpha GST 5% - ${Date.now()}`, taxPercentage: 5 },
    headersAlpha
  );
  assertCheck(taxAlphaRes.statusCode === 201, 'Fleet A created Tax successfully (HTTP 201)');
  const taxAlphaId = taxAlphaRes.data?.tax?.taxId;

  const taxBetaRes = await makeRequest(
    'POST',
    '/api/emp/addTax',
    { taxName: `Beta GST 12% - ${Date.now()}`, taxPercentage: 12 },
    headersBeta
  );
  assertCheck(taxBetaRes.statusCode === 201, 'Fleet B created Tax successfully (HTTP 201)');
  const taxBetaId = taxBetaRes.data?.tax?.taxId;

  // Fleet A lists tax: should see Alpha, NOT Beta
  const listTaxAlpha = await makeRequest('GET', '/api/emp/getTaxList', undefined, headersAlpha);
  assertCheck(listTaxAlpha.statusCode === 200, 'Fleet A listed tax successfully (HTTP 200)');
  const taxesA = listTaxAlpha.data?.data || listTaxAlpha.data?.taxes || [];
  const seesBetaTaxInA = taxesA.some((t: any) => t.taxId === taxBetaId);
  const seesAlphaTaxInA = taxesA.some((t: any) => t.taxId === taxAlphaId);
  assertCheck(seesAlphaTaxInA && !seesBetaTaxInA, 'Fleet A list contains Alpha Tax and excludes Beta Tax');

  // Cross-tenant Tax mutation: Fleet A modifying Beta Tax should return 403
  const editBetaTaxFromAlpha = await makeRequest(
    'PUT',
    `/api/emp/editTax/${taxBetaId}`,
    { taxName: 'Hacked Tax', taxPercentage: 99 },
    headersAlpha
  );
  assertCheck(editBetaTaxFromAlpha.statusCode === 403, 'Cross-tenant tax edit rejected with HTTP 403');

  // --- 1.2 PICKUP CITY & PICKUP AREA ---
  console.log('  Testing Pickup City & Pickup Area Isolation...');
  const cityAlphaRes = await makeRequest(
    'POST',
    '/api/location/addPickupCity',
    { pickupCity: `AlphaCity-${Date.now()}` },
    headersAlpha
  );
  assertCheck(cityAlphaRes.statusCode === 201, 'Fleet A created Pickup City (HTTP 201)');
  const cityAlphaName = cityAlphaRes.data?.pickupcity?.pickupCity;
  const cityAlphaId = cityAlphaRes.data?.pickupcity?.pickupCityId;

  const cityBetaRes = await makeRequest(
    'POST',
    '/api/location/addPickupCity',
    { pickupCity: `BetaCity-${Date.now()}` },
    headersBeta
  );
  assertCheck(cityBetaRes.statusCode === 201, 'Fleet B created Pickup City (HTTP 201)');
  const cityBetaName = cityBetaRes.data?.pickupcity?.pickupCity;
  const cityBetaId = cityBetaRes.data?.pickupcity?.pickupCityId;

  const listCityAlpha = await makeRequest('GET', '/api/city/listCity', undefined, headersAlpha);
  const citiesA = listCityAlpha.data?.data || [];
  const seesBetaCityInA = citiesA.some((c: any) => c.pickupCity === cityBetaName);
  assertCheck(!seesBetaCityInA, 'Fleet A pickup city list does not contain Fleet B city');

  // Relational Validation: Fleet A creating Pickup Area referencing Fleet B City
  const invalidAreaRes = await makeRequest(
    'POST',
    '/api/location/addPickUpArea',
    { pickupArea: 'Cross Area', pickupCity: cityBetaName },
    headersAlpha
  );
  assertCheck(
    invalidAreaRes.statusCode === 400 || invalidAreaRes.statusCode === 403,
    'Relational validation: Pickup Area referencing foreign fleet city is rejected (HTTP 400/403)'
  );

  // Fleet A creating Pickup Area referencing its own city
  const areaAlphaRes = await makeRequest(
    'POST',
    '/api/location/addPickUpArea',
    { pickupArea: 'Alpha Main Area', pickupCity: cityAlphaName },
    headersAlpha
  );
  assertCheck(areaAlphaRes.statusCode === 201, 'Fleet A created valid Pickup Area with own City (HTTP 201)');
  const areaAlphaId = areaAlphaRes.data?.data?.areaId || areaAlphaRes.data?.areaId;

  // Cross-tenant area update
  const editAreaFromBeta = await makeRequest(
    'PUT',
    `/api/area/pickupAreaUpdate/${areaAlphaId}`,
    { pickupArea: 'Hacked Area', pickupCity: cityAlphaName },
    headersBeta
  );
  assertCheck(editAreaFromBeta.statusCode === 403, 'Cross-tenant pickup area update rejected with HTTP 403');

  // --- 1.3 PAYMENT MODE MODULE ---
  console.log('  Testing Payment Mode Module Isolation...');
  const payModeAlphaRes = await makeRequest(
    'POST',
    '/api/paymentmode/createPaymentMode',
    { modelname: `AlphaPay-${Date.now()}`, isOnline: true },
    headersAlpha
  );
  assertCheck(payModeAlphaRes.statusCode === 201, 'Fleet A created Payment Mode (HTTP 201)');
  const payModeAlphaId = payModeAlphaRes.data?.paymentMode?.paymentmodeId;

  const payModeBetaRes = await makeRequest(
    'POST',
    '/api/paymentmode/createPaymentMode',
    { modelname: `BetaPay-${Date.now()}`, isOnline: false },
    headersBeta
  );
  assertCheck(payModeBetaRes.statusCode === 201, 'Fleet B created Payment Mode (HTTP 201)');
  const payModeBetaId = payModeBetaRes.data?.paymentMode?.paymentmodeId;

  const listPayAlpha = await makeRequest('GET', '/api/paymentmode/getAllPaymentMode', undefined, headersAlpha);
  const payModesA = listPayAlpha.data?.data || [];
  const seesBetaPayInA = payModesA.some((p: any) => p.paymentmodeId === payModeBetaId);
  assertCheck(!seesBetaPayInA, 'Fleet A payment mode list excludes Fleet B payment modes');

  const crossPayDelete = await makeRequest(
    'DELETE',
    `/api/paymentmode/deletePaymentMode/${payModeBetaId}`,
    undefined,
    headersAlpha
  );
  assertCheck(crossPayDelete.statusCode === 403, 'Cross-tenant payment mode delete rejected with HTTP 403');

  // --- 1.4 VEHICLE TYPE & VEHICLE MODEL ---
  console.log('  Testing Vehicle Type & Vehicle Model Isolation...');
  const vTypeAlphaRes = await makeRequest(
    'POST',
    '/api/vendor/createVehicleType',
    { vehicleType: `AlphaSUV-${Date.now()}`, seatCapacity: 6, priorMinutes: 30 },
    headersAlpha
  );
  assertCheck(vTypeAlphaRes.statusCode === 201, 'Fleet A created Vehicle Type (HTTP 201)');
  const vTypeAlphaId = vTypeAlphaRes.data?.vehiType?.vehicleTypeId;

  const vTypeBetaRes = await makeRequest(
    'POST',
    '/api/vendor/createVehicleType',
    { vehicleType: `BetaSedan-${Date.now()}`, seatCapacity: 4, priorMinutes: 15 },
    headersBeta
  );
  assertCheck(vTypeBetaRes.statusCode === 201, 'Fleet B created Vehicle Type (HTTP 201)');
  const vTypeBetaId = vTypeBetaRes.data?.vehiType?.vehicleTypeId;

  const listVTypeAlpha = await makeRequest('GET', '/api/vehicleType/getAllVehicleType', undefined, headersAlpha);
  const vTypesA = listVTypeAlpha.data?.data || [];
  const seesBetaVTypeInA = vTypesA.some((vt: any) => vt.vehicleTypeId === vTypeBetaId);
  assertCheck(!seesBetaVTypeInA, 'Fleet A vehicle types list excludes Fleet B vehicle types');

  // Relational Validation: Vehicle Model in Fleet A referencing Fleet B Vehicle Type
  const invalidModelRes = await makeRequest(
    'POST',
    '/api/vendor/createVehicle',
    { vehicleName: 'Cross Model', vehicleTypeId: vTypeBetaId, manufacturing: '2023', availableStatus: 'Available' },
    headersAlpha
  );
  assertCheck(
    invalidModelRes.statusCode === 403 || invalidModelRes.statusCode === 400,
    'Relational validation: Vehicle Model referencing foreign fleet Vehicle Type is rejected (HTTP 403/400)'
  );

  // Fleet A creating valid Vehicle Model
  const modelAlphaRes = await makeRequest(
    'POST',
    '/api/vendor/createVehicle',
    { vehicleName: `Alpha Innova-${Date.now()}`, vehicleTypeId: vTypeAlphaId, manufacturing: '2024', availableStatus: 'Available' },
    headersAlpha
  );
  assertCheck(modelAlphaRes.statusCode === 201, 'Fleet A created Vehicle Model with own Vehicle Type (HTTP 201)');
  const modelAlphaId = modelAlphaRes.data?.vehicle?.vehicleId;

  // --- 1.5 OWNER (VENDOR) & VEHICLE MASTER ---
  console.log('  Testing Owner & Vehicle Master Isolation...');
  const ownerAlphaPhone = '97' + Math.floor(10000000 + Math.random() * 90000000);
  const ownerBetaPhone = '96' + Math.floor(10000000 + Math.random() * 90000000);

  const ownerAlphaRes = await makeRequest(
    'POST',
    '/api/emp/createVendor',
    {
      vendorName: 'Alpha Partner Transport',
      phno: ownerAlphaPhone,
      email: `partner@alpha-${Date.now()}.com`,
      password: 'Password@123',
      city: 'Alpha City',
    },
    headersAlpha
  );
  assertCheck(ownerAlphaRes.statusCode === 201, 'Fleet A created Owner/Partner (HTTP 201)');
  const ownerAlphaId = ownerAlphaRes.data?.vendor?.vendorId || ownerAlphaRes.data?.owner?.vendorId;

  const ownerBetaRes = await makeRequest(
    'POST',
    '/api/emp/createVendor',
    {
      vendorName: 'Beta Partner Fleet',
      phno: ownerBetaPhone,
      email: `partner@beta-${Date.now()}.com`,
      password: 'Password@123',
      city: 'Beta City',
    },
    headersBeta
  );
  assertCheck(ownerBetaRes.statusCode === 201, 'Fleet B created Owner/Partner (HTTP 201)');
  const ownerBetaId = ownerBetaRes.data?.vendor?.vendorId || ownerBetaRes.data?.owner?.vendorId;

  const listOwnerAlpha = await makeRequest('GET', '/api/vendor/getAllVendors', undefined, headersAlpha);
  const ownersA = listOwnerAlpha.data?.vendors || [];
  const seesBetaOwnerInA = ownersA.some((o: any) => o.vendorId === ownerBetaId);
  assertCheck(!seesBetaOwnerInA, 'Fleet A owners list excludes Fleet B owners');

  // Relational Validation: Vehicle Master in Fleet A referencing Fleet B Owner
  const invalidMasterRes = await makeRequest(
    'POST',
    '/api/vendor/createVehicleMaster',
    {
      vehicleNumber: `KA-01-AL-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleId: modelAlphaId,
      vendorId: ownerBetaId, // Fleet B owner!
    },
    headersAlpha
  );
  assertCheck(
    invalidMasterRes.statusCode === 403,
    'Relational validation: Vehicle Master referencing foreign fleet Owner is rejected (HTTP 403)'
  );

  // Valid Vehicle Master in Fleet A
  const validRegNo = `KA-01-AL-${Math.floor(1000 + Math.random() * 9000)}`;
  const validMasterRes = await makeRequest(
    'POST',
    '/api/vendor/createVehicleMaster',
    {
      vehicleNumber: validRegNo,
      vehicleId: modelAlphaId,
      vendorId: ownerAlphaId,
    },
    headersAlpha
  );
  assertCheck(validMasterRes.statusCode === 201, 'Fleet A created Vehicle Master with own model & owner (HTTP 201)');
  const masterAlphaId = validMasterRes.data?.vehicleMaster?.vehicleMasterId;

  // Fleet B cannot see Fleet A's vehicle master
  const listMasterBeta = await makeRequest('GET', '/api/vehicleMaster/getAllVehicleMaster', undefined, headersBeta);
  const mastersB = listMasterBeta.data?.vehicles || [];
  const seesAlphaMasterInB = mastersB.some((m: any) => m.vehicleMasterId === masterAlphaId);
  assertCheck(!seesAlphaMasterInB, 'Fleet B vehicle master list excludes Fleet A vehicle masters');

  console.log('\n[PHASE 2] CONFIGURATION, EMAIL & SMS TEMPLATES RESTORATION');
  console.log('----------------------------------------------------');

  // 2.1 Fleet Admin access to Email & SMS template list
  const emailTemplatesAlpha = await makeRequest('GET', '/api/emailConfRoutes/getAllEmailConf', undefined, headersAlpha);
  assertCheck(
    emailTemplatesAlpha.statusCode === 200,
    'Fleet Admin A can access GET /api/emailConfRoutes/getAllEmailConf (HTTP 200)'
  );
  const emailListA = emailTemplatesAlpha.data?.emailConfs || [];
  assertCheck(emailListA.length > 0, 'Fleet Admin A receives template list with platform fallbacks');

  const smsTemplatesAlpha = await makeRequest('GET', '/api/smsTemplateRoutes/getAllSmsTemplates', undefined, headersAlpha);
  assertCheck(
    smsTemplatesAlpha.statusCode === 200,
    'Fleet Admin A can access GET /api/smsTemplateRoutes/getAllSmsTemplates (HTTP 200)'
  );
  const smsListA = smsTemplatesAlpha.data?.smsTemplates || [];
  assertCheck(smsListA.length > 0, 'Fleet Admin A receives SMS templates with platform defaults');

  // 2.2 Template Customization & Isolation: Editing template as Fleet A does not alter Fleet B
  const clientBookingEmailTemplate = emailListA.find((t: any) => t.emailCode === 'ORDER_BOOKING_EMAIL_TO_CLIENT');
  assertCheck(!!clientBookingEmailTemplate, 'Found ORDER_BOOKING_EMAIL_TO_CLIENT template');

  const customAlphaSubject = `[Alpha Fleet VIP] Booking Confirmed ###BookingCode###`;
  const updateEmailAlpha = await makeRequest(
    'PUT',
    `/api/emailConfRoutes/updateEmailConf/${clientBookingEmailTemplate.emailConfigId}`,
    { subject: customAlphaSubject },
    headersAlpha
  );
  assertCheck(updateEmailAlpha.statusCode === 200, 'Fleet Admin A successfully updated email template (HTTP 200)');
  const updatedAlphaConf = updateEmailAlpha.data?.emailConf;
  assertCheck(
    updatedAlphaConf?.tenantId === tenantAId,
    'Template update created/scoped tenant-specific template for Fleet A'
  );

  // Verify Fleet B still sees original platform template, NOT Fleet A's customized subject
  const emailTemplatesBeta = await makeRequest('GET', '/api/emailConfRoutes/getAllEmailConf', undefined, headersBeta);
  const clientBookingEmailBeta = emailTemplatesBeta.data?.emailConfs?.find((t: any) => t.emailCode === 'ORDER_BOOKING_EMAIL_TO_CLIENT');
  assertCheck(
    clientBookingEmailBeta?.subject !== customAlphaSubject,
    'Isolation verified: Fleet A template edit DID NOT affect Fleet B template'
  );

  // 2.3 SMS Template Customization & Isolation
  const sampleSms = smsListA.find((t: any) => t.templateCode === 'BOOKING_CREATION');
  assertCheck(!!sampleSms, 'Found BOOKING_CREATION SMS template');

  const customAlphaSmsMsg = 'Alpha Cabs: Trip ###BookingCode### booked! Thank you ###CustomerName###.';
  const updateSmsAlpha = await makeRequest(
    'PUT',
    `/api/smsTemplateRoutes/updateSmsTemplate/${sampleSms.smsTemplateId}`,
    { message: customAlphaSmsMsg },
    headersAlpha
  );
  assertCheck(updateSmsAlpha.statusCode === 200, 'Fleet Admin A successfully updated SMS template (HTTP 200)');
  const updatedAlphaSms = updateSmsAlpha.data?.smsTemplate;
  assertCheck(
    updatedAlphaSms?.tenantId === tenantAId,
    'SMS template update created/scoped tenant-specific SMS template for Fleet A'
  );

  const smsTemplatesBeta = await makeRequest('GET', '/api/smsTemplateRoutes/getAllSmsTemplates', undefined, headersBeta);
  const sampleSmsBeta = smsTemplatesBeta.data?.smsTemplates?.find((t: any) => t.templateCode === 'BOOKING_CREATION');
  assertCheck(
    sampleSmsBeta?.message !== customAlphaSmsMsg,
    'Isolation verified: Fleet A SMS template edit DID NOT affect Fleet B template'
  );

  // 2.4 Configuration Settings & Credential Protection
  const configAlpha = await makeRequest('GET', '/api/config/getConfiguration', undefined, headersAlpha);
  assertCheck(configAlpha.statusCode === 200, 'Fleet Admin can access Configuration (HTTP 200)');
  assertCheck(
    configAlpha.data?.data?.smtpEmailPassword === '••••••••',
    'SMTP password is strictly redacted as •••••••• in Fleet Admin Configuration'
  );

  console.log('\n[PHASE 3] DRIVER CREATION, VALIDATION & PHONE UNIQUENESS');
  console.log('----------------------------------------------------');

  const sharedTestPhone = '95' + Math.floor(10000000 + Math.random() * 90000000);

  // 3.1 Driver Creation validation failure on missing fields
  const invalidDriverRes = await makeRequest(
    'POST',
    '/api/vendor/createDriver',
    {
      driverName: '', // empty name
      phno: '',
    },
    headersAlpha
  );
  assertCheck(invalidDriverRes.statusCode === 400, 'Invalid driver payload rejected with HTTP 400');
  assertCheck(
    invalidDriverRes.data?.field === 'driverName' || invalidDriverRes.data?.field === 'phno',
    'Driver error response precisely identifies the invalid field without exposing internal SQL details'
  );

  // 3.2 Driver Creation Success in Fleet A
  const driverAlphaRes = await makeRequest(
    'POST',
    '/api/vendor/createDriver',
    {
      driverName: 'Suresh Kumar',
      password: 'Password@123',
      driverEmail: `suresh-${Date.now()}@alpha.com`,
      phno: sharedTestPhone,
      city: 'Alpha City',
      state: 'Karnataka',
      country: 'India',
      pincode: '560001',
      address: '123 Alpha Road',
      licenseNo: 'DL-ALPHA-12345',
      licExpDate: '2028-12-31',
      trackingSource: 'GPS',
    },
    headersAlpha
  );
  assertCheck(driverAlphaRes.statusCode === 201, 'Driver created successfully in Fleet A (HTTP 201)');
  const driverAlphaId = driverAlphaRes.data?.driver?.driverId;
  assertCheck(!!driverAlphaId, 'Driver returned with valid driverId');

  // 3.3 Duplicate Phone within Fleet A rejected
  const dupDriverAlphaRes = await makeRequest(
    'POST',
    '/api/vendor/createDriver',
    {
      driverName: 'Duplicate Suresh',
      password: 'Password@123',
      phno: sharedTestPhone,
      licenseNo: 'DL-ALPHA-99999',
    },
    headersAlpha
  );
  assertCheck(dupDriverAlphaRes.statusCode === 400, 'Duplicate phone number within Fleet A rejected with HTTP 400');
  assertCheck(dupDriverAlphaRes.data?.field === 'phno', 'Duplicate check identifies field: "phno"');

  // 3.4 Multi-tenant Phone Scoping: SAME Phone number in Fleet B SUCCEEDS!
  const driverBetaRes = await makeRequest(
    'POST',
    '/api/vendor/createDriver',
    {
      driverName: 'Vikram Singh',
      password: 'Password@123',
      driverEmail: `vikram-${Date.now()}@beta.com`,
      phno: sharedTestPhone, // Same phone as Suresh!
      city: 'Beta City',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400001',
      address: '456 Beta Road',
      licenseNo: 'DL-BETA-67890',
      licExpDate: '2029-06-30',
      trackingSource: 'MobileApp',
    },
    headersBeta
  );
  assertCheck(
    driverBetaRes.statusCode === 201,
    'Multi-tenant phone scoping verified: Fleet B can create driver with same phone (HTTP 201)'
  );
  const driverBetaId = driverBetaRes.data?.driver?.driverId;

  // 3.5 Driver List Isolation
  const listDriversAlpha = await makeRequest('GET', '/api/driver/getAllDrivers', undefined, headersAlpha);
  const driversA = listDriversAlpha.data?.drivers || [];
  const seesBetaDriverInA = driversA.some((d: any) => d.driverId === driverBetaId);
  const seesAlphaDriverInA = driversA.some((d: any) => d.driverId === driverAlphaId);
  assertCheck(seesAlphaDriverInA && !seesBetaDriverInA, 'Fleet A sees Suresh and DOES NOT see Vikram');

  // 3.6 Cross-tenant Driver Update rejected
  const crossDriverUpdate = await makeRequest(
    'PUT',
    `/api/driver/update/${driverBetaId}`,
    { driverName: 'Hacked Vikram' },
    headersAlpha
  );
  assertCheck(crossDriverUpdate.statusCode === 403, 'Cross-tenant driver update rejected with HTTP 403');

  // 3.7 Soft-Delete & Reactivation test without constraint error
  const deleteAlphaDriver = await makeRequest('DELETE', `/api/driver/delete/${driverAlphaId}`, undefined, headersAlpha);
  assertCheck(deleteAlphaDriver.statusCode === 200, 'Fleet A soft-deleted driver successfully (HTTP 200)');

  // Re-creating driver with same phone in Fleet A restores/reactivates safely without unique constraint error
  const reactivateDriverRes = await makeRequest(
    'POST',
    '/api/vendor/createDriver',
    {
      driverName: 'Suresh Kumar Reactivated',
      password: 'NewPassword@123',
      phno: sharedTestPhone,
      licenseNo: 'DL-ALPHA-RENEWED',
    },
    headersAlpha
  );
  assertCheck(
    reactivateDriverRes.statusCode === 201,
    'Soft-deleted driver phone safely re-registered / reactivated without DB unique constraint error (HTTP 201)'
  );

  console.log('\n======================================================================');
  console.log(` ALL CHECKS PASSED: ${passedAssertions}/${totalAssertions} assertions verified`);
  console.log('======================================================================\n');
}

runTestSuite()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Test Suite Failed:', err);
    process.exit(1);
  });
