import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function checkDetails() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'demodb'
  });

  const [emailConfigs]: any = await conn.query('SELECT emailConfigId, title, emailCode, emailBcc, fromAddress, fromName FROM emailconfiguration');
  console.log(`Total Email Configurations: ${emailConfigs.length}`);
  emailConfigs.forEach((c: any) => {
    console.log(`- [${c.emailCode}] ${c.title} -> BCC: "${c.emailBcc}" | FROM: "${c.fromAddress}" (${c.fromName})`);
  });

  const [tenants]: any = await conn.query('SELECT tenantId, name, contactEmail, contactPhone FROM tenants');
  console.log('\nTenants in DB:');
  tenants.forEach((t: any) => {
    console.log(`- [${t.tenantId}] ${t.name} -> Email: "${t.contactEmail}" | Phone: "${t.contactPhone}"`);
  });

  const [employees]: any = await conn.query('SELECT employeeId, username, email, phno, role, tenantId FROM employee WHERE role = "superadmin"');
  console.log('\nSuperAdmin Employees in DB:');
  employees.forEach((e: any) => {
    console.log(`- [${e.employeeId}] ${e.username} (${e.role}) -> Email: "${e.email}" | Phone: "${e.phno}" | Tenant: "${e.tenantId}"`);
  });

  await conn.end();
}

checkDetails().catch(console.error);
