import express from 'express';
import { registerUser, loginUser } from '../controllers/auth.controller.js';
const router = express.Router();

router.post('/user/register', registerUser);
router.post('/user/login', loginUser);

export default router;