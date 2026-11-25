/**
 * SANKALP AI - Autonomous University Examination Preparation Platform
 * Coding Practice Lab Routes
 */

const express = require('express');
const router = express.Router();
const {
  runCode,
  submitSolution,
  getProblems,
  getProblemBySlug,
  saveCode,
  getSavedCode,
  getStudentProgress,
  getSubmissions,
  requestAiAssist,
  getLanguageConfigs,
} = require('../controllers/codingLabController');
const { codingExecutionLimiter, aiLimiter } = require('../middleware/rateLimiter');

// Execution & Submission
router.post('/execute', codingExecutionLimiter, runCode);
router.post('/submit', codingExecutionLimiter, submitSolution);

// Problems & Catalogs
router.get('/problems', getProblems);
router.get('/problems/:slug', getProblemBySlug);
router.get('/languages', getLanguageConfigs);

// Student Code Persistence
router.post('/save-code', saveCode);
router.get('/saved-code', getSavedCode);

// Analytics, Progress & Submissions
router.get('/progress/:student_id', getStudentProgress);
router.get('/submissions', getSubmissions);

// AI Coding Assistant
router.post('/ai-assist', aiLimiter, requestAiAssist);

module.exports = router;
