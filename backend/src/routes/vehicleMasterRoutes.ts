import express from 'express';
import {getAllVehicleMaster,updateVehicleMaster,deleteVehicleMaster,restoreVehicleMaster} from '../services/vehicleMasterServices';
import { authMiddleware } from '../middleware/authMiddleware';
import { Vehicle } from '../models';
import { VehicleType } from '../models';
import { Vendor } from '../models';
import { getTenantContext, ROOT_TENANT_ID } from '../context/tenantContext';
import { Op } from 'sequelize';

const router = express.Router();

router.get('/getAllVehicleMaster',authMiddleware,getAllVehicleMaster );
router.put("/:id/update", authMiddleware, updateVehicleMaster);
router.delete("/:id/delete", authMiddleware, deleteVehicleMaster);
router.put("/:id/restore", authMiddleware, restoreVehicleMaster);

// routes/vehicleMasterRoutes.ts (or suitable router)
router.get("/dropdown/models", authMiddleware, async (req, res) => {
  const ctx = getTenantContext();
  const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
  const isPlatformAdmin = ctx?.isPlatformSuperAdmin;

  const tenantCondition = isPlatformAdmin && !req.headers['x-tenant-id']
    ? {}
    : tenantId === ROOT_TENANT_ID
      ? { [Op.or]: [{ tenantId: ROOT_TENANT_ID }, { tenantId: null }] }
      : { tenantId };

  const rows = await Vehicle.findAll({
    where: { isDeleted: false, ...tenantCondition },
    attributes: ["vehicleId", "vehicleName", "vehicleTypeId"],
  });

  res.json({
    data: rows.map(r => ({
      id: r.vehicleId,
      label: r.vehicleName,
      vehicleTypeId: r.vehicleTypeId,
    })),
  });
});


router.get("/dropdown/types", authMiddleware, async (_req, res) => {
  const rows = await VehicleType.findAll({ attributes: ["vehicleTypeId", "vehicleType"] });
  res.json({ data: rows.map(r => ({ id: r.vehicleTypeId, label: r.vehicleType })) });
});

router.get("/dropdown/vendors", authMiddleware, async (req, res) => {
  const ctx = getTenantContext();
  const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
  const isPlatformAdmin = ctx?.isPlatformSuperAdmin;

  const tenantCondition = isPlatformAdmin && !req.headers['x-tenant-id']
    ? {}
    : tenantId === ROOT_TENANT_ID
      ? { [Op.or]: [{ tenantId: ROOT_TENANT_ID }, { tenantId: null }] }
      : { tenantId };

  const rows = await Vendor.findAll({
    where: { ...tenantCondition },
    attributes: ["vendorId", "vendorName"]
  });
  res.json({ data: rows.map(r => ({ id: r.vendorId, label: r.vendorName })) });
});


export default router;