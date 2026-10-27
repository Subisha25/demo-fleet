import { Request, Response } from 'express';
import axios from 'axios';
import { Pickuparea, Pickupcity } from '../models';
import { USERS } from "../utils/costants";
import { getTenantContext, ROOT_TENANT_ID } from '../context/tenantContext';
const { ROLES } = USERS;

export const getCountries = async (req: Request, res: Response) => {
  try {
    const response = await axios.get('https://countriesnow.space/api/v0.1/countries/positions');
    const countries = response.data.data.map((c: any) => c.name);
    res.json(countries);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching countries' });
  }
};

export const getStates = async (req: Request, res: Response) => {
  const { country } = req.body;

  if (!country) return res.status(400).json({ message: 'Country is required' });

  try {
    const response = await axios.post('https://countriesnow.space/api/v0.1/countries/states', { country });
    const states = response.data.data.states.map((s: any) => s.name);
    res.json(states);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching states' });
  }
};

export const getCities = async (req: Request, res: Response) => {
  const { country, state } = req.body;

  if (!country || !state) {
    return res.status(400).json({ message: 'Country and state are required' });
  }

  try {
    const response = await axios.post('https://countriesnow.space/api/v0.1/countries/state/cities', { country, state });
    const cities = response.data.data;
    res.json(cities);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching cities' });
  }
};

export const addPickupCity = async (req: any, res: Response) => {
  const { country, state, pickupCity, sortOrder, isPickupCity } = req.body;
  try {
    const role = req.role;
    if (role === ROLES.USER) {
      return res.status(403).json({ message: 'Not Authorized' });
    }

    const ctx = getTenantContext();
    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;

    const existing = await Pickupcity.findOne({ where: { pickupCity, tenantId } });
    if (existing) return res.status(400).json({ message: 'Pickup city already registered in this fleet' });

    const pickupcity = await Pickupcity.create({
      country,
      state,
      pickupCity,
      sortOrder,
      isPickupCity,
      tenantId
    });

    res.status(201).json({ message: 'Registered successfully', pickupcity });
  } catch (err: any) {
    res.status(500).json({ error: err.message || err });
  }
};


export const addPickUpArea = async (req: any, res: Response) => {
  try {
    const role = req.role;
    if (role === ROLES.USER) {
      return res.status(403).json({ message: 'Not Authorized' });
    }

    const { pickupCity, pickupArea } = req.body;
    const ctx = getTenantContext();
    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;

    const existingCity = await Pickupcity.findOne({
      where: {
        pickupCity,
        tenantId
      }
    });

    if (!existingCity) {
      return res.status(400).json({
        message: 'City does not exist in this fleet',
      });
    }

    const existingArea = await Pickuparea.findOne({
      where: {
        pickupCity,
        pickupArea,
        tenantId
      }
    });

    if (existingArea) {
      return res.status(400).json({
        message: 'Area already exists in this fleet',
      });
    }

    const newArea = await Pickuparea.create({
      pickupCity,
      pickupArea,
      tenantId
    });

    res.status(201).json({
      message: 'Pickup area added successfully',
      data: newArea
    });
  } catch (error: any) {
    res.status(400).json({
      message: 'Error creating pickup area',
      error: error.message,
    });
  }
};
