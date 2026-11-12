import { Request, Response, Router } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Company, Employee, Vendor, Tenant } from '../models';
import { Security } from '../utils/Security';
import config from '../config/config';
import { User } from '../models/user';
import { Drivers } from '../models/drivers';
import { OTP } from '../models/otp';
import { USERS } from "../utils/costants";
import { Op } from 'sequelize';
import { sendEmailFromTemplate, fetchAllEmailConfs } from "../services/emailConfServices";
import { sendNotification } from './notificationService';
const { ROLES } = USERS;
import { normalizeManagerEmails } from '../utils/email';
import { ROOT_TENANT_ID, getTenantContext } from '../context/tenantContext';
import { validateRegistrationAgainstPolicy } from '../services/policyService';
import { generateUniqueCompanySlug } from '../utils/slugUtils';


// Helper function to find user by mobile and return user data with type
const findUserByMobile = async (mobile: string) => {
  // Check in User table
  let user;
  user = await User.findOne({ where: { mobile } });
  if (user) {
    return {
      user,
     role: 'user',
      userId: user.userId,
      userData: {
        id: user.userId,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        role: user.role
      }
    };
  }

  // Check in Vendor table (phno field)
  user = await Vendor.findOne({ where: { phno: mobile } });
  if (user) {
    return {
      user,
     role: 'vendor',
      userId: user.vendorId,
      userData: {
        id: user.vendorId,
        username: user.vendorName,
        email: user.email,
        mobile: user.phno,
        role: user.role
      }
    };
  }

  // Check in Drivers table (phno field)
  user = await Drivers.findOne({ where: { phno: mobile } });
  if (user) {
    return {
      user,
     role: 'driver',
      userId: user.driverId,
      userData: {
        id: user.driverId,
        username: user.driverName,
        email: user.driverEmail,
        mobile: user.phno,
        role: 'driver'
      }
    };
  }

  return null;
};



