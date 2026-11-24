import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  RotateCcw,
  Sparkles,
  BookOpen,
  FileText,
  Copy,
  Printer,
  ChevronRight,
  Layers,
  HelpCircle,
  Lightbulb,
  Zap,
  Database,
  Check,
  Settings,
  AlertCircle,
  Download,
  Loader2,
} from 'lucide-react';
import { aiApi } from '../lib/api';
import useAppStore from '../store/appStore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PageHeader from '../components/common/PageHeader';
import MarkdownRenderer from '../components/common/MarkdownRenderer';
import CheatSheetModal from '../components/exam/CheatSheetModal';
import {
  getCachedResponse,
  saveCachedResponse,
  getSubjectCachedEntries,
} from '../lib/mentorStorage';
import toast from 'react-hot-toast';
import { exportRevisionPdf } from '../lib/pdfExport';

export default function Revision() {
  const {
    subjects,
    selectedSubject,
    setSelectedSubject,
    selectedCourse,
    selectedSemester,
    groqApiKey,
    groqModel,
    isAiConnected,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'definitions' | 'flashcards' | 'last_minute'
  const [content, setContent] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [flippedCards, setFlippedCards] = useState({});
  const [loading, setLoading] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [cachedTimestamp, setCachedTimestamp] = useState(null);
  const [cachedTabsMap, setCachedTabsMap] = useState({});
  const [cheatSheetOpen, setCheatSheetOpen] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Scan IndexedDB to see which revision tabs already exist for current subject
  const refreshCachedTabsMap = async (subjectId) => {
    if (!subjectId) {
      setCachedTabsMap({});
      return;
    }
    try {
      const entries = await getSubjectCachedEntries(subjectId);
      const map = {};
      entries.forEach((e) => {
        if (e.cache_key && e.cache_key.includes(':::revision:::')) {
          const tab = e.cache_key.split(':::revision:::')[1];
          if (tab) map[tab] = e.created_at || true;
        }
      });
      setCachedTabsMap(map);
    } catch {
      setCachedTabsMap({});
    }
  };

  /**
   * Load revision content: Checks IndexedDB FIRST.
   * If already generated, returns immediately (0ms, 0 Groq tokens).
   * If not generated and AI connected, fetches from Groq and saves to IndexedDB.
   */
  const loadRevisionContent = async (type, forceFresh = false) => {
    if (!selectedSubject?._id) return;

    const cacheKey = `${selectedSubject._id}:::revision:::${type}`;

    // 1. STEP 1: Always check IndexedDB cache first (runs offline & with 0ms latency)
    if (!forceFresh) {
      try {
        const cached = await getCachedResponse(cacheKey);
        if (cached) {
          if (type === 'flashcards' && Array.isArray(cached.flashcards) && cached.flashcards.length > 0) {
            setFlashcards(cached.flashcards);
            setFlippedCards({});
            setContent('');
            setIsCached(true);
            setCachedTimestamp(cached.savedAt || cached.created_at);
            setLoading(false);
            return;
          } else if (cached.content) {
            setContent(cached.content);
            setFlashcards([]);
            setIsCached(true);
            setCachedTimestamp(cached.savedAt || cached.created_at);
            setLoading(false);
            return;
          }
        }
      } catch (cacheErr) {
        console.warn('Error reading from IndexedDB cache:', cacheErr);
      }
    }

    // 2. STEP 2: If not in IndexedDB, check if AI is available
    if (!isAiConnected) {
      setContent('');
      setFlashcards([]);
      setIsCached(false);
      setCachedTimestamp(null);
      setLoading(false);
      if (forceFresh) {
        toast.error('Connect your Groq API key in Settings to generate fresh revision notes');
      }
      return;
    }

    // 3. STEP 3: Generate via Groq AI & persist to IndexedDB
    setLoading(true);
    setContent('');
    setFlashcards([]);

    try {
      if (type === 'flashcards') {
        const res = await aiApi.generateFlashcards({
          apiKey: groqApiKey,
          model: groqModel,
          subjectId: selectedSubject._id,
          count: 8,
        });

        if (res.data?.success) {
          const cards = res.data.data;
          setFlashcards(cards);
          setFlippedCards({});
          setIsCached(false);
          setCachedTimestamp(null);

          // Save flashcards into IndexedDB
          await saveCachedResponse(cacheKey, {
            flashcards: cards,
            savedAt: new Date().toISOString(),
          }, selectedSubject._id);

          await refreshCachedTabsMap(selectedSubject._id);
          toast.success('Flashcards generated & saved to IndexedDB!');
        }
      } else {
        const res = await aiApi.generateRevisionNotes({
          apiKey: groqApiKey,
          model: groqModel,
          subjectId: selectedSubject._id,
          type,
        });

        if (res.data?.success) {
          const freshContent = res.data.data.content;
          setContent(freshContent);
          setIsCached(false);
          setCachedTimestamp(null);

          // Save revision notes into IndexedDB
          await saveCachedResponse(cacheKey, {
            content: freshContent,
            savedAt: new Date().toISOString(),
          }, selectedSubject._id);

          await refreshCachedTabsMap(selectedSubject._id);
          toast.success('Revision notes generated & saved to IndexedDB!');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  // Re-run whenever subject or active tab changes
  useEffect(() => {
    if (selectedSubject?._id) {
      refreshCachedTabsMap(selectedSubject._id);
      loadRevisionContent(activeTab, false);
    }
  }, [selectedSubject?._id, activeTab]);

  const handleExportPdf = async () => {
    if (!content && flashcards.length === 0) return;
    setDownloadingPdf(true);
    const toastId = toast.loading('Preparing official Revision PDF...');

    try {
      const tabTitle =
        activeTab === 'notes'
          ? 'Quick Revision Notes'
          : activeTab === 'definitions'
          ? 'Key Definitions'
          : activeTab === 'flashcards'
          ? 'Revision Flashcards'
          : 'Last-Minute Exam Checklist';

      await exportRevisionPdf({
        subjectName: selectedSubject?.name || 'Subject',
        subjectCode: selectedSubject?.code || 'N/A',
        courseName: selectedCourse?.name || 'University Exam',
        tabTitle,
        content,
        flashcards: activeTab === 'flashcards' ? flashcards : [],
      });

      toast.success('Revision PDF downloaded successfully!', { id: toastId });
    } catch (err) {
      console.error('PDF export error:', err);
      toast.error('Failed to download PDF: ' + err.message, { id: toastId });
    } finally {
      setDownloadingPdf(false);
    }
  };

  const toggleFlip = (index) => {
    setFlippedCards((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const cachedCount = Object.keys(cachedTabsMap).length;

  return (
    <div className="space-y-6">
      {/* Top Header & Cheatsheet Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Quick Revision"
          description="Instant syllabus revision summaries, definitions, and flashcards. Once generated, stored directly in your browser's IndexedDB."
          badge={selectedSubject ? selectedSubject.name : 'Select Subject in Header'}
        />

        {selectedSubject && (
          <button
            onClick={() => setCheatSheetOpen(true)}
            className="self-stretch sm:self-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black text-xs font-extrabold shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all shrink-0 w-full sm:w-auto text-center cursor-pointer"
            title="Generate & print 1-page A4 exam revision cheat sheet covering all 5 units"
          >
            <Printer className="w-4 h-4 shrink-0" />
            <span>1-Page Exam Cheatsheet (A4 PDF)</span>
          </button>
        )}
      </div>

      {/* Subject Quick Selector & IndexedDB Status Bar */}
      {subjects && subjects.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 shadow-2xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">
              Select Subject:
            </span>
            {subjects.map((sub) => {
              const isSelected = selectedSubject?._id === sub._id;
              return (
                <button
                  key={sub._id}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {sub.code ? `${sub.code} • ` : ''}{sub.name}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>{cachedCount}/4 Tabs Saved in IndexedDB</span>
            </span>
          </div>
        </div>
      )}

      {/* Tabs Bar with IndexedDB Saved Badges */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 shadow-2xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'notes'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Quick Revision Notes</span>
          {cachedTabsMap['notes'] && (
            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${activeTab === 'notes' ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'}`}>
              IndexedDB
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('definitions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'definitions'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Key Definitions</span>
          {cachedTabsMap['definitions'] && (
            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${activeTab === 'definitions' ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'}`}>
              IndexedDB
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('flashcards')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'flashcards'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Interactive Flashcards</span>
          {cachedTabsMap['flashcards'] && (
            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${activeTab === 'flashcards' ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'}`}>
              IndexedDB
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('last_minute')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'last_minute'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Last-Minute Checklist</span>
          {cachedTabsMap['last_minute'] && (
            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${activeTab === 'last_minute' ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'}`}>
              IndexedDB
            </span>
          )}
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingSpinner text={`Generating ${activeTab.replace('_', ' ')} with SANKALP AI...`} />
      ) : activeTab === 'flashcards' && flashcards.length > 0 ? (
        <div className="space-y-4">
          {/* Header Bar for Flashcards */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {flashcards.length} Interactive Flashcards
              </span>
              {isCached && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <Database className="w-2.5 h-2.5 text-emerald-600" />
                  <span>Loaded directly from IndexedDB (0 Tokens Used)</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => loadRevisionContent('flashcards', true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700 cursor-pointer"
                title="Generate a brand new set of flashcards from Groq AI"
              >
                <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
                <span>Regenerate Fresh AI</span>
              </button>

              <button
                onClick={handleExportPdf}
                disabled={downloadingPdf}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black transition-all cursor-pointer shadow-xs disabled:opacity-50"
                title="Download flashcards as an official PDF"
              >
                {downloadingPdf ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>{downloadingPdf ? 'Exporting...' : 'Export PDF'}</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Click any flashcard to flip between the concept question and its university definition.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {flashcards.map((card, idx) => {
              const isFlipped = !!flippedCards[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleFlip(idx)}
                  className={`p-6 rounded-3xl border cursor-pointer min-h-[200px] flex flex-col justify-between transition-all duration-200 shadow-2xs hover:shadow-lg ${
                    isFlipped
                      ? 'bg-indigo-900 text-white border-indigo-700'
                      : 'bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className={isFlipped ? 'text-indigo-200' : 'text-indigo-600 dark:text-indigo-400'}>
                      {card.tag || 'Concept'}
                    </span>
                    <span className={isFlipped ? 'text-indigo-300' : 'text-gray-400'}>
                      {isFlipped ? 'Back (Answer)' : 'Front (Prompt)'}
                    </span>
                  </div>

                  <div className="my-auto py-2">
                    <p className={`text-base font-bold leading-relaxed ${isFlipped ? 'text-indigo-50 text-sm' : ''}`}>
                      {isFlipped ? card.back : card.front}
                    </p>
                  </div>

                  <p className={`text-[11px] text-right ${isFlipped ? 'text-indigo-300' : 'text-gray-400'}`}>
                    Click to flip ↷
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : content ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Curriculum High-Yield Notes
              </span>
              {isCached ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                  <Database className="w-2.5 h-2.5 text-emerald-600" />
                  <span>Loaded directly from IndexedDB (0 Tokens Used)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  <Sparkles className="w-2.5 h-2.5 text-indigo-600" />
                  <span>Fresh AI Generated</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => loadRevisionContent(activeTab, true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700 cursor-pointer"
                title="Bypass local IndexedDB and regenerate fresh notes from Groq AI"
              >
                <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
                <span>Regenerate Fresh AI</span>
              </button>

              <button
                onClick={handleExportPdf}
                disabled={downloadingPdf}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black transition-all cursor-pointer shadow-xs disabled:opacity-50"
                title="Download notes directly as an official PDF document"
              >
                {downloadingPdf ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>{downloadingPdf ? 'Exporting...' : 'Export PDF'}</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(content);
                  toast.success('Notes copied to clipboard!');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-500 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Notes</span>
              </button>
            </div>
          </div>

          <MarkdownRenderer content={content} className="text-sm" />
        </div>
      ) : (
        /* Empty State: Not yet generated in IndexedDB */
        <div className="text-center py-12 px-6 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 shadow-xs max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              Not Yet Generated for {selectedSubject ? selectedSubject.name : 'this Subject'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto mt-1 leading-relaxed">
              Generate this once with SANKALP AI. It will be stored directly into your browser's IndexedDB so it opens instantly (0ms) on all future visits without consuming any Groq tokens.
            </p>
          </div>

          {isAiConnected ? (
            <button
              onClick={() => loadRevisionContent(activeTab, true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all hover:scale-102"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate {activeTab.replace('_', ' ')} Now</span>
            </button>
          ) : (
            <Link
              to="/settings"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md transition-all"
            >
              <Settings className="w-4 h-4" />
              <span>Connect API Key in Settings to Generate</span>
            </Link>
          )}
        </div>
      )}

      {/* 1-Page Printable Exam Cheat Sheet Modal */}
      <CheatSheetModal
        isOpen={cheatSheetOpen}
        onClose={() => setCheatSheetOpen(false)}
        subject={selectedSubject}
        course={selectedCourse}
        semester={selectedSemester}
      />
    </div>
  );
}
