import { Request, Response } from 'express';
import { Package } from '../models/package';
import { VehicleType } from '../models/vehicleType';
import { VehicleMaster } from '../models/vehicleMaster';
import { Vehicle } from '../models/vehicle';
import { Company } from '../models/company';
import { PackageData } from '../models';
import { USERS } from "../utils/costants";
import { ROOT_TENANT_ID } from '../context/tenantContext';
const { ROLES } = USERS;

 export const createPackage = async (req: any, res: Response) =>  {
  try {
    if (req.role === ROLES.USER) {
      return res.status(403).json({ message: "Not Authorized" });
    }

    const { companyId, packageType } = req.body;

    if (!companyId || !packageType) {
      return res.status(400).json({
        success: false,
        message: "company and packageType are required fields",
      });
    }

    // ✅ add Monthly Bookings and Public Booking
    const validPackageTypes = ["Out Station", "Local City Use", "Monthly Bookings", "Public Booking", "PUBLIC_BOOKING"];
    if (!validPackageTypes.includes(packageType)) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid packageType. Must be "Out Station", "Local City Use", "Monthly Bookings", or "Public Booking"',
      });
    }

    const company = await Company.findByPk(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    const newPackage = await Package.create({ companyId, packageType, tenantId: req.tenantId || company.tenantId });
    const createdPackage = await Package.findByPk(newPackage.packageId);

    return res.status(201).json({
      success: true,
      message: "Package created successfully",
      data: createdPackage,
    });
  } catch (error) {
    console.error("Error creating package:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
// Create Package
// export const createPackage = async (req: any, res: Response) =>  {
//     try {
//          if (req.role === ROLES.USER) {
//       return res.status(403).json({ message: 'Not Authorized' });
//     }
//         const { companyId,packageType } = req.body;
 
//         // Validation
//         if (!companyId || !packageType) {
//             res.status(400).json({
//                 success: false,
//                 message: 'company and packageType are required fields'
//             });
//             return;
//         }
//         // Validate packageType enum
//         const validPackageTypes = ['Out Station', 'Local City Use'];
//         if (!validPackageTypes.includes(packageType)) {
//             res.status(400).json({
//                 success: false,
//                 message: 'Invalid packageType. Must be either "Out Station" or "Local City Use"'
//             });
//             return;
//         }
 
//         // Check if company exists
//         const company = await Company.findByPk(companyId);
//         if (!company) {
//             res.status(404).json({
//                 success: false,
//                 message: 'Company not found'
//             });
//             return;
//         }
 
//         // Create the package
//         const newPackage = await Package.create({
//             companyId,
//             packageType
//         });
 
//         // Fetch the created package with company details
//         const createdPackage = await Package.findByPk(newPackage.packageId);
 
//         res.status(201).json({
//             success: true,
//             message: 'Package created successfully',
//             data: createdPackage
//         });
 
//     } catch (error) {
//         console.error('Error creating package:', error);
       
//         // Handle specific Sequelize errors
//         if (error instanceof Error) {
//             // Handle foreign key constraint errors
//             if (error.name === 'SequelizeForeignKeyConstraintError') {
//                 res.status(400).json({
//                     success: false,
//                     message: 'Invalid companyId provided'
//                 });
//                 return;
//             }
           
//             // Handle validation errors
//             if (error.name === 'SequelizeValidationError') {
//                 res.status(400).json({
//                     success: false,
//                     message: 'Validation error',
//                     details: error.message
//                 });
//                 return;
//             }
//         }
 
//         res.status(500).json({
//             success: false,
//             message: 'Internal server error'
//         });
//     }
// };
 
// export const getvehicleTypesByPackageId = async (req: any, res: Response) => {
//     try {
//         if (req.role === ROLES.USER) {
//             return res.status(403).json({ message: 'Not Authorized' });
//         }
//         const { packageId } = req.params;
 
//         if (!packageId) {
//             res.status(400).json({
//                 success: false,
//                 message: 'Package ID is required'
//             });
//             return;
//         }
 
//         // Get package details
//         const packageDetails = await Package.findByPk(packageId);
//         if (!packageDetails) {
//             res.status(404).json({
//                 success: false,
//                 message: 'Package not found'
//             });
//             return;
//         }
 
//         // Get all available vehicle types instead of vehicles
//         const vehicleTypes = await VehicleType.findAll({
//             where: { isDeleted: false }
//         });
 
//         // Format vehicle types based on package type
//         const formattedVehicleTypes = vehicleTypes.map(vehicleType => {
//             const baseFields = {
//                 vehicleTypeId: vehicleType.vehicleTypeId,
//                 vehicleType: vehicleType.vehicleType,
//                 createdAt: vehicleType.createdAt
//             };
 
//             return baseFields;
//         });
       
//         res.status(200).json({
//             success: true,
//             message: "Vehicle Types Retrieved Successfully",
//             data: {
//                 packageInfo: packageDetails,
//                 vehicleTypes: formattedVehicleTypes, // Changed from vehicles to vehicleTypes
//                 totalCount: formattedVehicleTypes.length
//             }
//         });
 
//     } catch (error) {
//         console.error('Error fetching vehicle types by package ID:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Internal server error'
//         });
//     }
// };
export const getvehicleTypesByPackageId = async (req: any, res: Response) => {
  try {
    if (req.role === ROLES.USER) {
      return res.status(403).json({ message: "Not Authorized" });
    }

    const { packageId } = req.params;
    if (!packageId) {
      return res
        .status(400)
        .json({ success: false, message: "Package ID is required" });
    }

    const packageDetails = await Package.findByPk(packageId);
    if (!packageDetails) {
      return res
        .status(404)
        .json({ success: false, message: "Package not found" });
    }

    const comp = await Company.findByPk(packageDetails.companyId);
    const tenantId = req.tenantId || (packageDetails as any).tenantId || comp?.tenantId;

    // ✅ PUBLIC BOOKING: Return actual fleet vehicles from VehicleMaster with authoritative seatCapacity
    if (packageDetails.packageType === "PUBLIC_BOOKING" || packageDetails.packageType === "Public Booking") {
      const vmWhere: any = { isDeleted: 0 };
      if (tenantId && tenantId !== ROOT_TENANT_ID) {
        vmWhere.tenantId = tenantId;
      }

      const vehicleMasters = await VehicleMaster.findAll({
        where: vmWhere,
        include: [
          { model: Vehicle, as: "vehicle", required: false },
          { model: VehicleType, as: "vehicleTypes", required: false },
        ],
        order: [["vehicleModelName", "ASC"], ["vehicleNumber", "ASC"]],
      });

      let formattedVehicles: any[] = [];

      if (vehicleMasters.length > 0) {
        formattedVehicles = vehicleMasters.map((vm: any) => {
          const vt = vm.vehicleTypes;
          const v = vm.vehicle;
          const seatCapacity = vt?.seatCapacity ? Number(vt.seatCapacity) : 4;
          const vehicleImg = v?.vehicleImg || vt?.vehicleImg || null;

          return {
            vehicleMasterId: vm.vehicleMasterId,
            vehicleId: vm.vehicleId,
            vehicleTypeId: vm.vehicleTypeId,
            vehicleModelName: vm.vehicleModelName || v?.vehicleName || "Vehicle",
            vehicleNumber: vm.vehicleNumber,
            vehicleType: vm.vehicleType || vt?.vehicleType || "Cab",
            seatCapacity,
            vehicleImg,
            vendorName: vm.vendorName,
          };
        });
      } else {
        // Fallback: If no VehicleMaster records yet, load from Vehicle for this tenant
        const vWhere: any = { isDeleted: false };
        if (tenantId && tenantId !== ROOT_TENANT_ID) {
          vWhere.tenantId = tenantId;
        }

        const vehicles = await Vehicle.findAll({
          where: vWhere,
          include: [{ model: VehicleType, required: false }],
          order: [["vehicleName", "ASC"]],
        });

        formattedVehicles = vehicles.map((v: any) => {
          const vt = v.vehicleType;
          const seatCapacity = vt?.seatCapacity ? Number(vt.seatCapacity) : 4;
          return {
            vehicleMasterId: v.vehicleId,
            vehicleId: v.vehicleId,
            vehicleTypeId: v.vehicleTypeId,
            vehicleModelName: v.vehicleName,
            vehicleNumber: v.manufacturing || "Fleet Vehicle",
            vehicleType: vt?.vehicleType || "Cab",
            seatCapacity,
            vehicleImg: v.vehicleImg || vt?.vehicleImg || null,
          };
        });
      }

      return res.status(200).json({
        success: true,
        message: "Public Booking Vehicles Retrieved Successfully",
        data: {
          packageInfo: packageDetails,
          vehicleTypes: formattedVehicles, // backward compat
          vehicles: formattedVehicles,
          totalCount: formattedVehicles.length,
        },
      });
    }

    // ✅ STANDARD PACKAGES (Local City Use, Out Station, Monthly Bookings):
    // Scope by tenantId so cross-tenant vehicle types are never leaked or duplicated
    const vtWhere: any = { isDeleted: false };
    if (tenantId && tenantId !== ROOT_TENANT_ID) {
      vtWhere.tenantId = tenantId;
    }

    const vehicleTypes = await VehicleType.findAll({
      where: vtWhere,
      order: [["vehicleType", "ASC"]],
    });

    const formattedVehicleTypes = vehicleTypes.map((vt: any) => ({
      vehicleTypeId: vt.vehicleTypeId,
      vehicleType: vt.vehicleType,
      bookingType: vt.bookingType,
      seatCapacity: vt.seatCapacity || 4,
      createdAt: vt.createdAt,
    }));

    return res.status(200).json({
      success: true,
      message: "Vehicle Types Retrieved Successfully",
      data: {
        packageInfo: packageDetails,
        vehicleTypes: formattedVehicleTypes,
        totalCount: formattedVehicleTypes.length,
      },
    });
  } catch (error) {
    console.error("Error fetching vehicle types by package ID:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
// Get package by companyId and packageType
export const getPackageByCompanyAndType = async (req: Request, res: Response): Promise<void> => {
    try {
        const { companyId, packageType } = req.query;
 
        if (!companyId || !packageType) {
            res.status(400).json({
                success: false,
                message: "companyId and packageType are required"
            });
            return;
        }
 
        const validPackageTypes = ['Out Station', 'Local City Use'];
        if (!validPackageTypes.includes(String(packageType))) {
            res.status(400).json({
                success: false,
                message: 'Invalid packageType. Must be either "Out Station" or "Local City Use"'
            });
            return;
        }
 
        const existingPackage = await Package.findOne({
            where: {
                companyId: String(companyId),
                packageType: String(packageType),
                isDeleted: false
            }
        });
 
        if (!existingPackage) {
            res.status(404).json({
                success: false,
                message: "Package not found"
            });
            return;
        }
 
        res.status(200).json({
            success: true,
            message: "Package fetched successfully",
            data: existingPackage
        });
    } catch (error) {
        console.error("Error fetching package:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


