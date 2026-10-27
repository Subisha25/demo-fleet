import { Response } from 'express';
import { SmsTemplate } from '../models/smsTemplate';
import { USERS } from '../utils/costants';
import { Op } from 'sequelize';
import { getTenantContext, ROOT_TENANT_ID } from '../context/tenantContext';
import { getFleetDocumentBranding } from './fleetBrandingService';
import { dispatchAuditedSms } from './smsServices';
const { ROLES } = USERS;

function replacePlaceholders(template: string, data: Record<string, string>) {
  let result = template;
  for (const key of Object.keys(data)) {
    const val = data[key] ?? '';
    result = result.replace(new RegExp(`###${key}###`, 'g'), val);
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), val);
  }
  return result;
}

export const fetchAllSmsTemplates = async (tenantId?: string, isPlatformAdmin: boolean = false) => {
  if (isPlatformAdmin && !tenantId) {
    return await SmsTemplate.findAll({
      order: [['createdAt', 'DESC']]
    });
  }

  const targetTenantId = tenantId || ROOT_TENANT_ID;

  const allTemplates = await SmsTemplate.findAll({
    where: {
      [Op.or]: [
        { tenantId: targetTenantId },
        { tenantId: ROOT_TENANT_ID },
        { tenantId: null }
      ]
    },
    order: [['createdAt', 'DESC']]
  });

  const templateMap = new Map<string, SmsTemplate>();

  // Root defaults
  allTemplates
    .filter(t => !t.tenantId || t.tenantId === ROOT_TENANT_ID)
    .forEach(t => {
      const code = t.templateCode || t.title;
      if (!templateMap.has(code)) {
        templateMap.set(code, t);
      }
    });

  // Tenant overrides
  allTemplates
    .filter(t => t.tenantId === targetTenantId && targetTenantId !== ROOT_TENANT_ID)
    .forEach(t => {
      const code = t.templateCode || t.title;
      templateMap.set(code, t);
    });

  return Array.from(templateMap.values());
};

export const getAllSmsTemplates = async (req: any, res: Response) => {
  try {
    if (req.role === ROLES.USER) {
      return res.status(403).json({ message: 'Not Authorized' });
    }

    const ctx = getTenantContext();
    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
    const isPlatformAdmin = ctx?.isPlatformSuperAdmin && !req.headers['x-tenant-id'];

    const smsTemplates = await fetchAllSmsTemplates(tenantId, isPlatformAdmin);

    res.status(200).json({
      message: 'SMS templates retrieved successfully',
      smsTemplates,
      count: smsTemplates.length
    });
  } catch (err: any) {
    console.error('Get all SMS templates error:', err);
    res.status(500).json({ error: err.message || 'Something went wrong' });
  }
};

export const getSmsTemplateById = async (req: any, res: Response) => {
  const { id } = req.params;

  try {
    if (req.role === ROLES.USER) {
      return res.status(403).json({ message: 'Not Authorized' });
    }

    if (!id) {
      return res.status(400).json({ message: 'SMS template ID is required' });
    }

    const template = await SmsTemplate.findByPk(id);
    if (!template) {
      return res.status(404).json({ message: 'SMS template not found' });
    }

    const ctx = getTenantContext();
    const callerTenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
    const isPlatformAdmin = ctx?.isPlatformSuperAdmin && !req.headers['x-tenant-id'];

    if (
      template.tenantId !== callerTenantId &&
      template.tenantId !== ROOT_TENANT_ID &&
      template.tenantId !== null &&
      !isPlatformAdmin
    ) {
      return res.status(403).json({ message: 'Forbidden: Cannot view another fleet\'s SMS template' });
    }

    res.status(200).json({
      message: 'SMS template retrieved successfully',
      smsTemplate: template
    });
  } catch (err: any) {
    console.error('Get SMS template by ID error:', err);
    res.status(500).json({ error: err.message || 'Something went wrong' });
  }
};

export const createSmsTemplate = async (req: any, res: Response) => {
  try {
    const { title, templateCode, message, senderId } = req.body;

    if (req.role === ROLES.USER) {
      return res.status(403).json({ message: 'Not Authorized' });
    }

    if (!title || !templateCode || !message) {
      return res.status(400).json({ message: 'Title, templateCode, and message are required' });
    }

    const ctx = getTenantContext();
    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;

    const existing = await SmsTemplate.findOne({
      where: { templateCode, tenantId }
    });
    if (existing) {
      return res.status(400).json({ message: 'SMS template with this code already exists in this fleet' });
    }

    const template = await SmsTemplate.create({
      title,
      templateCode,
      message,
      senderId: senderId || 'GRCCAB',
      tenantId,
      isActive: true
    });

    res.status(201).json({
      message: 'SMS template created successfully',
      smsTemplate: template
    });
  } catch (err: any) {
    console.error('Create SMS template error:', err);
    res.status(500).json({ error: err.message || 'Something went wrong' });
  }
};

