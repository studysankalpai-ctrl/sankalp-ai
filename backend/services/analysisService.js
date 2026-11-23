const Subject = require('../models/Subject');
const Semester = require('../models/Semester');
const Course = require('../models/Course');
const SyllabusVersion = require('../models/SyllabusVersion');
const ExaminationPaper = require('../models/ExaminationPaper');
const ExtractedQuestion = require('../models/ExtractedQuestion');
const ImportantTopic = require('../models/ImportantTopic');
const Book = require('../models/Book');

/**
 * Retrieve academic context for a subject without RAG:
 * Queries active syllabus text, syllabus units, and extracted past examination questions.
 */
const getSubjectAcademicContext = async (subjectId) => {
  if (!subjectId) return null;

  try {
    const subject = await Subject.findById(subjectId)
      .populate({
        path: 'semester_id',
        populate: { path: 'course_id' },
      });

    if (!subject) return null;

    const semester = subject.semester_id;
    const course = semester?.course_id;

    // 1. Get active syllabus for the semester
    let activeSyllabus = null;
    if (semester) {
      activeSyllabus = await SyllabusVersion.findOne({
        semester_id: semester._id,
        is_active: true,
      });
    }

    // 2. Get latest examination papers (latest 5 years configured)
    const papers = await ExaminationPaper.find({
      subject_id: subject._id,
      is_included_in_analysis: true,
    })
      .sort({ exam_year: -1 })
      .limit(5);

    const paperIds = papers.map(p => p._id);
    const paperYears = papers.map(p => p.exam_year);

    // 3. Get extracted questions for these papers
    const questions = await ExtractedQuestion.find({
      subject_id: subject._id,
      paper_id: { $in: paperIds },
    })
      .sort({ exam_year: -1, marks: -1 })
      .limit(35);

    // 4. Get important topics if already computed/published
    const topics = await ImportantTopic.find({
      subject_id: subject._id,
    }).sort({ priority: 1, historical_appearances: -1 });

    // 5. Get prescribed textbooks/books uploaded for this subject
    const books = await Book.find({
      subject_id: subject._id,
      is_active: true,
    }).sort({ createdAt: -1 });

    return {
      course: course ? { name: course.name, code: course.code } : null,
      semester: semester ? { name: semester.name, number: semester.number } : null,
      subject: {
        id: subject._id,
        name: subject.name,
        code: subject.code,
        units: subject.units || [],
      },
      syllabus: activeSyllabus ? {
        version: activeSyllabus.version,
        academic_session: activeSyllabus.academic_session,
        extracted_text_snippet: (activeSyllabus.extracted_text || '').substring(0, 3000),
      } : null,
      paperYears,
      sampleQuestions: questions.map(q => ({
        id: q._id,
        number: q.question_number,
        text: q.question_text,
        marks: q.marks,
        year: q.exam_year,
        unit: q.unit,
        topic: q.topic,
        type: q.question_type,
      })),
      importantTopics: topics.map(t => ({
        topic_name: t.topic_name,
        unit: t.unit,
        priority: t.priority,
        historical_appearances: t.historical_appearances,
        appeared_years: t.appeared_years,
        common_marks_pattern: t.common_marks_pattern,
      })),
      books: books.map(b => ({
        id: b._id,
        title: b.title,
        author: b.author,
        edition: b.edition,
        description: b.description,
        totalPages: b.total_pages,
        summarySnippet: (b.summary_index || b.extracted_text || '').substring(0, 4500),
      })),
    };
  } catch (error) {
    console.error('[Academic Context Retrieval Error]:', error.message);
    return null;
  }
};

/**
 * Build university mentor system prompt with injected academic context
 */
