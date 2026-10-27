import { Request, Response } from 'express';
import { Pickupcity } from '../models';
import { USERS } from "../utils/costants";
import { Op } from 'sequelize';
import { assertTenantOwnership, isTenantError } from '../utils/tenantGuard';
import { getTenantContext, ROOT_TENANT_ID } from '../context/tenantContext';
const { ROLES } = USERS;

export const listPickupCity = async (req: any, res: Response) => {
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

    let pickupcity;

    if (status === '1') {
      pickupcity = await Pickupcity.unscoped().findAll({
        where: {
          isDeleted: true,
          ...tenantCondition,
        },
        order: [['createdAt', 'DESC']],
      });
    } else {
      pickupcity = await Pickupcity.findAll({
        where: {
          isDeleted: false,
          ...tenantCondition,
        },
        order: [['createdAt', 'DESC']],
      });
    }

    res.status(200).json({
      message: 'pickCity retrieved successfully',
      data: pickupcity,
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error retrieving pickup city',
      error: error.message,
    });
  }
};

export const getPickupCityById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'City ID is required' });
    }

    const city = await Pickupcity.findOne({
      where: { 
        cityId: id,
      }
    });

    if (!city) {
      return res.status(404).json({ message: 'Pickup city not found' });
    }
    assertTenantOwnership(city, 'PickupCity');

    res.status(200).json({
      message: 'Pickup city retrieved successfully',
      data: city,
    });
  } catch (error: any) {
    if (isTenantError(error)) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({
      message: 'Error retrieving pickup city',
      error: error.message,
    });
  }
};

// UPDATE CITY ONLY
export const updatePickupCity = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { country, state, pickupCity, sortOrder, isPickupCity } = req.body;
    const role = req.role;

    if (role === ROLES.USER) {
      return res.status(403).json({ message: 'Not Authorized' });
    }

    if (!id) {
      return res.status(400).json({ message: 'City ID is required' });
    }

    const city = await Pickupcity.findOne({
      where: { 
        cityId: id,
      }
    });

    if (!city) {
      return res.status(404).json({ message: 'Pickup city not found' });
    }
    assertTenantOwnership(city, 'PickupCity');

    const ctx = getTenantContext();
    const tenantId = city.tenantId || ctx?.tenantId || ROOT_TENANT_ID;

    // Check for duplicate city name if changing
    if (pickupCity && pickupCity !== city.pickupCity) {
      const duplicate = await Pickupcity.findOne({
        where: {
          pickupCity,
          tenantId,
          cityId: { [Op.ne]: id } 
        }
      });

      if (duplicate) {
        return res.status(400).json({
          message: 'A city with this name already exists in your fleet',
        });
      }
    }

    // Update the city record
    await city.update({
      country: country || city.country,
      state: state || city.state,
      pickupCity: pickupCity || city.pickupCity,
      sortOrder: sortOrder || city.sortOrder,
      isPickupCity: isPickupCity || city.isPickupCity,
    });

    // Reload to get updated data
    await city.reload();

    res.status(200).json({
      message: 'Pickup city updated successfully',
      data: city,
    });
  } catch (error: any) {
    if (isTenantError(error)) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({
      message: 'Error updating pickup city',
      error: error.message,
    });
  }
};

// DELETE CITY
export const deletePickupCity = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const role = req.role;

    if (role === ROLES.USER) {
      return res.status(403).json({ message: 'Not Authorized' });
    }

    if (!id) {
      return res.status(400).json({ message: 'City ID is required' });
    }

    const city = await Pickupcity.unscoped().findOne({
      where: { 
        cityId: id,
      }
    });

    if (!city) {
      return res.status(404).json({ message: 'Pickup city not found' });
    }
    assertTenantOwnership(city, 'PickupCity');

    await city.update({ isDeleted: true });

    res.status(200).json({
      message: 'Pickup city deleted successfully',
      deletedCity: {
        name: city.pickupCity,
        country: city.country,
        state: city.state
      }
    });
  } catch (error: any) {
    if (isTenantError(error)) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({
      message: 'Error deleting pickup city',
      error: error.message,
    });
  }
};

// RESTORE CITY
export const restorePickupCity = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const role = req.role;

    if (role === ROLES.USER) {
      return res.status(403).json({ message: 'Not Authorized' });
    }

    if (!id) {
      return res.status(400).json({ message: 'City ID is required' });
    }

    const city = await Pickupcity.unscoped().findOne({
      where: {
        cityId: id
      }
    });

    if (!city) {
      return res.status(404).json({ message: 'Pickup city not found' });
    }
    assertTenantOwnership(city, 'PickupCity');

    // Restore by setting isDeleted = false
    await city.update({ isDeleted: false });

    res.status(200).json({
      message: 'Pickup city restored successfully',
      restoredCity: {
        name: city.pickupCity,
        country: city.country,
        state: city.state
      }
    });
  } catch (error: any) {
    if (isTenantError(error)) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({
      message: 'Error restoring pickup city',
      error: error.message,
    });
  }
};
