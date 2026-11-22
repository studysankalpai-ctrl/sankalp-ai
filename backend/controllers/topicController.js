const ImportantTopic = require('../models/ImportantTopic');
const Subject = require('../models/Subject');
const ExtractedQuestion = require('../models/ExtractedQuestion');
const ExaminationPaper = require('../models/ExaminationPaper');
const SyllabusVersion = require('../models/SyllabusVersion');
const { chatCompletion } = require('../services/groqService');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logAudit } = require('../utils/auditLogger');

// GET /api/admin/topics
const getTopics = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.subject_id) filter.subject_id = req.query.subject_id;
    if (req.query.priority) filter.priority = req.query.priority;

    const topics = await ImportantTopic.find(filter)
      .populate('subject_id', 'name code')
      .sort({ priority: 1, historical_appearances: -1 });

    return successResponse(res, topics, 'Important topics fetched', 200, topics.length);
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/topics/generate
// Analyzes syllabus units and questions to generate or compute important topics
const generateTopics = async (req, res, next) => {
  try {
    const subject_id = req.body.subject_id || req.body.subjectId;
    const { apiKey, model } = req.body;
    if (!subject_id) return errorResponse(res, 'Subject ID is required', 400);

    const subject = await Subject.findById(subject_id).populate({
      path: 'semester_id',
      populate: { path: 'course_id' }
    });
    if (!subject) return errorResponse(res, 'Subject not found', 404);

    // 1. Fetch papers & questions
    const papers = await ExaminationPaper.find({ subject_id, is_included_in_analysis: true });
    const paperYears = papers.map(p => p.exam_year);
    const questions = await ExtractedQuestion.find({ subject_id });

    // 2. Fetch active syllabus
    const syllabus = await SyllabusVersion.findOne({
      semester_id: subject.semester_id._id,
      is_active: true,
    });

    let generatedTopicsList = [];

    // If an API key is provided, use Groq to synthesize intelligent analysis
    if (apiKey && apiKey.startsWith('gsk_')) {
      const prompt = `Analyze this university examination subject:
Subject: ${subject.name} (${subject.code})
Available Exam Years: ${paperYears.join(', ')}
Units: ${JSON.stringify(subject.units)}
Sample Questions: ${JSON.stringify(questions.map(q => ({ text: q.question_text, marks: q.marks, year: q.exam_year })))}
Syllabus Excerpt: ${(syllabus?.extracted_text || '').substring(0, 1500)}

Generate an array of JSON objects for Important Topics based on historical frequency and syllabus weightage.
Format:
[
  {
    "topic_name": "string",
    "unit": "string",
    "priority": "high" | "medium" | "low",
    "historical_appearances": number,
    "appeared_years": [number],
    "common_marks_pattern": "string (e.g. 10 Marks, 5 Marks)",
    "why_important": "string explanation based on frequency or core concept",
    "ai_recommendation": "string guidance for preparation"
  }
]
Return ONLY valid JSON array. No markdown code blocks, no text before or after.`;

      try {
        const aiRes = await chatCompletion({
          apiKey,
          messages: [{ role: 'user', content: prompt }],
          model: model || 'openai/gpt-oss-120b',
          temperature: 0.2,
        });

        const cleaned = aiRes.content.replace(/```json/gi, '').replace(/```/gi, '').trim();
        generatedTopicsList = JSON.parse(cleaned);
      } catch (err) {
        console.warn('[AI Topics generation fallback to heuristic]:', err.message);
      }
    }

    // Heuristic fallback if AI was not used or failed
    if (!generatedTopicsList || generatedTopicsList.length === 0) {
      // Map through syllabus units and correlate with questions
      if (subject.units && subject.units.length > 0) {
        subject.units.forEach(unit => {
          (unit.topics || []).forEach(topicName => {
            // Check appearances in extracted questions
            const matchedQuestions = questions.filter(q =>
              q.question_text.toLowerCase().includes(topicName.toLowerCase())
            );
            const appearedYears = [...new Set(matchedQuestions.map(q => q.exam_year).filter(Boolean))];
            const appearances = matchedQuestions.length;
            const marksPatterns = matchedQuestions.map(q => q.marks).filter(Boolean);

            const priority = appearances >= 3 ? 'high' : appearances >= 1 ? 'medium' : 'low';
            const whyImportant = appearances > 0
              ? `Repeatedly asked in university exams (${appearances} times in years ${appearedYears.join(', ')})`
              : 'Present in syllabus; not found in the analysed papers.';

            generatedTopicsList.push({
              topic_name: topicName,
              unit: `Unit ${unit.number}: ${unit.name}`,
              priority,
              historical_appearances: appearances,
              appeared_years: appearedYears,
              common_marks_pattern: marksPatterns.length ? `${Math.max(...marksPatterns)} Marks` : '5-10 Marks',
              why_important: whyImportant,
              ai_recommendation: appearances > 0
                ? 'High probability topic. Prepare full 10-mark structured answers with diagrams.'
                : 'Cover fundamental definitions and concepts from the syllabus unit.',
            });
          });
        });
      }
    }

    // Save to database (replace or update)
    if (generatedTopicsList.length > 0) {
      await ImportantTopic.deleteMany({ subject_id });
      const docsToInsert = generatedTopicsList.map(t => ({
        ...t,
        subject_id,
        is_published: true,
      }));
      await ImportantTopic.insertMany(docsToInsert);
    }

    const savedTopics = await ImportantTopic.find({ subject_id }).sort({ priority: 1, historical_appearances: -1 });

    await logAudit({
      action: 'GENERATE_TOPICS',
      entityType: 'ImportantTopic',
      details: { subject: subject.name, count: savedTopics.length },
      req,
    });

    return successResponse(res, savedTopics, 'Important topics generated successfully', 201, savedTopics.length);
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/topics/:id
const updateTopic = async (req, res, next) => {
  try {
    const topic = await ImportantTopic.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!topic) return errorResponse(res, 'Topic not found', 404);
    return successResponse(res, topic, 'Topic updated');
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/topics/:id/publish
const togglePublishTopic = async (req, res, next) => {
  try {
    const topic = await ImportantTopic.findById(req.params.id);
    if (!topic) return errorResponse(res, 'Topic not found', 404);

    topic.is_published = !topic.is_published;
    await topic.save();

    return successResponse(res, topic, `Topic ${topic.is_published ? 'published' : 'unpublished'}`);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/topics/:id
const deleteTopic = async (req, res, next) => {
  try {
    const topic = await ImportantTopic.findByIdAndDelete(req.params.id);
    if (!topic) return errorResponse(res, 'Topic not found', 404);
    return successResponse(res, null, 'Topic deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTopics,
  generateTopics,
  updateTopic,
  togglePublishTopic,
  deleteTopic,
};
