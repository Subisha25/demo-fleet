import { Op } from 'sequelize';
import { Company } from '../models/company';

/**
 * Converts a text string into a URL-friendly slug.
 */
export function slugify(text: string): string {
  if (!text) return 'company';
  const clean = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')       // Replace spaces and underscores with -
    .replace(/[^\w\-]+/g, '')      // Remove all non-word chars
    .replace(/\-\-+/g, '-')        // Replace multiple - with single -
    .replace(/^-+/, '')            // Trim - from start of text
    .replace(/-+$/, '');           // Trim - from end of text
  return clean || 'company';
}

/**
 * Generates a unique SEO URL slug for a company.
 * Guarantees globally unique slug across unscoped companies.
 */
export async function generateUniqueCompanySlug(
  baseText: string,
  excludeCompanyId?: string
): Promise<string> {
  const baseSlug = slugify(baseText);
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const whereClause: any = { seoUrl: candidate };
    if (excludeCompanyId) {
      whereClause.companyId = { [Op.ne]: excludeCompanyId };
    }
    const existing = await Company.unscoped().findOne({ where: whereClause });
    if (!existing) {
      return candidate;
    }
    candidate = `${baseSlug}-${counter}`;
    counter++;
  }
}
