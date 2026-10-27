import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  CreatedAt,
  DefaultScope
} from 'sequelize-typescript';
@DefaultScope(() => ({
  where: {
    isDeleted: false
  }
}))

@Table({
  tableName: 'pickuparea',
  timestamps: true, 
  updatedAt: false,
})
export class Pickuparea extends Model {
  @PrimaryKey
  @Column({
  type: DataType.UUID,
  defaultValue: DataType.UUIDV4,
})
  areaId!: string;

  @Column({
    type: DataType.UUID,
    allowNull: true,
    defaultValue: 'e7b8a1c0-0000-0000-0000-000000000001',
  })
  tenantId!: string;

  @Column(DataType.STRING)
  pickupCity!: string;

  
  @Column(DataType.STRING)
  pickupArea!: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false
  })
  isDeleted!: boolean;
  

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;
}
