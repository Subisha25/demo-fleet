import express from 'express';
import path from 'path';
import {uploadUsersFromExcel, getCurrentUser, getUserProfile, updateUserProfile, changeUserPassword, uploadProfileImage, getPublicContactInfo, getUsersByStatus, getAllUsers, getUserById, updateUser,updateUserStatus, deleteUser,logout, getAllUserByCompany,
    getUsersByConfirmationStatus, getUsersByGender, confirmUser, addNewAddress, 
    getUserAddresses, getUserByManager, updateUserAddress, deleteUserAddress, restoreUser, permanentDeleteUser,
    getCompanyManagers,
    getMapCount,
    appMapCount,
    getManagerDetailsByUserId,
    getUsersByCompany
 } from '../services/userServices';
import { authMiddleware } from '../middleware/authMiddleware';
import { requirePaidForModification } from '../middleware/entitlementMiddleware';
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Dedicated safe profile image upload storage & validation (JPEG/PNG/WebP, max 2MB)
const profileStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads', 'profileImg'));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `profile_${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`);
  },
});

const profileUpload = multer({
  storage: profileStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed.'));
    }
  },
});

// Protected routes (authentication required)
router.post("/upload-users", authMiddleware, requirePaidForModification, upload.single("file"), uploadUsersFromExcel);

router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);
router.put('/profile/password', authMiddleware, changeUserPassword);
router.post('/profile/image', authMiddleware, profileUpload.single('image'), uploadProfileImage);
router.get('/public/contact-info', getPublicContactInfo);
router.get('/getCurrentUser', authMiddleware, getCurrentUser);
router.get('/getUsersByStatus/:status', authMiddleware, getUsersByStatus);
router.post('/logout', logout);

router.get('/getAllUsers', authMiddleware, getAllUsers);

router.get('/getAllUserByCompany/:companyId',authMiddleware, getAllUserByCompany);

router.get('/getUsersByConfirmationStatus/:confirmed', authMiddleware, getUsersByConfirmationStatus); 
router.get('/getUsersByGender/:gender', authMiddleware, getUsersByGender); 
router.put('/confirmUser/:id', authMiddleware, confirmUser); 

router.get('/:id',authMiddleware, getUserById);
 
router.put('/updateUser/:id', authMiddleware, requirePaidForModification, updateUser);
router.put('/:id/status', authMiddleware, requirePaidForModification, updateUserStatus);
router.delete('/deleteUser/:id', authMiddleware, requirePaidForModification, deleteUser);

router.post('/:id/address', authMiddleware, addNewAddress);
router.get('/:id/addresses', authMiddleware, getUserAddresses);
router.put('/:id/address/:idx', authMiddleware, updateUserAddress);
router.delete('/:id/address/:idx', authMiddleware, deleteUserAddress);


router.get('/:userId/getUsersManager', authMiddleware, getUserByManager);

router.put('/restoreUser/:id', authMiddleware, requirePaidForModification, restoreUser);
router.delete('/permanentDeleteUser/:id', authMiddleware, requirePaidForModification, permanentDeleteUser);
router.get("/company/:companyId/managers", authMiddleware, getCompanyManagers);

router.put("/app/appMapCount", appMapCount);

router.get("/getManagerByUserId/:userId", authMiddleware, getManagerDetailsByUserId);
router.get("/getUsersByCompany/:companyId", authMiddleware, getUsersByCompany);


export default router;