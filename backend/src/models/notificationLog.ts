import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({
  tableName: 'notification_logs',
  timestamps: true,
  indexes: [
    { name: 'idx_notif_channel', fields: ['channel'] },
    { name: 'idx_notif_recipient', fields: ['recipient'] },
    { name: 'idx_notif_ref', fields: ['referenceId'] },
    { name: 'idx_notif_template', fields: ['templateCode'] },
  ],
})
export class NotificationLog extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  logId!: string;

  @Column({
    type: DataType.ENUM('EMAIL', 'SMS'),
    allowNull: false,
  })
  channel!: 'EMAIL' | 'SMS';

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  recipient!: string; // Email address or E.164 phone number

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  templateCode!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  referenceEntity!: string | null;

  @Column({
    type: DataType.CHAR(36),
    allowNull: true,
  })
  tenantId!: string | null;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  referenceId!: string | null;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  idempotencyKey!: string | null;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  providerStatus!: string; // 'QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'SKIPPED'

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  providerMessageId!: string | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  errorDetails!: string | null;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: false,
  })
  retryCount!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 3,
    allowNull: false,
  })
  maxRetries!: number;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  metadata!: any | null; // Sanitized payload data, no secrets or credentials

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}
