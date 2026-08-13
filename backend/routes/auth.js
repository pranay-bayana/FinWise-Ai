const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

// Register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('fullName').trim().notEmpty()
  ],
  validate,
  authController.register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  validate,
  authController.login
);

// Google OAuth
router.post('/google', authController.googleLogin);

// Biometric Login
router.post('/biometric', authController.biometricLogin);

// Verify Token
router.get('/verify', auth, authController.verifyToken);

module.exports = router;
