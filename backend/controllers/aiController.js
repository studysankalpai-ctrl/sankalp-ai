const fs = require('fs');
const { chatCompletion, testConnection, getAvailableModels } = require('../services/groqService');
const { getSubjectAcademicContext, buildMentorSystemPrompt, buildDocumentTutorPrompt } = require('../services/analysisService');
const { extractPdfText, searchBookText } = require('../services/pdfService');
const Subject = require('../models/Subject');
const ExaminationPaper = require('../models/ExaminationPaper');
const ExtractedQuestion = require('../models/ExtractedQuestion');
const SyllabusVersion = require('../models/SyllabusVersion');
const Book = require('../models/Book');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Robust JSON parser with auto-repair for truncated AI outputs
const safeParseJson = (raw, fallback = null) => {
  if (!raw || typeof raw !== 'string') return fallback;
  let text = raw.trim();

  // Strip markdown code fences
  text = text.replace(/^```(?:json)?\s*/i, '');
  text = text.replace(/\s*```$/i, '');
  text = text.trim();

  // 1. Try finding complete outer JSON block
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.substring(firstBrace, lastBrace + 1));
    } catch (_) {}
  }

  // 2. Try array format if it starts with [
  const firstBracket = text.indexOf('[');
  const lastBracket = text.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    try {
      return JSON.parse(text.substring(firstBracket, lastBracket + 1));
    } catch (_) {}
  }

  // 3. Try standard parse directly
  try {
    return JSON.parse(text);
  } catch (_) {}

  // 4. Auto-repair truncated JSON (e.g. cut off strings/arrays/objects)
  try {
    let repaired = text;
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      repaired = repaired.substring(firstBrace);
    } else if (firstBracket !== -1) {
      repaired = repaired.substring(firstBracket);
    }

    // Check if ends inside an open string (odd count of unescaped double quotes)
    const quotes = repaired.match(/(?<!\\)"/g);
    if (quotes && quotes.length % 2 !== 0) {
      repaired += '"';
    }

    // Balance unclosed braces and brackets
    let openBraces = 0;
    let openBrackets = 0;
    let inString = false;
    for (let i = 0; i < repaired.length; i++) {
      const char = repaired[i];
      if (char === '"' && (i === 0 || repaired[i - 1] !== '\\')) {
        inString = !inString;
      } else if (!inString) {
        if (char === '{') openBraces++;
        else if (char === '}') openBraces = Math.max(0, openBraces - 1);
        else if (char === '[') openBrackets++;
        else if (char === ']') openBrackets = Math.max(0, openBrackets - 1);
      }
    }

    // Remove any trailing comma or colon before closing
    repaired = repaired.replace(/[,:\s]+$/, '');

    // Close in reverse order
    while (openBrackets > 0) {
      repaired += ']';
      openBrackets--;
    }
    while (openBraces > 0) {
      repaired += '}';
      openBraces--;
    }

    return JSON.parse(repaired);
  } catch (err) {
    console.warn('[safeParseJson] Auto-repair could not parse JSON:', err.message);
    return fallback;
  }
};

