import express from 'express';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import postRoutes from './routes/post.routes.js';
import productRoutes from './routes/product.routes.js';
import cartRoutes from './routes/cart.routes.js';
import commentRoutes from './routes/comment.routes.js';
import orderRoutes from './routes/order.routes.js';
import uploadRoutes from './routes/upload.routes.js';
    
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/images', uploadRoutes);

// Centralized error handler for file uploads and route errors
app.use((err, req, res, next) => {
	if (err instanceof multer.MulterError) {
		if (err.code === 'LIMIT_FILE_SIZE') {
			return res.status(400).json({ message: 'Image is too large. Maximum size is 5MB.' });
		}
		return res.status(400).json({ message: err.message || 'Upload error' });
	}

	if (err) {
		return res.status(500).json({ message: err.message || 'Internal server error' });
	}

	next();
});

// app.get('/', (req, res) => {
//   res.send('Hello from Harvest Hub');
// });

export default app;
