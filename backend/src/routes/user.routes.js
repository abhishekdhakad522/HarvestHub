import express from 'express';
import { updateProfile, getUserProfile, deleteUserAccount, logoutUser, getAllUsers } from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes are protected - require authentication
router.get('/logout', verifyToken, logoutUser);
router.get('/profile', verifyToken, getUserProfile);
router.get('/all', verifyToken, getAllUsers);
router.put('/update', verifyToken, updateProfile);
router.delete('/delete', verifyToken, deleteUserAccount);

export default router;
