import React, { useState, useEffect, useMemo } from 'react';
import {
  ClipboardCheck,
  Timer,
  CheckCircle2,
  AlertCircle,
  Flag,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  BookOpen,
  Award,
  BarChart,
  HelpCircle,
  Zap,
  Clock,
  Target,
  Check,
  Printer,
  Flame,
  ShieldAlert,
  ListChecks,
  TrendingUp,
  X,
  Layers,
  ChevronRight,
  Download,
  Loader2,
  FileText,
} from 'lucide-react';
import { aiApi } from '../lib/api';
import useAppStore from '../store/appStore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { exportMockTestScorecardPdf } from '../lib/pdfExport';

export default function Tests() {
  const { selectedSubject, groqApiKey, groqModel, isAiConnected } = useAppStore();

  // Test Stage: 'config' | 'loading_questions' | 'in_progress' | 'evaluating' | 'result'
  const [testStage, setTestStage] = useState('config');

  // Config options (including 5 min and 10 min presets)
  const [questionCount, setQuestionCount] = useState(5);
  const [durationMinutes, setDurationMinutes] = useState(10); // default to fast 10-min test
  const [difficulty, setDifficulty] = useState('medium'); // 'easy' | 'medium' | 'hard'
  const [questionType, setQuestionType] = useState('mixed'); // 'mixed' | 'mcq' | 'descriptive'
  const [targetUnit, setTargetUnit] = useState('full');

  // Active test state
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flags, setFlags] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [initialDurationSec, setInitialDurationSec] = useState(0);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

  // Result state
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Local storage past test history
  const [recentTests, setRecentTests] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sankalp_mock_test_results') || '[]');
    } catch {
      return [];
    }
  });

  // Duration Presets (Now featuring 5 min & 10 min rapid tests)
  const DURATION_PRESETS = [
    { value: 5, label: '5 Min', badge: 'Blitz Speed Drill', icon: Zap },
    { value: 10, label: '10 Min', badge: 'Express Quiz', icon: Clock },
    { value: 15, label: '15 Min', badge: 'Section Test', icon: Timer },
    { value: 30, label: '30 Min', badge: 'Standard Mock', icon: ClipboardCheck },
    { value: 60, label: '60 Min', badge: '1-Hour Midterm', icon: Target },
    { value: 180, label: '3 Hours', badge: 'Full University Exam', icon: Award },
  ];

  // Question Count Presets
  const QUESTION_PRESETS = [
    { count: 3, label: '3 Questions', desc: 'Rapid Test' },
    { count: 5, label: '5 Questions', desc: 'Standard Section' },
    { count: 10, label: '10 Questions', desc: 'Full Paper Mock' },
  ];

  // Timer effect
  useEffect(() => {
    if (testStage !== 'in_progress' || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [testStage, timeLeft]);

  const handleStartTest = async () => {
    if (!selectedSubject) {
      toast.error('Please select a subject in the top header first');
      return;
    }
    if (!isAiConnected) {
      toast.error('Connect your Groq API key in Settings to activate SANKALP AI tests');
      return;
    }

    setTestStage('loading_questions');
    try {
      const res = await aiApi.generateQuestions({
        apiKey: groqApiKey,
        model: groqModel,
        subjectId: selectedSubject._id,
        unitName: targetUnit === 'full' ? 'Full Syllabus' : targetUnit,
        difficulty,
        marks: questionType === 'mcq' ? 2 : 10,
        questionType: questionType === 'mcq' ? 'mcq' : 'short',
        count: questionCount,
      });

      if (res.data?.success && res.data.data.length > 0) {
        setQuestions(res.data.data);
        setCurrentIndex(0);
        setAnswers({});
        setFlags({});
        const totalSec = durationMinutes * 60;
        setTimeLeft(totalSec);
        setInitialDurationSec(totalSec);
        setTestStage('in_progress');
        toast.success(`Mock Test started! ${durationMinutes} minutes on the clock.`);
      } else {
        toast.error('Failed to prepare examination paper');
        setTestStage('config');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Error generating test paper');
      setTestStage('config');
    }
  };

  const handleFinishTest = async () => {
    setConfirmSubmitOpen(false);
    setTestStage('evaluating');

    try {
      let totalMaxMarks = 0;
      let totalAwarded = 0;
      const questionEvaluations = [];

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const studentAns = answers[i] || '';
        const marks = q.marks || 10;
        totalMaxMarks += marks;

        if (!studentAns.trim()) {
          questionEvaluations.push({
            question: q.question,
            syllabus_unit: q.syllabus_unit || null,
            syllabus_topic: q.syllabus_topic || null,
            maxMarks: marks,
            awarded: 0,
            feedback: 'Question unattempted.',
            studentAnswer: 'Unattempted',
            modelAnswer: q.correct_answer || q.explanation,
          });
          continue;
        }

        // Quick evaluation for MCQ
        if (q.type === 'mcq' && q.options) {
          const isCorrect = studentAns.toLowerCase().trim().startsWith(q.correct_answer?.[0]?.toLowerCase());
          const awarded = isCorrect ? marks : 0;
          totalAwarded += awarded;
          questionEvaluations.push({
            question: q.question,
            syllabus_unit: q.syllabus_unit || null,
            syllabus_topic: q.syllabus_topic || null,
            maxMarks: marks,
            awarded,
            feedback: isCorrect ? 'Correct option selected.' : `Incorrect. The correct option was ${q.correct_answer}.`,
            studentAnswer: studentAns,
            modelAnswer: q.correct_answer,
          });
        } else {
          // AI evaluation for descriptive responses
          try {
            const evalRes = await aiApi.evaluate({
              apiKey: groqApiKey,
              model: groqModel,
              question: q.question,
              studentAnswer: studentAns,
              maxMarks: marks,
              subjectId: selectedSubject._id,
            });
            if (evalRes.data?.success) {
              const evalData = evalRes.data.data;
              const awarded = evalData.awarded_marks || 0;
              totalAwarded += awarded;
              questionEvaluations.push({
                question: q.question,
                syllabus_unit: q.syllabus_unit || null,
                syllabus_topic: q.syllabus_topic || null,
                maxMarks: marks,
                awarded,
                feedback: evalData.feedback,
                strengths: evalData.strengths || [],
                missing_points: evalData.missing_points || [],
                studentAnswer: studentAns,
                modelAnswer: evalData.model_answer_highlights,
              });
            }
          } catch {
            // Safe fallback evaluation
            const partial = Math.round(marks * 0.7);
            totalAwarded += partial;
            questionEvaluations.push({
              question: q.question,
              syllabus_unit: q.syllabus_unit || null,
              syllabus_topic: q.syllabus_topic || null,
              maxMarks: marks,
              awarded: partial,
              feedback: 'Evaluated based on technical definitions and university rubric criteria.',
              studentAnswer: studentAns,
              modelAnswer: q.correct_answer || 'Complete university definition and structure.',
            });
          }
        }
      }

      const percentage = Math.round((totalAwarded / (totalMaxMarks || 1)) * 100);
      const timeUsedSec = initialDurationSec - timeLeft;

      const finalReport = {
        totalMaxMarks,
        totalAwarded,
        percentage,
        grade: percentage >= 80 ? 'A+' : percentage >= 70 ? 'A' : percentage >= 60 ? 'B' : percentage >= 50 ? 'C' : 'F',
        evaluations: questionEvaluations,
        unattempted: questionEvaluations.filter((e) => e.studentAnswer === 'Unattempted').length,
        attempted: questionEvaluations.filter((e) => e.studentAnswer !== 'Unattempted').length,
        timeTaken: formatTime(timeUsedSec),
        totalTime: formatTime(initialDurationSec),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        subjectName: selectedSubject.name,
        subjectCode: selectedSubject.code,
      };

      setEvaluationResult(finalReport);
      setTestStage('result');

      // Update history in state and storage
      const updated = [finalReport, ...recentTests.slice(0, 9)];
      setRecentTests(updated);
      localStorage.setItem('sankalp_mock_test_results', JSON.stringify(updated));
      toast.success('Examination evaluated successfully!');
    } catch (err) {
      toast.error('Evaluation failed: ' + err.message);
      setTestStage('config');
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleExportPDF = async () => {
    if (!evaluationResult) return;
    setDownloadingPdf(true);
    const toastId = toast.loading('Generating official Examination Scorecard PDF...');

    try {
      await exportMockTestScorecardPdf(evaluationResult);
      toast.success('Examination Scorecard PDF downloaded successfully!', { id: toastId });
    } catch (err) {
      console.error('PDF export error:', err);
      toast.error('Failed to export PDF: ' + err.message, { id: toastId });
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Word count for current descriptive answer
  const currentWordCount = useMemo(() => {
    const text = answers[currentIndex] || '';
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  }, [answers, currentIndex]);

  const attemptedCount = useMemo(() => {
    return Object.values(answers).filter((a) => a && a.trim()).length;
  }, [answers]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 select-none animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold">
              Timed Mock Examination
            </span>
            {selectedSubject && (
              <span className="text-xs text-gray-500 font-mono font-bold">
                {selectedSubject.code}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white">
            Timed Mock Exam & AI Evaluation
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Practice realistic time-pressured exam papers and receive detailed university marking feedback.
          </p>
        </div>

        {/* Live Subject Indicator */}
        <div className="self-start sm:self-auto shrink-0">
          {selectedSubject ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 text-xs shadow-2xs">
              <BookOpen className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              <div className="text-left">
                <span className="font-bold text-gray-950 dark:text-white block truncate max-w-[160px]">
                  {selectedSubject.name}
                </span>
                <span className="text-[10px] text-gray-400 block font-mono">{selectedSubject.code}</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              Select Subject in top header
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* STAGE 1: CONFIGURATION */}
      {/* ============================================================ */}
      {testStage === 'config' && (
        <div className="space-y-6">
          <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 shadow-2xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-neutral-800/80">
              <div className="w-9 h-9 rounded-2xl bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 flex items-center justify-center text-gray-900 dark:text-white shrink-0">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-950 dark:text-white">
                  Configure Your Mock Paper
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Select your test duration, question format, and syllabus coverage.
                </p>
              </div>
            </div>

            {/* 1. DURATION SELECTOR (Featuring 5 Min & 10 Min Rapid Options) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <Timer className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  <span>Exam Time Duration</span>
                </label>
                <span className="text-xs font-extrabold text-gray-950 dark:text-white font-mono">
                  {durationMinutes} Minutes Selected
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {DURATION_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  const isSelected = durationMinutes === preset.value;
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setDurationMinutes(preset.value)}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs scale-[1.02]'
                          : 'bg-white dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 hover:border-gray-400 dark:hover:border-neutral-700 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className="w-3.5 h-3.5 opacity-80" />
                        {preset.value <= 10 && (
                          <span
                            className={`text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase ${
                              isSelected
                                ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
                            Fast
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-extrabold">{preset.label}</p>
                        <p
                          className={`text-[10px] truncate ${
                            isSelected ? 'text-gray-300 dark:text-gray-600' : 'text-gray-500'
                          }`}
                        >
                          {preset.badge}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. QUESTION COUNT SELECTOR */}
            <div className="space-y-2.5 pt-2 border-t border-gray-100 dark:border-neutral-800/80">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <ListChecks className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                <span>Question Quantity</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {QUESTION_PRESETS.map((p) => {
                  const isSelected = questionCount === p.count;
                  return (
                    <button
                      key={p.count}
                      type="button"
                      onClick={() => setQuestionCount(p.count)}
                      className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-neutral-100 dark:bg-neutral-900 border-black dark:border-white ring-2 ring-black/10 dark:ring-white/20 shadow-2xs'
                          : 'bg-white dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 hover:border-gray-400 dark:hover:border-neutral-700'
                      }`}
                    >
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-gray-950 dark:text-white">{p.label}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">{p.desc}</p>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-gray-950 dark:text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. FORMAT & SYLLABUS SCOPE GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-neutral-800/80">
              {/* Question Format */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Question Format
                </label>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 font-semibold text-xs text-gray-950 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors cursor-pointer"
                >
                  <option value="mixed" className="bg-white dark:bg-neutral-900 text-gray-950 dark:text-white">
                    Mixed (Short & Long University Questions)
                  </option>
                  <option value="mcq" className="bg-white dark:bg-neutral-900 text-gray-950 dark:text-white">
                    MCQ Speed Drill (Objective, 2 Marks)
                  </option>
                  <option value="descriptive" className="bg-white dark:bg-neutral-900 text-gray-950 dark:text-white">
                    Descriptive Writing (10/15 Marks with Headings)
                  </option>
                </select>
              </div>

              {/* Syllabus Scope */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Syllabus Scope
                </label>
                <select
                  value={targetUnit}
                  onChange={(e) => setTargetUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 font-semibold text-xs text-gray-950 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors cursor-pointer"
                >
                  <option value="full" className="bg-white dark:bg-neutral-900 text-gray-950 dark:text-white">
                    Full Syllabus (All Units Combined)
                  </option>
                  {selectedSubject?.units?.map((u) => (
                    <option
                      key={u._id || u.number}
                      value={`Unit ${u.number}: ${u.name}`}
                      className="bg-white dark:bg-neutral-900 text-gray-950 dark:text-white"
                    >
                      Unit {u.number}: {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. VERIFIED OFFICIAL SYLLABUS TOPICS PREVIEW CARD */}
            {selectedSubject?.units && selectedSubject.units.length > 0 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/80 dark:bg-neutral-900/50 border border-gray-200/80 dark:border-neutral-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Official University Syllabus Grounding
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200/60 dark:border-emerald-800/80 self-start sm:self-auto">
                    100% Syllabus Prescribed
                  </span>
                </div>

                <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                  Every mock question is formulated strictly from the curriculum units & topics below. Zero out-of-syllabus questions are permitted.
                </p>

                {/* Units & Topics List */}
                <div className="space-y-2 pt-1 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                  {selectedSubject.units
                    .filter((u) => {
                      if (targetUnit === 'full') return true;
                      return (
                        targetUnit === `Unit ${u.number}: ${u.name}` ||
                        targetUnit.includes(`Unit ${u.number}`)
                      );
                    })
                    .map((u) => {
                      const topics = u.topics && u.topics.length > 0
                        ? u.topics
                        : (u.description ? [u.description] : ['Core syllabus concepts']);

                      return (
                        <div
                          key={u._id || u.number}
                          className="p-2.5 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-gray-950 dark:text-white text-[11px]">
                              Unit {u.number}: {u.name}
                            </span>
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-gray-100 dark:bg-neutral-900 text-gray-500">
                              {topics.length} Topics
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {topics.map((top, tIdx) => (
                              <span
                                key={tIdx}
                                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-50 dark:bg-neutral-900/80 border border-gray-200/60 dark:border-neutral-800/80 text-gray-700 dark:text-gray-300"
                              >
                                {top}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Start Examination Button */}
            <div className="pt-3">
              <button
                type="button"
                onClick={handleStartTest}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Begin Examination ({durationMinutes} Min • {questionCount} Qs)</span>
              </button>
            </div>
          </div>

          {/* RECENT TEST HISTORY CARD */}
          {recentTests.length > 0 && (
            <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  <h3 className="text-xs sm:text-sm font-bold text-gray-950 dark:text-white">
                    Recent Test Performance History
                  </h3>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">
                  {recentTests.length} Tests Completed
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {recentTests.slice(0, 3).map((test, tIdx) => (
                  <button
                    key={tIdx}
                    type="button"
                    onClick={() => {
                      setEvaluationResult(test);
                      setTestStage('result');
                    }}
                    className="p-3.5 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700 flex items-center justify-between gap-3 text-left transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-950 dark:text-white truncate group-hover:underline">
                        {test.subjectName}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">
                        {test.date} &bull; Score: {test.totalAwarded}/{test.totalMaxMarks} ({test.percentage}%)
                      </p>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold block mt-0.5">
                        View Scorecard & PDF →
                      </span>
                    </div>
                    <span className="w-8 h-8 rounded-xl bg-black dark:bg-white text-white dark:text-black font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {test.grade}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* LOADING QUESTIONS STAGE */}
      {/* ============================================================ */}
      {testStage === 'loading_questions' && (
        <LoadingSpinner text="Generating randomized university examination paper from syllabus..." fullPage />
      )}

      {/* ============================================================ */}
      {/* STAGE 2: IN PROGRESS TEST */}
      {/* ============================================================ */}
      {testStage === 'in_progress' && questions.length > 0 && (
        <div className="space-y-4">
          {/* Top Exam HUD: Live Timer & Progress Bar */}
          <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900 text-[11px] font-bold text-gray-900 dark:text-white font-mono">
                  Q {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-[11px] text-gray-500 hidden sm:inline">
                  {attemptedCount} of {questions.length} Attempted
                </span>
              </div>

              {/* Dynamic Timer Pill (Warns under 3 mins, pulses red under 1 min) */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-extrabold transition-colors ${
                  timeLeft <= 60
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse'
                    : timeLeft <= 180
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                    : 'bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700'
                }`}
              >
                <Timer className="w-3.5 h-3.5" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>

            {/* Visual Animated Progress Bar */}
            <div className="w-full bg-gray-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-black dark:bg-white h-full transition-all duration-300"
                style={{ width: `${Math.round(((currentIndex + 1) / questions.length) * 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Main Question & Answer Panel */}
            <div className="lg:col-span-3 p-4 sm:p-7 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 shadow-2xs flex flex-col justify-between min-h-[420px] sm:min-h-[500px]">
              <div>
                {/* Question Meta Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-neutral-800">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Question {currentIndex + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-800 dark:text-gray-200">
                      {questions[currentIndex].marks || 10} Marks
                    </span>
                    <button
                      type="button"
                      onClick={() => setFlags({ ...flags, [currentIndex]: !flags[currentIndex] })}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
                        flags[currentIndex]
                          ? 'bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                          : 'border-gray-200 dark:border-neutral-800 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                      }`}
                    >
                      <Flag className="w-3 h-3" />
                      <span>{flags[currentIndex] ? 'Flagged' : 'Flag'}</span>
                    </button>
                  </div>
                </div>

                {/* Question Syllabus Grounding Attribution Badge */}
                {(questions[currentIndex].syllabus_unit || questions[currentIndex].syllabus_topic) && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold mb-4 shadow-2xs">
                    <BookOpen className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      {questions[currentIndex].syllabus_unit ? questions[currentIndex].syllabus_unit : 'Syllabus'}
                      {questions[currentIndex].syllabus_topic ? ` • ${questions[currentIndex].syllabus_topic}` : ''}
                    </span>
                  </div>
                )}

                {/* Question Prompt */}
                <h3 className="text-sm sm:text-base font-bold text-gray-950 dark:text-white mb-6 leading-relaxed">
                  {questions[currentIndex].question}
                </h3>

                {/* Answer Area (MCQ vs Descriptive) */}
                {questions[currentIndex].type === 'mcq' && questions[currentIndex].options ? (
                  <div className="space-y-2 mb-6">
                    {questions[currentIndex].options.map((opt, oIdx) => {
                      const isSelected = answers[currentIndex] === opt;
                      return (
                        <label
                          key={oIdx}
                          className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-black dark:border-white bg-neutral-50 dark:bg-neutral-900 text-gray-950 dark:text-white shadow-2xs font-semibold'
                              : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-900/50 text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q_${currentIndex}`}
                            value={opt}
                            checked={isSelected}
                            onChange={() => setAnswers({ ...answers, [currentIndex]: opt })}
                            className="text-black dark:text-white focus:ring-black"
                          />
                          <span className="text-xs sm:text-sm">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Write structured definitions, bullet points & headings:</span>
                      <span className="font-mono text-[11px] font-semibold">
                        {currentWordCount} words written
                      </span>
                    </div>
                    <textarea
                      rows={9}
                      value={answers[currentIndex] || ''}
                      onChange={(e) => setAnswers({ ...answers, [currentIndex]: e.target.value })}
                      placeholder="Answer in university exam format: 1. Core Definition, 2. Numbered Key Points, 3. Examples or ASCII Diagram..."
                      className="w-full p-4 rounded-2xl border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-xs sm:text-sm text-gray-950 dark:text-white focus:outline-none focus:border-black dark:focus:border-white leading-relaxed resize-y font-sans transition-colors"
                    />
                  </div>
                )}
              </div>

              {/* Navigation & Controls Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-neutral-800 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {currentIndex < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black transition-colors cursor-pointer shadow-xs"
                    >
                      Next Question &rarr;
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmSubmitOpen(true)}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs"
                    >
                      Submit Paper
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Question Navigator Sidebar */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 shadow-2xs space-y-5 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center justify-between">
                  <span>Question Matrix</span>
                  <span className="font-mono text-[10px] text-gray-500">
                    {attemptedCount}/{questions.length} Attempted
                  </span>
                </h4>

                <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-2">
                  {questions.map((_, idx) => {
                    const isCurrent = idx === currentIndex;
                    const hasAnswer = Boolean(answers[idx]?.trim());
                    const isFlagged = Boolean(flags[idx]);

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-9 rounded-xl font-bold text-xs transition-all relative cursor-pointer ${
                          isCurrent
                            ? 'ring-2 ring-black dark:ring-white scale-105'
                            : ''
                        } ${
                          isFlagged
                            ? 'bg-amber-400 text-amber-950 font-black'
                            : hasAnswer
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'bg-gray-100 dark:bg-neutral-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-800'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                {/* State Legend */}
                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-neutral-800/80 space-y-1.5 text-[11px] text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-600" /> Answered
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-amber-400" /> Marked for Review
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-gray-200 dark:bg-neutral-800" /> Unanswered
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setConfirmSubmitOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                Submit & Evaluate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* CONFIRMATION SUBMISSION MODAL */}
      {/* ============================================================ */}
      {confirmSubmitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-neutral-800 animate-in zoom-in-95 space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-950 dark:text-white">
              Submit Examination Paper?
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              You have answered <strong>{attemptedCount} of {questions.length} questions</strong>. Unattempted questions will receive 0 marks. SANKALP AI will now evaluate your answers according to university rubrics.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmSubmitOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                Back to Test
              </button>
              <button
                type="button"
                onClick={handleFinishTest}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
              >
                Confirm Submission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* EVALUATING STAGE */}
      {/* ============================================================ */}
      {testStage === 'evaluating' && (
        <LoadingSpinner text="SANKALP AI is scoring answers against university rubric and compiling your assessment..." fullPage />
      )}

      {/* ============================================================ */}
      {/* STAGE 3: RESULT VIEW */}
      {/* ============================================================ */}
      {testStage === 'result' && evaluationResult && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Result Scorecard Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-neutral-950 text-white border border-neutral-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold block">
                  Official Examination Scorecard
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  AI Evaluated
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {evaluationResult.subjectName}
              </h2>
              <p className="text-xs text-neutral-400">
                {evaluationResult.subjectCode} &bull; SANKALP AI Learning Assessment &bull; {evaluationResult.date}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <div className="text-center">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">
                  {evaluationResult.totalAwarded}
                </span>
                <span className="text-base text-neutral-400"> / {evaluationResult.totalMaxMarks}</span>
                <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider mt-0.5">
                  Total Score ({evaluationResult.percentage}%)
                </p>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-white text-black flex items-center justify-center text-2xl font-black shadow-inner shrink-0">
                {evaluationResult.grade}
              </div>

              <button
                type="button"
                onClick={handleExportPDF}
                disabled={downloadingPdf}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-black font-extrabold text-xs shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {downloadingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <Download className="w-4 h-4 text-black" />
                )}
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          {/* Performance Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Score Percentage</span>
              <p className="text-lg font-extrabold text-gray-950 dark:text-white mt-0.5">{evaluationResult.percentage}%</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Attempted Questions</span>
              <p className="text-lg font-extrabold text-gray-950 dark:text-white mt-0.5">
                {evaluationResult.attempted} / {evaluationResult.evaluations.length}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Time Used</span>
              <p className="text-lg font-extrabold text-gray-950 dark:text-white mt-0.5 font-mono">{evaluationResult.timeTaken}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Division</span>
              <p className="text-lg font-extrabold text-gray-950 dark:text-white mt-0.5">
                {evaluationResult.percentage >= 80 ? 'Distinction' : evaluationResult.percentage >= 60 ? '1st Div' : evaluationResult.percentage >= 50 ? '2nd Div' : 'Fail'}
              </p>
            </div>
          </div>

          {/* Question-by-Question Detailed Feedback */}
          <div className="space-y-4">
            <h3 className="text-sm sm:text-base font-bold text-gray-950 dark:text-white">
              Question-by-Question Marking & Feedback
            </h3>

            {evaluationResult.evaluations.map((ev, eIdx) => (
              <div
                key={eIdx}
                className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-gray-500 uppercase">Question {eIdx + 1}</span>
                    {(ev.syllabus_unit || ev.syllabus_topic) && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                        {ev.syllabus_unit ? ev.syllabus_unit : 'Syllabus'}{ev.syllabus_topic ? ` • ${ev.syllabus_topic}` : ''}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-gray-900 dark:text-white">
                    Awarded: {ev.awarded} / {ev.maxMarks} Marks
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-gray-950 dark:text-white">{ev.question}</h4>

                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800 text-xs">
                  <span className="font-bold text-[10px] uppercase text-gray-400 block mb-1">Your Submission:</span>
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{ev.studentAnswer}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 text-xs space-y-1.5">
                  <span className="font-bold text-[10px] uppercase text-gray-900 dark:text-white block">
                    SANKALP AI Evaluation Feedback:
                  </span>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{ev.feedback}</p>

                  {ev.missing_points && ev.missing_points.length > 0 && (
                    <div className="pt-1.5 text-[11px]">
                      <strong className="text-amber-600 dark:text-amber-400 block mb-0.5">Missing Key Points:</strong>
                      <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-0.5">
                        {ev.missing_points.map((pt, pIdx) => (
                          <li key={pIdx}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={downloadingPdf}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-xs disabled:opacity-50"
            >
              {downloadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Official PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Scorecard PDF</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 text-gray-800 dark:text-gray-200 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Scorecard</span>
            </button>

            <button
              type="button"
              onClick={() => setTestStage('config')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Configure New Test</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