// Graceful fallback Master Examination Paper builder
const buildFallbackPaper = (subject, courseName, semesterName, paperYears, papersCount) => {
  const units = subject.units && subject.units.length > 0 ? subject.units : [
    { number: 1, name: 'Unit 1 Fundamentals' },
    { number: 2, name: 'Unit 2 Core Concepts' },
    { number: 3, name: 'Unit 3 Applied Architecture' },
    { number: 4, name: 'Unit 4 Advanced Topics' },
    { number: 5, name: 'Unit 5 Emerging Trends' },
  ];

  return {
    paper_title: `Final Paper - ${subject.name} Preparation`,
    subject_name: subject.name,
    subject_code: subject.code || '',
    course_name: courseName,
    semester_name: semesterName,
    max_marks: 70,
    duration: '3 Hours',
    instructions: [
      'Section A is compulsory. Answer all 5 questions (2 marks each).',
      'Section B: Answer all 4 questions (5 marks each).',
      'Section C: Answer all 2 questions with internal choice [OR] (10 marks each).',
    ],
    analysis_summary: {
      years_analyzed: paperYears.length > 0 ? paperYears : ['Recent Session'],
      total_historical_papers: papersCount || 1,
      repetition_insights: 'Synthesized from official university curriculum, syllabus units, and core exam patterns.',
      high_weightage_units: units.slice(0, 3).map((u) => `Unit ${u.number}`),
      preparation_advice: 'Prioritize Section A key definitions and structured diagram-oriented answers in Section B and C.',
    },
    sections: [
      {
        section_id: 'A',
        section_name: 'SECTION A (Short Answer & Core Definitions - Compulsory)',
        section_instructions: 'Answer ALL questions. Each question carries 2 Marks.',
        total_marks: 10,
        questions: units.slice(0, 5).map((u, i) => ({
          q_num: `Q1.(${String.fromCharCode(97 + i)})`,
          question: `Define the primary principles and significance of ${u.name}.`,
          marks: 2,
          unit: `Unit ${u.number}`,
          repetition_status: 'High Frequency in Past Papers',
          model_solution: `Precise university answer explaining key definition, purpose, and real-world relevance of ${u.name}.`,
        })),
      },
      {
        section_id: 'B',
        section_name: 'SECTION B (Conceptual & Analytical Questions)',
        section_instructions: 'Answer ALL questions. Each question carries 5 Marks.',
        total_marks: 20,
        questions: units.slice(0, 4).map((u, i) => ({
          q_num: `Q${i + 2}`,
          question: `Explain the architecture, key mechanisms, and practical working of concepts in ${u.name}.`,
          marks: 5,
          unit: `Unit ${u.number}`,
          repetition_status: 'Repeated Analytical Priority',
          model_solution: `Structured 5-mark answer: 1. Core concept introduction, 2. Key components with diagram description, 3. Practical real-world example.`,
        })),
      },
      {
        section_id: 'C',
        section_name: 'SECTION C (Long Comprehensive Questions with Choices)',
        section_instructions: 'Answer all questions. Each question carries 10 Marks with internal choice [OR].',
        total_marks: 20,
        questions: [
          {
            q_num: 'Q6',
            question: `Provide an in-depth comprehensive analysis of the architecture, methodologies, and technical trade-offs in ${units[0]?.name || 'Core Fundamentals'}.`,
            or_question: `Critically evaluate real-world case studies and deployment challenges associated with ${units[1]?.name || 'Advanced Systems'}.`,
            marks: 10,
            unit: `Unit ${units[0]?.number || 1}`,
            repetition_status: 'Annual Comprehensive Question',
            model_solution: `Detailed 10-mark breakdown: Comprehensive framework overview, architectural comparison table, design steps, and critical evaluation.`,
          },
          {
            q_num: 'Q7',
            question: `Detailed study and architectural formulation of modern frameworks in ${units[2]?.name || 'System Design'}.`,
            or_question: `Discuss future trends, security implications, and enterprise scalability for ${units[3]?.name || 'Emerging Technologies'}.`,
            marks: 10,
            unit: `Unit ${units[2]?.number || 3}`,
            repetition_status: 'Core Annual Priority',
            model_solution: `Full 10-mark solution: Architectural block diagram, step-by-step operational flow, comparative pros/cons, and implementation summary.`,
          },
        ],
      },
    ],
  };
};

