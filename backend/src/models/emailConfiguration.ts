import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  CreatedAt,
  UpdatedAt
} from 'sequelize-typescript';

@Table({
  tableName: 'emailConfiguration',
  timestamps: true
})
export class EmailConfiguration extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  emailConfigId!: string;

  @Column(DataType.STRING)
  title!: string;

  @Column(DataType.STRING)
  emailCode!: string;

  @Column(DataType.STRING)
  subject!: string;

  // @Column(DataType.STRING)
  // message!: string;

  @Column({
    type: DataType.TEXT('long'),
    allowNull: true,
  })
  message!: string;

  @Column(DataType.STRING)
  fromName!: string;

  @Column(DataType.STRING)
  fromAddress!: string;

  @Column(DataType.STRING)
  emailBcc!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  tenantId!: string;

  @Column({
    type: DataType.ENUM('FLEET', 'PLATFORM'),
    allowNull: false,
    defaultValue: 'FLEET',
  })
  scope!: 'FLEET' | 'PLATFORM';

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    defaultValue: 'OPERATIONAL',
  })
  category!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  placeholders!: string | null;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  isActive!: boolean;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}
