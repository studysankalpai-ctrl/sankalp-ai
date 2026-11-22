const express = require('express');
const router = express.Router();
const {
  getSyllabusList,
  uploadSyllabus,
  activateSyllabus,
  archiveSyllabus,
  triggerProcessSyllabus,
} = require('../controllers/syllabusController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.get('/', getSyllabusList);
router.post('/upload', upload.single('file'), uploadSyllabus);
router.put('/:id/activate', activateSyllabus);
router.put('/:id/archive', archiveSyllabus);
router.post('/:id/process', triggerProcessSyllabus);

module.exports = router;
