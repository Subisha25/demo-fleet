import express from 'express';
import cors from "cors";
import { authMiddleware } from './middleware/authMiddleware';
import { tenantMiddleware } from './middleware/tenantMiddleware';
import authRoutes from './routes/authRoutes';
import tenantRoutes from './routes/tenantRoutes';
import empRoutes from './routes/empRoutes';
import userRoutes from './routes/userRoutes';
import vendorRoutes from './routes/vendorRoutes';
import driverRoutes from './routes/driverRoutes';
import locationRoutes from './routes/locationRoutes';

import vehicleRoutes from './routes/vehicleRoutes';
import vehicleTypeRoutes from './routes/vehicleTypeRoutes';

import fs from 'fs';
import ownerRoutes from './routes/ownerRoutes';
import orderRoutes from './routes/bookingRoutes';

import pickupCityRoutes from './routes/pickupCityRoutes';
import pickupAreaRoutes from './routes/pickupAreaRoutes';

import companyRoutes from './routes/companyRoutes';
import vehicleMasterRoute from './routes/vehicleMasterRoutes';

import appCreateBookingRoutes from './appRoutes/appCreateBookingRoutes';
import appRoutes from './appRoutes/appLoginRoutes';
import appInvoiceRoutes from './appRoutes/appInvoiceRoutes'


import path from 'path';

import paymentModeRoutes from './routes/paymentmodeRoutes';
import globalSearchRoutes from './routes/globalSearchRoutes';
import packageRoutes from './routes/packageRoutes';
import packageDataRoutes from './routes/packageDataRoutes'
import configurationRoutes  from './routes/configurationRoutes'
import userFilterRoutes from "./routes/userFilterRoutes";
import closePendingRoutes from "./routes/closependingRoutes";
import invoiceRoutes from "./routes/invoiceRoutes";
import emailConfRoutes from "./routes/emailConfRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import redirectRoute from './routes/redirectRoute';
import onCallRoutes from './routes/onCallRoutes';

import downloadPdf from './routes/downloadPdf';

import config from "../src/config/config"; 


const app = express();

app.use(express.json({
  limit: "5000mb"
}));

app.use(express.urlencoded({
  limit: "5000mb",
  extended: true,
  parameterLimit: 1000000
}));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use('/', redirectRoute);
 const BASE_URL = config.baseurl.apibaseurl;
 console.log("url ap ",BASE_URL);
// Sensitive uploads locked down: only public subdirectories (/uploads/vehicleImg, /uploads/companyLogo) are served publicly below

 const vehiclePath = path.join(__dirname, '..', 'uploads', 'vehicleImg');
console.log("Vehicle Static Path:", vehiclePath); // <-
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Dynamically allow requesting origin with credentials
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Tenant-ID", "x-tenant-id"]
}));

// Multi-tenant context resolution
app.use(tenantMiddleware);

app.use('/uploads/vehicleImg', express.static(path.join(__dirname, '..', '..', 'uploads', 'vehicleImg')));
// Protected: Signatures require authentication (Bearer token or ?token=)
app.use('/uploads/signature', authMiddleware, express.static(path.join(__dirname,  '..', '..', 'uploads', 'signature')));
app.use('/uploads/companyLogo', express.static(path.join(__dirname,   '..', '..','uploads', 'companyLogo'))); 

app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/public', tenantRoutes);
app.use('/api/admin', tenantRoutes);
app.use('/api/emp', empRoutes);
app.use('/api/user', userRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/driver',driverRoutes);
app.use('/api/location',locationRoutes)

app.use('/api/vehicle',vehicleRoutes);
app.use('/api/vehicleType',vehicleTypeRoutes);
app.use('/api/owner',ownerRoutes);
app.use('/api/order',orderRoutes);


app.use('/api/city',pickupCityRoutes);
app.use('/api/area',pickupAreaRoutes);

app.use('/api/company',companyRoutes);


// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/vehicleMaster',vehicleMasterRoute);

app.use('/app/appCreateBookingRoutes',appCreateBookingRoutes);
app.use('/app/appRoutes',appRoutes);

app.use(
  '/oncallinvoice',
  authMiddleware,
  express.static(
    path.join(process.cwd(), 'uploads', 'oncallinvoice'),
    {
      setHeaders: (res, filePath) => {

        if (filePath.endsWith('.pdf')) {

          res.setHeader(
            'Content-Type',
            'application/pdf'
          );

          res.setHeader(
            'Content-Disposition',
            'inline'
          );

        }

        if (
          filePath.endsWith('.html') ||
          filePath.endsWith('.htm')
        ) {

          res.setHeader(
            'Content-Type',
            'text/html'
          );

        }

      }
    }
  )
);

app.use(
  '/invoices',
  authMiddleware,
  express.static(
    path.join(process.cwd(), 'uploads', 'invoices')
  )
);

app.use('/app/appInvoiceRoutes',appInvoiceRoutes);

app.use('/api/paymentmode',paymentModeRoutes)
app.use('/api', globalSearchRoutes);
app.use('/api/package',packageRoutes);
app.use('/api/packageData',packageDataRoutes);
app.use('/api/config',configurationRoutes)
app.use('/api/filter', userFilterRoutes );
app.use('/api/closePendingOrder',closePendingRoutes );
app.use('/api/invoiceRoutes',invoiceRoutes );

app.use('/api/downloadPdf',downloadPdf );

app.use('/api/emailConfRoutes',emailConfRoutes );

app.use('/api/paymentRoutes',paymentRoutes);
app.use('/api/oncallinvoice',onCallRoutes);
// Short redirect route for SMS short codes

export default app;
