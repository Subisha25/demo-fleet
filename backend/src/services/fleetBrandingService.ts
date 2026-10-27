import path from 'path';
import fs from 'fs';
import { Tenant } from '../models/tenant';
import { ROOT_TENANT_ID } from '../context/tenantContext';
import { getPlanDefinition } from './quotaService';
import { getFleetLoginUrl } from './slugService';
import config from '../config/config';

export interface FleetDocumentBranding {
  tenantId: string;
  fleetName: string;
  legalName: string;
  displayName: string;
  logoSrc: string;
  headerColor: string;
  primaryColor: string;
  footerColor: string;
  fontFamily: string;
  logoPlacement: 'left' | 'center' | 'right';
  pdfCustomizationTier: 'STANDARD' | 'BRANDED' | 'ADVANCED';
  gstin: string;
  gstNumber: string; // compatibility alias
  panNumber: string;
  sacCode: string;
  registeredAddress: string;
  website: string;
  businessEmail: string;
  businessPhone: string;
  contactPhone: string;
  contactEmail: string;
  billingFooterText: string;
  portalTitle: string;
  city: string;
  state: string;
  pinCode: string;
  fleetSlug: string;
  fleetLoginUrl: string;
}

const ALLOWED_HEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
const ALLOWED_FONTS = ['Helvetica Neue', 'Helvetica', 'Arial', 'Inter', 'Roboto', 'Outfit', 'sans-serif'];

export const sanitizeHexColor = (color: any, fallback: string): string => {
  if (typeof color === 'string' && ALLOWED_HEX.test(color.trim())) {
    return color.trim();
  }
  return fallback;
};

export const sanitizeFontFamily = (font: any, fallback: string): string => {
  if (typeof font === 'string') {
    const clean = font.replace(/[^a-zA-Z0-9,\s-]/g, '').trim();
    if (ALLOWED_FONTS.some((allowed) => clean.toLowerCase().includes(allowed.toLowerCase()))) {
      return `${clean}, sans-serif`;
    }
  }
  return fallback;
};

const sanitizeColor = sanitizeHexColor;
const sanitizeFont = sanitizeFontFamily;

/**
 * Authoritatively resolves fleet branding and business identity for a given tenant ID.
 * Strictly gates customization features by the tenant's plan entitlements while ensuring
 * every fleet's documents display their own legal profile (Legal Name, Address, GSTIN, PAN, SAC).
 */
