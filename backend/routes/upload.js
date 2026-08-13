const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const auth = require('../middleware/auth');

router.post('/single', auth, uploadController.upload.single('file'), uploadController.uploadFile);
router.post('/multiple', auth, uploadController.upload.array('files', 5), uploadController.uploadMultipleFiles);
router.delete('/', auth, uploadController.deleteFile);

module.exports = router;
