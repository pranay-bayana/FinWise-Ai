// src/routes/authRoutes.js
import express from 'express';
import { signup, login, googleLogin, supabaseOAuthLogin, logout, verify, forgotPassword, resetPassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/supabase', supabaseOAuthLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify', protect, verify);
router.get('/logout', protect, logout);

export default router;
