import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({
  tableName: 'tenant_initial_allowance',
  timestamps: true,
  createdAt: 'firstUsedAt',
  updatedAt: 'lastUsedAt',
})
export class TenantInitialAllowance extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  tenantId!: string;

  @Column({
    type: DataType.STRING(30),
    allowNull: false,
  })
  module!: 'VEHICLES' | 'DRIVERS' | 'COMPANIES' | 'USERS' | 'BOOKINGS';

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
  })
  usedCount!: number;

  @CreatedAt
  @Column(DataType.DATE)
  firstUsedAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  lastUsedAt!: Date;
}