export const getFleetDocumentBranding = async (
  tenantId?: string | null
): Promise<FleetDocumentBranding> => {
  const targetId = tenantId || ROOT_TENANT_ID;

  let tenant = await Tenant.findByPk(targetId);
  if (!tenant && targetId !== ROOT_TENANT_ID) {
    tenant = await Tenant.findByPk(ROOT_TENANT_ID);
  }

  const tokens = (tenant?.brandingTokens as any) || {};
  const name = tenant?.name || 'FleetFlow Fleet';
  const legalName = tenant?.legalName || tokens.legalName || name;
  const displayName = tenant?.displayName || tokens.displayName || name;
  const registeredAddress = tenant?.registeredAddress || tokens.registeredAddress || '';
  const gstin = tenant?.gstin || tokens.gstin || tokens.gstNumber || '';
  const panNumber = tenant?.panNumber || tokens.panNumber || (gstin && gstin.length >= 12 ? gstin.substring(2, 12) : '');
  const sacCode = tenant?.sacCode || tokens.sacCode || '996609';
  const website = tenant?.website || tokens.website || '';
  const businessEmail = tenant?.businessEmail || tokens.businessEmail || tenant?.contactEmail || '';
  const businessPhone = tenant?.businessPhone || tokens.businessPhone || tenant?.contactPhone || '';
  const contactPhone = tenant?.contactPhone || businessPhone || '';
  const contactEmail = tenant?.contactEmail || businessEmail || '';
  const billingFooterText = tenant?.billingFooterText || tokens.billingFooterText || '';
  const city = tenant?.city || tokens.city || '';
  const state = tenant?.state || tokens.state || '';
  const pinCode = tenant?.pinCode || tokens.pinCode || '';
  const portalTitle = tokens.portalTitle || `${displayName} Portal`;

  const planTier = tenant?.planTier || 'BASIC';
  const plan = await getPlanDefinition(planTier);
  const tier: 'STANDARD' | 'BRANDED' | 'ADVANCED' =
    plan?.featureEntitlements?.pdfCustomizationTier ||
    (planTier === 'ENTERPRISE' ? 'ADVANCED' : planTier === 'PRO' ? 'BRANDED' : 'STANDARD');

  // Colors & Font Resolution based on Tier
  let headerColor = '#275981';
  let primaryColor = '#275981';
  let footerColor = '#f8fafc';
  let fontFamily = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  let logoPlacement: 'left' | 'center' | 'right' = 'left';

  if (tier === 'STANDARD') {
    headerColor = sanitizeColor(tokens.headerColor || tokens.primaryColor, '#275981');
    primaryColor = headerColor;
    footerColor = '#f8fafc';
    fontFamily = "'Helvetica Neue', Helvetica, Arial, sans-serif";
    logoPlacement = 'left';
  } else if (tier === 'BRANDED') {
    headerColor = sanitizeColor(tokens.headerColor || tokens.primaryColor, '#C04E24');
    primaryColor = sanitizeColor(tokens.primaryColor, headerColor);
    footerColor = '#f8fafc';
    fontFamily = "'Helvetica Neue', Helvetica, Arial, sans-serif";
    logoPlacement = 'left';
  } else if (tier === 'ADVANCED') {
    headerColor = sanitizeColor(tokens.headerColor || tokens.primaryColor, '#C04E24');
    primaryColor = sanitizeColor(tokens.primaryColor, headerColor);
    footerColor = sanitizeColor(tokens.footerColor, '#f8fafc');
    fontFamily = sanitizeFont(tokens.fontFamily, "'Helvetica Neue', Helvetica, Arial, sans-serif");
    if (['left', 'center', 'right'].includes(tokens.logoPlacement)) {
      logoPlacement = tokens.logoPlacement;
    }
  }

  // Logo Resolution
  let logoSrc = '';
  const rawLogo = tenant?.logoUrl || tokens.logoUrl;

  if (rawLogo) {
    if (rawLogo.startsWith('data:image') || rawLogo.startsWith('http://') || rawLogo.startsWith('https://')) {
      logoSrc = rawLogo;
    } else {
      try {
        const cleanedPath = rawLogo.replace(/^\//, '');
        const absPath = path.isAbsolute(cleanedPath) ? cleanedPath : path.join(process.cwd(), cleanedPath);
        if (fs.existsSync(absPath)) {
          const ext = path.extname(absPath).replace('.', '').toLowerCase() || 'png';
          const mime = ext === 'svg' ? 'svg+xml' : ext === 'jpg' ? 'jpeg' : ext;
          const buf = fs.readFileSync(absPath);
          logoSrc = `data:image/${mime};base64,${buf.toString('base64')}`;
        }
      } catch (err) {
        // Fallback to neutral SVG below
      }
    }
  }

  // Neutral, modern SVG fallback if no logo configured
  if (!logoSrc) {
    const initials = displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w: string) => w[0] || '')
      .join('')
      .toUpperCase() || 'FF';

    const safeDisplayTitle = displayName.length > 18 ? displayName.substring(0, 16) + '..' : displayName;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="60" viewBox="0 0 180 60">
      <rect width="100%" height="100%" fill="#1C1A18" rx="8"/>
      <rect x="4" y="4" width="52" height="52" fill="${headerColor}" rx="6"/>
      <text x="30" y="36" font-family="'Helvetica Neue', Arial, sans-serif" font-size="20" font-weight="900" fill="#FFFFFF" text-anchor="middle">${initials}</text>
      <text x="64" y="35" font-family="'Helvetica Neue', Arial, sans-serif" font-size="12" font-weight="800" fill="#FFFFFF">${safeDisplayTitle}</text>
    </svg>`;
    logoSrc = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }

  const resolvedSlug = tenant?.slug || tenant?.subdomain || (targetId === ROOT_TENANT_ID ? 'fleetflow' : 'fleet');

  return {
    tenantId: tenant?.tenantId || targetId,
    fleetName: displayName || name,
    legalName,
    displayName,
    logoSrc,
    headerColor,
    primaryColor,
    footerColor,
    fontFamily,
    logoPlacement,
    pdfCustomizationTier: tier,
    gstin,
    gstNumber: gstin,
    panNumber,
    sacCode,
    registeredAddress,
    website,
    businessEmail,
    businessPhone,
    contactPhone,
    contactEmail,
    billingFooterText,
    portalTitle,
    city,
    state,
    pinCode,
    fleetSlug: resolvedSlug,
    fleetLoginUrl: getFleetLoginUrl(resolvedSlug),
  };
};
