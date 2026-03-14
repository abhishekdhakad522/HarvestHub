import express from 'express';
import { uploadImage, deleteImage } from '../controllers/upload.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

// Protected routes (require authentication)
router.post('/upload', verifyToken, upload.single('image'), uploadImage);
router.delete('/image', verifyToken, deleteImage);

export default router;