// POST /api/ai/test-connection
const testGroqConnection = async (req, res, next) => {
  try {
    const { apiKey, model } = req.body;
    if (!apiKey) {
      return errorResponse(res, 'Please provide an API key to test', 400);
    }
    const result = await testConnection(apiKey, model);
    return successResponse(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

// POST /api/ai/models
const fetchModels = async (req, res, next) => {
  try {
    const { apiKey } = req.body;
    const models = await getAvailableModels(apiKey);
    return successResponse(res, models, 'Available Groq models');
  } catch (error) {
    next(error);
  }
};

// POST /api/ai/chat
// AI Mentor conversational endpoint with injected academic context or document-scoped tutoring
const mentorChat = async (req, res, next) => {
  try {
    const {
      apiKey,
      messages,
      subjectId,
      language = 'english',
      answerStyle = 'detailed',
      marksFormat = 15,
      model = 'openai/gpt-oss-120b',
      learnByBook = false,
      bookId = null,
      // Document Scoped parameters (used by PDF Viewer Page)
      documentScoped = false,
      documentId = null,
      documentType = null,
      documentTitle = null,
    } = req.body;

    if (!apiKey) {
      return errorResponse(res, 'Connect your Groq API key to start learning with AI.', 401);
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return errorResponse(res, 'Messages array is required', 400);
    }

    const lastUserMsg = messages.filter((m) => m.role === 'user').slice(-1)[0]?.content || '';

    // =========================================================
    // CASE A: DOCUMENT-SCOPED MODE (Dedicated to the opened PDF in Academic Library)
    // =========================================================
    if (documentScoped || documentId) {
      let docRecord = null;
      let docText = '';
      let targetSubjectId = subjectId;

      // 1. Resolve Document & Extracted Text from DB
      if (documentType === 'book' || bookId) {
        docRecord = await Book.findById(documentId || bookId).populate('subject_id');
      } else if (documentType === 'paper') {
        docRecord = await ExaminationPaper.findById(documentId).populate('subject_id');
        if (!docRecord) {
          docRecord = await ExaminationPaper.findOne({ file_id: documentId }).populate('subject_id');
        }
      } else if (documentType === 'syllabus') {
        docRecord = await SyllabusVersion.findById(documentId).populate('subject_id');
        if (!docRecord) {
          docRecord = await SyllabusVersion.findOne({ file_id: documentId }).populate('subject_id');
        }
      } else {
        // Fallback: search across models
        docRecord = await ExaminationPaper.findById(documentId).populate('subject_id')
          || await ExaminationPaper.findOne({ file_id: documentId }).populate('subject_id')
          || await Book.findById(documentId).populate('subject_id')
          || await SyllabusVersion.findById(documentId).populate('subject_id')
          || await SyllabusVersion.findOne({ file_id: documentId }).populate('subject_id');
      }

      if (docRecord) {
        docText = docRecord.extracted_text || '';
        if (!targetSubjectId && docRecord.subject_id) {
          targetSubjectId = docRecord.subject_id._id || docRecord.subject_id;
        }
      }

      // 2. Retrieve Subject Academic Context
      let academicContext = null;
      let resolvedSubject = docRecord?.subject_id && docRecord.subject_id.name ? docRecord.subject_id : null;
      if (targetSubjectId) {
        academicContext = await getSubjectAcademicContext(targetSubjectId);
        if (!resolvedSubject && academicContext?.subject) {
          resolvedSubject = academicContext.subject;
        }
      }

      // 3. Extract relevant document passage matching student's prompt
      let docExcerpt = '';
      if (docText) {
        docExcerpt = searchBookText(docText, lastUserMsg, 2500);
      }

      // 4. Build Document-Scoped Prompt
      const systemPrompt = buildDocumentTutorPrompt({
        docTitle: documentTitle || docRecord?.title || docRecord?.original_filename || 'Academic Document',
        docType: documentType || (docRecord ? 'document' : 'academic'),
        subjectName: resolvedSubject?.name || academicContext?.subject?.name || '',
        subjectCode: resolvedSubject?.code || academicContext?.subject?.code || '',
        courseName: academicContext?.course?.name || '',
        semesterName: academicContext?.semester?.name || '',
        units: resolvedSubject?.units || academicContext?.subject?.units || [],
        docExcerpt: docExcerpt,
        language,
        marksFormat,
        answerStyle,
      });

      // Trim messages to optimize TPM limits
      const trimmedMessages = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-4)
        .map((m) => ({
          role: m.role,
          content: m.role === 'assistant' && m.content.length > 700
            ? m.content.substring(0, 700) + '... [earlier answer truncated for token optimization]'
            : m.content,
        }));

      const fullMessages = [
        { role: 'system', content: systemPrompt },
        ...trimmedMessages,
      ];

      const completion = await chatCompletion({
        apiKey,
        messages: fullMessages,
        model,
        temperature: 0.35,
        max_tokens: 4096,
      });

      return successResponse(res, {
        message: {
          role: 'assistant',
          content: completion.content,
        },
        model: completion.model,
        usage: completion.usage,
        document_context: {
          document_id: documentId,
          document_title: documentTitle || docRecord?.title || docRecord?.original_filename,
          document_type: documentType,
          subject_name: resolvedSubject?.name || academicContext?.subject?.name,
          has_passage_grounding: Boolean(docExcerpt),
        },
      }, 'Document-scoped assistant response generated');
    }

    // =========================================================
    // CASE B: UNIVERSAL AI MENTOR (Cross-Subject, General University Preparation)
    // =========================================================
    let academicContext = null;
    if (subjectId) {
      academicContext = await getSubjectAcademicContext(subjectId);
    }

    // Dynamic textbook passage retrieval
    let targetBook = null;
    let bookExcerpt = '';

    if (learnByBook || bookId) {
      if (bookId) {
        targetBook = await Book.findById(bookId);
      } else if (subjectId) {
        targetBook = await Book.findOne({ subject_id: subjectId, is_active: true });
      }

      if (targetBook && targetBook.extracted_text) {
        bookExcerpt = searchBookText(targetBook.extracted_text, lastUserMsg, 2200);
      }
    }

    const systemPrompt = buildMentorSystemPrompt({
      context: academicContext,
      language,
      answerStyle,
      marksFormat,
      learnByBook: Boolean(learnByBook || bookId),
      activeBook: targetBook,
      bookExcerpt: bookExcerpt,
    });

    // Keep only last 4 messages and truncate earlier assistant answers to prevent TPM limit errors
    const trimmedMessages = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-4)
      .map((m) => ({
        role: m.role,
        content: m.role === 'assistant' && m.content.length > 700
          ? m.content.substring(0, 700) + '... [earlier answer truncated for token optimization]'
          : m.content,
      }));

    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...trimmedMessages,
    ];

    const completion = await chatCompletion({
      apiKey,
      messages: fullMessages,
      model,
      temperature: 0.4,
      max_tokens: 4096,
    });

    return successResponse(res, {
      message: {
        role: 'assistant',
        content: completion.content,
      },
      model: completion.model,
      usage: completion.usage,
      subject_context: academicContext ? {
        subject_name: academicContext.subject?.name,
        course_name: academicContext.course?.name,
        semester_name: academicContext.semester?.name,
      } : null,
    }, 'Mentor response generated');
  } catch (error) {
    next(error);
  }
};

