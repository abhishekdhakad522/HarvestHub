import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { 
    createProduct, 
    getAllProducts, 
    getProductById, 
    updateProduct, 
    deleteProduct, 
    getMyProducts 
} from '../controllers/product.controller.js';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Protected routes (require authentication)
router.post('/create', verifyToken, createProduct);
router.put('/update/:id', verifyToken, updateProduct);
router.delete('/delete/:id', verifyToken, deleteProduct);
router.get('/my/products', verifyToken, getMyProducts);

export default router;
