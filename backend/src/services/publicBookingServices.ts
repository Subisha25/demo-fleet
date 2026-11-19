import { Request, Response } from 'express';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { Op, Sequelize } from 'sequelize';
import { OTP } from '../models/otp';
import { Tenant } from '../models/tenant';
import { Company } from '../models/company';
import { PackageData } from '../models/packageData';
import { Vehicle } from '../models/vehicle';
import { VehicleType } from '../models/vehicleType';
import { VehicleMaster } from '../models/vehicleMaster';
import { Booking } from '../models/booking';
import { ORDER } from '../utils/costants';
import { ROOT_TENANT_ID } from '../context/tenantContext';
import { NotificationLog } from '../models/notificationLog';
import { sendNotification } from './notificationService';
import { checkBookingQuota } from './quotaService';
import { isSmsMockMode } from '../utils/mockModes';
import {
  send2FactorOTP,
  dispatchAuditedSms,
  validateMobileRecipient,
  validateEmailRecipient,
  maskPhoneNumber,
} from './smsServices';

// In-memory verification cache for replay-protected tokens (backed by OTP table)
interface VerifiedSession {
  phone: string;
  tenantId?: string;
  expiresAt: number;
}
const verifiedSessions = new Map<string, VerifiedSession>();

// Rate limit map: phone -> timestamps[]
const otpRateLimits = new Map<string, number[]>();

// Resend cooldown map: phone -> lastTimestamp
const otpLastRequestTime = new Map<string, number>();

// Failed attempt counter map: sessionId -> attemptCount (max 5 before invalidation)
const otpVerificationAttempts = new Map<string, number>();

// Duplicate submission protection: fingerprint -> timestamp
const submissionCache = new Map<string, number>();

/**
 * Step 1A: Request Phone OTP for Public Cab Booking
 * Enforces:
 * - Advanced Indian mobile validation (10 digits, starts 6-9, non-dummy)
 * - 30-second resend cooldown
 * - 5 OTP requests per phone per 15 minutes
 * - Tenant isolation (resolves fleet from slug, companyId, or tenantId)
 * - Real 2Factor OTP dispatch (template OTP1)
 * - Clean error responses from gateway (never claims false success)
 */
export const sendPublicBookingOtp = async (req: Request, res: Response) => {
  try {
    const { phone, slug, tenantId, companyId } = req.body;

    // 1. Advanced Phone Validation & Dummy Protection
    const validation = validateMobileRecipient(phone);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error || 'Please provide a valid 10-digit Indian mobile number.',
      });
    }
    const cleanPhone = validation.normalizedPhone;

    // 2. 30-Second Resend Cooldown (enforced in dev/prod, bypassed in test mode)
    const now = Date.now();
    const lastRequest = otpLastRequestTime.get(cleanPhone) || 0;
    if (process.env.NODE_ENV !== 'test' && now - lastRequest < 30 * 1000) {
      const waitSeconds = Math.ceil((30 * 1000 - (now - lastRequest)) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSeconds}s before requesting a new OTP.`,
      });
    }

    // 3. Rate limiting: Max 5 OTP requests per phone per 15 minutes
    const history = (otpRateLimits.get(cleanPhone) || []).filter((ts) => now - ts < 15 * 60 * 1000);
    if (history.length >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please wait 15 minutes before trying again.',
      });
    }
    history.push(now);
    otpRateLimits.set(cleanPhone, history);
    otpLastRequestTime.set(cleanPhone, now);

    // 4. Resolve Tenant Context
    let resolvedTenantId = tenantId;
    if (!resolvedTenantId && slug) {
      const tenant = await Tenant.findOne({ where: { slug } });
      if (tenant) resolvedTenantId = tenant.tenantId;
    }
    if (!resolvedTenantId && companyId) {
      const comp = await Company.findOne({ where: { companyId } });
      if (comp) resolvedTenantId = comp.tenantId;
    }
    resolvedTenantId = resolvedTenantId || ROOT_TENANT_ID;

    // 5. Generate Cryptographic 6-digit OTP
    const rawOtp = crypto.randomInt(100000, 999999).toString();
    const sessionId = 'PUB_' + crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(now + 5 * 60 * 1000); // 5 minutes expiry

    // Save to OTP table
    const otpRecord = await OTP.create({
      otp: rawOtp,
      loginId: uuidv4(),
      sessionId,
      expiresAt,
    });

    // 6. Direct Provider Dispatch via 2Factor OTP Route
    const otpResult = await send2FactorOTP(cleanPhone, rawOtp, 'OTP1', resolvedTenantId);

    // If dispatch failed or provider rejected, revoke OTP and return clear error
    if (!otpResult.success) {
      await OTP.destroy({ where: { otpId: otpRecord.otpId } });
      console.error(`[PublicBooking OTP Provider Failure] Recipient: ${maskPhoneNumber(cleanPhone)} | Error: ${otpResult.error}`);
      return res.status(502).json({
        success: false,
        message: otpResult.error || 'Failed to dispatch verification code via SMS provider. Please verify your mobile number or try again.',
      });
    }

    const isMock = isSmsMockMode();
    if (isMock) {
      console.log(`[PublicBooking OTP Mock] Mobile: ${maskPhoneNumber(cleanPhone)} | Session: ${sessionId} | OTP: ${rawOtp} | Status: MOCK_DISPATCHED`);
    } else {
      console.log(`[PublicBooking OTP Live] Mobile: ${maskPhoneNumber(cleanPhone)} | Session: ${sessionId} | ProviderMsgId: ${otpResult.providerMessageId}`);
    }

    // Persist to notification_logs for complete auditing
    try {
      await NotificationLog.create({
        channel: 'SMS',
        recipient: cleanPhone,
        tenantId: resolvedTenantId,
        templateCode: 'PUBLIC_BOOKING_OTP',
        referenceEntity: 'OTP_SESSION',
        referenceId: sessionId,
        providerStatus: isMock ? 'MOCK' : otpResult.providerStatus,
        providerMessageId: otpResult.providerMessageId || null,
        errorDetails: otpResult.error || null,
        retryCount: 0,
        maxRetries: 3,
        metadata: { sessionId, template: 'OTP1' },
      });
    } catch (logErr) {
      console.warn('[PublicBooking OTP] Failed to log NotificationLog entry:', logErr);
    }

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your mobile number.',
      sessionId,
      ...(isMock ? { mockOtp: rawOtp } : {}),
    });
  } catch (error: any) {
    console.error('sendPublicBookingOtp error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send verification OTP. Please try again.',
    });
  }
};

/**
 * Step 1B: Verify Phone OTP
 * Enforces:
 * - Maximum 5 failed verification attempts before session invalidation
 * - Single-use consumption (record destroyed upon verification)
 * - Issues a tamper-resistant token with 30-minute validity
 */
export const verifyPublicBookingOtp = async (req: Request, res: Response) => {
  try {
    const { phone, otp, sessionId, slug, tenantId } = req.body;
    const cleanPhone = String(phone || '').trim().replace(/\D/g, '');
    const cleanOtp = String(otp || '').trim();
    const cleanSessionId = String(sessionId || '').trim();

    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Valid 10-digit mobile number is required.',
      });
    }

    if (!cleanOtp || cleanOtp.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 6-digit OTP.',
      });
    }

    if (!cleanSessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session identifier is required.',
      });
    }

    // Check failed attempt count
    const attempts = otpVerificationAttempts.get(cleanSessionId) || 0;
    if (attempts >= 5) {
      await OTP.destroy({ where: { sessionId: cleanSessionId } });
      otpVerificationAttempts.delete(cleanSessionId);
      return res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. This OTP session has been invalidated. Please request a new OTP.',
      });
    }

    // Look up OTP record
    const otpRecord = await OTP.findOne({
      where: {
        sessionId: cleanSessionId,
        expiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!otpRecord || otpRecord.otp !== cleanOtp) {
      const nextAttempts = attempts + 1;
      otpVerificationAttempts.set(cleanSessionId, nextAttempts);

      if (nextAttempts >= 5) {
        await OTP.destroy({ where: { sessionId: cleanSessionId } });
        otpVerificationAttempts.delete(cleanSessionId);
        return res.status(429).json({
          success: false,
          message: 'Too many incorrect attempts. This OTP session has been invalidated. Please request a new OTP.',
        });
      }

      const remaining = 5 - nextAttempts;
      return res.status(400).json({
        success: false,
        message: `Invalid verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      });
    }

    // Success: Delete verified OTP to prevent replay and clear attempt counter
    otpVerificationAttempts.delete(cleanSessionId);
    await OTP.destroy({ where: { otpId: otpRecord.otpId } });

    // Generate tamper-resistant verification token
    const token = 'VTOK_' + crypto.randomBytes(24).toString('hex');
    const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes to complete booking
    verifiedSessions.set(token, { phone: cleanPhone, tenantId, expiresAt });

    // Also persist token marker in OTP table with cleanPhone stored in resetToken
    await OTP.create({
      otp: 'VERIFIED',
      loginId: uuidv4(),
      sessionId: token,
      resetToken: cleanPhone,
      expiresAt: new Date(expiresAt),
    });

    return res.status(200).json({
      success: true,
      message: 'Mobile number verified successfully.',
      verificationToken: token,
      phone: cleanPhone,
    });
  } catch (error: any) {
    console.error('verifyPublicBookingOtp error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify OTP. Please try again.',
    });
  }
};