// Existing employee registration
export const empRegister = async (req: Request, res: Response) => {
  const { username, email, phno, password, empManager } = req.body;
  try {
    const role = ROLES.SUPERADMIN;
   // const normalEmail = email.toLowerCase();
    //const normalPass = password.toLowerCase();
    
    const existing = await Employee.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    
    const hashedPassword = await Security.hash(password, 10);
    const employee = await Employee.create({ username, email, phno, password: hashedPassword, role, empManager });

     res.status(201).json({ message: 'Registered successfully', employee })
    } catch (err) {
    res.status(500).json({ error: err });
  }
};
export const empLogin = async (req: Request, res: Response) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 🔹 1️⃣ Check if it's an employee
    const employee = await Employee.findOne({ where: { email } });
    if (employee) {
      const isMatch = await bcrypt.compare(password, employee.password);
      if (!isMatch)
        return res.status(401).json({ message: "Invalid credentials" });

      return res.status(200).json({
        id: employee.employeeId,
        email: employee.email,
        role: employee.role,
        tenantId: employee.tenantId || ROOT_TENANT_ID,
        accessToken: Security.generateJwtToken(
          { 
            userId: employee.employeeId, 
            roles: employee.role,
            tenantId: employee.tenantId || ROOT_TENANT_ID 
          },
          config.security.jwtSecret,
          config.security.accessTokenExpiry
        ),
      });
    }

    const vendor = await Vendor.findOne({ where: { email } });
      if (vendor) {
      const isMatch = await bcrypt.compare(password, vendor.password );
      if (!isMatch)
        return res.status(401).json({ message: "Invalid credentials" });

      return res.status(200).json({
        id: vendor.vendorId,
        email: vendor.email,
        role: vendor.role,              //admin
        tenantId: vendor.tenantId || ROOT_TENANT_ID,
        accessToken: Security.generateJwtToken(
          { 
            userId: vendor.vendorId, 
            roles: vendor.role,
            tenantId: vendor.tenantId || ROOT_TENANT_ID 
          },
          config.security.jwtSecret,
          config.security.accessTokenExpiry
        ),
      });
    }

    // Check if it's a user (or manager)
    const user = await User.findOne({ where: { email } });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(401).json({ message: "Invalid credentials" });

      // Determine Role based on isManager
      // const userRole = user.isManager ? "manager" : "user";
      const userRole = user.companyManager ? "manager" : "user";

      return res.status(200).json({
        id: user.userId,
        name: user.username,
        companyId: user.companyId,
        email: user.email,
        role: userRole, // 👈 manager or user
        tenantId: user.tenantId || ROOT_TENANT_ID,
        accessToken: Security.generateJwtToken(
          { 
            userId: user.userId, 
            roles: userRole, 
            companyId: user.companyId,
            tenantId: user.tenantId || ROOT_TENANT_ID
          },
          config.security.jwtSecret,
          config.security.accessTokenExpiry
        ),
      });
    }

    //  If no employee or user found
    return res.status(404).json({ message: "Email not registered" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const norm = (v?: string) => (v || '').trim().toLowerCase();

// export const registerUser = async (req: Request, res: Response) => {
//   try {
//     const {
//       username,
//       email,
//       mobile,
//       password,
//       role,
//       gender,
//       country,
//       city,
//       companyId,
//       status,
//       isConfirmed,
//       userAddress,
//       presentAddress,
//       state,
//       pinCode,
//       isManager
//     } = req.body;

//     const hashedPassword = await Security.hash(password, 10);

//     const existingUserByEmail = await User.findOne({ where: { email } });
//     if (existingUserByEmail) {
//       return res.status(400).json({ success: false, message: "User with this email already exists" });
//     }

//     // const existingUserByMobile = await User.findOne({ where: { mobile } });
//     // if (existingUserByMobile) {
//     //   return res.status(400).json({ success: false, message: "User with this mobile number already exists" });
//     // }

//     //  Validate company
//     const company = await Company.findByPk(companyId);
//     if (!company) {
//       return res.status(400).json({ success: false, message: "Company not found with the provided companyId" });
//     }

//     //  Normalize for comparison (handles array or JSON-string)
//     const managerEmails: string[] = normalizeManagerEmails(company.managerEmail as any);
//     const normalizedEmail = String(email || "").trim().toLowerCase();
//     const isCompanyManager = managerEmails.includes(normalizedEmail);

//     const newUser = await User.create({
//       username,
//       email,
//       mobile,
//       password: hashedPassword,
//       role,
//       gender,
//       country,
//       city,
//       companyId,
//       status: status || "active",
//       isPayHolder: false,
//       isConfirmed : isConfirmed || 0,
//       userAddress,
//       presentAddress: presentAddress || null,
//       companyManager: isCompanyManager ? 1 : 0, // ← 1 if matches a manager email
//       isManager,
//       state,
//       pinCode
//     });

//     const createdUser = await User.findByPk(newUser.userId, {
//       include: [{ model: Company, attributes: ["companyId", "companyName"] }],
//     });

//     try {
//       await sendEmailFromTemplate("USER_REGISTRATION_EMAIL_TO_USER", {
//         UserName: username,
//         UserEmail: email,
//         Password: password,
//       });
//       console.log("✅ Registration email sent to:", email);
//     } catch (emailErr) {
//       console.error("❌ Error sending registration email:", emailErr);
//     }

//     return res.status(201).json({
//       success: true,
//       message: "User registered successfully and email sent",
//       User: createdUser,
//     });
//   } catch (error: any) {
//     console.error("Register user error:", error);
//     return res.status(400).json({
//       success: false,
//       message: "Error registering user",
//       error: error.message,
//     });
//   }
// };


// // Existing user login

export const registerUser = async (req: Request, res: Response) => {
  try {
    const {
      username,
      email,
      mobile,
      role,
      gender,
      country,
      city,
      companyId,
      userAddress,
      presentAddress,
      state,
      pinCode,
      isManager,
     danfossuserId,
 managerId,
 managerEmail, 
 costCenter
    } = req.body;

    const normalizedEmail = String(email || "").trim().toLowerCase();

    const existingUserByEmail = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists"
      });
    }
const existingUserByMobile = await User.findOne({ where: { mobile } });

if (existingUserByMobile) {
  return res.status(400).json({
    success: false,
    message: "Phone number already exists"
  });
}
    const company = await Company.findByPk(companyId, {
      attributes: ["companyId", "companyName", "managerEmail", "tenantId", "seoUrl"]
    });

    if (!company) {
      return res.status(400).json({
        success: false,
        message: "Company not found with the provided companyId"
      });
    }

    // Enforce tenant boundary: Fleet Admin cannot create users in another fleet's company
    const ctx = getTenantContext();
    if (ctx?.tenantId && !ctx?.isPlatformSuperAdmin) {
      if (company.tenantId && company.tenantId !== ctx.tenantId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to create users for a company belonging to another fleet.",
        });
      }
    }

    // Dynamic company policy validation (backward-compatible fallback for Danfoss)
    const policyCheck = await validateRegistrationAgainstPolicy(companyId, normalizedEmail, danfossuserId);
    if (!policyCheck.valid) {
      return res.status(400).json({
        success: false,
        message: policyCheck.message || "Registration violates company policy."
      });
    }

    // Ensure company SEO URL is valid and never undefined
    let companySeoUrl = company.seoUrl;
    if (!companySeoUrl || companySeoUrl.trim() === "") {
      companySeoUrl = await generateUniqueCompanySlug(company.companyName || "company", company.tenantId, company.companyId);
      await company.update({ seoUrl: companySeoUrl });
    }

    const tenant = company.tenantId ? await Tenant.findByPk(company.tenantId) : null;
    const fleetSlug = tenant?.slug || tenant?.subdomain || 'fleet';

    const webBaseUrl = (process.env.WEB_BASE_URL || config.baseurl?.webbaseurl || "http://localhost:3000").replace(/\/$/, "");
    const companyPortalUrl = `${webBaseUrl}/company/${encodeURIComponent(fleetSlug)}/${encodeURIComponent(companySeoUrl)}`;
    const commonLoginUrl = `${webBaseUrl}/login`;

    const managerEmails: string[] = normalizeManagerEmails(company.managerEmail as any);
    let isCompanyManager = managerEmails.includes(normalizedEmail);
    if (isManager) {
      isCompanyManager = isManager;
    }

    // Auto-generate temporary password and hash securely
    const generatedPassword = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await Security.hash(generatedPassword, 10);

    const newUser = await User.create({
      username,
      email: normalizedEmail,
      mobile,
      password: hashedPassword,
      role: role || "user",
      tenantId: company.tenantId || ROOT_TENANT_ID,
      gender,
      country,
      city,
      companyId,
      status: "active",
      isPayHolder: false,
      isConfirmed: 1,
      userAddress,
      presentAddress: presentAddress || null,
      companyManager: isCompanyManager ? 1 : 0,
      isManager,
      state,
      pinCode,
      danfossuserId: danfossuserId || null,
      managerId: managerId || null,
      managerEmail: managerEmail || null,
      costCenter
    });

    const createdUser = await User.findByPk(newUser.userId, {
      include: [{ model: Company, attributes: ["companyId", "companyName", "seoUrl"] }],
    });

    let emailDelivered = false;
    let emailError: string | null = null;
    try {
      await sendEmailFromTemplate("USER_REGISTRATION_EMAIL_TO_USER", {
        UserName: username,
        UserEmail: normalizedEmail,
        Password: generatedPassword,
        CompanySeoUrl: companyPortalUrl,
        LoginUrl: commonLoginUrl,
        to: normalizedEmail,
      });
      emailDelivered = true;
    } catch (emailErr: any) {
      emailError = emailErr?.message || "Failed to dispatch email";
      console.error("User registration email dispatch failed:", emailError);
    }

    return res.status(201).json({
      success: true,
      message: emailDelivered
        ? "User registered successfully and login details sent to email"
        : "User registered successfully (email notification pending delivery)",
      emailDelivered,
      emailError,
      companyPortalUrl,
      User: createdUser,
    });

  } catch (error: any) {
    console.error("Register user error:", error);
    return res.status(400).json({
      success: false,
      message: "User with this Ph_no already exists",
      error: error.message,
    });
  }
};

