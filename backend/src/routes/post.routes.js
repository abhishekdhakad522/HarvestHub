import express from 'express';
import {
    createPost,
    getAllPosts,
    getPostBySlug,
    getPostById,
    updatePost,
    deletePost,
    getMyPosts
} from '../controllers/post.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllPosts);
router.get('/slug/:slug', getPostBySlug);
router.get('/:id', getPostById);

// Protected routes (require authentication)
router.post('/create', verifyToken, createPost);
router.get('/my/posts', verifyToken, getMyPosts);
router.put('/update/:id', verifyToken, updatePost);
router.delete('/delete/:id', verifyToken, deletePost);

export default router;
