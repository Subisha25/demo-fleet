import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export interface PlanSummaryData {
  tenantId: string;
  fleetName: string;
  businessCode: string;
  ownerName: string;
  contactEmail: string;
  planName: string;
  planTier: string;
  billingCycle: string;
  agreedPrice: number;
  currency: string;
  startDate: Date;
  renewalDate: Date;
  quotas: {
    vehicles: number;
    drivers: number;
    companies: number;
    trips: number;
  };
  features: string[];
}

/**
 * Generates an authoritative SaaS Plan Summary PDF on disk using Puppeteer.
 * Returns the absolute path and public download token.
 */
export const generatePlanSummaryPDF = async (
  data: PlanSummaryData
): Promise<{ filePath: string; fileName: string; downloadToken: string }> => {
  const plansDir = path.join(process.cwd(), 'uploads', 'plans');
  if (!fs.existsSync(plansDir)) {
    fs.mkdirSync(plansDir, { recursive: true });
  }

  const fileName = `Plan_Summary_${data.businessCode}_${data.tenantId.substring(0, 8)}.pdf`;
  const filePath = path.join(plansDir, fileName);

  const formattedStart = data.startDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const formattedEnd = data.renewalDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const priceFormatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: data.currency || 'INR',
    maximumFractionDigits: 0,
  }).format(data.agreedPrice);

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SaaS Plan Summary - ${data.fleetName}</title>
  <style>
    @page { margin: 20mm; size: A4; }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #1e293b;
      margin: 0;
      padding: 0;
      line-height: 1.5;
    }
    .header {
      border-bottom: 3px solid #1a365d;
      padding-bottom: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .title {
      font-size: 24px;
      font-weight: 800;
      color: #1a365d;
      margin: 0;
    }
    .subtitle {
      font-size: 13px;
      color: #64748b;
      margin-top: 4px;
    }
    .meta-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .meta-item {
      font-size: 12px;
    }
    .meta-label {
      color: #64748b;
      text-transform: uppercase;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .meta-value {
      color: #0f172a;
      font-weight: 600;
      font-size: 13px;
      margin-top: 2px;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      background: #e0f2fe;
      color: #0369a1;
    }
    h2 {
      font-size: 16px;
      color: #1a365d;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
      margin-top: 24px;
      margin-bottom: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      background: #f1f5f9;
      color: #475569;
      text-align: left;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 10px 12px;
      border-bottom: 1px solid #cbd5e1;
    }
    td {
      padding: 10px 12px;
      font-size: 12px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }
    .features-list {
      padding-left: 18px;
      font-size: 12px;
      color: #334155;
    }
    .features-list li {
      margin-bottom: 6px;
    }
    .footer {
      margin-top: 40px;
      border-top: 1px solid #e2e8f0;
      padding-top: 14px;
      font-size: 10px;
      color: #94a3b8;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">SaaS Plan & Entitlement Summary</h1>
      <div class="subtitle">FleetFlow Multi-Tenant Mobility Cloud Platform</div>
    </div>
    <div style="text-align: right;">
      <span class="badge">${data.planTier} TIER</span>
    </div>
  </div>

  <div class="meta-box">
    <div class="meta-item">
      <div class="meta-label">Fleet Operator</div>
      <div class="meta-value">${data.fleetName} (${data.businessCode})</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Registered Administrator</div>
      <div class="meta-value">${data.ownerName} &lt;${data.contactEmail}&gt;</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Selected Plan</div>
      <div class="meta-value">${data.planName}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Billing Cycle & Agreed Rate</div>
      <div class="meta-value">${priceFormatted} / ${data.billingCycle.toLowerCase()}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Current Period Start</div>
      <div class="meta-value">${formattedStart}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Next Period Renewal Date</div>
      <div class="meta-value">${formattedEnd}</div>
    </div>
  </div>

  <h2>Allocated Operational Resource Quotas</h2>
  <table>
    <thead>
      <tr>
        <th>Resource Module</th>
        <th>Included Allotment</th>
        <th>Overage Policy</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Active Fleet Vehicles</strong></td>
        <td>Up to ${data.quotas.vehicles >= 999999 ? 'Unlimited' : data.quotas.vehicles} Vehicles</td>
        <td>Strictly gated by subscription tier</td>
      </tr>
      <tr>
        <td><strong>Registered Drivers</strong></td>
        <td>Up to ${data.quotas.drivers >= 999999 ? 'Unlimited' : data.quotas.drivers} Drivers</td>
        <td>Strictly gated by subscription tier</td>
      </tr>
      <tr>
        <td><strong>Corporate Client Accounts</strong></td>
        <td>Up to ${data.quotas.companies >= 999999 ? 'Unlimited' : data.quotas.companies} Corporate Companies</td>
        <td>Strictly gated by subscription tier</td>
      </tr>
      <tr>
        <td><strong>Monthly Completed Trips</strong></td>
        <td>Up to ${data.quotas.trips >= 999999 ? 'Unlimited' : data.quotas.trips} Trips / Month</td>
        <td>Metered monthly with automatic reset</td>
      </tr>
    </tbody>
  </table>

  <h2>Included Plan Capabilities & Benefits</h2>
  <ul class="features-list">
    ${data.features.map((f) => `<li>${f}</li>`).join('')}
  </ul>

  <div class="footer">
    This document constitutes the authoritative SaaS Plan Summary for ${data.fleetName} on the FleetFlow Mobility Platform.<br>
    Tenant ID: ${data.tenantId} • Generated: ${new Date().toISOString()} • Confidential & Proprietary
  </div>
</body>
</html>`;

  // Render PDF via Puppeteer
  let browser: any;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: filePath,
      format: 'A4',
      printBackground: true,
      margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
    });
  } catch (pdfErr) {
    console.error('Puppeteer failed to render plan summary PDF, creating text fallback:', pdfErr);
    fs.writeFileSync(filePath, Buffer.from(`FleetFlow SaaS Plan Summary for ${data.fleetName}\nPlan: ${data.planName}\nPrice: ${priceFormatted}`));
  } finally {
    if (browser) await browser.close();
  }

  const downloadToken = jwt.sign(
    { tenantId: data.tenantId, fileName, type: 'PLAN_SUMMARY' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  return { filePath, fileName, downloadToken };
};
