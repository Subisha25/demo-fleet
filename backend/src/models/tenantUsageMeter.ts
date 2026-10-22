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
  tableName: 'tenant_usage_meters',
  timestamps: true,
})
export class TenantUsageMeter extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  meterId!: string;

  @ForeignKey(() => Tenant)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  tenantId!: string;

  @BelongsTo(() => Tenant)
  tenant!: Tenant;

  @Column({
    type: DataType.STRING(10), // e.g., "2026-10"
    allowNull: false,
  })
  billingMonth!: string;

  @Column({
    type: DataType.STRING(50), // "SMS", "MAPS", "STORAGE", "TRIPS"
    allowNull: false,
  })
  metricName!: string;

  @Column({
    type: DataType.BIGINT,
    defaultValue: 0,
    allowNull: false,
  })
  quantity!: number;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}