/**
 * Authoritative session resolver for verified tokens.
 * Checks in-memory cache first, then falls back to OTP database marker.
 */
export async function getVerifiedSession(token: string): Promise<{ valid: boolean; phone: string | null; tenantId?: string }> {
  if (!token || typeof token !== 'string') return { valid: false, phone: null };

  const cleanToken = token.trim();

  // 1. Check in-memory cache
  const cached = verifiedSessions.get(cleanToken);
  if (cached && cached.expiresAt > Date.now()) {
    return { valid: true, phone: cached.phone, tenantId: cached.tenantId };
  }

  // 2. Fall back to OTP table check
  const dbRecord = await OTP.findOne({
    where: {
      sessionId: cleanToken,
      otp: 'VERIFIED',
      expiresAt: { [Op.gt]: new Date() },
    },
  });

  if (dbRecord) {
    return { valid: true, phone: dbRecord.resetToken || null };
  }

  return { valid: false, phone: null };
}

/**
 * Helper to validate verification token
 */
export async function isTokenVerified(token: string, phone: string): Promise<boolean> {
  const session = await getVerifiedSession(token);
  if (!session.valid) return false;
  const cleanPhone = String(phone || '').trim().replace(/\D/g, '');
  if (session.phone && cleanPhone) {
    return session.phone === cleanPhone;
  }
  return session.valid;
}

/**
 * Step 2 & 3: Get Eligible Public Packages Filtered by Seat Capacity
 * Handles both Common FleetFlow portal and Fleet-Specific branded portal
 */
