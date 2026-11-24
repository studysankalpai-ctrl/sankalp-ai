/**
 * SANKALP AI • AI Viva-Voce Oral Examiner Controller
 * Simulates a realistic university external oral exam grounded in the official syllabus:
 * - Ingests complete prescribed unit syllabus and past university exam questions
 * - Generates high-yield, unit-specific oral viva questions
 * - Evaluates spoken candidate answers in real-time
 * - Asks natural follow-ups / cross-questions on partial responses
 * - Generates comprehensive post-viva university report cards
 */

const { chatCompletion } = require('../services/groqService');
const { getSubjectAcademicContext } = require('../services/analysisService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Helper to build comprehensive syllabus and university examination context
 */
const buildVivaSyllabusContext = async (subjectId, unitNumber = null, topic = null) => {
  if (!subjectId) {
    return {
      subjectName: 'University Academic Subject',
      subjectCode: '',
      scopeDesc: topic ? `Topic: ${topic}` : 'General Examination Syllabus',
      syllabusDetails: topic
        ? `Focus specifically on topic: ${topic}`
        : 'General university syllabus concepts and fundamental practicals.',
      activeUnit: null,
    };
  }

  const academicContext = await getSubjectAcademicContext(subjectId);
  const subjectName = academicContext?.subject?.name || 'University Academic Subject';
  const subjectCode = academicContext?.subject?.code || '';
  const units = academicContext?.subject?.units || [];

  let scopeDesc = '';
  let syllabusDetails = '';
  let activeUnit = null;
  let relevantQuestions = [];

  if (unitNumber && units.length > 0) {
    activeUnit = units.find((u) => u.number === Number(unitNumber)) || null;
    if (activeUnit) {
      scopeDesc = `Unit ${activeUnit.number}: ${activeUnit.name}`;
      const unitTopicsText =
        activeUnit.topics && activeUnit.topics.length > 0 ? activeUnit.topics.join(', ') : '';
      const unitDesc = activeUnit.description || '';

      syllabusDetails =
        `OFFICIAL PRESCRIBED SYLLABUS FOR UNIT ${activeUnit.number} (${activeUnit.name}):\n` +
        `Detailed Syllabus Topics & Concepts:\n${unitDesc || unitTopicsText || activeUnit.name}`;

      // Filter past university questions from this unit
      relevantQuestions = (academicContext.sampleQuestions || [])
        .filter(
          (q) =>
            q.unit == unitNumber ||
            (typeof q.unit === 'string' &&
              q.unit.toLowerCase().includes(`unit ${unitNumber}`))
        )
        .slice(0, 10);
    } else {
      scopeDesc = `Unit ${unitNumber}`;
      syllabusDetails = `Prescribed syllabus for Unit ${unitNumber} of ${subjectName}.`;
    }
  } else if (topic) {
    scopeDesc = `Topic: ${topic}`;
    syllabusDetails = `Prescribed syllabus focus area: ${topic} in ${subjectName}.`;
  } else {
    scopeDesc = `Full Practical Syllabus of ${subjectName} (${subjectCode})`;
    syllabusDetails =
      `OFFICIAL PRESCRIBED COURSE SYLLABUS UNITS:\n` +
      units
        .map(
          (u) =>
            `[Unit ${u.number}: ${u.name}]\n${
              u.description || (u.topics || []).join(', ') || u.name
            }`
        )
        .join('\n\n');

    relevantQuestions = (academicContext.sampleQuestions || []).slice(0, 12);
  }

  // If past university questions exist, append them as high-yield viva references
  if (relevantQuestions.length > 0) {
    syllabusDetails +=
      `\n\nFREQUENTLY ASKED UNIVERSITY EXAM QUESTIONS FROM THIS SYLLABUS:\n` +
      relevantQuestions
        .map((q, idx) => `${idx + 1}. [${q.marks || 5} Marks] ${q.text}`)
        .join('\n');
  }

  // If active syllabus document extracted text is available, append relevant text
  if (
    academicContext?.syllabus?.extracted_text_snippet &&
    (!activeUnit || !activeUnit.description)
  ) {
    syllabusDetails += `\n\nCURRICULUM DOCUMENT REFERENCE:\n${academicContext.syllabus.extracted_text_snippet.substring(
      0,
      1500
    )}`;
  }

  return {
    subjectName,
    subjectCode,
    scopeDesc,
    syllabusDetails,
    activeUnit,
  };
};

/**
 * POST /api/ai/viva/start
 * Initialize a live oral viva session & generate Question #1 strictly based on Unit Syllabus
 */
const startVivaSession = async (req, res, next) => {
  try {
    const {
      apiKey,
      subjectId,
      unitNumber = null,
      topic = null,
      difficulty = 'strict', // 'strict' | 'friendly'
      totalQuestions = 5,
      model = 'openai/gpt-oss-120b',
    } = req.body;

    if (!apiKey) {
      return errorResponse(res, 'Groq API key required to start AI Viva', 401);
    }

    const { subjectName, subjectCode, scopeDesc, syllabusDetails, activeUnit } =
      await buildVivaSyllabusContext(subjectId, unitNumber, topic);

    const prompt = `You are a distinguished University External Examiner conducting an official, real-time Oral Viva-Voce examination for college students.

SUBJECT: ${subjectName} ${subjectCode ? `(${subjectCode})` : ''}
EXAMINATION SCOPE: ${scopeDesc}
EXAMINER PERSONA: ${
      difficulty === 'strict'
        ? 'Strict, authoritative University External Examiner who tests conceptual depth, catches memorization/bluffing, and expects precise technical terms and internal mechanisms'
        : 'Supportive University Professor who encourages the candidate and tests core practical understanding'
    }

OFFICIAL PRESCRIBED SYLLABUS & TOPICS TO TEST:
${syllabusDetails}

CRITICAL EXAMINER INSTRUCTIONS:
1. You MUST formulate Question 1 STRICTLY derived from the syllabus provided above. Do NOT ask generic, vague, or out-of-syllabus questions.
2. Question 1 must test a high-yield foundational concept directly from this specific unit syllabus (e.g. definitions, differences between concepts, internal working principles, memory behavior, or purpose of specific keywords/routines).
3. Keep the spoken question crisp, clear, and specifically tailored for oral viva answering (1-2 sentences maximum).
4. Provide a natural verbal greeting (~1-2 sentences) introducing the viva and the specific syllabus unit scope.

OUTPUT FORMAT:
Respond with a strictly valid JSON object ONLY:
{
  "greeting": "Verbal opening greeting spoken by examiner mentioning the subject and unit",
  "question_number": 1,
  "total_questions": ${totalQuestions},
  "question_text": "The crisp oral viva question spoken to the candidate",
  "syllabus_topic_tested": "Specific syllabus topic tested",
  "expected_keywords": ["keyword 1", "keyword 2", "keyword 3"]
}`;

    const completion = await chatCompletion({
      apiKey,
      messages: [{ role: 'user', content: prompt }],
      model,
      temperature: 0.35,
      max_tokens: 1000,
    });

    let resultJson;
    try {
      const cleaned = completion.content.replace(/```json\n?|```/gi, '').trim();
      resultJson = JSON.parse(cleaned);
    } catch {
      resultJson = {
        greeting: `Welcome, candidate. We are now commencing your official oral viva examination for ${subjectName} covering ${scopeDesc}. Please answer clearly.`,
        question_number: 1,
        total_questions: totalQuestions,
        question_text: `To start off, explain the primary concept of ${
          activeUnit ? activeUnit.name : subjectName
        } and its practical working in university examinations.`,
        syllabus_topic_tested: activeUnit ? activeUnit.name : 'Core Concepts',
        expected_keywords: ['definition', 'working principle', 'practical application'],
      };
    }

    return successResponse(
      res,
      {
        session_id: `viva_${Date.now()}`,
        subject_name: subjectName,
        scope: scopeDesc,
        difficulty,
        greeting: resultJson.greeting,
        question_number: resultJson.question_number || 1,
        total_questions: Number(totalQuestions),
        question_text: resultJson.question_text,
        syllabus_topic_tested: resultJson.syllabus_topic_tested || '',
        expected_keywords: resultJson.expected_keywords || [],
      },
      'Viva session started'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai/viva/respond
 * Process candidate's spoken response, evaluate score, and ask cross-question OR next question strictly grounded in Unit Syllabus
 */
const respondVivaTurn = async (req, res, next) => {
  try {
    const {
      apiKey,
      subjectId,
      unitNumber = null,
      topic = null,
      difficulty = 'strict',
      questionNumber = 1,
      totalQuestions = 5,
      currentQuestionText,
      candidateSpokenAnswer,
      previousHistory = [],
      isCrossQuestion = false,
      model = 'openai/gpt-oss-120b',
    } = req.body;

    if (!apiKey) {
      return errorResponse(res, 'Groq API key required', 401);
    }

    if (!currentQuestionText || !candidateSpokenAnswer) {
      return errorResponse(res, 'Question and candidate answer are required', 400);
    }

    const { subjectName, subjectCode, scopeDesc, syllabusDetails } =
      await buildVivaSyllabusContext(subjectId, unitNumber, topic);

    const isLastQuestion =
      Number(questionNumber) >= Number(totalQuestions) && isCrossQuestion;
    const shouldCheckForFinal = Number(questionNumber) >= Number(totalQuestions);

    const prompt = `You are a distinguished University External Examiner conducting an official viva-voce for college students.
Examiner Persona: ${
      difficulty === 'strict'
        ? 'Strict, authoritative external examiner who expects sharp accuracy and precise technical keywords'
        : 'Friendly, supportive university professor'
    }

SUBJECT: ${subjectName} ${subjectCode ? `(${subjectCode})` : ''}
EXAMINATION SCOPE: ${scopeDesc}

OFFICIAL PRESCRIBED SYLLABUS & TOPICS:
${syllabusDetails}

CURRENT EXAM STATE:
- Question Number: ${questionNumber} of ${totalQuestions}
- Was this a follow-up/cross question: ${isCrossQuestion ? 'YES' : 'NO'}
- Examiner Asked: "${currentQuestionText}"
- Candidate Spoke (Voice Transcript): "${candidateSpokenAnswer}"
- Previous Questions Asked So Far:
  ${
    previousHistory
      .map(
        (h, i) =>
          `Q${i + 1}: "${h.question}" (Candidate Answer: "${h.answer?.substring(
            0,
            120
          )}...", Marks: ${h.marks}/5)`
      )
      .join('\n  ') || 'None'
  }

YOUR TASK:
1. Grade the candidate's answer for this question out of 5 marks (e.g. 4.5/5).
2. Formulate your spoken verbal reaction (~1-2 short sentences in natural English/Hinglish):
   - Mention what was technically accurate.
   - Point out what critical technical detail, equation, keyword or mechanism was missed according to university standards.
3. DECIDE NEXT STEP:
   - CASE A (Cross-Question): If the answer was weak, shallow, or incomplete AND this was NOT already a cross-question AND ${!shouldCheckForFinal}:
     Ask a sharp, targeted CROSS-QUESTION directly on the missing concept from the syllabus.
     Set "is_cross_question": true, "is_final": false.
   - CASE B (Next Question): If the answer was sufficient OR was already a cross-question, AND question_number < ${totalQuestions}:
     Advance to NEXT official viva question (Question ${Number(questionNumber) + 1}).
     CRITICAL: This next question MUST be strictly chosen from an UNTESTED topic in the prescribed syllabus provided above! Do NOT repeat topics already covered in previous questions!
     Set "is_cross_question": false, "is_final": false.
   - CASE C (Final Assessment): If question_number >= ${totalQuestions}:
     Complete the viva exam. Set "is_final": true, and generate the comprehensive university Report Card based on all questions and answers.

OUTPUT FORMAT (Respond with strictly valid JSON ONLY):
{
  "marks_awarded": number (between 0 and 5),
  "max_marks": 5,
  "verbal_feedback": "Short spoken response by examiner explaining accuracy & missing details",
  "missing_concept": "Key technical keyword or concept omitted by candidate",
  "is_cross_question": boolean,
  "is_final": boolean,
  "next_question_number": ${Number(questionNumber) + (isCrossQuestion ? 0 : 1)},
  "next_question_text": "Next spoken question or cross-question (null if is_final is true)",
  "syllabus_topic_tested": "Specific syllabus topic tested in next question",
  "report_card": { // ONLY IF is_final is true, otherwise null
    "overall_score": number, // out of total (e.g. 23)
    "max_possible_score": ${Number(totalQuestions) * 5},
    "grade": "string (e.g. Grade A - Distinction / Grade B - Solid / Grade C - Needs Work)",
    "strengths": ["Strong area 1", "Strong area 2"],
    "weaknesses": ["Concept to revise 1", "Concept to revise 2"],
    "examiner_trap_questions": [
      "Top tricky question 1 examiners love asking in this specific syllabus unit",
      "Top tricky question 2 examiners love asking in this specific syllabus unit",
      "Top tricky question 3 examiners love asking in this specific syllabus unit"
    ],
    "verdict": "2-sentence overall evaluation of candidate's oral performance based on syllabus depth"
  }
}`;

    const completion = await chatCompletion({
      apiKey,
      messages: [{ role: 'user', content: prompt }],
      model,
      temperature: 0.35,
      max_tokens: 1500,
    });

    let resultJson;
    try {
      const cleaned = completion.content.replace(/```json\n?|```/gi, '').trim();
      resultJson = JSON.parse(cleaned);
    } catch {
      resultJson = {
        marks_awarded: 3.5,
        max_marks: 5,
        verbal_feedback:
          'Fair response, but make sure to emphasize the underlying working mechanism and precise definitions.',
        missing_concept: 'Underlying hardware execution and edge cases',
        is_cross_question: false,
        is_final: shouldCheckForFinal,
        next_question_number: Number(questionNumber) + 1,
        next_question_text: shouldCheckForFinal
          ? null
          : 'Moving on to the next syllabus concept. Explain the core mechanism in practical applications.',
        syllabus_topic_tested: 'Core Syllabus Topics',
        report_card: shouldCheckForFinal
          ? {
              overall_score: Math.round(Number(totalQuestions) * 3.8),
              max_possible_score: Number(totalQuestions) * 5,
              grade: 'Grade A - University Ready',
              strengths: [
                'Clear spoken communication',
                'Sound conceptual foundation in prescribed syllabus',
              ],
              weaknesses: [
                'Revise edge cases and technical definitions',
                'Practice deeper conceptual trade-offs',
              ],
              examiner_trap_questions: [
                'What is the fundamental working difference between these two core operations?',
                'How does the system handle boundary conditions internally?',
                'Explain why this architecture is preferred in practical deployments.',
              ],
              verdict:
                'Candidate demonstrated commendable conceptual understanding of the syllabus topics.',
            }
          : null,
      };
    }

    return successResponse(res, resultJson, 'Viva turn evaluated');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startVivaSession,
  respondVivaTurn,
};
