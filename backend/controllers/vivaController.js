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
    const fallbackTopics = [
      'Core Definitions & Terminology',
      'Underlying Architecture & Working Principle',
      'Key Differences & Distinction Matrix',
      'Practical Implementation & Edge Cases',
      'Performance Optimization & Constraints',
    ];
    return {
      subjectName: 'University Academic Subject',
      subjectCode: '',
      scopeDesc: topic ? `Topic: ${topic}` : 'General Examination Syllabus',
      syllabusDetails: topic
        ? `Focus specifically on topic: ${topic}`
        : 'General university syllabus concepts and fundamental practicals.',
      activeUnit: null,
      distinctTopics: fallbackTopics,
    };
  }

  const academicContext = await getSubjectAcademicContext(subjectId);
  const subjectName = academicContext?.subject?.name || 'University Academic Subject';
  const subjectCode = academicContext?.subject?.code || '';
  const units = academicContext?.subject?.units || [];
  const importantTopicsList = (academicContext?.importantTopics || []).map((t) => t.topic_name).filter(Boolean);

  let scopeDesc = '';
  let syllabusDetails = '';
  let activeUnit = null;
  let relevantQuestions = [];
  let distinctTopics = [];

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

      // Collect unit topics
      if (activeUnit.topics && activeUnit.topics.length > 0) {
        distinctTopics = [...activeUnit.topics];
      } else if (unitDesc) {
        distinctTopics = unitDesc
          .split(/[,;\n•]+/)
          .map((s) => s.trim())
          .filter((s) => s.length > 3 && !s.toLowerCase().includes('unit'));
      }

      // Add matching important topics
      const matchingImportant = importantTopicsList.filter(
        (t) =>
          typeof t === 'string' &&
          (t.toLowerCase().includes(`unit ${unitNumber}`) ||
            (activeUnit.name && t.toLowerCase().includes(activeUnit.name.toLowerCase().slice(0, 10))))
      );
      distinctTopics.push(...matchingImportant);

      if (distinctTopics.length === 0) {
        distinctTopics = [
          `${activeUnit.name} - Core Definition`,
          `${activeUnit.name} - Working Mechanism`,
          `${activeUnit.name} - Practical Execution`,
          `${activeUnit.name} - Key Comparison`,
          `${activeUnit.name} - Best Practices & Limits`,
        ];
      }

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
      distinctTopics = [`Unit ${unitNumber} Foundations`, `Unit ${unitNumber} Methods`, `Unit ${unitNumber} Practical Applications`];
    }
  } else if (topic) {
    scopeDesc = `Topic: ${topic}`;
    syllabusDetails = `Prescribed syllabus focus area: ${topic} in ${subjectName}.`;
    distinctTopics = [
      `${topic} - Fundamentals`,
      `${topic} - Internal Architecture`,
      `${topic} - Practical Use-Cases`,
      `${topic} - Tradeoffs & Performance`,
      `${topic} - Common Errors & Edge Cases`,
    ];
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

    // Collect topics across all units
    for (const u of units) {
      if (u.topics && u.topics.length > 0) {
        distinctTopics.push(...u.topics.slice(0, 3));
      } else {
        distinctTopics.push(`Unit ${u.number}: ${u.name}`);
      }
    }
    distinctTopics.push(...importantTopicsList.slice(0, 10));

    relevantQuestions = (academicContext.sampleQuestions || []).slice(0, 12);
  }

  // Deduplicate and sanitize distinct topics
  distinctTopics = [...new Set(distinctTopics.map((t) => t.trim()))].filter((t) => t && t.length > 2);
  if (distinctTopics.length === 0) {
    distinctTopics = [
      'Foundational Concepts & Principles',
      'Core Process & Working Mechanism',
      'Distinction Matrix & Differences',
      'Memory / Resource Behavior',
      'Practical Implementation & Constraints',
    ];
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
    distinctTopics,
  };
};

/**
 * Helper to enforce simple, clear, student-friendly language
 * Eliminates archaic, pompous GRE-level vocabulary (e.g., elucidate, delineate, concomitant)
 */
