import { EmailConfiguration } from '../models/emailConfiguration';
import { connectDB } from '../models';

async function main() {
  await connectDB();
  const templates = await EmailConfiguration.findAll();

  for (const t of templates) {
    if (t.emailCode?.includes('TENANT') || t.emailCode?.includes('ACTIVATION') || t.emailCode?.includes('APPROV')) {
      console.log('=== TEMPLATE:', t.emailCode, '===');
      console.log('Subject:', t.subject);
      console.log('Message snippet:\n', t.message?.substring(0, 500));
      console.log('\n----------------------------------------\n');
    }
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
