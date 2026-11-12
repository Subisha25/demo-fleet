import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  CreatedAt,

} from 'sequelize-typescript';

@Table({
  tableName: 'otp',
  timestamps: true,
  updatedAt: false,
})
export class OTP extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  otpId!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  otp?: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  loginId!: string; // Can be userId, vendorId, or employeeId

  // 2Factor session ID
  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  sessionId?: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: 0,
  })
  attempts?: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  verifiedAt?: Date;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  resetToken?: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  expiresAt!: Date;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

}