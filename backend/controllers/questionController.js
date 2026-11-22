const ExtractedQuestion = require('../models/ExtractedQuestion');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logAudit } = require('../utils/auditLogger');

// GET /api/admin/questions
const getQuestions = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.paper_id) filter.paper_id = req.query.paper_id;
    if (req.query.subject_id) filter.subject_id = req.query.subject_id;
    if (req.query.exam_year) filter.exam_year = parseInt(req.query.exam_year, 10);
    if (req.query.is_verified !== undefined) filter.is_verified = req.query.is_verified === 'true';

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const [questions, total] = await Promise.all([
      ExtractedQuestion.find(filter)
        .populate('subject_id', 'name code')
        .populate('paper_id', 'exam_year exam_type')
        .sort({ exam_year: -1, question_number: 1 })
        .skip(skip)
        .limit(limit),
      ExtractedQuestion.countDocuments(filter),
    ]);

    return successResponse(res, {
      questions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    }, 'Extracted questions fetched', 200, questions.length);
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/questions/:id
const updateQuestion = async (req, res, next) => {
  try {
    const { question_number, question_text, marks, question_type, unit, topic, is_verified } = req.body;
    const q = await ExtractedQuestion.findById(req.params.id);
    if (!q) return errorResponse(res, 'Question not found', 404);

    if (question_number !== undefined) q.question_number = question_number;
    if (question_text) q.question_text = question_text.trim();
    if (marks !== undefined) q.marks = marks ? parseInt(marks, 10) : null;
    if (question_type) q.question_type = question_type;
    if (unit !== undefined) q.unit = unit;
    if (topic !== undefined) q.topic = topic;
    if (is_verified !== undefined) q.is_verified = is_verified;

    await q.save();

    await logAudit({
      action: 'UPDATE_QUESTION',
      entityType: 'ExtractedQuestion',
      entityId: q._id,
      details: { question_number: q.question_number, marks: q.marks },
      req,
    });

    return successResponse(res, q, 'Question updated successfully');
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/questions/:id/verify
const verifyQuestion = async (req, res, next) => {
  try {
    const q = await ExtractedQuestion.findById(req.params.id);
    if (!q) return errorResponse(res, 'Question not found', 404);

    q.is_verified = true;
    await q.save();

    return successResponse(res, q, 'Question verified');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/questions/:id
const deleteQuestion = async (req, res, next) => {
  try {
    const q = await ExtractedQuestion.findById(req.params.id);
    if (!q) return errorResponse(res, 'Question not found', 404);

    await ExtractedQuestion.findByIdAndDelete(q._id);

    return successResponse(res, null, 'Question deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuestions,
  updateQuestion,
  verifyQuestion,
  deleteQuestion,
};
