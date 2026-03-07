import express from 'express';
import { registerUser, loginUser, logoutUser, throughGoogle } from '../controllers/auth.controller.js';
const router = express.Router();

router.post('/user/register', registerUser);
router.post('/user/login', loginUser);
router.get('/user/logout', logoutUser);
router.post('/user/google', throughGoogle);

export default router;