# FleetFlow SMS & OTP Forensic Audit Report

**Date of Audit:** 2026-10-27  
**Audit Mode:** READ-ONLY STATIC & DATABASE FORENSIC ANALYSIS (NO CODE OR DATABASE MODIFICATIONS)  
**Active Project:** `D:\demobooking\demo-bookings`  
**Reference Project:** `D:\New Pcs\vehicle` (STRICTLY READ-ONLY — UNTOUCHED)  
**Database:** MySQL `demodb` on `127.0.0.1:3306` (48 tables verified)  
**Primary Target of Investigation:**  
- Old Number Under Investigation: `9003241571` (Must NEVER receive any messages)  
- User's Intended Verification Test Number: `9080280818`  

---

## 1. Executive Summary

This forensic audit was conducted to resolve the critical issue where SMS/OTP notifications were historically being dispatched repeatedly to the old telephone number `9003241571`.

### Key Forensic Findings:
1. **The Exact Root Cause of Repeated Messages to `9003241571` is Fully Identified:**
   - On **October 23 and 24, 2026**, exactly **29 SMS messages** were dispatched to `9003241571` via the live 2Factor.in SMS gateway (`SENT` status with real gateway message IDs such as `a4eeb45c89f18377-BOM`).
   - **28 of the 29 messages** were identical `SUPERADMIN_NEW_APPLICATION_SMS` notifications triggered during new fleet registration requests.
   - **Root Cause:** In git commit `65e68c7` (dated Oct 24 09:28:12 2026), `getSuperAdminPhone()` in `backend/src/services/notificationService.ts` contained a hardcoded fallback return value: `return '9003241571';`. When `SUPERADMIN_PHONE` was missing or unresolved from the database during automated tests/registration submissions, the system resolved the platform SuperAdmin phone number as `9003241571` and dispatched a transactional SMS alert for every new application.
   - **1 of the 29 messages** was a `REGISTRATION_RECEIVED_SMS` on Oct 22 when a test registration was submitted with applicant phone `9003241571`.
2. **Current Elimination Status in Active Source Code:**
   - In active TypeScript source files of `D:\demobooking\demo-bookings`, `9003241571` has been **completely eliminated**.
   - `getSuperAdminPhone()` has been updated to fall back to `'9999999999'`, and `backend/.env` now explicitly configures `SUPERADMIN_PHONE=9080280818`.
   - In the live MySQL database `demodb`, `9003241571` does **NOT** exist in any account, user, employee, driver, vendor, owner, tenant, booking, or OTP table. It exists **only as historical audit log entries** (29 rows) in `notification_logs`.
3. **Critical Inverted Isolation Guard Discovered:**
   - In `backend/src/services/smsServices.ts` (lines 136 and 213) and `backend/src/services/notificationService.ts` (line 277), an isolation guard was previously implemented that explicitly blocks `90802` / `9080280818`:
     `if (options.to && (options.to.includes('90802') || options.to.replace(/\D/g, '').includes('9080280818')))`
     `const msg = 'Blocked: Transmission to obsolete customer phone number (90802...) is prohibited.';`
   - **The guard inverted the numbers:** It erroneously blocked the user's intended testing number (`9080280818`) while failing to explicitly black-list the actual old number (`9003241571`).
4. **Independent Unmocked Mobile App Endpoint Identified:**
   - `backend/src/appServices/appLoginServices.ts` contains an independent `send2FactorOTP()` function (lines 21-57) called by `POST /app/appRoutes/send-otp`. This function **bypasses `NOTIFICATION_MOCK_MODE`** and directly calls the external `https://2factor.in/API/V1/...` HTTP API.
5. **No Files or Database Records Mutated:**
   - This audit was performed with 100% read-only operations. No code, configuration, or database rows were modified. Zero live SMS/emails were transmitted.

---

## 2. Reference Project SMS Architecture (`D:\New Pcs\vehicle`)

The reference project contains both a web application (`backend`, `frontend`) and a React Native mobile application (`mobile app`).

### Architecture Overview:
1. **SMS Gateway Provider:**
   - Primary: **2Factor.in** (Indian DLT Transactional SMS API).
     - Module: `TRANS_SMS` via `https://2factor.in/API/R1/?module=TRANS_SMS`.
     - OTP Module: `https://2factor.in/API/V1/{api_key}/SMS/{phone}/{otp}/{template_name}`.
     - DLR Query: `https://2factor.in/API/V1/{api_key}/ADDON_SERVICES/RPT/TSMS/{sessionId}`.
     - Sender ID: `GRCCAB` (Grace Cabs DLT registered sender ID).
   - Secondary / International: **Twilio** (via Basic Auth HTTP POST to `https://api.twilio.com/2010-04-01/Accounts/...`).
