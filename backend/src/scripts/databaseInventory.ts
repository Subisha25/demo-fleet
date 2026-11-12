import { Sequelize, QueryTypes } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'demodb',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false
  }
);

interface TableInfo {
  name: string;
  rowCount: number;
}

interface ForeignKeyInfo {
  tableName: string;
  columnName: string;
  constraintName: string;
  referencedTable: string;
  referencedColumn: string;
}

async function runInventory() {
  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL successfully.');

    // 1. Get all tables
    const tablesResult = await sequelize.query<any>('SHOW TABLES;', { type: QueryTypes.SELECT });
    const tableKey = Object.keys(tablesResult[0])[0];
    const tableNames: string[] = tablesResult.map((r: any) => r[tableKey]);

    console.log(`Total Tables: ${tableNames.length}`);

    // 2. Count rows in every table
    const tableCounts: TableInfo[] = [];
    for (const table of tableNames) {
      try {
        const countRes: any = await sequelize.query(`SELECT COUNT(*) as count FROM \`${table}\`;`, {
          type: QueryTypes.SELECT
        });
        tableCounts.push({ name: table, rowCount: Number(countRes[0].count) });
      } catch (err: any) {
        console.error(`Error counting ${table}:`, err.message);
        tableCounts.push({ name: table, rowCount: -1 });
      }
    }

    console.log('\n--- TABLE ROW COUNTS ---');
    console.table(tableCounts);

    // 3. Foreign key constraints
    const fks = await sequelize.query<ForeignKeyInfo>(
      `SELECT 
        TABLE_NAME as tableName, 
        COLUMN_NAME as columnName, 
        CONSTRAINT_NAME as constraintName, 
        REFERENCED_TABLE_NAME as referencedTable, 
        REFERENCED_COLUMN_NAME as referencedColumn 
      FROM 
        INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE 
        TABLE_SCHEMA = :dbName 
        AND REFERENCED_TABLE_NAME IS NOT NULL;`,
      {
        replacements: { dbName: process.env.DB_NAME || 'demodb' },
        type: QueryTypes.SELECT
      }
    );

    // Find unique pairs of (tableName -> referencedTable)
    const fkEdges: { from: string; to: string; col: string; refCol: string }[] = [];
    const edgeSet = new Set<string>();
    for (const fk of fks) {
      const key = `${fk.tableName} -> ${fk.referencedTable} (${fk.columnName}->${fk.referencedColumn})`;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        fkEdges.push({
          from: fk.tableName,
          to: fk.referencedTable,
          col: fk.columnName,
          refCol: fk.referencedColumn
        });
      }
    }

    console.log('\n--- UNIQUE FOREIGN KEY RELATIONSHIPS (Child -> Parent) ---');
    console.table(fkEdges);

  } catch (error) {
    console.error('Inventory failed:', error);
  } finally {
    await sequelize.close();
  }
}

runInventory();

