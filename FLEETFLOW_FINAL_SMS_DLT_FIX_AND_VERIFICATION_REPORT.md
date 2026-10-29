# FLEETFLOW — FINAL 2FACTOR DLT SMS FIX & VERIFICATION REPORT

**Date:** October 28, 2026  
**Active Project:** `D:\demobooking\demo-bookings`  
**Reference Project:** `D:\New Pcs\vehicle` (Verified Strictly Read-Only; 0 Files Modified)  
**Backend:** `http://localhost:5000`  
**Database:** `demodb` (MySQL)  
**Mock Mode:** `NOTIFICATION_MOCK_MODE=true` (Verified Active; 0 Real SMS Provider Calls)  

---

## 1. Executive Summary

All SMS configuration and delivery issues have been resolved, strictly adhering to Indian telecom DLT regulations and the pre-approved template configurations established in the reference project:

1. **Clarification on Old Number (`9003241571`):**  
   Strictly **NOT** added or restored to any SMS configuration, recipient fallback, SuperAdmin contact, or provider request. The forensic audit confirmed that `9003241571` was historically Grace Cabs's customer-support helpline text string (`var10`), not an SMS recipient or delivery gateway parameter. SuperAdmin contact resolution dynamically retrieves `SUPERADMIN_PHONE` from environment (`9080280818`) or database profile, never defaulting to `9003241571`.
2. **Approved 2Factor DLT Template Names:**  
   Mapped all operational notification triggers to pre-approved 2Factor DLT template names registered under header `GRCCAB`, including the exact registered telecom spelling `'Booking Confimation Message'`.
3. **Correct `var1...varN` Parameter Ordering:**  
   Configured variable ordering to exactly match registered DLT specifications discovered in the reference codebase.
4. **Sender ID `GRCCAB`:**  
   Standardized `TWO_FACTOR_SENDER_ID=GRCCAB` across `.env`, `config.ts`, and runtime provider dispatchers.
5. **Approved `OTP1` Route:**  
   Enforced the pre-approved 2Factor system OTP route (`https://2factor.in/API/V1/{apiKey}/SMS/{mobile}/{otp}/OTP1`) for all user logins and public booking verification OTPs.
6. **Zero Real SMS Sent:**  
   `NOTIFICATION_MOCK_MODE=true` was maintained throughout testing. Three automated verification suites confirmed **zero real network requests** to SMS gateways (`2factor.in` / `twilio.com`).
7. **Unregistered Template Reporting:**  
   Identified and reported the exact notification templates that currently lack approved 2Factor DLT registrations.

---

## 2. Approved 2Factor DLT Template Registry & Variable Mappings

Under Indian telecom DLT regulations enforced by the 2Factor `module=TRANS_SMS` gateway, arbitrary un-templated text (`&msg=...`) is strictly rejected. All transactional SMS messages must specify a registered `templatename` under the approved sender header `GRCCAB` and pass numbered positional parameters (`var1`...`varN`).

### Verified DLT Template Table

| Notification Type / Event | Registered DLT Template Name | Variable Count | Parameter Mapping (`var1...varN`) | Status in 2Factor |
| :--- | :--- | :---: | :--- | :--- |
| **Customer Booking Confirmation (Direct)** | `Booking Confimation Message`<br>*(Note exact DLT spelling: `Confimation`)* | **10** | `var1`: Customer Name<br>`var2`: Booking Code<br>`var3`: Route / Directions Link (`?l={code}`)<br>`var4`: Booking Date & Time<br>`var5`: Driver Name<br>`var6`: Driver Phone<br>`var7`: Vehicle Name<br>`var8`: Vehicle Number<br>`var9`: Fleet / Brand Name<br>`var10`: Support Helpline (`9080280818`) | ✅ **Approved** |
| **Customer Booking Confirmation (Guest)** | `BookingConfirmGuest` | **8** | `var1`: Passenger / Guest Name<br>`var2`: Driver Name<br>`var3`: Driver Phone<br>`var4`: Vehicle Name<br>`var5`: Vehicle Number<br>`var6`: Booking Date & Time<br>`var7`: Fleet / Brand Name<br>`var8`: Support Helpline (`9080280818`) | ✅ **Approved** |
| **Driver Assignment Alert** | `Driver Assigning` | **4** | `var1`: Driver Name<br>`var2`: Passenger Name & Booking Code<br>`var3`: Passenger Contact Phone<br>`var4`: Directions / Route Details (`?l={code}`) | ✅ **Approved** |
| **Customer Booking Cancellation** | `Booking Cancellation` | **4** | `var1`: Customer Name<br>`var2`: Booking Code<br>`var3`: Pickup Location<br>`var4`: Drop Location | ✅ **Approved** |
| **Manager Booking Confirmation** | `Manager Booking Confirmation` | **6** | `var1`: Manager Name (`Manager`)<br>`var2`: Booking Code<br>`var3`: Formatted Booking Date<br>`var4`: Customer Name<br>`var5`: Pickup Location<br>`var6`: Drop Location | ✅ **Approved** |
| **Manager Booking Cancellation** | `ManagerCancelBooking` | **4** | `var1`: Customer Name<br>`var2`: Booking Code<br>`var3`: Pickup Location<br>`var4`: Drop Location | ✅ **Approved** |
| **Invoice Cancellation** | `Invoice Cancel` | **3** | `var1`: User / Customer Name<br>`var2`: Booking Code<br>`var3`: Invoice Number | ✅ **Approved** |
| **User & Driver App Login OTP** | `OTP1` | N/A *(System Route)* | `GET https://2factor.in/API/V1/{key}/SMS/{phone}/{otp}/OTP1` | ✅ **Approved System Route** |
| **Public Cab Booking Verification OTP** | `OTP1` | N/A *(System Route)* | Routed via `sendNotification` with `metadata.otp` -> `send2FactorOTP(phone, otp, 'OTP1')` | ✅ **Approved System Route** |

