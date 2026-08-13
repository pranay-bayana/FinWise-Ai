const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/', auth, userController.getUser);
router.put('/', auth, userController.updateUser);
router.delete('/', auth, userController.deleteUser);

module.exports = router;
