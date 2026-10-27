import { Request, Response } from 'express';
import { Pickuparea, Pickupcity } from '../models';
import { USERS } from "../utils/costants";
import { Op } from 'sequelize';
import { assertTenantOwnership, isTenantError } from '../utils/tenantGuard';
import { getTenantContext, ROOT_TENANT_ID } from '../context/tenantContext';
const { ROLES } = USERS;

export const listPickUpArea = async (req: any, res: Response) => {
  try {
    const { status } = req.query;
    const ctx = getTenantContext();
    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
    const isPlatformAdmin = ctx?.isPlatformSuperAdmin;

    const tenantCondition = isPlatformAdmin && !req.headers['x-tenant-id']
      ? {}
      : tenantId === ROOT_TENANT_ID
        ? { [Op.or]: [{ tenantId: ROOT_TENANT_ID }, { tenantId: null }] }
        : { tenantId };

    let whereCondition: any = { ...tenantCondition };

    if (status === "1") {
      whereCondition.isDeleted = true;
    } else {
      whereCondition.isDeleted = false;
    }

    const pickuparea = await Pickuparea.unscoped().findAll({
      where: whereCondition,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      message: 'pickarea retrieved successfully',
      data: pickuparea,
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error retrieving pickarea',
      error: error.message,
    });
  }
};

export const getPickupAreaById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Area ID is required' });
    }

    const area = await Pickuparea.findOne({
      where: { 
        areaId: id,
      }
    });

    if (!area) {
      return res.status(404).json({ message: 'Pickup area not found' });
    }
    assertTenantOwnership(area, 'PickupArea');

    res.status(200).json({
      message: 'Pickup area retrieved successfully',
      data: area,
    });
  } catch (error: any) {
    if (isTenantError(error)) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({
      message: 'Error retrieving pickup area',
      error: error.message,
    });
  }
};

// UPDATE AREA ONLY
export const updatePickupArea = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { pickupCity, pickupArea } = req.body;
    const role = req.role;

    if (role === ROLES.USER) {
      return res.status(403).json({ message: 'Not Authorized' });
    }

    if (!id) {
      return res.status(400).json({ message: 'Area ID is required' });
    }

    const area = await Pickuparea.findOne({
      where: { 
        areaId: id,
      }
    });

    if (!area) {
      return res.status(404).json({ message: 'Pickup area not found' });
    }
    assertTenantOwnership(area, 'PickupArea');

    const ctx = getTenantContext();
    const tenantId = area.tenantId || ctx?.tenantId || ROOT_TENANT_ID;

    // Validate that pickupCity belongs to this fleet if changing city
    if (pickupCity && pickupCity !== area.pickupCity) {
      const cityExists = await Pickupcity.findOne({
        where: { pickupCity, tenantId }
      });
      if (!cityExists) {
        return res.status(400).json({
          message: 'Referenced pickup city does not exist in your fleet',
        });
      }
    }

    // Check for duplicate area name within the city and fleet
    const targetCity = pickupCity || area.pickupCity;
    const targetArea = pickupArea || area.pickupArea;
    const duplicate = await Pickuparea.findOne({
      where: {
        pickupCity: targetCity,
        pickupArea: targetArea,
        tenantId,
        areaId: { [Op.ne]: id } 
      }
    });

    if (duplicate) {
      return res.status(400).json({
        message: 'An area with this name already exists in this city for your fleet',
      });
    }

    await area.update({
      pickupCity: targetCity,
      pickupArea: targetArea
    });

    res.status(200).json({
      message: 'Pickup area updated successfully',
      data: area,
    });
  } catch (error: any) {
    if (isTenantError(error)) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({
      message: 'Error updating pickup area',
      error: error.message,
    });
  }
};

// DELETE AREA
export const deletePickupArea = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const role = req.role;

    if (role === ROLES.USER) {
      return res.status(403).json({ message: 'Not Authorized' });
    }

    if (!id) {
      return res.status(400).json({ message: 'Area ID is required' });
    }

    const area = await Pickuparea.unscoped().findOne({
      where: { 
        areaId: id,
      }
    });

    if (!area) {
      return res.status(404).json({ message: 'Pickup area not found' });
    }
    assertTenantOwnership(area, 'PickupArea');

    await area.update({ isDeleted: true });

    res.status(200).json({
      message: 'Pickup area deleted successfully',
      deletedArea: area
    });
  } catch (error: any) {
    if (isTenantError(error)) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({
      message: 'Error deleting pickup area',
      error: error.message,
    });
  }
};

// RESTORE AREA
export const restorePickupArea = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const role = req.role;

    if (role === ROLES.USER) {
      return res.status(403).json({ message: 'Not Authorized' });
    }

    if (!id) {
      return res.status(400).json({ message: 'Area ID is required' });
    }

    const area = await Pickuparea.unscoped().findOne({
      where: { areaId: id }
    });

    if (!area) {
      return res.status(404).json({ message: 'Pickup area not found' });
    }
    assertTenantOwnership(area, 'PickupArea');

    await area.update({ isDeleted: false });

    res.status(200).json({
      message: 'Pickup area restored successfully',
      restoredArea: area
    });
  } catch (error: any) {
    if (isTenantError(error)) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({
      message: 'Error restoring pickup area',
      error: error.message,
    });
  }
};
