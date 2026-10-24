import path from 'path';
import fs from 'fs';
import { Tenant } from '../models/tenant';
import { ROOT_TENANT_ID } from '../context/tenantContext';

export interface FleetDocumentBranding {
  tenantId: string;
  fleetName: string;
  logoSrc: string;
  headerColor: string;
  primaryColor: string;
  gstNumber: string;
  registeredAddress: string;
  contactPhone: string;
  contactEmail: string;
  portalTitle: string;
}

/**
 * Authoritatively resolves fleet branding for a given tenant ID.
 * Safely converts local logo paths into embedded base64 data URIs so Puppeteer and email clients render reliably.
 */
export const getFleetDocumentBranding = async (
  tenantId?: string | null
): Promise<FleetDocumentBranding> => {
  const targetId = tenantId || ROOT_TENANT_ID;

  let tenant = await Tenant.findByPk(targetId);
  if (!tenant && targetId !== ROOT_TENANT_ID) {
    tenant = await Tenant.findByPk(ROOT_TENANT_ID);
  }

  const name = tenant?.name || 'Grace Cabs Fleet Operations';
  const tokens = tenant?.brandingTokens || {};

  const headerColor =
    (tokens as any).headerColor ||
    tokens.primaryColor ||
    '#C04E24';

  const primaryColor = tokens.primaryColor || '#C04E24';
  const gstNumber = (tokens as any).gstNumber || '';
  const registeredAddress = (tokens as any).registeredAddress || '';
  const contactPhone = tenant?.contactPhone || '+91 90032 41571';
  const contactEmail = tenant?.contactEmail || 'subisha2002.m@gmail.com';
  const portalTitle = tokens.portalTitle || `${name} Portal`;

  let logoSrc = '';
  const rawLogo = tokens.logoUrl;

  if (rawLogo) {
    if (rawLogo.startsWith('data:image') || rawLogo.startsWith('http://') || rawLogo.startsWith('https://')) {
      logoSrc = rawLogo;
    } else {
      // Local path e.g. /uploads/fleetLogo/12345.png
      try {
        const cleanedPath = rawLogo.replace(/^\//, '');
        const absPath = path.join(__dirname, '..', '..', cleanedPath);
        if (fs.existsSync(absPath)) {
          const ext = path.extname(absPath).replace('.', '').toLowerCase() || 'png';
          const mime = ext === 'svg' ? 'svg+xml' : ext === 'jpg' ? 'jpeg' : ext;
          const buf = fs.readFileSync(absPath);
          logoSrc = `data:image/${mime};base64,${buf.toString('base64')}`;
        }
      } catch (err) {
        // Fallback below
      }
    }
  }

  // Neutral SVG fallback if no logo configured
  if (!logoSrc) {
    const initials = name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0] || '')
      .join('')
      .toUpperCase() || 'GC';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="60" viewBox="0 0 160 60">
      <rect width="100%" height="100%" fill="#1C1A18" rx="8"/>
      <rect x="4" y="4" width="52" height="52" fill="${headerColor}" rx="6"/>
      <text x="30" y="36" font-family="Arial, sans-serif" font-size="22" font-weight="900" fill="#FFFFFF" text-anchor="middle">${initials}</text>
      <text x="66" y="35" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#FFFFFF">${name.substring(0, 12)}</text>
    </svg>`;
    logoSrc = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }

  return {
    tenantId: tenant?.tenantId || targetId,
    fleetName: name,
    logoSrc,
    headerColor,
    primaryColor,
    gstNumber,
    registeredAddress,
    contactPhone,
    contactEmail,
    portalTitle,
  };
};