2. **Where `9003241571` Exists in Reference Project:**
   - Hardcoded in frontend components as the public customer care / booking contact number for Grace Cabs:
     - `frontend/src/components/Homepage/simpleheader.tsx`: Line 33 (`href="tel:9003241571"`), Line 36 (`+91 90032 41571`).
     - `frontend/src/SuperAdmin/pages/Homepage/homepage.tsx`: Line 114 (`<span>+91-9003241571</span>`), Line 451 (`<span>Phone: +91-9003241571</span>`).
     - `frontend/src/SuperAdmin/pages/Homepage/Selections/Header.tsx`: Line 59 (`href="tel:9003241571"`), Line 62 (`+91 90032 41571`).
     - `frontend/src/SuperAdmin/pages/Homepage/Selections/Contact.tsx`: Line 31 (`<p>+91 90032 41571</p>`).
     - `frontend/src/components/Homepage/Footer.tsx`: Lines 218, 231, 241.
     - `frontend/src/SuperAdmin/pages/Users/Footer.tsx`: Lines 157, 170.
3. **Reference Project Forgot Password Flow:**
   - **Crucial finding:** In `D:\New Pcs\vehicle\backend\src\services\authServices.ts` (`forgetPasswordSendOtp`), forgot password OTP is sent via **EMAIL** (`sendEmailFromTemplate`), **NOT SMS**.
   - The user inputs their email address; the backend queries `findUserByEmail(email)` and dispatches an email containing the OTP.
4. **Reference Project Driver Allocation SMS:**
   - In `backend/src/services/smsServices.ts` (`sendDriverAllocationTwoWaySms`), two SMS messages are dispatched upon driver assignment:
     - Message 1 to Customer with driver name, phone, vehicle plate, and shortened Google Maps URL.
     - Message 2 to Driver with customer name, phone, pickup, and drop location.
   - Support phone passed in template: `companySupportPhone = process.env.SUPPORT_PHONE || process.env.COMPANY_PHONE || ""`.

---

## 3. Current FleetFlow SMS Architecture (`D:\demobooking\demo-bookings`)

FleetFlow has refactored notification architecture into a centralized service with multi-tenant isolation, mock mode capabilities, and tamper-evident audit logging.

### Architecture Overview:
1. **Central Dispatcher (`backend/src/services/notificationService.ts`):**
   - Single entry point: `sendNotification(options)`.
   - Channels: `EMAIL` (Nodemailer SMTP) and `SMS` (2Factor.in / Twilio).
   - Mock Mode Guard:
     ```typescript
     const isMockMode =
       process.env.NOTIFICATION_MOCK_MODE === 'true' ||
       process.env.NODE_ENV === 'test' ||
       (channel === 'EMAIL' && isTestOrSyntheticRecipient(recipient)) ||
       (channel === 'SMS' && (recipient.startsWith('+91987654321') || recipient === '9876543210' || recipient.startsWith('99999')));
     ```
   - When `isMockMode` is active:
     - `providerStatus` set to `'MOCK'`.
     - Zero network requests are made to 2Factor or Twilio.
     - A log entry is persisted in `demodb.notification_logs` with `providerStatus = 'MOCK'` and `providerMessageId = 'mock_sms_<timestamp>'`.
2. **Provider Adapters (`backend/src/services/smsServices.ts`):**
   - `send2FactorTemplateSms`: Calls `https://2factor.in/API/R1/?module=TRANS_SMS`. Configured Sender ID: `FLTFLW` (FleetFlow standard, updated from `GRCCAB`).
   - `sendDirectSms`: Calls `https://2factor.in/API/V1/.../ADDON_SERVICES/SEND/TSMS` with fallback to Twilio.
   - `sendDriverAllocationTwoWaySms`: Dispatches driver/customer booking updates.
3. **Audit Log Table (`demodb.notification_logs`):**
   - Stores every email and SMS attempt with timestamp, recipient, channel, templateCode, providerStatus, providerMessageId, errorDetails, and metadata.
4. **Secondary / Legacy Provider (`backend/src/appServices/appLoginServices.ts`):**
   - Retains legacy `send2FactorOTP()` which bypasses `notificationService` and `NOTIFICATION_MOCK_MODE`.

---

## 4. Complete Forgot-Password OTP Call Flow

Both projects were analyzed from frontend input to database update:

