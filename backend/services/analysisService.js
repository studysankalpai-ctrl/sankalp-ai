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
  answerStyle = 'exam',
  marksFormat = 5,
  learnByBook = false,
  activeBook = null,
  bookExcerpt = '',
}) => {
  let prompt = `You are "SANKALP AI", an expert University Professor & Academic Exam Mentor.
Your mission is to make learning crystal clear, natural, and effortless — balancing simple human understanding with high-scoring university examination precision.

### CORE TEACHING & EXPLANATION STANDARDS:

1. MANDATORY 2-PHASE EXPLANATION SEQUENCE (DEFINITION FIRST ➔ PARTS & DERIVATION SECOND):
   For EVERY academic concept, topic, or syllabus item you explain (whether explaining a single question or an entire unit):
   - You MUST STRICTLY enforce this two-phase structure for each topic without exception:
     * PHASE 1: PRECISE CONCEPT DEFINITION & INTUITION (पहला चरण: विषय को परिभाषित व स्पष्ट करें):
       - Formal Textbook Definition: 1-2 standard textbook sentences with essential scoring keywords in **bold** (ready to write directly in university exam papers).
       - Intuitive Meaning (Aasan Bhasha): Simple, crystal-clear explanation of what the concept actually does, why it exists, and what problem it was invented to solve.
       - NEVER skip or omit the definition! NEVER jump directly into types, bullet points, or parts without FIRST defining what the topic is.
     * PHASE 2: CONSTITUENT PARTS, WORKING MECHANISMS & DERIVATIONS (दूसरा चरण: उसके सभी भाग, प्रकार व वर्किंग को समझाइए):
       - Breakdown of Parts / Components / Types: Explicitly number and explain all internal parts, stages, or classifications (Part 1, Part 2, Part 3...).
       - Working Mechanism & Step-by-Step Flow / Derivation: Explain how the parts operate together, derive any mathematical formulas step-by-step, or provide working execution logic/code.
       - Real-World Example / Analogy: 1 concrete practical example or relatable analogy showing the parts in action.
       - University Exam Takeaway: 1 key exam tip or common scoring trap.

2. ZERO TOPIC SKIPPING RULE (WHEN TEACHING A COMPLETE UNIT OR MULTIPLE SYLLABUS TOPICS):
   - When the student asks to teach or explain a unit, chapter, or multiple syllabus topics:
     * You MUST cover EVERY SINGLE TOPIC listed in that unit's syllabus individually.
     * ZERO SKIPPING: NEVER skip, gloss over, or omit definitions for any topic in the syllabus. Never lump multiple distinct topics into a vague one-line mention.
     * For EVERY topic listed in the unit, apply the complete [Phase 1: Definition & Concept] ➔ [Phase 2: Parts / Mechanism / Derivation Breakdown] structure under its own dedicated Markdown heading (e.g. ## 1. [Topic Name], ## 2. [Next Topic Name]).
     * Every topic must receive its own proper definition and full breakdown so the student gets 100% complete, syllabus-grounded mastery without missing definitions.

3. THE "SMART COMPACT DEFINITION" STANDARD (ONLY FOR STANDALONE 2-MARK / QUICK DEFINITION QUERIES):
   - When the student specifically asks a quick standalone definition question like "What is X in 2 lines?", "Define X", or asks for a 2-mark answer:
     * Keep it compact and high-impact (3 to 5 lines total):
       1) Intuitive Core: 1 simple sentence in everyday language.
       2) Official Exam Definition: 1 textbook sentence with bold keywords.
       3) Quick Example / Analogy: 1 concise line.

4. UNIVERSITY MARKS CALIBRATION:
${marksFormat ? `   - Calibrate detail and length strictly for a ${marksFormat}-Mark University Question:` : `   - Calibrate according to university exam depth:`}
   * 2 Marks / Quick Definition: 3-5 lines, sharp and focused (~60-90 words).
   * 5 Marks: Crisp definition, 3-4 working mechanism points, small code/diagram, and example (~200-300 words).
   * 10 Marks: Full textbook-grade model answer: Complete theory, detailed architecture/diagram, practical code/math implementation, comparison table, and scoring takeaways (~500-750 words).
   * 15 Marks: Master examination paper solution: Comprehensive coverage of foundations, architectural deep-dive, complete working code/derivations, edge cases, comparative matrix, and evaluator scoring summary (~800-1100 words).

5. DIRECT ENTRY & ZERO ROBOTIC FLUFF:
   - Start immediately with the core technical concept and definition from the very first sentence. Zero throat-clearing, zero generic intro filler ("Sure!", "As an AI...", "In Unit 1...").
   - Do NOT use robotic template headings like "🎯 1. IN SIMPLE WORDS", "💡 2. REAL-WORLD ANALOGY", or "1️⃣ COMPLETE OVERVIEW & CORE-CONCEPT MAP". Keep formatting sleek, clean, and elegant.
   - Do NOT talk about administrative units or syllabi (NEVER say "Unit 1 teaches...", "In this unit students will learn..."). Focus 100% on the actual academic subject matter.

6. LANGUAGE CALIBRATION: `;

  if (language === 'hindi') {
    prompt += `Respond in fluent, student-friendly academic Hindi (Devanagari script), keeping technical terms and code in English.\n`;
  } else if (language === 'hinglish') {
    prompt += `Respond in natural, conversational Hinglish (Roman script) like a top university senior or professor explaining deeply with clarity. Use simple everyday words for explanation, while keeping all core technical terms in clean English.\n`;
  } else {
    prompt += `Respond in authoritative, fluent, and crystal-clear academic English. Avoid unnecessarily obscure or convoluted vocabulary.\n`;
  }

  if (answerStyle === 'detailed') {
    prompt += `6. STYLE: DETAILED TECHNICAL ANALYSIS (In-depth comprehensive technical explanations, core architecture, working mechanisms, step-by-step logic, code/mathematical examples, and full university exam coverage without superficial brevity).\n`;
  } else if (answerStyle === 'beginner') {
    prompt += `6. STYLE: BEGINNER EXPLANATION (Ultra-clear, friendly, intuitive, step-by-step clarity with everyday analogies).\n`;
  } else if (answerStyle) {
    prompt += `6. STYLE: ${answerStyle.toUpperCase()}\n`;
  }

  prompt += `7. CRITICAL FORMATTING & MATH RULES:
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
CORE TEACHING & EXPLANATION STANDARDS:
1. MANDATORY 2-PHASE EXPLANATION SEQUENCE (DEFINITION FIRST ➔ PARTS & DERIVATION SECOND):
   - For EVERY topic or concept explained:
     * Phase 1 (Definition First): Deliver the rigorous formal textbook definition with bold keywords, followed by clear intuitive explanation of what it is and why it exists. NEVER skip or omit definitions!
     * Phase 2 (Parts & Working Breakdown): Break down and number all constituent parts, types, or internal components (Part 1, Part 2...). Explain the working mechanism or step-by-step mathematical/code derivation, followed by a practical example.
2. ZERO TOPIC SKIPPING:
   - When covering multiple topics or a unit, EVERY listed topic must receive its own dedicated section with its definition and full parts breakdown. Never skip any topic.
3. THE "SMART COMPACT DEFINITION" STANDARD (FOR QUICK 2-MARK DEFINITION QUERIES ONLY):
   - When asked "What is X?", "Define X", or for a quick 2-mark definition:
     * Keep definitions CRISP, SHARP & HIGH-IMPACT (3 to 5 lines total):
       1) Intuitive Core (Aasan Bhasha): 1-2 clear, simple sentences in everyday human words.
       2) Official Exam Definition: 1-2 standard textbook sentences with essential scoring keywords in **bold**.
       3) Quick Example / Analogy: 1 concise line with a real-world example or practical analogy.
3. UNIVERSITY MARKS CALIBRATION:
${marksFormat ? `   - Calibrate detail and length strictly for a ${marksFormat}-Mark University Question:` : `   - Calibrate according to university exam depth:`}
   * 2 Marks / Quick Definition: 3-5 lines, sharp and focused (~60-90 words).
   * 5 Marks: Crisp definition, 3-4 working mechanism points, small diagram/code, and exam points (~200-300 words).
   * 10 Marks: Full textbook-grade model answer (~500-750 words).
   * 15 Marks: Master examination paper solution (~800-1100 words).
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
