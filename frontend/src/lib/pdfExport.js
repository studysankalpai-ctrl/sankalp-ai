/**
 * SANKALP AI - Autonomous University Examination Preparation Platform
 * Enterprise-Grade Highly Formatted Native PDF Engine (Powered by jsPDF)
 * 
 * FEATURES:
 * 1. 100% Native Vector PDF: 0% dependency on screenshots/html2canvas. Never blank.
 * 2. Real Grid Tables: Header row with dark fill, white bold text, cell borders,
 *    alternating zebra striping, and automatic multi-line cell wrapping.
 * 3. Structured Headings & Callouts: H1 executive accent banners, H2 underline section
 *    dividers, H3 subheadings, indented bullet lists, and callout quote boxes.
 * 4. Comprehensive Examination Marksheet: Mock test exports include both an Executive
 *    Marksheet Table AND in-depth cards with the student's exact typed answers.
 * 5. Universal Academic Footers: Automated "Page X of Y" and institutional seals.
 */

import { jsPDF } from 'jspdf';

// Page geometry constants (A4 in mm)
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN_LEFT = 15;
const MARGIN_RIGHT = 15;
const USABLE_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT; // 180mm
const MAX_Y = 270; // Printable ceiling before page split
const HEADER_START_Y = 16;

/**
 * Strips markdown emphasis symbols while preserving text integrity and converting
 * non-ASCII or LaTeX symbols into clean, 100% PDF-safe Latin text.
 * Prevents jsPDF Helvetica encoding bugs that produce garbage artifacts (e.g. "%¸", "!’", "& ")
 */
