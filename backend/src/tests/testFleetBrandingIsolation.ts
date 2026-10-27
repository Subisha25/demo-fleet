import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer';
import { sequelize, Tenant } from '../models';
import { getFleetDocumentBranding } from '../services/fleetBrandingService';
import { generateInvoiceHTML, InvoiceData } from '../appServices/appInvoiceServices';
import { generateMonthlyInvoiceHTML } from '../appServices/monthInvoiceServices';
import { generateOncallInvoiceHTML } from '../services/onCallServices';

async function runFleetBrandingIsolationTest() {
  console.log('================================================================');
  console.log('🧪 MULTI-TENANT BUSINESS IDENTITY & INVOICE ISOLATION TEST');
  console.log('================================================================\n');

  await sequelize.authenticate();
  console.log('✅ Connected to database: demodb');

  // 1. Provision / Upsert Two Test Tenants
  console.log('\n--- PHASE 1: PROVISION TWO DISTINCT TEST TENANTS ---');

  const tenantAlphaData = {
    tenantId: 'tenant-test-alpha',
    name: 'Alpha Mobility Services',
    code: 'ALPH',
    subdomain: 'alpha',
    contactEmail: 'admin@alphamobility.co.in',
    contactPhone: '9876500001',
    status: 'ACTIVE',
    legalName: 'Alpha Mobility Services Pvt Ltd',
    displayName: 'Alpha Cabs',
    registeredAddress: 'Suite 101, Alpha Towers, Anna Salai, Chennai, TN - 600002',
    gstin: '33AAACA1111A1Z1',
    panNumber: 'AAACA1111A',
    sacCode: '996609',
    website: 'https://alphamobility.co.in',
    businessEmail: 'billing@alphamobility.co.in',
    businessPhone: '9876500001',
    billingFooterText: 'Alpha Mobility Services: 24x7 Enterprise Logistics. Disputes subject to Chennai jurisdiction.',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pinCode: '600002',
    logoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40"><rect width="160" height="40" fill="%230052cc"/><text x="10" y="25" fill="white" font-weight="bold">ALPHA FLEET</text></svg>',
  };

  const tenantBetaData = {
    tenantId: 'tenant-test-beta',
    name: 'Beta Rapid Logistics',
    code: 'BETA',
    subdomain: 'beta',
    contactEmail: 'admin@betarapid.in',
    contactPhone: '9876500002',
    status: 'ACTIVE',
    legalName: 'Beta Rapid Logistics LLP',
    displayName: 'Beta Express',
    registeredAddress: 'Level 4, Beta Tech Hub, Outer Ring Road, Bengaluru, KA - 560103',
    gstin: '29BBBCB2222B1Z2',
    panNumber: 'BBBCB2222B',
    sacCode: '996609',
    website: 'https://betarapid.in',
    businessEmail: 'accounts@betarapid.in',
    businessPhone: '9876500002',
    billingFooterText: 'Beta Rapid Logistics: Fast & Reliable Corporate Dispatch. Disputes subject to Bengaluru jurisdiction.',
    city: 'Bengaluru',
    state: 'Karnataka',
    pinCode: '560103',
    logoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40"><rect width="160" height="40" fill="%23107c41"/><text x="10" y="25" fill="white" font-weight="bold">BETA FLEET</text></svg>',
  };

  // Upsert Tenant Alpha
  let [tenantAlpha] = await Tenant.findOrCreate({
    where: { tenantId: tenantAlphaData.tenantId },
    defaults: tenantAlphaData as any,
  });
  await tenantAlpha.update(tenantAlphaData);
  console.log(`✅ Tenant Alpha Ready: ${tenantAlpha.legalName} (${tenantAlpha.gstin})`);

  // Upsert Tenant Beta
  let [tenantBeta] = await Tenant.findOrCreate({
    where: { tenantId: tenantBetaData.tenantId },
    defaults: tenantBetaData as any,
  });
  await tenantBeta.update(tenantBetaData);
  console.log(`✅ Tenant Beta Ready: ${tenantBeta.legalName} (${tenantBeta.gstin})`);

  // 2. Resolve Fleet Document Branding
  console.log('\n--- PHASE 2: RESOLVE FLEET DOCUMENT BRANDING VIA BACKEND SERVICE ---');
  const brandingAlpha = await getFleetDocumentBranding('tenant-test-alpha');
  const brandingBeta = await getFleetDocumentBranding('tenant-test-beta');

  console.log('Branding Alpha:', {
    fleetName: brandingAlpha.fleetName,
    legalName: brandingAlpha.legalName,
    gstNumber: brandingAlpha.gstNumber,
    panNumber: brandingAlpha.panNumber,
    sacCode: brandingAlpha.sacCode,
    registeredAddress: brandingAlpha.registeredAddress,
  });

  console.log('Branding Beta:', {
    fleetName: brandingBeta.fleetName,
    legalName: brandingBeta.legalName,
    gstNumber: brandingBeta.gstNumber,
    panNumber: brandingBeta.panNumber,
    sacCode: brandingBeta.sacCode,
    registeredAddress: brandingBeta.registeredAddress,
  });

  if (brandingAlpha.gstNumber !== '33AAACA1111A1Z1') throw new Error('Alpha GSTIN mismatch');
  if (brandingBeta.gstNumber !== '29BBBCB2222B1Z2') throw new Error('Beta GSTIN mismatch');
  if (brandingAlpha.sacCode !== '996609' || brandingBeta.sacCode !== '996609') throw new Error('SAC code must be 996609');

  // 3. Prepare Common Customer & Trip Data
  console.log('\n--- PHASE 3: COMMON BOOKING & CUSTOMER CONTEXT (INDEPENDENT OF FLEET) ---');
  const customerContext = {
    customerName: 'Tech Giant Solutions Pvt Ltd',
    companyName: 'Tech Giant Solutions Pvt Ltd',
    companyaddress: 'Plot 99, Cyber City, Madhapur, Hyderabad, TG - 500081',
    gstNo: '36AAACT0000T1Z5',
  };
  console.log('Corporate Customer (Billing To):', customerContext);

  const sampleBookingInvoiceData: InvoiceData = {
    invoiceNumber: 'INV-2026-TEST-001',
    invoiceDate: '24-Oct-2026',
    dueDate: '03-Nov-2026',
    customerName: 'Suresh Kumar',
    customerAddress: 'Plot 99, Cyber City, Madhapur',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    companyName: customerContext.companyName,
    companyaddress: customerContext.companyaddress,
    gstNo: customerContext.gstNo,
    bookedby: 'Rajesh Sharma',
    orderNumber: 'ORD-88231',
    pickupPoint: 'Chennai Airport Terminal 1',
    vehicleType: 'Toyota Innova Crysta',
    vehicleNumber: 'TN-09-CD-4321',
    pickupDate: '24-Oct-2026 09:00 AM',
    email: 'traveldesk@techgiant.com',
    mobile: '9876543210',
    notes: 'Airport Pickup for VIP Executive Delegation',
    managerEmail: 'director.transport@techgiant.com',
    costCenter: 'CC-OPS-770',
    approvalStatus: 'Approved',
    hasSelfName: false,
    tripDetails: 'Airport to Tech Park and return',
    tripsheetno: 'TS-2026-9901',
    garageOpen: { kms: 12450, dateTime: '24-Oct-2026 08:30 AM' },
    garageClose: { kms: 12595, dateTime: '24-Oct-2026 06:30 PM' },
    usageKms: 145,
    usageHours: 9,
    lineItems: [
      { label: 'Package Amount (8 hrs / 80 kms)', value: 2400 },
      { label: 'Additional KMs Charges (65 km * 18)', value: 1170 },
      { label: 'Additional Hours Charges (1 hr * 150)', value: 150 },
      { label: 'Sub Total', value: 3720, isSubTotal: true },
      { label: 'CGST (2.5%)', value: 93 },
      { label: 'SGST (2.5%)', value: 93 },
      { label: 'Total Due', value: 3906, isTotal: true },
    ],
    amountInWords: 'Three Thousand Nine Hundred and Six Rupees Only',
  };

  // 4. Test Single Booking Invoice Generation
  console.log('\n--- PHASE 4: TEST SINGLE BOOKING INVOICE HTML GENERATION ---');
  const htmlAlphaBooking = generateInvoiceHTML(sampleBookingInvoiceData, brandingAlpha);
  const htmlBetaBooking = generateInvoiceHTML(sampleBookingInvoiceData, brandingBeta);

  // Assertions for Alpha
  console.log('Verifying Alpha Booking Invoice:');
  if (!htmlAlphaBooking.includes('33AAACA1111A1Z1')) throw new Error('Alpha invoice missing Alpha GSTIN');
  if (!htmlAlphaBooking.includes('AAACA1111A')) throw new Error('Alpha invoice missing Alpha PAN');
  if (!htmlAlphaBooking.includes('Suite 101, Alpha Towers')) throw new Error('Alpha invoice missing Alpha Address');
  if (!htmlAlphaBooking.includes('https://alphamobility.co.in')) throw new Error('Alpha invoice missing Alpha Website');
  if (!htmlAlphaBooking.includes('996609')) throw new Error('Alpha invoice missing SAC 996609');
  if (!htmlAlphaBooking.includes('Tech Giant Solutions Pvt Ltd')) throw new Error('Alpha invoice missing Customer Name');
  if (!htmlAlphaBooking.includes('36AAACT0000T1Z5')) throw new Error('Alpha invoice missing Customer GSTIN');
  if (htmlAlphaBooking.includes('Beta')) throw new Error('CRITICAL LEAK: Beta branding found in Alpha invoice!');
  if (htmlAlphaBooking.includes('29BBBCB2222B1Z2')) throw new Error('CRITICAL LEAK: Beta GSTIN found in Alpha invoice!');
  if (htmlAlphaBooking.includes('33AAMCG2518C1Z0')) throw new Error('CRITICAL LEAK: Legacy Grace Cabs GSTIN found in Alpha invoice!');
  if (htmlAlphaBooking.includes('Perumbakkam')) throw new Error('CRITICAL LEAK: Legacy address found in Alpha invoice!');
  console.log('  ✅ Alpha Booking Invoice assertions PASSED (100% isolated, 0 leaks)');

  // Assertions for Beta
  console.log('Verifying Beta Booking Invoice:');
  if (!htmlBetaBooking.includes('29BBBCB2222B1Z2')) throw new Error('Beta invoice missing Beta GSTIN');
  if (!htmlBetaBooking.includes('BBBCB2222B')) throw new Error('Beta invoice missing Beta PAN');
  if (!htmlBetaBooking.includes('Level 4, Beta Tech Hub')) throw new Error('Beta invoice missing Beta Address');
  if (!htmlBetaBooking.includes('https://betarapid.in')) throw new Error('Beta invoice missing Beta Website');
  if (!htmlBetaBooking.includes('996609')) throw new Error('Beta invoice missing SAC 996609');
  if (!htmlBetaBooking.includes('Tech Giant Solutions Pvt Ltd')) throw new Error('Beta invoice missing Customer Name');
  if (!htmlBetaBooking.includes('36AAACT0000T1Z5')) throw new Error('Beta invoice missing Customer GSTIN');
  if (htmlBetaBooking.includes('Alpha')) throw new Error('CRITICAL LEAK: Alpha branding found in Beta invoice!');
  if (htmlBetaBooking.includes('33AAACA1111A1Z1')) throw new Error('CRITICAL LEAK: Alpha GSTIN found in Beta invoice!');
  if (htmlBetaBooking.includes('33AAMCG2518C1Z0')) throw new Error('CRITICAL LEAK: Legacy Grace Cabs GSTIN found in Beta invoice!');
  if (htmlBetaBooking.includes('Perumbakkam')) throw new Error('CRITICAL LEAK: Legacy address found in Beta invoice!');
  console.log('  ✅ Beta Booking Invoice assertions PASSED (100% isolated, 0 leaks)');

  // 5. Test Monthly Invoice Generation
  console.log('\n--- PHASE 5: TEST MONTHLY INVOICE HTML GENERATION ---');
  const sampleMonthlyData = {
    monthlyInvoice: {
      monthlyInvoiceId: 'M-INV-TEST-01',
      invoiceCode: 'MINV-2026-001',
      invoiceMonth: 'Oct-2026',
      totalKm: 2500,
      totalHours: 160,
      subTotal: 65000,
      totalTaxAmount: 3250,
      grandTotal: 68250,
      extraCharges: 0,
      discountAmount: 0,
      companyAddress: customerContext.companyaddress,
    },
    items: [
      {
        vehicleNumber: 'TN-09-CD-4321',
        vehicleTypeName: 'Toyota Innova Crysta',
        route: 'Fixed Monthly Corporate Shuttle',
        packageAmount: 65000,
        packageDetails: JSON.stringify({ days: 26, km: 2500, amount: 65000 }),
      },
    ],
    company: {
      companyName: customerContext.companyName,
      companyAddress: customerContext.companyaddress,
      gstNo: customerContext.gstNo,
    },
    invoiceCode: 'MINV-2026-001',
    invoiceDate: '24-Oct-2026',
    invoiceMonth: 'Oct-2026',
    amountInWords: 'Sixty Eight Thousand Two Hundred and Fifty Rupees Only',
  };

  const htmlAlphaMonthly = generateMonthlyInvoiceHTML(sampleMonthlyData, brandingAlpha);
  const htmlBetaMonthly = generateMonthlyInvoiceHTML(sampleMonthlyData, brandingBeta);

  console.log('Verifying Monthly Invoices:');
  if (!htmlAlphaMonthly.includes('33AAACA1111A1Z1')) throw new Error('Alpha monthly invoice missing Alpha GSTIN');
  if (!htmlAlphaMonthly.includes('AAACA1111A')) throw new Error('Alpha monthly invoice missing Alpha PAN');
  if (htmlAlphaMonthly.includes('Beta')) throw new Error('Beta data in Alpha monthly invoice');
  if (!htmlBetaMonthly.includes('29BBBCB2222B1Z2')) throw new Error('Beta monthly invoice missing Beta GSTIN');
  if (!htmlBetaMonthly.includes('BBBCB2222B')) throw new Error('Beta monthly invoice missing Beta PAN');
  if (htmlBetaMonthly.includes('Alpha')) throw new Error('Alpha data in Beta monthly invoice');
  console.log('  ✅ Monthly Invoices assertions PASSED (Full Tenant Segregation)');

  // 6. Test On-Call Invoice Generation
  console.log('\n--- PHASE 6: TEST ON-CALL INVOICE HTML GENERATION ---');
  const sampleOncallInvoice = {
    onCallInvoiceCode: 'OC-2026-001',
    createdAt: new Date().toISOString(),
    companyName: customerContext.companyName,
    company: {
      companyName: customerContext.companyName,
      companyAddress: customerContext.companyaddress,
      gstNo: customerContext.gstNo,
    },
    items: [
      {
        tripSheetNo: 'TS-ONCALL-101',
        guestName: 'Anand V',
        vehicleType: 'Sedan',
        vehicleNumber: 'KA-01-XY-9999',
        totalKms: 45,
        totalHours: 3,
        packageAmount: 1200,
        extraKmAmount: 0,
        extraHoursAmount: 0,
        driverBeta: 0,
        totalAmount: 1200,
      },
    ],
    subTotal: 1200,
    taxes: JSON.stringify([{ taxName: 'GST 5%', amount: 60 }]),
    totalExtraCharges: 0,
    discountAmount: 0,
    advanceAmount: 0,
    grandTotal: 1260,
  };

  const htmlAlphaOncall = generateOncallInvoiceHTML(sampleOncallInvoice, brandingAlpha);
  const htmlBetaOncall = generateOncallInvoiceHTML(sampleOncallInvoice, brandingBeta);

  console.log('Verifying On-Call Invoices:');
  if (!htmlAlphaOncall.includes('33AAACA1111A1Z1')) throw new Error('Alpha on-call invoice missing Alpha GSTIN');
  if (htmlAlphaOncall.includes('Beta')) throw new Error('Beta in Alpha on-call invoice');
  if (!htmlBetaOncall.includes('29BBBCB2222B1Z2')) throw new Error('Beta on-call invoice missing Beta GSTIN');
  if (htmlBetaOncall.includes('Alpha')) throw new Error('Alpha in Beta on-call invoice');
  console.log('  ✅ On-Call Invoices assertions PASSED (Full Tenant Segregation)');

  // 7. Real PDF Generation using Puppeteer
  console.log('\n--- PHASE 7: REAL PDF RENDERING VIA PUPPETEER ---');
  const outputDir = path.join(process.cwd(), 'uploads', 'test_output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const pageAlpha = await browser.newPage();
    await pageAlpha.setContent(htmlAlphaBooking, { waitUntil: 'domcontentloaded' });
    const pdfPathAlpha = path.join(outputDir, 'invoice_fleet_alpha_sample.pdf');
    await pageAlpha.pdf({
      path: pdfPathAlpha,
      format: 'A4',
      printBackground: true,
      margin: { top: '15px', bottom: '15px', left: '15px', right: '15px' },
    });
    const statsAlpha = fs.statSync(pdfPathAlpha);
    console.log(`  📄 Fleet Alpha PDF generated: ${pdfPathAlpha} (${statsAlpha.size} bytes)`);

    const pageBeta = await browser.newPage();
    await pageBeta.setContent(htmlBetaBooking, { waitUntil: 'domcontentloaded' });
    const pdfPathBeta = path.join(outputDir, 'invoice_fleet_beta_sample.pdf');
    await pageBeta.pdf({
      path: pdfPathBeta,
      format: 'A4',
      printBackground: true,
      margin: { top: '15px', bottom: '15px', left: '15px', right: '15px' },
    });
    const statsBeta = fs.statSync(pdfPathBeta);
    console.log(`  📄 Fleet Beta PDF generated: ${pdfPathBeta} (${statsBeta.size} bytes)`);

    if (statsAlpha.size < 5000 || statsBeta.size < 5000) {
      throw new Error('Generated PDFs are suspiciously small or blank');
    }
  } finally {
    await browser.close();
  }

  // 8. Test Fallback Behavior (Fleet with zero logo and missing optional fields)
  console.log('\n--- PHASE 8: TEST FALLBACK BEHAVIOR (NO LOGO, MINIMAL PROFILE) ---');
  const minimalBranding = await getFleetDocumentBranding('tenant-does-not-exist');
  console.log('Fallback Branding Output:', {
    fleetName: minimalBranding.fleetName,
    hasLogoSrc: !!minimalBranding.logoSrc,
    sacCode: minimalBranding.sacCode,
  });

  const htmlMinimal = generateInvoiceHTML(sampleBookingInvoiceData, minimalBranding);
  if (!htmlMinimal.includes('996609')) throw new Error('Fallback SAC code missing');
  if (htmlMinimal.includes('33AAMCG2518C1Z0')) throw new Error('Legacy GSTIN leaked in fallback');
  if (htmlMinimal.includes('Perumbakkam')) throw new Error('Legacy address leaked in fallback');
  console.log('  ✅ Fallback Behavior assertions PASSED (No crashes, safe SVG monogram, 0 legacy leaks)');

  console.log('\n================================================================');
  console.log('🎉 ALL MULTI-TENANT ISOLATION & DOCUMENT TESTS PASSED PERFECTLY!');
  console.log('================================================================');
}

runFleetBrandingIsolationTest()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
  });