const getSimplicityDirectives = () => `
LANGUAGE CLARITY & SIMPLICITY RULES (MANDATORY):
- Use SIMPLE, CLEAR, EVERYDAY conversational language that undergraduate students can easily understand on first hearing.
- NEVER use pompous, overly academic, or archaic vocabulary:
  * FORBIDDEN WORDS: "elucidate", "delineate", "concomitant", "rudimentary", "engendered", "dichotomy", "paradigm", "postulate", "demarcation", "explicate", "juxtaposition", "commensurate", "underpinning", "substantiate", "efficacious", "quintessential", "perusal", "discrepancy", "manifestation".
  * INSTEAD USE SIMPLE WORDS: "explain", "describe", "what is", "how does it work", "why do we use", "what is the main difference between", "what happens when", "give a quick example".
- Keep technical terms (e.g. "Pointer", "Semaphore", "Deadlock", "Process", "Thread", "Primary Key", "Stack") 100% accurate, but make the framing, sentence structure, and questions simple and direct.
- Spoken questions MUST be short (1-2 sentences maximum) so they sound natural and easy when spoken by text-to-speech.
- Examiner verbal reactions must be kind, clear, and constructive: explain what was good and what was missed in simple words.
- Model answers ("model_answer") must be clean, 1-2 sentence textbook-authentic answers that a student can easily remember and say out loud.
`;

/**
 * Helper to build language instructions for Hindi, Hinglish, or English
 */