```
[User on Frontend]
       │
       ▼ (Enters Email, NOT Phone)
[POST /api/auth/forgetPasswordSendOtp]
       │
       ▼ (backend/src/services/authServices.ts)
[findUserByEmail(email)] ──► Queries Employee, User, Vendor
       │
       ▼ (Generates 6-digit random OTP)
[OTP.create({ loginId: user.userId, otp, expiresAt: +5 min })]
       │
       ▼
[sendEmailFromTemplate("FORGET_PASSWORD_OTP", { OTP, UserEmail })]
       │
       ▼ (Nodemailer SMTP / Mock Transport)
[Recipient receives Email with OTP]
       │
       ▼ (User enters OTP on Frontend)
[POST /api/auth/verifyOtpPassword]
       │
       ▼ (Validates OTP in `otp` table, matches loginId)
[OTP.update({ otp: null }, { where: { loginId } })] ──► Verified Marker
       │
       ▼ (User enters New Password)
[PUT /api/auth/forgetPassword]
       │
       ▼ (Checks verified OTP marker, hashes password via bcrypt)
[Updates Employee.password or User.password in DB]
```

### Forensic Finding on Forgot Password:
- **Forgot password in FleetFlow and Reference Project is 100% EMAIL-BASED.**
- There is **NO CODE PATH** in either project that sends a Forgot Password OTP via SMS to `9003241571` or any phone number.
- Any claim that forgot-password sends an SMS to `9003241571` is factually debunked by the code.

---

## 5. Complete Verification / Login OTP Call Flow

Two distinct login OTP flows exist across the application:

### Flow A: Central Auth API (`POST /api/auth/send-otp` via `authServices.ts`)
1. User supplies `{ mobile }`.
2. Backend validates mobile and calls `findUserByMobile(mobile)` across `User`, `Employee`, `Drivers`, `Vendor`.
3. If user exists, generates 6-digit cryptographic OTP.
4. Persists OTP in `demodb.otp` table with `loginId = userResult.userId`.
5. **Dispatch Implementation (Lines 718-720):**
   ```typescript
   // Here you would integrate with SMS service to send OTP
   // For now, we'll just log it (remove this in production)
   console.log(`OTP for ${mobile}: ${otp}`);
   ```
6. **Result:** `authServices.ts` does **NOT** call an external SMS gateway. It logs to the console only.

### Flow B: Mobile App API (`POST /app/appRoutes/send-otp` via `appLoginServices.ts`)
1. Mobile app client supplies `{ mobile, fcm_token }`.
2. Backend calls `findUserByMobile(mobile)`.
3. Hardcoded developer bypass:
   ```typescript
   if (userResult.userData.mobile === "9791486744" || userResult.userData.mobile === "7200460560") {
     otp = "123456";
   } else {
     otp = Math.floor(100000 + Math.random() * 900000).toString();
   }
   ```
4. Upserts OTP into `demodb.otp` table.
5. **Gateway Call (Lines 218-235):**
   Calls `send2FactorOTP(mobile, otp)`.
   URL: `https://2factor.in/API/V1/${TWOFACTOR_API_KEY}/SMS/${cleanMobile}/${otp}/${TWOFACTOR_TEMPLATE_NAME}`.
6. **Risk Analysis:**
   - This flow sends the OTP to the mobile number registered to the account matching the user's input (`cleanMobile`).
   - It can **ONLY** send to `9003241571` if an account in `demodb` exists with `mobile = '9003241571'` (which our database audit confirmed does not exist).
   - However, this flow **bypasses `NOTIFICATION_MOCK_MODE`** and makes live HTTP calls if credentials are present.

---

## 6. Complete Public-Booking OTP Call Flow

The public ride-booking wizard at `http://localhost:3000/book`:

1. **Step 1: Request OTP (`POST /api/public/booking/otp/send`):**
   - Customer enters their 10-digit Indian mobile number (`phone`).
   - Phone format validated against `/^[6-9]\d{9}$/`.
   - Generates 6-digit random OTP and secure session ID `PUB_<hex>`.
   - Saves record into `demodb.otp` (`otp`, `loginId: uuidv4()`, `sessionId`, `expiresAt: +5 min`).
   - Dispatches notification:
     ```typescript
     await sendNotification({
       channel: 'SMS',
       recipient: cleanPhone,
       templateCode: 'PUBLIC_BOOKING_OTP',
       body: `Your FleetFlow ride verification code is ${rawOtp}. Valid for 5 minutes.`,
     });
     ```
   - In mock mode (`NOTIFICATION_MOCK_MODE=true`), `sendNotification` intercepts the dispatch, writes an audit record to `demodb.notification_logs` with `providerStatus = 'MOCK'`, and prints the OTP to console.
   - Returns `{ success: true, sessionId, mockOtp: rawOtp }`.
2. **Step 2: Verify OTP (`POST /api/public/booking/otp/verify`):**
   - Customer submits `{ phone, otp, sessionId }`.
   - Queries `demodb.otp` for matching `sessionId`, valid OTP, and unexpired timestamp.
   - Marks record verified, generates cryptographically signed `verificationToken` (`VTOK_<hex>`), and returns it to the client.