export const getPublicPackages = async (req: Request, res: Response) => {
  try {
    const { seatCapacity, slug } = req.query;

    const requestedSeats = parseInt(String(seatCapacity || '1'), 10);
    if (isNaN(requestedSeats) || requestedSeats <= 0 || requestedSeats > 50) {
      return res.status(400).json({
        success: false,
        message: 'Seat capacity must be a positive integer between 1 and 50.',
      });
    }

    // Tenant resolution: If slug provided, filter strictly to that fleet
    let tenantFilter: any = { status: { [Op.in]: ['ACTIVE', 'TRIALING'] } };
    let specificTenant: any = null;

    if (slug) {
      const cleanSlug = String(slug).toLowerCase().trim();
      specificTenant = await Tenant.findOne({
        where: {
          [Op.or]: [
            { slug: cleanSlug },
            { code: cleanSlug.toUpperCase() },
            { subdomain: cleanSlug },
          ],
          status: { [Op.in]: ['ACTIVE', 'TRIALING'] },
        },
      });

      if (!specificTenant) {
        return res.status(404).json({
          success: false,
          message: `Fleet operator with identifier '${slug}' not found or inactive.`,
        });
      }

      tenantFilter = { tenantId: specificTenant.tenantId, status: { [Op.in]: ['ACTIVE', 'TRIALING'] } };
    }

    // Find active tenants
    const activeTenants = specificTenant ? [specificTenant] : await Tenant.findAll({ where: tenantFilter });
    const tenantIds = activeTenants.map((t) => t.tenantId);

    if (tenantIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        fleet: specificTenant ? { name: specificTenant.name, slug: specificTenant.slug, logoUrl: specificTenant.logoUrl } : null,
        packages: [],
      });
    }

    // Find companies belonging to these tenants
    const companies = await Company.findAll({
      where: {
        tenantId: { [Op.in]: tenantIds },
        isDeleted: false,
      },
      attributes: ['companyId', 'companyName', 'tenantId', 'companyLogo'],
    });

    const companyMap = new Map<string, any>();
    companies.forEach((c) => companyMap.set(c.companyId, c));
    const companyIds = Array.from(companyMap.keys());

    if (companyIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        fleet: specificTenant ? { name: specificTenant.name, slug: specificTenant.slug, logoUrl: specificTenant.logoUrl } : null,
        packages: [],
      });
    }

    // Find vehicle types with seat capacity >= requestedSeats
    const vehicleTypes = await VehicleType.findAll({
      where: {
        tenantId: { [Op.in]: tenantIds },
        seatCapacity: { [Op.gte]: requestedSeats },
      },
    });

    const vehicleTypeMap = new Map<string, any>();
    vehicleTypes.forEach((vt) => {
      vehicleTypeMap.set(vt.vehicleTypeId, vt);
    });

    // Also get vehicle models
    const vehicleModels = await Vehicle.findAll({
      where: {
        tenantId: { [Op.in]: tenantIds },
      },
    });
    const modelMap = new Map<string, any>();
    vehicleModels.forEach((vm) => modelMap.set(vm.vehicleId, vm));

    // Fetch Public Booking Packages across active fleets and companies
    const packageRecords = await PackageData.findAll({
      where: {
        companyId: { [Op.in]: companyIds },
        packageType: { [Op.in]: ['PUBLIC_BOOKING', 'Public Booking', 'Public Per-KM Package'] },
        isDeleted: false,
      },
    });

    const tenantMap = new Map<string, any>();
    activeTenants.forEach((t) => tenantMap.set(t.tenantId, t));

    const eligibleOptions: any[] = [];
    const estDistance = Number(req.query.estimatedDistance || req.query.distance || 0);

    for (const record of packageRecords) {
      const company = companyMap.get(record.companyId);
      if (!company) continue;

      const tenant = tenantMap.get(company.tenantId);
      if (!tenant) continue;

      let pkgDetails: any = {};
      try {
        pkgDetails = typeof record.packages === 'string' ? JSON.parse(record.packages) : record.packages;
      } catch (e) {
        continue;
      }

      // Case A: Multi-vehicle layout (packages.vehicles array or object from AddPackage)
      if (pkgDetails.vehicles && (Array.isArray(pkgDetails.vehicles) || typeof pkgDetails.vehicles === 'object')) {
        const vehicleEntries: any[] = Array.isArray(pkgDetails.vehicles)
          ? pkgDetails.vehicles
          : Object.entries(pkgDetails.vehicles).map(([k, v]) => ({ key: k, ...(v as any) }));

        for (const vRow of vehicleEntries) {
          if (vRow.isActive === false) continue;

          const amountPerKm = Number(vRow.perKm ?? vRow.amountPerKm ?? 0);
          if (amountPerKm <= 0) continue;

          const vtName = String(vRow.vehicleType || vRow.key || '').trim();
          const normVtName = vtName.toLowerCase();
          const vmName = String(vRow.vehicleModelName || vRow.vehicleName || vtName).trim();
          const normVmName = vmName.toLowerCase();

          // Match VehicleType in this fleet by ID or name
          let matchedVehicleType = vRow.vehicleTypeId ? vehicleTypeMap.get(vRow.vehicleTypeId) : null;
          if (!matchedVehicleType && normVtName) {
            matchedVehicleType = vehicleTypes.find(
              (vt) => vt.tenantId === company.tenantId && vt.vehicleType.trim().toLowerCase() === normVtName
            );
          }

          const effectiveCapacity = Number(vRow.seatCapacity || matchedVehicleType?.seatCapacity || 4);
          if (effectiveCapacity < requestedSeats) continue;

          // Match vehicle model
          let matchedModel = vRow.vehicleId ? modelMap.get(vRow.vehicleId) : null;
          if (!matchedModel && normVmName) {
            matchedModel = vehicleModels.find(
              (vm) => vm.tenantId === company.tenantId && (vm.vehicleName?.toLowerCase() === normVmName || vm.vehicleName?.toLowerCase().includes(normVmName))
            );
          }

          const vehicleImg = (() => {
            const raw: any = vRow.vehicleImg || matchedModel?.vehicleImg || matchedVehicleType?.vehicleImg;
            let val = '';
            if (Array.isArray(raw) && raw.length > 0) val = String(raw[0]);
            else if (typeof raw === 'string' && (raw as string).trim()) {
              try {
                const p = JSON.parse(raw);
                val = Array.isArray(p) && p.length > 0 ? String(p[0]) : String(p);
              } catch {
                val = (raw as string).split(',')[0].trim();
              }
            }
            if (!val) return '/images/default_car.svg';
            if (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:')) return val;
            const clean = val.replace(/^\/+/, '');
            if (clean.startsWith('uploads/')) return `/${clean}`;
            if (clean.startsWith('images/')) return `/${clean}`;
            return `/uploads/vehicleImg/${clean}`;
          })();

          const estFare = estDistance > 0 ? Math.round(estDistance * amountPerKm * 100) / 100 : null;

          const displayModelName = vmName || matchedModel?.vehicleName || vtName || 'Verified Cab';
          const displayTypeName = vtName || matchedVehicleType?.vehicleType || 'Cab';

          eligibleOptions.push({
            packageDataId: record.packageDataId,
            packageName: `${displayModelName} (${displayTypeName})`,
            packageType: record.packageType,
            amountPerKm,
            estimatedDistance: estDistance > 0 ? estDistance : null,
            estimatedFare: estFare,
            currency: 'INR',
            fleetName: tenant.name,
            fleetSlug: tenant.slug,
            fleetLogo: tenant.logoUrl || '/images/fleetflow_logo.svg',
            companyId: company.companyId,
            companyName: company.companyName,
            tenantId: tenant.tenantId,
            seatCapacity: effectiveCapacity,
            vehicleMasterId: vRow.vehicleMasterId || null,
            vehicleId: vRow.vehicleId || matchedModel?.vehicleId || null,
            vehicleTypeId: matchedVehicleType?.vehicleTypeId || vRow.vehicleTypeId || null,
            vehicleType: displayTypeName,
            vehicleModelName: displayModelName,
            vehicleNumber: vRow.vehicleNumber || null,
            vehicleImg,
            advanceBookingHours: matchedVehicleType?.AdvanceBookingHours || 1,
            description: `${effectiveCapacity}-seater verified commercial cab at ₹${amountPerKm}/km`,
          });
        }
      } else {
        // Case B: Single package layout (root amountPerKm)
        const amountPerKm = Number(pkgDetails.amountPerKm ?? pkgDetails.ratePerKm ?? pkgDetails.perKm ?? 0);
        if (amountPerKm <= 0) continue;

        const packageName = String(pkgDetails.packageName || pkgDetails.name || 'Public Per-KM Ride').trim();

        let matchedVehicleType: any = null;
        if (pkgDetails.vehicleTypeId && vehicleTypeMap.has(pkgDetails.vehicleTypeId)) {
          matchedVehicleType = vehicleTypeMap.get(pkgDetails.vehicleTypeId);
        } else {
          matchedVehicleType = vehicleTypes.find((vt) => vt.tenantId === company.tenantId);
        }

        const effectiveCapacity = Number(pkgDetails.seatCapacity || matchedVehicleType?.seatCapacity || requestedSeats);
        if (effectiveCapacity < requestedSeats) continue;

        let matchedModel: any = null;
        if (pkgDetails.vehicleId && modelMap.has(pkgDetails.vehicleId)) {
          matchedModel = modelMap.get(pkgDetails.vehicleId);
        }

        const estFare = estDistance > 0 ? Math.round(estDistance * amountPerKm * 100) / 100 : null;

        eligibleOptions.push({
          packageDataId: record.packageDataId,
          packageName,
          packageType: record.packageType,
          amountPerKm,
          estimatedDistance: estDistance > 0 ? estDistance : null,
          estimatedFare: estFare,
          currency: 'INR',
          fleetName: tenant.name,
          fleetSlug: tenant.slug,
          fleetLogo: tenant.logoUrl || '/images/fleetflow_logo.svg',
          companyId: company.companyId,
          companyName: company.companyName,
          tenantId: tenant.tenantId,
          seatCapacity: effectiveCapacity,
          vehicleTypeId: matchedVehicleType?.vehicleTypeId || null,
          vehicleType: matchedVehicleType?.vehicleType || 'Standard Sedan',
          vehicleModelName: matchedModel?.vehicleName || matchedVehicleType?.vehicleType || 'Executive Fleet Cab',
          vehicleImg: (() => {
            const raw = matchedVehicleType?.vehicleImg || matchedModel?.vehicleImg;
            let val = '';
            if (Array.isArray(raw) && raw.length > 0) val = String(raw[0]);
            else if (typeof raw === 'string' && raw.trim()) {
              try {
                const p = JSON.parse(raw);
                val = Array.isArray(p) && p.length > 0 ? String(p[0]) : String(p);
              } catch {
                val = raw.split(',')[0].trim();
              }
            }
            if (!val) return '/images/default_car.svg';
            if (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:')) return val;
            const clean = val.replace(/^\/+/, '');
            if (clean.startsWith('uploads/')) return `/${clean}`;
            if (clean.startsWith('images/')) return `/${clean}`;
            return `/uploads/vehicleImg/${clean}`;
          })(),
          advanceBookingHours: matchedVehicleType?.AdvanceBookingHours || 1,
          description: pkgDetails.description || `${effectiveCapacity}-seater verified commercial cab at ₹${amountPerKm}/km`,
        });
      }
    }

    return res.status(200).json({
      success: true,
      count: eligibleOptions.length,
      requestedSeats,
      fleet: specificTenant
        ? {
            name: specificTenant.name,
            slug: specificTenant.slug,
            logoUrl: specificTenant.logoUrl,
            customDomain: specificTenant.customDomain,
          }
        : null,
      packages: eligibleOptions,
    });
  } catch (error: any) {
    console.error('getPublicPackages error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve available packages. Please try again.',
    });
  }
};

