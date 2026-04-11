import express from 'express';
import {
    createOrder,
    createRazorpayOrder,
    verifyRazorpayPayment,
    getMyOrders,
    getOrderById,
    getSellerOrders,
    updateOrderStatus,
    cancelOrder
} from '../controllers/order.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.post('/create', verifyToken, createOrder);
router.post('/create-razorpay-order', verifyToken, createRazorpayOrder);
router.post('/verify-razorpay-payment', verifyToken, verifyRazorpayPayment);
router.get('/my-orders', verifyToken, getMyOrders);
router.get('/seller-orders', verifyToken, getSellerOrders);
router.get('/:id', verifyToken, getOrderById);
router.put('/update-status/:id', verifyToken, updateOrderStatus);
router.put('/cancel/:id', verifyToken, cancelOrder);

export default router;
