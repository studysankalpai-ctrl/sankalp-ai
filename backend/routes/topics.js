const express = require('express');
const router = express.Router();
const {
  getTopics,
  generateTopics,
  updateTopic,
  togglePublishTopic,
  deleteTopic,
} = require('../controllers/topicController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getTopics);
router.post('/generate', generateTopics);
router.put('/:id', updateTopic);
router.put('/:id/publish', togglePublishTopic);
router.delete('/:id', deleteTopic);

module.exports = router;
