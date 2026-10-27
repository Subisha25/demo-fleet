import { Request, Response } from 'express';
import { Vendor } from '../models/vendor';
import { USERS } from "../utils/costants";
import { Op } from 'sequelize';
import { assertTenantOwnership, isTenantError } from '../utils/tenantGuard';
import { getTenantContext, ROOT_TENANT_ID } from '../context/tenantContext';
const { ROLES } = USERS;

// Get All Owners (filtered by tenant and deleted status)
export const getOwner = async (req: any, res: Response) => {
  try {
    if (req.role === ROLES.USER) {
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

    let whereClause: any = { ...tenantCondition };

    // status = 1 => get deleted owners
    // status = 0 or undefined => get active owners
    if (status === "1") {
      whereClause.isDeleted = true;
    } else {
      whereClause.isDeleted = false;
    }

    const vendors = await Vendor.unscoped().findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      message: 'Owners fetched successfully',
      vendor: vendors,
    });

  } catch (err: any) {
    console.error('Error fetching owners:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get Owner by ID
export const getOwnerById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    
    const owner = await Vendor.findByPk(id);

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Owner not found'
      });
    }
    assertTenantOwnership(owner, 'Owner');

    res.status(200).json({
      success: true,
      message: 'Owner retrieved successfully',
      data: owner
    });

  } catch (err: any) {
    if (isTenantError(err)) {
      return res.status(403).json({ success: false, message: err.message });
    }
    console.error('Error fetching owner:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching owner',
      error: err.message
    });
  }
};

export const updateOwner = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { vendorName, email, phno, address, country, state, city, vehicleId } = req.body;

    const owner = await Vendor.findByPk(id);
    if (!owner) {
      return res.status(404).json({ success: false, message: 'Owner not found' });
    }
    assertTenantOwnership(owner, 'Owner');

    const ctx = getTenantContext();
    const tenantId = owner.tenantId || ctx?.tenantId || ROOT_TENANT_ID;

    if (email && email !== owner.email) {
      const existingOwner = await Vendor.findOne({ 
        where: { email, tenantId, vendorId: { [Op.ne]: id } }
      });
      if (existingOwner) {
        return res.status(400).json({ success: false, message: 'Email already exists for another owner in this fleet' });
      }
    }

    if (phno && phno !== owner.phno) {
      const existingPhone = await Vendor.findOne({
        where: { phno, tenantId, vendorId: { [Op.ne]: id } }
      });
      if (existingPhone) {
        return res.status(400).json({ success: false, message: 'Phone number already exists for another owner in this fleet' });
      }
    }

    await owner.update({
      ...(vendorName && { vendorName }),
      ...(email && { email }),
      ...(phno && { phno }),
      ...(address && { address }),
      ...(country && { country }),
      ...(state && { state }),
      ...(city && { city }),
      ...(vehicleId !== undefined && { vehicleId })
    });

    res.status(200).json({
      success: true,
      message: 'Owner updated successfully',
      data: owner
    });

  } catch (err: any) {
    if (isTenantError(err)) {
      return res.status(403).json({ success: false, message: err.message });
    }
    console.error('Error updating owner:', err);
    res.status(400).json({ success: false, message: 'Error updating owner', error: err.message });
  }
};

// Delete Owner
export const deleteOwner = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    
    const owner = await Vendor.unscoped().findByPk(id);

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Owner not found'
      });
    }
    assertTenantOwnership(owner, 'Owner');

    await owner.update({ isDeleted: true });

    res.status(200).json({
      success: true,
      message: 'Owner deleted successfully',
      data: owner
    });

  } catch (err: any) {
    if (isTenantError(err)) {
      return res.status(403).json({ success: false, message: err.message });
    }
    console.error('Error deleting owner:', err);
    res.status(500).json({
      success: false,
      message: 'Error deleting owner',
      error: err.message
    });
  }
};

// Restore (reactivate) Owner
export const restoreOwner = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const owner = await Vendor.unscoped().findByPk(id);

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Owner not found'
      });
    }
    assertTenantOwnership(owner, 'Owner');

    await owner.update({ isDeleted: false });

    res.status(200).json({
      success: true,
      message: 'Owner restored successfully',
      data: owner
    });

  } catch (err: any) {
    if (isTenantError(err)) {
      return res.status(403).json({ success: false, message: err.message });
    }
    console.error('Error restoring owner:', err);
    res.status(500).json({
      success: false,
      message: 'Error restoring owner',
      error: err.message
    });
  }
};