export const userLogin = async (req: Request, res: Response) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  
  try {
    // Validate input
    if (!email || !password) {
      res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
      return;
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
      return;
    }

    // Check if user has a password (in case it's null)
    if (!user.password) {
      res.status(500).json({ 
        success: false,
        message: 'User password not found in database' 
      });
      return;
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
      return;
    }

    // Generate JWT token
    const accessToken = Security.generateJwtToken(
      { 
        userId: user.userId,
        roles: user.role,
        companyId: user.companyId,
        tenantId: user.tenantId || ROOT_TENANT_ID
      },
      config.security.jwtSecret,
      config.security.accessTokenExpiry
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      User: user,
      accessToken
    });

  } catch (err: any) {
    console.error('User login error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: err.message 
    });
  }
};

export const CompanyLogin = async (req: Request, res: Response) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const fleetSlug = (req.body.fleetSlug || '').trim().toLowerCase();
  const companySlug = (req.body.companySlug || req.body.seoUrl || '').trim().toLowerCase();

  try {
    if (!email || !password || !companySlug) {
      return res.status(400).json({
        success: false,
        message: "Email, password and company identifier are required",
      });
    }

    //  Reject SuperAdmin / Fleet Admin administrative accounts from logging into company user portal
    const empUser = await Employee.findOne({ where: { email } });
    if (empUser && ['superadmin', 'fleet_admin', 'admin'].includes((empUser.role || '').toLowerCase())) {
      return res.status(403).json({
        success: false,
        message: "Fleet administrators and SuperAdmins cannot log in through the corporate client portal. Please use the administrative portal.",
      });
    }

    //  Resolve Company & Fleet
    let tenant: any = null;
    let company: any = null;

    if (fleetSlug) {
      tenant = await Tenant.findOne({
        where: {
          isDeleted: false,
          [Op.or]: [
            { slug: fleetSlug },
            { subdomain: fleetSlug },
            { code: fleetSlug.toUpperCase() },
            ...(fleetSlug === 'fleetflow' || fleetSlug === 'primary' ? [{ tenantId: ROOT_TENANT_ID }] : [])
          ]
        }
      });

      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: "Fleet not found",
        });
      }

      company = await Company.findOne({
        where: {
          seoUrl: companySlug,
          tenantId: tenant.tenantId,
          isDeleted: false,
        }
      });

      if (!company) {
        return res.status(404).json({
          success: false,
          message: "Company not found for this fleet",
        });
      }
    } else {
      // Backward compatibility: Resolve Company by single seoUrl
      company = await Company.findOne({
        where: {
          seoUrl: companySlug,
          isDeleted: false,
        }
      });

      if (!company) {
        return res.status(404).json({
          success: false,
          message: "Invalid company URL",
        });
      }

      tenant = company.tenantId ? await Tenant.findByPk(company.tenantId) : null;
    }

    const companyTenantId = company.tenantId || ROOT_TENANT_ID;

    //  Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Reject administrative roles if somehow set on user model
    if (['superadmin', 'fleet_admin', 'admin'].includes((user.role || '').toLowerCase())) {
      return res.status(403).json({
        success: false,
        message: "Administrative accounts cannot log in through corporate client portal.",
      });
    }

    //  Check if user belongs to that company
    if (user.companyId !== company.companyId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to login for this company",
      });
    }

    //  Check if user belongs to that fleet
    const userTenantId = user.tenantId || companyTenantId;
    if (userTenantId !== companyTenantId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to login for this fleet",
      });
    }

    // Check active status
    if ((user as any).status === 'inactive' || (user as any).isDeleted) {
      return res.status(403).json({
        success: false,
        message: "Your account is deactivated. Please contact your company administrator.",
      });
    }

    //  Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    //  Assign role dynamically
    let updatedRole = user.companyManager ? "manager" : "user";

    // If DB role doesn't match current logic, update it
    if (user.role !== updatedRole) {
      user.role = updatedRole;
      await user.save();
    }

    const resolvedFleetSlug = tenant?.slug || tenant?.subdomain || 'fleet';

    //  Generate JWT token
    const accessToken = Security.generateJwtToken(
      {
        userId: user.userId,
        roles: updatedRole,
        companyId: company.companyId,
        tenantId: companyTenantId,
        email: user.email,
      },
      config.security.jwtSecret,
      config.security.accessTokenExpiry
    );

    //  Response
    res.status(200).json({
      success: true,
      message: "Login successful",
      User: {
        ...user.toJSON(),
        role: updatedRole,
      },
      accessToken,
      fleetSlug: resolvedFleetSlug,
      companySlug: company.seoUrl,
      companyPortalUrl: `/company/${resolvedFleetSlug}/${company.seoUrl}`,
    });
  } catch (err: any) {
    console.error("User login error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};


// Existing vendor login
export const vendorLogin = async (req: Request, res: Response) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const { fcm_token } = req.body;
  try {
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }
    const vendor = await Vendor.findOne({ where: { email } });
    if (!vendor) {
        res.status(404).json({ message: 'vendor not found' });
        return;
    }  

    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
    }

   
         const updateResult = await vendor.update(
          { fcm_token: fcm_token },
          {
            where: {
              email: email
            }
          }
        );

        console.log("vendor fcm token status: ",updateResult)
  
    
    res.status(200).json({
      id: vendor.vendorId,
      username: vendor.vendorName,
      email: vendor.email,
      accessToken: Security.generateJwtToken(
        { 
          userId: vendor.vendorId,
          roles: vendor.role,
          tenantId: vendor.tenantId || ROOT_TENANT_ID
        },
        config.security.jwtSecret,
        config.security.accessTokenExpiry
      )});
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// Existing owner register
export const ownerRegister = async (req: any, res: Response) => {
  const { vendorName, email, phno, address, country, state, city } = req.body;
  try {
    const ctx = getTenantContext();
    const tenantId = ctx?.tenantId || req.tenantId || ROOT_TENANT_ID;

    const existing = await Vendor.findOne({ where: { email, tenantId } });
    if (existing) return res.status(400).json({ message: 'Email already registered in this fleet' });

    const owner = await Vendor.create({ vendorName, email, phno, address, country, state, city, tenantId });

    res.status(201).json({ message: 'Registered successfully', owner });
  } catch (err: any) {
    res.status(500).json({ error: err.message || err });
  }
};

// ========== NEW OTP-BASED LOGIN FUNCTIONS ==========

// Generate and send OTP
export const sendOTP = async (req: Request, res: Response) => {
  const { mobile } = req.body;

  try {
    if (!mobile) {
      res.status(400).json({
        success: false,
        message: 'Mobile number is required'
      });
      return;
    }

    // Find user by mobile number
    const userResult = await findUserByMobile(mobile);
    
    if (!userResult) {
      res.status(404).json({
        success: false,
        message: 'Mobile number not registered'
      });
      return;
    }

    // Generate cryptographic 6-digit OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const storedOtp = hashOtp(rawOtp, userResult.userId);

    // Delete any existing OTP for this user
    await OTP.destroy({
      where: { loginId: userResult.userId }
    });

    // Create new OTP record with hashed OTP
    await OTP.create({
      otp: storedOtp,
      loginId: userResult.userId,
      attempts: 0,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes expiry
    });

    console.log(`[AuthServices] OTP dispatch initiated for mobile: ${mobile.slice(-4).padStart(mobile.length, '*')}`);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      role: userResult.role,
    });

  } catch (error: any) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending OTP',
      error: error.message
    });
  }
};

