import sequelize from '../config/dbConfig';
import { QueryTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

async function columnExists(tableName: string, columnName: string): Promise<boolean> {
  const [result]: any = await sequelize.query(
    `SELECT COUNT(*) as count 
     FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'demodb' 
       AND TABLE_NAME = ? 
       AND COLUMN_NAME = ?`,
    { replacements: [tableName, columnName], type: QueryTypes.SELECT }
  );
  return Number(result?.count || 0) > 0;
}

export async function runMigration() {
  console.log('--- Applying Phase 2 & 4: Email Template & Subscription Hardening Migration ---');

  // 1. Additive columns for `emailconfiguration`
  const emailConfColumns: { name: string; definition: string }[] = [
    { name: 'scope', definition: "VARCHAR(20) NOT NULL DEFAULT 'FLEET' AFTER tenantId" },
    { name: 'category', definition: "VARCHAR(50) NOT NULL DEFAULT 'OPERATIONAL' AFTER scope" },
    { name: 'placeholders', definition: 'TEXT NULL AFTER category' },
    { name: 'isActive', definition: 'TINYINT(1) NOT NULL DEFAULT 1 AFTER placeholders' },
  ];

  for (const col of emailConfColumns) {
    const exists = await columnExists('emailconfiguration', col.name);
    if (!exists) {
      console.log(`Adding column '${col.name}' to emailconfiguration...`);
      await sequelize.query(`ALTER TABLE \`emailconfiguration\` ADD COLUMN \`${col.name}\` ${col.definition}`);
      console.log(`✓ Added '${col.name}' to emailconfiguration`);
    } else {
      console.log(`Column '${col.name}' already exists on emailconfiguration.`);
    }
  }

  // 2. Additive columns for `notification_logs`
  const notifColumns: { name: string; definition: string }[] = [
    { name: 'tenantId', definition: 'CHAR(36) NULL AFTER recipient' },
    { name: 'idempotencyKey', definition: 'VARCHAR(255) NULL AFTER referenceId' },
  ];

  for (const col of notifColumns) {
    const exists = await columnExists('notification_logs', col.name);
    if (!exists) {
      console.log(`Adding column '${col.name}' to notification_logs...`);
      await sequelize.query(`ALTER TABLE \`notification_logs\` ADD COLUMN \`${col.name}\` ${col.definition}`);
      console.log(`✓ Added '${col.name}' to notification_logs`);
    } else {
      console.log(`Column '${col.name}' already exists on notification_logs.`);
    }
  }

  // 3. Update existing fleet operational templates in `emailconfiguration`
  // Replace legacy 'GraceCabs' / 'Grace Cabs' with dynamic ###FleetName###
  await sequelize.query(`
    UPDATE emailconfiguration
    SET 
      scope = 'FLEET',
      category = CASE
        WHEN emailCode LIKE '%PASWRD%' OR emailCode LIKE '%OTP%' OR emailCode LIKE '%CONFIRMATION%' THEN 'AUTH'
        WHEN emailCode LIKE '%INVOICE%' OR emailCode LIKE '%PAYMENT%' THEN 'BILLING'
        ELSE 'OPERATIONAL'
      END,
      subject = REPLACE(REPLACE(subject, 'GraceCabs', '###FleetName###'), 'Grace Cabs', '###FleetName###'),
      message = REPLACE(REPLACE(message, 'Grace Cabs', '###FleetName###'), 'GraceCabs', '###FleetName###')
    WHERE scope IS NULL OR scope = 'FLEET'
  `);
  console.log('✓ Updated existing fleet operational templates with dynamic ###FleetName### branding');

  // 4. Seed / Upsert Platform SaaS Email Templates with scope = 'PLATFORM'
  const platformTemplates = [
    {
      title: 'New Fleet Application Alert (SuperAdmin)',
      emailCode: 'SUPERADMIN_NEW_APPLICATION_ALERT',
      subject: '🚨 New Fleet Application Received: ###FleetName### (###BusinessCode###)',
      category: 'SAAS_LIFECYCLE',
      placeholders: '###FleetName###,###BusinessCode###,###OwnerName###,###ContactEmail###,###ContactPhone###,###City###,###State###,###PlanTier###,###BillingCycle###,###AgreedPrice###,###ReviewUrl###',
      message: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E0DAD1; border-radius: 12px; overflow: hidden;">
          <div style="background: #C04E24; padding: 20px 24px; color: #FFFFFF;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px;">FLEETFLOW SAAS PLATFORM</h1>
            <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">SuperAdmin Application Review Alert</p>
          </div>
          <div style="padding: 24px; color: #2B2927;">
            <h2 style="margin: 0 0 16px; font-size: 17px; color: #1C1A18;">New Fleet Application Received</h2>
            <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6;">A new fleet transport operator has submitted a registration application for review:</p>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
              <tr><td style="padding: 6px 0; color: #7A7570; width: 140px;">Fleet Name:</td><td style="padding: 6px 0; font-weight: 700; color: #1C1A18;">###FleetName###</td></tr>
              <tr><td style="padding: 6px 0; color: #7A7570;">Business Code:</td><td style="padding: 6px 0; font-weight: 700; color: #C04E24;">###BusinessCode###</td></tr>
              <tr><td style="padding: 6px 0; color: #7A7570;">Applicant / Owner:</td><td style="padding: 6px 0; font-weight: 600;">###OwnerName###</td></tr>
              <tr><td style="padding: 6px 0; color: #7A7570;">Contact Email:</td><td style="padding: 6px 0;">###ContactEmail###</td></tr>
              <tr><td style="padding: 6px 0; color: #7A7570;">Contact Phone:</td><td style="padding: 6px 0;">###ContactPhone###</td></tr>
              <tr><td style="padding: 6px 0; color: #7A7570;">Location:</td><td style="padding: 6px 0;">###City###, ###State###</td></tr>
              <tr><td style="padding: 6px 0; color: #7A7570;">Requested Plan:</td><td style="padding: 6px 0; font-weight: 700;">###PlanTier### (###BillingCycle###)</td></tr>
              <tr><td style="padding: 6px 0; color: #7A7570;">Agreed Price:</td><td style="padding: 6px 0; font-weight: 700; color: #2E7D32;">₹###AgreedPrice###</td></tr>
            </table>
            <div style="text-align: center; margin: 24px 0;">
              <a href="###ReviewUrl###" style="background: #C04E24; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">Review Application Queue &rarr;</a>
            </div>
          </div>
          <div style="background: #F5F2EB; padding: 14px 24px; text-align: center; font-size: 11px; color: #7A7570; border-top: 1px solid #E0DAD1;">
            FleetFlow SaaS Platform &bull; Automated Platform Administration Alert
          </div>
        </div>
      `,
    },
    {
      title: 'Fleet Application Received (Applicant)',
      emailCode: 'REGISTRATION_RECEIVED',
      subject: 'Application Received: Welcome to FleetFlow — ###FleetName###',
      category: 'SAAS_LIFECYCLE',
      placeholders: '###FleetName###,###OwnerName###,###BusinessCode###,###PlanTier###,###AgreedPrice###,###BillingCycle###,###SupportEmail###',
      message: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E0DAD1; border-radius: 12px; overflow: hidden;">
          <div style="background: #C04E24; padding: 20px 24px; color: #FFFFFF;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 800;">FLEETFLOW</h1>
            <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">Intelligent Fleet Mobility Platform</p>
          </div>
          <div style="padding: 24px; color: #2B2927;">
            <h2 style="margin: 0 0 16px; font-size: 17px; color: #1C1A18;">Hello ###OwnerName###,</h2>
            <p style="margin: 0 0 14px; font-size: 14px; line-height: 1.6;">Thank you for registering <strong>###FleetName###</strong> with FleetFlow!</p>
            <p style="margin: 0 0 14px; font-size: 14px; line-height: 1.6;">Your application has been received and is currently under review by our platform administration team.</p>
            <div style="background: #FDF6F0; border: 1px solid #F3D0BD; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0 0 8px; font-size: 13px;"><strong>Business Code:</strong> <span style="font-family: monospace; color: #C04E24;">###BusinessCode###</span></p>
              <p style="margin: 0 0 8px; font-size: 13px;"><strong>Selected Plan:</strong> ###PlanTier### (###BillingCycle###)</p>
              <p style="margin: 0; font-size: 13px;"><strong>Agreed Price:</strong> ₹###AgreedPrice###</p>
            </div>
            <p style="margin: 0 0 14px; font-size: 14px; line-height: 1.6;">Once approved, you will receive a secure activation invitation link to set up your administrator password and start managing your fleet.</p>
            <p style="margin: 0; font-size: 13px; color: #7A7570;">Need assistance? Contact us at <a href="mailto:###SupportEmail###" style="color: #C04E24;">###SupportEmail###</a></p>
          </div>
          <div style="background: #F5F2EB; padding: 14px 24px; text-align: center; font-size: 11px; color: #7A7570; border-top: 1px solid #E0DAD1;">
            FleetFlow SaaS Platform &bull; Automated Operational Notification
          </div>
        </div>
      `,
    },
    {
      title: 'Fleet Account Approved & Password Setup',
      emailCode: 'TENANT_ADMIN_ACTIVATION_LINK',
      subject: '🎉 Congratulations! Your FleetFlow Account is Approved: ###FleetName###',
      category: 'SAAS_LIFECYCLE',
      placeholders: '###FleetName###,###OwnerName###,###PlanTier###,###AgreedPrice###,###BillingCycle###,###ActivationUrl###,###LoginUrl###,###PlanSummaryPdfUrl###',
      message: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E0DAD1; border-radius: 12px; overflow: hidden;">
          <div style="background: #C04E24; padding: 20px 24px; color: #FFFFFF;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 800;">FLEETFLOW</h1>
            <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">Account Activation & Onboarding</p>
          </div>
          <div style="padding: 24px; color: #2B2927;">
            <h2 style="margin: 0 0 16px; font-size: 17px; color: #1C1A18;">Congratulations ###OwnerName###!</h2>
            <p style="margin: 0 0 14px; font-size: 14px; line-height: 1.6;">Your application for <strong>###FleetName###</strong> has been approved on FleetFlow SaaS Platform.</p>
            <div style="background: #FDF6F0; border: 1px solid #F3D0BD; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0 0 6px; font-size: 13px;"><strong>Plan:</strong> ###PlanTier###</p>
              <p style="margin: 0 0 6px; font-size: 13px;"><strong>Billing Cycle:</strong> ###BillingCycle###</p>
              <p style="margin: 0; font-size: 13px;"><strong>Agreed Rate:</strong> ₹###AgreedPrice### / ###BillingCycle###</p>
            </div>
            <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #1C1A18;">Step 1 — Set Up Your Password:</p>
            <p style="margin: 0 0 16px; font-size: 13px; color: #5C5752;">Click the secure link below to set your password. This link expires in 24 hours.</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="###ActivationUrl###" style="background: #C04E24; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">Set Up Administrator Password &rarr;</a>
            </div>
            <p style="margin: 20px 0 8px; font-size: 14px; font-weight: 700; color: #1C1A18;">Step 2 — Fleet Operator Dashboard:</p>
            <p style="margin: 0 0 16px; font-size: 13px; color: #5C5752;">Access your dashboard at: <a href="###LoginUrl###" style="color: #C04E24;">###LoginUrl###</a></p>
          </div>
          <div style="background: #F5F2EB; padding: 14px 24px; text-align: center; font-size: 11px; color: #7A7570; border-top: 1px solid #E0DAD1;">
            FleetFlow SaaS Platform &bull; Keep this email for your records
          </div>
        </div>
      `,
    },
    {
      title: 'Fleet Application Rejection Notice',
      emailCode: 'REGISTRATION_REJECTED',
      subject: 'Update on Your FleetFlow Application: ###FleetName###',
      category: 'SAAS_LIFECYCLE',
      placeholders: '###FleetName###,###OwnerName###,###RejectionReason###,###SupportEmail###',
      message: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E0DAD1; border-radius: 12px; overflow: hidden;">
          <div style="background: #2B2927; padding: 20px 24px; color: #FFFFFF;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 800;">FLEETFLOW</h1>
            <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">Application Status Notice</p>
          </div>
          <div style="padding: 24px; color: #2B2927;">
            <h2 style="margin: 0 0 16px; font-size: 17px; color: #1C1A18;">Dear ###OwnerName###,</h2>
            <p style="margin: 0 0 14px; font-size: 14px; line-height: 1.6;">Thank you for your interest in FleetFlow. After review, we are unable to approve the application for <strong>###FleetName###</strong> at this time.</p>
            <div style="background: #FFF5F5; border: 1px solid #FED7D7; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #C53030; text-transform: uppercase;">Reason for Decision:</p>
              <p style="margin: 0; font-size: 14px; color: #2D3748;">###RejectionReason###</p>
            </div>
            <p style="margin: 0 0 14px; font-size: 13px; line-height: 1.6; color: #5C5752;">If you would like to clarify details, update documentation, or reapply, please contact our support team at <a href="mailto:###SupportEmail###" style="color: #C04E24;">###SupportEmail###</a>.</p>
          </div>
          <div style="background: #F5F2EB; padding: 14px 24px; text-align: center; font-size: 11px; color: #7A7570; border-top: 1px solid #E0DAD1;">
            FleetFlow SaaS Platform Team
          </div>
        </div>
      `,
    },
    {
      title: 'Subscription Payment Receipt',
      emailCode: 'SUBSCRIPTION_PAYMENT_RECEIPT',
      subject: 'Payment Receipt: FleetFlow Subscription Invoice ###InvoiceNumber###',
      category: 'BILLING',
      placeholders: '###FleetName###,###InvoiceNumber###,###PlanTier###,###BillingCycle###,###TotalAmount###,###TransactionReference###,###PeriodEnd###,###DashboardUrl###',
      message: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E0DAD1; border-radius: 12px; overflow: hidden;">
          <div style="background: #C04E24; padding: 20px 24px; color: #FFFFFF;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 800;">FLEETFLOW</h1>
            <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">Official Payment Receipt</p>
          </div>
          <div style="padding: 24px; color: #2B2927;">
            <h2 style="margin: 0 0 16px; font-size: 17px; color: #1C1A18;">Payment Successfully Processed</h2>
            <p style="margin: 0 0 14px; font-size: 14px; line-height: 1.6;">Thank you for your payment for <strong>###FleetName###</strong>. Your subscription has been activated with full platform access.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
              <tr><td style="padding: 6px 0; color: #7A7570; width: 140px;">Invoice Number:</td><td style="padding: 6px 0; font-weight: 700; color: #1C1A18;">###InvoiceNumber###</td></tr>
              <tr><td style="padding: 6px 0; color: #7A7570;">Plan Tier:</td><td style="padding: 6px 0; font-weight: 700;">###PlanTier### (###BillingCycle###)</td></tr>
              <tr><td style="padding: 6px 0; color: #7A7570;">Total Paid:</td><td style="padding: 6px 0; font-weight: 800; color: #2E7D32; font-size: 15px;">₹###TotalAmount### INR</td></tr>
              <tr><td style="padding: 6px 0; color: #7A7570;">Transaction Ref:</td><td style="padding: 6px 0; font-family: monospace;">###TransactionReference###</td></tr>
              <tr><td style="padding: 6px 0; color: #7A7570;">Valid Until:</td><td style="padding: 6px 0; font-weight: 700;">###PeriodEnd###</td></tr>
            </table>
            <div style="text-align: center; margin: 20px 0;">
              <a href="###DashboardUrl###" style="background: #C04E24; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">Go to Fleet Dashboard &rarr;</a>
            </div>
          </div>
          <div style="background: #F5F2EB; padding: 14px 24px; text-align: center; font-size: 11px; color: #7A7570; border-top: 1px solid #E0DAD1;">
            FleetFlow SaaS Platform &bull; Billing & Payments
          </div>
        </div>
      `,
    },
    {
      title: 'Subscription Renewal Reminder',
      emailCode: 'SUBSCRIPTION_RENEWAL_REMINDER',
      subject: 'Reminder: Your FleetFlow Subscription Renews in ###DaysRemaining### Days',
      category: 'BILLING',
      placeholders: '###FleetName###,###PlanTier###,###BillingCycle###,###DaysRemaining###,###ExpiryDate###,###RenewalAmount###,###RenewalUrl###',
      message: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E0DAD1; border-radius: 12px; overflow: hidden;">
          <div style="background: #C04E24; padding: 20px 24px; color: #FFFFFF;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 800;">FLEETFLOW</h1>
            <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">Subscription Renewal Notice</p>
          </div>
          <div style="padding: 24px; color: #2B2927;">
            <h2 style="margin: 0 0 16px; font-size: 17px; color: #1C1A18;">Dear Fleet Administrator,</h2>
            <p style="margin: 0 0 14px; font-size: 14px; line-height: 1.6;">Your <strong>###PlanTier###</strong> subscription for <strong>###FleetName###</strong> is scheduled to expire on <strong>###ExpiryDate###</strong> (in ###DaysRemaining### days).</p>
            <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6;">Please renew promptly to ensure uninterrupted dispatching, driver tracking, corporate invoicing, and booking operations.</p>
            <div style="background: #FDF6F0; border: 1px solid #F3D0BD; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0 0 6px; font-size: 13px;"><strong>Plan:</strong> ###PlanTier### (###BillingCycle###)</p>
              <p style="margin: 0 0 6px; font-size: 13px;"><strong>Renewal Amount:</strong> ₹###RenewalAmount###</p>
              <p style="margin: 0; font-size: 13px;"><strong>Renewal Date:</strong> ###ExpiryDate###</p>
            </div>
            <div style="text-align: center; margin: 24px 0;">
              <a href="###RenewalUrl###" style="background: #C04E24; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">Renew Subscription Online &rarr;</a>
            </div>
          </div>
          <div style="background: #F5F2EB; padding: 14px 24px; text-align: center; font-size: 11px; color: #7A7570; border-top: 1px solid #E0DAD1;">
            FleetFlow SaaS Platform &bull; Automated Subscription Reminder
          </div>
        </div>
      `,
    },
    {
      title: 'Subscription Grace Period Notice',
      emailCode: 'SUBSCRIPTION_GRACE_PERIOD_NOTICE',
      subject: 'Action Required: Your Fleet Subscription is Past Due (3-Day Grace Period)',
      category: 'BILLING',
      placeholders: '###FleetName###,###PlanTier###,###ExpiryDate###,###RenewalUrl###',
      message: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E0DAD1; border-radius: 12px; overflow: hidden;">
          <div style="background: #D97706; padding: 20px 24px; color: #FFFFFF;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 800;">FLEETFLOW</h1>
            <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">Grace Period Warning</p>
          </div>
          <div style="padding: 24px; color: #2B2927;">
            <h2 style="margin: 0 0 16px; font-size: 17px; color: #1C1A18;">Action Required: Past Due Notice</h2>
            <p style="margin: 0 0 14px; font-size: 14px; line-height: 1.6;">Your <strong>###PlanTier###</strong> subscription for <strong>###FleetName###</strong> expired on <strong>###ExpiryDate###</strong>.</p>
            <p style="margin: 0 0 14px; font-size: 14px; line-height: 1.6;">Your fleet has entered a <strong>3-day grace period</strong>. Your operations remain active, but you must renew immediately to avoid suspension of new dispatches and bookings.</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="###RenewalUrl###" style="background: #D97706; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">Pay & Renew Now &rarr;</a>
            </div>
          </div>
          <div style="background: #F5F2EB; padding: 14px 24px; text-align: center; font-size: 11px; color: #7A7570; border-top: 1px solid #E0DAD1;">
            FleetFlow SaaS Platform &bull; Automated Lifecycle Alert
          </div>
        </div>
      `,
    },
    {
      title: 'Subscription Suspension Notice',
      emailCode: 'SUBSCRIPTION_RESTRICTION_NOTICE',
      subject: 'Suspension Notice: Fleet Dispatch Restricted Due to Unpaid Subscription',
      category: 'BILLING',
      placeholders: '###FleetName###,###PlanTier###,###RenewalUrl###',
      message: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E0DAD1; border-radius: 12px; overflow: hidden;">
          <div style="background: #DC2626; padding: 20px 24px; color: #FFFFFF;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 800;">FLEETFLOW</h1>
            <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">Operations Suspension Notice</p>
          </div>
          <div style="padding: 24px; color: #2B2927;">
            <h2 style="margin: 0 0 16px; font-size: 17px; color: #1C1A18;">Fleet Operations Suspended</h2>
            <p style="margin: 0 0 14px; font-size: 14px; line-height: 1.6;">The subscription for <strong>###FleetName###</strong> has exceeded the 3-day grace period without renewal. Dispatching and new booking operations are currently restricted.</p>
            <p style="margin: 0 0 14px; font-size: 14px; line-height: 1.6;">Your historical data, vehicles, drivers, and reports are safely preserved. You can restore full operational access at any time by paying your renewal invoice.</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="###RenewalUrl###" style="background: #DC2626; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">Restore Full Access Now &rarr;</a>
            </div>
          </div>
          <div style="background: #F5F2EB; padding: 14px 24px; text-align: center; font-size: 11px; color: #7A7570; border-top: 1px solid #E0DAD1;">
            FleetFlow SaaS Platform &bull; Automated Lifecycle Alert
          </div>
        </div>
      `,
    },
    {
      title: 'Subscription Payment Failed',
      emailCode: 'SUBSCRIPTION_PAYMENT_FAILED',
      subject: 'Payment Failed: FleetFlow Subscription Invoice ###InvoiceNumber###',
      category: 'BILLING',
      placeholders: '###FleetName###,###InvoiceNumber###,###TotalAmount###,###FailureReason###,###RetryUrl###',
      message: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E0DAD1; border-radius: 12px; overflow: hidden;">
          <div style="background: #DC2626; padding: 20px 24px; color: #FFFFFF;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 800;">FLEETFLOW</h1>
            <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">Payment Failed Notice</p>
          </div>
          <div style="padding: 24px; color: #2B2927;">
            <h2 style="margin: 0 0 16px; font-size: 17px; color: #1C1A18;">Payment Unsuccessful</h2>
            <p style="margin: 0 0 14px; font-size: 14px; line-height: 1.6;">We were unable to process the payment for subscription invoice <strong>###InvoiceNumber###</strong> (###FleetName###).</p>
            <div style="background: #FFF5F5; border: 1px solid #FED7D7; border-radius: 8px; padding: 14px; margin: 16px 0;">
              <p style="margin: 0; font-size: 13px; color: #C53030;"><strong>Reason:</strong> ###FailureReason###</p>
            </div>
            <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6;">Please update your payment method or retry the transaction to maintain continuous fleet service.</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="###RetryUrl###" style="background: #C04E24; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">Retry Payment &rarr;</a>
            </div>
          </div>
          <div style="background: #F5F2EB; padding: 14px 24px; text-align: center; font-size: 11px; color: #7A7570; border-top: 1px solid #E0DAD1;">
            FleetFlow SaaS Platform &bull; Billing Department
          </div>
        </div>
      `,
    },
  ];

  for (const t of platformTemplates) {
    const [existing]: any = await sequelize.query(
      "SELECT emailConfigId FROM emailconfiguration WHERE emailCode = ? AND scope = 'PLATFORM'",
      { replacements: [t.emailCode], type: QueryTypes.SELECT }
    );

    if (existing) {
      await sequelize.query(
        `UPDATE emailconfiguration 
         SET title = ?, subject = ?, message = ?, category = ?, placeholders = ?, isActive = 1
         WHERE emailConfigId = ?`,
        {
          replacements: [t.title, t.subject, t.message.trim(), t.category, t.placeholders, existing.emailConfigId],
        }
      );
      console.log(`✓ Updated platform template: ${t.emailCode}`);
    } else {
      await sequelize.query(
        `INSERT INTO emailconfiguration 
         (emailConfigId, title, emailCode, subject, message, fromName, fromAddress, scope, category, placeholders, isActive, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, 'FleetFlow Platform', 'noreply@fleetflow.com', 'PLATFORM', ?, ?, 1, NOW(), NOW())`,
        {
          replacements: [uuidv4(), t.title, t.emailCode, t.subject, t.message.trim(), t.category, t.placeholders],
        }
      );
      console.log(`✓ Created platform template: ${t.emailCode}`);
    }
  }

  console.log('✓ Email template & subscription hardening migration completed successfully.');
}

if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