const getLanguageGuidance = (language = 'english') => {
  const simplicity = getSimplicityDirectives();

  if (language === 'hindi') {
    return `${simplicity}
CRITICAL LANGUAGE REQUIREMENT (HINDI - सरल हिंदी):
- You MUST speak, greet, ask viva questions, and provide feedback in simple, natural, conversational Hindi (सरल और स्पष्ट हिंदी).
- DO NOT use archaic, hyper-formal, or heavy Sanskritized words (e.g. avoid "अभिकलित्र", "समवर्ती प्रक्रम", "प्रत्यक्षीकरण").
- Write standard technical keywords in English/Hinglish brackets for 100% clarity (e.g. "पॉइंटर (Pointer)", "मेमोरी (Memory)", "ऑपरेटिंग सिस्टम (Operating System)", "प्राइमरी की (Primary Key)").
- Example spoken question: "नमस्ते उम्मीदवार। आपकी मौखिक परीक्षा शुरू होती है। पहला सवाल: सी भाषा में पॉइंटर (Pointer) क्या होता है और हम इसका मुख्य उपयोग क्यों करते हैं?"`;
  }

  if (language === 'hinglish') {
    return `${simplicity}
CRITICAL LANGUAGE REQUIREMENT (HINGLISH - सरल कॉलेज मिक्स):
- You MUST speak, greet, ask viva questions, and give feedback in natural, friendly Indian College Hinglish (the conversational mix of Hindi & English that professors use to make students comfortable).
- Keep sentences short, smooth, and friendly without complex English tongue-twisters.
- Example spoken question: "Namaste candidate. Aapka oral viva start ho raha hai. First question: C language me Pointer kya hota hai aur iska main use kya hai?"`;
  }

  return `${simplicity}
CRITICAL LANGUAGE REQUIREMENT (ENGLISH - SIMPLE & DIRECT):
- Use clean, simple, student-friendly conversational English.
- Avoid big, flowery, or complex words. Make questions direct and easy to comprehend on first listen.
- Example spoken question: "Welcome candidate! Let's start your oral viva exam. Question 1: What is a pointer in C, and why do we use it in programming?"`;
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
      language = 'english', // 'english' | 'hindi' | 'hinglish'
      totalQuestions = 5,
      model = 'openai/gpt-oss-120b',
    } = req.body;

    if (!apiKey) {
      return errorResponse(res, 'Groq API key required to start AI Viva', 401);
    }

    const { subjectName, subjectCode, scopeDesc, syllabusDetails, activeUnit, distinctTopics } =
      await buildVivaSyllabusContext(subjectId, unitNumber, topic);

    const firstTopic = distinctTopics[0] || (activeUnit ? activeUnit.name : 'Foundational Principles');

    const prompt = `You are a university professor conducting an official, real-time Oral Viva-Voce examination for college students.

SUBJECT: ${subjectName} ${subjectCode ? `(${subjectCode})` : ''}
EXAMINATION SCOPE: ${scopeDesc}
EXAMINER PERSONA: ${
      difficulty === 'strict'
        ? 'Strict but fair External Examiner: Evaluates conceptual depth and accuracy, but formulates questions in SIMPLE, DIRECT, student-friendly language. Strictly avoids hard, rare, or pompous vocabulary.'
        : 'Supportive University Professor: Encouraging and patient, asking clear questions in simple, everyday conversational language.'
    }

${getLanguageGuidance(language)}

OFFICIAL PRESCRIBED SYLLABUS & TOPICS TO TEST:
${syllabusDetails}

TOPIC DIVERSITY REQUIREMENT:
The syllabus contains these distinct topics:
${distinctTopics.map((t, idx) => `  ${idx + 1}. ${t}`).join('\n')}

CRITICAL EXAMINER INSTRUCTIONS:
1. You MUST formulate Question 1 strictly testing Topic #1: "${firstTopic}".
2. Question 1 must test this specific topic directly (definition, internal working, difference, or practical use).
3. LANGUAGE CLARITY (MANDATORY): The question MUST be formulated in simple, clear, conversational words (1-2 sentences maximum). Strictly NO high-level or archaic vocabulary like "elucidate", "delineate", "concomitant", "rudimentary", "dichotomy". Keep it so clear that any undergraduate student grasps it immediately on first hearing.
4. Set "syllabus_topic_tested": "${firstTopic}".
5. Provide a warm, brief verbal opening greeting (~1 sentence) introducing the viva and the unit scope in simple words.

OUTPUT FORMAT:
Respond with a strictly valid JSON object ONLY:
{
  "greeting": "Verbal opening greeting spoken by examiner in simple, natural words",
  "question_number": 1,
  "total_questions": ${totalQuestions},
  "question_text": "The simple, clear oral viva question spoken to the candidate",
  "syllabus_topic_tested": "${firstTopic}",
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
        greeting:
          language === 'hindi'
            ? `नमस्ते उम्मीदवार! ${subjectName} की मौखिक परीक्षा शुरू हो रही है। कृपया स्पष्ट बोलें।`
            : language === 'hinglish'
            ? `Welcome candidate! ${subjectName} ke liye oral viva start ho raha hai. Please answer clearly.`
            : `Welcome candidate! We are starting your oral viva exam for ${subjectName} covering ${scopeDesc}. Please answer clearly.`,
        question_number: 1,
        total_questions: totalQuestions,
        question_text:
          language === 'hindi'
            ? `${activeUnit ? activeUnit.name : subjectName} क्या होता है और इसका मुख्य उद्देश्य क्या है?`
            : language === 'hinglish'
            ? `${activeUnit ? activeUnit.name : subjectName} kya hota hai aur iska main use kya hai?`
            : `To start off, what is ${
                activeUnit ? activeUnit.name : subjectName
              }, and what is its main practical use?`,
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
      language = 'english', // 'english' | 'hindi' | 'hinglish'
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

    const { subjectName, subjectCode, scopeDesc, syllabusDetails, distinctTopics } =
      await buildVivaSyllabusContext(subjectId, unitNumber, topic);

    // Track all topics tested so far across previous turns
    const testedTopics = (previousHistory || [])
      .map((h) => h.topic)
      .filter((t) => t && typeof t === 'string' && t.trim().length > 0);

    const currentTopicFromClient = req.body.currentQuestionTopic || req.body.topic;
    if (currentTopicFromClient && !testedTopics.includes(currentTopicFromClient)) {
      testedTopics.push(currentTopicFromClient);
    }

    // Filter to find remaining UNTESTED topics
    const untestedTopics = distinctTopics.filter((candidate) => {
      const cNorm = candidate.toLowerCase().trim();
      return !testedTopics.some((tested) => {
        const tNorm = tested.toLowerCase().trim();
        return tNorm === cNorm || tNorm.includes(cNorm) || cNorm.includes(tNorm);
      });
    });

    // Select the next target topic from untested topics
    const nextTargetTopic =
      untestedTopics[0] ||
      distinctTopics[(Number(questionNumber)) % distinctTopics.length] ||
      'Applied Implementation & Concepts';

    const isLastQuestion =
      Number(questionNumber) >= Number(totalQuestions) && isCrossQuestion;
    const shouldCheckForFinal = Number(questionNumber) >= Number(totalQuestions);

    const prompt = `You are a university examiner conducting an official viva-voce examination for college students.