// Verify OTP and login
export const verifyOTPLogin = async (req: Request, res: Response) => {
  const { mobile, otp } = req.body;

  try {
    if (!mobile || !otp) {
      res.status(400).json({
        success: false,
        message: 'Mobile number and OTP are required'
      });
      return;
    }

    // Find user by mobile number first
    const userResult = await findUserByMobile(mobile);
    
    if (!userResult) {
      res.status(404).json({
        success: false,
        message: 'Mobile number not registered'
      });
      return;
    }

    // Find and verify OTP (support both hashed and legacy raw OTP)
    const hashedOtp = hashOtp(otp, userResult.userId);
    const otpRecord = await OTP.findOne({
      where: {
        loginId: userResult.userId,
        otp: { [Op.in]: [hashedOtp, otp] },
        expiresAt: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!otpRecord) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
      return;
    }

    // Delete the used OTP
    await OTP.destroy({
      where: {
        otpId: otpRecord.otpId
      }
    });

    // Generate JWT token
    const tokenPayload = {
      userId: userResult.userData.id,
      roles: userResult.userData.role,
      tenantId: userResult.user?.tenantId || ROOT_TENANT_ID
    };

    const accessToken = Security.generateJwtToken(
      tokenPayload,
      config.security.jwtSecret,
      config.security.accessTokenExpiry
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        ...userResult.userData,
       role: userResult.role
      },
      accessToken
    });

  } catch (error: any) {
    console.error('Verify OTP login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message
    });
  }
};

