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

@Table({
  tableName: 'tenant_registration_requests',
  timestamps: true,
  indexes: [
    { name: 'idx_reg_status', fields: ['status'] },
    { name: 'idx_reg_email', fields: ['contactEmail'] },
    { name: 'idx_reg_code', fields: ['businessCode'] },
  ],
})
export class TenantRegistrationRequest extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  requestId!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  fleetName!: string;

  @Column({
    type: DataType.STRING(150),
    allowNull: true,
  })
  slug!: string | null;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  legalName!: string | null;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  displayName!: string | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  registeredAddress!: string | null;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  gstin!: string | null;

  @Column({
    type: DataType.STRING(15),
    allowNull: true,
  })
  panNumber!: string | null;

  @Column({
    type: DataType.STRING(10),
    allowNull: true,
    defaultValue: '996609',
  })
  sacCode!: string | null;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  website!: string | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  billingFooterText!: string | null;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  businessEmail!: string | null;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  businessPhone!: string | null;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  pinCode!: string | null;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  logoUrl!: string | null;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
  })
  businessCode!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  ownerName!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  contactEmail!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  contactPhone!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  city!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  state!: string;

  @Column({
    type: DataType.ENUM('BASIC', 'PRO', 'ENTERPRISE'),
    defaultValue: 'PRO',
    allowNull: false,
  })
  requestedPlanTier!: 'BASIC' | 'PRO' | 'ENTERPRISE';

  @Column({
    type: DataType.ENUM('MONTHLY', 'ANNUAL'),
    defaultValue: 'MONTHLY',
    allowNull: false,
  })
  billingCycle!: 'MONTHLY' | 'ANNUAL';

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  fleetSize!: string;

  @Column({
    type: DataType.ENUM('PENDING', 'APPROVED', 'REJECTED'),
    defaultValue: 'PENDING',
    allowNull: false,
  })
  status!: 'PENDING' | 'APPROVED' | 'REJECTED';

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  rejectionReason!: string | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  reviewNotes!: string | null;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  reviewedBy!: string | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  reviewedAt!: Date | null;

  @ForeignKey(() => Tenant)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  tenantId!: string | null;

  @BelongsTo(() => Tenant)
  tenant!: Tenant | null;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  })
  termsConsent!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  isNotificationRead!: boolean;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}
