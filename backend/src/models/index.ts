import sequelize from '../config/dbConfig';
import { Employee } from './employee';
import { Company } from './company';
import { Drivers } from './drivers';
import { Vehicle } from './vehicle';
import { Vendor } from './vendor';
import { User } from './user';
import { Booking } from './booking';
import { Invoice } from './invoice';
import { Payment } from './payment';
import { Pickuparea } from './pickuparea';
import { Pickupcity } from './pickupcity';
import { Tax } from './tax';
import { VehicleType } from './vehicleType';
import { VehicleMaster } from './vehicleMaster';
import { OTP } from './otp';
import {PaymentMode} from './paymentmode';
import { orderSummery } from './ordersummery';
import { Package } from './package';
import { PackageData } from './packageData';
import { Configuration } from './configuration';
import { ClosePending } from './closepending';
import { EmailConfiguration } from './emailConfiguration';
import { BookingSequence } from './booking_sequence';
import { PaymentSequence } from './payment_sequence';
import { InvoiceSequence } from './invoice_sequence';
import { MonthlyBookingSequence } from './monthlyBookingSequence';
import { MapCount } from './mapCount';
import ShortLink from './shortLink';
import { OnCallInvoice } from './onCallInvoice';
import { OnCallInvoiceItems } from './onCallInvoiceItems';
import { MonthlyInvoice } from './monthlyInvoice';
import { MonthlyInvoiceItems } from './monthlyInvoiceItems';
import { Tenant } from './tenant';
import { TenantSubscription } from './tenantSubscription';
import { TenantUsageMeter } from './tenantUsageMeter';
import { CompanyPolicy } from './companyPolicy';
import { TenantRegistrationRequest } from './tenantRegistrationRequest';
import { TenantActivationToken } from './tenantActivationToken';
import { TenantInitialAllowance } from './tenantInitialAllowance';
import { SubscriptionInvoice } from './subscriptionInvoice';
import { NotificationLog } from './notificationLog';
import { SaaSPlan } from './saasPlan';
import { SmsTemplate } from './smsTemplate';
import { TenantSmsConfig } from './tenantSmsConfig';
import { encryptSmsApiKey, maskApiKey } from '../utils/cryptoUtils';

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    
    // Safely and additively ensure SaaS tables exist without touching legacy tables
    await Tenant.sync();
    await TenantSubscription.sync({ alter: true });
    await TenantUsageMeter.sync();
    await CompanyPolicy.sync();
    await TenantRegistrationRequest.sync();
    await TenantActivationToken.sync();
    await SubscriptionInvoice.sync();
    await NotificationLog.sync();
    try { await SaaSPlan.sync(); } catch (pErr) {}
    try { await TenantSmsConfig.sync(); } catch (smsErr) {}

    // Seed canonical SaaS plans if saas_plans is empty
    try {
      const planCount = await SaaSPlan.count();
      if (planCount === 0) {
        await SaaSPlan.bulkCreate([
          {
            planTier: 'BASIC',
            name: 'Starter Mobility',
            description: 'Essential fleet and trip dispatch operations for emerging operators.',
            priceMonthlyINR: 299,
            priceAnnualINR: 3050,
            priceMonthlyUSD: 4,
            currency: 'INR',
            billingFrequency: 'MONTHLY',
            billingCycles: ['MONTHLY', 'ANNUAL'],
            maxVehicles: 15,
            maxDrivers: 15,
            maxCompanies: 3,
            maxUsers: 5,
            monthlyTripQuota: 1000,
            isUnlimitedVehicles: false,
            isUnlimitedDrivers: false,
            isUnlimitedCompanies: false,
            isUnlimitedUsers: false,
            isUnlimitedTrips: false,
            features: [
              'Fleet & Driver Operations (Up to 15 Vehicles / 15 Drivers)',
              'Up to 3 Corporate Client Accounts',
              'Basic Booking-to-Invoice Lifecycle & Dispatch',
              'Automated Standard Tax & Trip Rate Calculation',
              'Standard PDF Invoice Generation',
              'Email Notification Support',
            ],
            featureEntitlements: {
              customBranding: false,
              advancedReports: false,
              customDomain: false,
              multiBranch: false,
              dedicatedPolicyEngine: false,
              pdfCustomizationTier: 'STANDARD',
            },
            isActive: true,
          },
          {
            planTier: 'PRO',
            name: 'Growth Fleet Pro',
            description: 'Scalable multi-company corporate transit with customized branding.',
            priceMonthlyINR: 349,
            priceAnnualINR: 3560,
            priceMonthlyUSD: 5,
            currency: 'INR',
            billingFrequency: 'MONTHLY',
            billingCycles: ['MONTHLY', 'ANNUAL'],
            maxVehicles: 75,
            maxDrivers: 75,
            maxCompanies: 20,
            maxUsers: 25,
            monthlyTripQuota: 10000,
            isUnlimitedVehicles: false,
            isUnlimitedDrivers: false,
            isUnlimitedCompanies: false,
            isUnlimitedUsers: false,
            isUnlimitedTrips: false,
            features: [
              'Expanded Fleet Management (Up to 75 Vehicles / 75 Drivers)',
              'Up to 20 Corporate Client Accounts',
              'On-Call, Monthly Consolidated & Spot Trip Invoicing',
              'Advanced Tenant Branding & Portal Theming',
              'Dynamic Corporate Booking Policies & Domain Validation',
              'Route Card Aggregation & Financial Summary Reports',
              'Custom Email/SMS Reminders & Payment Tracking',
            ],
            featureEntitlements: {
              customBranding: true,
              advancedReports: true,
              customDomain: false,
              multiBranch: true,
              dedicatedPolicyEngine: true,
              pdfCustomizationTier: 'BRANDED',
            },
            isActive: true,
          },
          {
            planTier: 'ENTERPRISE',
            name: 'Enterprise Mobility Suite',
            description: 'High-volume platform with full tenant scoping, custom domains, and VIP telemetry.',
            priceMonthlyINR: 549,
            priceAnnualINR: 5600,
            priceMonthlyUSD: 7,
            currency: 'INR',
            billingFrequency: 'MONTHLY',
            billingCycles: ['MONTHLY', 'ANNUAL'],
            maxVehicles: 250,
            maxDrivers: 250,
            maxCompanies: 100,
            maxUsers: 100,
            monthlyTripQuota: 50000,
            isUnlimitedVehicles: false,
            isUnlimitedDrivers: false,
            isUnlimitedCompanies: false,
            isUnlimitedUsers: false,
            isUnlimitedTrips: false,
            features: [
              'High-Volume Fleet Operations (Up to 250 Vehicles / 250 Drivers)',
              'Up to 100 Corporate Client Accounts',
              'Full Multi-Tenant SaaS Isolation & Custom Domains',
              'Dedicated Database Tenant Scoping & Policy Engine',
              'Consolidated Monthly Corporate Route Invoicing',
              'Multi-Role Server Authorization',
              'Priority Support & High-Volume Telemetry Metering',
            ],
            featureEntitlements: {
              customBranding: true,
              advancedReports: true,
              customDomain: true,
              multiBranch: true,
              dedicatedPolicyEngine: true,
              pdfCustomizationTier: 'ADVANCED',
            },
            isActive: true,
          },
        ]);
        console.log('Authoritative canonical SaaS plans initialized in saas_plans.');
      }
    } catch (planSeedErr) {
      console.warn('SaaS plan initialization notice:', planSeedErr);
    }

    // Idempotently ensure default root tenant exists for Grace Cabs
    try {
      const rootId = 'e7b8a1c0-0000-0000-0000-000000000001';
      const existing = await Tenant.findOne({ where: { tenantId: rootId } });
      if (!existing) {
        await Tenant.create({
          tenantId: rootId,
          name: 'Grace Cabs Fleet Operations',
          code: 'GC',
          subdomain: 'gracecabs',
          status: 'ACTIVE',
          planTier: 'ENTERPRISE',
          contactEmail: 'subisha2002.m@gmail.com',
          brandingTokens: {
            primaryColor: '#275981',
            secondaryColor: '#1d4260',
            portalTitle: 'Grace Cabs SaaS Platform'
          }
        });
        await TenantSubscription.create({
          tenantId: rootId,
          planTier: 'ENTERPRISE',
          status: 'ACTIVE',
          vehicleQuota: 999999,
          driverQuota: 999999,
          companyQuota: 999999,
          monthlyTripQuota: 999999,
          allowOverage: true
        });
        console.log('Default root tenant (Grace Cabs) verified.');
      }

      // Ensure root tenant SMS configuration exists with approved credentials
      const rootSmsConfig = await TenantSmsConfig.findOne({ where: { tenantId: rootId } });
      if (!rootSmsConfig) {
        const rootKey = (process.env.TWO_FACTOR_API_KEY || process.env.TWOFACTOR_API_KEY || '').trim();
        const rootSender = (process.env.TWO_FACTOR_SENDER_ID || process.env.TWOFACTOR_SENDER_ID || 'GRCCAB').trim();
        await TenantSmsConfig.create({
          tenantId: rootId,
          provider: '2FACTOR',
          encryptedApiKey: rootKey ? encryptSmsApiKey(rootKey) : null,
          apiKeyMasked: rootKey ? maskApiKey(rootKey) : null,
          senderId: rootSender || 'GRCCAB',
          otpRoute: 'OTP1',
          status: rootKey ? 'ACTIVE' : 'UNCONFIGURED',
          isVerified: !!rootKey,
          isEnabled: true,
        });
        console.log('Default root tenant SMS configuration verified.');
      }
    } catch (seedErr) {
      console.warn('Root tenant initialization notice:', seedErr);
    }

    console.log('Database connected and SaaS tables verified.');
  } catch (error) {
    console.error('DB connection error:', error);
  }
};

export { sequelize, connectDB, Employee, Company, Drivers,Vehicle,Vendor,User, Booking, Invoice, EmailConfiguration,
  VehicleType, Tax, Pickuparea, Pickupcity, VehicleMaster,OTP,PaymentMode,Payment,orderSummery,Package,PackageData,Configuration,
  ClosePending, BookingSequence, PaymentSequence, InvoiceSequence, ShortLink, MonthlyBookingSequence, MapCount, OnCallInvoice,
  OnCallInvoiceItems, MonthlyInvoice, MonthlyInvoiceItems, Tenant, TenantSubscription, TenantUsageMeter, CompanyPolicy,
  TenantRegistrationRequest, TenantActivationToken, TenantInitialAllowance, SubscriptionInvoice, NotificationLog, SaaSPlan, SmsTemplate,
  TenantSmsConfig
};

