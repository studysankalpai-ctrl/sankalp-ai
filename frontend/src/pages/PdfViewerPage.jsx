import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Printer,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Send,
  Loader2,
  FileQuestion,
  Star,
  ExternalLink,
  RotateCcw,
  Zap,
  FileText,
  Target,
  Trophy,
  BarChart3,
  Lightbulb,
  PenTool,
  Search,
  Calendar,
  FileCheck2,
  Copy,
  Check,
  Columns,
  X,
  Type,
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
  const { groqApiKey, groqModel, isAiConnected, selectedSubject } = useAppStore();
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

  // Font sizing & study reader modes
  const [aiFontSize, setAiFontSize] = useState('base');
  const [panelWidthMode, setPanelWidthMode] = useState('normal'); // 'normal' | 'wide'
  const [studyModalOpen, setStudyModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Master Final Paper Modal state
  const [masterPaper, setMasterPaper] = useState(null);
  const [masterPaperModalOpen, setMasterPaperModalOpen] = useState(false);
  const [generatingMasterPaper, setGeneratingMasterPaper] = useState(false);

  const iframeRef = useRef(null);

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
        el.requestFullscreen().catch(() => { });
      } else {
        document.exitFullscreen().catch(() => { });
      }
    }
  };

  const handleAiAction = async (actionType, marks = null) => {
    if (!isAiConnected) {
      toast.error('Connect your API key in Settings to use SANKALP AI assistance');
      return;
    }

    setAiLoading(true);
    setAiOutput('');
    setSelectedActionTitle(actionType);

    try {
      let prompt = '';
      const docName = file?.original_filename || 'Examination Document';

      if (marks) {
        prompt = `You are a university examination mentor. Generate a complete, high-scoring university examination answer for ${marks} Marks for the question/topic represented in "${docName}".
Structure the answer strictly for ${marks} marks according to university grading rubrics:
- Definition & core premise
- Key technical points with clear subheadings
- Equations/Diagram description if applicable
- Practical/Application example
- Conclusion / Key takeaway`;
      } else if (actionType === 'Explain This Paper') {
        prompt = file?.type === 'book'
          ? `Explain the core curriculum and conceptual structure from this prescribed university textbook: "${docName}" by ${file.author || 'Author'}. Provide sharp, to-the-point explanations and simple analogies that any student can understand.`
          : `Summarize and explain the complete examination pattern, difficulty, unit distribution, and core topics represented in this university paper: "${docName}".`;
      } else if (actionType === 'Explain Question') {
        prompt = customQuestionInput
          ? `Explain this specific examination question in simple, conceptual terms from beginner to advanced: "${customQuestionInput}" from ${file?.type === 'book' ? 'textbook' : 'paper'}: "${docName}".`
          : `Explain the most important question and core concept tested in "${docName}" from fundamental to advanced level.`;
      } else if (actionType === 'Solve This Question') {
        prompt = customQuestionInput
          ? `Provide a complete, step-by-step model solution with full working, diagrams and mathematical or algorithmic clarity for: "${customQuestionInput}".`
          : `Identify and provide a complete model solution with step-by-step working for the primary question in "${docName}".`;
      } else if (actionType === 'Find Similar Questions') {
        prompt = `List 5 closely related previous-year questions from other semesters or university examinations for the concepts tested in "${docName}". Include marks and suggested approach for each.`;
      } else if (actionType === 'Find This Topic in Other Years') {
        prompt = `Analyze the recurring pattern of the core topic tested in "${docName}". Mention which years this concept typically appears, how question phrasing changes across years, and likely future variations.`;
      } else if (actionType === 'Identify Related Syllabus Unit') {
        prompt = `Identify the exact official syllabus unit, core topics, unit weightage, and key standard university textbooks corresponding to the academic concepts in "${docName}".`;
      } else {
        prompt = customQuestionInput || `Explain the core question and provide a complete model solution with marking breakdown for "${docName}".`;
      }

      const res = await aiApi.chat({
        apiKey: groqApiKey,
        model: groqModel,
        subjectId: selectedSubject?._id,
        learnByBook: file?.type === 'book',
        bookId: file?.type === 'book' ? file._id : null,
        messages: [{ role: 'user', content: prompt }],
      });

      if (res.data?.success) {
        setAiOutput(res.data.data.message.content);
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
      className="flex flex-col h-[calc(100vh-5rem)] -m-4 sm:-m-6 lg:-m-8 bg-gray-100 dark:bg-gray-950 overflow-hidden relative"
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
              title="Open SANKALP AI Exam Mentor in Learn by Book mode"
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
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${aiPanelOpen
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
              }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{aiPanelOpen ? 'AI Active' : 'AI Assistant'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: PDF on Left, AI Assistance on Right (Relative container prevents mobile overlap) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* PDF Frame */}
        <div className="flex-1 h-full bg-gray-200 dark:bg-gray-900/80 relative flex flex-col items-center justify-center overflow-auto p-2 sm:p-4">
          {pdfViewUrl ? (
            <div
              className="w-full h-full flex items-center justify-center transition-all duration-150"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            >
              <object
                data={`${pdfViewUrl}#toolbar=1`}
                type="application/pdf"
                className="w-full h-full border-none bg-white shadow-lg rounded-2xl"
              >
                <iframe
                  ref={iframeRef}
                  src={`${pdfViewUrl}#toolbar=1`}
                  className="w-full h-full border-none bg-white shadow-lg rounded-2xl"
                  title={file?.original_filename || 'Academic Document'}
                >
                  <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
                    <p className="mb-3 text-sm">Your browser does not support inline PDF frames.</p>
                    <a
                      href={pdfViewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                    >
                      Open PDF in New Window
                    </a>
                  </div>
                </iframe>
              </object>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-gray-400">
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

        {/* Right AI Assistance Panel */}
        {aiPanelOpen && (
          <aside
            className={`${panelWidthMode === 'wide'
                ? 'w-full md:w-[580px] lg:w-[680px] xl:w-[780px]'
                : 'w-full sm:w-96 lg:w-[440px]'
              } bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col shrink-0 h-full shadow-lg transition-all duration-200 absolute sm:relative inset-0 sm:inset-auto z-20 sm:z-auto`}
          >
            <div className="p-3.5 px-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                  AI Question Solver & Tutor
                </h3>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Expand / Wide Panel Toggle */}
                <button
                  onClick={() => setPanelWidthMode((prev) => (prev === 'normal' ? 'wide' : 'normal'))}
                  className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${panelWidthMode === 'wide'
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/50 dark:border-indigo-800 dark:text-indigo-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  title={panelWidthMode === 'wide' ? 'Reset to normal sidebar width' : 'Expand sidebar to wide split view'}
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">{panelWidthMode === 'wide' ? 'Normal' : 'Wide'}</span>
                </button>

                {/* Full Study Preview Button */}
                <button
                  onClick={() => setStudyModalOpen(true)}
                  disabled={!aiOutput}
                  className={`px-2 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${aiOutput
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 border-transparent shadow-2xs'
                      : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                    }`}
                  title="Open Fullscreen Study Preview (Bada View for reading)"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold">Full Preview</span>
                </button>

                <span
                  className={`w-2 h-2 rounded-full ${isAiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}
                  title={isAiConnected ? 'SANKALP AI Active' : 'SANKALP AI Disconnected'}
                />

                {/* Close Button to return to full document view */}
                <button
                  onClick={() => setAiPanelOpen(false)}
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Close AI Assistant Panel"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            {/* Cross-Paper Master Button in AI Panel (Clean Monochrome) */}
            <div className="p-3 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <button
                onClick={handleGenerateMasterFinalPaper}
                disabled={generatingMasterPaper}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
              >
                {generatingMasterPaper ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileCheck2 className="w-4 h-4" />
                )}
                <span>{generatingMasterPaper ? 'Analyzing 5-Yr Papers...' : 'Generate 5-Yr Final Master Paper'}</span>
              </button>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5 text-center">
                Synthesizes repeated questions from all 5 years into one official university paper.
              </p>
            </div>

            {/* PART 6: ALL 10 AI ACTION BUTTONS (NO EMOJIS, PURE LUCIDE ICONS) */}
            <div className="p-3.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-0.5">
                Mark-Specific Answer Generators
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  onClick={() => handleAiAction('Generate 2-Mark Answer', 2)}
                  className="py-1.5 px-1 rounded-lg text-xs font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-1 transition-colors"
                >
                  <Zap className="w-3 h-3 text-indigo-500" />
                  <span>2-Mark</span>
                </button>
                <button
                  onClick={() => handleAiAction('Generate 5-Mark Answer', 5)}
                  className="py-1.5 px-1 rounded-lg text-xs font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-1 transition-colors"
                >
                  <FileText className="w-3 h-3 text-indigo-500" />
                  <span>5-Mark</span>
                </button>
                <button
                  onClick={() => handleAiAction('Generate 10-Mark Answer', 10)}
                  className="py-1.5 px-1 rounded-lg text-xs font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-1 transition-colors"
                >
                  <Target className="w-3 h-3 text-indigo-500" />
                  <span>10-Mark</span>
                </button>
                <button
                  onClick={() => handleAiAction('Generate 15-Mark Answer', 15)}
                  className="py-1.5 px-1 rounded-lg text-xs font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-1 transition-colors"
                >
                  <Trophy className="w-3 h-3 text-indigo-500" />
                  <span>15-Mark</span>
                </button>
              </div>

              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-0.5 pt-1">
                Paper & Question Operations
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleAiAction('Explain This Paper')}
                  className="py-1.5 px-2 rounded-lg text-[11px] font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 text-gray-700 dark:text-gray-300 flex items-center gap-1.5 truncate"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate">1. Explain This Paper</span>
                </button>
                <button
                  onClick={() => handleAiAction('Explain Question')}
                  className="py-1.5 px-2 rounded-lg text-[11px] font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 text-gray-700 dark:text-gray-300 flex items-center gap-1.5 truncate"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">2. Explain Question</span>
                </button>
                <button
                  onClick={() => handleAiAction('Solve This Question')}
                  className="py-1.5 px-2 rounded-lg text-[11px] font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 text-gray-700 dark:text-gray-300 flex items-center gap-1.5 truncate"
                >
                  <PenTool className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate">3. Solve Question</span>
                </button>
                <button
                  onClick={() => handleAiAction('Find Similar Questions')}
                  className="py-1.5 px-2 rounded-lg text-[11px] font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 text-gray-700 dark:text-gray-300 flex items-center gap-1.5 truncate"
                >
                  <Search className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate">4. Similar Questions</span>
                </button>
                <button
                  onClick={() => handleAiAction('Find This Topic in Other Years')}
                  className="py-1.5 px-2 rounded-lg text-[11px] font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 text-gray-700 dark:text-gray-300 flex items-center gap-1.5 truncate"
                >
                  <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate">5. Topic in Other Years</span>
                </button>
                <button
                  onClick={() => handleAiAction('Identify Related Syllabus Unit')}
                  className="py-1.5 px-2 rounded-lg text-[11px] font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 text-gray-700 dark:text-gray-300 flex items-center gap-1.5 truncate"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate">6. Related Syllabus Unit</span>
                </button>
              </div>
            </div>

            {/* AI Output / Results */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-indigo-600 dark:text-indigo-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <p className="text-xs font-medium text-gray-500">Generating university response with SANKALP AI...</p>
                </div>
              ) : aiOutput ? (
                <div>
                  <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-gray-100 dark:border-gray-800 gap-2 flex-wrap">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider truncate max-w-[140px] sm:max-w-[180px]">
                      {selectedActionTitle || 'Study Response'}
                    </span>

                    <div className="flex items-center gap-1.5 ml-auto">
                      {/* Font Size Selector Pills */}
                      <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 border border-gray-200 dark:border-gray-700">
                        <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 px-1">Size</span>
                        {['sm', 'base', 'lg', 'xl'].map((sz) => (
                          <button
                            key={sz}
                            onClick={() => setAiFontSize(sz)}
                            className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition-colors ${aiFontSize === sz
                                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                              }`}
                            title={`Font size: ${FONT_SIZE_MAP[sz].label}`}
                          >
                            {sz === 'sm' ? 'S' : sz === 'base' ? 'M' : sz === 'lg' ? 'L' : 'XL'}
                          </button>
                        ))}
                      </div>

                      {/* Fullscreen Study View Button */}
                      <button
                        onClick={() => setStudyModalOpen(true)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                        title="Bada View: Open in Full Preview for comfortable reading"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>Full Preview</span>
                      </button>

                      {/* Copy Button with Feedback */}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(aiOutput);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                          toast.success('Answer copied to clipboard!');
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Copy text"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <MarkdownRenderer
                    content={aiOutput}
                    className={`${FONT_SIZE_MAP[aiFontSize].class} leading-relaxed`}
                  />
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-700" />
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">No AI prompt generated yet.</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Click any 1-Click university action above or enter a question from this document below.
                  </p>
                </div>
              )}
            </div>

            {/* Custom Question Input at Bottom */}
            <div className="p-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask or paste any question from this PDF..."
                  value={customQuestionInput}
                  onChange={(e) => setCustomQuestionInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiAction('Custom Query')}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => handleAiAction('Custom Query')}
                  disabled={aiLoading}
                  className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 shadow-xs transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* 5-Year Cross-Paper Master Preparation Paper Modal */}
      {masterPaperModalOpen && (
        <MasterPaperModal
          paper={masterPaper}
          onClose={() => setMasterPaperModalOpen(false)}
        />
      )}

      {/* Fullscreen Study Preview Modal (Bada View for detailed reading and exam prep) */}
      {studyModalOpen && aiOutput && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-5xl h-[92vh] max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
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
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${aiFontSize === sz
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
                    className={`px-2 py-0.5 text-xs font-bold rounded ${aiFontSize === sz ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-300'
                      }`}
                  >
                    {sz.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Scrollable Content Area with Generous Padding */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-10 bg-gray-50/50 dark:bg-gray-950/40">
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
        </div>
      )}
    </div>
  );
}