/**
 * Public Discovery: Active Fleets
 */
export const getPublicFleets = async (req: Request, res: Response) => {
  try {
    const activeTenants = await Tenant.findAll({
      where: {
        status: { [Op.in]: ['ACTIVE', 'TRIALING'] },
        isDeleted: false,
      },
      attributes: ['tenantId', 'name', 'displayName', 'slug', 'subdomain', 'logoUrl', 'city', 'state', 'brandingTokens'],
      order: [['name', 'ASC']],
    });

    const fleets = activeTenants.map((t) => {
      const tokens = (t.brandingTokens as any) || {};
      return {
        tenantId: t.tenantId,
        name: t.name,
        displayName: t.displayName || t.name,
        slug: t.slug || t.subdomain,
        logoUrl: t.logoUrl || tokens.logoUrl || null,
        city: t.city || tokens.city || '',
        state: t.state || tokens.state || '',
        shortDescription: tokens.portalTitle || `${t.displayName || t.name} Commercial Fleet`,
        primaryColor: tokens.primaryColor || '#0f1c3f',
      };
    });

    return res.status(200).json({
      success: true,
      count: fleets.length,
      fleets,
    });
  } catch (error) {
    console.error('getPublicFleets error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve active fleets.' });
  }
};

/**
 * Public Discovery: Companies under Fleet
 */
