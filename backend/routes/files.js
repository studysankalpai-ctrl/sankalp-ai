const express = require('express');
const router = express.Router();
const {
  uploadFile,
  getFileById,
  viewFile,
  downloadFile,
  deleteFile,
} = require('../controllers/fileController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', protect, upload.single('file'), uploadFile);
router.get('/:id', getFileById);
router.get('/:id/view', viewFile);
router.get('/:id/download', downloadFile);
router.delete('/:id', protect, deleteFile);

module.exports = router;
