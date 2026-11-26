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
  tableName: 'trial_extension_requests',
  timestamps: true,
  indexes: [
    { name: 'idx_trial_ext_tenant', fields: ['tenantId'] },
    { name: 'idx_trial_ext_status', fields: ['status'] },
    { name: 'idx_trial_ext_created', fields: ['createdAt'] },
  ],
})
export class TrialExtensionRequest extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  requestId!: string;

  @ForeignKey(() => Tenant)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  tenantId!: string;

  @BelongsTo(() => Tenant)
  tenant!: Tenant;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  requestedDays!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  approvedDays!: number | null;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  reason!: string;

  @Column({
    type: DataType.ENUM('PENDING', 'APPROVED', 'REJECTED'),
    defaultValue: 'PENDING',
    allowNull: false,
  })
  status!: 'PENDING' | 'APPROVED' | 'REJECTED';

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    allowNull: false,
  })
  requestedAt!: Date;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  reviewedBy!: string | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  reviewedAt!: Date | null;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  previousExpiry!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  newExpiry!: Date | null;

  @Column({
    type: DataType.ENUM('REQUEST_APPROVED', 'MANUAL_SUPERADMIN', 'REJECTED'),
    allowNull: true,
  })
  extensionType!: 'REQUEST_APPROVED' | 'MANUAL_SUPERADMIN' | 'REJECTED' | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  adminNotes!: string | null;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
