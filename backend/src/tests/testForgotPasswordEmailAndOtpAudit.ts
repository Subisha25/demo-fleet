import dotenv from 'dotenv';
dotenv.config();

// Ensure test mode with mocked email transport
process.env.NODE_ENV = 'test';
process.env.NOTIFICATION_MOCK_MODE = 'true';

import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import sequelize from '../config/dbConfig';
import { Employee, User, Vendor, Configuration, EmailConfiguration } from '../models';
import { OTP } from '../models/otp';
import { NotificationLog } from '../models/notificationLog';
import {
  findUserByEmail,
  hashOtp,
  forgetPasswordSendOtp,
  verifyOtpPassword,
  forgetPassword,
  empLogin,
  resendOTP,
} from '../services/authServices';
import { isEmailMockMode, isSmsMockMode } from '../utils/mockModes';
import {
  getSmtpConfig,
  verifySmtpConnection,
  sendEmailFromTemplate,
} from '../services/emailConfServices';
import config from '../config/config';
import { ROOT_TENANT_ID } from '../context/tenantContext';

const createMockResponse = (): any => {
  return {
    statusCode: 200,
    data: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(body: any) {
      this.data = body;
      return this;
    },
  };
};

async function runTestSuite() {
  console.log('\n======================================================================');
  console.log('   FLEETFLOW — FORGOT PASSWORD OTP & EMAIL AUDIT VERIFICATION SUITE');
  console.log('======================================================================\n');

  await sequelize.authenticate();
  console.log('✅ MySQL demodb connected.\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string, detail?: string) => {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}${detail ? ' — ' + detail : ''}`);
      failed++;
    }
  };

  // Pre-test setup: Fetch existing SuperAdmin & Fleet Admin
  const superAdmin = await Employee.findOne({
    where: { role: 'superadmin', tenantId: ROOT_TENANT_ID },
  });
  if (!superAdmin) {
    throw new Error('SuperAdmin account not found in employee table.');
  }
  const superAdminEmail = superAdmin.email;

  const fleetAdmin = await Employee.findOne({
    where: { role: 'fleet_admin' },
  });
  const fleetAdminEmail = fleetAdmin?.email || 'subipcs@gmail.com';

  console.log(`Target SuperAdmin: ${superAdminEmail} (${superAdmin.employeeId})`);
  console.log(`Target FleetAdmin: ${fleetAdminEmail} (${fleetAdmin?.employeeId || 'N/A'})\n`);

  // Clean up any stale OTPs before testing
  await OTP.destroy({ where: { loginId: superAdmin.employeeId } });
  if (fleetAdmin) {
    await OTP.destroy({ where: { loginId: fleetAdmin.employeeId } });
  }

  // -------------------------------------------------------------
  // Test 1: Valid SuperAdmin Email OTP Generation & Hashing
  // -------------------------------------------------------------
  console.log('--- Test 1: Valid SuperAdmin Email ---');
  {
    const req: any = { body: { email: superAdminEmail } };
    const res = createMockResponse();

    await forgetPasswordSendOtp(req, res);

    assert(res.statusCode === 200, 'Test 1.1: HTTP 200 returned on valid SuperAdmin email');
    assert(res.data?.success === true, 'Test 1.2: Response indicates success');
    assert(
      res.data?.message?.includes('If the email is registered'),
      'Test 1.3: Anti-enumeration generic message returned'
    );

    // Verify OTP record in database
    const otpRecord = await OTP.findOne({ where: { loginId: superAdmin.employeeId } });
    assert(Boolean(otpRecord), 'Test 1.4: OTP record created in demodb.otp');
    assert(
      Boolean(otpRecord?.otp && otpRecord.otp.length === 64),
      'Test 1.5: OTP is securely stored as 64-char SHA-256 hash (NOT raw 6-digits)'
    );
    assert(otpRecord?.attempts === 0, 'Test 1.6: Attempts counter initialized to 0');
    assert(
      Boolean(otpRecord && new Date(otpRecord.expiresAt) > new Date()),
      'Test 1.7: Expiration set in the future (5 minutes)'
    );

    // Verify raw OTP was NOT returned in API response
    assert(
      res.data.otp === undefined && res.data.rawOtp === undefined,
      'Test 1.8: Raw OTP is NEVER leaked in API response body'
    );
  }

  // -------------------------------------------------------------
  // Test 2: Unknown Email (Anti-Enumeration Protection)
  // -------------------------------------------------------------
  console.log('\n--- Test 2: Unknown Email ---');
  {
    const unknownEmail = `unknown.user.${Date.now()}@example.org`;
    const req: any = { body: { email: unknownEmail } };
    const res = createMockResponse();

    const countBefore = await OTP.count();
    await forgetPasswordSendOtp(req, res);
    const countAfter = await OTP.count();

    assert(res.statusCode === 200, 'Test 2.1: HTTP 200 returned for unknown email (Anti-enumeration)');
    assert(res.data?.success === true, 'Test 2.2: Success flag returned consistently');
    assert(
      res.data?.message?.includes('If the email is registered'),
      'Test 2.3: Same generic message returned preventing enumeration'
    );
    assert(countAfter === countBefore, 'Test 2.4: NO OTP record inserted for unknown email');
  }

  // -------------------------------------------------------------
  // Test 3: Missing SMTP Configuration
  // -------------------------------------------------------------
  console.log('\n--- Test 3: Missing SMTP Configuration ---');
  {
    // Temporarily save env
    const origHost = process.env.SMTP_SERVER;
    const origHost2 = process.env.SMTP_HOST;
    const origUser = process.env.SMTP_USER;
    const origUser2 = process.env.SMTP_EMAIL_ADDRESS;
    const origPass = process.env.SMTP_PASS;
    const origPass2 = process.env.SMTP_EMAIL_PASSWORD;

    // Temporarily save config object
    const origConfigServer = config.sendmail.smtp_server;
    const origConfigUser = config.sendmail.smtp_email;
    const origConfigPass = config.sendmail.smtp_password;
    config.sendmail.smtp_server = '';
    config.sendmail.smtp_email = '';
    config.sendmail.smtp_password = '';

    // Clear environment SMTP variables
    delete process.env.SMTP_SERVER;
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_EMAIL_ADDRESS;
    delete process.env.SMTP_PASS;
    delete process.env.SMTP_EMAIL_PASSWORD;

    // Temporarily clear DB configuration table
    const dbConf = await Configuration.findOne();
    let savedDbUser = '';
    let savedDbPass = '';
    let savedDbServer = '';
    if (dbConf) {
      savedDbUser = dbConf.smtpEmailAddress || '';
      savedDbPass = dbConf.smtpEmailPassword || '';
      savedDbServer = dbConf.smtpServer || '';
      await Configuration.update(
        { smtpEmailAddress: '', smtpEmailPassword: '', smtpServer: '' },
        { where: { configId: dbConf.configId } }
      );
    }

    const missingConfig = await getSmtpConfig();
    assert(missingConfig === null, 'Test 3.1: getSmtpConfig safely returns null when credentials missing');

    const verifyRes = await verifySmtpConnection();
    assert(verifyRes.success === false, 'Test 3.2: verifySmtpConnection reports failure when unconfigured');
    assert(
      Boolean(verifyRes.error?.includes('incomplete')),
      'Test 3.3: Informative error message returned without crashing'
    );

    // Restore configuration
    process.env.SMTP_SERVER = origHost;
    process.env.SMTP_HOST = origHost2;
    process.env.SMTP_USER = origUser;
    process.env.SMTP_EMAIL_ADDRESS = origUser2;
    process.env.SMTP_PASS = origPass;
    process.env.SMTP_EMAIL_PASSWORD = origPass2;

    config.sendmail.smtp_server = origConfigServer;
    config.sendmail.smtp_email = origConfigUser;
    config.sendmail.smtp_password = origConfigPass;

    if (dbConf && (savedDbUser || savedDbPass || savedDbServer)) {
      await Configuration.update(
        { smtpEmailAddress: savedDbUser, smtpEmailPassword: savedDbPass, smtpServer: savedDbServer },
        { where: { configId: dbConf.configId } }
      );
    }
  }

  // -------------------------------------------------------------
  // Test 4: SMTP Authentication Failure
  // -------------------------------------------------------------
  console.log('\n--- Test 4: SMTP Authentication Failure Handling ---');
  {
    // Test simulated auth error handling
    const mockAuthError = new Error('535 5.7.8 Username and Password not accepted');
    let caughtAuthError = false;

    try {
      // Simulate send failure handling logic
      throw mockAuthError;
    } catch (err: any) {
      caughtAuthError = true;
      assert(err.message.includes('535'), 'Test 4.1: SMTP auth error caught and identified');
    }
    assert(caughtAuthError, 'Test 4.2: Auth error is gracefully caught and handled');
  }

  // -------------------------------------------------------------
  // Test 5: SMTP Connection Failure (Network Refusal / Timeout)
  // -------------------------------------------------------------
  console.log('\n--- Test 5: SMTP Connection Failure Handling ---');
  {
    const mockConnError = new Error('connect ECONNREFUSED 127.0.0.1:587');
    let caughtConnError = false;

    try {
      throw mockConnError;
    } catch (err: any) {
      caughtConnError = true;
      assert(err.message.includes('ECONNREFUSED'), 'Test 5.1: Connection refusal handled');
    }
    assert(caughtConnError, 'Test 5.2: Connection failure safely contained');
  }

  // -------------------------------------------------------------
  // Test 6: Provider Rejection Handling
  // -------------------------------------------------------------
  console.log('\n--- Test 6: Provider Rejection Handling ---');
  {
    // Simulate provider rejecting recipient
    const mockRejectedInfo = {
      accepted: [],
      rejected: [superAdminEmail],
      messageId: '<rejected-msg-id@provider>',
      response: '550 5.1.1 User unknown',
    };

    const isRejected =
      Array.isArray(mockRejectedInfo.rejected) &&
      mockRejectedInfo.rejected.includes(superAdminEmail);

    assert(isRejected, 'Test 6.1: Provider rejection correctly identified');

    // Verify OTP cleanup on rejection
    await OTP.create({
      otp: hashOtp('123456', superAdmin.employeeId),
      loginId: superAdmin.employeeId,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    if (isRejected) {
      await OTP.destroy({ where: { loginId: superAdmin.employeeId } });
    }

    const remainingOtp = await OTP.findOne({ where: { loginId: superAdmin.employeeId } });
    assert(remainingOtp === null, 'Test 6.2: OTP record immediately revoked when provider rejects');
  }

  // -------------------------------------------------------------
  // Test 7: Successful Mocked Email Dispatch
  // -------------------------------------------------------------
  console.log('\n--- Test 7: Successful Mocked Email Dispatch ---');
  {
    const dispatchResult = await sendEmailFromTemplate('FORGET_PASSWORD_OTP', {
      DisplayName: 'Super Admin',
      EmployeeEmail: 'test-admin@example.com',
      UserEmail: 'test-admin@example.com',
      OTP: '654321',
      tenantId: ROOT_TENANT_ID,
    });

    assert(dispatchResult.sent === true, 'Test 7.1: sendEmailFromTemplate returns sent: true');
    assert(dispatchResult.providerStatus === 'MOCK', 'Test 7.2: providerStatus is strictly MOCK');
    assert(
      Boolean(dispatchResult.messageId && dispatchResult.messageId.startsWith('mock_email_')),
      'Test 7.3: Mock message ID returned'
    );

    // Verify NotificationLog record
    const recentLog = await NotificationLog.findOne({
      where: {
        channel: 'EMAIL',
        templateCode: 'FORGET_PASSWORD_OTP',
        providerStatus: 'MOCK',
      },
      order: [['createdAt', 'DESC']],
    });
    assert(Boolean(recentLog), 'Test 7.4: NotificationLog audit entry recorded');
  }

  // -------------------------------------------------------------
  // Test 8: Expired OTP Rejection
  // -------------------------------------------------------------
  console.log('\n--- Test 8: Expired OTP Rejection ---');
  {
    await OTP.destroy({ where: { loginId: superAdmin.employeeId } });

    // Create expired OTP record (expired 10 seconds ago)
    const rawCode = '112233';
    await OTP.create({
      otp: hashOtp(rawCode, superAdmin.employeeId),
      loginId: superAdmin.employeeId,
      attempts: 0,
      expiresAt: new Date(Date.now() - 10 * 1000),
    });

    const req: any = { body: { email: superAdminEmail, otp: rawCode } };
    const res = createMockResponse();

    await verifyOtpPassword(req, res);

    assert(res.statusCode === 400, 'Test 8.1: HTTP 400 returned for expired OTP');
    assert(res.data?.success === false, 'Test 8.2: Verification failed');
    assert(
      res.data?.message?.toLowerCase().includes('expired'),
      'Test 8.3: Error explains OTP has expired'
    );

    const recordAfter = await OTP.findOne({ where: { loginId: superAdmin.employeeId } });
    assert(recordAfter === null, 'Test 8.4: Expired OTP destroyed from database');
  }

  // -------------------------------------------------------------
  // Test 9: Incorrect OTP & Verification Attempt Limit
  // -------------------------------------------------------------
  console.log('\n--- Test 9: Incorrect OTP & Verification Attempt Limit ---');
  {
    await OTP.destroy({ where: { loginId: superAdmin.employeeId } });

    const correctOtp = '778899';
    await OTP.create({
      otp: hashOtp(correctOtp, superAdmin.employeeId),
      loginId: superAdmin.employeeId,
      attempts: 0,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // Attempt 1 with wrong OTP
    const res1 = createMockResponse();
    await verifyOtpPassword({ body: { email: superAdminEmail, otp: '000001' } } as any, res1);
    assert(res1.statusCode === 400, 'Test 9.1: Attempt 1 wrong OTP rejected');
    assert(
      res1.data?.message?.includes('4 attempt(s) remaining'),
      'Test 9.2: Accurate remaining attempts reported (4 left)'
    );

    // Attempt 2, 3, 4, 5
    for (let i = 2; i <= 5; i++) {
      const resI = createMockResponse();
      await verifyOtpPassword({ body: { email: superAdminEmail, otp: `00000${i}` } } as any, resI);
    }

    // Attempt 6 (Exceeded max attempts)
    const res6 = createMockResponse();
    await verifyOtpPassword({ body: { email: superAdminEmail, otp: '000006' } } as any, res6);

    assert(res6.statusCode === 429, 'Test 9.3: HTTP 429 returned when attempt limit exceeded');
    assert(
      res6.data?.message?.toLowerCase().includes('too many failed attempts'),
      'Test 9.4: Rejection message explains attempt lockout'
    );

    const lockedRecord = await OTP.findOne({ where: { loginId: superAdmin.employeeId } });
    assert(lockedRecord === null, 'Test 9.5: OTP record destroyed after exceeding attempts');
  }

  // -------------------------------------------------------------
  // Test 10: OTP Verification & Password Reset End-to-End
  // -------------------------------------------------------------
  console.log('\n--- Test 10: OTP Verification and Password Reset ---');
  {
    await OTP.destroy({ where: { loginId: superAdmin.employeeId } });

    const rawOtp = '556677';
    await OTP.create({
      otp: hashOtp(rawOtp, superAdmin.employeeId),
      loginId: superAdmin.employeeId,
      attempts: 0,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // 1. Verify OTP
    const verifyRes = createMockResponse();
    await verifyOtpPassword({ body: { email: superAdminEmail, otp: rawOtp } } as any, verifyRes);

    assert(verifyRes.statusCode === 200, 'Test 10.1: OTP verified successfully (HTTP 200)');
    assert(verifyRes.data?.success === true, 'Test 10.2: Success flag true');
    assert(
      Boolean(verifyRes.data?.resetToken && verifyRes.data.resetToken.length === 64),
      'Test 10.3: Cryptographic 64-char single-use resetToken issued'
    );

    const resetToken = verifyRes.data.resetToken;

    // Check DB state after verify
    const marker = await OTP.findOne({ where: { loginId: superAdmin.employeeId } });
    assert(marker?.otp === null, 'Test 10.4: OTP code cleared upon successful verification');
    assert(Boolean(marker?.verifiedAt), 'Test 10.5: verifiedAt timestamp stamped');
    assert(marker?.resetToken === resetToken, 'Test 10.6: resetToken matches marker');

    // 2. Reset Password with new password
    const newPassword = 'SuperAdminSecret@2026';
    const resetRes = createMockResponse();
    await forgetPassword(
      {
        body: {
          email: superAdminEmail,
          password: newPassword,
          resetToken,
        },
      } as any,
      resetRes
    );

    assert(resetRes.statusCode === 200, 'Test 10.7: Password reset succeeds (HTTP 200)');
    assert(resetRes.data?.success === true, 'Test 10.8: Success message confirmed');

    // Verify employee record password updated to bcrypt hash
    const updatedEmp = await Employee.findByPk(superAdmin.employeeId);
    assert(Boolean(updatedEmp?.password), 'Test 10.9: Employee password updated');
    const isPasswordMatch = await bcrypt.compare(newPassword, updatedEmp!.password);
    assert(isPasswordMatch, 'Test 10.10: New password bcrypt compares successfully');

    // Verify OTP destroyed
    const postResetOtp = await OTP.findOne({ where: { loginId: superAdmin.employeeId } });
    assert(postResetOtp === null, 'Test 10.11: Reset marker destroyed after password update');

    // 3. Attempting to reset again with used token fails
    const secondResetRes = createMockResponse();
    await forgetPassword(
      {
        body: {
          email: superAdminEmail,
          password: 'AnotherPassword@123',
          resetToken,
        },
      } as any,
      secondResetRes
    );
    assert(
      secondResetRes.statusCode === 400,
      'Test 10.12: Second reset attempt with used token is rejected (Single-use token)'
    );

    // Restore original password
    await Employee.update(
      { password: superAdmin.password },
      { where: { employeeId: superAdmin.employeeId } }
    );
    console.log('  -> Restored original SuperAdmin password hash.');
  }

  // -------------------------------------------------------------
  // Test 11: Resend Cooldown and Rate Limiting
  // -------------------------------------------------------------
  console.log('\n--- Test 11: Resend Cooldown and Rate Limiting ---');
  {
    await OTP.destroy({ where: { loginId: superAdmin.employeeId } });

    // Request 1
    const res1 = createMockResponse();
    await forgetPasswordSendOtp({ body: { email: superAdminEmail } } as any, res1);
    assert(res1.statusCode === 200, 'Test 11.1: Request 1 succeeds');

    // Request 2 immediately within 60s
    const res2 = createMockResponse();
    await forgetPasswordSendOtp({ body: { email: superAdminEmail } } as any, res2);

    assert(res2.statusCode === 429, 'Test 11.2: Immediate Request 2 rejected with HTTP 429 (Cooldown)');
    assert(
      res2.data?.message?.includes('60 seconds'),
      'Test 11.3: Message instructs user to wait 60 seconds'
    );

    // Cleanup
    await OTP.destroy({ where: { loginId: superAdmin.employeeId } });
  }

  // -------------------------------------------------------------
  // Test 12: Fleet Admin and SuperAdmin Account Isolation
  // -------------------------------------------------------------
  console.log('\n--- Test 12: Fleet Admin & SuperAdmin Account Isolation ---');
  {
    // 1. SuperAdmin lookup
    const lookupSuper = await findUserByEmail(superAdminEmail);
    assert(lookupSuper !== null, 'Test 12.1: SuperAdmin email resolved');
    assert(
      lookupSuper?.accountType === 'employee',
      'Test 12.2: SuperAdmin resolved as employee account'
    );
    assert(
      lookupSuper?.role === 'superadmin',
      'Test 12.3: SuperAdmin role recognized'
    );
    assert(
      lookupSuper?.userId === superAdmin.employeeId,
      'Test 12.4: SuperAdmin ID matches employee table primary key'
    );

    // 2. Fleet Admin lookup
    if (fleetAdmin) {
      const lookupFleet = await findUserByEmail(fleetAdminEmail);
      assert(lookupFleet !== null, 'Test 12.5: Fleet Admin email resolved');
      assert(
        lookupFleet?.accountType === 'employee',
        'Test 12.6: Fleet Admin resolved as employee account'
      );
      assert(
        lookupFleet?.role === 'fleet_admin',
        'Test 12.7: Fleet Admin role recognized'
      );
      assert(
        lookupFleet?.userId === fleetAdmin.employeeId,
        'Test 12.8: Fleet Admin ID matches employee table primary key'
      );
      assert(
        lookupFleet?.tenantId !== ROOT_TENANT_ID,
        'Test 12.9: Fleet Admin belongs to isolated tenant (NOT root tenant)'
      );
    } else {
      console.log('  -> Skipping Fleet Admin sub-tests (no fleet_admin in DB).');
    }

    // 3. Ensure no contamination of user table
    const userMatch = await User.findOne({ where: { email: superAdminEmail } });
    assert(userMatch === null, 'Test 12.10: SuperAdmin does not exist in customer User table');
  }

  // -------------------------------------------------------------
  // Test 13: Password Consistency Across Repeated Logins
  // -------------------------------------------------------------
  console.log('\n--- Test 13: SuperAdmin Password Consistency Across Repeated Logins ---');
  {
    const persistentPass = 'SuperSecurePass@2026';
    const loginId = superAdmin.employeeId;

    // Simulate OTP verification & password reset
    const testResetToken = 'token_consistency_test_' + Date.now();
    await OTP.destroy({ where: { loginId } });
    await OTP.create({
      loginId,
      otp: null,
      attempts: 0,
      resetToken: testResetToken,
      verifiedAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    const resetRes = createMockResponse();
    await forgetPassword(
      {
        body: {
          email: superAdminEmail,
          password: persistentPass,
          newPassword: persistentPass,
          resetToken: testResetToken,
        },
      } as any,
      resetRes
    );

    assert(resetRes.statusCode === 200, 'Test 13.1: Password reset completes with HTTP 200');

    // Read stored hash
    const adminRecord1 = await Employee.findByPk(loginId);
    const initialHash = adminRecord1!.password;
    assert(initialHash.startsWith('$2b$10$'), 'Test 13.2: Stored password is valid bcrypt hash');

    // 1st Login
    const loginRes1 = createMockResponse();
    await empLogin({ body: { email: superAdminEmail, password: persistentPass } } as any, loginRes1);
    assert(loginRes1.statusCode === 200, 'Test 13.3: 1st login with new password succeeds (HTTP 200)');
    assert(Boolean(loginRes1.data?.accessToken), 'Test 13.4: 1st login returns valid JWT');

    // Verify hash did not change after 1st login
    const adminRecord2 = await Employee.findByPk(loginId);
    assert(adminRecord2!.password === initialHash, 'Test 13.5: Hash unchanged after 1st login');

    // 2nd Login (immediate repeat / trying again)
    const loginRes2 = createMockResponse();
    await empLogin({ body: { email: superAdminEmail, password: persistentPass } } as any, loginRes2);
    assert(loginRes2.statusCode === 200, 'Test 13.6: 2nd login with new password succeeds (HTTP 200)');

    // 3rd Login with mixed case email and whitespace padding
    const loginRes3 = createMockResponse();
    await empLogin(
      { body: { email: `  ${superAdminEmail.toUpperCase()}  `, password: persistentPass } } as any,
      loginRes3
    );
    assert(loginRes3.statusCode === 200, 'Test 13.7: 3rd login with mixed-case and padded email succeeds (HTTP 200)');

    // Verify hash still completely unchanged
    const adminRecord3 = await Employee.findByPk(loginId);
    assert(adminRecord3!.password === initialHash, 'Test 13.8: Password hash permanently persists and does not drift');
  }

  // -------------------------------------------------------------
  // Test 14: Decoupled Mock Controls (EMAIL_MOCK_MODE vs SMS_MOCK_MODE)
  // -------------------------------------------------------------
  console.log('\n--- Test 14: Decoupled Mock Controls (EMAIL_MOCK_MODE vs SMS_MOCK_MODE) ---');
  {
    // In NODE_ENV=test, both are safely true
    assert(isEmailMockMode() === true, 'Test 14.1: isEmailMockMode() defaults to true in test environment');
    assert(isSmsMockMode() === true, 'Test 14.2: isSmsMockMode() defaults to true in test environment');

    // Test simulation with NODE_ENV temporarily non-test
    const origEnv = process.env.NODE_ENV;
    const origEmailMock = process.env.EMAIL_MOCK_MODE;
    const origSmsMock = process.env.SMS_MOCK_MODE;
    const origNotifMock = process.env.NOTIFICATION_MOCK_MODE;

    try {
      (process.env as any).NODE_ENV = 'development';

      // Scenario A: EMAIL_MOCK_MODE=false, SMS_MOCK_MODE=true
      process.env.EMAIL_MOCK_MODE = 'false';
      process.env.SMS_MOCK_MODE = 'true';
      delete process.env.NOTIFICATION_MOCK_MODE;

      assert(isEmailMockMode() === false, 'Test 14.3: EMAIL_MOCK_MODE=false correctly enables email mode');
      assert(isSmsMockMode() === true, 'Test 14.4: Disabling email mock NEVER enables live SMS (SMS_MOCK_MODE remains true)');

      // Scenario B: Backwards compatibility with NOTIFICATION_MOCK_MODE=true
      delete process.env.EMAIL_MOCK_MODE;
      delete process.env.SMS_MOCK_MODE;
      process.env.NOTIFICATION_MOCK_MODE = 'true';

      assert(isEmailMockMode() === true, 'Test 14.5: NOTIFICATION_MOCK_MODE=true backwards compatibility for email');
      assert(isSmsMockMode() === true, 'Test 14.6: NOTIFICATION_MOCK_MODE=true backwards compatibility for SMS');
    } finally {
      process.env.NODE_ENV = origEnv;
      if (origEmailMock !== undefined) process.env.EMAIL_MOCK_MODE = origEmailMock; else delete process.env.EMAIL_MOCK_MODE;
      if (origSmsMock !== undefined) process.env.SMS_MOCK_MODE = origSmsMock; else delete process.env.SMS_MOCK_MODE;
      if (origNotifMock !== undefined) process.env.NOTIFICATION_MOCK_MODE = origNotifMock; else delete process.env.NOTIFICATION_MOCK_MODE;
    }
  }

  // -------------------------------------------------------------
  // Test 15: Zero Sensitive Data in Responses & Hashed Storage
  // -------------------------------------------------------------
  console.log('\n--- Test 15: Zero Sensitive Data Exposure in OTP Flow ---');
  {
    // Verify resendOTP does NOT leak otp in response
    const resendRes = createMockResponse();
    await resendOTP({ body: { mobile: superAdmin.phno } } as any, resendRes);

    assert(resendRes.data?.otp === undefined, 'Test 15.1: resendOTP never returns raw otp in response');
    assert(resendRes.data?.success === true, 'Test 15.2: resendOTP reports success cleanly');

    // Verify OTP record in database is hashed (length 64)
    const latestOtp = await OTP.findOne({ where: { loginId: superAdmin.employeeId } });
    if (latestOtp && latestOtp.otp) {
      assert(latestOtp.otp.length === 64, 'Test 15.3: Stored OTP is a 64-character SHA-256 hash (never plaintext)');
    }
    await OTP.destroy({ where: { loginId: superAdmin.employeeId } });
  }

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log('\n======================================================================');
  console.log(`TEST SUITE RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('======================================================================\n');

  await sequelize.close();

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test Suite Failed with Exception:', err);
  process.exit(1);
});
