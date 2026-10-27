import { Request, Response } from 'express';
import { User } from '../models/user';
import { Employee } from '../models/employee';
import { Tenant } from '../models/tenant';
import { Company } from '../models/company';
import { Booking } from '../models/booking';
import { Op } from 'sequelize';                    
import { sendEmailFromTemplate } from "../services/emailConfServices"; 
import { validateRegistrationAgainstPolicy } from '../services/policyService';
import { MapCount } from '../models/mapCount';
import XLSX from "xlsx";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { assertTenantOwnership, isTenantError } from '../utils/tenantGuard';
import { getTenantContext, ROOT_TENANT_ID } from '../context/tenantContext';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { includeDeleted } = req.query;
    const ctx = getTenantContext();
    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
    const isPlatformAdmin = ctx?.isPlatformSuperAdmin;

    const tenantCondition = isPlatformAdmin && !req.headers['x-tenant-id']
      ? {}
      : tenantId === ROOT_TENANT_ID
        ? { [Op.or]: [{ tenantId: ROOT_TENANT_ID }, { tenantId: null }] }
        : { tenantId };

    const query: any = {
      where: tenantCondition,
      include: [
        {
          model: Company,
          as: "company", 
          required: false,
          attributes: ["companyId", "companyName"],
        },
      ],
    };

    const users =
      includeDeleted === "1"
        ? await User.unscoped().findAll(query)
        : await User.findAll(query);

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving users",
      error: error.message,
    });
  }
};
export const getAllUserByCompany = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { includeDeleted } = req.query;

    const company = await Company.findByPk(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    assertTenantOwnership(company);

    let users;

    if (includeDeleted === "1") {
      // Include deleted users but only for selected company
      users = await User.unscoped().findAll({
        where: { companyId }
      });
    } else {
      // Only active users of selected company
      users = await User.findAll({
        where: { companyId }
      });
    }

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error: any) {
    if (isTenantError(error)) {
      return res.status(403).json({ message: error.message });
    }
    return res.status(500).json({
      success: false,
      message: "Error retrieving users",
      error: error.message,
    });
  }
};



// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    assertTenantOwnership(user);

    return res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user,
    });
  } catch (error: any) {
    if (isTenantError(error)) {
      return res.status(403).json({ message: error.message });
    }
    return res.status(500).json({
      success: false,
      message: 'Error retrieving user',
      error: error.message,
    });
  }
};


// export const uploadUsersFromExcel = async (req: Request, res: Response) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "File not uploaded" });
//     }

//     const workbook = XLSX.readFile(req.file.path);
//     const sheetName = workbook.SheetNames[0];
//     const sheetData: any[] = XLSX.utils.sheet_to_json(
//       workbook.Sheets[sheetName]
//     );

//     const usersToInsert = sheetData.map((row) => ({
//       userId: uuidv4(), // ✅ auto generate
//       username: row.username,
//       email: row.email,
//       mobile: row.mobile,
//       password: row.password || "123456",
//       role: row.role || "user",
//       gender: row.gender || null,
//       country: row.country,
//       city: row.city,
//       status: "active",
//       isDeleted: false,
//       isConfirmed: true,
//     }));

//     await User.bulkCreate(usersToInsert);

//     // delete uploaded file
//     fs.unlinkSync(req.file.path);

//     return res.json({
//       success: true,
//       message: `${usersToInsert.length} users uploaded successfully`,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Upload failed" });
//   }
// };

// export const uploadUsersFromExcel = async (req: Request, res: Response) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "File not uploaded" });
//     }

//     const workbook = XLSX.readFile(req.file.path);
//     const sheetName = workbook.SheetNames[0];
//     const rawData: any[] = XLSX.utils.sheet_to_json(
//       workbook.Sheets[sheetName]
//     );

//     let inserted = 0;
//     let updated = 0;
//     let skipped: any[] = [];

//     for (const row of rawData) {
//       // 🔥 Normalize keys (handles Excel header issues)
//       const normalizedRow: any = {};
//       Object.keys(row).forEach((key) => {
//         normalizedRow[key.trim().toLowerCase()] = row[key];
//       });

//       const username = normalizedRow.username;
//       const email = normalizedRow.email;
//       const mobile = normalizedRow.mobile;
//       const companyId = normalizedRow.companyid;

//       // ❌ Validation
//       if (!username || !email || !mobile || !companyId) {
//         skipped.push({
//           row,
//           reason: "Missing required fields (username/email/mobile/companyId)",
//         });
//         continue;
//       }

