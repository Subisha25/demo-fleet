import { Request, Response } from 'express';
import { Company, Employee, Invoice, Tax, Vendor, User, Booking, Tenant } from '../models';
import { USERS } from "../utils/costants";
const { ROLES } = USERS;
import { Op, Sequelize } from 'sequelize';
import {normalizeManagerEmails } from '../utils/email';
import { ORDER } from '../utils/costants';
import { assertTenantOwnership, isTenantError } from '../utils/tenantGuard';
import { getTenantContext, ROOT_TENANT_ID } from '../context/tenantContext';
import { generateUniqueCompanySlug } from '../utils/slugUtils';
import {
  validateMobileRecipient as validateMobile,
  validateEmailRecipient as validateEmail,
  validateGstin,
  validateRequired,
  handleDatabaseError,
} from '../utils/validationUtils';

/**
 * Resolve Company and Fleet by two-slug URL: /company/:fleetSlug/:companySlug
 */
export const getCompanyByFleetAndCompanySlug = async (req: Request, res: Response) => {
  try {
    const { fleetSlug, companySlug } = req.params;

    if (!fleetSlug || !companySlug) {
      return res.status(400).json({ success: false, message: "Fleet slug and company slug are required" });
    }

    const cleanFleetSlug = fleetSlug.trim().toLowerCase();
    const cleanCompanySlug = companySlug.trim().toLowerCase();

    // 1. Resolve Tenant by slug, subdomain, code or primary identifier
    const tenant = await Tenant.findOne({
      where: {
        isDeleted: false,
        [Op.or]: [
          { slug: cleanFleetSlug },
          { subdomain: cleanFleetSlug },
          { code: cleanFleetSlug.toUpperCase() },
          ...(cleanFleetSlug === 'fleetflow' || cleanFleetSlug === 'primary' ? [{ tenantId: ROOT_TENANT_ID }] : [])
        ]
      }
    });

    if (!tenant) {
      return res.status(404).json({ success: false, message: "Fleet not found" });
    }

    // 2. Resolve Company by seoUrl within this tenant
    const company = await Company.findOne({
      where: {
        seoUrl: cleanCompanySlug,
        tenantId: tenant.tenantId,
        isDeleted: false,
      },
      attributes: [
        "companyId",
        "companyName",
        "companyLogo",
        "seoUrl",
        "tenantId",
        "companyAddress",
        "companyPhno",
        "startTime",
        "closeTime"
      ]
    });

    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found for this fleet" });
    }

    const resolvedFleetSlug = tenant.slug || tenant.subdomain || cleanFleetSlug;

    return res.status(200).json({
      success: true,
      ...company.toJSON(),
      tenantId: tenant.tenantId,
      fleetSlug: resolvedFleetSlug,
      fleetName: tenant.displayName || tenant.name,
      fleetLogo: tenant.brandingTokens?.logoUrl || tenant.logoUrl || null,
      companyPortalUrl: `/company/${resolvedFleetSlug}/${company.seoUrl}`
    });
  } catch (error: any) {
    console.error("Error fetching company by fleet and company slug:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Backward compatibility: Resolve Company by single seoUrl: /company/:seoUrl
 */
export const getCompanyBySeoUrl = async (req: Request, res: Response) => {
  try {
    const { seoUrl } = req.params;

    if (!seoUrl) {
      return res.status(400).json({ success: false, message: "SEO URL is required" });
    }

    const cleanSeoUrl = seoUrl.trim().toLowerCase();

    const company = await Company.findOne({
      where: { seoUrl: cleanSeoUrl, isDeleted: false },
      attributes: [
        "companyId",
        "companyName",
        "companyLogo",
        "seoUrl",
        "tenantId",
        "companyAddress",
        "companyPhno",
        "startTime",
        "closeTime"
      ]
    });

    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    const tenant = company.tenantId ? await Tenant.findByPk(company.tenantId) : null;
    const resolvedFleetSlug = tenant?.slug || tenant?.subdomain || 'fleet';

    return res.status(200).json({
      success: true,
      ...company.toJSON(),
      tenantId: company.tenantId || ROOT_TENANT_ID,
      fleetSlug: resolvedFleetSlug,
      fleetName: tenant?.displayName || tenant?.name || 'FleetFlow',
      fleetLogo: tenant?.brandingTokens?.logoUrl || tenant?.logoUrl || null,
      companyPortalUrl: `/company/${resolvedFleetSlug}/${company.seoUrl}`
    });
  } catch (error: any) {
    console.error("Error fetching company:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


export const getAllCompany = async (req: Request, res: Response) => {
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

    let company;
    if (status === '1') {
      company = await Company.unscoped().findAll({
        where: {
          isDeleted: true,
          ...tenantCondition,
        },
      });
    } else {
      company = await Company.findAll({
        where: {
          isDeleted: false,
          ...tenantCondition,
        },
      });
    }

    const tenantIds = Array.from(new Set(company.map((c: any) => c.tenantId).filter(Boolean)));
    const tenants = tenantIds.length > 0 ? await Tenant.findAll({
      where: { tenantId: { [Op.in]: tenantIds } },
      attributes: ['tenantId', 'slug', 'subdomain', 'name', 'displayName']
    }) : [];
    const tenantMap = new Map(tenants.map(t => [t.tenantId, t]));

    const enriched = company.map((c: any) => {
      const cJson = c.toJSON ? c.toJSON() : c;
      const t = tenantMap.get(cJson.tenantId);
      const fleetSlug = t?.slug || t?.subdomain || 'fleet';
      return {
        ...cJson,
        tenantSlug: fleetSlug,
        fleetName: t?.displayName || t?.name || 'Fleet Mobility',
        companyPortalUrl: `/company/${fleetSlug}/${cJson.seoUrl}`
      };
    });

    res.status(200).json({
      message: 'Company retrieved successfully',
      data: enriched,
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error retrieving Companies',
      error: error.message,
    });
  }
};
const isTruthy = (v: any) => {
  const s = String(v ?? "").trim().toLowerCase();
  return s === "yes" || s === "true" || s === "1";
};
export const getCompanyTaxes = async (req: Request, res: Response) => {
  try {
    const companyId = (req.params.companyId || req.query.companyId) as string;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "companyId is required",
      });
    }

    // ✅ company details
    const company = await Company.findOne({
      where: { companyId, isDeleted: false },
      attributes: [
        "companyId",
        "companyName",
        "companyPhno",
        "domainName",
        "seoUrl",
        "gstNo",
        "managerEmail",
        "managerApproval",
        "allowTax",
        "companyLogo",
        "companyAddress",
        "startTime",
        "closeTime",
        "priorMinutes",
      ],
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }
    assertTenantOwnership(company);

    // ✅ tax only when allowTax is truthy
    let taxes: any[] = [];
    const allowTax = isTruthy((company as any).allowTax);

    if (allowTax) {
      taxes = await Tax.findAll({
        where: { isActive: true },
        attributes: ["taxId", "taxName", "taxPercent"],
        order: [["taxName", "ASC"]],
      });
    }

    return res.status(200).json({
      success: true,
      company,
      allowTax,
      taxes,
    });
  } catch (error: any) {
    if (isTenantError(error)) {
      return res.status(403).json({ message: error.message });
    }
    console.error("getCompanyWithTaxes error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// GET SINGLE COMPANY BY ID
export const getCompanyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    const company = await Company.findOne({
      where: {
        companyId: id
      },
    });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    assertTenantOwnership(company);

    res.status(200).json({
      message: 'Company retrieved successfully',
      data: company,
    });
  } catch (error: any) {
    if (isTenantError(error)) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({
      message: 'Error retrieving company',
      error: error.message,
    });
  }
};

// export const updateCompany = async (req: any, res: Response) => {
//   try {
//     const { id } = req.params;
//     const {
//       companyName,
//       companyPhno,
//       domainName,
//       managerEmail,
//       seoUrl,
//       allowTax,
//       bookingRules,
//       managerApproval,
//       gstNo,
//         needEmail,        // ✅ ADD
// companyAddress,
//       startTime,
//       closeTime,
//       companyCode,
//       priorMinutes
//     } = req.body;

//     const companyLogoPath = req.file ? req.file.filename : null;

//     // ✅ No role check here

//     if (!id) {
//       return res.status(400).json({ message: 'Company ID is required' });
//     }

//     const company = await Company.findOne({ where: { companyId: id } });
// const needEmailBoolean =
//   needEmail === "true" || needEmail === true ? 1 : 0;

//     if (!company) {
//       return res.status(404).json({ message: 'Company not found' });
//     }

//     // Check if managerEmail is being updated and already exists in another company
//     if (managerEmail && managerEmail !== company.managerEmail) {
//       const existing = await Company.findOne({
//         where: {
//           managerEmail,
//           companyId: { [Op.ne]: id }
//         }
//       });

//       if (existing) {
//         return res.status(400).json({ message: 'Manager email already exists in another company' });
//       }
//     }

//     const updateData: any = {
//       companyName: companyName || company.companyName,
//       companyPhno: companyPhno || company.companyPhno,
//       domainName: domainName || company.domainName,
//       managerEmail: managerEmail || company.managerEmail,
//       seoUrl: seoUrl || company.seoUrl,
//       allowTax: allowTax || company.allowTax,
//         needEmail: needEmailBoolean, 
//       gstNo: gstNo ?? company.gstNo,
//       companyAddress: companyAddress ?? company.companyAddress, 
//       managerApproval: managerApproval ?? company.managerApproval,
//       startTime: startTime || company.startTime,
//       closeTime: closeTime || company.closeTime,
//          companyCode: companyCode || company.companyCode,
//       priorMinutes: priorMinutes || company.priorMinutes
//     };

//     if (bookingRules) {
//       updateData.bookingRules = JSON.parse(bookingRules);
//     }

//     if (companyLogoPath) {
//       updateData.companyLogo = companyLogoPath;
//     }

//     // Update the company record
//     await company.update(updateData);

//     res.status(200).json({
//       message: 'Company updated successfully',
//       data: company,
//     });
//   } catch (error: any) {
//     res.status(500).json({
//       message: 'Error updating company',
//       error: error.message,
//     });
//   }
// };

export const updateCompany = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const {
      companyName,
      companyPhno,
      domainName,
      managerEmail,
      seoUrl,
      allowTax,
      bookingRules,
      managerApproval,
      gstNo,
      needEmail,
      companyAddress,
      startTime,
      closeTime,
      companyCode,
      priorMinutes
    } = req.body;

    const companyLogoPath = req.file ? req.file.filename : null;

    if (!id) {
      return res.status(400).json({ success: false, message: "Company ID is required" });
    }

    const company = await Company.findOne({ where: { companyId: id } });

    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }
    assertTenantOwnership(company);

    const tenantId = company.tenantId || ROOT_TENANT_ID;

    // Validate and check duplicate companyName excluding current company
    let cleanCompanyName = company.companyName;
    if (companyName !== undefined && companyName !== null) {
      const nameCheck = validateRequired(companyName, "Company name", 2);
      if (!nameCheck.valid) {
        return res.status(400).json({ success: false, message: nameCheck.error, field: 'companyName', errors: { companyName: nameCheck.error } });
      }
      cleanCompanyName = nameCheck.normalized;

      const existing = await Company.findOne({
        where: {
          tenantId,
          companyId: { [Op.ne]: id },
          isDeleted: 0,
          [Op.and]: [
            Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.fn('TRIM', Sequelize.col('companyName'))),
              cleanCompanyName.toLowerCase()
            ),
          ],
        },
      });
      if (existing) {
        return res.status(409).json({ success: false, message: "This company name is already registered.", field: 'companyName', errors: { companyName: "This company name is already registered." } });
      }
    }

    // Validate and check duplicate companyCode excluding current company
    let cleanCompanyCode = company.companyCode;
    if (companyCode !== undefined && companyCode !== null && String(companyCode).trim() !== '') {
      const codeCheck = validateRequired(companyCode, "Company code", 2);
      if (!codeCheck.valid) {
        return res.status(400).json({ success: false, message: codeCheck.error, field: 'companyCode', errors: { companyCode: codeCheck.error } });
      }
      cleanCompanyCode = codeCheck.normalized.toUpperCase();
      const existingCode = await Company.findOne({
        where: {
          tenantId,
          companyCode: cleanCompanyCode,
          companyId: { [Op.ne]: id },
          isDeleted: 0,
        }
      });
      if (existingCode) {
        return res.status(409).json({ success: false, message: "This company code is already in use.", field: 'companyCode', errors: { companyCode: "This company code is already in use." } });
      }
    }

    // Validate companyPhno
    let cleanCompanyPhno = company.companyPhno;
    if (companyPhno !== undefined && companyPhno !== null && String(companyPhno).trim() !== '') {
      const phoneCheck = validateMobile(companyPhno);
      if (!phoneCheck.valid) {
        return res.status(400).json({ success: false, message: phoneCheck.error, field: 'companyPhno', errors: { companyPhno: phoneCheck.error } });
      }
      cleanCompanyPhno = phoneCheck.normalizedPhone;
      const existingPhone = await Company.findOne({
        where: {
          tenantId,
          companyPhno: cleanCompanyPhno,
          companyId: { [Op.ne]: id },
          isDeleted: 0,
        },
      });
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "This company phone number is already registered.",
          field: 'companyPhno',
          errors: { companyPhno: "This company phone number is already registered." }
        });
      }
    }

    // Validate and check duplicate gstNo excluding current company
    let cleanGstNo = company.gstNo;
    if (gstNo !== undefined && gstNo !== null && String(gstNo).trim() !== '') {
      const gstCheck = validateGstin(gstNo);
      if (!gstCheck.valid) {
        return res.status(400).json({ success: false, message: "Please enter a valid GST number.", field: 'gstNo', errors: { gstNo: "Please enter a valid GST number." } });
      }
      cleanGstNo = gstCheck.normalized;
      const existingGst = await Company.findOne({
        where: {
          tenantId,
          gstNo: cleanGstNo,
          companyId: { [Op.ne]: id },
          isDeleted: 0,
        }
      });
      if (existingGst) {
        return res.status(409).json({ success: false, message: "This GST number is already registered.", field: 'gstNo', errors: { gstNo: "This GST number is already registered." } });
      }
    }

    const oldManagers = company.managerEmail
      ? normalizeManagerEmails(company.managerEmail)
      : [];

    let normalizedManagers: string[] = oldManagers;
    if (managerEmail !== undefined) {
      normalizedManagers = normalizeManagerEmails(managerEmail);
    }

    let finalSeoUrl = company.seoUrl;
    if (seoUrl && seoUrl.trim() !== "" && seoUrl !== company.seoUrl) {
      finalSeoUrl = await generateUniqueCompanySlug(seoUrl, company.tenantId, id);
    } else if (!finalSeoUrl) {
      finalSeoUrl = await generateUniqueCompanySlug(cleanCompanyName || company.companyName || "company", company.tenantId, id);
    }

    const updateData: any = {
      companyName: cleanCompanyName,
      companyPhno: cleanCompanyPhno,
      domainName: domainName !== undefined ? domainName : company.domainName,
      managerEmail: normalizedManagers.join(", "),
      seoUrl: finalSeoUrl,
      allowTax: allowTax ?? company.allowTax,
      needEmail:
        needEmail !== undefined
          ? (needEmail === "true" || needEmail === true)
          : (company.needEmail ?? true),
      gstNo: cleanGstNo,
      companyAddress: companyAddress ?? company.companyAddress,
      managerApproval: false,
      startTime: startTime || company.startTime,
      closeTime: closeTime || company.closeTime,
      companyCode: cleanCompanyCode,
      priorMinutes: priorMinutes || company.priorMinutes
    };

    if (bookingRules) {
      updateData.bookingRules = typeof bookingRules === 'string' ? JSON.parse(bookingRules) : bookingRules;
    }

    if (companyLogoPath) {
      updateData.companyLogo = companyLogoPath;
    }

    // ✅ update company
    await company.update(updateData);

    const removedManagers = oldManagers.filter(
      email => !normalizedManagers.includes(email)
    );

    if (removedManagers.length) {
      await User.update(
        { companyManager: 0, isManager: 0 },
        { where: { email: removedManagers } }
      );
    }

    if (normalizedManagers.length) {
      await User.update(
        { companyManager: 1, isManager: 1 },
        { where: { email: normalizedManagers } }
      );
    }
    
    return res.status(200).json({
      success: true,
      message: "Company updated successfully",
      data: company
    });
  } catch (error: any) {
    if (isTenantError(error)) {
      return res.status(403).json({ success: false, message: error.message });
    }
    return handleDatabaseError(error, res, "Failed to update company. Please try again.");
  }
};


