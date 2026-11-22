const express = require('express');
const router = express.Router();
const {
  getAnalyses,
  generateAnalysis,
  togglePublishAnalysis,
  deleteAnalysis,
} = require('../controllers/analysisController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getAnalyses);
router.post('/generate', generateAnalysis);
router.put('/:id/publish', togglePublishAnalysis);
router.delete('/:id', deleteAnalysis);

module.exports = router;
