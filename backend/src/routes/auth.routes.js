import express from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/auth.controller.js';
const router = express.Router();

router.post('/user/register', registerUser);
router.post('/user/login', loginUser);
router.get('/user/logout',logoutUser);

export default router;