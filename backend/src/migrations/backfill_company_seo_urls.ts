import { Company } from '../models/company';
import { generateUniqueCompanySlug } from '../utils/slugUtils';
import { sequelize } from '../models';

export async function backfillCompanySeoUrls() {
  await sequelize.authenticate();
  console.log('[Backfill] Connected to database');

  const companies = await Company.unscoped().findAll({
    where: sequelize.literal("seoUrl IS NULL OR TRIM(seoUrl) = ''")
  });

  console.log(`[Backfill] Found ${companies.length} companies without valid seoUrl`);

  let updatedCount = 0;
  for (const comp of companies) {
    const fallbackName = comp.companyName || 'company';
    const slug = await generateUniqueCompanySlug(fallbackName, comp.companyId);
    await comp.update({ seoUrl: slug });
    console.log(`[Backfill] Updated company '${comp.companyName}' (${comp.companyId}) with seoUrl='${slug}'`);
    updatedCount++;
  }

  console.log(`[Backfill] Completed. Successfully backfilled ${updatedCount} companies.`);
}

if (require.main === module) {
  backfillCompanySeoUrls()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Backfill Error]', err);
      process.exit(1);
    });
}
