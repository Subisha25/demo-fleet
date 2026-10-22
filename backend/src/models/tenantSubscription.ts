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
  tableName: 'tenant_subscriptions',
  timestamps: true,
})
export class TenantSubscription extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  subscriptionId!: string;

  @ForeignKey(() => Tenant)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  tenantId!: string;

  @BelongsTo(() => Tenant)
  tenant!: Tenant;

  @Column({
    type: DataType.ENUM('BASIC', 'PRO', 'ENTERPRISE'),
    defaultValue: 'PRO',
    allowNull: false,
  })
  planTier!: 'BASIC' | 'PRO' | 'ENTERPRISE';

  @Column({
    type: DataType.ENUM('TRIALING', 'ACTIVE', 'PAST_DUE', 'SUSPENDED', 'CANCELED'),
    defaultValue: 'ACTIVE',
    allowNull: false,
  })
  status!: 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED' | 'CANCELED';

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 75,
  })
  vehicleQuota!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 75,
  })
  driverQuota!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 20,
  })
  companyQuota!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 10000,
  })
  monthlyTripQuota!: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  })
  allowOverage!: boolean;

  @Column({
    type: DataType.DOUBLE,
    defaultValue: 1000,
    allowNull: false,
  })
  monthlyOverageSpendCap!: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  currentPeriodStart!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  currentPeriodEnd!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  trialEndsAt!: Date;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}
