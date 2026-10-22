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
import { TenantSubscription } from './tenantSubscription';

@Table({
  tableName: 'subscription_invoices',
  timestamps: true,
  indexes: [
    { name: 'idx_subinv_number', unique: true, fields: ['invoiceNumber'] },
    { name: 'idx_subinv_tenant', fields: ['tenantId'] },
    { name: 'idx_subinv_status', fields: ['paymentStatus'] },
  ],
})
export class SubscriptionInvoice extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  subscriptionInvoiceId!: string;

  @ForeignKey(() => Tenant)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  tenantId!: string;

  @BelongsTo(() => Tenant)
  tenant!: Tenant;

  @ForeignKey(() => TenantSubscription)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  subscriptionId!: string | null;

  @BelongsTo(() => TenantSubscription)
  subscription!: TenantSubscription | null;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
  })
  invoiceNumber!: string;

  @Column({
    type: DataType.ENUM('BASIC', 'PRO', 'ENTERPRISE'),
    allowNull: false,
  })
  planTier!: 'BASIC' | 'PRO' | 'ENTERPRISE';

  @Column({
    type: DataType.ENUM('MONTHLY', 'ANNUAL'),
    allowNull: false,
  })
  billingCycle!: 'MONTHLY' | 'ANNUAL';

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  baseAmount!: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
    defaultValue: 18.00,
    allowNull: false,
  })
  taxRate!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  taxAmount!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  totalAmount!: number;

  @Column({
    type: DataType.STRING(10),
    defaultValue: 'INR',
    allowNull: false,
  })
  currency!: string;

  @Column({
    type: DataType.ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED'),
    defaultValue: 'PENDING',
    allowNull: false,
  })
  paymentStatus!: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  paymentMethod!: string | null;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  transactionReference!: string | null;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  billingPeriodStart!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  billingPeriodEnd!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  paidAt!: Date | null;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  metadata!: any | null;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}