//       const existingUser = await User.findOne({
//         where: {
//           [Op.or]: [{ email }, { mobile }],
//         },
//       });

//       if (existingUser) {
//         await existingUser.update({
//           username,
//           email,
//           mobile,
//           companyId,
//           role: normalizedRow.role || existingUser.role,
//           gender: normalizedRow.gender || existingUser.gender,
//           country: normalizedRow.country || existingUser.country,
//           city: normalizedRow.city || existingUser.city,
//         });

//         updated++;
//       } else {
//         await User.create({
//           userId: uuidv4(),
//           username,
//           email,
//           mobile,
//           companyId,
//           password: normalizedRow.password || "123456",
//           role: normalizedRow.role || "user",
//           gender: normalizedRow.gender || null,
//           country: normalizedRow.country,
//           city: normalizedRow.city,
//           status: "active",
//           isDeleted: false,
//           isConfirmed: true,
//         });

//         inserted++;
//       }
//     }

//     fs.unlinkSync(req.file.path);

//     let message = "";

// if (inserted === 0 && updated === 0) {
//   message = "Missing required fields";
// } else if (inserted > 0 && updated === 0) {
//   message = `${inserted} users added successfully`;
// } else if (inserted === 0 && updated > 0) {
//   message = `${updated} users updated successfully`;
// } else {
//   message = `${inserted} added, ${updated} updated successfully`;
// }

//     return res.json({
//       success: true,
//       message,
//       summary: {
//         total: rawData.length,
//         inserted,
//         updated,
//         skipped: skipped.length,
//       },
//       skippedData: skipped,
//    //   debug: rawData, // 🔥 helps you see actual Excel data
//     });
//   } catch (error: any) {
//     console.error("Upload Error:", error);
//     return res.status(500).json({
//       message: "Upload failed",
//       error: error.message,
//     });
//   }
// };

export const uploadUsersFromExcel = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File not uploaded" });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const rawData: any[] = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheetName]
    );

    // 🔥 Get valid DB columns from Sequelize model
    const validColumns = Object.keys(User.rawAttributes);

    let inserted = 0;
    let updated = 0;
    let skipped: any[] = [];

    for (const row of rawData) {
      // 🔥 Normalize keys (lowercase)
      const normalizedRow: any = {};
      Object.keys(row).forEach((key) => {
        normalizedRow[key.trim().toLowerCase()] = row[key];
      });

      const username = normalizedRow.username;
      const email = normalizedRow.email;
      const mobile = normalizedRow.mobile;
      const companyId = normalizedRow.companyid;

      // ❌ Required validation
      if (!username || !email || !mobile || !companyId) {
        skipped.push({
          row,
          reason: "Missing required fields",
        });
        continue;
      }

      // 🔥 Map Excel → Sequelize fields correctly
      const userPayload: any = {};

      validColumns.forEach((col) => {
        const lowerCol = col.toLowerCase();

        if (normalizedRow.hasOwnProperty(lowerCol)) {
          userPayload[col] = normalizedRow[lowerCol];
        }
      });

      // 🔥 Ensure required fields are set
      userPayload.username = username;
      userPayload.email = email;
      userPayload.mobile = mobile;
      userPayload.companyId = companyId;

      // Defaults & Secure password hashing
      if (userPayload.password && userPayload.password !== "123456") {
        userPayload.password = await bcrypt.hash(String(userPayload.password), 10);
      } else {
        const randomTempPassword = crypto.randomBytes(6).toString("hex");
        userPayload.password = await bcrypt.hash(randomTempPassword, 10);
      }
      if (!userPayload.role) userPayload.role = "user";
      if (!userPayload.status) userPayload.status = "active";

      const ctx = getTenantContext();
      const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;

      // Validate company ownership to prevent attaching users to another tenant's company
      const company = await Company.findByPk(companyId);
      if (!company) {
        skipped.push({ row, reason: "Company not found" });
        continue;
      }
      try {
        assertTenantOwnership(company, "Company");
      } catch {
        skipped.push({ row, reason: "Company belongs to another tenant" });
        continue;
      }

      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ email }, { mobile }],
          tenantId
        },
      });

      if (existingUser) {
        // Do not overwrite existing password if none was supplied in row
        if (!normalizedRow.hasOwnProperty("password")) {
          delete userPayload.password;
        }
        await existingUser.update(userPayload);
        updated++;
      } else {
        await User.create({
          userId: uuidv4(),
          tenantId,
          ...userPayload,
          isDeleted: false,
          isConfirmed: true,
        });
        inserted++;
      }
    }

    fs.unlinkSync(req.file.path);

    let message = "";

    if (inserted === 0 && updated === 0) {
      message = "Missing required fields";
    } else if (inserted > 0 && updated === 0) {
      message = `${inserted} users added successfully`;
    } else if (inserted === 0 && updated > 0) {
      message = `${updated} users updated successfully`;
    } else {
      message = `${inserted} added, ${updated} updated successfully`;
    }

    return res.json({
      success: true,
      message,
      summary: {
        total: rawData.length,
        inserted,
        updated,
        skipped: skipped.length,
      },
      skippedData: skipped,
    });
  } catch (error: any) {
    console.error("Upload Error:", error);
    return res.status(500).json({
      message: "Upload failed",
      error: error.message,
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, email, mobile, gender, country, city, companyId, userAddress, presentAddress, state, pinCode, isManager, danfossuserId,
  managerId, managerEmail,costCenter  } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    assertTenantOwnership(user);

    // Validate gender if provided
    if (gender && !['male', 'female', 'other'].includes(gender)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid gender. Must be one of: male, female, other',
      });
    }