// Resend OTP
export const resendOTP = async (req: Request, res: Response) => {
  const { mobile } = req.body;

  try {
    if (!mobile) {
      res.status(400).json({
        success: false,
        message: 'Mobile number is required'
      });
      return;
    }

    // Find user by mobile number
    const userResult = await findUserByMobile(mobile);
    
    if (!userResult) {
      res.status(404).json({
        success: false,
        message: 'Mobile number not registered'
      });
      return;
    }

    // Generate new cryptographic 6-digit OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const storedOtp = hashOtp(rawOtp, userResult.userId);

    // Delete any existing OTP for this user
    await OTP.destroy({
      where: { loginId: userResult.userId }
    });

    // Create new OTP record with hashed OTP
    await OTP.create({
      otp: storedOtp,
      loginId: userResult.userId,
      attempts: 0,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes expiry
    });

    console.log(`[AuthServices] Resent OTP dispatch initiated for mobile: ${mobile.slice(-4).padStart(mobile.length, '*')}`);

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
    });

  } catch (error: any) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resending OTP',
      error: error.message
    });
  }
};

export interface AccountLookupResult {
  accountType: 'employee' | 'vendor' | 'user';
  userId: string;
  user: any;
  email: string;
  username: string;
  role?: string;
  tenantId?: string;
  fleetName?: string;
  userData: {
    id: string;
    username: string;
    email: string;
    mobile?: string;
    role?: string;
    companyId?: string;
  };
}

