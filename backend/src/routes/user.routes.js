import express from 'express';
import { updateProfile, getUserProfile, getCurrentUserOptional, deleteUserAccount, logoutUser, getAllUsers } from '../controllers/user.controller.js';
import { verifyToken, optionalVerifyToken } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

// All routes are protected - require authentication
router.get('/logout', verifyToken, logoutUser);
router.get('/profile', verifyToken, getUserProfile);
router.get('/profile/optional', optionalVerifyToken, getCurrentUserOptional);
router.get('/all', verifyToken, getAllUsers);
router.put('/update', verifyToken, upload.single('profilePicture'), updateProfile);
router.delete('/delete', verifyToken, deleteUserAccount);

export default router;
