const fs = require('fs');
const pdfParseModule = require('pdf-parse');

/**
 * Extract raw text from a PDF file using pdf-parse v1 or v2 (PDFParse class)
 * @param {string} filePath - Absolute or relative path to PDF file
 * @returns {Promise<{text: string, numPages: number, info: object}>}
 */
const extractPdfText = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);

    // Support pdf-parse v2 (class PDFParse)
    if (pdfParseModule && pdfParseModule.PDFParse) {
      const parser = new pdfParseModule.PDFParse({ data: dataBuffer });
      await parser.load();
      const res = await parser.getText();
      const text = res.text || (Array.isArray(res.pages) ? res.pages.map(p => p.text).join('\n') : '');
      const numPages = res.total || (Array.isArray(res.pages) ? res.pages.length : 1);
      await parser.destroy();
      return {
        text,
        numPages,
        info: {},
      };
    }

    // Support pdf-parse v1 (function)
    if (typeof pdfParseModule === 'function') {
      const data = await pdfParseModule(dataBuffer);
      return {
        text: data.text || '',
        numPages: data.numpages || 1,
        info: data.info || {},
      };
    }

    // Default object function fallback
    if (pdfParseModule?.default && typeof pdfParseModule.default === 'function') {
      const data = await pdfParseModule.default(dataBuffer);
      return {
        text: data.text || '',
        numPages: data.numpages || 1,
        info: data.info || {},
      };
    }

    throw new Error('Unsupported pdf-parse module format');
  } catch (error) {
    console.error('[PDF Service Error]:', error.message);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

/**
 * Extract question items heuristically from extracted exam paper text
 * Identifies patterns like "Q1.", "1.", "Question 1", marks patterns like "(5 Marks)", "[10]", etc.
 */
const parseQuestionsFromText = (text, examYear = null) => {
  if (!text || typeof text !== 'string') return [];

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const questions = [];
  let currentQ = null;

  // Regex patterns
  const qStartRegex = /^(?:Q(?:uestion)?\.?\s*(\d+[a-zA-Z]?)|\(?(\d+)\)?[\.\)]\s+|(?:Part|Section)\s+[A-Z]\s*-\s*Q(?:uestion)?\s*(\d+))/i;
  const marksRegex = /(?:\[|\()(\d+)\s*(?:Marks?|M)?(?:\]|\))/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(qStartRegex);

    if (match) {
      if (currentQ && currentQ.question_text.length > 10) {
        questions.push(currentQ);
      }

      const qNum = match[1] || match[2] || match[3] || `Q${questions.length + 1}`;
      let qText = line.replace(qStartRegex, '').trim();
      let marks = null;

      const marksMatch = line.match(marksRegex);
      if (marksMatch) {
        marks = parseInt(marksMatch[1], 10);
      }

      currentQ = {
        question_number: qNum,
        question_text: qText,
        marks: marks,
        question_type: marks ? (marks <= 2 ? 'very_short' : marks <= 5 ? 'short' : marks <= 10 ? 'long' : 'long') : 'short',
        exam_year: examYear,
      };
    } else if (currentQ) {
      // Append line to current question text
      const marksMatch = line.match(marksRegex);
      if (marksMatch && !currentQ.marks) {
        currentQ.marks = parseInt(marksMatch[1], 10);
        if (currentQ.marks <= 2) currentQ.question_type = 'very_short';
        else if (currentQ.marks <= 5) currentQ.question_type = 'short';
        else currentQ.question_type = 'long';
      }
      currentQ.question_text += ' ' + line;
    }
  }

  if (currentQ && currentQ.question_text.length > 10) {
    questions.push(currentQ);
  }

  return questions;
};

/**
 * Auto-detect and extract metadata (Title, Author, Edition, Description) from PDF
 * @param {string} filePath - Absolute path to PDF file
 * @param {string} originalFilename - Original filename of uploaded PDF
 * @returns {Promise<{title: string, author: string, edition: string, description: string, totalPages: number}>}
 */