// 🗑️ Soft Delete (Move to Trash)
export const deleteCompany = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    const company = await Company.findOne({
      where: { companyId: id }
    });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    assertTenantOwnership(company);

    await company.update({ isDeleted: true });
    
        // 2️⃣ Get all users under this company
    const users = await User.findAll({
      where: { companyId: id },
      attributes: ['userId']
    });

    const userIds = users.map(u => u.userId);

    // 3️⃣ Soft delete users
    await User.update(
      { isDeleted: true },
      { where: { companyId: id } }
    );

    // 4️⃣ Cancel their bookings
    if (userIds.length > 0) {
      await Booking.update(
        { confirmStatus: ORDER.STATUS.CANCELLED },
        { where: { userId: userIds } }
      );
    }


    return res.status(200).json({
      message: 'Company moved to trash successfully',
      deletedCompany: {
        id: company.companyId,
        name: company.companyName,
        managerEmail: company.managerEmail,
        domainName: company.domainName,
      },
    });
  } catch (error: any) {
    if (isTenantError(error)) {
      return res.status(403).json({ message: error.message });
    }
    console.error('Error deleting company:', error);
    return res.status(500).json({
      message: 'Error deleting company',
      error: error.message,
    });
  }
};


// ♻️ Restore from Trash
export const restoreCompany = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    // Include deleted records in search
    const company = await Company.unscoped().findOne({
      where: { companyId: id }
    });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    assertTenantOwnership(company);

    await company.update({ isDeleted: false });

        // 2️⃣ Restore users under this company
    await User.unscoped().update(
      { isDeleted: false },
      {
        where: { companyId: id }
      }
    );


    res.status(200).json({
      message: 'Company restored successfully',
      restoredCompany: {
        id: company.companyId,
        name: company.companyName,
        managerEmail: company.managerEmail,
        domainName: company.domainName,
      },
    });
  } catch (error: any) {
    if (isTenantError(error)) {
      return res.status(403).json({ message: error.message });
    }
    console.error('Error restoring company:', error);
    res.status(500).json({
      message: 'Error restoring company',
      error: error.message,
    });
  }
};