export const updateSmsTemplate = async (req: any, res: Response) => {
  const { id } = req.params;
  const { title, templateCode, message, senderId, isActive } = req.body;

  try {
    if (req.role === ROLES.USER) {
      return res.status(403).json({ message: 'Not Authorized' });
    }

    if (!id) {
      return res.status(400).json({ message: 'SMS template ID is required' });
    }

    const template = await SmsTemplate.findByPk(id);
    if (!template) {
      return res.status(404).json({ message: 'SMS template not found' });
    }

    const ctx = getTenantContext();
    const callerTenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
    const isPlatformAdmin = ctx?.isPlatformSuperAdmin && !req.headers['x-tenant-id'];

    const updateData: any = {
      ...(title !== undefined && { title }),
      ...(templateCode !== undefined && { templateCode }),
      ...(message !== undefined && { message }),
      ...(senderId !== undefined && { senderId }),
      ...(isActive !== undefined && { isActive })
    };

    // If template belongs to caller's fleet, update directly
    if (template.tenantId === callerTenantId) {
      await template.update(updateData);
      return res.status(200).json({
        message: 'SMS template updated successfully',
        smsTemplate: template
      });
    }

    // If template is platform default
    if (!template.tenantId || template.tenantId === ROOT_TENANT_ID) {
      if (isPlatformAdmin) {
        await template.update(updateData);
        return res.status(200).json({
          message: 'Root SMS template updated successfully',
          smsTemplate: template
        });
      }

      // Fleet Admin customizing: check if fleet-specific copy already exists
      const existing = await SmsTemplate.findOne({
        where: { templateCode: template.templateCode, tenantId: callerTenantId }
      });

      if (existing) {
        await existing.update(updateData);
        return res.status(200).json({
          message: 'Fleet SMS template updated successfully',
          smsTemplate: existing
        });
      }

      // Clone as fleet-specific template
      const newTemplate = await SmsTemplate.create({
        title: title || template.title,
        templateCode: template.templateCode,
        message: message !== undefined ? message : template.message,
        senderId: senderId !== undefined ? senderId : template.senderId,
        isActive: isActive !== undefined ? isActive : template.isActive,
        tenantId: callerTenantId
      });

      return res.status(200).json({
        message: 'Fleet SMS template created and updated successfully',
        smsTemplate: newTemplate
      });
    }

    return res.status(403).json({ message: 'Forbidden: Cannot modify another fleet\'s SMS template' });
  } catch (err: any) {
    console.error('Update SMS template error:', err);
    res.status(500).json({ error: err.message || 'Something went wrong' });
  }
};

export const sendSmsFromTemplate = async (
  templateCode: string,
  data: Record<string, string>,
  recipient: string,
  tenantId?: string
) => {
  const targetTenantId = tenantId || ROOT_TENANT_ID;

  // 1. Try tenant-specific template
  let template: SmsTemplate | null = null;
  if (targetTenantId && targetTenantId !== ROOT_TENANT_ID) {
    template = await SmsTemplate.findOne({
      where: { templateCode, tenantId: targetTenantId }
    });
  }

  // 2. Fallback to platform root template
  if (!template) {
    template = await SmsTemplate.findOne({
      where: {
        templateCode,
        [Op.or]: [{ tenantId: ROOT_TENANT_ID }, { tenantId: null }]
      }
    });
  }

  if (!template) {
    throw new Error(`SMS template not found for code: ${templateCode}`);
  }

  let brandingData: Record<string, string> = {};
  try {
    const branding = await getFleetDocumentBranding(targetTenantId);
    brandingData = {
      FleetName: branding.fleetName || 'FleetFlow Fleet',
      CompanyName: branding.fleetName || 'FleetFlow Fleet',
      SupportPhone: branding.contactPhone || '',
      SupportEmail: branding.contactEmail || '',
    };
  } catch {}

  const mergedData = { ...brandingData, ...data };
  const finalMessage = replacePlaceholders(template.message, mergedData);

  return await dispatchAuditedSms({
    recipient,
    templateCode: template.templateCode,
    message: finalMessage,
    referenceEntity: 'SMS_TEMPLATE',
    metadata: { tenantId: targetTenantId, templateCode: template.templateCode }
  });
};