const extractBookMetadata = async (filePath, originalFilename = '') => {
  try {
    const { text, numPages, info } = await extractPdfText(filePath);
    const cleanFilename = (originalFilename || filePath)
      .replace(/^.*[\\\/]/, '')
      .replace(/\.[^/.]+$/, '')
      .replace(/[_-]+/g, ' ')
      .trim();

    // 1. Detect Title
    let title = info?.Title?.trim() || '';
    if (!title || title.length < 3 || title.toLowerCase().includes('untitled') || title.toLowerCase().endsWith('.pdf')) {
      const firstLines = (text || '')
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 3 && l.length < 80);

      const candidate = firstLines.find(l => 
        !l.startsWith('http') && 
        !l.match(/^\d+$/) && 
        !l.toLowerCase().includes('copyright') &&
        !l.toLowerCase().includes('page') &&
        !l.toLowerCase().includes('published')
      );
      title = candidate || cleanFilename;
    }

    // 2. Detect Author
    let author = info?.Author?.trim() || '';
    if (!author || author.length < 2) {
      const authorMatch = (text || '').match(/(?:by|written\s+by|author[s]?\s*[:\-])\s+([A-Z][a-zA-Z\.\s]{2,40})/i);
      if (authorMatch && authorMatch[1]) {
        author = authorMatch[1].trim();
      } else {
        author = 'Prescribed University Author';
      }
    }

    // 3. Detect Edition
    let edition = 'Standard University Edition';
    const editionMatch = (text || '').match(/(\b(?:first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|\d+(?:st|nd|rd|th)?)\s+(?:revised\s+)?edition\b)/i);
    if (editionMatch && editionMatch[1]) {
      edition = editionMatch[1].trim();
    }

    // 4. Detect Description / Table of Contents
    let description = '';
    const tocMatch = (text || '').match(/(?:table\s+of\s+contents|contents|brief\s+contents)([\s\S]{100,1200})/i);
    if (tocMatch && tocMatch[1]) {
      const tocSnippet = tocMatch[1].replace(/\s+/g, ' ').trim();
      description = `Key Contents: ${tocSnippet.substring(0, 300)}...`;
    } else {
      description = `Prescribed textbook covering syllabus topics (${numPages || 0} pages).`;
    }

    return {
      title,
      author,
      edition,
      description,
      totalPages: numPages || 0,
      extractedSnippet: (text || '').substring(0, 5000),
    };
  } catch (error) {
    console.error('[extractBookMetadata Error]:', error.message);
    return {
      title: (originalFilename || '').replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim(),
      author: 'Prescribed University Author',
      edition: 'Standard University Edition',
      description: 'Prescribed academic textbook',
      totalPages: 0,
      extractedSnippet: '',
    };
  }
};

/**
 * Intelligent in-memory passage search across book's full text
 * Finds the exact pages/sections that match the student's question keywords
 * @param {string} fullText - Entire extracted text of the book
 * @param {string} query - Student question / topic
 * @param {number} maxChars - Max character window to return for LLM prompt
 * @returns {string} - Extracted passages from the book
 */
const searchBookText = (fullText, query, maxChars = 2200) => {
  if (!fullText || typeof fullText !== 'string' || fullText.length === 0) return '';
  if (!query || typeof query !== 'string') return fullText.substring(0, maxChars);

  const stopWords = new Set([
    'what', 'is', 'the', 'a', 'an', 'in', 'on', 'of', 'for', 'to', 'and', 'or', 'by', 'with',
    'explain', 'describe', 'tell', 'me', 'how', 'does', 'why', 'give', 'detail', 'detailed',
    'marks', 'mark', 'question', 'answer', 'exam', 'university', 'please', 'about', 'from',
    'this', 'that', 'these', 'those', 'kya', 'hai', 'kaise', 'hota', 'samjhao'
  ]);

  const rawKeywords = query
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  if (rawKeywords.length === 0) {
    return fullText.substring(0, maxChars);
  }

  // Chunk into approx 1000 character sections with overlap
  const chunkSize = 1000;
  const overlap = 200;
  const chunks = [];
  
  for (let i = 0; i < fullText.length; i += (chunkSize - overlap)) {
    chunks.push({
      start: i,
      text: fullText.substring(i, i + chunkSize),
    });
    if (i + chunkSize >= fullText.length) break;
  }

  // Score each chunk by keyword hits & multi-word phrase matches
  const scoredChunks = chunks.map(chunk => {
    const lower = chunk.text.toLowerCase();
    let score = 0;
    
    // Multi-word phrase bonus
    if (rawKeywords.length >= 2) {
      for (let k = 0; k < rawKeywords.length - 1; k++) {
        const pair = `${rawKeywords[k]} ${rawKeywords[k+1]}`;
        if (lower.includes(pair)) score += 15;
      }
    }

    // Individual keywords
    let matchedKeywords = 0;
    for (const kw of rawKeywords) {
      const occurrences = (lower.match(new RegExp('\\b' + kw, 'g')) || []).length;
      if (occurrences > 0) {
        score += Math.min(occurrences, 4) * 3;
        matchedKeywords++;
      }
    }

    if (matchedKeywords >= 2) {
      score += matchedKeywords * 6;
    }

    return { ...chunk, score };
  });

  scoredChunks.sort((a, b) => b.score - a.score);
  // Pick top 2 most relevant chunks to stay strictly within TPM limits
  const topChunks = scoredChunks.filter(c => c.score > 0).slice(0, 2);

  if (topChunks.length === 0) {
    return fullText.substring(0, maxChars);
  }

  // Re-order by position in book to preserve flow
  topChunks.sort((a, b) => a.start - b.start);
  const result = topChunks.map((c, idx) => `[Textbook Excerpt ${idx + 1}]:\n${c.text.trim()}`).join('\n\n---\n\n');
  return result.substring(0, maxChars);
};

module.exports = {
  extractPdfText,
  parseQuestionsFromText,
  extractBookMetadata,
  searchBookText,
};