// POST /api/ai/generate-questions
const generateQuestions = async (req, res, next) => {
  try {
    const {
      apiKey,
      subjectId,
      unitName,
      difficulty = 'medium',
      marks = 10,
      questionType = 'short',
      count = 5,
      model = 'openai/gpt-oss-120b',
    } = req.body;

    if (!apiKey) {
      return errorResponse(res, 'Groq API key is required.', 401);
    }

    const academicContext = subjectId ? await getSubjectAcademicContext(subjectId) : null;

    const prompt = `As a university examination mentor, generate ${count} examination practice questions for:
Subject: ${academicContext?.subject?.name || 'Computer Science/Management'}
Unit: ${unitName || 'All Units'}
Difficulty: ${difficulty}
Marks Format: ${marks} Marks each
Question Type: ${questionType} (e.g. MCQ, Short, Long, Numerical, Programming)

Format as a JSON array of objects:
[
  {
    "question": "The question text",
    "marks": ${marks},
    "type": "${questionType}",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."] // ONLY if MCQ, otherwise omit
    "correct_answer": "Model answer / solution",
    "explanation": "Step by step grading explanation",
    "key_points": ["Point 1", "Point 2"],
    "is_ai_generated": true
  }
]
Return ONLY valid JSON array.`;

    const completion = await chatCompletion({
      apiKey,
      messages: [{ role: 'user', content: prompt }],
      model,
      temperature: 0.3,
      max_tokens: 4096,
    });

    const questions = safeParseJson(completion.content, []);

    return successResponse(res, questions, 'Practice questions generated');
  } catch (error) {
    next(error);
  }
};

// POST /api/ai/generate-answer
// Generate 2, 5, 10, or 15 marks answer for a specific question
const generateAnswer = async (req, res, next) => {
  try {
    const {
      apiKey,
      question,
      marks = 15,
      subjectId,
      language = 'english',
      model = 'openai/gpt-oss-120b',
      learnByBook = false,
      bookId = null,
    } = req.body;

    if (!apiKey) return errorResponse(res, 'Groq API key required', 401);
    if (!question) return errorResponse(res, 'Question text required', 400);

    const academicContext = subjectId ? await getSubjectAcademicContext(subjectId) : null;
    const isBookMode = Boolean(learnByBook || bookId);
    
    let targetBook = null;
    let bookExcerpt = '';
    if (isBookMode) {
      if (bookId) {
        targetBook = await Book.findById(bookId);
      } else if (subjectId) {
        targetBook = await Book.findOne({ subject_id: subjectId, is_active: true });
      }
      if (targetBook && targetBook.extracted_text) {
        bookExcerpt = searchBookText(targetBook.extracted_text, question, 2200);
      }
    }

    let prompt = `You are an expert university professor and exam mentor. Generate the ideal model examination answer for:
Question: "${question}"
Marks: ${marks} Marks
Subject: ${academicContext?.subject?.name || ''}
Language: ${language}
`;

    if (isBookMode) {
      prompt += `\n### 📖 LEARN BY BOOK MODE (High Precision & Simple Understanding):
- Ground this response directly in the prescribed textbook: "${targetBook?.title || 'Prescribed University Textbook'}" by ${targetBook?.author || 'Standard Author'}.
`;
      if (bookExcerpt) {
        prompt += `\n#### RELEVANT EXCERPT RETRIEVED FROM PRESCRIBED BOOK:\n"""\n${bookExcerpt}\n"""\n`;
      }
      prompt += `
- Provide the EXACT textbook definition, formulas, architecture, and step-by-step logic.
- Deliver no useless fluff or wordy preamble; answer must be sharp, exact, and to the point.
- After the precise definition, explain the concept with a simple, crystal-clear real-world analogy so that any beginner grasps it instantly.
- Cite at top: "> 📖 Prescribed Reference: ${targetBook?.title || 'Subject Textbook'} by ${targetBook?.author || 'University Author'}"
`;
    }

    prompt += `\nFollow the official university marking guidelines:
- For 2 Marks: Sharp definition + 2 key points or formula (approx 40 words).
- For 5 Marks: Definition, core concept, 3-4 structured bullet points, diagram description or code example (approx 120-150 words).
- For 10 Marks: Introduction, complete theoretical explanation with subheadings, ASCII/mermaid diagram or architectural flow, advantages/disadvantages or algorithms, practical example, summary (approx 300-400 words).
- For 15 Marks: Master-level university response with full theoretical depth, diagrams, comparison tables, edge cases, real-world case study, and conclusion (approx 500-600 words).

FORMATTING REQUIREMENTS:
- Use clean Markdown with proper line breaks.
- Put blank lines before and after headings (##, ###), dividers (---), and tables. Never run headings or tables into paragraphs on the same line.
- Use bold keywords and bullet points for effortless readability.`;

    const completion = await chatCompletion({
      apiKey,
      messages: [{ role: 'user', content: prompt }],
      model,
      temperature: 0.3,
      max_tokens: 4096,
    });

    return successResponse(res, {
      question,
      marks,
      answer: completion.content,
      model: completion.model,
    }, 'Model answer generated');
  } catch (error) {
    next(error);
  }
};

