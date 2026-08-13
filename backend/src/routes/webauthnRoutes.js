// src/routes/webauthnRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { finishLogin, finishRegistration, startLogin, startRegistration } from '../controllers/webauthnController.js';

const router = express.Router();

router.post('/register/options', protect, startRegistration);
router.post('/register/verify', protect, finishRegistration);

router.post('/login/options', startLogin);
router.post('/login/verify', finishLogin);

export default router;