export const getPublicFleetCompanies = async (req: Request, res: Response) => {
  try {
    const { fleetSlug } = req.params;
    if (!fleetSlug) {
      return res.status(400).json({ success: false, message: 'Fleet slug is required.' });
    }

    const cleanSlug = fleetSlug.trim().toLowerCase();
    const tenant = await Tenant.findOne({
      where: {
        isDeleted: false,
        status: { [Op.in]: ['ACTIVE', 'TRIALING'] },
        [Op.or]: [
          { slug: cleanSlug },
          { subdomain: cleanSlug },
          { code: cleanSlug.toUpperCase() },
          ...(cleanSlug === 'fleetflow' || cleanSlug === 'primary' ? [{ tenantId: ROOT_TENANT_ID }] : []),
        ],
      },
    });

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Fleet not found or inactive.' });
    }

    const companies = await Company.findAll({
      where: {
        tenantId: tenant.tenantId,
        isDeleted: false,
      },
      attributes: ['companyId', 'companyName', 'companyCode', 'companyLogo', 'seoUrl', 'companyAddress'],
      order: [['companyName', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      fleet: {
        tenantId: tenant.tenantId,
        name: tenant.name,
        displayName: tenant.displayName || tenant.name,
        slug: tenant.slug || tenant.subdomain,
        logoUrl: tenant.logoUrl,
      },
      companies,
    });
  } catch (error) {
    console.error('getPublicFleetCompanies error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve companies for fleet.' });
  }
};

/**
 * Public Discovery: Vehicles & Rates under Fleet
 */
export const getPublicFleetVehicles = async (req: Request, res: Response) => {
  try {
    const { fleetSlug } = req.params;
    const { companyId } = req.query;

    const cleanSlug = String(fleetSlug || '').trim().toLowerCase();
    const tenant = await Tenant.findOne({
      where: {
        isDeleted: false,
        status: { [Op.in]: ['ACTIVE', 'TRIALING'] },
        [Op.or]: [
          { slug: cleanSlug },
          { subdomain: cleanSlug },
          { code: cleanSlug.toUpperCase() },
          ...(cleanSlug === 'fleetflow' || cleanSlug === 'primary' ? [{ tenantId: ROOT_TENANT_ID }] : []),
        ],
      },
    });

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Fleet not found or inactive.' });
    }

    // Vehicle types under this fleet
    const vehicleTypes = await VehicleType.findAll({
      where: {
        tenantId: tenant.tenantId,
        isDeleted: false,
      },
      order: [['seatCapacity', 'ASC']],
    });

    // Existing packages for this fleet/company if any
    const packageFilter: any = {
      tenantId: tenant.tenantId,
      packageType: 'Public Per-KM Package',
      isDeleted: false,
    };
    if (companyId) {
      packageFilter.companyId = companyId;
    }
    const packages = await PackageData.findAll({ where: packageFilter });

    const vehicles = vehicleTypes.map((vt) => {
      let perKmRate = (vt.seatCapacity || 4) > 6 ? 24 : (vt.seatCapacity || 4) > 4 ? 18 : 14;
      let matchedPackageId: string | null = null;

      for (const p of packages) {
        try {
          const details = typeof p.packages === 'string' ? JSON.parse(p.packages) : p.packages;
          if (details.vehicleTypeId === vt.vehicleTypeId) {
            const rate = Number(details.amountPerKm || details.ratePerKm || 0);
            if (rate > 0) {
              perKmRate = rate;
              matchedPackageId = p.packageDataId;
              break;
            }
          }
        } catch {}
      }

      return {
        vehicleTypeId: vt.vehicleTypeId,
        vehicleType: vt.vehicleType,
        seatCapacity: vt.seatCapacity || 4,
        advanceBookingHours: vt.AdvanceBookingHours || 1,
        perKmRate,
        packageDataId: matchedPackageId,
        vehicleImg: (() => {
          const raw = Array.isArray(vt.vehicleImg) && vt.vehicleImg.length > 0 ? vt.vehicleImg[0] : (typeof vt.vehicleImg === 'string' ? vt.vehicleImg : '');
          if (!raw) return '/images/default_car.svg';
          if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:')) return raw;
          const clean = raw.replace(/^\/+/, '');
          if (clean.startsWith('uploads/')) return `/${clean}`;
          if (clean.startsWith('images/')) return `/${clean}`;
          return `/uploads/vehicleImg/${clean}`;
        })(),
      };
    });

    return res.status(200).json({
      success: true,
      fleet: {
        tenantId: tenant.tenantId,
        name: tenant.name,
        slug: tenant.slug || tenant.subdomain,
      },
      vehicles,
    });
  } catch (error) {
    console.error('getPublicFleetVehicles error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve vehicles for fleet.' });
  }
};

/**
 * Step 4: Create Public Booking with Independent Server Validation
 */