export const hashOtp = (otp: string, loginId: string): string => {
  return crypto.createHash('sha256').update(`${loginId}:${otp}`).digest('hex');
};

export const findUserByEmail = async (rawEmail: string): Promise<AccountLookupResult | null> => {
  const email = (rawEmail || '').trim().toLowerCase();
  if (!email) return null;

  // 1. Check Employee table first (Platform SuperAdmins, Fleet Admins, Staff/Drivers)
  const emp = await Employee.findOne({ where: { email } });
  if (emp) {
    return {
      accountType: 'employee',
      userId: emp.employeeId,
      user: emp,
      email: emp.email,
      username: emp.username,
      role: emp.role,
      tenantId: emp.tenantId,
      userData: {
        id: emp.employeeId,
        username: emp.username,
        email: emp.email,
        mobile: emp.phno,
        role: emp.role,
      },
    };
  }

  // 2. Check Vendor table
  const vendor = await Vendor.findOne({ where: { email } });
  if (vendor) {
    return {
      accountType: 'vendor',
      userId: vendor.vendorId,
      user: vendor,
      email: vendor.email,
      username: vendor.vendorName,
      role: vendor.role,
      tenantId: vendor.tenantId,
      userData: {
        id: vendor.vendorId,
        username: vendor.vendorName,
        email: vendor.email,
        mobile: vendor.phno,
        role: vendor.role,
      },
    };
  }

  // 3. Check User table (Corporate Employees / End Users)
  const user = await User.findOne({ where: { email } });
  if (user) {
    return {
      accountType: 'user',
      userId: user.userId,
      user,
      email: user.email,
      username: user.username,
      role: user.role,
      tenantId: user.tenantId,
      userData: {
        id: user.userId,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        companyId: user.companyId,
      },
    };
  }

  return null;
};