let companyName = "";
    // Validate companyId if provided
    if (companyId) {
      const existingCompany = await Company.findByPk(companyId);
      if (!existingCompany) {
        return res.status(400).json({
          success: false,
          message: 'Company not found with the provided companyId',
        });
      }
        companyName = existingCompany.companyName;

    }

    // Dynamic policy check for authorized email domains and custom employee formats
    if (companyId && email) {
      const policyValidation = await validateRegistrationAgainstPolicy(
        companyId,
        String(email).trim().toLowerCase(),
        danfossuserId
      );
      if (!policyValidation.valid) {
        return res.status(400).json({
          success: false,
          message: policyValidation.message || "Email or Employee ID violates company policy",
        });
      }
    }
    // Check for duplicate email (excluding current user)
    if (email) {
      const existingUserByEmail = await User.findOne({
        where: {
          email,
          userId: { [Op.ne]: id }
        }
      });
      if (existingUserByEmail) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists',
        });
      }
    }

    // Check for duplicate mobile (excluding current user)
    if (mobile) {
      const existingUserByMobile = await User.findOne({
        where: {
          mobile,
          userId: { [Op.ne]: id }
        }
      });
      if (existingUserByMobile) {
        return res.status(400).json({
          success: false,
          message: 'User with this mobile number already exists',
        });
      }
    }
    let companyManager = false;
    if(isManager) {
      companyManager = isManager;
    }
    //  Update user with new fields
    await user.update({
      username,
      email,
      mobile,
      gender,
      country,
      city,
      companyId,
      isManager,
      userAddress,
      presentAddress,
      companyManager,
      state,
      pinCode,
        danfossuserId: danfossuserId || null,
  managerId: managerId || null,
  managerEmail: managerEmail || null,
  costCenter: costCenter || null 
    });

    // Fetch updated user with company details
    const updatedUser = await User.findByPk(id);

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error: any) {
    if (isTenantError(error)) {
      return res.status(403).json({ message: error.message });
    }
    return res.status(400).json({
      success: false,
      message: 'Error updating user',
      error: error.message,
    });
  }
};

//add new address for user
export const addNewAddress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // userId
    const { label, country, state, city, pinCode, presentAddress, userAddress } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    assertTenantOwnership(user);

    //  Always fetch the latest addresses directly from DB
    const latestUser = await User.findByPk(id, { attributes: ['addresses'] });
    const current = (latestUser?.get('addresses') as any[]) || [];

    //  Add the new address
    const newAddress = { label, country, state, city, pinCode, presentAddress, userAddress };
    const updatedAddresses = [...current, newAddress];

    // Save full updated array back to DB
    await user.update({ addresses: updatedAddresses });

    //  Return the refreshed data
    return res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: updatedAddresses
    });

  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: 'Error adding address',
      error: error.message
    });
  }
};

//get user address - newaddress
export const getUserAddresses = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, { attributes: ['userId', 'tenantId', 'addresses'] });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    assertTenantOwnership(user);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.status(200).json({ success: true, data: user.addresses || [] });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: 'Error fetching addresses', error: error.message });
  }
};