---

## 3. Templates Requiring 2Factor Dashboard Approval

The following platform notifications do **not** have an approved DLT template under header `GRCCAB`. In production (`NOTIFICATION_MOCK_MODE=false`), attempting to send these as transactional SMS via 2Factor will fail unless created and approved in the 2Factor web portal:

| Template Code | Current Dispatch Channel | Intended Recipient | Reason for Portal Verification |
| :--- | :--- | :--- | :--- |
| `SUPERADMIN_NEW_APPLICATION_SMS` | SMS (optional alert) | Platform SuperAdmin (`9080280818`) | Not registered in 2Factor DLT. Email (`SUPERADMIN_NEW_APPLICATION_EMAIL`) delivers fully. Requires registering a template (e.g., `NewFleetApplicationAlert`) with variables `{applicantName}`, `{fleetName}`, `{phone}` in 2Factor portal. |
| `REGISTRATION_RECEIVED_SMS` | SMS (optional confirmation) | Fleet Applicant | Not registered in 2Factor DLT. Applicant email confirmation delivers fully. Requires registering a template in 2Factor portal before enabling real SMS. |
| `SUBSCRIPTION_EXPIRING_SMS` | SMS (billing alert) | Tenant Fleet Owner | Currently handled via email (`SUBSCRIPTION_EXPIRING_EMAIL`). If SMS channel is desired, requires DLT approval. |
| `SUBSCRIPTION_OVERDUE_SMS` | SMS (billing alert) | Tenant Fleet Owner | Handled via email. Requires DLT template approval if SMS notification is requested. |
| `SUBSCRIPTION_SUSPENDED_SMS` | SMS (suspension alert) | Tenant Fleet Owner | Handled via email. Requires DLT template approval if SMS notification is requested. |

> [!NOTE]
> In accordance with Indian telecom regulations, `sendDirectSms()` has been configured to **strictly reject** un-templated text if 2Factor is configured without mock mode, protecting the platform from gateway rejection penalties and DLT non-compliance.

---

## 4. Verification & Automated Test Results

Three comprehensive test suites were executed to validate the implementation:

### Suite 1: Targeted Final DLT SMS Verification (`testFinalSmsDltVerification.ts`)
```
========================================================================
  FLEETFLOW — FINAL DLT SMS & TEMPLATE MAPPING VERIFICATION SUITE
========================================================================

  ✔ [PASS] Sender ID is GRCCAB in .env and config.ts
  ✔ [PASS] NOTIFICATION_MOCK_MODE is strictly "true"
  ✔ [PASS] APPROVED_2FACTOR_TEMPLATES contains all verified DLT templates
  ✔ [PASS] BOOKING_CREATION maps to "Booking Confimation Message"
  ✔ [PASS] OTP route resolves to approved OTP1 template
  ✔ [PASS] SuperAdmin contact phone is NOT 9003241571 and resolves to 9080280818
  ✔ [PASS] sendNotification with OTP dispatches to OTP1 route with zero network calls
  ✔ [PASS] send2FactorTemplateSms accepts DLT template and variable array with zero network calls
  ✔ [PASS] sendDirectSms protects against un-templated text if 2Factor is configured without mock
  ✔ [PASS] Network guard confirms ZERO real SMS provider requests occurred

------------------------------------------------------------------------
SUMMARY: Total: 10 | Passed: 10 | Failed: 0 | Real Network Calls: 0
------------------------------------------------------------------------
```

### Suite 2: Phase 2 SMS Mock Verification (`testPhase2SmsMockVerification.ts`)
- **Total Tests:** 8
- **Passed:** 8 (100%)
- **Failed:** 0
- **Real Provider Network Calls:** 0

### Suite 3: SMS Isolation & Fix Verification (`testSmsFixVerification.ts`)
- **Total Tests:** 34
- **Passed:** 34 (100%)
- **Failed:** 0
- **Real Provider Network Calls:** 0

### TypeScript Type Safety
- **Backend Typecheck (`npx tsc --noEmit`):** ✅ 0 errors
- **Frontend Typecheck (`npx tsc --noEmit`):** ✅ 0 errors

---

## 5. Integrity Audit of Reference Project & Old Phone Number

1. **Reference Project (`D:\New Pcs\vehicle`):**  
   - Maintained strictly read-only.
   - Timestamp verification confirmed **0 files modified** during this task.
2. **Old Helpline Phone Number (`9003241571`):**  
   - Confirmed excluded from all gateway dispatch configs, recipient fallbacks, and SuperAdmin contact parameters.
   - SuperAdmin profile resolution dynamically targets `9080280818`.
   - Normal applicant registration allows legitimate external applicants without artificial regex collisions.
