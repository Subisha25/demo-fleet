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
  tableName: 'saas_plans',
  timestamps: true,
})
export class SaaSPlan extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  planId!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
  })
  planTier!: string; // 'BASIC', 'PRO', 'ENTERPRISE', or custom tier

  @Column({
    type: DataType.STRING(150),
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description!: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 299.0,
  })
  priceMonthlyINR!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 3050.0,
  })
  priceAnnualINR!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 5.0,
  })
  priceMonthlyUSD!: number;

  @Column({
    type: DataType.STRING(10),
    allowNull: false,
    defaultValue: 'INR',
  })
  currency!: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    defaultValue: 'MONTHLY',
  })
  billingFrequency!: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  billingCycles!: string[]; // ['MONTHLY', 'ANNUAL']

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 15,
  })
  maxVehicles!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 15,
  })
  maxDrivers!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 3,
  })
  maxCompanies!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 5,
  })
  maxUsers!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1000,
  })
  monthlyTripQuota!: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isUnlimitedVehicles!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isUnlimitedDrivers!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isUnlimitedCompanies!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isUnlimitedUsers!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isUnlimitedTrips!: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
  })
  maxTaxes!: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isUnlimitedTaxes!: boolean;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    defaultValue: 'STANDARD',
  })
  themeLevel!: 'STANDARD' | 'PRESETS' | 'CUSTOM';

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 10,
  })
  maxPickupAreas!: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isUnlimitedPickupAreas!: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 5,
  })
  maxPickupCities!: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isUnlimitedPickupCities!: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 5,
  })
  maxPackages!: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isUnlimitedPackages!: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 3,
  })
  maxPaymentModes!: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isUnlimitedPaymentModes!: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: null,
  })
  annualTripQuota!: number | null;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  features!: string[];

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  featureEntitlements!: {
    customBranding?: boolean;
    themeLevel?: 'STANDARD' | 'PRESETS' | 'CUSTOM';
    themePresets?: string[];
    advancedReports?: boolean;
    emailTemplates?: boolean;
    smsTemplates?: boolean;
    bulkUpload?: boolean;
    monthlyInvoicing?: boolean;
    onCallInvoicing?: boolean;
    customDomain?: boolean;
    multiBranch?: boolean;
    dedicatedPolicyEngine?: boolean;
    pdfCustomizationTier?: 'STANDARD' | 'BRANDED' | 'ADVANCED';
  } | null;

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
