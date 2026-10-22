# Document 04: Security Findings, Source Evidence & Remediation Specifications

## 1. Executive Summary & Audit Protocol

A rigorous security audit was conducted by inspecting the production source code across [`backend/src/`](file:///d:/demobooking/demo-bookings/backend/src/) and [`frontend/src/`](file:///d:/demobooking/demo-bookings/frontend/src/).

Every vulnerability reported in earlier audit iterations ([`docs/02_SECURITY_AND_DATA_ISOLATION_AUDIT.md`](file:///d:/demobooking/demo-bookings/docs/02_SECURITY_AND_DATA_ISOLATION_AUDIT.md) and [`GRACE_CABS_SAAS_DESIGN_REVIEW/04_SECURITY_REMEDIATION_PRIORITIES.md`](file:///d:/demobooking/demo-bookings/GRACE_CABS_SAAS_DESIGN_REVIEW/04_SECURITY_REMEDIATION_PRIORITIES.md)) was evaluated against a strict three-state verification standard:
1. **Source-Verified (SV)**: Conclusively confirmed by direct line-by-line inspection of routes, controllers, middleware, models, or service functions in the repository.
2. **Unverified (UV)**: Theoretical, speculative, or unsupported by code evidence.
3. **Requiring Runtime Testing (RRT)**: Condition depends on live environment variables, external infrastructure load, or concurrency race conditions requiring runtime test suites.

> [!CAUTION]
> **CRITICAL SECURITY ALERT**: Direct source code inspection confirms **14 verified vulnerabilities in the current codebase**, including 5 CRITICAL vulnerabilities that permit unauthenticated extraction of production SMTP passwords, arbitrary configuration overwrites, unauthenticated Excel injection of user accounts with default passwords (`123456`), arbitrary deletion of corporate invoices, and public exposure of passenger signatures and corporate PDF bills.

---

## 2. Master Vulnerability Verification & Evidence Matrix

| ID | Vulnerability Title | Severity | Verification Status | Source Code Location | Exploit Evidence & Code Reference | Remediation Priority |
| :---: | :--- | :---: | :---: | :--- | :--- | :---: |
| **SEC-01** | Plain-Text SMTP Credential Exposure | **CRITICAL** | **Source-Verified** | [`configurationRoutes.ts:10`](file:///d:/demobooking/demo-bookings/backend/src/routes/configurationRoutes.ts#L10)<br/>[`configurationService.ts:98-115`](file:///d:/demobooking/demo-bookings/backend/src/services/configurationService.ts#L98-L115) | `router.get('/getConfiguration', getConfiguration)` lacks auth middleware; returns unencrypted `smtpServer`, `smtpEmailAddress`, `smtpEmailPassword`. | **P0 (Immediate Hotfix)** |
| **SEC-02** | Unauthenticated System Configuration Overwrite | **CRITICAL** | **Source-Verified** | [`configurationRoutes.ts:7`](file:///d:/demobooking/demo-bookings/backend/src/routes/configurationRoutes.ts#L7)<br/>[`configurationService.ts:5-95`](file:///d:/demobooking/demo-bookings/backend/src/services/configurationService.ts#L5-L95) | `router.post('/createConfiguration', createConfiguration)` lacks auth; allows arbitrary overwrite of taxes, cancellation fees, invoice prefixes, and mail servers. | **P0 (Immediate Hotfix)** |
| **SEC-03** | Unauthenticated Bulk User Excel Injection | **CRITICAL** | **Source-Verified** | [`userRoutes.ts:18`](file:///d:/demobooking/demo-bookings/backend/src/routes/userRoutes.ts#L18)<br/>[`userServices.ts:322`](file:///d:/demobooking/demo-bookings/backend/src/services/userServices.ts#L322) | `router.post("/upload-users", upload.single("file"), uploadUsersFromExcel)` lacks auth; bulk-creates active user accounts with default password `"123456"`. | **P0 (Immediate Hotfix)** |
| **SEC-04** | Cross-Tenant Data Leak in Admin Order Queries | **HIGH** | **Source-Verified** | [`bookingServices.ts:358-386`](file:///d:/demobooking/demo-bookings/backend/src/services/bookingServices.ts#L358-L386)<br/>[`bookingServices.ts:407-414`](file:///d:/demobooking/demo-bookings/backend/src/services/bookingServices.ts#L407-L414) | Any non-user role (Admin, Dispatcher, Vendor, Manager) triggers `Booking.findAll()` with zero `companyId` or `tenantId` filter, returning all orders across all tenants. | **P1 (Tenancy Isolation)** |
| **SEC-05** | Unauthenticated BOLA / IDOR Order Scraping | **HIGH** | **Source-Verified** | [`bookingRoutes.ts:38-50`](file:///d:/demobooking/demo-bookings/backend/src/routes/bookingRoutes.ts#L38-L50) | Routes `/details/:bookingCode`, `/getallinvoicereport`, and `/user/:userId/*` completely lack `authMiddleware`. Order details and passenger PII are publicly scrapable. | **P0 (Immediate Hotfix)** |
| **SEC-06** | Unauthenticated Destructive Invoicing Endpoints | **HIGH** | **Source-Verified** | [`closependingRoutes.ts:37`](file:///d:/demobooking/demo-bookings/backend/src/routes/closependingRoutes.ts#L37)<br/>[`invoiceRoutes.ts:29`](file:///d:/demobooking/demo-bookings/backend/src/routes/invoiceRoutes.ts#L29)<br/>[`onCallRoutes.ts:19-21`](file:///d:/demobooking/demo-bookings/backend/src/routes/onCallRoutes.ts#L19-L21) | `DELETE /monthlyInvoice/:id`, `PUT /invoice/cancelInvoice`, and `DELETE /onCallInvoice/:id` have no auth middleware. Any anonymous user can delete or cancel bills. | **P0 (Immediate Hotfix)** |
| **SEC-07** | Public Corporate Directory & Rosters Exposure | **MEDIUM** | **Source-Verified** | [`companyRoutes.ts:8-10`](file:///d:/demobooking/demo-bookings/backend/src/routes/companyRoutes.ts#L8-L10)<br/>[`userRoutes.ts:21-22`](file:///d:/demobooking/demo-bookings/backend/src/routes/userRoutes.ts#L21-L22) | Corporate accounts, GST numbers, phone numbers, and employee lists are retrievable without authentication via unprotected endpoints. | **P1 (Foundation)** |
| **SEC-08** | Public Unauthenticated Static File Serving | **HIGH** | **Source-Verified** | [`app.ts:70-86`](file:///d:/demobooking/demo-bookings/backend/src/app.ts#L70-L86)<br/>[`app.ts:114-156`](file:///d:/demobooking/demo-bookings/backend/src/app.ts#L114-L156) | `express.static` exposes `/uploads/signature`, `/invoices`, and `/oncallinvoice`. Signatures and PDF invoices can be browsed and downloaded without credentials. | **P1 (Foundation)** |
| **SEC-09** | Wildcard Permissive CORS with Credentials | **MEDIUM** | **Source-Verified** | [`app.ts:74-82`](file:///d:/demobooking/demo-bookings/backend/src/app.ts#L74-L82) | `cors({ origin: "*", credentials: true })`. Wildcard origin with credentials enables cross-origin attacks and violates security specifications. | **P1 (Foundation)** |
| **SEC-10** | Inconsistent JWT Signatures & Typing Defect | **MEDIUM** | **Source-Verified** | [`authMiddleware.ts:4-28`](file:///d:/demobooking/demo-bookings/backend/src/middleware/authMiddleware.ts#L4-L28)<br/>[`Security.ts:50-58`](file:///d:/demobooking/demo-bookings/backend/src/utils/Security.ts#L50-L58)<br/>[`authServices.ts:113,131,156`](file:///d:/demobooking/demo-bookings/backend/src/services/authServices.ts#L113-L156) | Type mismatch (`userId: number` in middleware vs UUID string in models); `tenantId` is omitted from JWT payload; token uses `roles` key while middleware reads `role`. | **P1 (Foundation)** |
| **SEC-11** | Hardcoded Bespoke Client Branching (Danfoss) | **MEDIUM** | **Source-Verified** | [`user.ts:36`](file:///d:/demobooking/demo-bookings/backend/src/models/user.ts#L36)<br/>[`authServices.ts:325`](file:///d:/demobooking/demo-bookings/backend/src/services/authServices.ts#L325)<br/>[`userServices.ts:415`](file:///d:/demobooking/demo-bookings/backend/src/services/userServices.ts#L415) | Bespoke column `danfossuserId` and client-specific logic hardcoded into auth and registration services. | **P2 (Decoupling)** |
| **SEC-12** | Sequential Booking Code Volume Leakage | **LOW** | **Source-Verified** | [`booking_sequence.ts:3`](file:///d:/demobooking/demo-bookings/backend/src/models/booking_sequence.ts#L3)<br/>[`payment_sequence.ts:3`](file:///d:/demobooking/demo-bookings/backend/src/models/payment_sequence.ts#L3) | Sequence tables are globally keyed only by `seq_date`. Allows competitors to deduce platform-wide daily trip volumes. | **P2 (Tenancy)** |
| **SEC-13** | Concurrency Race in Atomic Sequence Increment | **MEDIUM** | **Requiring Runtime Testing** | [`payment.ts:157-169`](file:///d:/demobooking/demo-bookings/backend/src/models/payment.ts#L157-L169)<br/>[`booking.ts:74-84`](file:///d:/demobooking/demo-bookings/backend/src/models/booking.ts#L74-L84) | Under high concurrent load (100+ req/sec), race conditions between `INSERT ON DUPLICATE KEY UPDATE` and `findByPk` may cause number collisions or gaps. | **P2 (Runtime Benchmark)** |
| **SEC-14** | Memory Leak in Headless Puppeteer Generation | **MEDIUM** | **Requiring Runtime Testing** | [`appInvoiceRoutes.ts:1145`](file:///d:/demobooking/demo-bookings/backend/src/appRoutes/appInvoiceRoutes.ts)<br/>[`downloadPdf.ts:50-120`](file:///d:/demobooking/demo-bookings/backend/src/routes/downloadPdf.ts#L50-L120) | Headless Chromium processes may remain orphaned if PDF generation fails or errors mid-stream, exhausting server memory. | **P3 (Testing / Hardening)** |
| **SEC-15** | Raw SQL Queries Bypassing Model Tenant Scopes | **HIGH** | **Source-Verified** | [`onCallServices.ts:2367-2376`](file:///d:/demobooking/demo-bookings/backend/src/services/onCallServices.ts#L2367-L2376)<br/>[`payment.ts:157-169`](file:///d:/demobooking/demo-bookings/backend/src/models/payment.ts#L157-L169) | Direct `sequelize.query("UPDATE oncallinvoice SET ... WHERE onCallBillId = ...")` completely bypasses Sequelize scopes and hooks, risking cross-tenant corruption. | **P1 (Tenancy Isolation)** |
| **SEC-16** | Context Loss in Asynchronous Background Tasks | **HIGH** | **Source-Verified** | [`empServices.ts:2498-2520`](file:///d:/demobooking/demo-bookings/backend/src/services/empServices.ts#L2498-L2520) | Background `autoApproveIfNoAction` executes inside an untracked `setTimeout(async () => { ... })`. Context is lost; fail-closed scopes would throw errors or fail. | **P1 (Tenancy Isolation)** |
| **SEC-17** | Global Un-Scoped User Login Query | **HIGH** | **Source-Verified** | [`authServices.ts:140`](file:///d:/demobooking/demo-bookings/backend/src/services/authServices.ts#L140) | `User.findOne({ where: { email } })` queries users globally with zero tenant filtering. Collides if the same email exists across two tenants. | **P1 (Auth Hardening)** |

---

## 3. Deep-Dive Analysis of Critical Source-Verified Vulnerabilities

### SEC-01 & SEC-02: Plain-Text SMTP Exposure & Configuration Hijacking

#### Source Code Evidence
In [`backend/src/routes/configurationRoutes.ts:1-13`](file:///d:/demobooking/demo-bookings/backend/src/routes/configurationRoutes.ts#L1-L13):
```typescript
import { Router } from 'express';
import { createConfiguration, getConfiguration } from '../services/configurationService';

const router = Router();
router.post('/createConfiguration', createConfiguration); // 🔴 Completely unauthenticated!
router.get('/getConfiguration', getConfiguration);       // 🔴 Completely unauthenticated!

export default router;
```
In [`backend/src/services/configurationService.ts:98-115`](file:///d:/demobooking/demo-bookings/backend/src/services/configurationService.ts#L98-L115):
```typescript
export const getConfiguration = async (req: Request, res: Response): Promise<void> => {
  const configuration = await Configuration.findOne();
  res.status(200).json({
    success: true,
    data: configuration // 🔴 Dumps smtpServer, smtpEmailAddress, and smtpEmailPassword in plain text!
  });
};
```

#### Exploit Impact
- Anyone on the public internet can send `GET /api/config/getConfiguration` without an API key or token.
- The server responds with production SMTP server host, port, username, and plain-text password.
- An attacker can seize the corporate email account, read outgoing password-reset tokens, spoof official corporate transit vouchers, or weaponize the mail server for spam relays.
- Furthermore, `POST /api/config/createConfiguration` permits anyone to overwrite the global tax rate, invoice prefix, or redirect mail delivery entirely.

#### Remediation Specification
1. Bind `Configuration` to `tenantId`.
2. Attach `authMiddleware` and `requireRole(['SUPERADMIN'])`.
3. Configure Sequelize `defaultScope` on `Configuration` to exclude `smtpEmailPassword` (`attributes: { exclude: ['smtpEmailPassword'] }`).
4. Store SMTP passwords using AES-256-GCM encryption at rest with encryption keys managed via KMS/environment variables.

---

### SEC-03: Unauthenticated Bulk User Excel Injection with Known Default Passwords

#### Source Code Evidence
In [`backend/src/routes/userRoutes.ts:18`](file:///d:/demobooking/demo-bookings/backend/src/routes/userRoutes.ts#L18):
```typescript
router.post("/upload-users", upload.single("file"), uploadUsersFromExcel); // 🔴 No authMiddleware!
```
In [`backend/src/services/userServices.ts:322-325`](file:///d:/demobooking/demo-bookings/backend/src/services/userServices.ts#L322-L325):
```typescript
if (!userPayload.password) userPayload.password = "123456"; // 🔴 Default insecure password!
if (!userPayload.role) userPayload.role = "user";
if (!userPayload.status) userPayload.status = "active";
```

#### Exploit Impact
- An attacker can upload an Excel file containing arbitrary employee entries without credentials.
- Accounts are created in `status: "active"` with the known password `"123456"`.
- The attacker can immediately log in as any injected user, create fraudulent cab bookings, manipulate passenger itineraries, and consume fleet resources.

#### Remediation Specification
1. Attach `authMiddleware` and `requireRole(['TENANT_ADMIN', 'COMPANY_MANAGER'])`.
2. Restrict user creation strictly to the caller's verified `tenantId` and `companyId`.
3. Disallow plain default passwords. Generate a cryptographically random token, hash it using Bcrypt (`saltRounds = 12`), and trigger an email activation workflow.

---

### SEC-04: Cross-Tenant Data Leakage in Administrative Queries

#### Source Code Evidence
In [`backend/src/services/bookingServices.ts:358-386`](file:///d:/demobooking/demo-bookings/backend/src/services/bookingServices.ts#L358-L386):
```typescript
if (role === ROLES.USER) {
  const orders = await Booking.findAll({ where: { userId: userid }, ... });
  return res.status(200).json({ success: true, data: orders });
} else {
  // 🔴 VULNERABILITY: Any role other than 'user' (admin, dispatcher, manager, vendor)
  // executes findAll() with ZERO companyId or tenantId filter!
  const orders = await Booking.findAll({
    include: [ VehicleType, Vehicle, User, Company ],
    order: [['createdAt', 'DESC']]
  });
  return res.status(200).json({ success: true, data: orders });
}
```

#### Exploit Impact
- If a dispatcher or corporate manager from Fleet A or Client A calls `/api/order/getAllOrders`, the backend returns trips across all fleets and all corporate clients.
- Discloses passenger names, pickup/drop locations, phone numbers, flight details, and billing amounts across competing businesses.

#### Remediation Specification
1. Enforce fail-closed `@DefaultScope` injecting `WHERE tenantId = ctx.tenantId`.
2. For corporate client managers (`companyManager = true`), append `WHERE companyId = ctx.companyId`.

---

### SEC-05: Unauthenticated BOLA / IDOR Order History Scraping

#### Source Code Evidence
In [`backend/src/routes/bookingRoutes.ts:38-50`](file:///d:/demobooking/demo-bookings/backend/src/routes/bookingRoutes.ts#L38-L50):
```typescript
router.get("/details/:bookingCode", getBookingDetails);                     // 🔴 No auth!
router.get("/getallinvoicereport", getOverallInvoiceReport);                 // 🔴 No auth!
router.get("/user/:userId/all", getAllOrdersByUser);                        // 🔴 No auth!
router.get("/user/:userId/pending", getPendingOrdersByUser);                // 🔴 No auth!
router.get("/user/:userId/confirmed", getConfirmedOrdersByUser);            // 🔴 No auth!
router.get("/user/:userId/closed", getClosedOrdersByUser);                  // 🔴 No auth!
```

#### Exploit Impact
- Anyone can enumerate `bookingCode` values or user UUIDs to scrape complete trip histories, personal travel patterns, executive travel details, and billing records without logging in.

#### Remediation Specification
1. Add `authMiddleware` to every route in `bookingRoutes.ts`.
2. Enforce object-level authorization: caller `req.userId` must match target `:userId`, or caller must hold an administrative role within the same `tenantId`.

---

### SEC-08: Public Unauthenticated Static File Serving

#### Source Code Evidence
In [`backend/src/app.ts:70-86`](file:///d:/demobooking/demo-bookings/backend/src/app.ts#L70-L86) and [`app.ts:114-156`](file:///d:/demobooking/demo-bookings/backend/src/app.ts#L114-L156):
```typescript
app.use('/uploads', express.static(uploadsFolder));
app.use('/uploads/signature', express.static(path.join(__dirname, '..', '..', 'uploads', 'signature')));
app.use('/oncallinvoice', express.static(path.join(process.cwd(), 'uploads', 'oncallinvoice')));
app.use('/invoices', express.static(path.join(process.cwd(), 'uploads', 'invoices')));
```

#### Exploit Impact
- Express serves private files directly from disk without verifying request headers, tokens, or tenant boundaries.
- Passenger signatures (`/uploads/signature/sig_*.png`) can be extracted and forged on transit vouchers.
- PDF invoices (`/invoices/INV-*.pdf`) containing GSTINs, corporate addresses, and fare breakdowns can be harvested publicly.

#### Remediation Specification
1. Remove direct public `express.static` mappings for `/uploads/signature`, `/invoices`, and `/oncallinvoice`.
2. Implement an authenticated streaming controller:
   `GET /api/documents/stream/:category/:fileId`
   validating JWT session, tenant context, and user entitlement before streaming the file.
3. For enterprise cloud deployments, transition to AWS S3 / Cloudflare R2 Presigned URLs with 15-minute expirations.

---

### SEC-10: Inconsistent JWT Signatures & Typing Defect

#### Source Code Evidence
In [`backend/src/middleware/authMiddleware.ts:4-28`](file:///d:/demobooking/demo-bookings/backend/src/middleware/authMiddleware.ts#L4-L28):
```typescript
interface AuthenticatedRequest extends Request {
  userId?: number; // 🔴 TYPING DEFECT: userId in database is UUID (string)!
  role?: string;
}

const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
  userId: number;
  roles: string; // 🔴 Token generator uses 'roles' key
};
req.userId = decoded.userId;
req.role = decoded.roles;
```
In [`backend/src/services/authServices.ts:113, 131, 156`](file:///d:/demobooking/demo-bookings/backend/src/services/authServices.ts#L113-L156):
```typescript
accessToken: Security.generateJwtToken(
  { userId: user.userId, roles: userRole, companyId: user.companyId },
  ...
)
```

#### Exploit Impact
- `userId` is typed as a `number`, but the database models (`User.userId`, `Employee.employeeId`) use `DataType.UUID` (string).
- The JWT payload **omits `tenantId` entirely**, making it impossible for middleware to verify tenancy from the token alone.

#### Remediation Specification
1. Update `AuthenticatedRequest` interface:
   ```typescript
   export interface AuthenticatedUser {
     userId: string;
     email: string;
     role: string;
     tenantId: string;
     companyId?: string;
     isPlatformSuperAdmin?: boolean;
   }
   ```
2. Standardize JWT payload to `{ userId, email, role, tenantId, companyId }`.
3. Validate that the token's `tenantId` matches the request's resolved tenant context.

---

### SEC-15: Raw SQL Queries Bypassing Model Tenant Scopes

#### Source Code Evidence
In [`backend/src/services/onCallServices.ts:2367-2376`](file:///d:/demobooking/demo-bookings/backend/src/services/onCallServices.ts#L2367-L2376):
```typescript
await sequelize.query(
  `UPDATE oncallinvoice SET \`createdAt\` = :createdAt WHERE \`onCallBillId\` = :onCallBillId`,
  {
    replacements: { createdAt: mysqlDate, onCallBillId },
    transaction,
  }
);
```

#### Exploit Impact
- Raw SQL updates bypass all Sequelize model hooks, `@DefaultScope` filters, and tenant assertions.
- If a caller supplies an `onCallBillId` belonging to another tenant, the record is updated across tenant boundaries without error.

#### Remediation Specification
1. Prohibit un-scoped raw SQL for tenant-owned tables.
2. If raw SQL is strictly required for performance, the query **MUST explicitly include `tenantId = :tenantId` in the `WHERE` clause**:
   ```sql
   UPDATE oncallinvoice 
   SET createdAt = :createdAt 
   WHERE onCallBillId = :onCallBillId AND tenantId = :tenantId;
   ```

---

### SEC-16: Context Loss in Asynchronous Background Tasks

#### Source Code Evidence
In [`backend/src/services/empServices.ts:2498-2520`](file:///d:/demobooking/demo-bookings/backend/src/services/empServices.ts#L2498-L2520):
```typescript
async function autoApproveIfNoAction(bookingId: string) {
  setTimeout(async () => {
    try {
      const booking = await Booking.findByPk(bookingId); // 🔴 No TenantContext inside setTimeout!
      if (!booking) return;
      ...
    } catch (err) { ... }
  }, timeoutMs);
}
```

#### Exploit Impact
- When `setTimeout` fires, Node.js executes the callback in a separate asynchronous execution tree.
- If `AsyncLocalStorage` is not explicitly propagated, `tenantStorage.getStore()` evaluates to `undefined`.
- Under the required Fail-Closed scope, `Booking.findByPk(bookingId)` throws a `TenantContextMissingError`, causing the background auto-approval to crash silently.

#### Remediation Specification
1. Capture the active `TenantContext` before spawning the timer or worker.
2. Bind the context to the asynchronous callback using `tenantStorage.run()`:
   ```typescript
   export function scheduleTenantTask(ctx: TenantContextData, fn: () => Promise<void>, delayMs: number) {
     setTimeout(() => {
       tenantStorage.run(ctx, async () => {
         try {
           await fn();
         } catch (error) {
           logger.error('Background task execution failed:', error);
         }
       });
     }, delayMs);
   }
   ```

---

## 4. Architectural Security Specifications

```mermaid
graph TD
    subgraph ZERO_TRUST["Zero-Trust Security Architecture"]
        AUTH["1. Authentication & RBAC<br/>• Standardized JWT Claims<br/>• tenantId validation in token"]
        ISOLATION["2. Tenant Context Isolation<br/>• Fail-Closed AsyncLocalStorage<br/>• Mathematical WHERE tenantId = :id"]
        OBJECT_AUTH["3. Object-Level Ownership (BOLA)<br/>• caller.tenantId === record.tenantId<br/>• caller.companyId === record.companyId"]
        DOC_SEC["4. Secure Document Gateway<br/>• Tokenized streaming endpoints<br/>• 15-minute Presigned URLs"]
        ADMIN_AUDIT["5. Platform SuperAdmin Audit Log<br/>• Explicit Model.unscoped()<br/>• Immutable security audit trail"]
    end
```

### 4.1 Authentication & Role-Based Access Control (RBAC)
- Public routes are strictly restricted to: `/health`, `/api/auth/login`, `/api/auth/forgotPassword`, `/api/redirect/*`.
- Every other endpoint requires a valid Bearer JWT.
- Roles are strictly enforced:
  - `PLATFORM_SUPERADMIN`: System-wide infrastructure operations only.
  - `TENANT_ADMIN`: Fleet operator administrator (manages fleet, rates, dispatchers).
  - `DISPATCHER`: Operational dispatch console (assigns cabs, manages active trips).
  - `BILLING_CLERK`: Invoicing, payments, and rate auditing.
  - `COMPANY_MANAGER`: B2B corporate client ride approvals and employee roster uploads.
  - `USER`: Passenger ride booking and personal trip sheet history.
  - `DRIVER`: Driver mobile application (odometer logs, signatures, GPS tracking).

### 4.2 Platform SuperAdmin Audit Logging for Unscoped Bypasses
Whenever a Platform SuperAdmin executes an administrative query bypassing tenant scopes (via `Model.unscoped()`), the operation must be wrapped in an immutable audit interceptor:
```typescript
export const executeSuperAdminAuditQuery = async <T>(
  adminUserId: string,
  targetTenantId: string,
  action: string,
  queryFn: () => Promise<T>
): Promise<T> => {
  const result = await queryFn();
  await PlatformAuditLog.create({
    adminUserId,
    targetTenantId,
    action,
    timestamp: new Date(),
    ipAddress: currentIpAddress(),
  });
  return result;
};
```
