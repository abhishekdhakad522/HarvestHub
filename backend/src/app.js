import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import postRoutes from './routes/post.routes.js';
import productRoutes from './routes/product.routes.js';
import cartRoutes from './routes/cart.routes.js';
import commentRoutes from './routes/comment.routes.js';
import orderRoutes from './routes/order.routes.js';
    
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

// app.get('/', (req, res) => {
//   res.send('Hello from Harvest Hub');
// });

export default app;
