import { Request, Response } from "express";
import { Op } from "sequelize";
import { User } from "../models/user";
import { Company } from "../models/company";
import { getTenantContext, ROOT_TENANT_ID } from "../context/tenantContext";

export const getFilteredUsers = async (req: Request, res: Response) => {
  try {
    const {
      search,         // username or email
      status,         // Active / Inactive
      confirmStatus,  // Yes / No
      orderBy,        // column name
      orderDir,       // ASC / DESC
      fromDate,       // optional date range start
      toDate          // optional date range end
    } = req.query;

    const ctx = getTenantContext();
    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
    const isPlatformAdmin = ctx?.isPlatformSuperAdmin;

    const tenantCondition = isPlatformAdmin && !req.headers['x-tenant-id']
      ? {}
      : tenantId === ROOT_TENANT_ID
        ? { [Op.or]: [{ tenantId: ROOT_TENANT_ID }, { tenantId: null }] }
        : { tenantId };

    const andConditions: any[] = [
      tenantCondition,
      { companyId: { [Op.ne]: null } },
      {
        [Op.or]: [
          { role: { [Op.notIn]: ['fleet_admin', 'superadmin', 'admin'] } },
          { role: null },
        ]
      }
    ];

    // Search by username or email
    if (search) {
      andConditions.push({
        [Op.or]: [
          { username: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
        ]
      });
    }

    // Status filter
    if (status) {
      andConditions.push({ status });
    }

    // Confirm status filter
    if (confirmStatus) {
      andConditions.push({ isConfirmed: confirmStatus === "Yes" });
    }

    // Date range filter (Register Date)
    if (fromDate && toDate) {
      andConditions.push({
        createdAt: {
          [Op.between]: [new Date(String(fromDate)), new Date(String(toDate))]
        }
      });
    }

    // Order config
    let order: any = [["createdAt", "DESC"]];
    if (orderBy && orderDir) {
      order = [[String(orderBy), String(orderDir).toUpperCase()]];
    }

    const users = await User.findAll({
      where: {
        [Op.and]: andConditions,
      },
      include: [
        {
          model: Company,
          as: "company",
          required: true,
          attributes: ["companyId", "companyName"],
        },
      ],
      order,
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error in getFilteredUsers:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