export const forgetPasswordSendOtp = async (req: Request, res: Response) => {
  const norm = (v?: string) => (v || "").trim().toLowerCase();
  const email = norm(req.body.email);

  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: "A valid email address is required." });
  }

  try {
    const userResult = await findUserByEmail(email);
    if (!userResult) {
      // Respond generically to prevent account enumeration
      return res.status(200).json({ success: true, message: "If the email is registered, an OTP has been sent." });
    }

    // If company context is provided, verify user belongs to this specific company
    const seoUrl = (req.body.seoUrl || "").trim();
    if (seoUrl) {
      const company = await Company.findOne({ where: { seoUrl } });
      const userCompanyId = (userResult.userData as any)?.companyId;
      if (!company || userCompanyId !== company.companyId) {
        return res.status(200).json({ success: true, message: "If the email is registered, an OTP has been sent." });
      }
    }

    const loginId = userResult.userId;

    // Resend cooldown check: 60 seconds
    const recentOtp = await OTP.findOne({
      where: {
        loginId,
        createdAt: {
          [Op.gt]: new Date(Date.now() - 60 * 1000)
        }
      }
    });

    if (recentOtp) {
      return res.status(429).json({
        success: false,
        message: "Please wait 60 seconds before requesting a new OTP."
      });
    }

    // Generate cryptographically secure 6-digit OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const hashedOtp = hashOtp(rawOtp, loginId);

    // Delete any old OTP records for this loginId
    await OTP.destroy({ where: { loginId } });

    // Store hashed OTP with 5 minute expiry and 0 attempts
    await OTP.create({
      otp: hashedOtp,
      loginId,
      attempts: 0,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    // Optional dual-channel dispatch: Send OTP via SMS if registered phone number is available
    const recipientPhone = userResult.userData?.mobile;
    if (recipientPhone) {
      try {
        await sendNotification({
          channel: 'SMS',
          recipient: recipientPhone,
          templateCode: 'FORGET_PASSWORD_OTP_SMS',
          body: `Your FleetFlow password recovery OTP is ${rawOtp}. Valid for 5 minutes.`,
          tenantId: userResult.tenantId || ROOT_TENANT_ID,
          metadata: { otp: rawOtp },
        });
      } catch (smsErr: any) {
        // SMS failure is non-blocking for email delivery
        console.warn('[forgetPasswordSendOtp] Optional SMS delivery noticed:', smsErr?.message || smsErr);
      }
    }

    // Send email using centralized sendEmailFromTemplate
    const recipientEmail = userResult.userData?.email || email;
    const recipientName = userResult.userData?.username || "User";

    try {
      const emailResult = await sendEmailFromTemplate("FORGET_PASSWORD_OTP", {
        DisplayName: recipientName,
        UserName: recipientName,
        EmployeeEmail: recipientEmail,
        UserEmail: recipientEmail,
        OTP: rawOtp,
        tenantId: userResult.tenantId || ROOT_TENANT_ID,
        WEB_SITE_NAME: "www.fleetflow.com",
        WEB_SITE_EMAIL: "support@fleetflow.com",
        CONTACT_NO: "+91 90000 00000",
      });

      // Verify that provider didn't reject the message
      if (emailResult && emailResult.rejected && emailResult.rejected.length > 0 && emailResult.rejected.includes(recipientEmail)) {
        await OTP.destroy({ where: { loginId } });
        return res.status(502).json({
          success: false,
          message: "Email provider rejected message delivery. Please contact support."
        });
      }
    } catch (sendErr: any) {
      // If delivery failed, delete OTP record to maintain security
      await OTP.destroy({ where: { loginId } });
      console.error("[forgetPasswordSendOtp] Failed to deliver OTP email:", sendErr?.message || sendErr);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please verify your email configuration or try again later."
      });
    }

    // Success response without exposing raw OTP
    return res.status(200).json({
      success: true,
      message: "If the email is registered, an OTP has been sent."
    });
  } catch (error: any) {
    console.error("forgetPasswordSendOtp error:", error?.message || error);
    return res.status(500).json({ success: false, message: "Error sending OTP" });
  }
};

