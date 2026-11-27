/**
 * SANKALP AI - Autonomous Business Case Study Simulation Controller
 */

const caseStudyAiService = require('../services/caseStudyAiService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * 1. Generate or Retrieve Case Dilemma
 */
const generateCase = async (req, res, next) => {
  try {
    const domain = req.body.domain || 'startup';
    const customTopic = req.body.customTopic || req.body.topic || '';
    const apiKey = req.body.apiKey || req.body.groqApiKey || process.env.GROQ_API_KEY;
    const model = req.body.model || req.body.groqModel;

    const caseData = await caseStudyAiService.generateCaseStudy({
      domain,
      customTopic,
      apiKey,
      model,
    });

    return successResponse(res, caseData, 'Case dilemma generated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Simulate Turn ("30 Days Later...")
 */
const simulateTurn = async (req, res, next) => {
  try {
    const { scenario, current_vitals, turn_number, student_decision, decision_history } = req.body;
    const apiKey = req.body.apiKey || req.body.groqApiKey || process.env.GROQ_API_KEY;
    const model = req.body.model || req.body.groqModel;

    if (!scenario || !student_decision) {
      return errorResponse(res, 'Scenario and student decision are required.', 400);
    }

    const simulationResult = await caseStudyAiService.simulateTurn({
      scenario,
      current_vitals: current_vitals || scenario.financial_vitals,
      turn_number: turn_number || 1,
      student_decision,
      decision_history: decision_history || [],
      apiKey,
      model,
    });

    return successResponse(res, simulationResult, 'Turn simulated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Evaluate Simulation (Thinking Audit)
 */
const evaluateSimulation = async (req, res, next) => {
  try {
    const { scenario, decisions, history, final_vitals } = req.body;
    const apiKey = req.body.apiKey || req.body.groqApiKey || process.env.GROQ_API_KEY;
    const model = req.body.model || req.body.groqModel;

    if (!scenario || !decisions) {
      return errorResponse(res, 'Scenario and decisions are required for evaluation.', 400);
    }

    const evaluation = await caseStudyAiService.evaluateSimulation({
      scenario,
      decisions,
      history: history || [],
      final_vitals: final_vitals || scenario.financial_vitals,
      apiKey,
      model,
    });

    return successResponse(res, evaluation, 'Simulation evaluation generated');
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Get Curated Preset Cases
 */
const getPresets = (req, res) => {
  return successResponse(res, caseStudyAiService.PRESET_CASES, 'Curated preset cases retrieved');
};

module.exports = {
  generateCase,
  simulateTurn,
  evaluateSimulation,
  getPresets,
};