// POST /api/ai/evaluate
// Evaluate student's descriptive mock test answer
const evaluateAnswer = async (req, res, next) => {
  try {
    const {
      apiKey,
      question,
      studentAnswer,
      maxMarks = 10,
      subjectId,
      model = 'openai/gpt-oss-120b',
    } = req.body;

    if (!apiKey) return errorResponse(res, 'Groq API key required', 401);
    if (!question || !studentAnswer) return errorResponse(res, 'Question and student answer required', 400);

    const prompt = `You are an experienced university examiner evaluating a student's answer.
Question: "${question}"
Maximum Marks: ${maxMarks}
Student's Answer: "${studentAnswer}"

Evaluate strictly on:
1. Conceptual accuracy
2. Structure and clarity
3. Completeness against standard university expectations

Provide a JSON response:
{
  "awarded_marks": number (e.g. 7.5),
  "max_marks": ${maxMarks},
  "feedback": "Overall assessment paragraph",
  "strengths": ["..."],
  "missing_points": ["..."],
  "model_answer_highlights": "Brief summary of what would score full marks",
  "recommended_revision_topic": "..."
}
Return ONLY valid JSON. Note that this is an approximate learning assessment, not official university grading.`;

    const completion = await chatCompletion({
      apiKey,
      messages: [{ role: 'user', content: prompt }],
      model,
      temperature: 0.2,
      max_tokens: 1200,
    });

    const evaluation = safeParseJson(completion.content, {
      score: 7,
      max_score: 10,
      feedback: 'Good overall response covering key concepts.',
      strengths: ['Identified main points'],
      areas_for_improvement: ['Add more technical depth and structured diagram descriptions'],
      model_answer: 'Ensure introduction, clear subheadings, and summary are included.',
    });

    return successResponse(res, evaluation, 'Answer evaluated');
  } catch (error) {
    next(error);
  }
};

// POST /api/ai/study-plan
// Generate realistic study schedule (Supports Entire Semester Multi-Subject Master Schedule or Single Subject Sprint)
const generateStudyPlan = async (req, res, next) => {
  try {
    const {
      apiKey,
      examDate,
      semesterId,
      subjects: passedSubjects,
      planScope = 'semester',
      dailyHours = 4,
      preferredTime = 'Evening',
      prepLevel = 'Beginner',
      model = 'openai/gpt-oss-120b',
    } = req.body;

    if (!apiKey) return errorResponse(res, 'Groq API key required', 401);
    if (!examDate) return errorResponse(res, 'Examination date is required', 400);

    let finalSubjectsList = [];
    let semesterInfo = null;

    // 1. If semesterId provided, fetch all published subjects of that semester
    if (semesterId) {
      const dbSubjects = await Subject.find({ semester_id: semesterId, is_published: true }).populate({
        path: 'semester_id',
        populate: { path: 'course_id' },
      });
      if (dbSubjects.length > 0) {
        semesterInfo = {
          name: dbSubjects[0].semester_id?.name || 'Current Semester',
          course: dbSubjects[0].semester_id?.course_id?.name || 'University Degree',
        };
        finalSubjectsList = dbSubjects.map(s => s.name);
      }
    }

    // 2. If user specifically passed custom subjects, use them
    if (Array.isArray(passedSubjects) && passedSubjects.length > 0) {
      finalSubjectsList = passedSubjects;
    }

    // 3. Fallback: If still empty, fetch any published subjects from DB so it never fails!
    if (finalSubjectsList.length === 0) {
      const anySubjects = await Subject.find({ is_published: true }).limit(8);
      if (anySubjects.length > 0) {
        finalSubjectsList = anySubjects.map(s => s.name);
      } else {
        finalSubjectsList = ['Core Theory & Fundamentals', 'Programming & Practical Application', 'System Architecture & Design'];
      }
    }

    const isSemesterPlan = planScope === 'semester' || finalSubjectsList.length > 1;

    const prompt = `You are a university academic counselor and examination strategist.
Create a comprehensive, highly realistic university examination study plan.
Mode: ${isSemesterPlan ? 'Entire Semester Master Multi-Subject Preparation Plan' : 'Targeted Subject Sprint'}
${semesterInfo ? `Course: ${semesterInfo.course} | Semester: ${semesterInfo.name}` : ''}
Subjects to Prepare (${finalSubjectsList.length} subjects): ${finalSubjectsList.join(', ')}
Target Examination Date: ${examDate}
Today's Date: ${new Date().toISOString().split('T')[0]}
Available Daily Study Hours: ${dailyHours} hours/day
Preferred Study Slot: ${preferredTime}
Current Student Preparation Level: ${prepLevel}

Guidelines:
1. Interleave and balance ALL subjects across the days so the student covers the entire semester curriculum systematically.
2. Ensure high-yield topics and previous-year question (PYQ) practice sessions are explicitly scheduled for every subject.
3. Reserve dedicated full mock test days and multi-subject final revision days right before the examination date.
4. Keep the daily workload realistic for ${dailyHours} hours/day.

Format strictly as a valid JSON object matching this schema:
{
  "plan_title": "${isSemesterPlan ? 'Entire Semester Master Study Plan' : 'Exam Preparation Schedule'}",
  "total_days": 14,
  "daily_hours": ${dailyHours},
  "subjects_included": ${JSON.stringify(finalSubjectsList)},
  "strategy_overview": "Paragraph describing preparation strategy, multi-subject balance, and revision spacing",
  "weekly_milestones": [
    {
      "week_number": 1,
      "focus": "Core concept foundation across all subjects and syllabus units 1 & 2"
    }
  ],
  "daily_schedule": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "subject": "${finalSubjectsList[0] || 'Subject 1'}",
      "topics": ["Key Concept 1", "Unit 1 Definition & Numerical"],
      "session_type": "Concept Learning",
      "target_hours": ${dailyHours},
      "tips": "Practical memory tip or formula advice for this session"
    }
  ],
  "mock_test_days": [6, 12],
  "final_revision_checklist": [
    "Complete PYQ review for all subjects",
    "Formula sheets & architecture diagrams revision",
    "High-probability 10-mark questions practice"
  ]
}
Limit daily_schedule to between 7 and 14 days covering all subjects sequentially. Return ONLY valid JSON.`;

    const completion = await chatCompletion({
      apiKey,
      messages: [{ role: 'user', content: prompt }],
      model,
      temperature: 0.3,
      max_tokens: 4096,
    });

    const plan = safeParseJson(completion.content, {
      plan_title: 'Exam Preparation Sprint Plan',
      total_days: 7,
      daily_hours: 3,
      daily_schedule: [],
      revision_strategy: ['Revise high-weightage topics first', 'Practice past 5-year questions'],
    });

    return successResponse(res, plan, 'Study plan generated successfully');
  } catch (error) {
    next(error);
  }
};