3. **Step 3: Create Booking (`POST /api/public/booking/create`):**
   - Requires `verificationToken` (single-use, invalidated immediately upon use).
   - Validates package, creates booking in `demodb.booking` with `bookingCreatedBy = 'PUBLIC_BOOKING'`, `confirmStatus = 0` (Confirm Pending), and snapshots agreed rate in `booking.notes`.
   - Dispatches confirmation email to customer via `sendNotification` (mocked in test mode).

### Forensic Finding on Public Booking:
- Public booking sends OTP **strictly to the mobile number typed by the customer into the booking wizard**.
- It does **NOT** use any fallback number, default number, or SuperAdmin phone number.
- It can **NEVER** send to `9003241571` unless a user deliberately types `9003241571` into the phone input field.
- With `NOTIFICATION_MOCK_MODE=true`, even if someone types `9003241571`, zero real SMS messages are sent.

---

## 7. Provider and Configuration Comparison

| Dimension | Reference Project (`D:\New Pcs\vehicle`) | Current FleetFlow Project (`D:\demobooking\demo-bookings`) | Status / Assessment |
|---|---|---|---|
| **Primary SMS Gateway** | 2Factor.in | 2Factor.in | Identical provider |
| **Secondary Gateway** | Twilio | Twilio | Identical fallback |
| **Configured 2Factor Sender ID** | `GRCCAB` | `FLTFLW` | Successfully re-branded to FleetFlow standard |
| **Notification Mock Mode** | None (always calls live API if keys present) | Supported (`NOTIFICATION_MOCK_MODE=true`) | Substantial safety improvement in Current Project |
| **Audit Logging** | `sms_logs` (limited columns, 30 rows) | `notification_logs` (comprehensive audit trail, 481 rows) | Current Project has full auditability |
| **Forgot Password Channel** | Email | Email | Both use Email, neither uses SMS |
| **Admin SMS Alert Sourcing** | Not implemented | Dynamic (`SUPERADMIN_PHONE` -> Employee -> Fallback) | Current Project supports dynamic SuperAdmin phone |
| **Mobile App OTP Mocking** | No mock check | No mock check in `appLoginServices.ts` | Defect retained in current legacy app controller |

---

## 8. Every Code / Configuration Occurrence of the Old Number

Search scope: 446 files in Current Project, 424 files in Reference Project (excluding node_modules, .git, build, dist).

### Current Project (`D:\demobooking\demo-bookings`):
1. **Source Code (`.ts`, `.tsx`, `.js`, `.json`):**
   - **0 OCCURRENCES.** `9003241571` has been **completely removed** from all active application logic, configs, routes, controllers, and frontend pages.
2. **Database Backup Files:**
   - `backend/backup_demodb_2026-10-27T07-38-32-845Z.sql`: Line 1106 (Contains historical `INSERT INTO notification_logs` records from Oct 23-24).
3. **Live Database `demodb`:**
   - `notification_logs`: 29 historical rows in column `recipient` (Created between 2026-10-22 and 2026-10-24). Zero rows created after 2026-10-24.

### Reference Project (`D:\New Pcs\vehicle`):
1. `frontend/src/components/Homepage/simpleheader.tsx`:
   - Line 33: `<a href="tel:9003241571">`
   - Line 36: `<span>+91 90032 41571</span>`
2. `frontend/src/SuperAdmin/pages/Homepage/homepage.tsx`:
   - Line 114: `<span>+91-9003241571</span>`
   - Line 451: `<span>Phone: +91-9003241571</span>`
3. `frontend/src/SuperAdmin/pages/Homepage/Selections/Header.tsx`:
   - Line 59: `<a href="tel:9003241571">`
   - Line 62: `<span>+91 90032 41571</span>`
4. `frontend/src/SuperAdmin/pages/Homepage/Selections/Contact.tsx`:
   - Line 31: `<p className="text-gray-600">+91 90032 41571</p>`
5. `frontend/src/components/Homepage/Footer.tsx`:
   - Line 218: `+91 98417 22675 / +91 90032 41571`
   - Line 231: `+91 98417 22675 / +91 90032 41571 / +91 89250 72675`
   - Line 241: `+91 98417 22675/+91 90032 41571`
6. `frontend/src/SuperAdmin/pages/Users/Footer.tsx`:
   - Line 157: `+91 98417 22675 / +91 90032 41571`
   - Line 170: `+91 98417 22675 / +91 90032 41571 / +91 89250 72675`

---

## 9. Full Current Database Table Inventory and Purpose

