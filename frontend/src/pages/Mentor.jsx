import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles,
  Send,
  RotateCcw,
  Copy,
  Bookmark,
  Trash2,
  Bot,
  User,
  BookOpen,
  HelpCircle,
  Star,
  Settings,
  ChevronRight,
  ChevronDown,
  Layers,
  Check,
  AlertCircle,
  ExternalLink,
  Database,
  Download,
  History,
  X,
  Loader2,
  Zap,
  FileText,
  Printer,
} from 'lucide-react';
import { aiApi, publicApi } from '../lib/api';
import useAppStore from '../store/appStore';
import { LANGUAGES, ANSWER_STYLES, MARKS_OPTIONS } from '../lib/constants';
import MarkdownRenderer from '../components/common/MarkdownRenderer';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/common/ConfirmDialog';
import CheatSheetModal from '../components/exam/CheatSheetModal';
import {
  getSubjectChat,
  saveSubjectChat,
  clearSubjectChat,
  getAllSubjectChats,
  exportChatToMarkdown,
  buildResponseCacheKey,
  getCachedResponse,
  saveCachedResponse,
  clearResponseCache,
} from '../lib/mentorStorage';

export default function Mentor() {
  const [searchParams] = useSearchParams();
  const initialSubjectId = searchParams.get('subjectId');
  const initialTopic = searchParams.get('topic');
  const initialBookId = searchParams.get('bookId');
  const initialLearnByBook = searchParams.get('learnByBook') === 'true';

  const {
    groqApiKey,
    groqModel,
    isAiConnected,
    selectedCourse,
    selectedSemester,
    selectedSubject,
    setSelectedSubject,
  } = useAppStore();

  const [subjects, setSubjects] = useState([]);
  const [books, setBooks] = useState([]);
  const [learnByBook, setLearnByBook] = useState(initialLearnByBook || false);
  const [selectedBookId, setSelectedBookId] = useState(initialBookId || '');
  const [language, setLanguage] = useState('english');
  const [answerStyle, setAnswerStyle] = useState('exam');
  const [marksFormat, setMarksFormat] = useState(10);
  const [selectedUnitNumber, setSelectedUnitNumber] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState(
    initialTopic ? `Explain ${initialTopic} with an exam-oriented 10-mark answer and real-world example.` : ''
  );
  const [loading, setLoading] = useState(false);
  const [dbLoading, setDbLoading] = useState(true);
  const [contextPanelOpen, setContextPanelOpen] = useState(true);
  const [subjectContext, setSubjectContext] = useState(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [savedSubjectsList, setSavedSubjectsList] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [cheatSheetOpen, setCheatSheetOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Helper to build initial welcome message tailored to subject
  const getSubjectWelcome = (subj) => ({
    id: 'welcome',
    role: 'assistant',
    timestamp: new Date().toISOString(),
    content: `Hello! I am **SANKALP AI**, your personal University Examination Mentor for **${subj ? subj.name : 'your course'}** (${subj?.code || 'SANKALP'}).

Select your preferred language, answer style, and marks format (2, 5, 10, or 15 marks) above.

You can ask me to:
- Explain complex theoretical topics with structured headings, diagrams & university exam style.
- Formulate high-scoring model answers for 2, 5, 10, or 15 marks.
- Solve previous-year examination questions with complete marking schemes.
- Clarify difficult concepts, definitions, and doubts.

*All your conversations for ${subj ? `**${subj.name}**` : 'this subject'} are automatically saved separately in IndexedDB on this browser.*`,
  });

  // Load subjects for current semester
  useEffect(() => {
    async function loadSubjects() {
      if (!selectedSemester?._id) return;
      try {
        const res = await publicApi.getSubjects(selectedSemester._id);
        if (res.data?.success && res.data.data.length > 0) {
          const list = res.data.data;
          setSubjects(list);
          const currentSub = useAppStore.getState().selectedSubject;
          if (initialSubjectId) {
            const found = list.find((s) => s._id === initialSubjectId);
            if (found) setSelectedSubject(found);
          } else if (!currentSub || !list.some((s) => s._id === currentSub._id)) {
            setSelectedSubject(list[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      }
    }
    loadSubjects();
  }, [selectedSemester?._id, initialSubjectId, setSelectedSubject]);

  // Load books for active subject
  useEffect(() => {
    setSelectedUnitNumber(null);
    async function loadBooks() {
      if (!selectedSubject?._id) return;
      try {
        const res = await publicApi.getSubjectBooks(selectedSubject._id);
        if (res.data?.success && res.data.data.length > 0) {
          const fetchedBooks = res.data.data;
          setBooks(fetchedBooks);
          if (!selectedBookId || !fetchedBooks.some((b) => b._id === selectedBookId)) {
            setSelectedBookId(fetchedBooks[0]._id);
          }
        } else {
          setBooks([]);
          setSelectedBookId('');
        }
      } catch (err) {
        console.error('Failed to load books for subject:', err);
      }
    }
    loadBooks();
  }, [selectedSubject?._id]);

  // Load chat history for active subject from IndexedDB
  useEffect(() => {
    let isCancelled = false;
    async function loadChat() {
      const subjectId = selectedSubject?._id || 'general';
      setDbLoading(true);
      try {
        const saved = await getSubjectChat(subjectId);
        if (!isCancelled) {
          if (saved && saved.length > 0) {
            setMessages(saved);
          } else {
            setMessages([getSubjectWelcome(selectedSubject)]);
          }
        }
      } catch (err) {
        console.error('Failed to load subject chat from IndexedDB:', err);
        if (!isCancelled) {
          setMessages([getSubjectWelcome(selectedSubject)]);
        }
      } finally {
        if (!isCancelled) setDbLoading(false);
      }
    }

    loadChat();
    return () => {
      isCancelled = true;
    };
  }, [selectedSubject?._id]);

  // Load subject context when selectedSubject changes
  useEffect(() => {
    async function loadContext() {
      if (!selectedSubject) {
        setSubjectContext(null);
        return;
      }
      try {
        const [topicsRes, questionsRes] = await Promise.all([
          publicApi.getTopics(selectedSubject._id),
          publicApi.getQuestions({ subject_id: selectedSubject._id, limit: 10 }),
        ]);
        setSubjectContext({
          subject: selectedSubject,
          topics: topicsRes.data?.data || [],
          questions: questionsRes.data?.data || [],
        });
      } catch (err) {
        console.error('Failed to load subject context:', err);
      }
    }
    loadContext();
  }, [selectedSubject]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Build rich, syllabus-grounded prompt including all detailed unit topics
  const buildUnitPrompt = (u) => {
    const topicsList = (u.topics && u.topics.length > 0)
      ? u.topics.map((t) => `• ${t}`).join('\n')
      : (u.description ? `• ${u.description}` : '• Core unit fundamentals and principles');

    return `Explain Unit ${u.number}: ${u.name} thoroughly according to the official university syllabus.

Official Syllabus Topics to cover:
${topicsList}

Please structure the explanation as follows:
1. Complete overview & core concept map of Unit ${u.number}
2. Step-by-step detailed breakdown of each syllabus topic with definitions, formulas, and architecture/diagrams
3. Real-world analogy for beginners ("Think of this like...") to make it effortlessly clear
4. High-frequency university examination questions (2M definitions, 5M analytical, and 10M comprehensive questions) with model scoring keys`;
  };

  // Send message and persist to IndexedDB (with Local Response Caching in IndexedDB)
  const executePrompt = async (promptText, options = {}) => {
    if (!promptText || !promptText.trim() || loading) return;

    if (!isAiConnected) {
      toast.error('Please connect your API key in Settings to chat with SANKALP AI');
      return;
    }

    const forceFresh = options.forceFresh || false;
    const currentSubjectId = selectedSubject?._id || 'general';
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: promptText.trim(),
      timestamp: new Date().toISOString(),
      marksFormat,
      answerStyle,
      language,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue('');
    setLoading(true);

    // Save user message immediately to IndexedDB
    await saveSubjectChat(currentSubjectId, selectedSubject, newMessages);

    // Compute deterministic cache key for this prompt and academic settings
    const cacheKey = buildResponseCacheKey({
      subjectId: selectedSubject?._id,
      unitNumber: selectedUnitNumber,
      marksFormat,
      answerStyle,
      language,
      learnByBook,
      bookId: selectedBookId,
      prompt: promptText,
    });

    // 1. Check local IndexedDB response cache first (0ms, 0 Groq tokens used)
    if (!forceFresh) {
      try {
        const cached = await getCachedResponse(cacheKey);
        if (cached && cached.content) {
          const activeBook = books.find((b) => b._id === selectedBookId);
          const assistantMsg = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: cached.content,
            timestamp: cached.savedAt || new Date().toISOString(),
            marksFormat,
            learnByBook: Boolean(learnByBook),
            bookTitle: activeBook?.title || null,
            isCached: true,
            cacheKey,
            cachedPrompt: promptText.trim(),
          };

          const finalMessages = [...newMessages, assistantMsg];
          setMessages(finalMessages);
          await saveSubjectChat(currentSubjectId, selectedSubject, finalMessages);

          // Save to local study history
          const historyItem = {
            title: userMsg.content.substring(0, 45),
            subtitle: `${selectedSubject?.name || 'Subject'} • ${marksFormat} Marks (Cached)`,
            link: '/mentor',
            timestamp: new Date().toISOString(),
          };
          const existing = JSON.parse(localStorage.getItem('sankalp_study_history') || '[]');
          localStorage.setItem('sankalp_study_history', JSON.stringify([historyItem, ...existing.slice(0, 9)]));

          setLoading(false);
          toast.success('⚡ Instant answer from local cache (0 tokens used)');
          return;
        }
      } catch (cacheErr) {
        console.warn('Cache lookup failed, proceeding with fresh AI:', cacheErr);
      }
    }

    // 2. Fetch fresh completion from Groq AI
    try {
      const apiMessages = newMessages
        .filter((m) => m.id !== 'welcome')
        .slice(-4)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await aiApi.chat({
        apiKey: groqApiKey,
        model: groqModel,
        subjectId: selectedSubject?._id,
        language,
        answerStyle,
        marksFormat,
        messages: apiMessages,
        learnByBook,
        bookId: selectedBookId,
      });

      if (res.data?.success) {
        const activeBook = books.find((b) => b._id === selectedBookId);
        const content = res.data.data.message.content;
        const assistantMsg = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content,
          timestamp: new Date().toISOString(),
          marksFormat,
          learnByBook: Boolean(learnByBook),
          bookTitle: activeBook?.title || null,
          isCached: false,
          cacheKey,
          cachedPrompt: promptText.trim(),
        };

        const finalMessages = [...newMessages, assistantMsg];
        setMessages(finalMessages);

        // Save updated conversation to IndexedDB
        await saveSubjectChat(currentSubjectId, selectedSubject, finalMessages);

        // Persist response to IndexedDB cache for instant re-retrieval
        await saveCachedResponse(cacheKey, {
          content,
          model: res.data.data.model,
          savedAt: new Date().toISOString(),
        }, currentSubjectId);

        // Save to local study history
        const historyItem = {
          title: userMsg.content.substring(0, 45),
          subtitle: `${selectedSubject?.name || 'Subject'} • ${marksFormat} Marks`,
          link: '/mentor',
          timestamp: new Date().toISOString(),
        };
        const existing = JSON.parse(localStorage.getItem('sankalp_study_history') || '[]');
        localStorage.setItem('sankalp_study_history', JSON.stringify([historyItem, ...existing.slice(0, 9)]));
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'AI request failed';
      toast.error(errorMsg);
      const errMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `**Unable to complete response:** ${errorMsg}\n\nPlease check your API key in Settings or ensure network connectivity.`,
        timestamp: new Date().toISOString(),
      };
      const finalMessages = [...newMessages, errMsg];
      setMessages(finalMessages);
      await saveSubjectChat(currentSubjectId, selectedSubject, finalMessages);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => executePrompt(inputValue);

  const handleExplainFullUnit = (u) => {
    setSelectedUnitNumber(u.number);
    const prompt = buildUnitPrompt(u);
    executePrompt(prompt);
  };

  const handleInsertUnitPrompt = (u) => {
    setSelectedUnitNumber(u.number);
    const prompt = buildUnitPrompt(u);
    setInputValue(prompt);
    toast.success(`Unit ${u.number} syllabus loaded into prompt box`);
  };

  const activeUnit = selectedUnitNumber && selectedSubject?.units
    ? selectedSubject.units.find((u) => u.number === selectedUnitNumber)
    : null;

  // Clear chat for current subject only
  const handleClearChat = async () => {
    const currentSubjectId = selectedSubject?._id || 'general';
    await clearSubjectChat(currentSubjectId);
    setMessages([getSubjectWelcome(selectedSubject)]);
    toast.success(`Chat history cleared for ${selectedSubject?.name || 'this subject'}`);
  };

  // Export current subject chat to Markdown
  const handleExportChat = () => {
    exportChatToMarkdown(
      selectedSubject?.name || 'General Subject',
      selectedSubject?.code || 'N/A',
      messages
    );
    toast.success('Chat transcript exported as Markdown!');
  };

  // Open all subjects history modal
  const handleOpenHistoryModal = async () => {
    try {
      const chats = await getAllSubjectChats();
      setSavedSubjectsList(chats);
      setHistoryModalOpen(true);
    } catch (err) {
      toast.error('Failed to retrieve saved subject chats');
    }
  };

  // Delete chat history for a specific subject from modal
  const handleDeleteFromHistory = async (subId, subName, e) => {
    e.stopPropagation();
    await clearSubjectChat(subId);
    setSavedSubjectsList((prev) => prev.filter((item) => item.subject_id !== subId));
    if (selectedSubject?._id === subId) {
      setMessages([getSubjectWelcome(selectedSubject)]);
    }
    toast.success(`Chat history removed for ${subName}`);
  };

  // Switch to subject from modal
  const handleSelectSubjectFromHistory = (subId) => {
    const target = subjects.find((s) => s._id === subId);
    if (target) {
      setSelectedSubject(target);
      setHistoryModalOpen(false);
      toast.success(`Switched to ${target.name}`);
    } else {
      toast.error('Subject not found in current semester');
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success('Answer copied to clipboard!');
  };

  const handleSaveToBookmarks = (text) => {
    const bookmarks = JSON.parse(localStorage.getItem('sankalp_bookmarked_answers') || '[]');
    bookmarks.unshift({
      id: Date.now(),
      subject: selectedSubject?.name || 'General',
      answer: text,
      date: new Date().toISOString(),
    });
    localStorage.setItem('sankalp_bookmarked_answers', JSON.stringify(bookmarks));
    toast.success('Answer saved to your Bookmarks!');
  };

  // Count user questions stored for this subject
  const userQCount = messages.filter((m) => m.role === 'user').length;

  return (
    <div className="flex flex-col h-[calc(100vh-4.25rem)] sm:h-[calc(100vh-5rem)] -m-3 sm:-m-6 lg:-m-8 bg-[#F7F8FC] dark:bg-[#0B1020] overflow-hidden">
      {/* Learning Controls Bar (Horizontally scrollable on mobile so controls never eat up screen height) */}
      <div className="bg-white dark:bg-[#111827] border-b border-gray-200 dark:border-gray-800 px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 shrink-0 shadow-2xs overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 text-xs shrink-0">
          {/* Subject Selector */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shrink-0">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            <select
              value={selectedSubject?._id || ''}
              onChange={(e) => {
                const s = subjects.find((x) => x._id === e.target.value);
                if (s) setSelectedSubject(s);
              }}
              className="bg-transparent font-semibold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer max-w-[150px] sm:max-w-[220px] truncate"
            >
              {subjects.map((s) => (
                <option key={s._id} value={s._id} className="dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Unit Focus Selector */}
          {selectedSubject?.units?.length > 0 && (
            <select
              value={selectedUnitNumber || ''}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : null;
                setSelectedUnitNumber(val);
                if (val) {
                  const u = selectedSubject.units.find((x) => x.number === val);
                  if (u) toast.success(`Focused on Unit ${u.number}: ${u.name}`);
                }
              }}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 font-bold text-indigo-700 dark:text-indigo-300 focus:outline-none cursor-pointer max-w-[170px] truncate"
              title="Unit Specific Mode: Focus AI mentor on a specific unit syllabus"
            >
              <option value="" className="dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                📚 All Units
              </option>
              {selectedSubject.units.map((u) => (
                <option key={u.number} value={u.number} className="dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-semibold">
                  Unit {u.number}: {u.name}
                </option>
              ))}
            </select>
          )}

          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value} className="dark:bg-gray-900">
                {l.label}
              </option>
            ))}
          </select>

          {/* Answer Style */}
          <select
            value={answerStyle}
            onChange={(e) => setAnswerStyle(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
          >
            {ANSWER_STYLES.map((s) => (
              <option key={s.value} value={s.value} className="dark:bg-gray-900">
                {s.label}
              </option>
            ))}
          </select>

          {/* Marks Format */}
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
            {MARKS_OPTIONS.map((m) => (
              <button
                key={m}
                onClick={() => setMarksFormat(m)}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                  marksFormat === m
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {m}M
              </button>
            ))}
          </div>

          {/* Learn by Book Mode Pill */}
          {books.length > 0 ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setLearnByBook(!learnByBook)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  learnByBook
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                }`}
                title="Learn by Book: Answers precisely and directly from prescribed university textbooks with clear analogies"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Learn by Book</span>
                <span className={`text-[10px] px-1 py-0.2 rounded-md ${learnByBook ? 'bg-white/20' : 'bg-emerald-100 dark:bg-emerald-900/60'}`}>
                  {learnByBook ? 'ON' : 'OFF'}
                </span>
              </button>

              {learnByBook && books.length > 1 && (
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="px-2 py-1.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none max-w-[140px] truncate"
                >
                  {books.map((b) => (
                    <option key={b._id} value={b._id} className="dark:bg-gray-900">
                      {b.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <Link
              to="/library"
              className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-[11px] font-medium text-gray-500 hover:text-indigo-600 transition-colors"
              title="Upload textbooks in Admin to enable Learn by Book"
            >
              <BookOpen className="w-3 h-3" />
              <span>No Books Uploaded</span>
            </Link>
          )}
        </div>

        {/* Right Actions: 1-Page Cheat Sheet, IndexedDB Indicator, History, Export, Clear & Syllabus Panel */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* 1-Page Printable Exam Cheat Sheet Button */}
          <button
            onClick={() => setCheatSheetOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all hover:scale-102 shrink-0"
            title="Generate & print 1-page A4 exam revision cheat sheet covering all 5 units"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">1-Page Cheat Sheet</span>
            <span className="sm:hidden">Cheat Sheet</span>
          </button>

          {/* IndexedDB Status Pill */}
          <button
            onClick={handleOpenHistoryModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
            title="Chats are saved separately in browser IndexedDB per subject. Click to view all subject histories."
          >
            <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden md:inline">IndexedDB</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
              {userQCount} Q&A
            </span>
          </button>

          {/* Subject History List Button */}
          <button
            onClick={handleOpenHistoryModal}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5"
            title="View saved chats for all subjects"
          >
            <History className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">All Subjects</span>
          </button>

          {/* Export Transcript */}
          <button
            onClick={handleExportChat}
            disabled={userQCount === 0}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
            title="Download this subject's chat transcript as Markdown"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Clear Subject Chat */}
          <button
            onClick={() => setConfirmClearOpen(true)}
            disabled={userQCount === 0}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-500 hover:text-red-600 hover:border-red-300 dark:hover:border-red-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
            title="Clear chat history for this subject"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>

          {/* Connect API Key Alert */}
          {!isAiConnected && (
            <Link
              to="/settings"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900 animate-pulse"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Connect API Key</span>
            </Link>
          )}

          {/* Syllabus Context Toggle */}
          <button
            onClick={() => setContextPanelOpen(!contextPanelOpen)}
            className="hidden lg:flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Toggle Syllabus Context"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Syllabus</span>
          </button>
        </div>
      </div>

      {/* Main Chat & Context Panel Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Stream */}
        <div className="flex-1 flex flex-col h-full bg-[#F7F8FC] dark:bg-[#0B1020] relative">
          {dbLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-gray-400 text-xs">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                <span>Loading subject chat from IndexedDB...</span>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
              {/* Unit-Specific Masterclass Focus Banner */}
              {activeUnit && (
                <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-blue-50/80 to-purple-50/70 dark:from-indigo-950/60 dark:via-blue-950/40 dark:to-purple-950/40 border border-indigo-200 dark:border-indigo-800/80 shadow-2xs mb-3 sm:mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs sm:text-sm shrink-0 shadow-2xs mt-0.5">
                        U{activeUnit.number}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <h4 className="font-bold text-gray-900 dark:text-gray-100 text-xs sm:text-sm">
                            Unit {activeUnit.number}: {activeUnit.name}
                          </h4>
                          <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-700">
                            {(activeUnit.topics || []).length || 1} Topics
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mt-1 leading-relaxed">
                          {(activeUnit.topics || []).join(' • ') || activeUnit.description || 'Core university syllabus'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap">
                      <button
                        onClick={() => handleExplainFullUnit(activeUnit)}
                        disabled={loading}
                        className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
                        title="Prompt AI to explain the complete unit from start to finish with all syllabus topics"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Explain Complete Unit</span>
                      </button>
                      <button
                        onClick={() => handleInsertUnitPrompt(activeUnit)}
                        className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Load complete syllabus prompt into message box"
                      >
                        Load Prompt
                      </button>
                      <button
                        onClick={() => setSelectedUnitNumber(null)}
                        className="p-1.5 sm:p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                        title="Close unit focus"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id || index}
                    className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center shrink-0 shadow-xs mt-1 bg-transparent">
                        <img src="/Logo.png" alt="SANKALP AI" className="w-full h-full object-contain" />
                      </div>
                    )}

                    <div
                      className={`rounded-2xl p-4 sm:p-5 shadow-xs transition-all ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-br-xs'
                          : 'bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-xs'
                      }`}
                    >
                      {/* Meta header for user message */}
                      {isUser && msg.marksFormat && (
                        <div className="flex items-center gap-2 mb-1.5 text-[11px] text-indigo-100/80">
                          <span className="font-bold">{msg.marksFormat} Marks Target</span>
                          <span>&bull;</span>
                          <span className="capitalize">{msg.language || 'English'}</span>
                        </div>
                      )}

                      {isUser ? (
                        <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      ) : (
                        <div>
                          {msg.learnByBook && (
                            <div className="flex items-center gap-1.5 mb-2.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                <BookOpen className="w-3 h-3" /> Prescribed Book: {msg.bookTitle || 'Official University Textbook'}
                              </span>
                            </div>
                          )}
                          <MarkdownRenderer content={msg.content} className="text-sm" />
                        </div>
                      )}

                      {/* Actions for Assistant Messages */}
                      {!isUser && index !== 0 && (
                        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400">
                              {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                            {msg.isCached && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-850 shadow-2xs">
                                <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                                <span>Cached (0 Groq Tokens)</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            {msg.cachedPrompt && (
                              <button
                                onClick={() => executePrompt(msg.cachedPrompt, { forceFresh: true })}
                                className="px-2 py-1 rounded-lg text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors flex items-center gap-1 text-[11px]"
                                title="Bypass local cache and regenerate a fresh answer directly from Groq AI"
                              >
                                <RotateCcw className="w-3 h-3 text-amber-500" />
                                <span>Fresh AI</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleCopy(msg.content, index)}
                              className="p-1 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors flex items-center gap-1"
                              title="Copy Answer"
                            >
                              {copiedIndex === index ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              <span className="text-[11px]">{copiedIndex === index ? 'Copied' : 'Copy'}</span>
                            </button>
                            <button
                              onClick={() => handleSaveToBookmarks(msg.content)}
                              className="p-1 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors flex items-center gap-1"
                              title="Save to Bookmarks"
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                              <span className="text-[11px]">Save</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-1">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="flex gap-3 max-w-3xl mr-auto items-center text-indigo-600 dark:text-indigo-400 text-xs font-semibold py-2">
                  <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center shrink-0 animate-pulse">
                    <img src="/Logo.png" alt="SANKALP AI" className="w-full h-full object-contain" />
                  </div>
                  <span>SANKALP AI is formulating your university exam answer...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Message Input Box */}
          <div className="p-2.5 sm:p-4 bg-white dark:bg-[#111827] border-t border-gray-200 dark:border-gray-800 shrink-0">
            {/* Active Book Ribbon if Learn by Book Mode is On */}
            {learnByBook && (
              <div className="max-w-4xl mx-auto px-3 py-1.5 sm:px-4 sm:py-2 mb-2 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs text-emerald-950 dark:text-emerald-200 shadow-2xs">
                <div className="flex items-center gap-2 truncate">
                  <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate text-[11px] sm:text-xs">
                    <strong>Learn by Book:</strong>{' '}
                    {books.find((b) => b._id === selectedBookId)?.title || 'Prescribed University Textbook'}
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full shrink-0">
                  Direct & Clear
                </span>
              </div>
            )}

            <div className="max-w-4xl mx-auto flex items-end gap-1.5 sm:gap-2 bg-gray-50 dark:bg-gray-800/80 rounded-2xl p-1.5 sm:p-2 border border-gray-200 dark:border-gray-700 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  isAiConnected
                    ? `Ask anything for ${selectedSubject?.code || 'Subject'}...`
                    : 'Connect your API key in Settings to activate SANKALP AI...'
                }
                rows={inputValue.includes('\n') ? 3 : 1}
                className="flex-1 bg-transparent border-none text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none resize-none py-1 sm:py-1.5 px-2 max-h-32"
              />

              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || loading}
                className="p-2 sm:p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:cursor-not-allowed shrink-0 transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            <div className="max-w-4xl mx-auto flex items-center justify-between text-[11px] text-gray-400 mt-2 px-1">
              <span className="flex items-center gap-1.5">
                <span>AI: <strong className="text-gray-600 dark:text-gray-300">SANKALP AI</strong></span>
                <span>&bull;</span>
                <span className="text-emerald-600 dark:text-emerald-400">IndexedDB: {selectedSubject?.code || 'Active'}</span>
              </span>
              <button
                onClick={() => setConfirmClearOpen(true)}
                disabled={userQCount === 0}
                className="hover:text-red-500 transition-colors flex items-center gap-1 disabled:opacity-30 disabled:hover:text-gray-400"
              >
                <Trash2 className="w-3 h-3" /> Clear this subject chat
              </button>
            </div>
          </div>
        </div>

        {/* Right Optional Academic Context Panel */}
        {contextPanelOpen && (
          <aside className="hidden lg:flex flex-col w-80 bg-white dark:bg-[#111827] border-l border-gray-200 dark:border-gray-800 p-4 overflow-y-auto space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Subject Units
                </h3>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded-md">
                  {selectedSubject?.units?.length || 0} Units
                </span>
              </div>

              {selectedSubject?.units?.length > 0 ? (
                <div className="space-y-2.5">
                  {selectedSubject.units.map((u) => {
                    const topicsList = (u.topics && u.topics.length > 0)
                      ? u.topics
                      : (u.description ? [u.description] : []);
                    const topicsSummary = topicsList.join(', ');
                    const isFocused = selectedUnitNumber === u.number;

                    return (
                      <div
                        key={u._id || u.number}
                        className={`p-3 rounded-2xl border transition-all ${
                          isFocused
                            ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500 dark:border-indigo-600 shadow-xs'
                            : 'bg-gray-50 dark:bg-gray-800/60 border-gray-100 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                        }`}
                      >
                        <div
                          onClick={() => handleInsertUnitPrompt(u)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <p className="font-bold text-gray-900 dark:text-gray-100 text-xs">
                              Unit {u.number}: {u.name}
                            </p>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold shrink-0">
                              {topicsList.length} topics
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                            {topicsSummary || 'Core syllabus concepts and examination topics'}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-700/60">
                          <button
                            onClick={() => handleExplainFullUnit(u)}
                            disabled={loading}
                            className="flex-1 py-1 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] flex items-center justify-center gap-1 transition-colors shadow-2xs disabled:opacity-50"
                            title="Prompt SANKALP AI to explain this complete unit from start to finish"
                          >
                            <Sparkles className="w-3 h-3" />
                            Explain Unit
                          </button>
                          <button
                            onClick={() => handleInsertUnitPrompt(u)}
                            className="py-1 px-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold text-[10px] transition-colors"
                            title="Load full unit syllabus into chat box"
                          >
                            Load Prompt
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No units defined for this subject.</p>
              )}
            </div>

            {/* High Priority Topics */}
            {subjectContext?.topics?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500" /> High-Yield Topics
                </h3>
                <div className="space-y-1.5">
                  {subjectContext.topics.slice(0, 5).map((t) => (
                    <div
                      key={t._id}
                      onClick={() =>
                        setInputValue(`Explain the university exam question: "${t.topic_name}" for ${marksFormat} marks.`)
                      }
                      className="p-2 rounded-xl text-xs hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[180px]">
                        {t.topic_name}
                      </span>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
                        {t.historical_appearances}x
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Confirmation Dialog for Clearing Subject Chat */}
      <ConfirmDialog
        isOpen={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        onConfirm={handleClearChat}
        title={`Clear Chat for ${selectedSubject?.name || 'Subject'}`}
        message={`Are you sure you want to clear your conversation for ${selectedSubject?.name || 'this subject'}? This will remove its messages from your browser's IndexedDB. Other subjects' chat histories will remain untouched.`}
        confirmText="Yes, Clear Subject Chat"
        isDestructive={true}
      />

      {/* Modal: All Saved Subject Chats in IndexedDB */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                    Saved Subject Chats (IndexedDB)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Conversations stored separately in browser offline storage
                  </p>
                </div>
              </div>
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-2.5">
              {savedSubjectsList.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  <Database className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-semibold">No chats stored yet</p>
                  <p className="mt-1 text-gray-500">
                    Ask questions to the AI mentor and conversations will be saved per subject here.
                  </p>
                </div>
              ) : (
                savedSubjectsList.map((item) => {
                  const isCurrent = selectedSubject?._id === item.subject_id;
                  return (
                    <div
                      key={item.subject_id}
                      onClick={() => handleSelectSubjectFromHistory(item.subject_id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800'
                          : 'bg-gray-50/70 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-gray-900 dark:text-gray-100 truncate">
                            {item.subject_name}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {item.subject_code}
                          </span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-600 text-white">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
                          <span>{item.message_count} total messages</span>
                          <span>&bull;</span>
                          <span>
                            Updated {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'recently'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={(e) => handleDeleteFromHistory(item.subject_id, item.subject_name, e)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                          title="Delete this subject's chat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end shrink-0">
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-950 hover:bg-black transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1-Page Printable Exam Cheat Sheet Modal (A4 Print / PDF / Copy) */}
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
