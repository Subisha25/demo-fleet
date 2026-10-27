import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey
} from 'sequelize-typescript';

@Table({
  tableName: 'tax',
  timestamps: true, 
  updatedAt: false,
})
export class Tax extends Model {
  @PrimaryKey
  @Column({
  type: DataType.UUID,
  defaultValue: DataType.UUIDV4,
})
  taxId!: string;

  @Column(DataType.STRING)
  taxName!: string;

  @Column(DataType.DOUBLE)
  taxPercent!: DoubleRange;

  @Column({
    type: DataType.UUID,
    allowNull: true,
    defaultValue: 'e7b8a1c0-0000-0000-0000-000000000001',
  })
  tenantId!: string;

  @Column(DataType.BOOLEAN)
  isActive!: boolean;
}