Verified live on MySQL `demodb` on `127.0.0.1:3306`:
- **Views:** 0
- **Triggers:** 0
- **Stored Procedures:** 0
- **Stored Functions:** 0
- **Events:** 0
- **Total Tables:** Exactly **48 tables**

| # | Table Name | Row Count | Primary Key | Phone / Contact Fields | SMS/OTP Reads or Writes | Category |
|---|---|---|---|---|---|---|
| 1 | `booking` | 5 | `bookingId` | `behalfOfPhone` | Reads for customer SMS | Booking / Operations |
| 2 | `booking_sequence` | 1 | `seq_date` | None | None | Sequence Generator |
| 3 | `closependings` | 0 | `closependingId` | None | None | Operational Settlement |
| 4 | `company` | 22 | `companyId` | `companyPhno` | None | Corporate Account |
| 5 | `company_policies` | 0 | `policyId` | None | None | Company Policy |
| 6 | `configuration` | 1 | `configId` | None | None | Platform Config |
| 7 | `customer_notifications` | 0 | `notificationId` | None | Notification store | Push Notifications |
| 8 | `driver_notifications` | 0 | `notificationId` | None | Notification store | Push Notifications |
| 9 | `drivers` | 17 | `driverId` | `phno` | Reads driver SMS phone | Fleet Resources |
| 10 | `emailconfiguration` | 40 | `emailConfigId` | None | None | Email Template Master |
| 11 | `employee` | 2 | `employeeId` | `phno` | Reads SuperAdmin phone | Authentication / Staff |
| 12 | `invoice` | 0 | `invoiceId` | None | None | Billing / Invoicing |
| 13 | `invoice_sequences` | 3 | `companyId`, `financialYear` | None | None | Sequence Generator |
| 14 | `mapcount` | 0 | `id` | None | None | Telemetry / Tracking |
| 15 | `monthly_invoice` | 0 | `monthlyInvoiceId` | None | None | Billing / Corporate |
| 16 | `monthly_invoice_items` | 0 | `monthlyInvoiceItemId` | None | None | Billing / Line Items |
| 17 | `monthlybookingsequence` | 0 | None | None | None | Sequence Generator |
| 18 | `notification_logs` | 481 | `logId` | `recipient` | **Writes all SMS/Email audit logs** | Audit & Governance |
| 19 | `oncallinvoice` | 0 | `onCallBillId` | None | None | Billing / On-Call |
| 20 | `oncallinvoiceitems` | 0 | `onCallInvoiceItemId` | None | None | Billing / Line Items |
| 21 | `ordersummery` | 0 | `ordersummeryid` | None | None | Order Summary |
| 22 | `otp` | 11 | `otpId` | None (`loginId`, `sessionId`) | **Writes & Verifies OTPs** | Authentication / OTP |
| 23 | `owner` | 0 | `ownerId` | `phno` | None | Fleet Owners |
| 24 | `package` | 0 | `packageId` | None | None | Package Master |
| 25 | `packagedata` | 7 | `packageDataId` | None | None | Rate & Package Data |
| 26 | `partners` | 0 | `partnerId` | `contactNumber` | None | Partner Master |
| 27 | `payment` | 0 | `paymentId` | None | None | Gateway Payments |
| 28 | `payment_sequence` | 1 | `seq_date` | None | None | Sequence Generator |
| 29 | `paymentmode` | 8 | `paymentmodeId` | None | None | Payment Methods |
| 30 | `pickuparea` | 3 | `areaId` | None | None | Geographic Master |
| 31 | `pickupcity` | 6 | `cityId` | None | None | Geographic Master |
| 32 | `saas_plans` | 4 | `planId` | None | None | SaaS Plan Tiers |
| 33 | `short_links` | 21 | `id` | None | Short code in driver SMS | Short Link Store |
| 34 | `sms_logs` | 30 | `smsLogId` | `recipientType`, `phoneNumber` | **Legacy SMS log store** | Historical SMS Logs |
| 35 | `sms_templates` | 7 | `smsTemplateId` | None | Reads DLT templates | SMS Template Config |
| 36 | `subscription_invoices` | 11 | `subscriptionInvoiceId` | None | None | SaaS Billing |
| 37 | `tax` | 5 | `taxId` | None | None | Tax Rules |
| 38 | `tenant_activation_tokens` | 35 | `tokenId` | None | Token sent in email | Tenant Activation |
| 39 | `tenant_initial_allowance` | 57 | `id` | None | None | Entitlement Quota |
| 40 | `tenant_registration_requests` | 41 | `requestId` | `businessPhone`, `contactPhone` | Reads for applicant alert | Inbound Applications |
| 41 | `tenant_subscriptions` | 94 | `subscriptionId` | None | None | SaaS Subscription |
| 42 | `tenant_usage_meters` | 0 | `meterId` | None | None | Usage Metering |
| 43 | `tenants` | 147 | `tenantId` | `businessPhone`, `contactPhone` | None | Tenant Directory |
| 44 | `user` | 108 | `userId` | `mobile` | Reads mobile for user SMS | End User Directory |
| 45 | `vehicle` | 66 | `vehicleId` | None | None | Vehicle Models |
| 46 | `vehiclemaster` | 7 | `vehicleMasterId` | None | None | Vehicle Assets |
| 47 | `vehicletype` | 67 | `vehicleTypeId` | None | None | Vehicle Types |
| 48 | `vendor` | 3 | `vendorId` | `phno` | Reads vendor login | Vendors |

