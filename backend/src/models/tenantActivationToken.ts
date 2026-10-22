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
  tableName: 'tenant_activation_tokens',
  timestamps: true,
  indexes: [
    { name: 'idx_act_token_hash', unique: true, fields: ['tokenHash'] },
    { name: 'idx_act_tenant', fields: ['tenantId'] },
    { name: 'idx_act_email', fields: ['adminEmail'] },
  ],
})
export class TenantActivationToken extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  tokenId!: string;

  @ForeignKey(() => Tenant)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  tenantId!: string;

  @BelongsTo(() => Tenant)
  tenant!: Tenant;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  adminEmail!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  adminName!: string | null;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
  })
  tokenHash!: string; // SHA-256 hash of token, raw token never stored

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  expiresAt!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  usedAt!: Date | null;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  isRevoked!: boolean;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}
