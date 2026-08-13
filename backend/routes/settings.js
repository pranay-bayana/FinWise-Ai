const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const auth = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

router.get('/', auth, settingsController.getSettings);
router.put('/', auth, settingsController.updateSettings);
router.get('/profile', auth, settingsController.getProfile);
router.put('/profile', auth, settingsController.updateProfile);
router.put(
  '/password',
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 })
  ],
  validate,
  auth,
  settingsController.changePassword
);

module.exports = router;
