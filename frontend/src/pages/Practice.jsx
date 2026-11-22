import React, { useEffect, useState } from 'react';
import {
  PenTool,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Bookmark,
  Eye,
  EyeOff,
  Filter,
  Check,
  ChevronDown,
  Layers,
  HelpCircle,
  FileCheck2,
  Loader2,
} from 'lucide-react';
import { publicApi, aiApi } from '../lib/api';
import useAppStore from '../store/appStore';
import { QUESTION_TYPES, MARKS_OPTIONS } from '../lib/constants';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import PageHeader from '../components/common/PageHeader';
import MasterPaperModal from '../components/exam/MasterPaperModal';
import MarkdownRenderer from '../components/common/MarkdownRenderer';
import toast from 'react-hot-toast';

export default function Practice() {
  const { selectedSubject, groqApiKey, groqModel, isAiConnected } = useAppStore();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [completedMap, setCompletedMap] = useState({});

  // Question Generator Settings
  const [unitFilter, setUnitFilter] = useState('');
  const [marksFilter, setMarksFilter] = useState(10);
  const [typeFilter, setTypeFilter] = useState('long');
  const [difficulty, setDifficulty] = useState('medium');
  const [generating, setGenerating] = useState(false);

  // Master Final Paper State
  const [masterPaper, setMasterPaper] = useState(null);
  const [masterPaperModalOpen, setMasterPaperModalOpen] = useState(false);
  const [generatingFinalPaper, setGeneratingFinalPaper] = useState(false);

  const handleGenerateFinalPaper = async () => {
    if (!isAiConnected) {
      toast.error('Connect your API key in Settings to generate the Master Final Paper with SANKALP AI');
      return;
    }
    if (!selectedSubject) {
      toast.error('Please select a subject from the top header');
      return;
    }

    setGeneratingFinalPaper(true);
    try {
      const res = await aiApi.generateFinalPaper({
        apiKey: groqApiKey,
        model: groqModel,
        subjectId: selectedSubject._id,
      });

      if (res.data?.success && res.data.data) {
        setMasterPaper(res.data.data);
        setMasterPaperModalOpen(true);
        toast.success(`Generated: ${res.data.data.paper_title}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to generate Master Final Paper');
    } finally {
      setGeneratingFinalPaper(false);
    }
  };

  // Load past questions from DB
  useEffect(() => {
    async function loadPastQuestions() {
      if (!selectedSubject) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await publicApi.getQuestions({ subject_id: selectedSubject._id, limit: 25 });
        if (res.data?.success) {
          setQuestions(res.data.data);
        }

        // Load completed question IDs from localStorage
        const completed = JSON.parse(localStorage.getItem('sankalp_completed_questions') || '{}');
        setCompletedMap(completed);
      } catch (err) {
        console.error('Failed to load questions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPastQuestions();
  }, [selectedSubject]);

  const toggleRevealAnswer = async (id, questionText, marks) => {
    if (revealedAnswers[id]) {
      setRevealedAnswers((prev) => ({ ...prev, [id]: null }));
      return;
    }

    if (!isAiConnected) {
      toast.error('Connect your API key in Settings to reveal model answers with SANKALP AI');
      return;
    }

    setRevealedAnswers((prev) => ({ ...prev, [id]: { loading: true } }));

    try {
      const res = await aiApi.generateAnswer({
        apiKey: groqApiKey,
        model: groqModel,
        subjectId: selectedSubject?._id,
        question: questionText,
        marks: marks || 10,
      });

      if (res.data?.success) {
        setRevealedAnswers((prev) => ({
          ...prev,
          [id]: { loading: false, answer: res.data.data.answer },
        }));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to generate answer');
      setRevealedAnswers((prev) => ({ ...prev, [id]: null }));
    }
  };

  const toggleCompleted = (id) => {
    const updated = { ...completedMap, [id]: !completedMap[id] };
    setCompletedMap(updated);
    localStorage.setItem('sankalp_completed_questions', JSON.stringify(updated));
    toast.success(updated[id] ? 'Question marked as completed!' : 'Marked as uncompleted');
  };

  const handleBookmarkQuestion = (q) => {
    const bookmarks = JSON.parse(localStorage.getItem('sankalp_saved_questions') || '[]');
    const exists = bookmarks.find((b) => b._id === q._id);
    if (!exists) {
      bookmarks.unshift(q);
      localStorage.setItem('sankalp_saved_questions', JSON.stringify(bookmarks));
      toast.success('Question saved to Bookmarks!');
    } else {
      toast.info('Already in bookmarks');
    }
  };

  const handleGenerateQuestions = async () => {
    if (!isAiConnected) {
      toast.error('Connect your API key in Settings to generate questions with SANKALP AI');
      return;
    }

    setGenerating(true);
    try {
      const res = await aiApi.generateQuestions({
        apiKey: groqApiKey,
        model: groqModel,
        subjectId: selectedSubject?._id,
        unitName: unitFilter,
        difficulty,
        marks: marksFilter,
        questionType: typeFilter,
        count: 5,
      });

      if (res.data?.success) {
        const formatted = res.data.data.map((q, idx) => ({
          _id: `ai_${Date.now()}_${idx}`,
          question_text: q.question,
          marks: q.marks,
          question_type: q.type,
          is_ai_generated: true,
          unit: unitFilter || 'AI Practice Problem',
          pregenerated_answer: q.correct_answer,
          explanation: q.explanation,
        }));
        setQuestions([...formatted, ...questions]);
        toast.success('Generated 5 new practice questions!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Practice Questions"
        description="Practice university exam questions by marks (2M, 5M, 10M, 15M) and reveal instant model answers."
        badge={selectedSubject ? selectedSubject.name : 'Select Subject'}
        actions={
          selectedSubject && (
            <button
              onClick={handleGenerateFinalPaper}
              disabled={generatingFinalPaper || !isAiConnected}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 shadow-xs transition-all disabled:opacity-50"
              title="Study all 5 years of papers and generate a Master Final Preparation Paper"
            >
              {generatingFinalPaper ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileCheck2 className="w-3.5 h-3.5" />
              )}
              <span>{generatingFinalPaper ? 'Analyzing 5-Yr Papers...' : 'Generate 5-Yr Final Paper'}</span>
            </button>
          )
        }
      />

      {/* Generator Control Panel */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500 shrink-0" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              SANKALP AI Question Generator
            </h3>
          </div>
          <span className="text-xs text-gray-400">
            Synthesizes questions using past university exam patterns
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Unit selector */}
          <div>
            <label className="font-semibold text-gray-500 mb-1 block">Unit</label>
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
            >
              <option value="">All Units</option>
              {selectedSubject?.units?.map((u) => (
                <option key={u._id} value={`Unit ${u.number}: ${u.name}`}>
                  Unit {u.number}: {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Marks */}
          <div>
            <label className="font-semibold text-gray-500 mb-1 block">Marks Pattern</label>
            <select
              value={marksFilter}
              onChange={(e) => setMarksFilter(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
            >
              {MARKS_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m} Marks Question
                </option>
              ))}
            </select>
          </div>

          {/* Question Type */}
          <div>
            <label className="font-semibold text-gray-500 mb-1 block">Question Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
            >
              {QUESTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="font-semibold text-gray-500 mb-1 block">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
            >
              <option value="easy">Beginner / Direct</option>
              <option value="medium">Standard University Level</option>
              <option value="hard">Challenging / Applied</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2 w-full">
          <button
            onClick={handleGenerateQuestions}
            disabled={generating}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors disabled:opacity-50 w-full sm:w-auto text-center"
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            {generating ? 'Generating Questions...' : 'Generate 5 Practice Questions'}
          </button>
        </div>
      </div>

      {/* Questions Stream */}
      {loading ? (
        <LoadingSpinner text="Loading practice question bank..." />
      ) : questions.length === 0 ? (
        <EmptyState
          icon={PenTool}
          title="No questions in bank"
          description="Use the generator above to create customized university practice questions."
        />
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const isCompleted = !!completedMap[q._id];
            const isRevealed = !!revealedAnswers[q._id]?.answer || !!q.pregenerated_answer;
            const isAnswering = !!revealedAnswers[q._id]?.loading;

            return (
              <div
                key={q._id || idx}
                className={`p-6 rounded-3xl bg-white dark:bg-[#111827] border transition-all ${
                  isCompleted
                    ? 'border-emerald-200 dark:border-emerald-950/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                    : 'border-gray-200 dark:border-gray-800 shadow-2xs hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Badge: Historical vs AI-Generated */}
                    {q.is_ai_generated ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400">
                        <Sparkles className="w-3 h-3" /> SANKALP AI Generated
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400">
                        Historical PYQ ({q.exam_year || 'University Paper'})
                      </span>
                    )}

                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {q.marks ? `${q.marks} Marks` : '10 Marks'}
                    </span>

                    {q.unit && (
                      <span className="text-xs text-gray-400 truncate max-w-xs">
                        • {q.unit}
                      </span>
                    )}
                  </div>

                  {/* Top Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleBookmarkQuestion(q)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="Bookmark Question"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleCompleted(q._id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isCompleted
                          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50'
                          : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      title={isCompleted ? 'Completed' : 'Mark as completed'}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4 leading-relaxed">
                  {q.question_text}
                </h4>

                {/* Reveal Answer Button */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() =>
                      q.pregenerated_answer
                        ? setRevealedAnswers((prev) => ({
                            ...prev,
                            [q._id]: prev[q._id] ? null : { answer: q.pregenerated_answer },
                          }))
                        : toggleRevealAnswer(q._id, q.question_text, q.marks)
                    }
                    disabled={isAnswering}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {isAnswering ? (
                      'Generating Model Answer...'
                    ) : isRevealed ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" /> Hide Model Solution
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" /> Reveal Model Answer ({q.marks || 10}M)
                      </>
                    )}
                  </button>
                </div>

                {/* Answer Content */}
                {isRevealed && (
                  <div className="mt-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-800 text-xs text-gray-800 dark:text-gray-200 animate-in fade-in duration-150">
                    <p className="font-bold text-[11px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
                      Model University Answer
                    </p>
                    <div>
                      <MarkdownRenderer content={revealedAnswers[q._id]?.answer || q.pregenerated_answer} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {/* Master Preparation Paper Modal */}
      {masterPaperModalOpen && (
        <MasterPaperModal
          paper={masterPaper}
          onClose={() => setMasterPaperModalOpen(false)}
        />
      )}
    </div>
  );
}
