/**
 * SANKALP AI - Autonomous Business Case Study Simulation Routes
 */

const express = require('express');
const router = express.Router();
const {
  generateCase,
  simulateTurn,
  evaluateSimulation,
  getPresets,
} = require('../controllers/caseStudyController');
const { aiLimiter } = require('../middleware/rateLimiter');

// Case Generation & Presets
router.get('/presets', getPresets);
router.post('/generate', aiLimiter, generateCase);

// Turn Simulation
router.post('/simulate', aiLimiter, simulateTurn);

// Cognitive Thinking Evaluation
router.post('/evaluate', aiLimiter, evaluateSimulation);

module.exports = router;
