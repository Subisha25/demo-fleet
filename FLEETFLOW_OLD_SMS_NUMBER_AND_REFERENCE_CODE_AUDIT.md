# FLEETFLOW — OLD SMS NUMBER & REFERENCE PROJECT FORENSIC AUDIT REPORT

**Report Date:** October 28, 2026  
**Active Project:** `D:\demobooking\demo-bookings`  
**Reference Project:** `D:\New Pcs\vehicle` (STRICTLY READ-ONLY — 0 files modified)  
**Database:** MySQL `demodb` on `127.0.0.1:3306`  
**Current Notification Mode:** `NOTIFICATION_MOCK_MODE=true` (Verified Active)  

---

## EXECUTIVE SUMMARY

A forensic, read-only code analysis was conducted comparing the SMS architecture of the reference project (`D:\New Pcs\vehicle`) against the active FleetFlow project (`D:\demobooking\demo-bookings`).

### Primary Findings:
1. **The Old Number (`9003241571`):**  
   `9003241571` appears in **zero backend files** in `D:\New Pcs\vehicle`. It appears exclusively in frontend components (`simpleheader.tsx`, `Header.tsx`, `homepage.tsx`) as the **Grace Cabs customer support helpline** (e.g. `<a href="tel:9003241571">+91 90032 41571</a>`). In early commits, it was passed as `var10` (the helpline string printed at the bottom of customer booking confirmation SMS). It was **never** an SMS recipient, never an admin phone, and never an authentication parameter. **Removing it had zero impact on SMS delivery.**
2. **Root Cause of Previous Provider Rejection:**  
   The single authorized real SMS test in Phase 3 failed with `{ Status: 'Error', Details: 'Incorrect sender id and templatename provided' }` due to two concrete configuration mismatches:
   - **Sender ID:** Active `.env` had `TWO_FACTOR_SENDER_ID=FLTFLW`. The 2Factor account's registered telecom DLT header is **`GRCCAB`**.
   - **DLT Template Matching:** The test request passed `templatename=Booking Creation` and arbitrary text `msg=FleetFlow SMS verification test...`. In the reference project that actually worked with 2Factor, the registered template names were **`Booking Confimation Message`** and **`Driver Assigning`**, and messages were strictly dispatched with numbered variables (`var1`..`varN`) matching pre-approved DLT templates. Indian telecom operators strictly reject arbitrary message text sent through `TRANS_SMS`.

---

## PHASE 1: REFERENCE PROJECT (`D:\New Pcs\vehicle`) CODE ANALYSIS

A comprehensive, read-only search of `D:\New Pcs\vehicle` was executed across all source files, configurations, and scripts (excluding `node_modules` and `.git`).

### 1.1 Search for `9003241571`

| File Path in Reference Project | Line Number | Content / Usage |
|---|:---:|---|
| `frontend/src/components/Homepage/simpleheader.tsx` | 33 | `<a href="tel:9003241571" ...>+91 90032 41571</a>` |
| `frontend/src/SuperAdmin/pages/Homepage/Selections/Header.tsx` | 59 | `<a href="tel:9003241571" ...>+91 90032 41571</a>` |
| `frontend/src/SuperAdmin/pages/Homepage/homepage.tsx` | 114 | `<span>+91-9003241571</span>` |
| `frontend/src/SuperAdmin/pages/Homepage/homepage.tsx` | 451 | `<span>Phone: +91-9003241571</span>` |
| **All Backend Files (`backend/**`)** | — | **0 matches found** |

### 1.2 Search for `9080280818`
- **Result:** **0 matches found** across the entire reference project (backend and frontend).

### 1.3 Role Determination of `9003241571`

| Hypothesis | Proven? | Evidence / Reason |
|---|:---:|---|
| **1. 2Factor account registration/contact number** | **UNPROVEN** | No local files define the 2Factor account registration contact. Can only be verified via 2Factor portal. |
| **2. SuperAdmin notification recipient** | **NO** | Reference project has no SuperAdmin SMS notification concept. |
| **3. Fallback admin phone in application code** | **NO** | Does not appear anywhere in backend source code. |
| **4. Ordinary applicant/customer phone** | **NO** | Never queried or assigned as a customer record in backend. |
| **5. Test fixture or historical log value** | **NO** | Not present in test files or seed scripts in reference project. |
| **6. SMS sender number or provider parameter** | **NO** | Sender ID in reference project is `GRCCAB` (an alphanumeric header), not a phone number. |
| **7. Actual Role** | **YES** | **Public Customer Support / Traveldesk Helpline.** Displayed on the website header and passed as `companySupportPhone` (`var10`) in booking SMS bodies for passengers to contact dispatch. |

---

## PHASE 2: REFERENCE PROJECT SMS CALL TRACING

Tracing how SMS was constructed and dispatched in `D:\New Pcs\vehicle`:

