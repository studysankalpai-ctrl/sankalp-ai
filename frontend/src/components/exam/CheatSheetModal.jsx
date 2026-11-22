import React, { useState, useEffect } from 'react';
import {
  Printer,
  Copy,
  Download,
  RotateCcw,
  X,
  FileText,
  Sparkles,
  Zap,
  Check,
  BookOpen,
  GraduationCap,
  Layers,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import MarkdownRenderer from '../common/MarkdownRenderer';
import { aiApi } from '../../lib/api';
import useAppStore from '../../store/appStore';
import { getCachedResponse, saveCachedResponse } from '../../lib/mentorStorage';
import toast from 'react-hot-toast';

export default function CheatSheetModal({ isOpen, onClose, subject, course, semester }) {
  const { groqApiKey, groqModel, isAiConnected } = useAppStore();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const cacheKey = subject?._id ? `${subject._id}:::cheatsheet` : null;

  const loadCheatSheet = async (forceFresh = false) => {
    if (!subject?._id) return;

    // 1. Try loading from IndexedDB cache first (0ms, 0 Groq tokens, works offline)
    if (!forceFresh && cacheKey) {
      try {
        const cached = await getCachedResponse(cacheKey);
        if (cached && cached.content) {
          setContent(cached.content);
          setIsCached(true);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Cheatsheet cache read error:', err);
      }
    }

    // 2. If not in cache, check if AI is connected
    if (!isAiConnected) {
      setLoading(false);
      toast.error('Connect your API key in Settings to generate the Examination Cheatsheet');
      return;
    }

    setLoading(true);

    // 2. Generate with AI
    try {
      setIsCached(false);
      const res = await aiApi.generateRevisionNotes({
        apiKey: groqApiKey,
        model: groqModel,
        subjectId: subject._id,
        type: 'cheatsheet',
      });

      if (res.data?.success && res.data.data?.content) {
        const generated = res.data.data.content;
        setContent(generated);

        // Save to IndexedDB cache
        if (cacheKey) {
          await saveCachedResponse(
            cacheKey,
            { content: generated, savedAt: new Date().toISOString() },
            subject._id
          );
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to generate cheatsheet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && subject?._id) {
      loadCheatSheet(false);
    }
  }, [isOpen, subject?._id]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Cheatsheet copied to clipboard!');
  };

  const handleDownloadPdf = async () => {
    if (!content) return;
    setDownloadingPdf(true);
    const toastId = toast.loading('Rendering high-density A4 PDF...');

    try {
      const element = document.getElementById('cheatsheet-print-container');
      if (!element) throw new Error('Cheatsheet DOM element not found');

      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default || html2pdfModule;

      const safeName = (subject?.code || subject?.name || 'Subject')
        .replace(/[^a-zA-Z0-9_\-]/g, '_');
      const filename = `SANKALP_Cheatsheet_${safeName}.pdf`;

      const opt = {
        margin: [8, 8, 8, 8],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollY: 0,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      };

      await html2pdf().set(opt).from(element).save();
      toast.success('Cheat sheet PDF downloaded!', { id: toastId });
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Direct download encountered an issue, opening print dialog...', { id: toastId });
      window.print();
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownload = () => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SANKALP_Cheatsheet_${(subject.code || subject.name || 'Subject').replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded Cheatsheet Markdown file');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto">
      {/* Print-specific style block */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #cheatsheet-print-container,
          #cheatsheet-print-container * {
            visibility: visible !important;
          }
          #cheatsheet-print-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 12mm !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
          .print-columns {
            column-count: 2 !important;
            column-gap: 18px !important;
          }
          .print-unit-card {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Action Bar (hidden when printing) */}
        <div className="no-print h-16 px-4 sm:px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                  1-Page University Examination Cheatsheet
                </h3>
                {isCached && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                    <Zap className="w-3 h-3 text-amber-500" /> Instant Cache (0 Tokens)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 truncate">
                {subject?.name} ({subject?.code}) &bull; High-density A4 printable revision matrix
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Primary Action: Direct Download PDF */}
            <button
              onClick={handleDownloadPdf}
              disabled={loading || !content || downloadingPdf}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all hover:scale-102 disabled:opacity-50"
              title="Download Cheat Sheet directly as PDF file"
            >
              {downloadingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{downloadingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>

            {/* Print A4 / Browser Dialog */}
            <button
              onClick={handlePrint}
              disabled={loading || !content}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold transition-colors disabled:opacity-50"
              title="Print directly or save as A4 PDF via browser"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print A4</span>
            </button>

            <button
              onClick={handleCopy}
              disabled={loading || !content}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold transition-colors disabled:opacity-50"
              title="Copy Cheatsheet Markdown"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={loading || !content}
              className="hidden md:inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold transition-colors disabled:opacity-50"
              title="Download as .md file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.md</span>
            </button>

            <button
              onClick={() => loadCheatSheet(true)}
              disabled={loading}
              className="p-1.5 rounded-xl text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              title="Regenerate fresh cheatsheet with AI"
            >
              <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50/50 dark:bg-gray-950/40">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center animate-spin">
                <Sparkles className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Synthesizing High-Density Cheatsheet with SANKALP AI...
              </p>
              <p className="text-xs text-gray-500 max-w-sm">
                Extracting core definitions, distinction matrices, formulas, and 10-mark anchor points across all 5 syllabus units.
              </p>
            </div>
          ) : content ? (
            <div
              id="cheatsheet-print-container"
              className="max-w-4xl mx-auto bg-white text-gray-900 p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-sm print:p-0 print:border-none print:shadow-none font-sans"
            >
              {/* University Formal Header */}
              <div className="border-b-2 border-gray-900 pb-3 mb-4 text-center">
                <div className="flex items-center justify-between text-[11px] font-mono text-gray-600 mb-1">
                  <span>UNIVERSITY EXAMINATION PREPARATION</span>
                  <span>ST. JOHN'S COLLEGE, AGRA</span>
                  <span>1-PAGE MASTER CHEATSHEET</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 uppercase">
                  {subject?.name || 'Examination Subject'}
                </h1>
                <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-gray-700 mt-1">
                  <span>Code: {subject?.code || 'N/A'}</span>
                  <span>&bull;</span>
                  <span>{course?.name || 'Course Program'}</span>
                  <span>&bull;</span>
                  <span>{semester?.name || 'Semester'}</span>
                  <span>&bull;</span>
                  <span className="font-mono text-indigo-700">5-Unit Rapid Recall Edition</span>
                </div>
              </div>

              {/* Cheatsheet Body */}
              <div className="print-columns">
                <MarkdownRenderer
                  content={content}
                  className="text-xs leading-relaxed text-gray-900"
                />
              </div>

              {/* Bottom Print Footer */}
              <div className="mt-6 pt-3 border-t border-gray-300 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                <span>Prepared via SANKALP AI Autonomous Curriculum Engine</span>
                <span>Page 1 / 1 Examination Rapid Reference</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No Cheatsheet Generated</p>
              <button
                onClick={() => loadCheatSheet(true)}
                className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700 transition-colors"
              >
                Generate Cheatsheet Now
              </button>
            </div>
          )}
        </div>

        {/* Mobile Sticky Action Bar */}
        {content && !loading && (
          <div className="no-print sm:hidden p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadPdf}
              disabled={loading || !content || downloadingPdf}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              {downloadingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{downloadingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={loading || !content}
              className="px-3.5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold"
              title="Print"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