//update user address - new address
export const updateUserAddress = async (req: Request, res: Response) => {
  try {
    const { id, idx } = req.params;
    const i = Number(idx);
    const { label, country, state, city, pinCode, presentAddress, userAddress } = req.body;

    const user = await User.findByPk(id, { attributes: ['addresses'] });
    if (!user) return res.status(404).json({ success:false, message:'User not found' });

    const arr: any[] = (user.get('addresses') as any[]) || [];
    if (isNaN(i) || i < 0 || i >= arr.length) {
      return res.status(400).json({ success:false, message:'Invalid address index' });
    }

    arr[i] = { label, country, state, city, pinCode, presentAddress, userAddress };
    await (await User.findByPk(id))?.update({ addresses: arr });

    return res.status(200).json({ success:true, message:'Address updated', data: arr });
  } catch (e:any) {
    return res.status(400).json({ success:false, message:'Error updating address', error: e.message });
  }
};

///remove user address - new address
export const deleteUserAddress = async (req: Request, res: Response) => {
  try {
    const { id, idx } = req.params;
    const i = Number(idx);

    const user = await User.findByPk(id, { attributes: ['addresses'] });
    if (!user) return res.status(404).json({ success:false, message:'User not found' });

    const arr: any[] = (user.get('addresses') as any[]) || [];
    if (isNaN(i) || i < 0 || i >= arr.length) {
      return res.status(400).json({ success:false, message:'Invalid address index' });
    }

    arr.splice(i, 1);
    await (await User.findByPk(id))?.update({ addresses: arr });

    return res.status(200).json({ success:true, message:'Address removed', data: arr });
  } catch (e:any) {
    return res.status(400).json({ success:false, message:'Error removing address', error: e.message });
  }
};


export const getUserByManager = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { includeDeleted } = req.query;

    
    const user = await User.findByPk(userId);
    // const bool = user?.isManager;
        const bool = user?.companyManager;

    if(!bool) {
      return res.status(404).json({
        success: false,
        message: 'User is not manager',
      });
    } 
    let users;

    if (includeDeleted === "1") {
      // Include deleted users but only for selected company
      users = await User.unscoped().findAll({
        where: { companyId: user?.companyId }
      });
    } else {
      // Only active users of selected company
      users = await User.findAll({
        where: {  companyId: user?.companyId  }
      });
    }

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving users",
      error: error.message,
    });
  }
};


// Update user status
export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!status || !['active', 'inactive', 'suspended', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: active, inactive, suspended, pending',
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    assertTenantOwnership(user);

    await user.update({ status });

    // Fetch updated user with company details
    const updatedUser = await User.findByPk(id, {
      include: [
        {
          model: Company, 
          attributes: ['companyId', 'companyName']
        }
      ],
      attributes: { exclude: ['password'] }
    });

    return res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      data: updatedUser
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: 'Error updating user status',
      error: error.message,
    });
  }
};

// FIXED Delete user function
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.unscoped().findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    assertTenantOwnership(user);

    // Check if user is already deleted
    if (user.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'User is already deleted',
      });
    }

    // FIXED: Use boolean true instead of string "true"
    await user.update({ 
      isDeleted: true,  // Changed from "true" to true
      status: "inactive" 
    });

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    if (isTenantError(error)) {
      return res.status(403).json({ message: error.message });
    }
    console.error('Error deleting user:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message,
    });
  }
};

export const confirmUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isConfirmed } = req.body;

    // Validate isConfirmed
    if (typeof isConfirmed !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isConfirmed must be a boolean value",
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    assertTenantOwnership(user);

    await user.update({ isConfirmed });

    // Fetch updated user with company details
    const updatedUser = await User.findByPk(id, {
      include: [
        {
          model: Company,
          attributes: ["companyId", "companyName"],
        },
      ],
      attributes: { exclude: ["password"] },
    });

    //  Send confirmation email if user is confirmed
    if (isConfirmed && updatedUser) {
      try {
        await sendEmailFromTemplate("USER_CONFIRMATION_MESSAGE", {
          UserName: updatedUser.username || updatedUser.username || "User",
          UserEmail: updatedUser.email,
          CompanyName: updatedUser.company?.companyName || "Your Company",
        });

        console.log(" Confirmation email sent to:", updatedUser.email);
      } catch (emailErr: any) {
        console.error(" Error sending confirmation email:", emailErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `User ${isConfirmed ? "confirmed" : "unconfirmed"} successfully`,
      data: updatedUser,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: "Error updating user confirmation status",
      error: error.message,
    });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Company, 
          attributes: ['companyId', 'companyName']
        }
      ],
      attributes: { exclude: ['password'] } // Exclude password from response
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Current user retrieved successfully',
      data: user
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error retrieving current user',
      error: error.message
    });
  }
};

