import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';
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

// Protected routes (require authentication)
router.post('/create', verifyToken, upload.single('image'), createProduct);
router.put('/update/:id', verifyToken, upload.single('image'), updateProduct);
router.delete('/delete/:id', verifyToken, deleteProduct);
router.get('/my/products', verifyToken, getMyProducts);

// Public single product route
router.get('/:id', getProductById);
export default router;