export const createPublicBooking = async (req: Request, res: Response) => {
  try {
    const {
      customerName,
      customerEmail,
      phone,
      verificationToken,
      pickupPoint,
      dropPoint,
      packageDataId,
      pickupDate,
      pickupTime,
      travellersCount = 1,
      notes,
    } = req.body;

    // 1. Validate customer identity
    const cleanName = String(customerName || '').trim();
    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({
        success: false,
        field: 'customerName',
        message: 'Passenger full name is required (minimum 2 characters).',
      });
    }

    // Email is optional in public booking. If provided, validate RFC format and non-dummy domain.
    let cleanEmail: string | null = null;
    const rawEmail = String(customerEmail || '').trim();
    if (rawEmail.length > 0) {
      const emailValidation = validateEmailRecipient(rawEmail);
      if (!emailValidation.valid) {
        return res.status(400).json({
          success: false,
          field: 'customerEmail',
          message: emailValidation.error || 'Please provide a valid email address format (e.g. user@domain.com).',
        });
      }
      cleanEmail = emailValidation.normalizedEmail;
    }

    // 2. Authoritative Phone Number from verified OTP session
    const session = await getVerifiedSession(verificationToken);
    if (!session.valid) {
      return res.status(401).json({
        success: false,
        field: 'verificationToken',
        message: 'Mobile number has not been verified. Please verify your phone with OTP first.',
      });
    }

    const cleanPhone = session.phone || String(phone || '').trim().replace(/\D/g, '');
    const phoneValidation = validateMobileRecipient(cleanPhone);
    if (!phoneValidation.valid) {
      return res.status(400).json({
        success: false,
        field: 'phone',
        message: phoneValidation.error || 'Valid 10-digit mobile number is required.',
      });
    }

    // 3. Validate pickup and drop points
    const cleanPickup = String(pickupPoint || req.body.pickupLocation || '').trim();
    const cleanDrop = String(dropPoint || req.body.dropLocation || '').trim();
    if (!cleanPickup) {
      return res.status(400).json({
        success: false,
        field: 'pickupPoint',
        message: 'Pickup location is required.',
      });
    }
    if (!cleanDrop) {
      return res.status(400).json({
        success: false,
        field: 'dropPoint',
        message: 'Drop location is required.',
      });
    }

    // Validate pickup date & time
    const todayStr = new Date().toISOString().split('T')[0];
    const cleanPickupDate = String(pickupDate || '').trim();
    if (!cleanPickupDate || cleanPickupDate < todayStr) {
      return res.status(400).json({
        success: false,
        field: 'pickupDate',
        message: 'Please choose a pickup date on or after today.',
      });
    }

    const cleanPickupTime = String(pickupTime || '').trim();
    if (!cleanPickupTime) {
      return res.status(400).json({
        success: false,
        field: 'pickupTime',
        message: 'Pickup time is required.',
      });
    }

    // 4. Independently verify the package, company, and tenant relationships
    let packageRecord: any = null;
    let company: any = null;
    let tenant: any = null;

    if (packageDataId) {
      packageRecord = await PackageData.findByPk(packageDataId);
      if (!packageRecord || packageRecord.isDeleted) {
        return res.status(404).json({
          success: false,
          message: 'The selected package is no longer available.',
        });
      }

      company = await Company.findByPk(packageRecord.companyId);
      if (!company || company.isDeleted) {
        return res.status(404).json({
          success: false,
          message: 'The fleet company offering this package is not active.',
        });
      }

      tenant = await Tenant.findByPk(company.tenantId);
    } else {
      const inputCompanyId = req.body.companyId;
      const inputFleetSlug = req.body.fleetSlug;
      const inputVehicleTypeId = req.body.vehicleTypeId;

      if (inputCompanyId) {
        company = await Company.findByPk(inputCompanyId);
      } else if (inputFleetSlug) {
        const cleanSlug = String(inputFleetSlug).trim().toLowerCase();
        tenant = await Tenant.findOne({
          where: {
            isDeleted: false,
            [Op.or]: [{ slug: cleanSlug }, { subdomain: cleanSlug }, { code: cleanSlug.toUpperCase() }],
          },
        });
        if (tenant) {
          company = await Company.findOne({ where: { tenantId: tenant.tenantId, isDeleted: false } });
        }
      }

      if (!company) {
        return res.status(400).json({
          success: false,
          message: 'Package selection or valid fleet company is required.',
        });
      }
      if (!tenant) {
        tenant = await Tenant.findByPk(company.tenantId);
      }

      const vt = inputVehicleTypeId ? await VehicleType.findByPk(inputVehicleTypeId) : null;
      const effectiveRate = Number(req.body.perKmRate || (vt && (vt.seatCapacity || 4) > 6 ? 24 : (vt && (vt.seatCapacity || 4) > 4 ? 18 : 14)));

      packageRecord = await PackageData.findOne({
        where: {
          companyId: company.companyId,
          packageType: 'Public Per-KM Package',
          isDeleted: false,
        },
      });

      if (!packageRecord) {
        packageRecord = await PackageData.create({
          packageDataId: uuidv4(),
          packageType: 'Public Per-KM Package',
          tenantId: company.tenantId,
          companyId: company.companyId,
          packages: JSON.stringify({
            packageName: vt ? `${vt.vehicleType} Standard` : 'Public Per-KM Ride',
            amountPerKm: effectiveRate,
            vehicleTypeId: inputVehicleTypeId || null,
          }),
          isDeleted: false,
        });
      }
    }
    if (!tenant || (tenant.status !== 'ACTIVE' && tenant.status !== 'TRIALING')) {
      return res.status(403).json({
        success: false,
        message: 'The fleet operator is currently inactive.',
      });
    }

    // Check plan booking quota for this tenant
    const quotaCheck = await checkBookingQuota(tenant.tenantId);
    if (!quotaCheck.allowed) {
      return res.status(403).json({
        success: false,
        error: 'QUOTA_EXCEEDED',
        code: 'QUOTA_EXCEEDED',
        resource: 'BOOKINGS',
        current: quotaCheck.current,
        max: quotaCheck.max,
        recommendedPlan: quotaCheck.recommendedPlan,
        billingPeriod: quotaCheck.billingPeriod,
        message: quotaCheck.message || 'The fleet operator has reached their booking capacity for the current billing period. Please contact the fleet administrator.',
      });
    }

    // Parse package data snapshot
    let pkgDetails: any = {};
    try {
      pkgDetails = typeof packageRecord.packages === 'string' ? JSON.parse(packageRecord.packages) : packageRecord.packages;
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: 'Invalid package configuration.',
      });
    }

    let agreedAmountPerKm = 0;
    let agreedPackageName = 'Public Booking';
    let packageVehicleCapacity = 4;
    let matchedVehicleKey: string | null = null;

    const requestedVehicleMasterId = req.body.vehicleMasterId;
    const requestedVehicleId = req.body.vehicleId;
    const requestedVehicleType = req.body.vehicleType || req.body.vehicleTypeName;
    const requestedVehicleTypeId = req.body.vehicleTypeId;
    const requestedVehicleModelName = req.body.vehicleModelName;

    if (pkgDetails.vehicles && (Array.isArray(pkgDetails.vehicles) || typeof pkgDetails.vehicles === 'object')) {
      const vList: any[] = Array.isArray(pkgDetails.vehicles)
        ? pkgDetails.vehicles
        : Object.entries(pkgDetails.vehicles).map(([k, v]) => ({ key: k, ...(v as any) }));

      let matchedVehicleConfig: any = null;

      // 1. Match by vehicleMasterId if provided
      if (requestedVehicleMasterId) {
        matchedVehicleConfig = vList.find((v) => v.vehicleMasterId === requestedVehicleMasterId);
      }
      // 2. Match by vehicleId if provided
      if (!matchedVehicleConfig && requestedVehicleId) {
        matchedVehicleConfig = vList.find((v) => v.vehicleId === requestedVehicleId);
      }
      // 3. Match by vehicleModelName
      if (!matchedVehicleConfig && requestedVehicleModelName) {
        const normModel = String(requestedVehicleModelName).trim().toLowerCase();
        matchedVehicleConfig = vList.find((v) => (v.vehicleModelName || v.vehicleName || '').trim().toLowerCase() === normModel);
      }
      // 4. Match by vehicleType
      if (!matchedVehicleConfig && requestedVehicleType) {
        const normReq = String(requestedVehicleType).trim().toLowerCase();
        matchedVehicleConfig = vList.find((v) => (v.vehicleType || v.key || '').trim().toLowerCase() === normReq);
      }
      // 5. Match by vehicleTypeId
      if (!matchedVehicleConfig && requestedVehicleTypeId) {
        matchedVehicleConfig = vList.find((v) => v.vehicleTypeId === requestedVehicleTypeId);
      }
      // 6. Fallback to first active vehicle
      if (!matchedVehicleConfig) {
        matchedVehicleConfig = vList.find((v) => v.isActive !== false && Number(v.perKm ?? v.amountPerKm ?? 0) > 0);
      }

      if (matchedVehicleConfig) {
        agreedAmountPerKm = Number(matchedVehicleConfig.perKm ?? matchedVehicleConfig.amountPerKm ?? 0);
        const namePart = matchedVehicleConfig.vehicleModelName || matchedVehicleConfig.vehicleType || matchedVehicleConfig.key || 'Cab';
        agreedPackageName = `${namePart} Public Booking`;
        packageVehicleCapacity = Number(matchedVehicleConfig.seatCapacity || 4);
        matchedVehicleKey = matchedVehicleConfig.vehicleType || matchedVehicleConfig.key || namePart;
        if (!req.body.vehicleTypeId && matchedVehicleConfig.vehicleTypeId) {
          req.body.vehicleTypeId = matchedVehicleConfig.vehicleTypeId;
        }
        if (!req.body.vehicleId && matchedVehicleConfig.vehicleId) {
          req.body.vehicleId = matchedVehicleConfig.vehicleId;
        }
      }
    } else {
      agreedAmountPerKm = Number(pkgDetails.amountPerKm ?? pkgDetails.ratePerKm ?? pkgDetails.perKm ?? 0);
      agreedPackageName = String(pkgDetails.packageName || pkgDetails.name || 'Public Booking').trim();
      packageVehicleCapacity = Number(pkgDetails.seatCapacity || 4);
    }

    if (agreedAmountPerKm <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rate on selected package.',
      });
    }

    // 5. Duplicate Submission / Idempotency Protection (prevent double submit within 60 seconds)
    const idempotencyFingerprint = `${cleanPhone}_${cleanPickup}_${cleanDrop}_${packageDataId}_${requestedVehicleType || ''}`.toLowerCase();
    const lastSubmitTime = submissionCache.get(idempotencyFingerprint);
    if (lastSubmitTime && Date.now() - lastSubmitTime < 60 * 1000) {
      return res.status(409).json({
        success: false,
        message: 'A booking request with identical details was submitted moments ago. Please wait a minute before re-submitting.',
      });
    }
    submissionCache.set(idempotencyFingerprint, Date.now());

    // 6. Resolve vehicle and vehicleType & enforce authoritative seat capacity
    let vehicleTypeId = requestedVehicleTypeId || pkgDetails.vehicleTypeId || null;
    let vehicleId = pkgDetails.vehicleId || null;
    let resolvedVehicleMasterId: string | null = null;

    if (requestedVehicleMasterId) {
      const vmRecord: any = await VehicleMaster.findOne({
        where: {
          vehicleMasterId: requestedVehicleMasterId,
          isDeleted: false,
        },
        include: [{ model: VehicleType, as: 'vehicleTypes', required: false }],
      });
      if (vmRecord) {
        if (tenant && vmRecord.tenantId !== tenant.tenantId) {
          return res.status(400).json({
            success: false,
            message: 'Selected vehicle does not belong to this fleet operator.',
          });
        }
        resolvedVehicleMasterId = vmRecord.vehicleMasterId;
        vehicleTypeId = vmRecord.vehicleTypeId || vehicleTypeId;
        vehicleId = vmRecord.vehicleId || vehicleId;
        if (vmRecord.vehicleTypes?.seatCapacity) {
          packageVehicleCapacity = vmRecord.vehicleTypes.seatCapacity;
        }
      }
    }

    if (!vehicleTypeId && (requestedVehicleType || matchedVehicleKey)) {
      const targetVt = requestedVehicleType || matchedVehicleKey;
      const matchedVt = await VehicleType.findOne({
        where: {
          tenantId: tenant.tenantId,
          vehicleType: targetVt,
        },
      });
      vehicleTypeId = matchedVt?.vehicleTypeId || null;
    }

    if (!vehicleTypeId) {
      const defaultVt = await VehicleType.findOne({ where: { tenantId: tenant.tenantId } });
      vehicleTypeId = defaultVt?.vehicleTypeId || null;
    }

    const numTravellers = Math.max(1, parseInt(String(travellersCount || '1'), 10));
    if (vehicleTypeId) {
      const vt = await VehicleType.findByPk(vehicleTypeId);
      const effectiveCap = Math.max(vt?.seatCapacity || 0, packageVehicleCapacity);
      if (effectiveCap && numTravellers > effectiveCap) {
        return res.status(400).json({
          success: false,
          field: 'travellersCount',
          message: `Number of passengers (${numTravellers}) exceeds vehicle seat capacity (${effectiveCap}). Please choose a vehicle with sufficient capacity.`,
        });
      }
    }

    if (!vehicleId && vehicleTypeId) {
      const defaultModel = await Vehicle.findOne({ where: { vehicleTypeId, tenantId: tenant.tenantId } });
      vehicleId = defaultModel?.vehicleId || null;
    }

    // 7. Booking schedule dates
    const effectiveBookingDate = pickupDate ? new Date(pickupDate) : new Date();
    const effectiveBookingTime = pickupTime ? String(pickupTime).substring(0, 8) : new Date().toLocaleTimeString('en-US', { hour12: false });

    // 8. Distance and estimated fare calculation
    const estimatedDistance = Number(req.body.estimatedDistance || req.body.distance || 0);
    const estimatedFare = estimatedDistance > 0 ? Math.round(estimatedDistance * agreedAmountPerKm * 100) / 100 : null;

    // 9. Package Rate Snapshot to protect agreed rate from subsequent edits
    const rateSnapshot = {
      packageDataId: packageRecord.packageDataId,
      packageName: agreedPackageName,
      packageType: packageRecord.packageType,
      amountPerKm: agreedAmountPerKm,
      perKmRate: agreedAmountPerKm,
      estimatedDistance: estimatedDistance > 0 ? estimatedDistance : null,
      estimatedFare: estimatedFare,
      companyId: company.companyId,
      companyName: company.companyName,
      fleetName: tenant.name,
      customerEmail: cleanEmail,
      customerName: cleanName,
      customerPhone: cleanPhone,
      vehicleMasterId: resolvedVehicleMasterId,
      timestamp: new Date().toISOString(),
    };

    // 10. Atomic Booking Creation under exact tenant and company
    const newBooking = await Booking.create({
      bookingDate: effectiveBookingDate,
      bookingTime: effectiveBookingTime,
      pickupPoint: cleanPickup,
      dropPoint: cleanDrop,
      travellersCount: numTravellers,
      remarks: 'Public Customer Booking via FleetFlow Portal',
      notes: JSON.stringify({
        source: 'PUBLIC_BOOKING',
        packageSnapshot: rateSnapshot,
        estimatedDistance: estimatedDistance > 0 ? estimatedDistance : null,
        estimatedFare: estimatedFare,
        customerNotes: notes ? String(notes).trim() : null,
      }),
      bookingCreatedBy: 'PUBLIC_BOOKING',
      preferredType: 'PUBLIC_BOOKING',
      behalfOfName: cleanName,
      behalfOfPhone: cleanPhone,
      companyId: company.companyId,
      tenantId: tenant.tenantId,
      vehicleTypeId,
      vehicleId,
      vehicleMasterId: resolvedVehicleMasterId,
      confirmStatus: ORDER.STATUS.PENDING, // 0: Appears immediately in Fleet Admin Confirm Pending List!
      bookingStatus: ORDER.STATUS.PENDING,
    });

    // Clean up used verification session
    verifiedSessions.delete(verificationToken);
    await OTP.destroy({ where: { sessionId: verificationToken } }).catch(() => {});

    // Mock-safe email confirmation notification (dispatched only when email is provided)
    if (cleanEmail) {
      try {
        await sendNotification({
          channel: 'EMAIL',
          recipient: cleanEmail,
          templateCode: 'PUBLIC_BOOKING_CONFIRMATION',
          subject: `FleetFlow Ride Request Received: Booking #${newBooking.bookingCode}`,
          body: `Hello ${cleanName},\n\nYour ride request has been received by ${tenant.name}.\n\nBooking ID: ${newBooking.bookingCode}\nPickup: ${cleanPickup}\nDrop: ${cleanDrop}\nRate: ₹${agreedAmountPerKm}/km\nStatus: Pending Confirmation\n\nThe fleet operations desk will assign your vehicle and driver shortly.`,
          tenantId: tenant.tenantId,
          referenceEntity: 'BOOKING',
          referenceId: newBooking.bookingId,
        });
      } catch (notifErr) {
        console.warn('[PublicBooking] Confirmation notification notice:', notifErr);
      }
    }

    // Audited customer SMS booking acknowledgment (Registered template: Booking Creation)
    try {
      await dispatchAuditedSms({
        recipient: cleanPhone,
        templateCode: 'BOOKING_CREATED',
        templateName: 'Booking Creation',
        vars: [cleanName],
        message: `${tenant.name}: Hello ${cleanName}, your ride request #${newBooking.bookingCode} has been placed successfully.`,
        referenceEntity: 'BOOKING',
        referenceId: newBooking.bookingId,
        tenantId: tenant.tenantId,
      });
    } catch (smsErr) {
      console.warn('[PublicBooking] Confirmation SMS notice:', smsErr);
    }

    // Audited Fleet Admin SMS booking notification to relevant Fleet Admin's registered mobile number
    const fleetAdminPhone = tenant.contactPhone || tenant.businessPhone;
    if (fleetAdminPhone) {
      const adminPhoneCheck = validateMobileRecipient(fleetAdminPhone);
      if (adminPhoneCheck.valid && adminPhoneCheck.normalizedPhone !== cleanPhone) {
        try {
          await dispatchAuditedSms({
            recipient: adminPhoneCheck.normalizedPhone,
            templateCode: 'BOOKING_CREATED',
            templateName: 'Booking Creation',
            vars: [tenant.name || 'Fleet Admin'],
            message: `${tenant.name}: New booking #${newBooking.bookingCode} received from ${cleanName}.`,
            referenceEntity: 'BOOKING',
            referenceId: newBooking.bookingId,
            tenantId: tenant.tenantId,
          });
        } catch (adminSmsErr) {
          console.warn('[PublicBooking] Fleet Admin Booking SMS notice:', adminSmsErr);
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Ride booking request placed successfully! The fleet administrator has received your request.',
      bookingCode: newBooking.bookingCode,
      bookingId: newBooking.bookingId,
      fleetName: tenant.name,
      companyName: company.companyName,
      agreedRate: agreedAmountPerKm,
      estimatedDistance: estimatedDistance > 0 ? estimatedDistance : null,
      estimatedFare: estimatedFare,
      pickupPoint: cleanPickup,
      dropPoint: cleanDrop,
      customerName: cleanName,
      customerEmail: cleanEmail,
      phone: cleanPhone,
    });
  } catch (error: any) {
    console.error('createPublicBooking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create booking. Please try again.',
    });
  }
};