export const verifyOtpPassword = async (req: Request, res: Response) => {
  const norm = (v?: string) => (v || "").trim().toLowerCase();
  const email = norm(req.body.email);
  const rawOtp = String(req.body.otp || "").trim();

  try {
    if (!email || !rawOtp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required." });
    }

    const userResult = await findUserByEmail(email);
    if (!userResult) {
      return res.status(400).json({ success: false, message: "Invalid OTP or email." });
    }

    const loginId = userResult.userId;
    const record = await OTP.findOne({ where: { loginId } });
    if (!record) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
    }

    // Check expiry
    if (new Date(record.expiresAt) < new Date()) {
      await OTP.destroy({ where: { loginId } });
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    // Check verification attempts (max 5)
    const currentAttempts = (record.attempts || 0) + 1;
    if (currentAttempts > 5) {
      await OTP.destroy({ where: { loginId } });
      return res.status(429).json({
        success: false,
        message: "Too many failed attempts. Please request a new OTP."
      });
    }
    await record.update({ attempts: currentAttempts });

    // Compare hashed OTP (with legacy plaintext fallback support)
    const expectedHash = hashOtp(rawOtp, loginId);
    const isMatch = record.otp === expectedHash || record.otp === rawOtp;

    if (!isMatch) {
      const remaining = 5 - currentAttempts;
      return res.status(400).json({
        success: false,
        message: remaining > 0
          ? `Invalid OTP. ${remaining} attempt(s) remaining.`
          : "Invalid OTP. Maximum attempts reached. Please request a new OTP."
      });
    }

    // Generate single-use reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    await record.update({
      otp: null,
      resetToken,
      verifiedAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes to reset password
    });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
      resetToken
    });
  } catch (error: any) {
    console.error("verifyOtpPassword error:", error?.message || error);
    return res.status(500).json({ success: false, message: "Error verifying OTP" });
  }
};

export const forgetPassword = async (req: Request, res: Response) => {
  const norm = (v?: string) => (v || "").trim().toLowerCase();
  const email = norm(req.body.email);
  const password = req.body.password || req.body.newPassword;
  const resetToken = req.body.resetToken;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and new password are required." });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }

    const userResult = await findUserByEmail(email);
    if (!userResult) {
      return res.status(400).json({ success: false, message: "No matching account found." });
    }

    const loginId = userResult.userId;
    const marker = await OTP.findOne({ where: { loginId } });

    // Check verification status and expiration
    if (!marker || marker.otp !== null || !marker.verifiedAt || new Date(marker.expiresAt) < new Date()) {
      return res.status(400).json({ success: false, message: "OTP not verified or reset window has expired." });
    }

    // Verify resetToken if provided
    if (resetToken && marker.resetToken && marker.resetToken !== resetToken) {
      return res.status(403).json({ success: false, message: "Invalid or forged password reset token." });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the exact matched record based on accountType
    if (userResult.accountType === 'employee') {
      await Employee.update({ password: hashedPassword }, { where: { employeeId: loginId } });
    } else if (userResult.accountType === 'vendor') {
      await Vendor.update({ password: hashedPassword }, { where: { vendorId: loginId } });
    } else if (userResult.accountType === 'user') {
      await User.update({ password: hashedPassword }, { where: { userId: loginId } });
    }

    // Destroy OTP marker immediately so it cannot be reused
    await OTP.destroy({ where: { loginId } });

    return res.status(200).json({
      success: true,
      message: "Password updated successfully. You can now login."
    });
  } catch (error: any) {
    console.error("forgetPassword error:", error?.message || error);
    return res.status(500).json({ success: false, message: "Error updating password" });
  }
};


export const changePassword = async (req:Request, res:Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });

    const user = await User.findOne({ where: { email } });

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });
} catch (err: any) {
  res.status(500).json({ success: false, message: "Error updating password", error: err.message });
}
};