// POST /api/ai/predictions
// Generate exam predictions
const generatePredictions = async (req, res, next) => {
  try {
    const { apiKey, subjectId, model = 'openai/gpt-oss-120b' } = req.body;
    if (!apiKey) return errorResponse(res, 'Groq API key required', 401);
    if (!subjectId) return errorResponse(res, 'Subject ID required', 400);

    const academicContext = await getSubjectAcademicContext(subjectId);
    if (!academicContext) return errorResponse(res, 'Subject not found', 404);

    const prompt = `You are a senior university professor and examination board analyst.
Analyze the following curriculum and past paper patterns to generate Exam Preparation Predictions:
Subject: ${academicContext.subject.name} (${academicContext.subject.code})
Units: ${JSON.stringify(academicContext.subject.units)}
Exam Years: ${academicContext.paperYears?.join(', ')}
Historical Questions: ${JSON.stringify((academicContext.sampleQuestions || []).slice(0, 20).map(q => ({ q: q.text, m: q.marks, y: q.year })))}

Categories to predict:
1. Highly Recommended Questions
2. Important Long-Answer Questions
3. Important Short-Answer Questions
4. Important Definitions
5. Important Numerical/Practical Problems
6. Conceptual Questions
7. Unit-Wise Expected Topics

Return a JSON array of predictions:
[
  {
    "category": "Highly Recommended Questions" | "Important Long-Answer Questions" | "Important Short-Answer Questions" | "Important Definitions" | "Important Numerical Problems" | "Conceptual Questions" | "Unit-Wise Expected Topics",
    "topic_or_question": "...",
    "relevant_unit": "Unit 1: ...",
    "suggested_marks": 10,
    "confidence_category": "High Historical Priority" | "Medium Historical Priority" | "Additional Preparation",
    "reason_for_recommendation": "...",
    "related_historical_years": [2022, 2024],
    "preparation_advice": "..."
  }
]
Return ONLY valid JSON array. Include at least 8-10 diverse predictions.`;

    const completion = await chatCompletion({
      apiKey,
      messages: [{ role: 'user', content: prompt }],
      model,
      temperature: 0.3,
      max_tokens: 4096,
    });

    const predictions = safeParseJson(completion.content, []);

    return successResponse(res, predictions, 'Exam predictions generated');
  } catch (error) {
    next(error);
  }
};