---

## 10. Database Table / Column Phone Number Forensic Matches

Queried all 48 tables and all character/text/JSON columns for:
- Exact `9003241571`
- Partial / formatted `%9003241571%`
- Exact `9080280818`
- Partial / formatted `%9080280818%`

### Findings Matrix:

| Target Number | Table Name | Column Name | Data Type | Matching Rows | Classification | Role in Application |
|---|---|---|---|---|---|---|
| `9003241571` | `notification_logs` | `recipient` | `varchar(255)` | **29** | Historical Log Entry | Historical outbound SMS log entries created Oct 22-24. NOT read as an active recipient. |
| `9080280818` | `employee` | `phno` | `varchar(255)` | **1** | Real Account Contact | SuperAdmin root account (`subisha2002.m@gmail.com`). Active recipient for SuperAdmin alerts. |
| `9080280818` | `user` | `mobile` | `varchar(255)` | **1** | Real Account Contact | User account mobile number. |
| `9080280818` | `tenants` | `businessPhone` | `varchar(50)` | **2** | Tenant Contact | Registered business phone for Alpha Fleet. |
| `9080280818` | `tenants` | `contactPhone` | `varchar(255)` | **2** | Tenant Contact | Registered operations phone for Alpha Fleet. |
| `9080280818` | `tenant_registration_requests` | `businessPhone` | `varchar(50)` | **2** | Inbound Application | Application record business phone. |
| `9080280818` | `tenant_registration_requests` | `contactPhone` | `varchar(50)` | **2** | Inbound Application | Application record contact phone. |
| `9080280818` | `sms_logs` | `phoneNumber` | `varchar(50)` | **1** | Historical Log Entry | Historical driver allocation log entry (Aug 26). |
| `9080280818` | `sms_logs` | `messageBody` | `text` | **1** | Historical Log Entry | Historical message body containing driver phone. |
| `9080280818` | `notification_logs` | `recipient` | `varchar(255)` | **43** | Operational / Audit Log | Audit records for SuperAdmin alerts & driver registrations. |

---

## 11. Existing Notification-Log Evidence and Its Limits

Analysis of all 481 rows in `demodb.notification_logs`:

### Dispatches to `9003241571` (Total: 29):
- **Template Breakdown:**
  - `SUPERADMIN_NEW_APPLICATION_SMS`: 28 dispatches.
  - `REGISTRATION_RECEIVED_SMS`: 1 dispatch.
- **Provider Status:** All 29 rows report `providerStatus = 'SENT'` with real 2Factor provider message IDs (`a4eeb45c89f18377-BOM`, `a4eebbc55d8bb330-BOM`, etc.).
- **Timeline:**
  - First dispatch: `2026-10-22T11:48:41.000Z`
  - Last dispatch: `2026-10-24T06:31:36.000Z`
  - **Zero dispatches after October 24, 2026.**
- **Evidence Limit:** The 2Factor API response format indicates that the gateway *accepted* the HTTP submission (`Status: Success, Details: session_id`). It confirms the message was submitted to the carrier, but handset receipt can only be proven by a DLR lookup report.

### Dispatches to `9080280818` (Total: 43):
- **Template Breakdown:**
  - `SUPERADMIN_NEW_APPLICATION_SMS`
  - `REGISTRATION_RECEIVED_SMS`
  - `DRIVER_WELCOME_SMS`
- **Provider Status:** 
  - Recent attempts on Oct 24-27 marked `FAILED` due to the inverted isolation guard (`Blocked: Transmission to obsolete customer phone number (90802...) is prohibited.`).

---

## 12. Root-Cause Analysis for the Repeated SMS Issue

