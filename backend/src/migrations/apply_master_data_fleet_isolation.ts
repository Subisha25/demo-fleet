import { sequelize } from '../models';

export async function runMasterDataIsolationMigration() {
  console.log('--- Starting Master Data Isolation & DB Cleanup Migration ---');

  // 1. Add tenantId to tax table if not present
  try {
    const [cols]: any = await sequelize.query('SHOW COLUMNS FROM `tax` LIKE "tenantId"');
    if (cols.length === 0) {
      console.log('Adding tenantId to tax table...');
      await sequelize.query(
        "ALTER TABLE `tax` ADD COLUMN `tenantId` VARCHAR(36) NULL DEFAULT 'e7b8a1c0-0000-0000-0000-000000000001' AFTER `isActive`"
      );
      await sequelize.query(
        "UPDATE `tax` SET `tenantId` = 'e7b8a1c0-0000-0000-0000-000000000001' WHERE `tenantId` IS NULL"
      );
      console.log('✅ Added and backfilled tenantId on tax');
    } else {
      console.log('ℹ️ tenantId already exists on tax');
    }
  } catch (err: any) {
    console.error('Error on tax migration:', err.message);
  }

  // 2. Add tenantId to pickupcity table if not present
  try {
    const [cols]: any = await sequelize.query('SHOW COLUMNS FROM `pickupcity` LIKE "tenantId"');
    if (cols.length === 0) {
      console.log('Adding tenantId to pickupcity table...');
      await sequelize.query(
        "ALTER TABLE `pickupcity` ADD COLUMN `tenantId` VARCHAR(36) NULL DEFAULT 'e7b8a1c0-0000-0000-0000-000000000001' AFTER `isDeleted`"
      );
      await sequelize.query(
        "UPDATE `pickupcity` SET `tenantId` = 'e7b8a1c0-0000-0000-0000-000000000001' WHERE `tenantId` IS NULL"
      );
      console.log('✅ Added and backfilled tenantId on pickupcity');
    } else {
      console.log('ℹ️ tenantId already exists on pickupcity');
    }
  } catch (err: any) {
    console.error('Error on pickupcity migration:', err.message);
  }

  // 3. Add tenantId to pickuparea table if not present
  try {
    const [cols]: any = await sequelize.query('SHOW COLUMNS FROM `pickuparea` LIKE "tenantId"');
    if (cols.length === 0) {
      console.log('Adding tenantId to pickuparea table...');
      await sequelize.query(
        "ALTER TABLE `pickuparea` ADD COLUMN `tenantId` VARCHAR(36) NULL DEFAULT 'e7b8a1c0-0000-0000-0000-000000000001' AFTER `isDeleted`"
      );
      await sequelize.query(
        "UPDATE `pickuparea` SET `tenantId` = 'e7b8a1c0-0000-0000-0000-000000000001' WHERE `tenantId` IS NULL"
      );
      console.log('✅ Added and backfilled tenantId on pickuparea');
    } else {
      console.log('ℹ️ tenantId already exists on pickuparea');
    }
  } catch (err: any) {
    console.error('Error on pickuparea migration:', err.message);
  }

  // 4. Add tenantId to paymentmode table if not present
  try {
    const [cols]: any = await sequelize.query('SHOW COLUMNS FROM `paymentmode` LIKE "tenantId"');
    if (cols.length === 0) {
      console.log('Adding tenantId to paymentmode table...');
      await sequelize.query(
        "ALTER TABLE `paymentmode` ADD COLUMN `tenantId` VARCHAR(36) NULL DEFAULT 'e7b8a1c0-0000-0000-0000-000000000001' AFTER `isDeleted`"
      );
      await sequelize.query(
        "UPDATE `paymentmode` SET `tenantId` = 'e7b8a1c0-0000-0000-0000-000000000001' WHERE `tenantId` IS NULL"
      );
      console.log('✅ Added and backfilled tenantId on paymentmode');
    } else {
      console.log('ℹ️ tenantId already exists on paymentmode');
    }
  } catch (err: any) {
    console.error('Error on paymentmode migration:', err.message);
  }

  // 5. Add tenantId to vehicletype table if not present
  try {
    const [cols]: any = await sequelize.query('SHOW COLUMNS FROM `vehicletype` LIKE "tenantId"');
    if (cols.length === 0) {
      console.log('Adding tenantId to vehicletype table...');
      await sequelize.query(
        "ALTER TABLE `vehicletype` ADD COLUMN `tenantId` VARCHAR(36) NULL DEFAULT 'e7b8a1c0-0000-0000-0000-000000000001' AFTER `isDeleted`"
      );
      await sequelize.query(
        "UPDATE `vehicletype` SET `tenantId` = 'e7b8a1c0-0000-0000-0000-000000000001' WHERE `tenantId` IS NULL"
      );
      console.log('✅ Added and backfilled tenantId on vehicletype');
    } else {
      console.log('ℹ️ tenantId already exists on vehicletype');
    }
  } catch (err: any) {
    console.error('Error on vehicletype migration:', err.message);
  }

  // 6. Clean up duplicate redundant unique indexes on drivers table (phno, phno_2, ..., phno_38)
  try {
    const [driverIndexes]: any = await sequelize.query('SHOW INDEX FROM `drivers`');
    const phnoKeyNames = Array.from(
      new Set(
        driverIndexes
          .map((i: any) => i.Key_name)
          .filter((k: string) => k === 'phno' || k.startsWith('phno_'))
      )
    );
    console.log(`Found ${phnoKeyNames.length} redundant phno indexes on drivers:`, phnoKeyNames);
    for (const keyName of phnoKeyNames) {
      try {
        await sequelize.query(`ALTER TABLE \`drivers\` DROP INDEX \`${keyName}\``);
        console.log(`Dropped index ${keyName} from drivers`);
      } catch (dropErr: any) {
        console.warn(`Could not drop index ${keyName}:`, dropErr.message);
      }
    }
    // Add safe non-unique index on (tenantId, phno)
    try {
      await sequelize.query('ALTER TABLE `drivers` ADD INDEX `idx_drivers_tenant_phno` (`tenantId`, `phno`)');
      console.log('✅ Added idx_drivers_tenant_phno index to drivers');
    } catch (idxErr: any) {
      console.log('Index idx_drivers_tenant_phno already exists or warning:', idxErr.message);
    }
  } catch (err: any) {
    console.error('Error cleaning up drivers indexes:', err.message);
  }

  // 7. Clean up duplicate redundant unique indexes on vendor table (phno, phno_2, ..., phno_37)
  try {
    const [vendorIndexes]: any = await sequelize.query('SHOW INDEX FROM `vendor`');
    const phnoKeyNames = Array.from(
      new Set(
        vendorIndexes
          .map((i: any) => i.Key_name)
          .filter((k: string) => k === 'phno' || k.startsWith('phno_'))
      )
    );
    console.log(`Found ${phnoKeyNames.length} redundant phno indexes on vendor:`, phnoKeyNames);
    for (const keyName of phnoKeyNames) {
      try {
        await sequelize.query(`ALTER TABLE \`vendor\` DROP INDEX \`${keyName}\``);
        console.log(`Dropped index ${keyName} from vendor`);
      } catch (dropErr: any) {
        console.warn(`Could not drop index ${keyName}:`, dropErr.message);
      }
    }
    // Add safe non-unique index on (tenantId, phno)
    try {
      await sequelize.query('ALTER TABLE `vendor` ADD INDEX `idx_vendor_tenant_phno` (`tenantId`, `phno`)');
      console.log('✅ Added idx_vendor_tenant_phno index to vendor');
    } catch (idxErr: any) {
      console.log('Index idx_vendor_tenant_phno already exists or warning:', idxErr.message);
    }
  } catch (err: any) {
    console.error('Error cleaning up vendor indexes:', err.message);
  }

  // 8. Create sms_templates table if not exists
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS \`sms_templates\` (
        \`smsTemplateId\` VARCHAR(36) NOT NULL,
        \`title\` VARCHAR(255) NOT NULL,
        \`templateCode\` VARCHAR(255) NOT NULL,
        \`message\` TEXT NOT NULL,
        \`senderId\` VARCHAR(50) DEFAULT 'GRCCAB',
        \`tenantId\` VARCHAR(36) DEFAULT 'e7b8a1c0-0000-0000-0000-000000000001',
        \`isActive\` TINYINT(1) DEFAULT 1,
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`smsTemplateId\`),
        INDEX \`idx_sms_template_tenant_code\` (\`tenantId\`, \`templateCode\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ sms_templates table verified/created');

    // Seed default SMS templates if empty for root tenant
    const [existingTemplates]: any = await sequelize.query(
      "SELECT COUNT(*) as count FROM `sms_templates` WHERE `tenantId` = 'e7b8a1c0-0000-0000-0000-000000000001'"
    );
    if (existingTemplates[0].count === 0) {
      console.log('Seeding default SMS templates for root tenant...');
      const defaultTemplates = [
        {
          id: '11111111-0000-0000-0000-000000000001',
          title: 'Booking Creation Confirmation',
          code: 'BOOKING_CREATION',
          message: 'Dear ###CustomerName###, your booking ###BookingNumber### with ###FleetName### has been confirmed for ###BookingDate###. Thank you!',
          senderId: 'GRCCAB'
        },
        {
          id: '11111111-0000-0000-0000-000000000002',
          title: 'Driver Assigned - Customer Alert',
          code: 'DRIVER_ASSIGNED_TO_CUSTOMER',
          message: '###FleetName### Alert: Driver ###DriverName### (Mob: ###DriverPhone###) assigned for booking ###BookingNumber###. Vehicle: ###VehicleNumber###. Track: ###TrackingLink###',
          senderId: 'GRCCAB'
        },
        {
          id: '11111111-0000-0000-0000-000000000003',
          title: 'Driver Assignment Notification',
          code: 'DRIVER_ASSIGNED_TO_DRIVER',
          message: '###FleetName### Duty Alert: You have been assigned trip ###BookingNumber###. Customer: ###CustomerName### (###CustomerPhone###). Pickup: ###PickupPoint### at ###BookingDate###.',
          senderId: 'GRCCAB'
        },
        {
          id: '11111111-0000-0000-0000-000000000004',
          title: 'Driver Welcome Message',
          code: 'DRIVER_WELCOME_SMS',
          message: 'Welcome to ###FleetName###, ###DriverName###! Your driver account is active. Mobile: ###DriverPhone###. Drive safely!',
          senderId: 'GRCCAB'
        },
        {
          id: '11111111-0000-0000-0000-000000000005',
          title: 'Customer OTP Verification',
          code: 'CUSTOMER_OTP_SMS',
          message: 'Your verification OTP for ###FleetName### is ###OTP###. Valid for 10 minutes. Do not share this with anyone.',
          senderId: 'GRCCAB'
        },
        {
          id: '11111111-0000-0000-0000-000000000006',
          title: 'Invoice Generated Notification',
          code: 'INVOICE_GENERATED_SMS',
          message: 'Dear ###CustomerName###, invoice ###InvoiceNumber### for trip ###BookingNumber### is generated. Amount: Rs. ###TotalAmount###. View: ###InvoiceLink###. ###FleetName###',
          senderId: 'GRCCAB'
        }
      ];

      for (const t of defaultTemplates) {
        await sequelize.query(
          `INSERT INTO \`sms_templates\` (\`smsTemplateId\`, \`title\`, \`templateCode\`, \`message\`, \`senderId\`, \`tenantId\`, \`isActive\`)
           VALUES (:id, :title, :code, :message, :senderId, 'e7b8a1c0-0000-0000-0000-000000000001', 1)`,
          { replacements: t }
        );
      }
      console.log('✅ Seeded 6 default SMS templates');
    }
  } catch (err: any) {
    console.error('Error on sms_templates migration:', err.message);
  }

  console.log('--- Master Data Isolation Migration Completed ---');
}

if (require.main === module) {
  runMasterDataIsolationMigration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
