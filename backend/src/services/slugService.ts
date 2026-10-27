import { Op } from 'sequelize';
import { Tenant } from '../models/tenant';
import { TenantRegistrationRequest } from '../models/tenantRegistrationRequest';
import config from '../config/config';

/**
 * Normalizes a fleet name into a URL-safe, clean slug.
 * Examples:
 * - "ABC Transport" -> "abc-transport"
 * - "ABC Transport Chennai" -> "abc-transport-chennai"
 * - "Murugan Cabs & Travels!" -> "murugan-cabs-travels"
 */
export function slugifyFleetName(name: string): string {
  if (!name || typeof name !== 'string') return 'fleet';
  let slug = name
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^\w\s-]/g, '') // remove unsupported characters
    .replace(/[\s_-]+/g, '-')   // replace spaces, underscores, multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '');   // trim leading/trailing hyphens
  return slug || 'fleet';
}

/**
 * Generates a unique, stable canonical slug for a fleet.
 * Handles collisions deterministically by appending a numeric suffix (-2, -3, etc.).
 * Enforces database-level uniqueness across active tenants and pending registration requests.
 */
export async function generateUniqueFleetSlug(
  fleetName: string,
  excludeTenantId?: string
): Promise<string> {
  const baseSlug = slugifyFleetName(fleetName);
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const tenantConflict = await Tenant.findOne({
      where: {
        slug: candidate,
        ...(excludeTenantId ? { tenantId: { [Op.ne]: excludeTenantId } } : {}),
      },
    });

    const pendingConflict = await TenantRegistrationRequest.findOne({
      where: {
        slug: candidate,
        status: 'PENDING',
      },
    });

    if (!tenantConflict && !pendingConflict) {
      return candidate;
    }

    counter++;
    candidate = `${baseSlug}-${counter}`;
  }
}

/**
 * Returns the fully qualified public fleet login URL.
 */
export function getFleetLoginUrl(slug: string): string {
  const rawBase = config.baseurl?.webbaseurl || (process.env.NODE_ENV === 'production' ? (process.env.FRONTEND_URL || '') : 'http://localhost:3000');
  const cleanBase = (rawBase || 'http://localhost:3000').replace(/\/+$/, '');
  const cleanSlug = (slug || 'default').replace(/^\/+/, '');
  return `${cleanBase}/login/${cleanSlug}`;
}