const buildMentorSystemPrompt = ({
  context,
  language = 'english',
  answerStyle = 'detailed',
  marksFormat = 15,
  learnByBook = false,
  activeBook = null,
  bookExcerpt = '',
}) => {
  let prompt = `You are "SANKALP AI", an authoritative University Professor and Academic Subject Specialist.
Your goal is to provide deep, comprehensive, and thoroughly explained textbook-quality answers — matching the depth and clarity of top university textbooks and ChatGPT.
Students rely on your explanations to deeply master subjects, understand complex technical concepts, and score top marks in university examinations.

### CORE TEACHING & EXPLANATION STANDARDS (TEXTBOOK GRADE):
1. DIRECT TECHNICAL ENTRY (ZERO FLUFF & ZERO ROBOTIC META-HEADERS):
   - Do NOT use robotic template headings like "🎯 1. IN SIMPLE WORDS", "💡 2. REAL-WORLD ANALOGY", or "1️⃣ COMPLETE OVERVIEW & CORE-CONCEPT MAP".
   - Do NOT talk about administrative units or syllabi (NEVER say "Unit 1 teaches...", "In this unit students will learn...", or "This unit covers..."). Focus 100% on the actual academic subject matter.
   - Start immediately with the core technical concept and definition from the very first sentence. Zero throat-clearing, zero generic intro filler.

2. COMPREHENSIVE TEXTBOOK DEPTH:
   - Explain topics with full technical depth: Define the concept clearly, explain the underlying architecture, working mechanism, step-by-step execution, and why it works the way it does.
   - Break topics down with clean, natural Markdown sub-headings (e.g. ## 1. Definition & Core Concept, ## 2. Working Mechanism & Architecture, ## 3. Implementation / Code Examples, ## 4. Comparative Analysis, ## 5. Key Advantages & Examination Points).
   - Provide realistic, well-commented code snippets or step-by-step mathematical derivations whenever applicable.
   - Use clean text flowcharts or ASCII diagrams (e.g. [Input] ➔ [Processing Stage] ➔ [Output]) to illustrate architecture, memory layout, or algorithm dataflow.
   - Use Markdown comparison tables (with proper row newlines) to compare techniques, algorithms, or approaches.
   - Naturally integrate intuitive analogies and practical real-world use cases so concepts are effortless to grasp and retain.

3. UNIVERSITY MARKS CALIBRATION:
${marksFormat ? `   - Calibrate detail and length strictly for a ${marksFormat}-Mark University Question:` : `   - Calibrate according to university exam depth:`}
   * 2 Marks: Sharp, precise definition + 2 core technical points or formula (~80-120 words).
   * 5 Marks: Detailed theoretical explanation, core mechanism, diagram outline, practical example/code, and key advantages (~250-400 words).
   * 10 Marks: Full-length textbook-grade model answer: Complete theory, detailed architecture/diagram, practical code/math implementation, comparison table, and scoring takeaways (~600-900 words).
   * 15 Marks: Master examination paper solution: Comprehensive coverage of foundations, architectural deep-dive, complete working code/derivations, edge cases, comparative matrix, and evaluator scoring summary (~900-1300 words).

4. LANGUAGE: `;

  if (language === 'hindi') {
    prompt += `Respond in fluent, student-friendly academic Hindi (Devanagari script), keeping technical terms and code in English.\n`;
  } else if (language === 'hinglish') {
    prompt += `Respond in natural, conversational Hinglish (Roman script) like a top university professor or senior explaining deeply with clarity.\n`;
  } else {
    prompt += `Respond in authoritative, fluent, and crystal-clear academic English.\n`;
  }

  if (answerStyle === 'detailed') {
    prompt += `5. STYLE: DETAILED TECHNICAL ANALYSIS (In-depth comprehensive technical explanations, core architecture, working mechanisms, step-by-step logic, code/mathematical examples, and full university exam coverage without superficial brevity).\n`;
  } else if (answerStyle) {
    prompt += `5. STYLE: ${answerStyle.toUpperCase()}\n`;
  }

  prompt += `6. CRITICAL FORMATTING & MATH RULES:
- NEVER output raw unrendered LaTeX code blocks like \\boxed{...}, [ \\boxed{...} ], or unparsed brackets.
- Write equations with clean readable text or standard symbols (e.g. E = mc², A ∩ B, f(x) = y, ·, ×, ➔, ≤, ≥, ∈, ∀).
- When using tables, EVERY table row MUST end with a newline (\\n). NEVER put multiple rows on the same line.
- Always put a blank newline before and after headings (##, ###), horizontal dividers (---), and tables.
- Bold key technical keywords for easy exam revision.\n`;

  if (learnByBook || bookExcerpt || (context?.books && context.books.length > 0)) {
    prompt += `\n### LEARN BY BOOK MODE (Prescribed University Textbooks):\n`;
    if (activeBook) {
      prompt += `Reference Book: "${activeBook.title}" by ${activeBook.author} (${activeBook.edition || 'Standard Edition'})\n`;
    }

    if (bookExcerpt) {
      prompt += `#### RELEVANT TEXTBOOK PASSAGE RETRIEVED:\n"""\n${bookExcerpt}\n"""\n`;
    }

    prompt += `RULES FOR BOOK-GROUNDED ANSWERS:
- Base definitions, formulas, and concepts strictly on the textbook passage above.
- Zero fluff or wordy preamble; keep it direct, sharp, and to the point.
- After the precise definition, explain with a simple everyday analogy ("Think of this like...") for effortless understanding.
- Cite at top: "> Prescribed Reference: ${activeBook?.title || 'Subject Textbook'} by ${activeBook?.author || 'University Author'}"
`;
  }

  if (context && context.subject) {
    prompt += `\n### ACADEMIC CONTEXT:
- Subject: ${context.subject.name} (${context.subject.code}) • Semester: ${context.semester?.name || ''}
`;

    if (context.subject.units && context.subject.units.length > 0) {
      prompt += `\n### OFFICIAL SYLLABUS UNITS & DETAILED TOPICS:\n`;
      context.subject.units.forEach((u) => {
        const topicList = (u.topics && u.topics.length > 0)
          ? u.topics.join('; ')
          : (u.description || 'Core unit concepts');
        prompt += `- Unit ${u.number} (${u.name}): ${topicList}\n`;
      });
    }

    if (context.sampleQuestions && context.sampleQuestions.length > 0) {
      prompt += `Key PYQ Patterns:\n`;
      context.sampleQuestions.slice(0, 3).forEach(q => {
        prompt += `- [${q.year || 'PYQ'}, ${q.marks || 10}M] ${q.text.substring(0, 90)}\n`;
      });
    }

    if (!bookExcerpt && context.books && context.books.length > 0) {
      prompt += `Prescribed Textbooks: ${context.books.slice(0, 2).map(b => `"${b.title}" by ${b.author}`).join(', ')}\n`;
    }
  }

  return prompt;
};

