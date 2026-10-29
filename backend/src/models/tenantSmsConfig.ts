import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Tenant } from './tenant';

export type SmsProviderType = '2FACTOR' | 'TWILIO';
export type SmsConfigStatus =
  | 'UNCONFIGURED'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'INVALID'
  | 'TEST_FAILED'
  | 'VERIFIED'
  | 'PENDING_SUBSCRIPTION';

export interface TemplateMappingItem {
  templateName: string;
  expectedVars: number;
  description?: string;
  varNames?: string[];
  isApproved?: boolean;
}

@Table({
  tableName: 'tenant_sms_configs',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['tenantId'],
      name: 'idx_tenant_sms_configs_tenant',
    },
  ],
})
export class TenantSmsConfig extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  configId!: string;

  @ForeignKey(() => Tenant)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
  })
  tenantId!: string;

  @BelongsTo(() => Tenant)
  tenant!: Tenant;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    defaultValue: '2FACTOR',
  })
  provider!: SmsProviderType;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  encryptedApiKey!: string | null;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  apiKeyMasked!: string | null;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    defaultValue: 'GRCCAB',
  })
  senderId!: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  templateMappings!: Record<string, TemplateMappingItem> | null;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    defaultValue: 'OTP1',
  })
  otpRoute!: string;

  @Column({
    type: DataType.ENUM(
      'UNCONFIGURED',
      'ACTIVE',
      'INACTIVE',
      'INVALID',
      'TEST_FAILED',
      'VERIFIED',
      'PENDING_SUBSCRIPTION'
    ),
    allowNull: false,
    defaultValue: 'UNCONFIGURED',
  })
  status!: SmsConfigStatus;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastVerifiedAt!: Date | null;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  lastVerificationResult!: any | null;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isVerified!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  isEnabled!: boolean;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}