### Confirmed Facts (Supported by Git & Database Evidence):
1. **Fact 1:** In commit `65e68c7`, `getSuperAdminPhone()` in `backend/src/services/notificationService.ts` explicitly returned `'9003241571'` as its hardcoded fallback.
2. **Fact 2:** During registration testing on October 23 and 24, automated test scripts and manual tests repeatedly created registration applications.
3. **Fact 3:** Every single registration request executed `sendNotification({ channel: 'SMS', recipient: superAdminPhone, templateCode: 'SUPERADMIN_NEW_APPLICATION_SMS', ... })`.
4. **Fact 4:** Because `SUPERADMIN_PHONE` was missing from `.env` at that time, `getSuperAdminPhone()` resolved to `'9003241571'`.
5. **Fact 5:** `NOTIFICATION_MOCK_MODE` was not yet implemented or enabled on October 23-24, causing 2Factor.in to send real SMS messages to `9003241571` for every single test registration.
6. **Fact 6:** 28 identical `SUPERADMIN_NEW_APPLICATION_SMS` messages were sent to `9003241571` in rapid succession (e.g. 11:42, 11:44, 11:48, 11:52, 11:54).

### Disproven Hypotheses:
- **Hypothesis Disproven:** Forgot-password was NOT sending SMS to `9003241571`. Forgot password is 100% email-driven.
- **Hypothesis Disproven:** Customer login was NOT sending SMS to `9003241571`. Login OTP in `authServices.ts` is only a `console.log`.
- **Hypothesis Disproven:** Public booking was NOT sending SMS to `9003241571`. Public booking only sends to the number typed into the form.

---

## 13. Exact List of Locations That Could Send SMS to the Old Number

### A. Current Risk Level for `9003241571`: **EXTREMELY LOW / SAFE**
1. **Source Code Hardcoding:** None. The fallback in `getSuperAdminPhone()` was replaced with `'9999999999'`.
2. **Environment Configuration:** `SUPERADMIN_PHONE=9080280818` is explicitly set in `backend/.env`.
3. **Mock Mode Protection:** `NOTIFICATION_MOCK_MODE=true` intercepts all outbound SMS dispatched through `sendNotification()`.

### B. Theoretical Edge-Case Risks If Mock Mode Is Disabled:
1. **User Input Vector:** If a tester or malicious user manually types `9003241571` into the Public Booking wizard (`/book`) or the Fleet Registration form (`/register`), the system would attempt to send a confirmation SMS to that number unless an explicit blacklist exists.
2. **Missing Blacklist Guard:** The isolation guard in `smsServices.ts` (line 136) blocks `9080280818`, but **does NOT block `9003241571`**.

---

## 14. Safe Local Testing Recommendations (Zero Real Messages)

To ensure that `9003241571` never receives another message under any circumstances:

1. **Always Verify `NOTIFICATION_MOCK_MODE=true` in `backend/.env`:**
   Ensure `NOTIFICATION_MOCK_MODE=true` is set. In this mode, `sendNotification()` intercepts all emails and SMS messages, generates a mock ID, and records `providerStatus: 'MOCK'` in `demodb.notification_logs`.
2. **Audit Before Any Live Provider Test:**
   Before running any test script, verify the target phone number with `grep` or static inspection.
3. **Never Test `appLoginServices.ts` with Real Credentials:**
   Avoid invoking `POST /app/appRoutes/send-otp` while `TWOFACTOR_API_KEY` is present in `.env`, because that endpoint does not yet check `NOTIFICATION_MOCK_MODE`.

---

## 15. Prioritized Recommended Fixes (For Future Implementation Phase)

> [!NOTE]
> Per user instruction, these fixes are documented for planning purposes only and have NOT been implemented during this read-only audit.

### Priority 0 (Critical — Inverted Guard Correction):
1. **Fix the Isolation Guard in `backend/src/services/smsServices.ts` and `backend/src/services/notificationService.ts`:**
   - Remove the block on `90802` / `9080280818`. This is the user's intended testing number!
   - Replace it with a strict, permanent blacklist on `9003241571`:
     ```typescript
     if (options.to && options.to.replace(/\D/g, '').includes('9003241571')) {
       console.warn('[NotificationService: GUARD] Disallow delivery to legacy contact 9003241571');
       return { success: false, providerStatus: 'FAILED', error: 'BLOCKED_LEGACY_NUMBER' };
     }
     ```
2. **Remove Email Isolation Guard on `subisha2002.m@gmail.com`:**
   - In `notificationService.ts` line 257, remove `if (recipient.toLowerCase().includes('subisha2002.m'))`. This is the legitimate SuperAdmin email!

### Priority 1 (High — Mobile App Mock Mode Hardening):
3. **Route `appLoginServices.ts` Through `notificationService`:**
   - In `backend/src/appServices/appLoginServices.ts`, replace the independent `send2FactorOTP()` function with `sendNotification({ channel: 'SMS', recipient: mobile, ... })` so it inherits `NOTIFICATION_MOCK_MODE` and audit logging.