### 2.1 OTP Route (Login & Verification)
- **File:** `D:\New Pcs\vehicle\backend\src\appServices\appLoginServices.ts` (lines 21–68)
- **Function:** `send2FactorOTP(mobile, otp)`
- **Endpoint:** `https://2factor.in/API/V1/${TWOFACTOR_API_KEY}/SMS/${cleanMobile}/${otp}/${TWOFACTOR_TEMPLATE_NAME}`
- **Parameters:**
  - `cleanMobile`: recipient mobile with `+91` stripped.
  - `otp`: 6-digit numeric OTP.
  - `TWOFACTOR_TEMPLATE_NAME`: Loaded from `.env` defaulting to `'OTP1'`.
- **Sender ID:** Managed automatically by 2Factor under their pre-approved `OTP1` DLT service.
- **Provider Response:** Evaluated `res.data.Status === 'Success'` and stored `res.data.Details` as session ID.

### 2.2 Transactional Template Route (Booking & Driver Notifications)
- **Files:**
  - `D:\New Pcs\vehicle\backend\src\utils\smsNotifications.ts` (lines 80–160)
  - `D:\New Pcs\vehicle\backend\src\services\smsServices.ts` (lines 121–155)
  - `D:\New Pcs\vehicle\backend\src\services\bookingServices.ts` (line 759)
  - `D:\New Pcs\vehicle\backend\src\services\empServices.ts` (lines 2490, 2614, 2849)
- **Endpoint:** `https://2factor.in/API/R1/?module=TRANS_SMS&apikey=${apiKey}&to=${to}&from=${senderId}&templatename=${templateName}&var1=...&var2=...`
- **Approved Template Names Used in Reference Project:**
  1. `Booking Confimation Message` (Exact spelling with typo in DLT registration: 10 variables)
  2. `BookingConfirmGuest` (8 variables)
  3. `Driver Assigning` (4 variables: driverName, customerName/bookingCode, customerPhone, tripDetails)
  4. `Booking Cancellation` (4 variables: customerName, bookingCode, pickup, drop)
  5. `Manager Booking Confirmation`
- **Critical Observation:**  
  In the reference project, **`&msg=` was NEVER used with `module=TRANS_SMS`**. Messages were sent **strictly** by passing pre-approved `templatename` and numbered variables (`var1` to `var10`).

