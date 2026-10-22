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
import { SubscriptionInvoice } from './subscriptionInvoice';
import { NotificationLog } from './notificationLog';

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    
    // Safely and additively ensure SaaS tables exist without touching legacy tables
    await Tenant.sync();
    await TenantSubscription.sync();
    await TenantUsageMeter.sync();
    await CompanyPolicy.sync();
    await TenantRegistrationRequest.sync();
    await TenantActivationToken.sync();
    await SubscriptionInvoice.sync();
    await NotificationLog.sync();

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
          contactEmail: 'admin@gracecabs.com',
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
  TenantRegistrationRequest, TenantActivationToken, SubscriptionInvoice, NotificationLog
};
