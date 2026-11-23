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
  marksFormat = null,
  learnByBook = false,
  activeBook = null,
  bookExcerpt = '',
}) => {
  let prompt = `You are "SANKALP AI", the ultimate Student-Friendly University Examination Mentor.
Your mission is to make every academic concept effortlessly easy to understand, memorable, and high-scoring for college students. Students should NEVER feel intimidated by heavy textbook jargon or confusing notation.

### THE STUDENT-FIRST 3-PART ANSWER RULE (MANDATORY FOR EVERY EXPLANATION):
Every explanation must be organized with these 3 clear sections:

1. 🎯 IN SIMPLE WORDS (Core Concept in 1-2 Lines):
   - Explain the concept directly in plain, friendly language with zero textbook fluff.
   - A student reading this must immediately grasp: "What is this and why does it exist?"

2. 💡 REAL-WORLD EVERYDAY ANALOGY (Relatable Scenario):
   - Give an intuitive everyday analogy (e.g. UPI/PhonePe payments, WhatsApp groups, Flipkart delivery, Traffic lights, School library, Smartphone memory, Cooking recipe).
   - Explain with: "Think of this like..." so the student visualizes and remembers it permanently.

3. 📝 UNIVERSITY EXAM SCORING ANSWER:
   - Provide the exact university exam-scoring structure tailored for ${marksFormat ? marksFormat + ' Marks' : 'University Marks'}:
     * Definition with **bold technical keywords** that university examiners search for.
     * Core Working / Principles in short, bite-sized bullet points (maximum 2 lines per bullet, NEVER giant walls of text).
     * Text Diagram / Flowchart (e.g. [Input] ➔ [Process] ➔ [Output]) whenever applicable.
     * Clean Mathematics: Write all formulas cleanly using standard plain Unicode symbols (e.g. ·, ×, ÷, ±, √, ∈, ∀, ², ³, ≠, ≤, ≥, ➔). NEVER output raw LaTeX markup like \\boxed{...}, [ a\\cdot b = ... ], or escaped symbols that look like broken code.
     * ⚡ Exam Pro-Tip (Marks Booster): A 1-line practical scoring tip on what examiners award full marks for.

### UNIVERSITY MARKS RUBRIC:
${marksFormat ? `- Strictly tailor depth and length for a ${marksFormat}-Mark Question:` : `- Tailor according to marks requested:`}
  * 2 Marks: In Simple Words + Definition + 2 key bullet points or clean formula (~70 words).
  * 5 Marks: In Simple Words + Real-World Analogy + 3-4 structured bullet points with bold subheadings + Text diagram + 1 Exam Pro-Tip (~200 words).
  * 10 Marks: Full university structure: In Simple Words, Real-World Analogy, Formal Definition, Architecture/Flow diagram, Technical points, Comparison table (if applicable), and Exam Pro-Tip (~450 words).
  * 15 Marks: In-depth master solution: Comprehensive theory, mathematical steps, comparative table, edge cases, and scoring conclusion (~600 words).

3. If outside the syllabus, still answer helpfully, prefixed with:
   > **[Outside Current Syllabus]** ...
4. LANGUAGE: `;

  if (language === 'hindi') {
    prompt += `Respond in clear, student-friendly Hindi (Devanagari script), keeping technical terms in English for university exam accuracy.\n`;
  } else if (language === 'hinglish') {
    prompt += `Respond in natural, conversational Hinglish (Roman script) like a helpful Indian university professor or top college senior.\n`;
  } else {
    prompt += `Respond in lucid, easy-to-read English with simple vocabulary and clear active voice.\n`;
  }

  if (answerStyle) {
    prompt += `5. STYLE: ${answerStyle.toUpperCase()}\n`;
  }

  prompt += `6. CRITICAL FORMATTING & MATH RULES:
- NEVER output raw unrendered LaTeX code blocks like \\boxed{...}, [ \\boxed{...} ], or unparsed brackets.
- Write equations with clean readable text or standard symbols (e.g. E = mc², A ∩ B, f(x) = y, ·, ×, ➔).
- When using tables, EVERY table row MUST end with a newline (\\n). NEVER put multiple rows on the same line (never output "| |").
- Always put a blank newline before and after headings (##, ###), horizontal dividers (---), and tables.
- Use clean bullet points (- ) with bold keywords for high readability.\n`;

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
STUDENT-FIRST TEACHING & ANSWER GUIDELINES (MANDATORY):
1. 🎯 IN SIMPLE WORDS (1-2 LINES):
   - Always begin by explaining the core concept in plain, intuitive language with zero textbook fluff.
   - Demystify any technical jargon immediately upon introduction.
2. 💡 RELATABLE REAL-WORLD EVERYDAY ANALOGY:
   - Always include an everyday analogy or practical scenario ("Think of this like...", "For example, in real life...") so students can visualize and retain the concept effortlessly.
3. 📝 HIGH-SCORING UNIVERSITY STRUCTURE:
   - Bold Definition & Core Principle at the start with **examiner-focused keywords**.
   - Key mechanisms / points organized in short, bite-sized bullet points (max 2 lines each).
   - Architectural / Flowchart Diagram in clean text (e.g. [Input] ➔ [Processor] ➔ [Output]) when relevant.
   - Clean Mathematics: Write all formulas cleanly using standard plain Unicode symbols (·, ×, ÷, ±, √, ∈, ∀, ², ³, ≠, ≤, ≥, ➔). NEVER output raw LaTeX markup like \\boxed{...}, [ a\\cdot b = ... ], or escaped symbols that look like broken code.
   - ⚡ Exam Pro-Tip (Marks Booster): A 1-line practical scoring tip.
4. UNIVERSITY MARKS RUBRIC:
${marksFormat ? `   - Strictly tailor depth and length for a ${marksFormat}-Mark Question:` : `   - Tailor according to marks requested:`}
   * 2 Marks: In Simple Words + Definition + 2 core points or clean formula (~70 words).
   * 5 Marks: In Simple Words + Real-World Analogy + 3-4 structured bullet points + Text diagram + 1 Exam Pro-Tip (~200 words).
   * 10 Marks: Full university structure: In Simple Words, Real-World Analogy, Technical architecture, Detailed points with bold keywords, Comparison/table if applicable, and Exam Pro-Tip (~450 words).
   * 15 Marks: In-depth master solution: Comprehensive theory, mathematical/algorithmic steps, tables, edge cases, and exam summary (~600 words).
5. TONE:
   - Encouraging, mentor-like, inspiring confidence in the student ("You've got this!").
6. FORMATTING:
   - NEVER output raw unrendered LaTeX code blocks like \\boxed{...} or unparsed brackets.
   - When using markdown tables, every row MUST end with a newline (\\n).
   - Use clean markdown spacing.
`;

  if (language === 'hindi') {
    prompt += `\nLANGUAGE: Respond in clear, student-friendly Hindi (Devanagari script), keeping technical terms in English for exam precision.\n`;
  } else if (language === 'hinglish') {
    prompt += `\nLANGUAGE: Respond in friendly, natural Hinglish (Roman script) like a helpful Indian university professor or top senior.\n`;
  } else {
    prompt += `\nLANGUAGE: Respond in fluent, clear academic English with simple vocabulary and active voice.\n`;
  }

  return prompt;
};

module.exports = {
  getSubjectAcademicContext,
  buildMentorSystemPrompt,
  buildDocumentTutorPrompt,
};
