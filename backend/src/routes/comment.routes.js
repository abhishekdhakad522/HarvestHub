import express from 'express';
import {
    createComment,
    getCommentsByPost,
    updateComment,
    deleteComment,
    toggleLike
} from '../controllers/comment.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/post/:postId', getCommentsByPost);

// Protected routes (require authentication)
router.post('/create', verifyToken, createComment);
router.put('/update/:id', verifyToken, updateComment);
router.delete('/delete/:id', verifyToken, deleteComment);
router.post('/like/:id', verifyToken, toggleLike);

export default router;