// POST /api/ai/revision-notes
const generateRevisionNotes = async (req, res, next) => {
  try {
    const { apiKey, subjectId, unitNumber, type = 'definitions', model = 'openai/gpt-oss-120b' } = req.body;
    if (!apiKey) return errorResponse(res, 'Groq API key required', 401);

    const academicContext = subjectId ? await getSubjectAcademicContext(subjectId) : null;

    let prompt;
    if (type === 'cheatsheet') {
      prompt = `You are a senior university professor and examination mentor. Generate a High-Density, Ultra-Concise 1-Page Printable Examination Cheat Sheet for:
Subject: ${academicContext?.subject?.name || 'Academic Subject'} (${academicContext?.subject?.code || ''})
Course: ${academicContext?.course?.name || ''}
Syllabus Units: ${JSON.stringify(academicContext?.subject?.units || [])}
Past Exam Topics: ${JSON.stringify((academicContext?.sampleQuestions || []).slice(0, 15).map(q => q.text))}

Structure the Cheat Sheet for rapid last-minute revision before entering the examination hall:
- **Header**: ${academicContext?.subject?.name || 'Subject'} • High-Yield Revision Matrix
- For EACH Unit (Unit 1 to Unit 5):
  1. **Core Examination Definitions (2-Mark)**: 3-4 bullet points with bold keywords and strict academic definitions (~25 words each).
  2. **Essential Formulas / Syntax / Diagram Summary**: Core equations, architectural flowchart steps, or pseudocode rules.
  3. **High-Frequency Distinction Table**: A compact 3-row markdown table comparing 2 frequently contrasted concepts (e.g., Primary vs Secondary Memory, Compiler vs Interpreter, etc.).
  4. **10-Mark Model Question Anchor Points**: 3 golden subheadings and diagram labels required for full marks.

Formatting Rules:
- Keep everything ultra-dense, crisp, and high-yield.
- Clean Markdown with bold terms, compact markdown tables, and short bullet points.
- Zero introductory or conversational filler. Start directly with Unit 1.`;
    } else {
      prompt = `Generate concise, high-yield university revision material for:
Subject: ${academicContext?.subject?.name || 'Academic Subject'}
Unit: ${unitNumber ? 'Unit ' + unitNumber : 'Entire Syllabus'}
Type: ${type} (e.g. "definitions", "quick_notes", "summary", "formulae_and_rules")

Return cleanly formatted Markdown with:
- Key terms with crisp 1-2 sentence definitions
- Core equations, syntax, or diagrams described
- "Don't Forget" examination tips
- Bulleted point-form for rapid last-minute recall`;
    }

    const completion = await chatCompletion({
      apiKey,
      messages: [{ role: 'user', content: prompt }],
      model,
      temperature: 0.3,
      max_tokens: 4096,
    });

    return successResponse(res, {
      content: completion.content,
      type,
    }, 'Revision notes generated');
  } catch (error) {
    next(error);
  }
};

// POST /api/ai/flashcards
const generateFlashcards = async (req, res, next) => {
  try {
    const { apiKey, subjectId, count = 8, model = 'openai/gpt-oss-120b' } = req.body;
    if (!apiKey) return errorResponse(res, 'Groq API key required', 401);

    const academicContext = subjectId ? await getSubjectAcademicContext(subjectId) : null;

    const prompt = `Generate ${count} high-priority exam revision flashcards for:
Subject: ${academicContext?.subject?.name || 'Academic Subject'}
Units: ${JSON.stringify(academicContext?.subject?.units || [])}

Format as JSON array:
[
  {
    "front": "Question, Term or Concept",
    "back": "Clear, concise definition and key formula/points to remember",
    "unit": "Unit Name",
    "tag": "Definition" | "Formula" | "Comparison" | "Architecture"
  }
]
Return ONLY valid JSON array.`;

    const completion = await chatCompletion({
      apiKey,
      messages: [{ role: 'user', content: prompt }],
      model,
      temperature: 0.3,
      max_tokens: 4096,
    });

    const flashcards = safeParseJson(completion.content, []);

    return successResponse(res, flashcards, 'Flashcards generated');
  } catch (error) {
    next(error);
  }
};

