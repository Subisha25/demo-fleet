import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const dumpBin = 'C:\\Program Files\\MySQL\\MySQL Workbench 8.0 CE\\mysqldump.exe';
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.resolve(__dirname, `../../backup_demodb_${timestamp}.sql`);

console.log(`Starting backup of database: ${process.env.DB_NAME || 'demodb'}`);
const host = process.env.DB_HOST || 'localhost';
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD ? `-p${process.env.DB_PASSWORD}` : '';
const dbName = process.env.DB_NAME || 'demodb';

const cmd = `"${dumpBin}" -h ${host} -u ${user} ${password} ${dbName} > "${backupPath}"`;

try {
  execSync(cmd, { shell: 'cmd.exe', stdio: 'inherit' });
  const stat = fs.statSync(backupPath);
  console.log(`✓ Backup successfully created: ${backupPath}`);
  console.log(`✓ File size: ${stat.size} bytes`);
  process.exit(0);
} catch (err: any) {
  console.error('Backup failed:', err.message);
  process.exit(1);
}
