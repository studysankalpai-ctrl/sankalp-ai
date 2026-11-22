const express = require('express');
const router = express.Router();
const {
  getPapers,
  uploadPaper,
  updatePaper,
  deletePaper,
  triggerProcessPaper,
} = require('../controllers/paperController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.get('/', getPapers);
router.post('/upload', upload.single('file'), uploadPaper);
router.put('/:id', updatePaper);
router.delete('/:id', deletePaper);
router.post('/:id/process', triggerProcessPaper);

module.exports = router;