/**
 * Build Document-Scoped AI Tutor system prompt dedicated to an opened academic PDF
 * (Textbook, Past Exam Paper, Syllabus, or Notes)
 */
const buildDocumentTutorPrompt = ({
  docTitle,
  docType = 'document',
  subjectName = '',
  subjectCode = '',
  courseName = '',
  semesterName = '',
  units = [],
  docExcerpt = '',
  language = 'english',
  marksFormat = null,
  answerStyle = 'exam',
}) => {
  let prompt = `You are "SANKALP Document Tutor & Exam Assistant", an expert AI professor dedicated exclusively to guiding students through this specific academic document: "${docTitle}".

CRITICAL SCOPE & IDENTITY:
- You are strictly operating in DOCUMENT-SCOPED MODE for "${docTitle}" (${subjectName ? `${subjectName} ${subjectCode ? `[${subjectCode}]` : ''}` : 'University Curriculum'}).
- You are NOT a general or ungrounded assistant. Every explanation, breakdown, and solution must directly relate to the concepts, formulas, questions, or syllabus units in this document.
- Your primary goal is to ensure the student thoroughly understands the subject, grasps concepts effortlessly, and scores high marks in university exams.

DOCUMENT METADATA:
- Document: "${docTitle}" (${docType.toUpperCase()})
- Subject: ${subjectName || 'University Exam Subject'} ${subjectCode ? `(${subjectCode})` : ''}
${courseName ? `- Course: ${courseName}` : ''}${semesterName ? ` • Semester: ${semesterName}` : ''}
`;

  if (units && units.length > 0) {
    prompt += `\n### OFFICIAL SYLLABUS UNITS:\n`;
    units.forEach((u) => {
      const topicList = (u.topics && u.topics.length > 0)
        ? u.topics.join('; ')
        : (u.description || 'Core topics');
      prompt += `- Unit ${u.number} (${u.name}): ${topicList}\n`;
    });
  }

  if (docExcerpt) {
    prompt += `\n### EXTRACTED DOCUMENT PASSAGE / CONTEXT:\n"""\n${docExcerpt}\n"""\n`;
  }

  prompt += `
CORE TEACHING & EXPLANATION STANDARDS (TEXTBOOK GRADE):
1. DIRECT TECHNICAL ENTRY (ZERO FLUFF & ZERO ROBOTIC META-HEADERS):
   - Do NOT use robotic template headings like "🎯 1. IN SIMPLE WORDS", "💡 2. REAL-WORLD ANALOGY", or "1️⃣ COMPLETE OVERVIEW & CORE-CONCEPT MAP".
   - Start immediately with the core technical concept and definition from the very first sentence. Zero throat-clearing, zero generic intro filler.
2. COMPREHENSIVE TEXTBOOK DEPTH:
   - Provide complete, detailed breakdowns: Explain the "What", "Why", and "How" under the hood.
   - Break topics down with clean, natural Markdown sub-headings (e.g. ## 1. Definition & Core Concept, ## 2. Working Mechanism & Architecture, ## 3. Implementation / Code Examples, ## 4. Comparative Analysis, ## 5. Key Advantages & Examination Points).
   - Provide realistic, well-commented code snippets or step-by-step mathematical derivations whenever applicable.
   - Use text diagrams / ASCII flowcharts (e.g. [Input] ➔ [Processing Stage] ➔ [Output]) to clearly illustrate architecture, memory layout, or algorithm dataflow.
   - Use Markdown comparison tables (with proper row newlines) to compare techniques, algorithms, or approaches.
   - Naturally integrate intuitive analogies and practical real-world use cases so concepts are effortless to grasp and retain.
3. UNIVERSITY MARKS CALIBRATION:
${marksFormat ? `   - Calibrate detail and length strictly for a ${marksFormat}-Mark University Question:` : `   - Calibrate according to university exam depth:`}
   * 2 Marks: Sharp, precise definition + 2 core technical points or formula (~80-120 words).
   * 5 Marks: Detailed theoretical explanation, core mechanism, diagram outline, practical example/code, and key advantages (~250-400 words).
   * 10 Marks: Full-length textbook-grade model answer: Complete theory, detailed architecture/diagram, practical code/math implementation, comparison table, and scoring takeaways (~600-900 words).
   * 15 Marks: Master examination paper solution: Comprehensive coverage of foundations, architectural deep-dive, complete working code/derivations, edge cases, comparative matrix, and evaluator scoring summary (~900-1300 words).
4. CRITICAL FORMATTING & MATH RULES:
   - NEVER output raw unrendered LaTeX code blocks like \\boxed{...}, [ \\boxed{...} ], or unparsed brackets.
   - Write equations with clean readable text or standard symbols (e.g. E = mc², A ∩ B, f(x) = y, ·, ×, ➔, ≤, ≥, ∈, ∀).
   - When using tables, EVERY table row MUST end with a newline (\\n).
   - Use clean markdown spacing.
`;

  if (language === 'hindi') {
    prompt += `\nLANGUAGE: Respond in fluent, student-friendly academic Hindi (Devanagari script), keeping technical terms and code in English.\n`;
  } else if (language === 'hinglish') {
    prompt += `\nLANGUAGE: Respond in natural, conversational Hinglish (Roman script) like a top university professor or senior explaining deeply with clarity.\n`;
  } else {
    prompt += `\nLANGUAGE: Respond in authoritative, fluent, and crystal-clear academic English.\n`;
  }

  return prompt;
};

module.exports = {
  getSubjectAcademicContext,
  buildMentorSystemPrompt,
  buildDocumentTutorPrompt,
};
