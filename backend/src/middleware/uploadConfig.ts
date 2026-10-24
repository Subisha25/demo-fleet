import multer from "multer";
import path from "path";
import fs from "fs";
import { tenantStorage } from "../context/tenantContext";

function wrapMulterWithContext(multerInstance: multer.Multer) {
  return {
    single: (fieldName: string) => (req: any, res: any, next: any) => {
      multerInstance.single(fieldName)(req, res, (err: any) => {
        if (req.tenantContext) {
          tenantStorage.run(req.tenantContext, () => next(err));
        } else {
          next(err);
        }
      });
    },
    array: (fieldName: string, maxCount?: number) => (req: any, res: any, next: any) => {
      multerInstance.array(fieldName, maxCount)(req, res, (err: any) => {
        if (req.tenantContext) {
          tenantStorage.run(req.tenantContext, () => next(err));
        } else {
          next(err);
        }
      });
    },
    fields: (fields: any[]) => (req: any, res: any, next: any) => {
      multerInstance.fields(fields)(req, res, (err: any) => {
        if (req.tenantContext) {
          tenantStorage.run(req.tenantContext, () => next(err));
        } else {
          next(err);
        }
      });
    },
    none: () => (req: any, res: any, next: any) => {
      multerInstance.none()(req, res, (err: any) => {
        if (req.tenantContext) {
          tenantStorage.run(req.tenantContext, () => next(err));
        } else {
          next(err);
        }
      });
    },
    any: () => (req: any, res: any, next: any) => {
      multerInstance.any()(req, res, (err: any) => {
        if (req.tenantContext) {
          tenantStorage.run(req.tenantContext, () => next(err));
        } else {
          next(err);
        }
      });
    },
  };
}

// Generic folder creator
function createStorage(folderName: string) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, "..", "..", "uploads", folderName);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    }
  });

  const upload = multer({
    storage,
    limits: { fileSize: 1 * 1024 * 1024 },  // 1 MB limit
  });

  return wrapMulterWithContext(upload);
}

export const uploadVehicleImg = createStorage("vehicleImg");
export const uploadSignature = createStorage("signature");
export const uploadCompanyLogo = createStorage("companyLogo");
export const uploadFleetLogo = createStorage("fleetLogo");
