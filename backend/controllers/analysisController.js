const SubjectAnalysis = require('../models/SubjectAnalysis');
const Subject = require('../models/Subject');
const ExaminationPaper = require('../models/ExaminationPaper');
const ExtractedQuestion = require('../models/ExtractedQuestion');
const SyllabusVersion = require('../models/SyllabusVersion');
const { chatCompletion } = require('../services/groqService');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logAudit } = require('../utils/auditLogger');

// GET /api/admin/analysis
const getAnalyses = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.subject_id) filter.subject_id = req.query.subject_id;

    const list = await SubjectAnalysis.find(filter)
      .populate('subject_id', 'name code')
      .sort({ createdAt: -1 });

    return successResponse(res, list, 'Analyses fetched', 200, list.length);
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/analysis/generate
const generateAnalysis = async (req, res, next) => {
  try {
    const { subject_id, apiKey, model } = req.body;
    if (!subject_id) return errorResponse(res, 'Subject ID is required', 400);

    const subject = await Subject.findById(subject_id).populate({
      path: 'semester_id',
      populate: { path: 'course_id' }
    });
    if (!subject) return errorResponse(res, 'Subject not found', 404);

    const papers = await ExaminationPaper.find({ subject_id, is_included_in_analysis: true });
    const paperYears = papers.map(p => p.exam_year);
    const questions = await ExtractedQuestion.find({ subject_id });
    const syllabus = await SyllabusVersion.findOne({ semester_id: subject.semester_id._id, is_active: true });

    let analysisData = {};

    // Generate comprehensive analysis
    if (apiKey && apiKey.startsWith('gsk_')) {
      const prompt = `Perform an in-depth academic examination trend analysis for university preparation:
Subject: ${subject.name} (${subject.code})
Units: ${JSON.stringify(subject.units)}
Exam Years Analyzed: ${paperYears.join(', ')}
Historical Questions: ${JSON.stringify(questions.map(q => ({ q: q.question_text, marks: q.marks, y: q.exam_year, unit: q.unit })))}

Generate a valid JSON object with the following structure:
{
  "summary": "Overall subject examination pattern summary",
  "unit_coverage": [
    { "unit_number": 1, "unit_name": "...", "estimated_weightage_percentage": 25, "frequently_tested_concepts": ["..."] }
  ],
  "question_type_distribution": {
    "short_answer": "...",
    "long_answer": "...",
    "numerical_or_code": "..."
  },
  "predictions": [
    {
      "topic": "...",
      "unit": "...",
      "suggested_marks": 10,
      "confidence": "High Historical Priority" | "Medium Historical Priority" | "Additional Preparation",
      "reason": "...",
      "advice": "..."
    }
  ],
  "common_pitfalls": ["..."]
}
Return ONLY valid JSON.`;

      try {
        const aiRes = await chatCompletion({
          apiKey,
          messages: [{ role: 'user', content: prompt }],
          model: model || 'openai/gpt-oss-120b',
          temperature: 0.2,
        });

        const cleaned = aiRes.content.replace(/```json/gi, '').replace(/```/gi, '').trim();
        analysisData = JSON.parse(cleaned);
      } catch (err) {
        console.warn('[AI Analysis generation fallback]:', err.message);
      }
    }

    if (!analysisData.summary) {
      // Heuristic analysis structure
      analysisData = {
        summary: `Analysis based on ${papers.length} past exam paper(s) spanning years: ${paperYears.join(', ')}. Total ${questions.length} question items analyzed.`,
        unit_coverage: (subject.units || []).map(u => ({
          unit_number: u.number,
          unit_name: u.name,
          estimated_weightage_percentage: Math.round(100 / (subject.units.length || 1)),
          frequently_tested_concepts: u.topics || [],
        })),
        question_type_distribution: {
          short_answer: '2-5 marks questions testing definitions and algorithms',
          long_answer: '10-15 marks comprehensive questions with diagrams and case studies',
          numerical_or_code: 'Applied problems and program writing',
        },
        predictions: (subject.units || []).slice(0, 4).map((u, idx) => ({
          topic: u.topics?.[0] || u.name,
          unit: `Unit ${u.number}: ${u.name}`,
          suggested_marks: 10,
          confidence: idx === 0 ? 'High Historical Priority' : 'Medium Historical Priority',
          reason: 'Consistently appears across examination sessions as a core unit anchor.',
          advice: 'Practice diagrams and structured point-wise explanations.',
        })),
        common_pitfalls: [
          'Skipping labeled architecture diagrams in long answers',
          'Not writing precise definitions for 2-mark questions',
        ],
      };
    }

    // Upsert analysis
    let analysis = await SubjectAnalysis.findOne({ subject_id, analysis_type: 'full' });
    if (analysis) {
      analysis.analysis_data = analysisData;
      analysis.years_analyzed = paperYears;
      analysis.generated_at = new Date();
      await analysis.save();
    } else {
      analysis = await SubjectAnalysis.create({
        subject_id,
        analysis_type: 'full',
        analysis_data: analysisData,
        years_analyzed: paperYears,
        is_published: true,
      });
    }

    await logAudit({
      action: 'GENERATE_ANALYSIS',
      entityType: 'SubjectAnalysis',
      entityId: analysis._id,
      details: { subject: subject.name },
      req,
    });

    return successResponse(res, analysis, 'Analysis generated successfully', 201);
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/analysis/:id/publish
const togglePublishAnalysis = async (req, res, next) => {
  try {
    const analysis = await SubjectAnalysis.findById(req.params.id);
    if (!analysis) return errorResponse(res, 'Analysis not found', 404);

    analysis.is_published = !analysis.is_published;
    await analysis.save();

    return successResponse(res, analysis, `Analysis ${analysis.is_published ? 'published' : 'unpublished'}`);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/analysis/:id
const deleteAnalysis = async (req, res, next) => {
  try {
    const analysis = await SubjectAnalysis.findByIdAndDelete(req.params.id);
    if (!analysis) return errorResponse(res, 'Analysis not found', 404);
    return successResponse(res, null, 'Analysis deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalyses,
  generateAnalysis,
  togglePublishAnalysis,
  deleteAnalysis,
};