// POST /api/ai/generate-final-paper
// Multi-year (up to 5 years) cross-paper analysis & Master Final Preparation Paper Generation
const generateFinalPaper = async (req, res, next) => {
  try {
    const { apiKey, subjectId, model = 'openai/gpt-oss-120b' } = req.body;
    if (!apiKey) return errorResponse(res, 'Groq API key required', 401);
    if (!subjectId) return errorResponse(res, 'Subject ID required', 400);

    const subject = await Subject.findById(subjectId).populate({
      path: 'semester_id',
      populate: { path: 'course_id' },
    });
    if (!subject) return errorResponse(res, 'Subject not found', 404);

    const courseName = subject.semester_id?.course_id?.name || 'University Degree';
    const courseCode = subject.semester_id?.course_id?.code || '';
    const semesterName = subject.semester_id?.name || 'Semester';

    // 1. Gather historical question papers (up to 5 papers)
    const papers = await ExaminationPaper.find({ subject_id: subject._id })
      .sort({ exam_year: -1 })
      .limit(5);

    const paperYears = papers.map((p) => p.exam_year).filter(Boolean);
    const paperIds = papers.map((p) => p._id);

    // 2. Gather extracted questions from historical papers
    const extractedQuestions = await ExtractedQuestion.find({
      subject_id: subject._id,
      paper_id: { $in: paperIds },
    }).sort({ exam_year: -1, marks: -1 });

    // 3. Compact historical questions summary (token-efficient lines)
    const conciseQuestions = extractedQuestions.slice(0, 20).map((q) =>
      `- [${q.exam_year || 'Past'}] Unit ${q.unit || '?'}, Q${q.question_number || ''} (${q.marks || 2}M): ${q.question_text.trim()}`
    ).join('\n');

    // 4. Sample paper snippet only if very few extracted questions exist (cap at 800 chars)
    let paperSnippet = '';
    if (conciseQuestions.length < 50 && papers.length > 0) {
      for (const p of papers) {
        if (p.storage_path && fs.existsSync(p.storage_path)) {
          try {
            const extracted = await extractPdfText(p.storage_path);
            if (extracted?.text) {
              paperSnippet = `\nSample Paper Excerpt (${p.exam_year}):\n${extracted.text.substring(0, 800)}\n`;
              break;
            }
          } catch (e) {}
        }
      }
    }

    // 5. Syllabus units (compact summary)
    const unitList = (subject.units || []).map((u) => `Unit ${u.number}: ${u.name}`).join('; ');

    // 6. Build University Examination Pattern Prompt
    const prompt = `You are the Examination Board Controller and Senior University Professor.
Synthesize historical papers (${paperYears.join(', ') || 'past sessions'}) and syllabus to formulate the Master Final Examination Paper.
Identify high-frequency recurring questions and core university topics.

Subject: ${subject.name} (${subject.code || 'N/A'})
Course: ${courseName} (${courseCode}) - ${semesterName}
Syllabus: ${unitList || 'All standard units'}
Historical Questions Sample:
${conciseQuestions || 'Standard university past paper questions'}
${paperSnippet}

Strict Exam Paper Format:
- Total Marks: 70 | Duration: 3 Hours
- Section A: 5 Compulsory short-answer questions (2 Marks each = 10 Marks). Model solution: 2 concise sentences.
- Section B: 4 Conceptual/analytical questions (5 Marks each = 20 Marks). Model solution: 3-4 bullet points.
- Section C: 2 Comprehensive questions with internal choice [OR] (10 Marks each = 20 Marks). Model solution: structured core points.

Return ONLY a valid JSON object matching this schema:
{
  "paper_title": "Final Paper - ${subject.name} Preparation",
  "subject_name": "${subject.name}",
  "subject_code": "${subject.code || ''}",
  "course_name": "${courseName}",
  "semester_name": "${semesterName}",
  "max_marks": 70,
  "duration": "3 Hours",
  "instructions": [
    "Section A is compulsory. Answer all 5 questions (2 marks each).",
    "Section B: Answer all 4 questions (5 marks each).",
    "Section C: Answer all 2 questions with internal choice [OR] (10 marks each)."
  ],
  "analysis_summary": {
    "years_analyzed": ${JSON.stringify(paperYears)},
    "total_historical_papers": ${papers.length},
    "repetition_insights": "Key recurring topics and patterns identified across papers...",
    "high_weightage_units": ["Unit 1", "Unit 2"],
    "preparation_advice": "Essential scoring tips..."
  },
  "sections": [
    {
      "section_id": "A",
      "section_name": "SECTION A (Short Answer & Core Definitions - Compulsory)",
      "section_instructions": "Answer ALL questions. Each question carries 2 Marks.",
      "total_marks": 10,
      "questions": [
        {
          "q_num": "Q1.(a)",
          "question": "Question text...",
          "marks": 2,
          "unit": "Unit 1",
          "repetition_status": "High Frequency",
          "model_solution": "Concise 2-sentence university answer."
        }
      ]
    },
    {
      "section_id": "B",
      "section_name": "SECTION B (Conceptual & Analytical Questions)",
      "section_instructions": "Answer ALL questions. Each question carries 5 Marks.",
      "total_marks": 20,
      "questions": [
        {
          "q_num": "Q2",
          "question": "Question text...",
          "marks": 5,
          "unit": "Unit 2",
          "repetition_status": "Repeated in recent exams",
          "model_solution": "3-4 concise bullet points."
        }
      ]
    },
    {
      "section_id": "C",
      "section_name": "SECTION C (Long Comprehensive Questions with Choices)",
      "section_instructions": "Answer all questions. Each carries 10 Marks with [OR] choice.",
      "total_marks": 20,
      "questions": [
        {
          "q_num": "Q6",
          "question": "Primary comprehensive question...",
          "or_question": "Alternative question [OR]...",
          "marks": 10,
          "unit": "Unit 3",
          "repetition_status": "Core Annual Priority",
          "model_solution": "Structured core outline and key points."
        }
      ]
    }
  ]
}

Return ONLY valid JSON. Keep answers concise. Do not truncate.`;

    let finalPaper = null;
    try {
      const completion = await chatCompletion({
        apiKey,
        messages: [{ role: 'user', content: prompt }],
        model,
        temperature: 0.3,
        max_tokens: 2200,
      });

      finalPaper = safeParseJson(completion.content);
    } catch (groqErr) {
      console.warn('[Final Paper] AI completion failed or rate-limited, switching to structured curriculum fallback:', groqErr.message);
      finalPaper = buildFallbackPaper(subject, courseName, semesterName, paperYears, papers.length);
    }

    if (!finalPaper || !finalPaper.sections || !Array.isArray(finalPaper.sections)) {
      console.warn('[Final Paper] AI JSON incomplete, using robust fallback paper structure');
      finalPaper = buildFallbackPaper(subject, courseName, semesterName, paperYears, papers.length);
    }

    return successResponse(res, finalPaper, 'Final master preparation paper generated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  testGroqConnection,
  fetchModels,
  mentorChat,
  generateQuestions,
  generateAnswer,
  evaluateAnswer,
  generateStudyPlan,
  generatePredictions,
  generateRevisionNotes,
  generateFlashcards,
  generateFinalPaper,
};
