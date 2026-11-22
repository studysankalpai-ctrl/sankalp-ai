import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Printer,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Send,
  Loader2,
  FileQuestion,
  ExternalLink,
  Zap,
  BarChart3,
  PenTool,
  Calendar,
  FileCheck2,
  Copy,
  Check,
  Columns,
  X,
  Type,
  Trash2,
} from 'lucide-react';
import { publicApi, aiApi } from '../lib/api';
import useAppStore from '../store/appStore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MasterPaperModal from '../components/exam/MasterPaperModal';
import MarkdownRenderer from '../components/common/MarkdownRenderer';
import toast from 'react-hot-toast';

const FONT_SIZE_MAP = {
  sm: { label: 'Small', class: 'text-xs sm:text-sm' },
  base: { label: 'Normal', class: 'text-sm sm:text-base' },
  lg: { label: 'Large', class: 'text-base sm:text-lg' },
  xl: { label: 'Huge', class: 'text-lg sm:text-xl' },
};

export default function PdfViewerPage() {
  const { fileId } = useParams();
  const { groqApiKey, groqModel, isAiConnected, selectedSubject, sidebarCollapsed } = useAppStore();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [aiPanelOpen, setAiPanelOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState('');
  const [selectedActionTitle, setSelectedActionTitle] = useState('');
  const [customQuestionInput, setCustomQuestionInput] = useState('');
  const [zoomLevel, setZoomLevel] = useState(100);

  // Dedicated Answer Store for this opened PDF
  const [answers, setAnswers] = useState(() => {
    if (typeof window !== 'undefined' && fileId) {
      try {
        const saved = sessionStorage.getItem(`sankalp_doc_answers_${fileId}`);
        if (saved) return JSON.parse(saved);
      } catch (_) {}
    }
    return [];
  });
  const [activeAnswerIndex, setActiveAnswerIndex] = useState(0);

  // Font sizing & study reader modes
  const [aiFontSize, setAiFontSize] = useState('base');
  const [panelWidthMode, setPanelWidthMode] = useState('normal'); // 'normal' | 'wide'
  const [studyModalOpen, setStudyModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [copied, setCopied] = useState(false);

  // Master Final Paper Modal state
  const [masterPaper, setMasterPaper] = useState(null);
  const [masterPaperModalOpen, setMasterPaperModalOpen] = useState(false);
  const [generatingMasterPaper, setGeneratingMasterPaper] = useState(false);

  const iframeRef = useRef(null);
  const answerBoxRef = useRef(null);

  // Current active answer object
  const currentAnswer = answers[activeAnswerIndex] || null;

  // Sync document answers to sessionStorage
  useEffect(() => {
    if (fileId && answers.length > 0) {
      try {
        sessionStorage.setItem(`sankalp_doc_answers_${fileId}`, JSON.stringify(answers));
      } catch (_) {}
    }
  }, [fileId, answers]);

  // Escape key closes study modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && studyModalOpen) {
        setStudyModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [studyModalOpen]);

  // Load document metadata
  useEffect(() => {
    async function loadFileInfo() {
      try {
        setLoading(true);
        setLoadError(null);
        const res = await publicApi.getFile(fileId);
        if (res.data?.success && res.data.data) {
          setFile(res.data.data);
        } else {
          setLoadError(res.data?.message || 'File not found');
        }
      } catch (err) {
        console.error('Failed to load file:', err);
        setLoadError(err.response?.data?.message || err.message || 'Failed to load PDF metadata');
      } finally {
        setLoading(false);
      }
    }
    if (fileId) {
      loadFileInfo();
    }
  }, [fileId]);

  const handlePrint = () => {
    if (iframeRef.current) {
      try {
        iframeRef.current.contentWindow.print();
      } catch {
        window.print();
      }
    } else {
      window.print();
    }
  };

  const handleFullscreen = () => {
    const el = document.getElementById('pdf-viewer-container');
    if (el) {
      if (!document.fullscreenElement) {
        el.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const handleClearDocChat = () => {
    setAnswers([]);
    setActiveAnswerIndex(0);
    setAiOutput('');
    setSelectedActionTitle('');
    if (fileId) {
      sessionStorage.removeItem(`sankalp_doc_answers_${fileId}`);
    }
    toast.success('Document answer history reset');
  };

  const handleAiAction = async (actionType, marks = null) => {
    if (!isAiConnected) {
      toast.error('Connect your API key in Settings to use SANKALP AI assistance');
      return;
    }

    const docName = file?.title || file?.original_filename || 'Examination Document';
    const queryText = customQuestionInput.trim();
    let prompt = '';

    if (marks) {
      prompt = `Generate a complete, high-scoring university examination answer for ${marks} Marks for: "${queryText || docName}".
Structure the answer strictly for ${marks} marks according to university grading rubrics:
- Definition & core premise in bold
- Key technical points with clear subheadings
- Equations / Diagram description if applicable
- Easy everyday real-world example
- Exam scoring conclusion`;
    } else if (actionType === 'Explain Textbook' || actionType === 'Explain Paper') {
      prompt = file?.type === 'book'
        ? `Explain the core curriculum and conceptual structure from this prescribed university textbook: "${docName}" by ${file.author || 'Author'}. Provide sharp explanations and simple real-world analogies that any student can understand.`
        : `Summarize and explain the complete examination pattern, difficulty, unit distribution, and core topics represented in this university paper: "${docName}".`;
    } else if (actionType === 'Solve This Question') {
      prompt = queryText
        ? `Provide a complete, step-by-step model solution with full working, diagrams outline and clear explanation for: "${queryText}".`
        : `Identify and provide a complete model solution with step-by-step working for the primary question in "${docName}".`;
    } else if (actionType === 'Find This Topic in Other Years') {
      prompt = `Analyze the recurring pattern of the core topic tested in "${docName}". Mention which years this concept typically appears, how question phrasing changes across years, and likely future variations.`;
    } else {
      prompt = queryText || `Explain the core question and provide a complete model solution with marking breakdown for "${docName}".`;
    }

    const displayQuestion = queryText || actionType;
    setCustomQuestionInput('');
    setAiLoading(true);
    setSelectedActionTitle(actionType);

    try {
      // Determine the exact subject ID associated with this document
      const targetSubjectId = file?.subject?._id || file?.subject_id || file?.folder_id?.subject_id || selectedSubject?._id;

      const res = await aiApi.chat({
        apiKey: groqApiKey,
        model: groqModel,
        subjectId: targetSubjectId,
        documentId: file?._id,
        documentType: file?.type || 'academic_file',
        documentTitle: docName,
        documentScoped: true,
        learnByBook: file?.type === 'book',
        bookId: file?.type === 'book' ? file._id : null,
        marksFormat: marks,
        messages: [
          // Keep conversational context limited to last answer if present
          ...(currentAnswer ? [{ role: 'assistant', content: currentAnswer.content }] : []),
          { role: 'user', content: prompt },
        ],
      });

      if (res.data?.success && res.data.data?.message?.content) {
        const assistantContent = res.data.data.message.content;
        const newAnswer = {
          id: Date.now().toString(),
          actionTitle: actionType,
          marks,
          prompt: displayQuestion,
          content: assistantContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setAnswers((prev) => {
          const updated = [...prev, newAnswer];
          setActiveAnswerIndex(updated.length - 1);
          return updated;
        });
        setAiOutput(assistantContent);

        // Reset scroll position of the internal answer box to top so top line is immediately visible
        setTimeout(() => {
          if (answerBoxRef.current) {
            answerBoxRef.current.scrollTop = 0;
          }
        }, 50);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'AI generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  // Generate 5-Year Master Final Preparation Paper
  const handleGenerateMasterFinalPaper = async () => {
    if (!isAiConnected) {
      toast.error('Connect your API key in Settings to generate the Master Final Paper');
      return;
    }

    const targetSubjectId = file?.folder_id?.subject_id || selectedSubject?._id;
    if (!targetSubjectId) {
      toast.error('Please select a subject from the top header to synthesize 5-year papers');
      return;
    }

    setGeneratingMasterPaper(true);
    try {
      const res = await aiApi.generateFinalPaper({
        apiKey: groqApiKey,
        model: groqModel,
        subjectId: targetSubjectId,
      });

      if (res.data?.success && res.data.data) {
        setMasterPaper(res.data.data);
        setMasterPaperModalOpen(true);
        toast.success(`Generated: ${res.data.data.paper_title}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to generate Master Final Paper');
    } finally {
      setGeneratingMasterPaper(false);
    }
  };

  if (loading) return <LoadingSpinner text="Opening academic document..." fullPage />;

  // Direct Cloudinary CDN URL if available, otherwise proxy through backend view endpoint
  const pdfViewUrl = file?.cloudinary_url || (file ? `/api/public/files/${file._id}/view` : '');
  const pdfDownloadUrl = file?.cloudinary_url || (file ? `/api/public/files/${file._id}/download` : '');

  return (
    <div
      id="pdf-viewer-container"
      className={`fixed top-16 bottom-0 right-0 ${
        sidebarCollapsed ? 'left-0 md:left-20' : 'left-0 md:left-64'
      } flex flex-col bg-gray-100 dark:bg-gray-950 overflow-hidden z-20 transition-all duration-300`}
    >
      {/* Top Toolbar */}
      <div className="h-12 sm:h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-3 sm:px-4 flex items-center justify-between shrink-0 shadow-2xs z-10">
        {/* Left: Back & Filename */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            to="/library"
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
            title="Back to Academic Library"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 truncate max-w-[130px] sm:max-w-xs md:max-w-md">
              {file?.title || file?.original_filename || 'Academic PDF Document'}
            </h2>
            <p className="text-[10px] sm:text-[11px] text-gray-400 truncate max-w-[140px] sm:max-w-xs hidden sm:block">
              {file?.type === 'book'
                ? `Prescribed Textbook • By ${file.author || 'Author'} (${file.edition || 'Standard Edition'})`
                : file?.subject?.name
                ? `${file.subject.name} ${file.subject.code ? `(${file.subject.code})` : ''} • Examination Document`
                : 'Integrated University Reader'}
            </p>
          </div>
        </div>

        {/* Right: Master Paper Button, Zoom, Print, Download, Fullscreen & AI Toggle */}
        <div className="flex items-center gap-1 sm:gap-2">
          {file?.type === 'book' ? (
            <Link
              to={`/mentor?bookId=${file._id}&learnByBook=true`}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all"
              title="Open Universal AI Exam Mentor in Learn by Book mode"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Learn by Book</span>
            </Link>
          ) : (
            <button
              onClick={handleGenerateMasterFinalPaper}
              disabled={generatingMasterPaper}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 shadow-xs transition-all disabled:opacity-50"
              title="Synthesize all 5 years into a Master Final Preparation Paper"
            >
              {generatingMasterPaper ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileCheck2 className="w-3.5 h-3.5" />
              )}
              <span>{generatingMasterPaper ? 'Analyzing 5-Yrs...' : 'Generate 5-Yr Final Paper'}</span>
            </button>
          )}

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 text-xs text-gray-600 dark:text-gray-300">
            <button
              onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
              className="p-1 rounded-lg hover:bg-white dark:hover:bg-gray-700"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 text-[11px] font-mono">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(200, z + 15))}
              className="p-1 rounded-lg hover:bg-white dark:hover:bg-gray-700"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <a
            href={pdfViewUrl}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 sm:p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Open in Full Browser Tab"
          >
            <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </a>

          <button
            onClick={handlePrint}
            className="hidden sm:inline-flex p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Print Document"
          >
            <Printer className="w-4 h-4" />
          </button>

          <a
            href={pdfDownloadUrl}
            download={file?.original_filename || 'document.pdf'}
            className="p-1.5 sm:p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </a>

          <button
            onClick={handleFullscreen}
            className="hidden sm:inline-flex p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Toggle Full Screen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setAiPanelOpen(!aiPanelOpen)}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              aiPanelOpen
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{aiPanelOpen ? 'AI Tutor Active' : 'AI Assistant'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: PDF on Left, Dedicated Document AI Tutor on Right */}
      <div className="flex-1 min-h-0 w-full flex overflow-hidden relative">
        {/* Left PDF Frame (Full 100% height) */}
        <div className="flex-1 min-h-0 h-full bg-gray-200 dark:bg-gray-900/80 p-2 sm:p-3 flex flex-col overflow-hidden">
          {pdfViewUrl ? (
            <div className="w-full h-full flex-1 min-h-0 rounded-2xl overflow-auto shadow-md bg-white border border-gray-300 dark:border-gray-700 relative">
              <div
                style={{
                  width: `${zoomLevel}%`,
                  height: '100%',
                  minWidth: '100%',
                  margin: '0 auto',
                  transition: 'width 0.15s ease',
                }}
                className="h-full flex items-center justify-center"
              >
                <object
                  data={`${pdfViewUrl}#toolbar=1`}
                  type="application/pdf"
                  className="w-full h-full block rounded-2xl border-0 bg-white"
                  style={{ width: '100%', height: '100%', minHeight: '100%', border: 'none' }}
                >
                  <iframe
                    ref={iframeRef}
                    src={`${pdfViewUrl}#toolbar=1`}
                    className="w-full h-full block rounded-2xl border-0 bg-white"
                    style={{ width: '100%', height: '100%', minHeight: '100%', border: 'none' }}
                    title={file?.title || file?.original_filename || 'Academic Document'}
                  />
                </object>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-400">
              <FileQuestion className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-3" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {loadError || 'PDF file not available for display'}
              </p>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                Ensure this academic document was uploaded properly through the Admin Dashboard.
              </p>
              <Link
                to="/library"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Library
              </Link>
            </div>
          )}
        </div>

        {/* Right Dedicated Document AI Assistance Panel */}
        {aiPanelOpen && (
          <aside
            className={`${
              panelWidthMode === 'wide'
                ? 'w-full md:w-[540px] lg:w-[640px]'
                : 'w-full sm:w-96 lg:w-[420px]'
            } bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col shrink-0 h-full max-h-full min-h-0 shadow-lg z-20 overflow-hidden`}
          >
            {/* 1. Header (shrink-0) */}
            <div className="p-3 px-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                    Document Tutor
                  </h3>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Scoped to this PDF ({file?.subject?.code || file?.subject?.name || 'Document'})</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {/* Reset / Clear Answers */}
                {answers.length > 0 && (
                  <button
                    onClick={handleClearDocChat}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Clear All Answers"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Normal / Wide Mode Toggle */}
                <button
                  onClick={() => setPanelWidthMode((prev) => (prev === 'normal' ? 'wide' : 'normal'))}
                  className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
                    panelWidthMode === 'wide'
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/50 dark:border-indigo-800 dark:text-indigo-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  title={panelWidthMode === 'wide' ? 'Normal width' : 'Expand width'}
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">{panelWidthMode === 'wide' ? 'Normal' : 'Wide'}</span>
                </button>

                {/* Close Panel */}
                <button
                  onClick={() => setAiPanelOpen(false)}
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Close AI Panel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 2. Quick Action Toolbar (shrink-0) */}
            <div className="p-2.5 px-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 space-y-2 shrink-0">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-0.5">
                  Exam Mark Solutions
                </p>
                <div className="grid grid-cols-4 gap-1">
                  {[2, 5, 10, 15].map((m) => (
                    <button
                      key={m}
                      onClick={() => handleAiAction(`Generate ${m}-Mark Answer`, m)}
                      disabled={aiLoading}
                      className="py-1 px-2 rounded-lg text-xs font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center gap-1 transition-all disabled:opacity-50 shadow-2xs"
                    >
                      <Zap className="w-2.5 h-2.5 text-indigo-500" />
                      <span>{m}M</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Document Operations Grid */}
              <div className="grid grid-cols-3 gap-1 pt-1">
                <button
                  onClick={() => handleAiAction(file?.type === 'book' ? 'Explain Textbook' : 'Explain Paper')}
                  disabled={aiLoading}
                  className="py-1 px-1.5 rounded-lg text-[10px] font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-1 truncate disabled:opacity-50"
                  title="Explain Document"
                >
                  <BarChart3 className="w-3 h-3 text-indigo-500 shrink-0" />
                  <span className="truncate">Explain</span>
                </button>

                <button
                  onClick={() => handleAiAction('Solve This Question')}
                  disabled={aiLoading}
                  className="py-1 px-1.5 rounded-lg text-[10px] font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-1 truncate disabled:opacity-50"
                  title="Solve Question with Model Answer"
                >
                  <PenTool className="w-3 h-3 text-indigo-500 shrink-0" />
                  <span className="truncate">Solve</span>
                </button>

                <button
                  onClick={() => handleAiAction('Find This Topic in Other Years')}
                  disabled={aiLoading}
                  className="py-1 px-1.5 rounded-lg text-[10px] font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-1 truncate disabled:opacity-50"
                  title="Analyze recurring topic across other 5-year papers"
                >
                  <Calendar className="w-3 h-3 text-indigo-500 shrink-0" />
                  <span className="truncate">Other Yrs</span>
                </button>
              </div>
            </div>

            {/* 3. DEDICATED ANSWER WINDOW (BOX) - Strictly internal scroll, no whole page scroll */}
            <div className="flex-1 min-h-0 flex flex-col mx-2 sm:mx-3 my-2 border border-gray-200 dark:border-gray-700/80 rounded-2xl bg-white dark:bg-gray-900/60 overflow-hidden shadow-xs">
              {/* Answer Window Header */}
              <div className="px-3 py-2 bg-gray-50/90 dark:bg-gray-800/90 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0 gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                    {currentAnswer ? currentAnswer.actionTitle : 'Answer Box'}
                  </span>
                  {currentAnswer?.marks && (
                    <span className="px-1.5 py-0.2 rounded-md bg-indigo-100 dark:bg-indigo-950 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 shrink-0">
                      {currentAnswer.marks}M
                    </span>
                  )}
                </div>

                {/* Right controls: Answer Switcher (< 2 / 5 >) + Font Size + Bada View + Copy */}
                <div className="flex items-center gap-1 shrink-0">
                  {answers.length > 1 && (
                    <div className="flex items-center bg-white dark:bg-gray-700 rounded-lg p-0.5 border border-gray-200 dark:border-gray-600 shadow-2xs">
                      <button
                        onClick={() => {
                          setActiveAnswerIndex((idx) => Math.max(0, idx - 1));
                          if (answerBoxRef.current) answerBoxRef.current.scrollTop = 0;
                        }}
                        disabled={activeAnswerIndex === 0}
                        className="p-1 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Previous Answer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-1 text-[10px] font-bold font-mono text-gray-700 dark:text-gray-200">
                        {activeAnswerIndex + 1}/{answers.length}
                      </span>
                      <button
                        onClick={() => {
                          setActiveAnswerIndex((idx) => Math.min(answers.length - 1, idx + 1));
                          if (answerBoxRef.current) answerBoxRef.current.scrollTop = 0;
                        }}
                        disabled={activeAnswerIndex === answers.length - 1}
                        className="p-1 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Next Answer"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Font Size Pills */}
                  <div className="hidden sm:flex items-center bg-white dark:bg-gray-700 rounded-md p-0.5 border border-gray-200 dark:border-gray-600">
                    {['sm', 'base', 'lg'].map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setAiFontSize(sz)}
                        className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                          aiFontSize === sz
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
                        }`}
                      >
                        {sz === 'sm' ? 'S' : sz === 'base' ? 'M' : 'L'}
                      </button>
                    ))}
                  </div>

                  {/* Full Preview (Bada View) */}
                  <button
                    onClick={() => {
                      if (currentAnswer) {
                        setAiOutput(currentAnswer.content);
                        setSelectedActionTitle(currentAnswer.actionTitle);
                        setStudyModalOpen(true);
                      }
                    }}
                    disabled={!currentAnswer}
                    className="p-1 rounded-md text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Fullscreen Preview (Bada View)"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Copy Button */}
                  <button
                    onClick={() => {
                      if (currentAnswer) {
                        navigator.clipboard.writeText(currentAnswer.content);
                        setCopiedId(currentAnswer.id);
                        setTimeout(() => setCopiedId(null), 2000);
                        toast.success('Answer copied!');
                      }
                    }}
                    disabled={!currentAnswer}
                    className="p-1 rounded-md text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Copy Answer"
                  >
                    {copiedId === currentAnswer?.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Scrollable Answer Window Body - Internal Scroll Only */}
              <div
                ref={answerBoxRef}
                className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-4 select-text bg-white dark:bg-gray-900/40"
              >
                {aiLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                    <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                      Document se answer generate ho raha hai...
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                      Real-world examples aur university marks format ke anusar answer tayar ho raha hai.
                    </p>
                  </div>
                ) : currentAnswer ? (
                  <div className="space-y-3">
                    {/* User Prompt / Question Preview */}
                    {currentAnswer.prompt && (
                      <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-indigo-950 dark:text-indigo-200 text-xs flex items-start gap-2">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">Question:</span>
                        <span className="font-medium leading-relaxed">{currentAnswer.prompt}</span>
                      </div>
                    )}

                    {/* Markdown Content */}
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <MarkdownRenderer
                        content={currentAnswer.content}
                        className={`${FONT_SIZE_MAP[aiFontSize].class} leading-relaxed`}
                      />
                    </div>

                    <div className="pt-2 text-[10px] text-gray-400 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
                      <span>Saved at {currentAnswer.timestamp}</span>
                      <span>Answer {activeAnswerIndex + 1} of {answers.length}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">
                      Dedicated Answer Window
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                      Is window me har answer alag store hoga. Niche question likhein ya upar diye gaye mark buttons par click karein!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Bottom Input Bar (shrink-0) - Always pinned at bottom */}
            <div className="p-2.5 px-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customQuestionInput}
                  onChange={(e) => setCustomQuestionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAiAction('Custom Query');
                    }
                  }}
                  placeholder="Ask any question from this document..."
                  className="flex-1 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  disabled={aiLoading}
                />
                <button
                  onClick={() => handleAiAction('Custom Query')}
                  disabled={aiLoading || !customQuestionInput.trim()}
                  className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition-all shrink-0"
                  title="Send Question"
                >
                  {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* 5-Year Cross-Paper Master Preparation Paper Modal */}
      {masterPaperModalOpen && typeof document !== 'undefined' && createPortal(
        <MasterPaperModal
          paper={masterPaper}
          onClose={() => setMasterPaperModalOpen(false)}
        />,
        document.body
      )}

      {/* Fullscreen Study Preview Modal (Bada View for detailed reading and exam prep) */}
      {studyModalOpen && aiOutput && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 md:p-8 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-5xl h-[86vh] max-h-[88vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="h-16 px-4 sm:px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 truncate flex items-center gap-2">
                    <span>{selectedActionTitle || 'SANKALP AI Full Study Preview'}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      Study Mode
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {file?.title || file?.original_filename || 'Academic Document'} • Presized Exam Analysis
                  </p>
                </div>
              </div>

              {/* Header Right Controls */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Font Size Pills */}
                <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
                  <Type className="w-3.5 h-3.5 text-gray-400 mx-1" />
                  {['sm', 'base', 'lg', 'xl'].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setAiFontSize(sz)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                        aiFontSize === sz
                          ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                          : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                    >
                      {FONT_SIZE_MAP[sz].label}
                    </button>
                  ))}
                </div>

                {/* Print button */}
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hidden md:inline-flex"
                  title="Print Study Notes"
                >
                  <Printer className="w-4 h-4" />
                </button>

                {/* Copy button */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(aiOutput);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                    toast.success('Study notes copied to clipboard!');
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 inline-flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy All'}</span>
                </button>

                {/* Close button */}
                <button
                  onClick={() => setStudyModalOpen(false)}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Close Full Preview (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mobile Font Size Bar */}
            <div className="sm:hidden px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Text Size:</span>
              <div className="flex items-center gap-1">
                {['sm', 'base', 'lg', 'xl'].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setAiFontSize(sz)}
                    className={`px-2 py-0.5 text-xs font-bold rounded ${
                      aiFontSize === sz ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {sz.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Scrollable Content Area with Generous Padding */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-8 md:p-10 bg-gray-50/50 dark:bg-gray-950/40">
              <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 p-6 sm:p-10 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <MarkdownRenderer
                  content={aiOutput}
                  className={`${FONT_SIZE_MAP[aiFontSize].class} leading-relaxed`}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="h-14 px-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>SANKALP AI Fullscreen Study Reader • High-Readability Mode</span>
              </div>
              <button
                onClick={() => setStudyModalOpen(false)}
                className="px-4 py-1.5 rounded-xl font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition-opacity"
              >
                Back to PDF
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
