import { Response } from 'express';
import { VehicleMaster } from '../models/vehicleMaster';
import { USERS } from "../utils/costants";
const { ROLES } = USERS;
import { VEHICLESTATUS } from '../utils/costants';
import { Vendor } from '../models/vendor';
import { Vehicle } from '../models/vehicle';
import { VehicleType } from '../models';
const {STATUS} = VEHICLESTATUS;
import { Op, fn, col, where } from "sequelize";
import sequelize from '../config/dbConfig';
import { assertTenantOwnership, isTenantError } from '../utils/tenantGuard';
import { getTenantContext, ROOT_TENANT_ID } from '../context/tenantContext';
// GET All Vehicle Masters
export const getAllVehicleMaster = async (req: any, res: Response) => {
  try {
    const role = req.role;
    if (role === ROLES.USER) {
      return res.status(403).json({ message: 'Not Authorized' });
    }

    const { status } = req.query;
    const ctx = getTenantContext();
    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
    const isPlatformAdmin = ctx?.isPlatformSuperAdmin;

    const tenantCondition = isPlatformAdmin && !req.headers['x-tenant-id']
      ? {}
      : tenantId === ROOT_TENANT_ID
        ? { [Op.or]: [{ tenantId: ROOT_TENANT_ID }, { tenantId: null }] }
        : { tenantId };

    const where: any = { isDeleted: status === '1' ? 1 : 0, ...tenantCondition };
    const vehicles = await VehicleMaster.findAll({ where });


    // Map only required fields and send
    const formatted = vehicles.map(v => ({
      vehicleMasterId: v.vehicleMasterId,
      vehicleNumber: v.vehicleNumber,
      vehicleModel: v.vehicleModelName, // direct column
      vehicleType: v.vehicleType,       // direct column
      vendorName: v.vendorName,           // direct column
      isDeleted: v.isDeleted
    }));

    res.status(200).json({
      message: 'Vehicles retrieved successfully',
      count: formatted.length,
      vehicles: formatted
    });
  } catch (err: any) {
    if (isTenantError(err)) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error('Error fetching vehicles:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateVehicleMaster = async (req: any, res: Response) => {
  const { id } = req.params;

  // You can send either just names OR ids from dropdowns
  const {
    vehicleNumber,
    vehicleModelName,    // name of the model (free text) – or send vehicleId
    vehicleType,         // plain string (from vehicleType table) – or send vehicleTypeId
    vendorName,           // plain string – or send ownerId
    vehicleId,
    vehicleTypeId,
    vendorId,
  } = req.body;

  try {
    if (req.role === ROLES.USER) return res.status(403).json({ message: "Not Authorized" });

    const vm = await VehicleMaster.findByPk(id);
    if (!vm) return res.status(404).json({ message: "Vehicle not found" });
    assertTenantOwnership(vm, 'VehicleMaster');

    const ctx = getTenantContext();
    const tenantId = vm.tenantId || ctx?.tenantId || ROOT_TENANT_ID;

    // Resolve names from IDs if provided (keeps both id and denormalized name columns in sync)
    let resolvedModelName = vehicleModelName ?? vm.vehicleModelName;
    let resolvedTypeName  = vehicleType ?? vm.vehicleType;
    let resolvedVendorName = vendorName ?? vm.vendorName;

    if (vehicleId) {
      const v = await Vehicle.findByPk(vehicleId, { include: [VehicleType] });
      if (!v) return res.status(404).json({ message: "Vehicle model not found" });
      if (v.tenantId && v.tenantId !== tenantId) {
        return res.status(403).json({ message: "Selected vehicle model does not belong to your fleet" });
      }
      resolvedModelName = v.vehicleName;
      resolvedTypeName = v.vehicleType?.vehicleType ?? resolvedTypeName;
    }
    if (vehicleTypeId) {
      const vt = await VehicleType.findByPk(vehicleTypeId);
      if (vt) resolvedTypeName = vt.vehicleType;
    }
    if (vendorId) {
      const o = await Vendor.findByPk(vendorId);
      if (!o) return res.status(404).json({ message: "Owner not found" });
      if (o.tenantId && o.tenantId !== tenantId) {
        return res.status(403).json({ message: "Selected owner does not belong to your fleet" });
      }
      resolvedVendorName = o.vendorName;
    }

    await vm.update({
      vehicleNumber: vehicleNumber ?? vm.vehicleNumber,
      vehicleId:     vehicleId     ?? vm.vehicleId,
      vehicleModelName: resolvedModelName,    //  correct column
      vehicleType:      resolvedTypeName,     //  stored as string in VehicleMaster
      vendorId:          vendorId     ?? vm.vendorId,
      vendorName:        resolvedVendorName,    //  correct column
    });

    return res.status(200).json({ message: "Vehicle updated successfully", data: vm });
  } catch (err: any) {
    if (isTenantError(err)) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error("Error updating vehicle:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


// DELETE Vehicle (soft delete)
export const deleteVehicleMaster = async (req: any, res: Response) => {
  const { id } = req.params;

  try {
    const role = req.role;
    if (role === ROLES.USER) {
      return res.status(403).json({ message: 'Not Authorized' });
    }

    const vehicle = await VehicleMaster.unscoped().findByPk(id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    assertTenantOwnership(vehicle, 'VehicleMaster');

    await vehicle.update({ isDeleted: 1 });

    res.status(200).json({
      message: 'Vehicle deleted successfully',
      data: { vehicleMasterId: id }
    });

  } catch (err: any) {
    if (isTenantError(err)) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error('Error deleting vehicle:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// RESTORE Vehicle
export const restoreVehicleMaster = async (req: any, res: Response) => {
  const { id } = req.params;

  try {
    const role = req.role;
    if (role === ROLES.USER) {
      return res.status(403).json({ message: 'Not Authorized' });
    }

    const vehicle = await VehicleMaster.unscoped().findByPk(id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    assertTenantOwnership(vehicle, 'VehicleMaster');

    await vehicle.update({ isDeleted: 0 });

    res.status(200).json({
      message: 'Vehicle restored successfully',
      data: { vehicleMasterId: id }
    });

  } catch (err: any) {
    if (isTenantError(err)) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error('Error restoring vehicle:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * PHASE 1 — Atomic Consolidated Vehicle Registration
 * Unifies Vehicle Type, Vehicle Model, and Vehicle Master into a single atomic transaction.
 * Reuses existing types/models case-insensitively within tenant scope; creates only when new.
 */
export interface UnifiedVehicleParams {
  tenantId: string;
  vehicleTypeName: string;
  seatCapacity?: number;
  advanceBookingHours?: string | number;
  vehicleModelName: string;
  manufacturing?: string;
  vehicleNumber: string;
  vendorId: string;
  uploadedImages?: string[];
}

export async function executeUnifiedVehicleTransaction(params: UnifiedVehicleParams) {
  const {
    tenantId,
    vehicleTypeName,
    seatCapacity = 4,
    advanceBookingHours = '0',
    vehicleModelName,
    manufacturing = 'Commercial',
    vehicleNumber,
    vendorId,
    uploadedImages = [],
  } = params;

  const cleanVehNumber = String(vehicleNumber).trim().toUpperCase();
  const cleanTypeName = String(vehicleTypeName).trim();
  const cleanModelName = String(vehicleModelName).trim();
  const cleanManufacturing = String(manufacturing).trim();
  const cleanAdvanceHours = String(advanceBookingHours || '0').trim();
  const cleanSeatCapacity = Math.max(1, parseInt(String(seatCapacity || '4'), 10));

  return await sequelize.transaction(async (t) => {
    // 1. Resolve or create VehicleType
    let vType = await VehicleType.findOne({
      where: {
        tenantId,
        isDeleted: false,
        [Op.and]: [
          where(
            fn('LOWER', fn('TRIM', col('vehicleType'))),
            cleanTypeName.toLowerCase()
          ),
        ],
      },
      transaction: t,
    });

    let typeCreated = false;
    if (!vType) {
      vType = await VehicleType.create(
        {
          vehicleType: cleanTypeName,
          seatCapacity: cleanSeatCapacity,
          AdvanceBookingHours: cleanAdvanceHours,
          priorMinutes: 0,
          vehicleImg: uploadedImages,
          tenantId,
          isDeleted: false,
        },
        { transaction: t }
      );
      typeCreated = true;
    }

    // 2. Resolve or create Vehicle (Model)
    let vModel = await Vehicle.findOne({
      where: {
        tenantId,
        vehicleTypeId: vType.vehicleTypeId,
        isDeleted: false,
        [Op.and]: [
          where(
            fn('LOWER', fn('TRIM', col('vehicleName'))),
            cleanModelName.toLowerCase()
          ),
        ],
      },
      transaction: t,
    });

    let modelCreated = false;
    if (!vModel) {
      vModel = await Vehicle.create(
        {
          vehicleName: cleanModelName,
          vehicleTypeId: vType.vehicleTypeId,
          manufacturing: cleanManufacturing,
          vehicleImg: uploadedImages.length ? uploadedImages : (vType.vehicleImg || []),
          availableStatus: 'Available',
          tenantId,
          isDeleted: false,
        },
        { transaction: t }
      );
      modelCreated = true;
    }

    // 3. Resolve Owner / Vendor
    const vendor = await Vendor.findOne({
      where: {
        vendorId: String(vendorId).trim(),
        tenantId: { [Op.in]: [tenantId, ROOT_TENANT_ID] },
        isDeleted: false,
      },
      transaction: t,
    });

    if (!vendor) {
      throw new Error('Selected owner does not exist or does not belong to your fleet.');
    }

    // 4. Duplicate vehicle registration number check within fleet
    const existingMaster = await VehicleMaster.findOne({
      where: {
        tenantId,
        vehicleNumber: cleanVehNumber,
        isDeleted: 0,
      },
      transaction: t,
    });

    if (existingMaster) {
      throw new Error(`Vehicle registration number '${cleanVehNumber}' is already registered in your fleet.`);
    }

    // 5. Create VehicleMaster record
    const vehicleMaster = await VehicleMaster.create(
      {
        vehicleNumber: cleanVehNumber,
        vehicleId: vModel.vehicleId,
        vendorId: vendor.vendorId,
        vehicleModelName: vModel.vehicleName,
        vehicleTypeId: vType.vehicleTypeId,
        vehicleType: vType.vehicleType,
        vendorName: vendor.vendorName,
        tenantId,
        isDeleted: 0,
      },
      { transaction: t }
    );

    return {
      success: true,
      vehicleMaster,
      vehicleType: vType,
      vehicleModel: vModel,
      vendor,
      typeCreated,
      modelCreated,
    };
  });
}

/**
 * Single Unified Vehicle Registration Handler (Consolidates Type, Model, and Master)
 */
export const createUnifiedVehicle = async (req: any, res: Response) => {
  try {
    const role = req.role;
    if (role === ROLES.USER) {
      return res.status(403).json({ success: false, message: 'Not Authorized' });
    }

    const ctx = getTenantContext();
    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;

    const {
      vehicleType,
      seatCapacity,
      AdvanceBookingHours,
      vehicleModelName,
      manufacturing,
      vehicleNumber,
      vendorId,
    } = req.body;

    // Field Validations
    if (!vehicleType || !String(vehicleType).trim()) {
      return res.status(400).json({ success: false, message: 'Vehicle Type is required.' });
    }

    const cleanSeatCapacity = Number(seatCapacity);
    if (!cleanSeatCapacity || cleanSeatCapacity < 1 || !Number.isInteger(cleanSeatCapacity)) {
      return res.status(400).json({ success: false, message: 'Seat Capacity must be a positive whole number (at least 1).' });
    }

    if (!vehicleModelName || !String(vehicleModelName).trim()) {
      return res.status(400).json({ success: false, message: 'Vehicle Model Name is required.' });
    }

    if (!manufacturing || !String(manufacturing).trim()) {
      return res.status(400).json({ success: false, message: 'Manufacturer is required.' });
    }

    if (!vehicleNumber || !String(vehicleNumber).trim()) {
      return res.status(400).json({ success: false, message: 'Vehicle Number is required.' });
    }

    if (!vendorId || !String(vendorId).trim()) {
      return res.status(400).json({ success: false, message: 'Vehicle Owner is required.' });
    }

    // Collect uploaded images or image strings
    const uploadedImages: string[] = req.files
      ? (req.files as Express.Multer.File[]).map((f) => f.filename)
      : Array.isArray(req.body.vehicleImg)
      ? req.body.vehicleImg
      : req.body.vehicleImg
      ? [req.body.vehicleImg]
      : [];

    const result = await executeUnifiedVehicleTransaction({
      tenantId,
      vehicleTypeName: vehicleType,
      seatCapacity: cleanSeatCapacity,
      advanceBookingHours: AdvanceBookingHours,
      vehicleModelName,
      manufacturing,
      vehicleNumber,
      vendorId,
      uploadedImages,
    });

    return res.status(201).json({
      success: true,
      message: 'Vehicle registered successfully in your fleet.',
      data: result,
      vehicleMaster: result.vehicleMaster,
    });
  } catch (err: any) {
    if (isTenantError(err)) {
      return res.status(err.status).json({ success: false, message: err.message });
    }
    console.error('Error creating unified vehicle:', err);
    return res.status(400).json({
      success: false,
      message: err.message || 'Error creating vehicle.',
    });
  }
};

/**
 * Options endpoint for Unified Add Vehicle form:
 * Returns tenant-scoped types, models, and owners.
 */
export const getUnifiedVehicleOptions = async (req: any, res: Response) => {
  try {
    const role = req.role;
    if (role === ROLES.USER) {
      return res.status(403).json({ message: 'Not Authorized' });
    }

    const ctx = getTenantContext();
    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
    const isPlatformAdmin = ctx?.isPlatformSuperAdmin;

    const tenantCondition = isPlatformAdmin && !req.headers['x-tenant-id']
      ? {}
      : tenantId === ROOT_TENANT_ID
        ? { [Op.or]: [{ tenantId: ROOT_TENANT_ID }, { tenantId: null }] }
        : { [Op.or]: [{ tenantId }, { tenantId: ROOT_TENANT_ID }] };

    const [types, models, vendors] = await Promise.all([
      VehicleType.findAll({
        where: { isDeleted: false, ...tenantCondition },
        attributes: ['vehicleTypeId', 'vehicleType', 'seatCapacity', 'AdvanceBookingHours', 'vehicleImg'],
        order: [['vehicleType', 'ASC']],
      }),
      Vehicle.findAll({
        where: { isDeleted: false, ...tenantCondition },
        attributes: ['vehicleId', 'vehicleName', 'vehicleTypeId', 'manufacturing', 'vehicleImg'],
        order: [['vehicleName', 'ASC']],
      }),
      Vendor.findAll({
        where: { isDeleted: false, ...tenantCondition },
        attributes: ['vendorId', 'vendorName', 'phno', 'email'],
        order: [['vendorName', 'ASC']],
      }),
    ]);

    return res.status(200).json({
      success: true,
      types: types.map((t) => ({
        id: t.vehicleTypeId,
        name: t.vehicleType,
        seatCapacity: t.seatCapacity,
        AdvanceBookingHours: t.AdvanceBookingHours,
        vehicleImg: t.vehicleImg,
      })),
      models: models.map((m) => ({
        id: m.vehicleId,
        name: m.vehicleName,
        vehicleTypeId: m.vehicleTypeId,
        manufacturing: m.manufacturing,
        vehicleImg: m.vehicleImg,
      })),
      owners: vendors.map((v) => ({
        id: v.vendorId,
        name: v.vendorName,
        phone: v.phno,
        email: v.email,
      })),
    });
  } catch (err: any) {
    console.error('Error fetching unified vehicle options:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