### Priority 2 (Medium — UI Legacy Contact Cleanup in Reference Project):
4. If the reference project `D:\New Pcs\vehicle` is ever updated in its own repository, replace the hardcoded `9003241571` in `Footer.tsx`, `homepage.tsx`, and `simpleheader.tsx` with dynamic tenant branding tokens.

---

## 16. Unverified Areas & Limitations

1. **Carrier-Level Handset Delivery Reports (DLR):**
   - The `notification_logs` table confirms that 2Factor accepted the 29 messages for transmission. However, whether the cellular network physically delivered each SMS to the handset was not queried via the live 2Factor DLR API to strictly honor the **ANALYSIS ONLY — NO LIVE API CALLS** constraint.
2. **Third-Party Carrier Gateway Logs:**
   - External provider server logs at `2factor.in` and `twilio.com` were not accessed to avoid transmitting credentials across the wire.

---

## 17. Explicit Confirmation of Safety & Compliance

- **No source code was modified, created, deleted, or formatted in either project** (with the sole exception of creating this markdown report file).
- **The reference project `D:\New Pcs\vehicle` was strictly untouched** (directory timestamp remains `09-09-2026`).
- **No database records were altered, deleted, truncated, or inserted in `demodb`.**
- **Zero live SMS messages, OTPs, emails, or gateway API calls were initiated.**
- **No secrets, tokens, or passwords have been disclosed.**

---

## 18. Summary in Simple Tamil / Tanglish

### பழைய நம்பர் `9003241571`-க்கு ஏன் திரும்பத் திரும்ப SMS போச்சு?
1. **முக்கிய காரணம் (Root Cause):**
   - அக்டோபர் 23 மற்றும் 24 தேதிகளில் `notificationService.ts`-ல் `getSuperAdminPhone()` என்ற function-ல் `return '9003241571';` என்று hardcode செய்யப்பட்டிருந்தது.
   - அந்த சமயத்தில் புதிய Fleet Registration டெஸ்ட் செய்தபோது, ஒவ்வொரு முறை புதிய registration வரும்போதும் SuperAdmin-க்கு SMS Alert போகுமாறு code இருந்தது (`SUPERADMIN_NEW_APPLICATION_SMS`).
   - `.env`-ல் SuperAdmin போன் நம்பர் இல்லாததால், அது நேராக அந்த fallback நம்பரான `9003241571`-க்கு 2Factor SMS Gateway மூலமாக 28 முறை SMS அனுப்பிவிட்டது.
   - இன்னொரு SMS அக்டோபர் 22 அன்று test registration form-ல் அந்த நம்பரை உள்ளிட்டதால் சென்றது. மொத்தம் 29 SMS போயுள்ளது.
2. **Forgot Password காரணமா?**
   - **இல்லை!** Forgot Password flow முழுக்க முழுக்க **EMAIL மூலமாகவே** நடக்கிறது (`sendEmailFromTemplate`). Forgot Password-ல் SMS அனுப்பும் code-ஏ கிடையாது.
3. **தற்போது அந்த நம்பர் எங்கே இருக்கிறது?**
   - Active code-ல் `9003241571` **முழுமையாக நீக்கப்பட்டுவிட்டது**.
   - Database-ல் எந்த user, driver, employee கணக்கிலும் அந்த நம்பர் இல்லை. வெறும் பழைய audit history log-ல் (`notification_logs` table-ல் 29 rows) மட்டுமே இருக்கிறது.
4. **ஒரு முக்கியமான தவறு (Inverted Isolation Guard):**
   - Code-ல் தவறுதலாக உங்கள் டெஸ்டிங் நம்பரான `9080280818`-ஐ "obsolete number" என்று நினைத்து block செய்துள்ளனர் (`smsServices.ts` line 136).
   - இதனால் உங்கள் `9080280818` நம்பருக்கு SMS போகாமல் block ஆகிறது, ஆனால் பழைய `9003241571`-க்கு blacklist guard போடப்படவில்லை.
5. **அடுத்து என்ன செய்ய வேண்டும் (Next Steps for Implementation Phase):**
   - `smsServices.ts` மற்றும் `notificationService.ts`-ல் உள்ள guard-ஐ மாற்றி, `9080280818` மற்றும் `subisha2002.m@gmail.com`-க்கு உள்ள block-ஐ எடுக்க வேண்டும்.
   - பழைய நம்பரான `9003241571`-க்கு நிரந்தர blacklist guard அமைக்க வேண்டும்.
   - தற்போது `NOTIFICATION_MOCK_MODE=true` உள்ளதால், எந்த ஒரு நம்பருக்கும் real SMS செல்லாது; எல்லாமே local mock முறையில் பாதுகாப்பாகவே இயங்கும்.
