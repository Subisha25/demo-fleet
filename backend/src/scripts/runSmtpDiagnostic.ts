import sequelize from '../config/dbConfig';
import { diagnoseSmtpConfig } from '../services/notificationService';

async function main() {
  try {
    await sequelize.authenticate();
    const result = await diagnoseSmtpConfig();
    console.log('[SMTP_DIAGNOSTIC_RESULT]', JSON.stringify(result, null, 2));
    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('Diagnostic error:', err);
    process.exit(1);
  }
}

main();
