const express = require('express');
const router = express.Router();
const {
  getQuestions,
  updateQuestion,
  verifyQuestion,
  deleteQuestion,
} = require('../controllers/questionController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getQuestions);
router.put('/:id', updateQuestion);
router.put('/:id/verify', verifyQuestion);
router.delete('/:id', deleteQuestion);

module.exports = router;
