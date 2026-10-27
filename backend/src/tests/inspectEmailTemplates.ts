import { sequelize } from '../models';

async function check() {
  await sequelize.authenticate();
  const [rows]: any = await sequelize.query('SELECT emailCode, title, scope, category, tenantId FROM emailConfiguration');
  console.log('TEMPLATES IN DB:', JSON.stringify(rows, null, 2));
  process.exit(0);
}
check();