/**
 * Universal profile endpoint for SuperAdmin & Fleet Admin.
 */
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || (req as any).user?.id || (req as any).user?.userId;
    const email = (req as any).email || (req as any).user?.email;
    const role = (req as any).role || (req as any).roles || '';
    const isSuperAdminRole = role === 'superadmin' || role === 'SUPERADMIN';

    let userRecord: any = null;

    // For SuperAdmin, prioritize root platform Employee record
    if (isSuperAdminRole || email === 'subisha2002.m@gmail.com') {
      const superAdminEmp = await Employee.findOne({
        where: {
          role: 'superadmin',
          tenantId: ROOT_TENANT_ID,
        },
        attributes: { exclude: ['password'] },
      });
      if (superAdminEmp) {
        userRecord = {
          userId: superAdminEmp.employeeId,
          username: superAdminEmp.username || 'Super Admin',
          email: superAdminEmp.email || 'subisha2002.m@gmail.com',
          mobile: superAdminEmp.phno || '9080280818',
          role: 'superadmin',
          address: superAdminEmp.address || '',
          gstin: superAdminEmp.gstin || '',
          profileImage: superAdminEmp.profileImage || '',
          tenantId: ROOT_TENANT_ID,
        };
      }
    }

    if (!userRecord && userId) {
      userRecord = await User.findByPk(userId, { attributes: { exclude: ['password'] } });
    }
    if (!userRecord && email) {
      userRecord = await User.findOne({ where: { email }, attributes: { exclude: ['password'] } });
    }
    if (!userRecord && email) {
      const emp = await Employee.findOne({ where: { email }, attributes: { exclude: ['password'] } });
      if (emp) {
        userRecord = {
          userId: emp.employeeId,
          username: emp.username,
          email: emp.email,
          mobile: emp.phno,
          role: emp.role,
          address: emp.address || '',
          gstin: emp.gstin || '',
          profileImage: emp.profileImage || '',
          tenantId: emp.tenantId,
        };
      }
    }

    if (!userRecord && (role || email || (req as any).tenantId)) {
      userRecord = {
        userId: userId || 'admin-user',
        username: email?.split('@')[0] || 'Fleet Admin',
        email: email || 'admin@fleetflow.com',
        role: role || 'admin',
        address: '',
        gstin: '',
        profileImage: '',
        tenantId: (req as any).tenantId || ROOT_TENANT_ID,
      };
    }

    if (!userRecord) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    const jsonUser = userRecord.toJSON ? userRecord.toJSON() : userRecord;
    const ctx = getTenantContext();
    const tenantId = (req as any).tenantId || ctx?.tenantId || jsonUser.tenantId || ROOT_TENANT_ID;

    let tenantProfile: any = null;
    if (tenantId && tenantId !== ROOT_TENANT_ID) {
      const tenant = await Tenant.findByPk(tenantId);
      if (tenant) {
        tenantProfile = tenant;
      }
    }

    const profileData = {
      userId: jsonUser.userId || jsonUser.employeeId || jsonUser.id,
      name: jsonUser.username || jsonUser.name || 'User',
      email: jsonUser.email,
      phone: jsonUser.mobile || jsonUser.phno || '',
      role: jsonUser.role || role || 'User',
      address: jsonUser.address || '',
      gstin: jsonUser.gstin || '',
      profileImage: jsonUser.profileImage || '',
      tenantId,
    };

    return res.status(200).json({
      success: true,
      profile: profileData,
      fleetProfile: tenantProfile,
      data: {
        profile: profileData,
        fleet: tenantProfile,
        fleetProfile: tenantProfile,
      },
    });
  } catch (err: any) {
    console.error('Error fetching user profile:', err);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * Universal profile update for personal details & fleet business profile.
 */
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || (req as any).user?.id || (req as any).user?.userId;
    const email = (req as any).email || (req as any).user?.email;
    const role = (req as any).role || (req as any).roles || '';
    const isSuperAdminRole = role === 'superadmin' || role === 'SUPERADMIN';
    const { name, phone, address, gstin, profileImage, fleetProfile } = req.body;

    // Validate phone number if provided
    let cleanPhone: string | undefined;
    if (phone !== undefined && phone !== null && String(phone).trim() !== '') {
      cleanPhone = String(phone).replace(/\D/g, '');
      // Strict permanent isolation: Prohibit 9003241571
      if (cleanPhone === '9003241571' || cleanPhone.endsWith('9003241571') || cleanPhone.includes('9003241571')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number: Obsolete legacy contact (9003241571) is permanently prohibited.',
        });
      }
      if (cleanPhone.length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid 10-digit mobile number.',
        });
      }
      cleanPhone = cleanPhone.slice(-10);
    }

    // Validate GSTIN if provided
    if (gstin && typeof gstin === 'string' && gstin.trim() !== '') {
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstinRegex.test(gstin.trim().toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid GSTIN format. Expected 15-character Indian GSTIN (e.g. 33AAMCG2518C1Z0).',
        });
      }
    }

    // Validate name if provided
    if (name !== undefined && typeof name === 'string' && name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Name cannot be empty.',
      });
    }

    let updated = false;

    // SuperAdmin update in Employee table
    if (isSuperAdminRole || email === 'subisha2002.m@gmail.com') {
      const superAdminEmp = await Employee.findOne({
        where: { role: 'superadmin', tenantId: ROOT_TENANT_ID },
      });
      if (superAdminEmp) {
        if (name !== undefined) superAdminEmp.username = String(name).trim();
        if (cleanPhone !== undefined) superAdminEmp.phno = cleanPhone;
        if (address !== undefined) superAdminEmp.address = String(address).trim();
        if (gstin !== undefined) superAdminEmp.gstin = String(gstin).trim().toUpperCase();
        if (profileImage !== undefined) superAdminEmp.profileImage = String(profileImage).trim();
        await superAdminEmp.save();
        updated = true;
      }
    }

    if (!updated && userId) {
      const user = await User.findByPk(userId);
      if (user) {
        if (name) user.username = String(name).trim();
        if (cleanPhone) user.mobile = cleanPhone;
        await user.save();
        updated = true;
      }
    }

    if (!updated && email) {
      const emp = await Employee.findOne({ where: { email } });
      if (emp) {
        if (name) emp.username = String(name).trim();
        if (cleanPhone) emp.phno = cleanPhone;
        if (address !== undefined) emp.address = String(address).trim();
        if (gstin !== undefined) emp.gstin = String(gstin).trim().toUpperCase();
        if (profileImage !== undefined) emp.profileImage = String(profileImage).trim();
        await emp.save();
        updated = true;
      }
    }

    // Tenant Business Profile update strictly scoped to authenticated tenant
    if (fleetProfile && typeof fleetProfile === 'object') {
      const ctx = getTenantContext();
      const tenantId = (req as any).tenantId || ctx?.tenantId;
      if (tenantId && tenantId !== ROOT_TENANT_ID) {
        const tenant = await Tenant.findByPk(tenantId);
        if (tenant) {
          if (fleetProfile.legalName !== undefined) tenant.legalName = fleetProfile.legalName;
          if (fleetProfile.displayName !== undefined) tenant.displayName = fleetProfile.displayName;
          if (fleetProfile.gstin !== undefined) tenant.gstin = fleetProfile.gstin;
          if (fleetProfile.panNumber !== undefined) tenant.panNumber = fleetProfile.panNumber;
          if (fleetProfile.sacCode !== undefined) tenant.sacCode = fleetProfile.sacCode;
          if (fleetProfile.contactEmail !== undefined) tenant.contactEmail = fleetProfile.contactEmail;
          if (fleetProfile.contactPhone !== undefined) tenant.contactPhone = fleetProfile.contactPhone;
          if (fleetProfile.businessEmail !== undefined) tenant.businessEmail = fleetProfile.businessEmail;
          if (fleetProfile.businessPhone !== undefined) tenant.businessPhone = fleetProfile.businessPhone;
          if (fleetProfile.registeredAddress !== undefined) tenant.registeredAddress = fleetProfile.registeredAddress;
          if (fleetProfile.website !== undefined) tenant.website = fleetProfile.website;
          if (fleetProfile.city !== undefined) tenant.city = fleetProfile.city;
          if (fleetProfile.state !== undefined) tenant.state = fleetProfile.state;
          if (fleetProfile.pinCode !== undefined) tenant.pinCode = fleetProfile.pinCode;
          await tenant.save();
          updated = true;
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
    });
  } catch (err: any) {
    console.error('Error updating user profile:', err);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * Change password for authenticated SuperAdmin or User with current password verification.
 */
export const changeUserPassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || (req as any).user?.id || (req as any).user?.userId;
    const email = (req as any).email || (req as any).user?.email;
    const role = (req as any).role || (req as any).roles || '';
    const isSuperAdminRole = role === 'superadmin' || role === 'SUPERADMIN';
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters in length.',
      });
    }

    let accountRecord: any = null;

    if (isSuperAdminRole || email === 'subisha2002.m@gmail.com') {
      accountRecord = await Employee.findOne({
        where: { role: 'superadmin', tenantId: ROOT_TENANT_ID },
      });
    }

    if (!accountRecord && email) {
      accountRecord = await Employee.findOne({ where: { email } });
    }

    if (!accountRecord && userId) {
      accountRecord = await User.findByPk(userId);
    }

    if (!accountRecord) {
      return res.status(404).json({
        success: false,
        message: 'Account not found for password change.',
      });
    }

    // Verify current password
    const isCurrentValid = await bcrypt.compare(currentPassword, accountRecord.password);
    if (!isCurrentValid) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password. Please re-enter your current password.',
      });
    }

    // Hash and store new password
    const hashed = await bcrypt.hash(newPassword, 10);
    accountRecord.password = hashed;
    await accountRecord.save();

    console.log(`[Security] Password successfully changed for account: ${accountRecord.email || accountRecord.username} (Role: ${accountRecord.role})`);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please use your new password on next login.',
    });
  } catch (err: any) {
    console.error('Error changing user password:', err);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * Upload profile avatar image for SuperAdmin or User.
 */
export const uploadProfileImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }

    const email = (req as any).email || (req as any).user?.email;
    const role = (req as any).role || (req as any).roles || '';
    const isSuperAdminRole = role === 'superadmin' || role === 'SUPERADMIN';
    const relativeUrl = `/uploads/profileImg/${req.file.filename}`;

    if (isSuperAdminRole || email === 'subisha2002.m@gmail.com') {
      const emp = await Employee.findOne({
        where: { role: 'superadmin', tenantId: ROOT_TENANT_ID },
      });
      if (emp) {
        emp.profileImage = relativeUrl;
        await emp.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully.',
      imageUrl: relativeUrl,
    });
  } catch (err: any) {
    console.error('Error uploading profile image:', err);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * Public contact information for frontend website displays.
 * Configured separately from private SuperAdmin details.
 */
export const getPublicContactInfo = async (_req: Request, res: Response) => {
  try {
    const supportPhone = process.env.SUPPORT_PHONE || '+91 98417 22675';
    const supportEmail = process.env.SUPPORT_EMAIL || 'support@fleetflow.com';

    return res.status(200).json({
      success: true,
      contact: {
        phone: supportPhone,
        supportPhone,
        email: supportEmail,
        supportEmail,
        address: 'Chennai, Tamil Nadu, India',
        headOffice: 'Chennai, Tamil Nadu, India',
        businessHours: '24 Hours / 7 Days',
        operatingHours: '24 Hours / 7 Days',
        billingHours: 'Mon - Sat: 9 AM - 7 PM',
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Get users by status
export const getUsersByStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.params;

    // Validate status
    if (!['active', 'inactive', 'suspended', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: active, inactive, suspended, pending',
      });
    }

    const users = await User.findAll({
      where: { status },
      include: [
        {
          model: Company,
          attributes: ['companyId', 'companyName']
        }
      ],
      attributes: { exclude: ['password'] } // Exclude password from response
    });

    return res.status(200).json({
      success: true,
      message: `Users with status '${status}' retrieved successfully`,
      data: users,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error retrieving users by status',
      error: error.message,
    });
  }
};

// Get confirmed/unconfirmed users
export const getUsersByConfirmationStatus = async (req: Request, res: Response) => {
  try {
    const { confirmed } = req.params; // 'true' or 'false'

    const isConfirmed = confirmed === 'true';

    const users = await User.findAll({
      where: { isConfirmed },
      include: [
        {
          model: Company,
          attributes: ['companyId', 'companyName']
        }
      ],
      attributes: { exclude: ['password'] } // Exclude password from response
    });

    return res.status(200).json({
      success: true,
      message: `${isConfirmed ? 'Confirmed' : 'Unconfirmed'} users retrieved successfully`,
      data: users,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error retrieving users by confirmation status',
      error: error.message,
    });
  }
};

// Get users by company
export const getUsersByCompany = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    // Validate if company exists
    const company = await Company.findByPk(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }
    assertTenantOwnership(company);

    const users = await User.findAll({
      where: { companyId },
       attributes: ["userId","danfossuserId", "username", "email","costCenter","mobile"],
    });

    return res.status(200).json({
      success: true,
      message: `Users for company retrieved successfully`,
      data: users,
      company: {
        companyId: company.companyId,
        companyName: company.companyName
      }
    });
  } catch (error: any) {
    if (isTenantError(error)) {
      return res.status(403).json({ message: error.message });
    }
    return res.status(500).json({
      success: false,
      message: 'Error retrieving users by company',
      error: error.message,
    });
  }
};

// Get users by gender
export const getUsersByGender = async (req: Request, res: Response) => {
  try {
    const { gender } = req.params;

    // Validate gender
    if (!['male', 'female', 'other'].includes(gender)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid gender. Must be one of: male, female, other',
      });
    }

    const users = await User.findAll({
      where: { gender },
    });

    return res.status(200).json({
      success: true,
      message: `Users with gender '${gender}' retrieved successfully`,
      data: users,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error retrieving users by gender',
      error: error.message,
    });
  }
};

