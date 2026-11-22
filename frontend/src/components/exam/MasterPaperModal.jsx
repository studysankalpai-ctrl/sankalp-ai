import React, { useState } from 'react';
import {
  X,
  Printer,
  Copy,
  Download,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Calendar,
  Layers,
  Award,
  ChevronDown,
  ChevronUp,
  Bookmark,
  FileText,
  FileCode,
} from 'lucide-react';
import MarkdownRenderer from '../common/MarkdownRenderer';
import toast from 'react-hot-toast';

export default function MasterPaperModal({ paper, onClose }) {
  const [showAllSolutions, setShowAllSolutions] = useState(false);
  const [expandedSolutions, setExpandedSolutions] = useState({});
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);

  if (!paper) return null;

  const toggleSolution = (qKey) => {
    setExpandedSolutions((prev) => ({
      ...prev,
      [qKey]: !prev[qKey],
    }));
  };

  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const formatSimpleMarkdownToHtml = (md) => {
    if (!md) return '';
    let html = escapeHtml(md);
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/^###\s+([^\n]+)/gm, '<h4 style="font-weight:700;margin:8px 0 3px;font-size:13px;">$1</h4>');
    html = html.replace(/^##\s+([^\n]+)/gm, '<h3 style="font-weight:700;margin:10px 0 4px;font-size:14px;border-bottom:1px solid #e5e7eb;padding-bottom:2px;">$1</h3>');
    html = html.replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #e5e7eb;margin:8px 0;" />');
    html = html.replace(/^[-*•]\s+([^\n]+)/gm, '<li style="margin-bottom:3px;">$1</li>');
    html = html.replace(/((?:<li[\s\S]+?<\/li>\s*)+)/g, '<ul style="padding-left:20px;margin:6px 0;">$1</ul>');
    html = html.replace(/\n\n/g, '<p style="margin:6px 0;"></p>');
    return html;
  };

  const generateFullHtml = (includeAnswers = false, autoPrint = false) => {
    const sectionsHtml = (paper.sections || []).map((sec, sIdx) => {
      const questionsHtml = (sec.questions || []).map((q, qIdx) => {
        const orHtml = q.or_question ? `
          <div class="or-divider">[ OR ]</div>
          <div class="or-question">${escapeHtml(q.or_question)}</div>
        ` : '';

        const solutionHtml = (includeAnswers && q.model_solution) ? `
          <div class="model-solution">
            <div class="model-title">MODEL UNIVERSITY ANSWER &amp; MARKING BREAKDOWN (${q.marks || 10} MARKS):</div>
            <div class="model-body" style="font-size:12px;line-height:1.6;color:#1f2937;">${formatSimpleMarkdownToHtml(q.model_solution)}</div>
          </div>
        ` : '';

        return `
          <div class="question-row">
            <div class="q-left">
              <span class="q-num">Q.${escapeHtml(q.q_num || `${sIdx + 1}.${qIdx + 1}`)}</span>
              <div class="q-text">
                <p>${escapeHtml(q.question)}</p>
                ${q.repetition_status ? `<span class="repetition-badge">&#9733; ${escapeHtml(q.repetition_status)}</span>` : ''}
                ${orHtml}
                ${solutionHtml}
              </div>
            </div>
            <div class="q-marks">[ ${q.marks || 2} ]</div>
          </div>
        `;
      }).join('');

      return `
        <div class="section-block">
          <div class="section-header">
            <div class="sec-title">${escapeHtml(sec.section_name)}</div>
            <div class="sec-marks">Total: ${sec.total_marks || ''} Marks</div>
          </div>
          <div class="sec-instructions">${escapeHtml(sec.section_instructions || '')}</div>
          <div class="questions-list">
            ${questionsHtml}
          </div>
        </div>
      `;
    }).join('');

    const instructionsList = (paper.instructions || []).map((ins) => `<li>${escapeHtml(ins)}</li>`).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(paper.paper_title)} - Official Examination Paper</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 15mm 20mm 15mm;
    }
    body {
      font-family: 'Times New Roman', Times, Georgia, serif;
      color: #000;
      background: #fff;
      margin: 0;
      padding: 24px;
      line-height: 1.45;
      font-size: 12.5pt;
    }
    .print-bar {
      background: #1e1b4b;
      color: #fff;
      padding: 10px 16px;
      border-radius: 8px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: Arial, sans-serif;
      font-size: 13px;
    }
    .print-bar button {
      background: #6366f1;
      color: #fff;
      border: none;
      padding: 6px 16px;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
    }
    @media print {
      .print-bar { display: none !important; }
      body { padding: 0 !important; }
    }
    .exam-header {
      text-align: center;
      border-bottom: 2px solid #000;
      padding-bottom: 12px;
      margin-bottom: 14px;
    }
    .exam-header h3 {
      font-size: 11pt;
      font-weight: bold;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin: 0 0 4px 0;
    }
    .exam-header h1 {
      font-size: 16pt;
      font-weight: 800;
      text-transform: uppercase;
      margin: 4px 0;
      letter-spacing: 0.5px;
    }
    .exam-meta {
      font-size: 11.5pt;
      margin-top: 4px;
    }
    .roll-box-table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 11pt;
    }
    .roll-box-table td {
      border: 1px solid #000;
      padding: 6px 10px;
    }
    .roll-cells {
      display: inline-flex;
      margin-left: 8px;
      vertical-align: middle;
    }
    .roll-cell {
      width: 20px;
      height: 22px;
      border: 1px solid #000;
      border-right: none;
      display: inline-block;
    }
    .roll-cell:last-child {
      border-right: 1px solid #000;
    }
    .time-marks-bar {
      display: flex;
      justify-content: space-between;
      border-top: 1.5px solid #000;
      border-bottom: 1.5px solid #000;
      padding: 5px 0;
      margin: 10px 0 14px 0;
      font-weight: bold;
      font-size: 11.5pt;
      text-transform: uppercase;
    }
    .instructions-box {
      border: 1px solid #000;
      padding: 8px 14px;
      margin-bottom: 20px;
      font-size: 10.5pt;
      background: #fafafa;
    }
    @media print {
      .instructions-box { background: transparent; }
    }
    .instructions-box ol {
      margin: 4px 0 0 20px;
      padding: 0;
    }
    .section-block {
      margin-bottom: 24px;
      page-break-inside: avoid;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      border-bottom: 1.5px solid #000;
      padding-bottom: 3px;
      margin-bottom: 6px;
      font-weight: bold;
      font-size: 12pt;
      text-transform: uppercase;
    }
    .sec-instructions {
      font-style: italic;
      font-size: 10pt;
      margin-bottom: 12px;
    }
    .question-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 14px;
      page-break-inside: avoid;
      font-size: 11.5pt;
    }
    .q-left {
      display: flex;
      flex: 1;
      padding-right: 20px;
    }
    .q-num {
      font-weight: bold;
      min-width: 45px;
      padding-top: 1px;
    }
    .q-text {
      flex: 1;
    }
    .q-text p {
      margin: 0 0 4px 0;
      line-height: 1.4;
    }
    .q-marks {
      font-weight: bold;
      min-width: 50px;
      text-align: right;
    }
    .or-divider {
      text-align: center;
      font-weight: bold;
      margin: 8px 0;
      font-size: 10pt;
      letter-spacing: 1px;
    }
    .or-question {
      font-weight: 500;
    }
    .repetition-badge {
      display: inline-block;
      font-size: 9pt;
      font-family: Arial, sans-serif;
      background: #f1f5f9;
      color: #0f172a;
      border: 1px solid #cbd5e1;
      padding: 1px 7px;
      border-radius: 4px;
      margin-top: 3px;
    }
    .model-solution {
      margin-top: 10px;
      padding: 10px 14px;
      background: #f8fafc;
      border-left: 3px solid #4338ca;
      font-size: 10pt;
      font-family: Arial, sans-serif;
    }
    .model-solution .model-title {
      font-weight: bold;
      color: #3730a3;
      margin-bottom: 4px;
    }
    .model-solution pre {
      white-space: pre-wrap;
      font-family: inherit;
      margin: 0;
      line-height: 1.5;
    }
    .paper-footer {
      text-align: center;
      margin-top: 36px;
      padding-top: 12px;
      border-top: 1px dashed #666;
      font-size: 10pt;
      letter-spacing: 3px;
      text-transform: uppercase;
    }
  </style>
  ${autoPrint ? '<script>window.onload = function() { window.print(); };</script>' : ''}
</head>
<body>
  <div class="print-bar">
    <span><strong>SANKALP AI</strong> &bull; ${escapeHtml(paper.paper_title)} (Authentic University Exam Format)</span>
    <button onclick="window.print()">Print / Save as PDF</button>
  </div>

  <div class="exam-header">
    <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
      <img src="${window.location.origin}/Logo.png" alt="Logo" style="height: 44px; width: auto; object-fit: contain;" />
    </div>
    <h3>UNIVERSITY END-SEMESTER EXAMINATION BOARD</h3>
    <h1>${escapeHtml(paper.paper_title)}</h1>
    <div class="exam-meta">
      <strong>${escapeHtml(paper.course_name || '')}</strong> &bull; ${escapeHtml(paper.semester_name || '')}<br />
      Subject: <strong>${escapeHtml(paper.subject_name || '')}</strong> | Paper Code: <strong>${escapeHtml(paper.subject_code || 'N/A')}</strong>
    </div>
  </div>

  <table class="roll-box-table">
    <tr>
      <td style="width: 58%;">
        <strong>Candidate Roll No:</strong>
        <span class="roll-cells">
          <span class="roll-cell"></span>
          <span class="roll-cell"></span>
          <span class="roll-cell"></span>
          <span class="roll-cell"></span>
          <span class="roll-cell"></span>
          <span class="roll-cell"></span>
          <span class="roll-cell"></span>
          <span class="roll-cell"></span>
          <span class="roll-cell"></span>
          <span class="roll-cell"></span>
        </span>
      </td>
      <td style="width: 42%; text-align: right;">
        <strong>Total Questions:</strong> ${(paper.sections || []).reduce((acc, s) => acc + (s.questions || []).length, 0)} &nbsp;|&nbsp; 
        <strong>Max Time:</strong> ${escapeHtml(paper.duration || '3 Hours')}
      </td>
    </tr>
  </table>

  <div class="time-marks-bar">
    <span>Time Allowed: ${escapeHtml(paper.duration || '3 Hours')}</span>
    <span>Maximum Marks: ${paper.max_marks || 70} Marks</span>
  </div>

  <div class="instructions-box">
    <strong>General Instructions to Candidates:</strong>
    <ol>
      ${instructionsList}
    </ol>
  </div>

  ${sectionsHtml}

  <div class="paper-footer">
    &bull;&bull;&bull; END OF QUESTION PAPER &bull;&bull;&bull;
  </div>
</body>
</html>`;
  };

  const handlePrintToPdf = (includeAnswers = false) => {
    const printWindow = window.open('', '_blank', 'width=950,height=850');
    if (!printWindow) {
      window.print();
      return;
    }
    const html = generateFullHtml(includeAnswers, true);
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleDownloadHtml = (includeAnswers = false) => {
    const html = generateFullHtml(includeAnswers, false);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeTitle = (paper.paper_title || 'Final_Paper')
      .replace(/[^a-zA-Z0-9_\-]/g, '_')
      .replace(/_+/g, '_');
    link.href = url;
    link.download = `${safeTitle}${includeAnswers ? '_with_Solutions' : ''}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded: ${safeTitle}${includeAnswers ? '_with_Solutions' : ''}.html`);
    setDownloadMenuOpen(false);
  };

  const handleDownloadMarkdown = (includeAnswers = false) => {
    let md = `# UNIVERSITY SEMESTER EXAMINATION BOARD\n`;
    md += `## ${paper.paper_title}\n\n`;
    md += `**Course**: ${paper.course_name} • **Semester**: ${paper.semester_name}\n`;
    md += `**Subject**: ${paper.subject_name} (${paper.subject_code || 'N/A'})\n`;
    md += `**Time Allowed**: ${paper.duration || '3 Hours'} | **Maximum Marks**: ${paper.max_marks || 70} Marks\n\n`;
    md += `---\n\n`;
    md += `### GENERAL INSTRUCTIONS TO CANDIDATES\n`;
    (paper.instructions || []).forEach((ins, idx) => {
      md += `${idx + 1}. ${ins}\n`;
    });
    md += `\n---\n\n`;

    (paper.sections || []).forEach((sec) => {
      md += `## ${sec.section_name} (Total: ${sec.total_marks} Marks)\n`;
      md += `*${sec.section_instructions}*\n\n`;
      (sec.questions || []).forEach((q) => {
        md += `**Q.${q.q_num}.** ${q.question} \`[${q.marks} Marks]\``;
        if (q.repetition_status) {
          md += ` *(${q.repetition_status})*`;
        }
        md += `\n`;
        if (q.or_question) {
          md += `\n> **[OR]**\n> ${q.or_question}\n`;
        }
        if (includeAnswers && q.model_solution) {
          md += `\n**Model Answer & Scoring Key (${q.marks}M):**\n${q.model_solution}\n`;
        }
        md += `\n---\n\n`;
      });
    });

    md += `\n### ✦✦✦ END OF QUESTION PAPER ✦✦✦\n`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeTitle = (paper.paper_title || 'Final_Paper')
      .replace(/[^a-zA-Z0-9_\-]/g, '_')
      .replace(/_+/g, '_');
    link.href = url;
    link.download = `${safeTitle}${includeAnswers ? '_with_Solutions' : ''}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded: ${safeTitle}${includeAnswers ? '_with_Solutions' : ''}.md`);
    setDownloadMenuOpen(false);
  };

  const handleCopy = () => {
    let text = `${paper.paper_title}\n`;
    text += `Course: ${paper.course_name} | Subject: ${paper.subject_name} (${paper.subject_code})\n`;
    text += `Time Allowed: ${paper.duration} | Maximum Marks: ${paper.max_marks}\n\n`;
    text += `INSTRUCTIONS:\n`;
    (paper.instructions || []).forEach((ins, idx) => {
      text += `${idx + 1}. ${ins}\n`;
    });
    text += `\n`;

    (paper.sections || []).forEach((sec) => {
      text += `=== ${sec.section_name} (${sec.total_marks} Marks) ===\n`;
      text += `${sec.section_instructions}\n\n`;
      (sec.questions || []).forEach((q) => {
        text += `${q.q_num}. ${q.question} [${q.marks} Marks] - (${q.repetition_status || 'Important'})\n`;
        if (q.or_question) {
          text += `   [OR]\n   ${q.or_question}\n`;
        }
        text += `\n`;
      });
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    toast.success('Question paper copied to clipboard!');
  };

  const isVisible = (qKey) => showAllSolutions || !!expandedSolutions[qKey];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-5xl bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[96vh] sm:max-h-[92vh] overflow-hidden print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Modal Top Actions (Hidden in Print) */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-950/80 shrink-0 print:hidden flex-wrap gap-2 sm:gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
              <img src="/Logo.png" alt="SANKALP" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                {paper.paper_title}
              </h2>
              <p className="text-[11px] text-gray-500">
                5-Year Cross-Paper Multi-Year Synthesis • University Examination Standard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Toggle Solutions */}
            <button
              onClick={() => setShowAllSolutions(!showAllSolutions)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                showAllSolutions
                  ? 'bg-gray-100 border-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
              }`}
              title="Toggle answers"
            >
              {showAllSolutions ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showAllSolutions ? 'Hide Answers' : 'Reveal Model Answers'}</span>
            </button>

            {/* Direct Print / Save as PDF */}
            <button
              onClick={() => handlePrintToPdf(showAllSolutions)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-950 shadow-xs transition-colors"
              title="Print or Save as Official PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            {/* Download Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-indigo-500" />
                <span>Download</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {downloadMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setDownloadMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1.5 w-60 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl p-1.5 z-40 space-y-1 text-xs animate-in fade-in">
                    <button
                      onClick={() => handleDownloadHtml(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-gray-800 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <FileCode className="w-4 h-4 text-indigo-500 shrink-0" />
                      <div>
                        <p className="font-bold">Official Exam Paper (.html)</p>
                        <p className="text-[10px] text-gray-400">Offline printable question paper</p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleDownloadHtml(true)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-gray-800 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-purple-500 shrink-0" />
                      <div>
                        <p className="font-bold">Paper + Model Solutions (.html)</p>
                        <p className="text-[10px] text-gray-400">Complete answer key & rubrics</p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleDownloadMarkdown(showAllSolutions)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-gray-800 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div>
                        <p className="font-bold">Markdown File (.md)</p>
                        <p className="text-[10px] text-gray-400">Word / Notion / Notes compatible</p>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Copy Text */}
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Copy Paper Text"
            >
              <Copy className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Paper Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-10 space-y-6 sm:space-y-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 print:p-0 print:overflow-visible">
          {/* Official University Paper Header */}
          <div className="text-center pb-5 sm:pb-6 border-b-2 border-gray-900 dark:border-gray-100 print:border-black space-y-1.5">
            <p className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-indigo-600 dark:text-indigo-400 print:text-black">
              UNIVERSITY END-SEMESTER EXAMINATION • PREPARATION BOARD
            </p>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 uppercase print:text-black">
              {paper.paper_title}
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 print:text-black">
              {paper.course_name} • {paper.semester_name}
            </p>
            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-mono print:text-black">
              Course Code: {paper.subject_code || 'N/A'} • Subject: {paper.subject_name}
            </p>

            <div className="flex items-center justify-between pt-3 sm:pt-4 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 print:text-black border-t border-dashed border-gray-300 dark:border-gray-700 mt-3 sm:mt-4">
              <span>Time Allowed: {paper.duration || '3 Hours'}</span>
              <span>Maximum Marks: {paper.max_marks || 70} Marks</span>
            </div>
          </div>

          {/* Candidate Details & Roll Number Box */}
          <div className="border border-gray-900 dark:border-gray-100 print:border-black p-3 sm:p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-gray-50/50 dark:bg-gray-800/20 print:bg-transparent">
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap max-w-full">
              <span className="font-extrabold uppercase tracking-wider text-gray-900 dark:text-gray-100 print:text-black text-[11px] sm:text-xs">
                Candidate Roll No:
              </span>
              <div className="inline-flex border border-gray-900 dark:border-gray-100 print:border-black bg-white dark:bg-gray-900 print:bg-transparent max-w-full overflow-x-auto">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-5 h-6 border-r border-gray-900 dark:border-gray-100 print:border-black last:border-r-0"
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 print:text-black font-semibold text-[11px]">
              <span>Paper ID: <strong>{paper.subject_code || 'EXAM'}-FINAL</strong></span>
              <span>•</span>
              <span>Max Time: <strong>{paper.duration || '3 Hours'}</strong></span>
            </div>
          </div>

          {/* 5-Year Analysis Banner (Clean Monochrome / Non-AI appearance) */}
          {paper.analysis_summary && (
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 text-xs space-y-2 print:border print:border-gray-300">
              <div className="flex items-center justify-between font-bold text-gray-900 dark:text-gray-100">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  5-Year Cross-Paper Analysis Insights
                </span>
                {paper.analysis_summary.years_analyzed?.length > 0 && (
                  <span className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    Years: {paper.analysis_summary.years_analyzed.join(', ')}
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {paper.analysis_summary.repetition_insights}
              </p>
              {paper.analysis_summary.preparation_advice && (
                <p className="text-[11px] text-gray-800 dark:text-gray-200 font-medium">
                  <strong>Scoring Advice:</strong> {paper.analysis_summary.preparation_advice}
                </p>
              )}
            </div>
          )}

          {/* Instructions Box */}
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 text-xs space-y-1.5 print:bg-transparent print:border-black">
            <p className="font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 print:text-black">
              General Instructions to Candidates:
            </p>
            <ul className="list-decimal list-inside space-y-1 text-gray-600 dark:text-gray-400 print:text-black">
              {(paper.instructions || []).map((ins, i) => (
                <li key={i}>{ins}</li>
              ))}
            </ul>
          </div>

          {/* Paper Sections */}
          <div className="space-y-8">
            {(paper.sections || []).map((section, sIdx) => (
              <div key={sIdx} className="space-y-4">
                {/* Section Header */}
                <div className="pb-2 border-b-2 border-gray-800 dark:border-gray-200 flex items-center justify-between flex-wrap gap-2 print:border-black">
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-tight text-gray-900 dark:text-gray-100 print:text-black">
                      {section.section_name}
                    </h3>
                    <p className="text-xs text-gray-500 italic print:text-black">
                      {section.section_instructions}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 print:border-black print:bg-transparent">
                    Total: {section.total_marks} Marks
                  </span>
                </div>

                {/* Section Questions List */}
                <div className="space-y-4">
                  {(section.questions || []).map((q, qIdx) => {
                    const qKey = `sec-${sIdx}-q-${qIdx}`;
                    const solOpen = isVisible(qKey);

                    return (
                      <div
                        key={qIdx}
                        className="p-4 rounded-2xl bg-gray-50/60 dark:bg-gray-800/30 border border-gray-200/80 dark:border-gray-800 space-y-3 print:bg-transparent print:border-b print:border-gray-300 print:rounded-none print:px-0"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 print:text-black font-mono">
                                {q.q_num}
                              </span>
                              {q.repetition_status && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 print:border print:text-black">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  {q.repetition_status}
                                </span>
                              )}
                              {q.unit && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 print:hidden">
                                  {q.unit}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-relaxed print:text-black">
                              {q.question}
                            </p>

                            {/* Internal Choice [OR] Question if present */}
                            {q.or_question && (
                              <div className="pt-2 pl-4 border-l-2 border-indigo-400 dark:border-indigo-600 space-y-1">
                                <span className="text-[11px] font-black uppercase text-indigo-600 dark:text-indigo-400 print:text-black">
                                  [OR]
                                </span>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-relaxed print:text-black">
                                  {q.or_question}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="text-right shrink-0">
                            <span className="inline-block px-2 py-1 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900 print:border-black print:bg-transparent print:text-black">
                              [{q.marks} Marks]
                            </span>
                          </div>
                        </div>

                        {/* Model Solution & Scoring Breakdown */}
                        <div className="pt-2">
                          <button
                            onClick={() => toggleSolution(qKey)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline print:hidden"
                          >
                            {solOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            <span>{solOpen ? 'Hide Model Solution' : 'View Model Solution & Marking Key'}</span>
                          </button>

                          {solOpen && (
                            <div className="mt-3 p-4 rounded-xl bg-white dark:bg-gray-900 border border-indigo-100 dark:border-indigo-900/60 shadow-xs space-y-2 print:border-none print:p-0">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                Model University Answer & Grading Breakdown ({q.marks} Marks):
                              </p>
                              <div className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed print:text-black">
                                <MarkdownRenderer content={q.model_solution} />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* End of Question Paper Footer */}
          <div className="text-center pt-8 border-t border-dashed border-gray-300 dark:border-gray-700 text-xs text-gray-400 font-mono uppercase tracking-widest print:text-black">
            ✦✦✦ END OF QUESTION PAPER ✦✦✦
          </div>
        </div>
      </div>
    </div>
  );
}
