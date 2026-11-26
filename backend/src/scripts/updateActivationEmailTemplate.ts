import { EmailConfiguration } from '../models/emailConfiguration';
import { connectDB } from '../models';

async function updateTemplate() {
  await connectDB();

  const trialActivationHtml = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
  <div style="background: linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%); padding: 28px 32px; color: #FFFFFF;">
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #FFFFFF;">CABZ</h1>
      <span style="background: rgba(255, 255, 255, 0.15); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid rgba(255, 255, 255, 0.2);">7-Day Free Trial</span>
    </div>
    <p style="margin: 8px 0 0; font-size: 13px; color: #E0E7FF; opacity: 0.95;">Fleet Registration Approved &amp; Free Trial Activated</p>
  </div>

  <div style="padding: 32px; color: #1E293B;">
    <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 700; color: #0F172A;">Congratulations ###OwnerName###!</h2>
    <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #334155;">
      Your fleet registration for <strong>###FleetName###</strong> has been approved by the platform administrator. Your <strong>7-Day Free Trial</strong> is now active with unrestricted access across the CABZ Smart Fleet Mobility platform.
    </p>

    <!-- Free Trial Details Box -->
    <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 20px; margin: 24px 0;">
      <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #4338CA; margin-bottom: 12px;">
        ★ 7-Day Free Trial Details
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; line-height: 1.8;">
        <tr>
          <td style="color: #64748B; width: 35%; padding: 3px 0;">Trial Status:</td>
          <td style="color: #047857; font-weight: 700; padding: 3px 0;">● FREE TRIAL ACTIVE</td>
        </tr>
        <tr>
          <td style="color: #64748B; padding: 3px 0;">Duration:</td>
          <td style="color: #0F172A; font-weight: 600; padding: 3px 0;">7 Days (Full Operational Access)</td>
        </tr>
        <tr>
          <td style="color: #64748B; padding: 3px 0;">Start Date &amp; Time:</td>
          <td style="color: #0F172A; font-weight: 600; padding: 3px 0;">###TrialStartDate###</td>
        </tr>
        <tr>
          <td style="color: #64748B; padding: 3px 0;">End Date &amp; Time:</td>
          <td style="color: #0F172A; font-weight: 600; padding: 3px 0;">###TrialEndDate###</td>
        </tr>
        <tr>
          <td style="color: #64748B; padding: 3px 0;">Included Features:</td>
          <td style="color: #0F172A; font-weight: 600; padding: 3px 0;">All Features (Vehicles, Drivers, Corporate Accounts, Bookings &amp; Dispatch)</td>
        </tr>
      </table>
    </div>

    <!-- Free Trial Exploration Notice -->
    <div style="background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 14px 18px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #1E40AF;">
        <strong>Explore &amp; Operate Without Restrictions:</strong> During your 7-day free trial, you can test and use all fleet operations without any upfront payment. You can choose a paid subscription plan anytime directly from your dashboard before or at trial expiry.
      </p>
    </div>

    <!-- Step 1: Set Up Password -->
    <div style="margin: 28px 0 20px;">
      <h3 style="margin: 0 0 8px; font-size: 15px; font-weight: 700; color: #0F172A;">Step 1 — Set Up Your Administrator Password</h3>
      <p style="margin: 0 0 16px; font-size: 13px; color: #64748B;">Click the secure link below to set your password and activate your administrator login. This link is valid for 24 hours.</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="###ActivationUrl###" style="background: linear-gradient(135deg, #4338CA 0%, #3730A3 100%); color: #FFFFFF; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 10px rgba(67, 56, 202, 0.3);">
          Set Up Administrator Password &rarr;
        </a>
      </div>
      <p style="margin: 0; font-size: 12px; color: #94A3B8; text-align: center;">Or copy and paste this link in your browser: <br><a href="###ActivationUrl###" style="color: #4338CA; word-break: break-all;">###ActivationUrl###</a></p>
    </div>

    <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 28px 0;">

    <!-- Step 2: Dedicated Fleet Portal -->
    <div>
      <h3 style="margin: 0 0 8px; font-size: 15px; font-weight: 700; color: #0F172A;">Step 2 — Dedicated Fleet Login Portal</h3>
      <p style="margin: 0 0 10px; font-size: 13px; color: #64748B;">Once your password is set, bookmark and access your branded fleet portal at your unique URL:</p>
      <div style="background: #F1F5F9; border-radius: 6px; padding: 12px 16px; font-size: 13px; color: #0F172A;">
        <a href="###LoginUrl###" style="color: #4338CA; font-weight: 600; text-decoration: none;">###LoginUrl###</a>
      </div>
    </div>
  </div>

  <div style="background: #F8FAFC; padding: 18px 32px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0;">
    CABZ SaaS Platform &bull; Smart Fleet Mobility &bull; Need help? Contact <a href="mailto:support@cabz.com" style="color: #4338CA;">support@cabz.com</a>
  </div>
</div>
`;

  const existing = await EmailConfiguration.findOne({ where: { emailCode: 'TENANT_ADMIN_ACTIVATION_LINK' } });
  if (existing) {
    await existing.update({
      title: 'Fleet Account Approved & 7-Day Free Trial Activated',
      subject: 'CABZ – Your Fleet Registration Is Approved | 7-Day Free Trial Activated',
      fromName: 'CABZ Platform',
      message: trialActivationHtml.trim(),
    });
    console.log('Updated existing TENANT_ADMIN_ACTIVATION_LINK template in database.');
  } else {
    await EmailConfiguration.create({
      title: 'Fleet Account Approved & 7-Day Free Trial Activated',
      emailCode: 'TENANT_ADMIN_ACTIVATION_LINK',
      subject: 'CABZ – Your Fleet Registration Is Approved | 7-Day Free Trial Activated',
      fromName: 'CABZ Platform',
      fromAddress: 'admin@cabz.com',
      message: trialActivationHtml.trim(),
      emailBcc: '',
      category: 'SAAS_LIFECYCLE',
    });
    console.log('Created new TENANT_ADMIN_ACTIVATION_LINK template in database.');
  }
}

updateTemplate().then(() => {
  console.log('Template update completed successfully.');
  process.exit(0);
}).catch(err => {
  console.error('Error updating template:', err);
  process.exit(1);
});