// Logout
export const logout = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Logout successful. Please remove the token from client-side storage.'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error during logout',
      error: error.message
    });
  }
};

// RESTORE USER
export const restoreUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.unscoped().findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'User is already active',
      });
    }

    await user.update({
      isDeleted: false,
      status: "active",
    });

    return res.status(200).json({
      success: true,
      message: 'User restored successfully',
    });
  } catch (error: any) {
    console.error('Error restoring user:', error);
    return res.status(500).json({
      success: false,
      message: 'Error restoring user',
      error: error.message,
    });
  }
};

// PERMANENT DELETE USER
export const permanentDeleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.unscoped().findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    assertTenantOwnership(user);

    const bookingCount = await Booking.count({ where: { userId: id } });
    if (bookingCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot permanently delete user with ${bookingCount} associated booking(s). Keep user soft-deleted to preserve audit history.`
      });
    }

    await user.destroy(); // HARD DELETE

    return res.status(200).json({
      success: true,
      message: 'User permanently deleted',
    });
  } catch (error: any) {
    console.error('Error permanently deleting user:', error);
    return res.status(500).json({
      success: false,
      message: 'Error permanently deleting user',
      error: error.message,
    });
  }
};


export const getCompanyManagers = async (req: Request, res: Response) => {
  try {
    const companyId = (req.params.companyId || req.query.companyId) as string;

    if (!companyId) {
      return res.status(400).json({ success: false, message: "companyId is required" });
    }

    // ✅ ensure company exists (optional but good)
    const company = await Company.findOne({
      where: { companyId, isDeleted: false },
      attributes: ["companyId", "companyName", "companyCode", "seoUrl","managerApproval"],
    });

    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    // ✅ managers only (avoid sending password)
    const managers = await User.findAll({
      where: { companyId, isManager: true },
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      company,
      count: managers.length,
      data: managers,
    });
  } catch (error: any) {
    console.error("getCompanyManagers error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const appMapCount = async (req: any, res: Response) => {
  try {
//    const { type } = req.body; // "pickup" or "drop"

    // Get existing row (or create one)
    let record = await MapCount.findOne();

    if (!record) {
      record = await MapCount.create({});
    }

      await record.increment('appCount', { by: 1 });

    res.status(200).json({
      message: 'Count updated successfully'
    });

  } catch (err) {
    res.status(500).json({ error: err });
  }
};

export const webMapCount = async (req: any, res: Response) => {
  try {
//    const { type } = req.body; // "pickup" or "drop"

    // Get existing row (or create one)
    let record = await MapCount.findOne();

    if (!record) {
      record = await MapCount.create({});
    }

      await record.increment('webCount', { by: 1 });

    res.status(200).json({
      message: 'Count updated successfully'
    });

  } catch (err) {
    res.status(500).json({ error: err });
  }
};


export const getMapCount = async (req: any, res: Response) => {
  try {
    let record = await MapCount.findOne();

    if (!record) {
      record = await MapCount.create({});
    }

    res.status(200).json({
      appCount: record.appCount,
      webCount: record.webCount
    });

  } catch (err) {
    res.status(500).json({ error: err });
  }
};

export const getManagerDetailsByUserId = async (req: Request, res: Response) => {
  try {
    const userId = (req.params.userId || req.query.userId) as string;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const user = await User.findOne({
      where: { userId },
      attributes: ["danfossuserId", "managerId", "managerEmail","costCenter","mobile"],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    assertTenantOwnership(user);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error("getManagerDetailsByUserId error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};