Examiner Persona: ${
      difficulty === 'strict'
        ? 'Strict but fair External Examiner: Grades accurately on conceptual depth, but speaks in SIMPLE, CLEAR, direct language without any pompous or hard words'
        : 'Friendly, supportive university professor who speaks in simple, encouraging everyday words'
    }

${getLanguageGuidance(language)}

SUBJECT: ${subjectName} ${subjectCode ? `(${subjectCode})` : ''}
EXAMINATION SCOPE: ${scopeDesc}

OFFICIAL PRESCRIBED SYLLABUS & TOPICS:
${syllabusDetails}

CURRENT EXAM STATE & TOPICS TESTED SO FAR:
- Question Number: ${questionNumber} of ${totalQuestions}
- Was this a follow-up/cross question: ${isCrossQuestion ? 'YES' : 'NO'}
- Current Topic Just Tested: "${currentTopicFromClient || 'Prescribed Concept'}"
- Examiner Asked: "${currentQuestionText}"
- Candidate Spoke (Voice Transcript): "${candidateSpokenAnswer}"
- Previous Questions Asked So Far:
  ${
    previousHistory
      .map(
        (h, i) =>
          `Q${i + 1} [Topic: ${h.topic || 'Concept'}]: "${h.question}" (Candidate Answer: "${h.answer?.substring(
            0,
            120
          )}...", Marks: ${h.marks}/5)`
      )
      .join('\n  ') || 'None'
  }

CRITICAL TOPIC DIVERSITY MANDATE (DO NOT REPEAT TOPICS):
- Topics already tested in this exam:
  ${testedTopics.map((t) => `  * ${t}`).join('\n') || 'None'}
- Available Untested Topics:
  ${untestedTopics.slice(0, 5).join(', ') || 'Alternative syllabus concepts'}

YOUR TASK:
1. Grade the candidate's answer for this question out of 5 marks (e.g. 4/5).
2. Formulate your spoken verbal reaction (~1-2 short sentences in SIMPLE, conversational words):
   - Mention what was correct in plain, friendly terms.
   - Point out what key detail or keyword was missed without using heavy or archaic words.
3. Formulate the IDEAL/MODEL VIVA ANSWER ("model_answer"):
   - Provide a clear, simple 1-2 sentence model answer using plain language that directly explains the concept with key technical terms. A student should be able to easily understand and remember it for their university exams!
4. DECIDE NEXT STEP:
   - CASE A (Cross-Question): If the answer was weak or incomplete AND this was NOT already a cross-question AND ${!shouldCheckForFinal}:
     Ask a simple, targeted follow-up question directly on the missing concept.
     Keep the question short, direct, and easy to understand (NO hard words).
     Set "is_cross_question": true, "is_final": false, "syllabus_topic_tested": "${currentTopicFromClient || 'Clarification'}".
   - CASE B (Next Question): If the answer was sufficient OR was already a cross-question, AND question_number < ${totalQuestions}:
     Advance to NEXT official viva question (Question ${Number(questionNumber) + 1}).
     CRITICAL: This next question MUST be strictly chosen from an UNTESTED topic in the prescribed syllabus!
     YOU MUST ASK ABOUT THIS NEW TOPIC: "${nextTargetTopic}"!
     DO NOT repeat any topic already tested (${testedTopics.join(', ') || 'previous concept'}).
     Keep the question short, direct, and simple!
     Set "is_cross_question": false, "is_final": false, "syllabus_topic_tested": "${nextTargetTopic}".
   - CASE C (Final Assessment): If question_number >= ${totalQuestions}:
     Complete the viva exam. Set "is_final": true, and generate the university Report Card in clear, simple language.

