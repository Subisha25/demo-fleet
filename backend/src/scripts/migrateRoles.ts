import sequelize from '../config/dbConfig';
import { Employee } from '../models/employee';
import { User } from '../models/user';
import { Op } from 'sequelize';

async function migrateRoles() {
  await sequelize.authenticate();
  console.log('Database connected.');

  const ROOT_ID = 'e7b8a1c0-0000-0000-0000-000000000001';

  // Any employee with non-root tenantId must NOT have platform role 'superadmin'
  const [empCount] = await Employee.update(
    { role: 'fleet_admin' },
    {
      where: {
        role: 'superadmin',
        tenantId: { [Op.ne]: ROOT_ID },
      },
    }
  );
  console.log(`Updated ${empCount} non-root employee record(s) to 'fleet_admin'.`);

  // Any user with non-root tenantId must NOT have platform role 'superadmin'
  const [userCount] = await User.update(
    { role: 'fleet_admin' },
    {
      where: {
        role: 'superadmin',
        tenantId: { [Op.ne]: ROOT_ID },
      },
    }
  );
  console.log(`Updated ${userCount} non-root user record(s) to 'fleet_admin'.`);

  const emps = await Employee.findAll({
    attributes: ['employeeId', 'username', 'email', 'role', 'tenantId'],
  });
  console.log('Current Employee Roles:', JSON.stringify(emps, null, 2));

  process.exit(0);
}

migrateRoles().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