export function cleanMarkdownText(str) {
  if (!str) return '';
  let clean = String(str);

  // 1. Remove LaTeX \boxed{...} wrappers
  clean = clean.replace(/\\boxed\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, '$1');

  // 2. Normalize LaTeX & Math notations to clean plain ASCII
  clean = clean
    .replace(/\\cdot/g, ' * ')
    .replace(/\\times/g, ' x ')
    .replace(/\\div/g, ' / ')
    .replace(/\\pm/g, ' +/- ')
    .replace(/\\neq/g, ' != ')
    .replace(/\\leq?/g, ' <= ')
    .replace(/\\geq?/g, ' >= ')
    .replace(/\\forall/g, ' for all ')
    .replace(/\\exists/g, ' there exists ')
    .replace(/\\in\b/g, ' in ')
    .replace(/\\notin\b/g, ' not in ')
    .replace(/\\subset\b/g, ' subset of ')
    .replace(/\\subseteq\b/g, ' subset of ')
    .replace(/\\cap\b/g, ' intersect ')
    .replace(/\\cup\b/g, ' union ')
    .replace(/\\rightarrow|\\to\b/g, ' -> ')
    .replace(/\\leftarrow/g, ' <- ')
    .replace(/\\implies/g, ' => ')
    .replace(/\\iff/g, ' <=> ')
    .replace(/\\infty/g, ' inf ')
    .replace(/\\approx/g, ' ~ ')
    .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
    .replace(/\\([()[\]{}])/g, '$1');

  // 3. Numbered emojis (Keycap 1️⃣, 2️⃣, etc.) -> Standard numbered labels (Prevents "1þ ã" corruption)
  clean = clean.replace(/([0-9])\uFE0F?\u20E3/g, '$1. ');

  // 4. Academic callout emojis -> clean, elegant ASCII badges (Prevents "Ø<ß¯", "Ø=Ü¡", "Ø=ÜÝ", "&¡")
  clean = clean
    .replace(/💡/g, '[NOTE] ')
    .replace(/🎯/g, '[ANALOGY] ')
    .replace(/🏆/g, '[EXAM SCORING] ')
    .replace(/⚡/g, '[EXAM TIP] ')
    .replace(/📌/g, '[KEY POINT] ')
    .replace(/🔥/g, '[IMPORTANT] ')
    .replace(/🔍/g, '[OVERVIEW] ')
    .replace(/[✅✔️✓]/g, '[OK]')
    .replace(/[❌✖️✗]/g, '[X]')
    .replace(/[⚠️⚠]/g, '[!]')
    .replace(/[⭐🌟]/g, '[*]')
    .replace(/📝/g, '[NOTE] ')
    .replace(/📖/g, '[BOOK] ')
    .replace(/🎓/g, '[ACADEMIC] ')
    .replace(/[⏱️⏳]/g, '[TIME] ')
    .replace(/📊/g, '[CHART] ')
    .replace(/[❓❔]/g, '[?]')
    .replace(/❗/g, '[!]');

  // 5. Aggressively strip all remaining emojis and surrogate pairs
  clean = clean.replace(/[\u{1F000}-\u{1FAFF}\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

  // 6. Unicode whitespace normalization (CRITICAL: prevents \u202F turning into ' /' in WinAnsi)
  clean = clean
    .replace(/[\u202F\u00A0\u2000-\u200B\uFEFF]/g, ' ')
    .replace(/[\u200C\u200D\u2060]/g, '');

  // 7. Unicode dashes, hyphens, and quotes
  clean = clean
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g, '-')
    .replace(/[–—]/g, '-')
    .replace(/[\u201C\u201D\u201E\u201F«»]/g, '"')
    .replace(/[\u2018\u2019\u201A\u201B‹›`]/g, "'")
    .replace(/…/g, '...');

  // 8. Box-drawing characters (CRITICAL: prevents \u251C turning into '% %' in WinAnsi)
  clean = clean
    .replace(/[─━═┄┅┈┉]/g, '-')
    .replace(/[│┃║┆┇┊┋]/g, '|')
    .replace(/[┌┍┎┏┐┑┒┓└┕┖┗┘┙┚┛├┝┞┟┠┡┢┣┤┥┦┧┨┩┪┫┬┭┮┯┰┱┲┳┴┵┶┷┸┹┺┻┼┽┾┿╀╁╂╃╄╅╆╇╈╉╊╋╭╮╯╰═║╒╓╔╕╖╗╘╙╚╛╜╝╞╟╠╡╢╣╤╥╦╧╨╩╪╫╬]/g, '+')
    .replace(/[╱╲╳╴╵╶╷╸╹╺╻╼╽╾╿]/g, '-');

  // 9. Unicode arrows
  clean = clean
    .replace(/[➔→⇒➜➝➞➟➠➡➢➣➤➥➦➧➨➩➪➫➬➭➮➯➱➲➳➴➵➶➷➸➹➺➻➼➽➾]/g, ' -> ')
    .replace(/[←⇐]/g, ' <- ')
    .replace(/[↔⇔]/g, ' <-> ')
    .replace(/[↑⇑]/g, ' ^ ')
    .replace(/[↓⇓]/g, ' v ')
    .replace(/[▼▽▾▿]/g, ' v ')
    .replace(/[▲△▴▵]/g, ' ^ ')
    .replace(/[►▶▸▹►▻]/g, ' > ')
    .replace(/[◄◀◂◃◄◅]/g, ' < ');

  // 10. Bullets & geometric shapes
  clean = clean
    .replace(/[•●○■□▪▫◆◇◈◉◊◦]/g, '-')
    .replace(/[·]/g, '*')
    .replace(/[≠]/g, '!=')
    .replace(/[≤]/g, '<=')
    .replace(/[≥]/g, '>=')
    .replace(/[±]/g, '+/-')
    .replace(/[×]/g, 'x')
    .replace(/[÷]/g, '/')
    .replace(/[≈]/g, '~')
    .replace(/[≡]/g, '==')
    .replace(/[∞]/g, 'inf');

  // 11. HTML entity decode
  clean = clean
    .replace(/&bull;/gi, '-')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&mdash;/gi, '-')
    .replace(/&ndash;/gi, '-');

  // 12. Clean up markdown bold, italic, code, links
  clean = clean
    .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/___(.*?)___/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, ''); // Strip leading header hashes if inside paragraphs

  // 13. Clean up stray / corrupt slash artifacts (e.g. " /C", " /Kanetkar", " /1", " /%")
  clean = clean
    .replace(/ \/([0-9A-Za-z%])/g, ' $1')
    .replace(/<=\\([0-9])/g, '<= $1');

  // 14. FINAL INVARIANT: Strict ASCII only (codes 32-126 + newline + tab)
  // Ensures jsPDF Helvetica NEVER drops into 2-byte UTF-16 mode with null bytes and slashes
  clean = clean.replace(/[^\x20-\x7E\t\n]/g, '');

  return clean.trim();
}

/**
 * Parses markdown into structured blocks: h1, h2, h3, h4, table, code, hr, quote, bullet, number_list, text
 */
export function parseMarkdownBlocks(md) {
  if (!md) return [];
  const lines = md.split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // 1. Code Block Fence (```lang ... ```)
    if (trimmed.startsWith('```')) {
      const lang = trimmed.replace(/^```/, '').trim();
      i++;
      const codeLines = [];
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length && lines[i].trim().startsWith('```')) {
        i++;
      }
      blocks.push({
        type: 'code',
        lang: lang || 'text',
        code: codeLines.join('\n'),
      });
      continue;
    }

    // 2. Horizontal Divider (---, ***, ___)
    if (/^([-*_]){3,}$/.test(trimmed)) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // 3. Table Detection (| Header 1 | Header 2 |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      if (tableLines.length >= 2) {
        const rawHeaders = tableLines[0].split('|').map((c) => cleanMarkdownText(c.trim()));
        const headers = rawHeaders.filter((_, idx) => idx > 0 && idx < rawHeaders.length - 1);
        const rows = [];
        const startRow = tableLines[1].includes('---') ? 2 : 1;
        for (let r = startRow; r < tableLines.length; r++) {
          const rawCells = tableLines[r].split('|').map((c) => cleanMarkdownText(c.trim()));
          const cells = rawCells.filter((_, idx) => idx > 0 && idx < rawCells.length - 1);
          if (cells.length > 0) rows.push(cells);
        }
        if (headers.length > 0) {
          blocks.push({ type: 'table', headers, rows });
          continue;
        }
      }
    }

    // 4. Multi-line Blockquotes (> Quote text)
    if (trimmed.startsWith('>')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ''));
        i++;
      }
      blocks.push({ type: 'quote', text: quoteLines.join(' ') });
      continue;
    }

    // 5. Headings & Lists
    if (trimmed.startsWith('# ')) {
      blocks.push({ type: 'h1', text: trimmed.replace(/^#\s+/, '') });
    } else if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'h2', text: trimmed.replace(/^##\s+/, '') });
    } else if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'h3', text: trimmed.replace(/^###\s+/, '') });
    } else if (trimmed.startsWith('#### ') || trimmed.startsWith('##### ') || trimmed.startsWith('###### ')) {
      blocks.push({ type: 'h4', text: trimmed.replace(/^#{4,6}\s+/, '') });
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      blocks.push({ type: 'bullet', text: trimmed.replace(/^[-*]\s+/, '') });
    } else if (/^(\d+)\.\s+/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s+/);
      blocks.push({
        type: 'number_list',
        index: match ? match[1] : '1',
        text: trimmed.replace(/^\d+\.\s+/, ''),
      });
    } else {
      blocks.push({ type: 'text', text: trimmed });
    }
    i++;
  }
  return blocks;
}

/**
 * Draws an authentic grid table with auto-balanced columns, wrapped text, and alternating row stripes
 */
export function drawPdfTable(doc, headers, rows, startY, customWidths = null) {
  const marginX = MARGIN_LEFT;
  const totalW = USABLE_WIDTH;
  const numCols = headers.length;
  if (numCols === 0) return startY;

  let widths = customWidths;
  if (!widths || widths.length !== numCols) {
    const colLengths = headers.map((h, c) => {
      let maxLen = String(h || '').length;
      for (let r = 0; r < Math.min(rows.length, 12); r++) {
        const cell = String(rows[r]?.[c] || '');
        if (cell.length > maxLen) maxLen = cell.length;
      }
      return Math.max(12, Math.min(maxLen, 90));
    });

    const sumLengths = colLengths.reduce((a, b) => a + b, 0);
    const minW = Math.max(16, Math.floor(totalW / (numCols * 2)));
    widths = colLengths.map((len) => (len / sumLengths) * totalW);

    let underMinTotal = 0;
    let overMinTotal = 0;
    for (let c = 0; c < numCols; c++) {
      if (widths[c] < minW) {
        underMinTotal += (minW - widths[c]);
        widths[c] = minW;
      } else {
        overMinTotal += widths[c];
      }
    }
    if (underMinTotal > 0 && overMinTotal > 0) {
      for (let c = 0; c < numCols; c++) {
        if (widths[c] > minW) {
          widths[c] -= underMinTotal * (widths[c] / overMinTotal);
        }
      }
    }
  }

  let y = startY;

  // Check if header fits on current page
  if (y + 16 > MAX_Y) {
    doc.addPage();
    y = HEADER_START_Y + 6;
  }

  // Header Row
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(marginX, y, totalW, 8.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);

  let currentX = marginX;
  for (let c = 0; c < numCols; c++) {
    const colW = widths[c] || totalW / numCols;
    const hText = cleanMarkdownText(String(headers[c] || ''));
    let safeH = hText;
    while (safeH.length > 3 && doc.getTextWidth(safeH) > colW - 5) {
      safeH = safeH.substring(0, safeH.length - 4) + '...';
    }
    doc.text(safeH, currentX + 3, y + 5.5);
    currentX += colW;
  }
  y += 8.5;

  // Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];

    let maxLines = 1;
    const cellLines = [];
    for (let c = 0; c < numCols; c++) {
      const colW = widths[c] || totalW / numCols;
      const val = cleanMarkdownText(String(row[c] || ''));
      const rawLines = doc.splitTextToSize(val, colW - 6);
      const safeLines = rawLines.map((l) => {
        let line = l;
        while (line.length > 3 && doc.getTextWidth(line) > colW - 5) {
          line = line.substring(0, line.length - 4) + '...';
        }
        return line;
      });
      cellLines.push(safeLines);
      if (safeLines.length > maxLines) maxLines = safeLines.length;
    }
    const rowH = Math.max(7, maxLines * 4 + 3);

    // Page split check
    if (y + rowH > MAX_Y) {
      doc.addPage();
      y = HEADER_START_Y + 6;

      // Re-draw header on new page for table continuity
      doc.setFillColor(15, 23, 42);
      doc.rect(marginX, y, totalW, 8.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      let hX = marginX;
      for (let c = 0; c < numCols; c++) {
        const colW = widths[c] || totalW / numCols;
        const hText = cleanMarkdownText(String(headers[c] || ''));
        let safeH = hText;
        while (safeH.length > 3 && doc.getTextWidth(safeH) > colW - 5) {
          safeH = safeH.substring(0, safeH.length - 4) + '...';
        }
        doc.text(safeH, hX + 3, y + 5.5);
        hX += colW;
      }
      y += 8.5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
    }

    // Zebra striping
    if (r % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(marginX, y, totalW, rowH, 'F');
    }

    // Cell text
    doc.setTextColor(30, 41, 59);
    let cellX = marginX;
    for (let c = 0; c < numCols; c++) {
      const colW = widths[c] || totalW / numCols;
      const lines = cellLines[c];
      let lineY = y + 4.5;
      for (let l of lines) {
        doc.text(l, cellX + 3, lineY);
        lineY += 4;
      }
      cellX += colW;
    }

    // Bottom border
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.25);
    doc.line(marginX, y + rowH, marginX + totalW, y + rowH);

    y += rowH;
  }

  // Outer border
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.rect(marginX, startY, totalW, y - startY, 'D');

  return y;
}

/**
 * Render structured markdown blocks with rich typography
 */
export function renderFormattedBlocks(doc, blocks, startY) {
  let y = startY;

  for (let idx = 0; idx < blocks.length; idx++) {
    const block = blocks[idx];

    switch (block.type) {
      case 'h1': {
        const h1Lines = doc.splitTextToSize(cleanMarkdownText(block.text), USABLE_WIDTH - 12);
        const h1Height = Math.max(9.5, h1Lines.length * 4.8 + 4.5);
        if (y + h1Height + 3 > MAX_Y) { doc.addPage(); y = HEADER_START_Y + 6; }
        doc.setFillColor(241, 245, 249); // slate-100 banner
        doc.rect(MARGIN_LEFT, y, USABLE_WIDTH, h1Height, 'F');
        doc.setFillColor(15, 23, 42); // slate-900 left accent bar
        doc.rect(MARGIN_LEFT, y, 3, h1Height, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        let h1Y = y + 5.5;
        for (let l of h1Lines) {
          doc.text(l, MARGIN_LEFT + 6, h1Y);
          h1Y += 4.8;
        }
        y += h1Height + 4;
        break;
      }

      case 'h2': {
        const h2Lines = doc.splitTextToSize(cleanMarkdownText(block.text), USABLE_WIDTH);
        const h2Height = h2Lines.length * 4.5 + 4;
        if (y + h2Height + 3 > MAX_Y) { doc.addPage(); y = HEADER_START_Y + 6; }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        let h2Y = y + 4;
        for (let l of h2Lines) {
          doc.text(l, MARGIN_LEFT, h2Y);
          h2Y += 4.5;
        }

        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.line(MARGIN_LEFT, h2Y - 1, MARGIN_LEFT + USABLE_WIDTH, h2Y - 1);
        y = h2Y + 3.5;
        break;
      }

      case 'h3': {
        const h3Lines = doc.splitTextToSize(cleanMarkdownText(block.text), USABLE_WIDTH - 8);
        const h3Height = h3Lines.length * 4.2 + 2;
        if (y + h3Height + 2 > MAX_Y) { doc.addPage(); y = HEADER_START_Y + 6; }
        // Sleek vector square bullet
        doc.setFillColor(99, 102, 241); // indigo-500
        doc.rect(MARGIN_LEFT, y + 1.2, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(51, 65, 85);
        let h3Y = y + 3.5;
        for (let l of h3Lines) {
          doc.text(l, MARGIN_LEFT + 4.5, h3Y);
          h3Y += 4.2;
        }
        y = h3Y + 2;
        break;
      }

      case 'h4': {
        const h4Lines = doc.splitTextToSize(cleanMarkdownText(block.text), USABLE_WIDTH - 6);
        const h4Height = h4Lines.length * 4 + 2;
        if (y + h4Height + 2 > MAX_Y) { doc.addPage(); y = HEADER_START_Y + 6; }
        doc.setFillColor(100, 116, 139); // slate-500 dot
        doc.circle(MARGIN_LEFT + 2, y + 2, 0.6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        let h4Y = y + 3.2;
        for (let l of h4Lines) {
          doc.text(l, MARGIN_LEFT + 4.5, h4Y);
          h4Y += 4;
        }
        y = h4Y + 1.5;
        break;
      }

      case 'table': {
        y = drawPdfTable(doc, block.headers, block.rows, y);
        y += 5.5;
        break;
      }

      case 'code': {
        const codeLines = block.code.split('\n');
        doc.setFont('courier', 'normal');
        doc.setFontSize(7.5);

        const wrappedLines = [];
        for (let cl of codeLines) {
          const cleanCl = cleanMarkdownText(cl);
          const split = doc.splitTextToSize(cleanCl, USABLE_WIDTH - 12);
          wrappedLines.push(...split);
        }

        let lineIdx = 0;
        while (lineIdx < wrappedLines.length) {
          if (y + 14 > MAX_Y) {
            doc.addPage();
            y = HEADER_START_Y + 6;
          }

          const availableH = MAX_Y - y;
          const maxLinesOnThisPage = Math.max(2, Math.floor((availableH - 8) / 3.6));
          const linesToDraw = wrappedLines.slice(lineIdx, lineIdx + maxLinesOnThisPage);
          const boxH = linesToDraw.length * 3.6 + 6;

          doc.setFillColor(248, 250, 252); // slate-50
          doc.setDrawColor(203, 213, 225); // slate-300
          doc.setLineWidth(0.3);
          doc.roundedRect(MARGIN_LEFT, y, USABLE_WIDTH, boxH, 1.5, 1.5, 'FD');

          doc.setFillColor(71, 85, 105); // slate-600 left accent
          doc.rect(MARGIN_LEFT, y, 2.5, boxH, 'F');

          if (lineIdx === 0 && block.lang && block.lang !== 'text') {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(6.5);
            doc.setTextColor(148, 163, 184);
            doc.text(block.lang.toUpperCase(), MARGIN_LEFT + USABLE_WIDTH - 4, y + 4.5, { align: 'right' });
          }

          doc.setFont('courier', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(15, 23, 42);
          let cY = y + 4.5;
          for (let cl of linesToDraw) {
            doc.text(cl, MARGIN_LEFT + 6, cY);
            cY += 3.6;
          }

          y += boxH + 3.5;
          lineIdx += linesToDraw.length;
        }
        break;
      }

      case 'hr': {
        if (y + 6 > MAX_Y) { doc.addPage(); y = HEADER_START_Y + 6; }
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.setLineWidth(0.35);
        doc.line(MARGIN_LEFT, y + 2, MARGIN_LEFT + USABLE_WIDTH, y + 2);
        y += 5;
        break;
      }

      case 'quote': {
        const qLines = doc.splitTextToSize(cleanMarkdownText(block.text), USABLE_WIDTH - 12);
        const qHeight = Math.max(9, qLines.length * 4.2 + 5);
        if (y + qHeight > MAX_Y) { doc.addPage(); y = HEADER_START_Y + 6; }

        doc.setFillColor(248, 250, 252);
        doc.rect(MARGIN_LEFT, y, USABLE_WIDTH, qHeight, 'F');
        doc.setFillColor(99, 102, 241); // indigo-500 accent bar
        doc.rect(MARGIN_LEFT, y, 2.5, qHeight, 'F');

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(30, 41, 59);
        let qY = y + 4.5;
        for (let l of qLines) {
          doc.text(l, MARGIN_LEFT + 6, qY);
          qY += 4.2;
        }
        y += qHeight + 4;
        break;
      }

      case 'bullet':
      case 'number_list': {
        const isNum = block.type === 'number_list';
        const bLines = doc.splitTextToSize(cleanMarkdownText(block.text), USABLE_WIDTH - 6);
        if (y + bLines.length * 4.2 > MAX_Y) { doc.addPage(); y = HEADER_START_Y + 6; }

        if (isNum && block.index) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(99, 102, 241);
          doc.text(`${block.index}.`, MARGIN_LEFT + 1, y + 3.5);
        } else {
          // Native vector circle dot
          doc.setFillColor(99, 102, 241);
          doc.circle(MARGIN_LEFT + 2.5, y + 2.2, 0.65, 'F');
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        let bY = y + 3.5;
        for (let l of bLines) {
          doc.text(l, MARGIN_LEFT + 6, bY);
          bY += 4.2;
        }
        y += bLines.length * 4.2 + 1.5;
        break;
      }

      default: {
        // Normal paragraph text
        const lines = doc.splitTextToSize(cleanMarkdownText(block.text), USABLE_WIDTH);
        if (y + lines.length * 4.2 > MAX_Y) { doc.addPage(); y = HEADER_START_Y + 6; }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(30, 41, 59);
        let tY = y + 3.5;
        for (let l of lines) {
          doc.text(l, MARGIN_LEFT, tY);
          tY += 4.2;
        }
        y += lines.length * 4.2 + 2;
        break;
      }
    }
  }

  return y;
}

/**
 * Universal Academic Header
 */
function renderDocumentHeader(doc, title, subtitle, metaText) {
  const cleanTitle = cleanMarkdownText(title);
  const cleanSubtitle = cleanMarkdownText(subtitle);
  const cleanMeta = metaText ? cleanMarkdownText(metaText) : '';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('SANKALP AI | AUTONOMOUS UNIVERSITY EXAMINATION PLATFORM', MARGIN_LEFT, HEADER_START_Y);

  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(cleanTitle, MARGIN_LEFT, HEADER_START_Y + 6.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  doc.text(cleanSubtitle, MARGIN_LEFT, HEADER_START_Y + 12.5);

  if (cleanMeta) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(cleanMeta, MARGIN_LEFT, HEADER_START_Y + 17);
  }

  const dividerY = cleanMeta ? HEADER_START_Y + 20.5 : HEADER_START_Y + 16;
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_LEFT, dividerY, MARGIN_LEFT + USABLE_WIDTH, dividerY);

  return dividerY + 6;
}

/**
 * Universal Page Numbers & Academic Seals
 */
function stampAllPageFooters(doc) {
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(MARGIN_LEFT, 283, MARGIN_LEFT + USABLE_WIDTH, 283);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'SANKALP AI | St. John\'s College, Agra Curriculum Grounded | Official Examination Document',
      MARGIN_LEFT,
      287.5
    );
    doc.text(`Page ${p} of ${totalPages}`, MARGIN_LEFT + USABLE_WIDTH, 287.5, { align: 'right' });
  }
}

/**
 * 1. Export Mock Test Scorecard PDF
 * (Includes Executive KPI Card, Official Marksheet Table, and Detailed Student Typed Answer Boxes)
 * 
 * @param {Object} res - Evaluation result object
 * @returns {Promise<boolean>}
 */
export async function exportMockTestScorecardPdf(res) {
  if (!res) return false;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const safeSubject = (res.subjectCode || res.subjectName || 'MockTest').replace(/[^a-zA-Z0-9_\-]/g, '_');
  const filename = `SANKALP_MockExam_${safeSubject}_Grade_${res.grade || 'A'}.pdf`;

  let y = renderDocumentHeader(
    doc,
    'OFFICIAL MOCK EXAMINATION SCORECARD',
    `${res.subjectName || 'Mock Examination'} (${res.subjectCode || 'N/A'})`,
    `Date Evaluated: ${res.date || new Date().toLocaleDateString()} | Duration: ${res.timeTaken || '10:00'} / ${res.totalTime || '10:00'} | Questions: ${res.attempted || 0} Attempted`
  );

  // 1. Executive Score Banner
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(MARGIN_LEFT, y, USABLE_WIDTH, 21, 2, 2, 'FD');

  // Big Score Text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text(`${res.totalAwarded} / ${res.totalMaxMarks}`, MARGIN_LEFT + 6, y + 9.5);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`SCORE: ${res.percentage}% TOTAL`, MARGIN_LEFT + 6, y + 15.5);

  // Grade Pill
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(MARGIN_LEFT + 65, y + 4, 18, 13, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(res.grade || 'A', MARGIN_LEFT + 74, y + 12.5, { align: 'center' });

  // Division Status
  const division =
    res.percentage >= 80
      ? 'Distinction (Honours)'
      : res.percentage >= 60
      ? 'First Division'
      : res.percentage >= 50
      ? 'Second Division'
      : 'Needs Improvement';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(21, 128, 61);
  doc.text(`Status: ${division}`, MARGIN_LEFT + 90, y + 9.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Attempted: ${res.attempted || 0} of ${res.evaluations?.length || 0} Questions`, MARGIN_LEFT + 90, y + 15.5);

  y += 26;

  // 2. Official Examination Marksheet Grid Table
  const evaluations = res.evaluations || [];
  if (evaluations.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('I. UNIVERSITY SUMMARY MARKSHEET TABLE', MARGIN_LEFT, y);
    y += 4.5;

    const tableHeaders = ['Q#', 'Examination Question / Topic Preview', 'Max', 'Awarded', 'Performance'];
    const tableRows = evaluations.map((ev, idx) => {
      const qSnippet = cleanMarkdownText(ev.question || '');
      const shortQ = qSnippet.length > 60 ? qSnippet.substring(0, 57) + '...' : qSnippet;
      const pct = Math.round(((ev.awarded || 0) / (ev.maxMarks || 10)) * 100);
      const perf = pct >= 80 ? 'Distinction' : pct >= 60 ? 'First Div' : pct >= 40 ? 'Pass' : 'Needs Review';
      return [
        `Q${idx + 1}`,
        shortQ,
        `${ev.maxMarks || 10}`,
        `${ev.awarded || 0}`,
        perf,
      ];
    });

    y = drawPdfTable(doc, tableHeaders, tableRows, y, [14, 90, 22, 24, 30]);
    y += 7;
  }

  // 3. Detailed Question Breakdown with Student Typed Answers & Rubrics
  if (y + 16 > MAX_Y) { doc.addPage(); y = HEADER_START_Y + 6; }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('II. DETAILED QUESTION SCRUTINY, STUDENT TYPED RESPONSES & MODEL ANSWERS', MARGIN_LEFT, y);
  y += 5;

  for (let idx = 0; idx < evaluations.length; idx++) {
    const ev = evaluations[idx];

    const questionLines = doc.splitTextToSize(cleanMarkdownText(ev.question || ''), USABLE_WIDTH - 12);
    const answerLines = doc.splitTextToSize(cleanMarkdownText(ev.studentAnswer || 'Unattempted'), USABLE_WIDTH - 16);
    const feedbackLines = doc.splitTextToSize(cleanMarkdownText(ev.feedback || ''), USABLE_WIDTH - 16);
    const modelAnswerLines = ev.modelAnswer ? doc.splitTextToSize(cleanMarkdownText(ev.modelAnswer), USABLE_WIDTH - 16) : [];

    const estimatedBoxHeight =
      14 +
      questionLines.length * 4.2 +
      12 +
      answerLines.length * 4 +
      12 +
      feedbackLines.length * 4 +
      (modelAnswerLines.length ? 12 + modelAnswerLines.length * 4 : 0);

    if (y + estimatedBoxHeight > MAX_Y) {
      doc.addPage();
      y = HEADER_START_Y + 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Scorecard Continued - Question ${idx + 1}`, MARGIN_LEFT, y);
      y += 6;
    }

    const boxStartY = y;

    // Question header strip
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(MARGIN_LEFT, y, USABLE_WIDTH, 8, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`QUESTION ${idx + 1} (${ev.maxMarks || 10} MARKS)`, MARGIN_LEFT + 4, y + 5.5);

    const isPassing = (ev.awarded || 0) > 0;
    doc.setTextColor(isPassing ? 21 : 185, isPassing ? 128 : 28, isPassing ? 61 : 28);
    doc.text(`Awarded: ${ev.awarded || 0} / ${ev.maxMarks || 10} Marks`, MARGIN_LEFT + USABLE_WIDTH - 4, y + 5.5, { align: 'right' });

    y += 11.5;

    // Question Text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    for (let l of questionLines) {
      doc.text(l, MARGIN_LEFT + 4, y);
      y += 4.2;
    }
    y += 2;

    // 1. Student Typed Answer Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    const ansBoxH = Math.max(12, 7.5 + answerLines.length * 4);
    doc.roundedRect(MARGIN_LEFT + 4, y, USABLE_WIDTH - 8, ansBoxH, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("STUDENT'S SUBMITTED ANSWER:", MARGIN_LEFT + 7, y + 5);

    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    let ansY = y + 9.5;
    for (let l of answerLines) {
      doc.text(l, MARGIN_LEFT + 7, ansY);
      ansY += 4;
    }
    y += ansBoxH + 3;

    // 2. SANKALP AI Rubric Assessment
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    const fbBoxH = Math.max(12, 7.5 + feedbackLines.length * 4);
    doc.roundedRect(MARGIN_LEFT + 4, y, USABLE_WIDTH - 8, fbBoxH, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('SANKALP AI RUBRIC ASSESSMENT:', MARGIN_LEFT + 7, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    let fbY = y + 9.5;
    for (let l of feedbackLines) {
      doc.text(l, MARGIN_LEFT + 7, fbY);
      fbY += 4;
    }
    y += fbBoxH + 3;

    // 3. Model University Answer
    if (modelAnswerLines.length) {
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(187, 247, 208);
      const modelBoxH = Math.max(12, 7.5 + modelAnswerLines.length * 4);
      doc.roundedRect(MARGIN_LEFT + 4, y, USABLE_WIDTH - 8, modelBoxH, 1, 1, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(21, 128, 61);
      doc.text('MODEL UNIVERSITY ANSWER / KEY SCORING CONCEPTS:', MARGIN_LEFT + 7, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(6, 95, 70);
      let mY = y + 9.5;
      for (let l of modelAnswerLines) {
        doc.text(l, MARGIN_LEFT + 7, mY);
        mY += 4;
      }
      y += modelBoxH + 3;
    }

    // Outer card border
    const totalCardHeight = y - boxStartY;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.roundedRect(MARGIN_LEFT, boxStartY, USABLE_WIDTH, totalCardHeight, 2, 2, 'D');

    y += 6.5;
  }

  stampAllPageFooters(doc);
  doc.save(filename);
  return true;
}

/**
 * 2. Export Official Oral Viva Voce Scorecard PDF
 * (Executive Summary, Marks Table, Spoken Transcripts, Examiner Feedback & Model Answers)
 * 
 * @param {Object} options
 * @returns {Promise<boolean>}
 */
export async function exportVivaScorecardPdf({
  finalReport,
  vivaHistory = [],
  selectedSubject = null,
  selectedCourse = null,
  language = 'English',
  persona = 'Strict University External Examiner',
}) {
  if (!finalReport) return false;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const subjectName = selectedSubject?.name || 'General Subject';
  const subjectCode = selectedSubject?.code || 'N/A';
  const safeSubject = (subjectCode || subjectName).replace(/[^a-zA-Z0-9_\-]/g, '_');
  const filename = `SANKALP_VivaVoce_Scorecard_${safeSubject}_${new Date().toISOString().split('T')[0]}.pdf`;

  let y = renderDocumentHeader(
    doc,
    'OFFICIAL ORAL VIVA VOCE EXAMINATION SCORECARD',
    `${subjectName} (${subjectCode}) | ${selectedCourse?.name || 'University Examination'}`,
    `Date Evaluated: ${new Date().toLocaleDateString()} | Examiner Persona: ${persona} | Mode: ${language.toUpperCase()}`
  );

  // 1. Executive Performance Scorecard Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(MARGIN_LEFT, y, USABLE_WIDTH, 23, 2, 2, 'FD');

  const calculatedTotal = vivaHistory && vivaHistory.length > 0
    ? vivaHistory.reduce((acc, v) => acc + (Number(v.marks) || 0), 0)
    : finalReport.overall_score || 0;
  const totalScore = Number(Number(calculatedTotal).toFixed(1));
  const maxScore = (vivaHistory.length > 0 ? vivaHistory.length * 5 : finalReport.max_possible_score) || 25;
  const percentage = Math.round((totalScore / maxScore) * 100);

  // Big Score Text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(`${totalScore} / ${maxScore}`, MARGIN_LEFT + 6, y + 10);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`OVERALL SCORE: ${percentage}% TOTAL`, MARGIN_LEFT + 6, y + 16.5);

  // Grade Pill
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(MARGIN_LEFT + 60, y + 4.5, 26, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  const rawGrade = typeof finalReport.grade === 'string'
    ? finalReport.grade
    : typeof finalReport.grade === 'object' && finalReport.grade?.letter
    ? `${finalReport.grade.letter} ${finalReport.grade.description || ''}`
    : 'Grade A';
  const cleanGrade = String(rawGrade).replace(/^Grade\s+/i, '');
  doc.text(cleanGrade.substring(0, 14), MARGIN_LEFT + 73, y + 13.5, { align: 'center' });

  // Status / Division
  const division =
    percentage >= 75
      ? 'Distinction / Exemplary'
      : percentage >= 60
      ? 'First Division / Competent'
      : percentage >= 50
      ? 'Second Division / Satisfactory'
      : 'Requires Further Preparation';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(percentage >= 50 ? 21 : 220, percentage >= 50 ? 128 : 38, percentage >= 50 ? 61 : 38);
  doc.text(`Oral Verdict: ${division}`, MARGIN_LEFT + 92, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Total Questions Answered: ${vivaHistory.length} Viva Turns`, MARGIN_LEFT + 92, y + 16.5);

  y += 28;

  // Examiner Verdict Callout
  const verdictText = typeof finalReport.verdict === 'string'
    ? finalReport.verdict
    : typeof finalReport.verdict === 'object'
    ? JSON.stringify(finalReport.verdict)
    : '';
  if (verdictText) {
    if (y + 18 > MAX_Y) { doc.addPage(); y = HEADER_START_Y + 6; }
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    const verdictLines = doc.splitTextToSize(`"${cleanMarkdownText(verdictText)}"`, USABLE_WIDTH - 14);
    const verdictBoxH = 8 + verdictLines.length * 4.2;
    doc.roundedRect(MARGIN_LEFT, y, USABLE_WIDTH, verdictBoxH, 1.5, 1.5, 'FD');
    doc.setFillColor(99, 102, 241);
    doc.rect(MARGIN_LEFT, y, 2.5, verdictBoxH, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text('OFFICIAL EXTERNAL EXAMINER REMARKS:', MARGIN_LEFT + 6, y + 5);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    let vY = y + 9.5;
    for (let l of verdictLines) {
      doc.text(l, MARGIN_LEFT + 6, vY);
      vY += 4.2;
    }
    y += verdictBoxH + 5;
  }

  // 2. Official Viva Voce Questions Summary Marksheet Table
  if (vivaHistory && vivaHistory.length > 0) {
    if (y + 20 > MAX_Y) { doc.addPage(); y = HEADER_START_Y + 6; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('I. ORAL VIVA MARKSHEET SUMMARY TABLE', MARGIN_LEFT, y);
    y += 4.5;

    const tableHeaders = ['Q#', 'Viva Examination Question', 'Max', 'Marks', 'Rating'];
    const tableRows = vivaHistory.map((v, idx) => {
      const qText = cleanMarkdownText(v.question || '');
      const shortQ = qText.length > 60 ? qText.substring(0, 57) + '...' : qText;
      const m = Number(v.marks) || 0;
      const rating = m >= 4.5 ? 'Excellent' : m >= 3.5 ? 'Good' : m >= 2.5 ? 'Average' : 'Needs Work';
      return [
        `Q${idx + 1}`,
        shortQ,
        '5',
        `${m}`,
        rating,
      ];
    });

    y = drawPdfTable(doc, tableHeaders, tableRows, y, [14, 96, 20, 22, 28]);
    y += 7;
  }

  // 3. Question-by-Question Review with Spoken Answer, Feedback & Model Answer
  if (y + 16 > MAX_Y) { doc.addPage(); y = HEADER_START_Y + 6; }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('II. QUESTION-BY-QUESTION SCRUTINY, CANDIDATE TRANSCRIPT & MODEL ANSWERS', MARGIN_LEFT, y);
  y += 5;

  for (let idx = 0; idx < vivaHistory.length; idx++) {
    const v = vivaHistory[idx];
    const qLines = doc.splitTextToSize(cleanMarkdownText(v.question || ''), USABLE_WIDTH - 12);
    const ansLines = doc.splitTextToSize(v.answer ? `"${cleanMarkdownText(v.answer)}"` : '"Unattempted / No response recorded"', USABLE_WIDTH - 16);
    const fbLines = doc.splitTextToSize(cleanMarkdownText(v.feedback || 'Evaluated against prescribed syllabus.'), USABLE_WIDTH - 16);
    const modelAnsLines = v.modelAnswer ? doc.splitTextToSize(cleanMarkdownText(v.modelAnswer), USABLE_WIDTH - 16) : [];

    const estimatedBoxH =
      12 +
      qLines.length * 4.2 +
      10 +
      ansLines.length * 4 +
      10 +
      fbLines.length * 4 +
      (modelAnsLines.length ? 10 + modelAnsLines.length * 4 : 0);

    if (y + estimatedBoxH > MAX_Y) {
      doc.addPage();
      y = HEADER_START_Y + 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Viva Voce Transcript Continued - Question ${idx + 1}`, MARGIN_LEFT, y);
      y += 6;
    }

    // Header Strip for Question
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(MARGIN_LEFT, y, USABLE_WIDTH, 8, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`VIVA QUESTION ${idx + 1} (5 MARKS)`, MARGIN_LEFT + 4, y + 5.5);

    const m = Number(v.marks) || 0;
    doc.setTextColor(m >= 3 ? 21 : 185, m >= 3 ? 128 : 28, m >= 3 ? 61 : 28);
    doc.text(`Score: ${m} / 5 Marks`, MARGIN_LEFT + USABLE_WIDTH - 4, y + 5.5, { align: 'right' });
    y += 11.5;

    // Question
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    for (let l of qLines) {
      doc.text(l, MARGIN_LEFT + 4, y);
      y += 4.2;
    }
    y += 2;

    // Candidate Spoken Transcript
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('CANDIDATE SPOKEN TRANSCRIPT:', MARGIN_LEFT + 4, y);
    y += 3.5;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    const ansBoxH = ansLines.length * 4 + 3;
    doc.roundedRect(MARGIN_LEFT + 4, y, USABLE_WIDTH - 8, ansBoxH, 1, 1, 'FD');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    let ansY = y + 4;
    for (let l of ansLines) {
      doc.text(l, MARGIN_LEFT + 7, ansY);
      ansY += 4;
    }
    y += ansBoxH + 3.5;

    // Examiner Feedback
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(180, 83, 9); // Amber
    doc.text('EXAMINER EVALUATION & FEEDBACK:', MARGIN_LEFT + 4, y);
    y += 3.5;

    doc.setFillColor(254, 252, 232); // amber-50
    doc.setDrawColor(254, 240, 138); // amber-200
    const fbBoxH = fbLines.length * 4 + 3;
    doc.roundedRect(MARGIN_LEFT + 4, y, USABLE_WIDTH - 8, fbBoxH, 1, 1, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(113, 63, 18);
    let fbY = y + 4;
    for (let l of fbLines) {
      doc.text(l, MARGIN_LEFT + 7, fbY);
      fbY += 4;
    }
    y += fbBoxH + 3.5;

    // Ideal Viva Answer
    if (modelAnsLines.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(21, 128, 61); // Emerald
      doc.text('IDEAL UNIVERSITY VIVA ANSWER (MODEL SOLUTION):', MARGIN_LEFT + 4, y);
      y += 3.5;

      doc.setFillColor(240, 253, 244); // emerald-50
      doc.setDrawColor(187, 247, 208); // emerald-200
      const modelBoxH = modelAnsLines.length * 4 + 3;
      doc.roundedRect(MARGIN_LEFT + 4, y, USABLE_WIDTH - 8, modelBoxH, 1, 1, 'FD');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(20, 83, 45);
      let mY = y + 4;
      for (let l of modelAnsLines) {
        doc.text(l, MARGIN_LEFT + 7, mY);
        mY += 4;
      }
      y += modelBoxH + 4;
    }

    y += 3;
  }

  // 4. Strengths & Weaknesses Checklist
  const rawStrengths = Array.isArray(finalReport.strengths)
    ? finalReport.strengths
    : typeof finalReport.strengths === 'string'
    ? [finalReport.strengths]
    : [];
  const rawWeaknesses = Array.isArray(finalReport.weaknesses)
    ? finalReport.weaknesses
    : typeof finalReport.weaknesses === 'string'
    ? [finalReport.weaknesses]
    : [];
  const rawTrapQuestions = Array.isArray(finalReport.examiner_trap_questions)
    ? finalReport.examiner_trap_questions
    : typeof finalReport.examiner_trap_questions === 'string'
    ? [finalReport.examiner_trap_questions]
    : [];

  if (rawStrengths.length > 0 || rawWeaknesses.length > 0) {
    if (y + 35 > MAX_Y) { doc.addPage(); y = HEADER_START_Y + 6; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('III. ORAL COMPETENCY CHECKLIST: STRENGTHS & REVISION TARGETS', MARGIN_LEFT, y);
    y += 5;

    // Strengths
    if (rawStrengths.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(21, 128, 61);
      doc.text('Demonstrated Strengths:', MARGIN_LEFT, y);
      y += 4.5;
      for (let s of rawStrengths) {
        const cleanS = cleanMarkdownText(s);
        const sLines = doc.splitTextToSize(cleanS, USABLE_WIDTH - 8);
        if (y + sLines.length * 4.2 > MAX_Y) { doc.addPage(); y = HEADER_START_Y + 6; }
        doc.setFillColor(21, 128, 61); // emerald green vector dot
        doc.circle(MARGIN_LEFT + 2.5, y + 2, 0.65, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        for (let l of sLines) {
          doc.text(l, MARGIN_LEFT + 5.5, y);
          y += 4.2;
        }
      }
      y += 2;
    }

    // Weaknesses / Revise
    if (rawWeaknesses.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(180, 83, 9);
      doc.text('Concepts to Revise Before University Oral Viva Exam:', MARGIN_LEFT, y);
      y += 4.5;
      for (let w of rawWeaknesses) {
        const cleanW = cleanMarkdownText(w);
        const wLines = doc.splitTextToSize(cleanW, USABLE_WIDTH - 8);
        if (y + wLines.length * 4.2 > MAX_Y) { doc.addPage(); y = HEADER_START_Y + 6; }
        doc.setFillColor(180, 83, 9); // amber vector dot
        doc.circle(MARGIN_LEFT + 2.5, y + 2, 0.65, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        for (let l of wLines) {
          doc.text(l, MARGIN_LEFT + 5.5, y);
          y += 4.2;
        }
      }
      y += 2;
    }

    // Trap Questions
    if (rawTrapQuestions.length > 0) {
      if (y + 20 > MAX_Y) { doc.addPage(); y = HEADER_START_Y + 6; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(190, 18, 60); // rose-700
      doc.text('Top Examiner Trap Questions in This Subject:', MARGIN_LEFT, y);
      y += 4.5;
      for (let idx = 0; idx < rawTrapQuestions.length; idx++) {
        const tq = rawTrapQuestions[idx];
        const tLines = doc.splitTextToSize(`${idx + 1}.  ${cleanMarkdownText(tq)}`, USABLE_WIDTH - 4);
        if (y + tLines.length * 4.2 > MAX_Y) { doc.addPage(); y = HEADER_START_Y + 6; }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        for (let l of tLines) {
          doc.text(l, MARGIN_LEFT + 2, y);
          y += 4.2;
        }
      }
    }
  }

  stampAllPageFooters(doc);
  doc.save(filename);
  return true;
}

/**
 * 3. Export Revision Notes, Definitions, Checklist & Flashcards PDF
 * (Parses markdown into authentic H1/H2/H3 banners, real tables, callouts, and flashcards)
 * 
 * @param {Object} options
 * @returns {Promise<boolean>}
 */
export async function exportRevisionPdf({
  subjectName = 'Subject',
  subjectCode = 'N/A',
  courseName = 'University Exam',
  tabTitle = 'Quick Revision Notes',
  content = '',
  flashcards = [],
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const safeSubject = (subjectCode || subjectName || 'Subject').replace(/[^a-zA-Z0-9_\-]/g, '_');
  const safeTab = tabTitle.toLowerCase().replace(/[^a-zA-Z0-9_\-]/g, '_');
  const filename = `SANKALP_${safeSubject}_${safeTab}.pdf`;

  let y = renderDocumentHeader(
    doc,
    tabTitle.toUpperCase(),
    `${subjectName} (${subjectCode})`,
    `Academic Scope: ${courseName} | Generated: ${new Date().toLocaleDateString()}`
  );

  if (flashcards && flashcards.length > 0) {
    // Render Flashcard Cards
    for (let idx = 0; idx < flashcards.length; idx++) {
      const card = flashcards[idx];
      const qLines = doc.splitTextToSize(`Q: ${cleanMarkdownText(card.front || '')}`, USABLE_WIDTH - 12);
      const aLines = doc.splitTextToSize(`Answer: ${cleanMarkdownText(card.back || '')}`, USABLE_WIDTH - 16);
      const cardHeight = 15 + qLines.length * 4.2 + aLines.length * 4 + 5;

      if (y + cardHeight > MAX_Y) {
        doc.addPage();
        y = HEADER_START_Y + 6;
      }

      // Outer Card
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.35);
      doc.roundedRect(MARGIN_LEFT, y, USABLE_WIDTH, cardHeight, 1.5, 1.5, 'FD');

      // Tag Bar
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`CARD ${idx + 1} | ${(card.tag || 'CONCEPT').toUpperCase()}`, MARGIN_LEFT + 4, y + 5.5);

      // Question
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      let qY = y + 10.5;
      for (let l of qLines) {
        doc.text(l, MARGIN_LEFT + 4, qY);
        qY += 4.2;
      }

      // Answer Box
      const ansBoxY = qY + 1;
      const ansBoxH = 5.5 + aLines.length * 4;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(MARGIN_LEFT + 4, ansBoxY, USABLE_WIDTH - 8, ansBoxH, 1, 1, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      let aY = ansBoxY + 4.5;
      for (let l of aLines) {
        doc.text(l, MARGIN_LEFT + 7, aY);
        aY += 4;
      }

      y += cardHeight + 4.5;
    }
  } else {
    // Parse Markdown into blocks (H1, H2, H3, real grid tables, callout blocks, lists)
    const blocks = parseMarkdownBlocks(content || '');
    y = renderFormattedBlocks(doc, blocks, y);
  }

  stampAllPageFooters(doc);
  doc.save(filename);
  return true;
}

/**
 * 3. Export AI Mentor Transcript PDF
 */
export async function exportMentorChatPdf({
  subjectName = 'General',
  subjectCode = 'N/A',
  messages = [],
}) {
  if (!messages || messages.length === 0) return false;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const safeSubject = (subjectCode || subjectName || 'MentorChat').replace(/[^a-zA-Z0-9_\-]/g, '_');
  const filename = `SANKALP_Mentor_Chat_${safeSubject}_${new Date().toISOString().split('T')[0]}.pdf`;

  let y = renderDocumentHeader(
    doc,
    'UNIVERSITY EXAMINATION MENTORSHIP TRANSCRIPT',
    `${subjectName} (${subjectCode})`,
    `Date: ${new Date().toLocaleDateString()} | Total Messages: ${messages.length}`
  );

  for (let idx = 0; idx < messages.length; idx++) {
    const msg = messages[idx];
    const isUser = msg.role === 'user';

    if (isUser) {
      // Student Question Card
      const qText = cleanMarkdownText(msg.content || '');
      const qLines = doc.splitTextToSize(qText, USABLE_WIDTH - 14);
      const cardHeight = Math.max(15, 9 + qLines.length * 4.2 + 4);

      if (y + cardHeight > MAX_Y) {
        doc.addPage();
        y = HEADER_START_Y + 6;
      }

      // Background & border
      doc.setFillColor(248, 250, 252); // slate-50
      doc.setDrawColor(203, 213, 225); // slate-300
      doc.setLineWidth(0.35);
      doc.roundedRect(MARGIN_LEFT, y, USABLE_WIDTH, cardHeight, 1.5, 1.5, 'FD');

      // Indigo left accent
      doc.setFillColor(79, 70, 229); // indigo-600
      doc.rect(MARGIN_LEFT, y, 3, cardHeight, 'F');

      // Header Tag
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(79, 70, 229);
      doc.text('STUDENT EXAMINATION QUERY', MARGIN_LEFT + 6, y + 5.5);

      // Question body
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      let lineY = y + 10;
      for (let l of qLines) {
        doc.text(l, MARGIN_LEFT + 6, lineY);
        lineY += 4.2;
      }

      y += cardHeight + 6;
    } else {
      // SANKALP AI Academic Mentor Answer
      if (y + 16 > MAX_Y) {
        doc.addPage();
        y = HEADER_START_Y + 6;
      }

      // Header Banner Strip
      doc.setFillColor(240, 253, 244); // emerald-50
      doc.setDrawColor(187, 247, 208); // emerald-200
      doc.setLineWidth(0.35);
      doc.roundedRect(MARGIN_LEFT, y, USABLE_WIDTH, 8, 1.5, 1.5, 'FD');

      // Emerald left accent
      doc.setFillColor(21, 128, 61); // emerald-700
      doc.rect(MARGIN_LEFT, y, 3, 8, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(21, 128, 61);
      doc.text('SANKALP AI ACADEMIC MENTOR MODEL ANSWER', MARGIN_LEFT + 6, y + 5.2);
      y += 11;

      // Always parse structured blocks (headings, tables, code blocks, callouts, lists, paragraphs)
      const blocks = parseMarkdownBlocks(msg.content || '');
      y = renderFormattedBlocks(doc, blocks, y);

      // Separation line between question-answer pairs
      if (idx < messages.length - 1) {
        if (y + 6 > MAX_Y) {
          doc.addPage();
          y = HEADER_START_Y + 6;
        }
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(MARGIN_LEFT, y + 2, MARGIN_LEFT + USABLE_WIDTH, y + 2);
        y += 6;
      }
    }
  }

  stampAllPageFooters(doc);
  doc.save(filename);
  return true;
}

/**
 * 4. Export Cheatsheet PDF
 */
export async function exportCheatsheetPdf({
  subjectName = 'Examination Subject',
  subjectCode = 'N/A',
  courseName = 'Degree Program',
  semesterName = 'Semester',
  content = '',
}) {
  return await exportRevisionPdf({
    subjectName,
    subjectCode,
    courseName: `${courseName} | ${semesterName}`,
    tabTitle: '1-Page Examination Master Cheatsheet',
    content,
    flashcards: [],
  });
}

/**
 * Backwards compatibility generic export helper
 */
export async function exportToPdf(options) {
  return true;
}
