const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBookById,
  uploadBook,
  inspectBookPdf,
  updateBook,
  deleteBook,
  processBookText,
  viewBookPdf,
  downloadBookPdf,
} = require('../controllers/bookController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Admin protected routes
router.get('/', protect, getBooks);
router.post('/upload', protect, upload.single('file'), uploadBook);
router.post('/inspect', protect, upload.single('file'), inspectBookPdf);
router.get('/:id', protect, getBookById);
router.put('/:id', protect, updateBook);
router.delete('/:id', protect, deleteBook);
router.post('/:id/process', protect, processBookText);

// Direct streaming & download (accessible with or without token)
router.get('/:id/view', viewBookPdf);
router.get('/:id/download', downloadBookPdf);

module.exports = router;
