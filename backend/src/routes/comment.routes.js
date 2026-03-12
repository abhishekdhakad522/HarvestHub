import express from 'express';
import {
    createComment,
    getCommentsByPost,
    getCommentById,
    updateComment,
    deleteComment,
    getMyComments,
    toggleLike
} from '../controllers/comment.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/post/:postId', getCommentsByPost);
router.get('/:id', getCommentById);

// Protected routes (require authentication)
router.post('/create', verifyToken, createComment);
router.get('/my/comments', verifyToken, getMyComments);
router.put('/update/:id', verifyToken, updateComment);
router.delete('/delete/:id', verifyToken, deleteComment);
router.post('/like/:id', verifyToken, toggleLike);

export default router;
