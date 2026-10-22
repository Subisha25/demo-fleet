import { QueryInterface, DataTypes } from 'sequelize';

export const migrationName = '01_phase1_saas_schema';

const safeCreateTable = async (queryInterface: QueryInterface, table: string, attributes: any): Promise<void> => {
  const tables = (await queryInterface.showAllTables()) as string[];
  if (!tables.includes(table)) {
    await queryInterface.createTable(table, attributes);
  }
};

const safeAddIndex = async (
  queryInterface: QueryInterface,
  table: string,
  fields: string[],
  options: { name: string; unique?: boolean }
): Promise<void> => {
  try {
    const rawIndexes: any = await queryInterface.showIndex(table);
    const exists = Array.isArray(rawIndexes) && rawIndexes.some((idx: any) => idx.name === options.name);
    if (!exists) {
      await queryInterface.addIndex(table, fields, options);
    }
  } catch {
    // Index already created or supported via model sync
  }
};

const safeDropTable = async (queryInterface: QueryInterface, table: string): Promise<void> => {
  const tables = (await queryInterface.showAllTables()) as string[];
  if (tables.includes(table)) {
    await queryInterface.dropTable(table);
  }
};

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  // 1. Create tenant_registration_requests
  await safeCreateTable(queryInterface, 'tenant_registration_requests', {
    requestId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    fleetName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    businessCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    ownerName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    contactEmail: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    contactPhone: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    requestedPlanTier: {
      type: DataTypes.ENUM('BASIC', 'PRO', 'ENTERPRISE'),
      defaultValue: 'PRO',
      allowNull: false,
    },
    billingCycle: {
      type: DataTypes.ENUM('MONTHLY', 'ANNUAL'),
      defaultValue: 'MONTHLY',
      allowNull: false,
    },
    fleetSize: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      defaultValue: 'PENDING',
      allowNull: false,
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reviewNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reviewedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    termsConsent: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  await safeAddIndex(queryInterface, 'tenant_registration_requests', ['status'], {
    name: 'idx_reg_status',
  });
  await safeAddIndex(queryInterface, 'tenant_registration_requests', ['contactEmail'], {
    name: 'idx_reg_email',
  });
  await safeAddIndex(queryInterface, 'tenant_registration_requests', ['businessCode'], {
    name: 'idx_reg_code',
  });

  // 2. Create tenant_activation_tokens
  await safeCreateTable(queryInterface, 'tenant_activation_tokens', {
    tokenId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tenants',
        key: 'tenantId',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    adminEmail: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    adminName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tokenHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    usedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isRevoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  await safeAddIndex(queryInterface, 'tenant_activation_tokens', ['tokenHash'], {
    name: 'idx_act_token_hash',
    unique: true,
  });
  await safeAddIndex(queryInterface, 'tenant_activation_tokens', ['tenantId'], {
    name: 'idx_act_tenant',
  });
  await safeAddIndex(queryInterface, 'tenant_activation_tokens', ['adminEmail'], {
    name: 'idx_act_email',
  });

  // 3. Create subscription_invoices
  await safeCreateTable(queryInterface, 'subscription_invoices', {
    subscriptionInvoiceId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tenants',
        key: 'tenantId',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    subscriptionId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tenant_subscriptions',
        key: 'subscriptionId',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    invoiceNumber: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    planTier: {
      type: DataTypes.ENUM('BASIC', 'PRO', 'ENTERPRISE'),
      allowNull: false,
    },
    billingCycle: {
      type: DataTypes.ENUM('MONTHLY', 'ANNUAL'),
      allowNull: false,
    },
    baseAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    taxRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 18.00,
      allowNull: false,
    },
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'INR',
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED'),
      defaultValue: 'PENDING',
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    transactionReference: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    billingPeriodStart: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    billingPeriodEnd: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  await safeAddIndex(queryInterface, 'subscription_invoices', ['invoiceNumber'], {
    name: 'idx_subinv_number',
    unique: true,
  });
  await safeAddIndex(queryInterface, 'subscription_invoices', ['tenantId'], {
    name: 'idx_subinv_tenant',
  });
  await safeAddIndex(queryInterface, 'subscription_invoices', ['paymentStatus'], {
    name: 'idx_subinv_status',
  });

  // 4. Create notification_logs
  await safeCreateTable(queryInterface, 'notification_logs', {
    logId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    channel: {
      type: DataTypes.ENUM('EMAIL', 'SMS'),
      allowNull: false,
    },
    recipient: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    templateCode: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    referenceEntity: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    referenceId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    providerStatus: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    providerMessageId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    errorDetails: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    retryCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    maxRetries: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  await safeAddIndex(queryInterface, 'notification_logs', ['channel'], {
    name: 'idx_notif_channel',
  });
  await safeAddIndex(queryInterface, 'notification_logs', ['recipient'], {
    name: 'idx_notif_recipient',
  });
  await safeAddIndex(queryInterface, 'notification_logs', ['referenceId'], {
    name: 'idx_notif_ref',
  });
  await safeAddIndex(queryInterface, 'notification_logs', ['templateCode'], {
    name: 'idx_notif_template',
  });
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  // Safe rollback in reverse order: drop strictly the 4 tables introduced in this migration
  await safeDropTable(queryInterface, 'notification_logs');
  await safeDropTable(queryInterface, 'subscription_invoices');
  await safeDropTable(queryInterface, 'tenant_activation_tokens');
  await safeDropTable(queryInterface, 'tenant_registration_requests');
};
