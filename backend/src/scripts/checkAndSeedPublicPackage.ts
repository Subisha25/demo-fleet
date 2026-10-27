import { Tenant, Company, VehicleType, Vehicle, PackageData } from '../models';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

export async function checkAndSeedEligiblePackage() {
  console.log('--- Inspecting Active Tenants and Public Packages ---');
  const activeTenant = await Tenant.findOne({
    where: { status: 'ACTIVE' },
    order: [['createdAt', 'ASC']],
  });

  if (!activeTenant) {
    console.error('No active tenant found!');
    return;
  }
  console.log(`Active Tenant: ${activeTenant.name} (${activeTenant.slug}) ID: ${activeTenant.tenantId}`);

  // Find or create an active company for this tenant
  let company = await Company.findOne({
    where: { tenantId: activeTenant.tenantId, isDeleted: false },
  });

  if (!company) {
    company = await Company.create({
      companyId: uuidv4(),
      companyName: `${activeTenant.name} Corporate Travels`,
      tenantId: activeTenant.tenantId,
      city: 'Bangalore',
      state: 'Karnataka',
      isDeleted: false,
    });
    console.log(`Created Company: ${company.companyName} (${company.companyId})`);
  } else {
    console.log(`Found Existing Company: ${company.companyName} (${company.companyId})`);
  }

  // Find or create an eligible vehicle type with seatCapacity >= 4
  let vehicleType = await VehicleType.findOne({
    where: { tenantId: activeTenant.tenantId, seatCapacity: 4, isDeleted: false },
  });

  if (!vehicleType) {
    vehicleType = await VehicleType.create({
      vehicleTypeId: uuidv4(),
      vehicleType: 'Executive Sedan',
      seatCapacity: 4,
      AdvanceBookingHours: '2',
      vehicleImg: ['/uploads/vehicleImg/default_car.png'],
      tenantId: activeTenant.tenantId,
      isDeleted: false,
    });
    console.log(`Created VehicleType: ${vehicleType.vehicleType} (${vehicleType.vehicleTypeId})`);
  } else {
    console.log(`Found Existing VehicleType: ${vehicleType.vehicleType} (${vehicleType.vehicleTypeId})`);
  }

  // Find or create an eligible model
  let vehicleModel = await Vehicle.findOne({
    where: { tenantId: activeTenant.tenantId, vehicleTypeId: vehicleType.vehicleTypeId, isDeleted: false },
  });

  if (!vehicleModel) {
    vehicleModel = await Vehicle.create({
      vehicleId: uuidv4(),
      vehicleName: 'Swift Dzire Premium',
      vehicleTypeId: vehicleType.vehicleTypeId,
      manufacturing: 'Maruti Suzuki',
      vehicleImg: ['/uploads/vehicleImg/default_car.png'],
      availableStatus: 'Available',
      tenantId: activeTenant.tenantId,
      isDeleted: false,
    });
    console.log(`Created Vehicle Model: ${vehicleModel.vehicleName} (${vehicleModel.vehicleId})`);
  } else {
    console.log(`Found Existing Vehicle Model: ${vehicleModel.vehicleName} (${vehicleModel.vehicleId})`);
  }

  // Check if a Public Per-KM Package exists for this company
  let perKmPkg = await PackageData.findOne({
    where: {
      companyId: company.companyId,
      packageType: 'Public Per-KM Package',
      isDeleted: false,
    },
  });

  if (!perKmPkg) {
    const pkgPayload = {
      packageName: 'Standard City Per-KM',
      amountPerKm: 16.50,
      currency: 'INR',
      vehicleTypeId: vehicleType.vehicleTypeId,
      vehicleId: vehicleModel.vehicleId,
      advanceBookingHours: 2,
      description: 'Transparent pay-per-km metered city ride. Base rate Rs 16.50/KM with zero hidden charges.',
    };

    perKmPkg = await PackageData.create({
      packageDataId: uuidv4(),
      companyId: company.companyId,
      packageType: 'Public Per-KM Package',
      packages: JSON.stringify(pkgPayload),
      tenantId: activeTenant.tenantId,
      isDeleted: false,
    });
    console.log(`✓ Seeded Public Per-KM Package: "${pkgPayload.packageName}" at ₹${pkgPayload.amountPerKm}/KM`);
  } else {
    console.log(`Found Existing Package: ${perKmPkg.packageDataId}`);
  }

  console.log('✓ Eligible local public package is ready for end-to-end booking verification!');
}

if (require.main === module) {
  checkAndSeedEligiblePackage()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}
