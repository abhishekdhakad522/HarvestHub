import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart
} from '../controllers/cart.controller.js';

const router = express.Router();

// All cart routes require authentication
router.post('/add', verifyToken, addToCart);
router.get('/', verifyToken, getCart);
router.put('/update', verifyToken, updateCartItem);
router.delete('/remove/:productId', verifyToken, removeFromCart);
router.delete('/clear', verifyToken, clearCart);

export default router;
