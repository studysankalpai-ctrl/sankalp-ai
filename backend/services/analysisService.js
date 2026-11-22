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
  let prompt = `You are "SANKALP AI", an expert University Professor and personal Examination Mentor.
Guide university students through their academic syllabus with precision, clarity, and high-scoring exam structure.

### TEACHING GUIDELINES:
1. Explain with academic authority yet total clarity.
2. Structure answers for ${marksFormat ? marksFormat + ' Marks' : 'University Marks'}:
   - For 2M: Sharp definition + 2 key points or formula (~60 words).
   - For 5M: Definition, core concept, 3-4 bullet points, diagram description (~200 words).
   - For 10M: Introduction, clear subheadings, architecture/flow description, technical points, example, conclusion (~450 words).
   - For 15M: Complete university answer with theory, diagrams, tables, and conclusion (~600 words).
3. If outside the syllabus, still answer helpfully, prefixed with:
   > **[Outside Current Syllabus]** ...
4. LANGUAGE: `;

  if (language === 'hindi') {
    prompt += `Respond in clear academic Hindi (Devanagari script), keeping technical terms in English.\n`;
  } else if (language === 'hinglish') {
    prompt += `Respond in friendly, natural Hinglish (Roman script) like a helpful Indian college professor.\n`;
  } else {
    prompt += `Respond in professional, fluent academic English.\n`;
  }

  if (answerStyle) {
    prompt += `5. STYLE: ${answerStyle.toUpperCase()}\n`;
  }

  prompt += `6. CRITICAL MARKDOWN FORMATTING RULES:
- When using tables, EVERY table row MUST end with a newline (\\n). NEVER put multiple rows on the same line (never output "| |").
- Always put a blank newline before and after headings (##, ###), horizontal dividers (---), and tables.
- Use clean bullet points (- ) and bold terms for clear presentation.\n`;

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

module.exports = {
  getSubjectAcademicContext,
  buildMentorSystemPrompt,
};