### 2.3 Direct SMS Route (`sendDirectSms`)
- **File:** `D:\New Pcs\vehicle\backend\src\services\smsServices.ts` (lines 158–195)
- **Behavior:**  
  1. Checked for Twilio configuration (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`).
  2. If Twilio credentials were present, called Twilio API.
  3. If Twilio was not present, returned simulated success (`[SMS Provider Simulation]`).
  4. **`sendDirectSms` in the reference project NEVER called 2Factor.**

---

## PHASE 3: SIDE-BY-SIDE ARCHITECTURAL COMPARISON

| Feature / Dimension | Reference Project (`D:\New Pcs\vehicle`) | Active Project (`D:\demobooking\demo-bookings`) | Status / Difference |
|---|---|---|:---:|
| **Provider** | 2Factor.in (`module=TRANS_SMS` & `/SMS/.../OTP1`) | 2Factor.in (`module=TRANS_SMS` & `/SMS/.../OTP1`) | Matching |
| **Sender ID** | `GRCCAB` (in `.env` line 74) | Previously `FLTFLW`; now corrected to `GRCCAB` | Fixed |
| **OTP Template** | `OTP1` | `OTP1` | Matching |
| **Transactional Templates** | `Booking Confimation Message`, `Driver Assigning`, `Booking Cancellation`, `BookingConfirmGuest` | `sms_templates` table has `BOOKING_CREATION`, `DRIVER_ASSIGNED_TO_CUSTOMER`, etc. | Template Name Mismatch |
| **Arbitrary Text (`&msg=`)** | **NEVER USED** (Strictly `templatename` + `var1..varN`) | Attempted `&msg=...` in `sendDirectSms` and Phase 3 test | Violates DLT Mandate |
| **`sendDirectSms` Logic** | Twilio or Simulation fallback | Routed to 2Factor `TRANS_SMS` with arbitrary `&msg=` | Needs DLT template |
| **Mock Mode Support** | None (`NOTIFICATION_MOCK_MODE` did not exist) | Comprehensive `NOTIFICATION_MOCK_MODE=true` across all routes | Enhanced & Verified |
| **SuperAdmin Alert Phone** | Not implemented (single-tenant app) | `SUPERADMIN_PHONE=9080280818` (multi-tenant SaaS feature) | Implemented & Isolated |
| **Role of `9003241571`** | Support helpline (`var10` in booking SMS body) | Ordinary applicant phone (not SuperAdmin fallback) | Isolated & Verified |

---

## PHASE 4: EVIDENCE-BASED ROOT-CAUSE DECISIONS

### Question 1: Did the reference project use `9003241571` as the 2Factor registered account/contact number, or is this unproven?
**Decision: UNPROVEN.**  
`9003241571` is completely absent from `D:\New Pcs\vehicle\backend`. It appears only in frontend header and footer components. No code, configuration, or migration connects this number to 2Factor account authentication or gateway settings. Whether it is the contact number on the 2Factor billing account can only be checked by logging into `https://2factor.in`.

### Question 2: Does that number appear in the provider API request as a recipient, sender, authentication value, or not at all?
**Decision: NOT AT ALL.**  
In provider API requests, the sender is `GRCCAB` (alphanumeric), the recipient is the customer or driver phone, and authentication is `TWO_FACTOR_API_KEY`. The old number only appeared as text inside `var10` of the message body (the company helpline for passengers).

### Question 3: Is the active project's SMS failure caused by the old number being removed, or by a different issue?
**Decision: NOT CAUSED BY REMOVING THE OLD NUMBER.**  
The rejection was caused entirely by:
1. `TWO_FACTOR_SENDER_ID` was set to `FLTFLW` (unregistered) instead of `GRCCAB`.
2. The request passed `templatename=Booking Creation` (unregistered in 2Factor).
3. The request passed an arbitrary message string via `&msg=...`, which 2Factor's `TRANS_SMS` rejects because Indian DLT strictly enforces registered template regex matching.

### Question 4: Which exact code/configuration differences explain the previous provider rejection?
**Decision:**
1. **Sender Header:** `FLTFLW` in `.env` vs approved DLT header `GRCCAB`.
2. **Template Name:** Passing `Booking Creation` vs approved 2Factor template `Booking Confimation Message` (or `Driver Assigning`).
3. **Payload Structure:** 2Factor's `TRANS_SMS` endpoint requires `templatename` + `var1..varN`. It does not accept open-format text via `&msg=`.

### Question 5: Which fixes are required to restore SMS functionality while keeping the old number from receiving unintended notifications?
**Decision:**
1. **Maintain `TWO_FACTOR_SENDER_ID=GRCCAB`** in `backend/.env` and `config.ts` (already applied).
2. **Align Template Names:** Map transactional notifications to the exact approved 2Factor template names (`Booking Confimation Message`, `Driver Assigning`, `Booking Cancellation`).
3. **Dispatch via Variables (`var1`..`varN`):** Send transactional SMS by populating variables into approved templates rather than passing raw text to `&msg=`.
4. **Use OTP Route for OTPs:** Route verification codes through 2Factor's system OTP endpoint (`/SMS/{phone}/{otp}/OTP1`), which delivers reliably without custom DLT approval.
5. **Preserve Isolation of `9003241571`:** Ensure `9003241571` is never hardcoded as a fallback or SuperAdmin recipient, while remaining eligible as an ordinary customer/applicant phone.

---

## PHASE 5: ACTION PLAN & RECOMMENDED FIXES (PRIORITY ORDER)

| Priority | Recommended Action | Risk | Purpose |
|:---:|---|:---:|---|
| **1** | **Keep `NOTIFICATION_MOCK_MODE=true` active** | None | Maintain complete safety until explicit test authorization. |
| **2** | **Update `send2FactorTemplateSms` mappings** | Low | Map `BOOKING_CREATION` to `'Booking Confimation Message'` and `DRIVER_ASSIGNED` to `'Driver Assigning'` to match approved 2Factor names. |
| **3** | **Refactor `sendDirectSms` for transactional fallback** | Low | When sending direct notifications via 2Factor, use an approved template with variables rather than `&msg=`. |
| **4** | **Check 2Factor Dashboard for Custom Test Template** | None (Manual) | If the exact text `FleetFlow SMS verification test. This is a single authorized test message.` must be tested, add and approve this template under header `GRCCAB` in the 2Factor dashboard. |
| **5** | **Authorized Live OTP Test (Alternative)** | Low | If immediate verification of live handset delivery to `9080280818` is desired, test the built-in `OTP1` route (`/SMS/9080280818/123456/OTP1`), which works out-of-the-box. |

---

## CONFIRMATION OF SYSTEM STATE

- **Reference Project:** `D:\New Pcs\vehicle` remains strictly **UNTOUCHED** (0 bytes modified).
- **Active Mock Mode:** Confirmed `NOTIFICATION_MOCK_MODE=true`.
- **Database & Plan Limit Reports:** All MySQL records and [FLEETFLOW_SMS_AND_PLAN_LIMIT_VERIFICATION_REPORT.md](file:///d:/demobooking/demo-bookings/FLEETFLOW_SMS_AND_PLAN_LIMIT_VERIFICATION_REPORT.md) are preserved intact.
- **Zero Real SMS Sent:** No provider requests or messages were sent during this investigation.
- **Secrets Protection:** Zero API keys, passwords, or tokens have been exposed.
