import express from 'express';
import { registerUser, loginUser,  throughGoogle } from '../controllers/auth.controller.js';
const router = express.Router();

router.post('/user/register', registerUser);
router.post('/user/login', loginUser);
router.post('/user/google', throughGoogle);


export default router;