OUTPUT FORMAT (Respond with strictly valid JSON ONLY):
{
  "marks_awarded": number (between 0 and 5),
  "max_marks": 5,
  "verbal_feedback": "Short spoken response in simple, clear words explaining what was good & what was missed",
  "model_answer": "Concise 1-2 sentence ideal viva answer using simple, clear words with core technical terms",
  "missing_concept": "Key technical keyword or concept omitted by candidate",
  "is_cross_question": boolean,
  "is_final": boolean,
  "next_question_number": ${Number(questionNumber) + (isCrossQuestion ? 0 : 1)},
  "next_question_text": "Next simple spoken question or cross-question (null if is_final is true)",
  "syllabus_topic_tested": "${nextTargetTopic}",
  "report_card": { // ONLY IF is_final is true, otherwise null
    "overall_score": number, // out of total (e.g. 23)
    "max_possible_score": ${Number(totalQuestions) * 5},
    "grade": "string (e.g. Grade A - Distinction / Grade B - Solid / Grade C - Needs Practice)",
    "strengths": ["Strong area 1", "Strong area 2"],
    "weaknesses": ["Area to revise 1", "Area to revise 2"],
    "examiner_trap_questions": [
      "Common viva question 1 examiners ask on this unit",
      "Common viva question 2 examiners ask on this unit",
      "Common viva question 3 examiners ask on this unit"
    ],
    "verdict": "2-sentence overall evaluation of candidate's oral performance in clear, simple language"
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
          'Good attempt! You covered the basics well, but make sure to mention the core working principle and give a quick example.',
        model_answer:
          'In simple terms, explain the exact definition, how it functions step-by-step, and state one clear real-world use case.',
        missing_concept: 'Key working principle and practical example',
        is_cross_question: false,
        is_final: shouldCheckForFinal,
        next_question_number: Number(questionNumber) + 1,
        next_question_text: shouldCheckForFinal
          ? null
          : language === 'hindi'
            ? `अब अगले विषय (${nextTargetTopic}) पर आते हैं: यह क्या होता है और इसका मुख्य उद्देश्य क्या है?`
            : language === 'hinglish'
              ? `Ab next topic (${nextTargetTopic}) par aate hain: yeh kya hota hai aur iska main use kya hai?`
              : `Moving to our next topic: ${nextTargetTopic}. Can you explain what it is and its practical application?`,
        syllabus_topic_tested: nextTargetTopic,
        report_card: shouldCheckForFinal
          ? {
              overall_score: Math.round(Number(totalQuestions) * 3.8),
              max_possible_score: Number(totalQuestions) * 5,
              grade: 'Grade A - University Ready',
              strengths: [
                'Clear spoken answers',
                'Good basic understanding of the prescribed syllabus',
              ],
              weaknesses: [
                'Remember to include key technical terms',
                'Practice giving short, direct examples',
              ],
              examiner_trap_questions: [
                'What is the main difference between these two operations?',
                'How does the system handle this step internally?',
                'Why do we prefer this method over the alternative?',
              ],
              verdict:
                'Good oral performance! The candidate explained the core concepts clearly in simple language.',
            }
          : null,
      };
    }

    // 1. Sanitize marks_awarded to be a clean, valid number between 0 and 5 (in 0.5 increments)
    let rawMarks = Number(resultJson.marks_awarded);
    if (isNaN(rawMarks) || rawMarks < 0) rawMarks = 0;
    if (rawMarks > 5) rawMarks = 5;
    resultJson.marks_awarded = Math.round(rawMarks * 2) / 2;
    resultJson.max_marks = 5;

    // 2. Mathematically calculate exact Viva Scorecard totals (Zero LLM addition hallucination)
    if (resultJson.report_card || resultJson.is_final) {
      const priorMarks = (previousHistory || []).map((h) => Number(h.marks) || 0);
      const totalScoreSum = priorMarks.reduce((sum, m) => sum + m, 0) + resultJson.marks_awarded;
      const accurateOverallScore = Number(totalScoreSum.toFixed(1));
      const totalTurnsCount = (previousHistory || []).length + 1;
      const accurateMaxScore = totalTurnsCount * 5;

      const percentage = Math.round((accurateOverallScore / accurateMaxScore) * 100);
      let accurateGrade = 'Grade A - Distinction';
      if (percentage >= 85) accurateGrade = 'Grade A+ (Distinction)';
      else if (percentage >= 75) accurateGrade = 'Grade A (First Class)';
      else if (percentage >= 60) accurateGrade = 'Grade B (Second Division)';
      else if (percentage >= 50) accurateGrade = 'Grade C (Satisfactory)';
      else accurateGrade = 'Grade D (Needs Practice)';

      if (!resultJson.report_card) {
        resultJson.report_card = {};
      }

      resultJson.report_card.overall_score = accurateOverallScore;
      resultJson.report_card.max_possible_score = accurateMaxScore;
      resultJson.report_card.grade = accurateGrade;
      resultJson.report_card.percentage = percentage;
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
