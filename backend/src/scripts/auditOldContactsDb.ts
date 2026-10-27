import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function auditDatabase() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'demodb'
  });

  console.log('--- DATABASE SCAN FOR OLD CONTACTS ---');

  // 1. Get all tables
  const [tables]: any = await conn.query('SHOW TABLES');
  const tableKey = Object.keys(tables[0])[0];

  const hits: Array<{ table: string; column: string; count: number; samples: any[] }> = [];

  for (const row of tables) {
    const tableName = row[tableKey];
    // get columns
    const [cols]: any = await conn.query(`SHOW COLUMNS FROM \`${tableName}\``);
    const textCols = cols.filter((c: any) =>
      c.Type.includes('varchar') || c.Type.includes('text') || c.Type.includes('char')
    );

    for (const col of textCols) {
      const colName = col.Field;
      try {
        const [res]: any = await conn.query(
          `SELECT \`${colName}\` FROM \`${tableName}\` WHERE \`${colName}\` LIKE '%90802%' OR \`${colName}\` LIKE '%gracecabs1975%' LIMIT 10`
        );
        if (res.length > 0) {
          hits.push({
            table: tableName,
            column: colName,
            count: res.length,
            samples: res.map((r: any) => r[colName])
          });
        }
      } catch (err: any) {
        // column may have incompatible collation or query error, ignore
      }
    }
  }

  console.log(`Scan complete. Found ${hits.length} occurrences:`);
  hits.forEach(h => {
    console.log(`Table [${h.table}] Column [${h.column}] (Found ${h.count}+ matches):`);
    h.samples.slice(0, 5).forEach(s => console.log(`   - "${String(s).substring(0, 100)}"`));
  });

  await conn.end();
}

auditDatabase().catch(console.error);
