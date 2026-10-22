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
import { Company } from './company';

export interface CompanyPolicyData {
  identity: {
    allowedEmailDomains?: string[]; // e.g. ["@danfoss.com"]
    employeeIdLabel?: string;      // e.g. "Danfoss User ID"
    employeeIdRegex?: string;      // e.g. "^\\d{6}$"
    requireCostCenter?: boolean;
    requireDepartment?: boolean;
  };
  bookingRules: {
    requireManagerApproval?: boolean;
    approvalThresholdAmount?: number;
    allowSelfBookingOnBehalf?: boolean;
    minAdvanceBookingMinutes?: number;
    allowNightTravel?: boolean;
  };
  invoicing: {
    billingMode?: 'SINGLE_TRIP' | 'ON_CALL' | 'MONTHLY';
    taxExempt?: boolean;
    customInvoicePrefix?: string;
  };
}

@Table({
  tableName: 'company_policies',
  timestamps: true,
})
export class CompanyPolicy extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  policyId!: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  tenantId!: string;

  @ForeignKey(() => Company)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
  })
  companyId!: string;

  @BelongsTo(() => Company)
  company!: Company;

  @Column({
    type: DataType.JSON,
    allowNull: false,
    defaultValue: {
      identity: {
        allowedEmailDomains: [],
        employeeIdLabel: "Employee ID",
        requireCostCenter: false,
        requireDepartment: false,
      },
      bookingRules: {
        requireManagerApproval: false,
        allowSelfBookingOnBehalf: true,
        minAdvanceBookingMinutes: 60,
        allowNightTravel: true,
      },
      invoicing: {
        billingMode: "SINGLE_TRIP",
        taxExempt: false,
      },
    },
  })
  policySettings!: CompanyPolicyData;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}
