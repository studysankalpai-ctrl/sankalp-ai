const express = require('express');
const router = express.Router();
const {
  testGroqConnection,
  fetchModels,
  mentorChat,
  generateQuestions,
  generateAnswer,
  generateAnalogy,
  evaluateAnswer,
  generateStudyPlan,
  generatePredictions,
  generateRevisionNotes,
  generateFlashcards,
  generateFinalPaper,
} = require('../controllers/aiController');
const { startVivaSession, respondVivaTurn } = require('../controllers/vivaController');
const { generateTopics } = require('../controllers/topicController');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(aiLimiter);

router.post('/test-connection', testGroqConnection);
router.post('/models', fetchModels);
router.post('/chat', mentorChat);
router.post('/generate-questions', generateQuestions);
router.post('/generate-answer', generateAnswer);
router.post('/generate-analogy', generateAnalogy);
router.post('/evaluate', evaluateAnswer);
router.post('/study-plan', generateStudyPlan);
router.post('/predictions', generatePredictions);
router.post('/revision-notes', generateRevisionNotes);
router.post('/flashcards', generateFlashcards);
router.post('/generate-final-paper', generateFinalPaper);
router.post('/generate-topics', generateTopics);
router.post('/viva/start', startVivaSession);
router.post('/viva/respond', respondVivaTurn);

module.exports = router;
