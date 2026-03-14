import express from 'express';
import {
    createPost,
    getAllPosts,
    getPostBySlug,
    getPostById,
    incrementPostViews,
    updatePost,
    deletePost,
    getMyPosts
} from '../controllers/post.controller.js';
import { optionalVerifyToken, verifyToken } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllPosts);
router.get('/slug/:slug', optionalVerifyToken, getPostBySlug);
router.post('/:id/view', optionalVerifyToken, incrementPostViews);
router.get('/:id', getPostById);

// Protected routes (require authentication)
router.post('/create', verifyToken, upload.single('image'), createPost);
router.get('/my/posts', verifyToken, getMyPosts);
router.put('/update/:id', verifyToken, upload.single('image'), updatePost);
router.delete('/delete/:id', verifyToken, deletePost);

export default router;
