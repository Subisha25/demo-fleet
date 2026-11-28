import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import {
  connectDB,
  Tenant,
  TenantSubscription,
  TenantRegistrationRequest,
  TenantActivationToken,
  Employee,
  User,
} from '../models';

async function setup() {
  await connectDB();
  const now = new Date();
  const testSuffix = Date.now().toString().slice(-4);

  // 1. Pending Activation Fleet
  const pendingTenantId = uuidv4();
  const pendingRegId = uuidv4();
  const rawToken = uuidv4();
  const pendingTokenHash = await bcrypt.hash(rawToken, 10);

  await TenantRegistrationRequest.create({
    requestId: pendingRegId,
    fleetName: `Pending Fleet ${testSuffix}`,
    legalName: `Pending Fleet ${testSuffix} Pvt Ltd`,
    ownerName: 'Rahul Verma',
    contactEmail: `pending.${testSuffix}@cabztest.in`,
    contactPhone: `980000${testSuffix}`,
    businessCode: `PF${testSuffix}`,
    requestedPlanTier: 'FREE_TRIAL',
    billingCycle: 'MONTHLY',
    city: 'Hyderabad',
    state: 'Telangana',
    status: 'APPROVED',
  });

  await Tenant.create({
    tenantId: pendingTenantId,
    name: `Pending Fleet ${testSuffix}`,
    displayName: `Pending Fleet ${testSuffix}`,
    code: `PF${testSuffix}`,
    slug: `pending-fleet-${testSuffix}`,
    status: 'ACTIVE',
    contactEmail: `pending.${testSuffix}@cabztest.in`,
    contactPhone: `980000${testSuffix}`,
  });

  await TenantSubscription.create({
    subscriptionId: uuidv4(),
    tenantId: pendingTenantId,
    status: 'TRIALING',
    planTier: null,
    agreedPrice: 0,
    trialDurationDays: 7,
    trialStartDate: null,
    trialEndsAt: null,
    currentPeriodStart: null,
    currentPeriodEnd: null,
  });

  await TenantActivationToken.create({
    tokenId: uuidv4(),
    tenantId: pendingTenantId,
    adminEmail: `pending.${testSuffix}@cabztest.in`,
    tokenHash: pendingTokenHash,
    expiresAt: new Date(Date.now() + 86400000),
    usedAt: null,
  });

  // 2. Active Trial Fleet
  const activeTenantId = uuidv4();
  const activeEmail = `active.${testSuffix}@cabztest.in`;
  const activeUsername = `active_admin_${testSuffix}`;
  const passwordHash = await bcrypt.hash('Password@123', 10);

  await Tenant.create({
    tenantId: activeTenantId,
    name: `Active Trial Fleet ${testSuffix}`,
    displayName: `Active Trial Fleet ${testSuffix}`,
    code: `AT${testSuffix}`,
    slug: `active-fleet-${testSuffix}`,
    status: 'ACTIVE',
    contactEmail: activeEmail,
    contactPhone: `981111${testSuffix}`,
  });

  await TenantSubscription.create({
    subscriptionId: uuidv4(),
    tenantId: activeTenantId,
    status: 'TRIALING',
    planTier: null,
    agreedPrice: 0,
    trialDurationDays: 7,
    trialStartDate: now,
    trialEndsAt: new Date(now.getTime() + 7 * 86400000),
    currentPeriodStart: now,
    currentPeriodEnd: new Date(now.getTime() + 7 * 86400000),
  });

  const empId = uuidv4();
  await Employee.create({
    employeeId: empId,
    tenantId: activeTenantId,
    username: activeUsername,
    email: activeEmail,
    phno: `981111${testSuffix}`,
    password: passwordHash,
    role: 'fleet_admin',
    roles: 'fleet_admin',
    status: 'ACTIVE',
    name: 'Active Trial Admin',
  });

  // 3. Expired Trial Fleet
  const expiredTenantId = uuidv4();
  const expiredEmail = `expired.${testSuffix}@cabztest.in`;
  const expiredUsername = `expired_admin_${testSuffix}`;

  await Tenant.create({
    tenantId: expiredTenantId,
    name: `Expired Fleet ${testSuffix}`,
    displayName: `Expired Fleet ${testSuffix}`,
    code: `EX${testSuffix}`,
    slug: `expired-fleet-${testSuffix}`,
    status: 'ACTIVE',
    contactEmail: expiredEmail,
    contactPhone: `982222${testSuffix}`,
  });

  const pastDate = new Date(Date.now() - 3600000);
  await TenantSubscription.create({
    subscriptionId: uuidv4(),
    tenantId: expiredTenantId,
    status: 'TRIALING',
    planTier: null,
    agreedPrice: 0,
    trialDurationDays: 7,
    trialStartDate: new Date(Date.now() - 8 * 86400000),
    trialEndsAt: pastDate,
    currentPeriodStart: new Date(Date.now() - 8 * 86400000),
    currentPeriodEnd: pastDate,
  });

  await Employee.create({
    employeeId: uuidv4(),
    tenantId: expiredTenantId,
    username: expiredUsername,
    email: expiredEmail,
    phno: `982222${testSuffix}`,
    password: passwordHash,
    role: 'fleet_admin',
    roles: 'fleet_admin',
    status: 'ACTIVE',
    name: 'Expired Trial Admin',
  });

  console.log('--- TEST ENTITIES READY ---');
  console.log(JSON.stringify({
    pending: {
      tenantId: pendingTenantId,
      activationUrl: `http://localhost:3000/activate-account?token=${rawToken}`,
    },
    active: {
      tenantId: activeTenantId,
      username: activeUsername,
      password: 'Password@123',
    },
    expired: {
      tenantId: expiredTenantId,
      username: expiredUsername,
      password: 'Password@123',
    },
  }, null, 2));

  process.exit(0);
}

setup().catch((e) => {
  console.error(e);
  process.exit(1);
});
