import sequelize from '../config/dbConfig';

async function run() {
  const [rows]: any = await sequelize.query('SELECT * FROM tenants');
  console.log('tenants:', JSON.stringify(rows, null, 2));
  process.exit(0);
}

run();
