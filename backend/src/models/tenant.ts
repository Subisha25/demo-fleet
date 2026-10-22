import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
  DefaultScope,
  HasOne,
} from 'sequelize-typescript';
import { TenantSubscription } from './tenantSubscription';

@DefaultScope(() => ({
  where: {
    isDeleted: false,
  },
}))
@Table({
  tableName: 'tenants',
  timestamps: true,
})
export class Tenant extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  tenantId!: string;

  @Column({
    type: DataType.STRING(150),
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    unique: true,
  })
  code!: string; // e.g. "GC", "APX"

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    unique: true,
  })
  subdomain!: string; // e.g. "gracecabs", "apex"

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    unique: true,
  })
  customDomain!: string; // e.g. "rides.gracecabs.in"

  @Column({
    type: DataType.ENUM('TRIALING', 'ACTIVE', 'PAST_DUE', 'SUSPENDED', 'CANCELED'),
    defaultValue: 'ACTIVE',
    allowNull: false,
  })
  status!: 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED' | 'CANCELED';

  @Column({
    type: DataType.ENUM('BASIC', 'PRO', 'ENTERPRISE'),
    defaultValue: 'PRO',
    allowNull: false,
  })
  planTier!: 'BASIC' | 'PRO' | 'ENTERPRISE';

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  contactEmail!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  contactPhone!: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  brandingTokens!: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    faviconUrl?: string;
    portalTitle?: string;
  } | null;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  isDeleted!: boolean;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;

  @HasOne(() => TenantSubscription)
  subscription!: TenantSubscription;
}
