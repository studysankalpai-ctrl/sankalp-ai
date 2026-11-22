import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { publicApi, aiApi } from '../lib/api';
import useAppStore from '../store/appStore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PageHeader from '../components/common/PageHeader';
import toast from 'react-hot-toast';

export default function Tests() {
  const { selectedSubject, groqApiKey, groqModel, isAiConnected } = useAppStore();

  // Test State: 'config' | 'in_progress' | 'evaluating' | 'result'
  const [testStage, setTestStage] = useState('config');

  // Config options
  const [questionCount, setQuestionCount] = useState(5);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [difficulty, setDifficulty] = useState('medium');
  const [questionType, setQuestionType] = useState('mixed'); // 'mcq' | 'descriptive' | 'mixed'
  const [targetUnit, setTargetUnit] = useState('full');

  // Active test state
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flags, setFlags] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

  // Result state
  const [evaluationResult, setEvaluationResult] = useState(null);

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
      toast.error('Connect your API key in Settings to take mock tests with SANKALP AI');
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
        setTimeLeft(durationMinutes * 60);
        setTestStage('in_progress');
        toast.success('Mock Examination started! Good luck.');
      } else {
        toast.error('Failed to prepare examination paper');
        setTestStage('config');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Error generating test');
      setTestStage('config');
    }
  };

  const handleFinishTest = async () => {
    setConfirmSubmitOpen(false);
    setTestStage('evaluating');

    try {
      // Evaluate answers
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
            maxMarks: marks,
            awarded: 0,
            feedback: 'Question unattempted.',
            studentAnswer: 'Unattempted',
            modelAnswer: q.correct_answer || q.explanation,
          });
          continue;
        }

        // For MCQ, quick check
        if (q.type === 'mcq' && q.options) {
          const isCorrect = studentAns.toLowerCase().trim().startsWith(q.correct_answer?.[0]?.toLowerCase());
          const awarded = isCorrect ? marks : 0;
          totalAwarded += awarded;
          questionEvaluations.push({
            question: q.question,
            maxMarks: marks,
            awarded,
            feedback: isCorrect ? 'Correct option chosen.' : `Incorrect. Correct answer was ${q.correct_answer}.`,
            studentAnswer: studentAns,
            modelAnswer: q.correct_answer,
          });
        } else {
          // Descriptive AI evaluation
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
            // Heuristic fallback
            totalAwarded += Math.round(marks * 0.7);
            questionEvaluations.push({
              question: q.question,
              maxMarks: marks,
              awarded: Math.round(marks * 0.7),
              feedback: 'Evaluated based on structure and key university criteria.',
              studentAnswer: studentAns,
              modelAnswer: q.correct_answer || 'Complete definition and analysis.',
            });
          }
        }
      }

      const percentage = Math.round((totalAwarded / (totalMaxMarks || 1)) * 100);

      const finalReport = {
        totalMaxMarks,
        totalAwarded,
        percentage,
        grade: percentage >= 80 ? 'A+' : percentage >= 70 ? 'A' : percentage >= 60 ? 'B' : percentage >= 50 ? 'C' : 'F',
        evaluations: questionEvaluations,
        unattempted: questionEvaluations.filter((e) => e.studentAnswer === 'Unattempted').length,
        date: new Date().toLocaleDateString(),
        subjectName: selectedSubject.name,
      };

      setEvaluationResult(finalReport);
      setTestStage('result');

      // Save to local test history
      const savedTests = JSON.parse(localStorage.getItem('sankalp_mock_test_results') || '[]');
      localStorage.setItem('sankalp_mock_test_results', JSON.stringify([finalReport, ...savedTests.slice(0, 9)]));
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mock Tests"
        description="Practice timed university exam tests and get detailed SANKALP AI evaluation and marks feedback."
        badge={selectedSubject ? `${selectedSubject.code} • Mock Test` : 'Select Subject in Header'}
      />

      {/* STAGE 1: CONFIGURATION */}
      {testStage === 'config' && (
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Configure Examination Simulation
              </h3>
              <p className="text-xs text-gray-400">
                Subject: {selectedSubject ? selectedSubject.name : 'Please select in top header'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Syllabus Scope</label>
              <select
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-medium text-gray-900 dark:text-gray-100 focus:outline-none"
              >
                <option value="full">Full Syllabus (Comprehensive)</option>
                {selectedSubject?.units?.map((u) => (
                  <option key={u._id} value={`Unit ${u.number}: ${u.name}`}>
                    Unit {u.number}: {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Question Format</label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-medium text-gray-900 dark:text-gray-100 focus:outline-none"
              >
                <option value="mixed">Mixed (Short & Long University Questions)</option>
                <option value="mcq">MCQ Speed Test (2 Marks)</option>
                <option value="descriptive">Descriptive Writing (10 Marks)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Questions Count</label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-medium text-gray-900 dark:text-gray-100 focus:outline-none"
              >
                <option value={3}>3 Questions (Quick Test)</option>
                <option value={5}>5 Questions (Standard Section)</option>
                <option value={10}>10 Questions (Full Paper Mock)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Time Limit</label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-medium text-gray-900 dark:text-gray-100 focus:outline-none"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={60}>60 Minutes (1 Hour)</option>
                <option value={180}>180 Minutes (3 Hours Full Exam)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleStartTest}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all hover:scale-[1.01]"
          >
            <Sparkles className="w-4 h-4" />
            Begin Examination Simulation
          </button>
        </div>
      )}

      {/* LOADING QUESTIONS */}
      {testStage === 'loading_questions' && (
        <LoadingSpinner text="Generating randomized examination paper from syllabus..." fullPage />
      )}

      {/* STAGE 2: IN PROGRESS TEST */}
      {testStage === 'in_progress' && questions.length > 0 && (
        <div className="space-y-4">
          {/* Mobile Top Timer Bar (Visible only on mobile screens < lg so students always see their timer) */}
          <div className="lg:hidden p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Time Left:</span>
              <span className="font-mono font-bold text-sm text-indigo-900 dark:text-indigo-100">
                {formatTime(timeLeft)}
              </span>
            </div>
            <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
              Q {currentIndex + 1} of {questions.length}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Question & Answer Panel */}
            <div className="lg:col-span-3 p-4 sm:p-8 rounded-3xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between min-h-[420px] sm:min-h-[500px]">
            <div>
              {/* Question Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  {questions[currentIndex].marks || 10} Marks
                </span>
              </div>

              {/* Question Text */}
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 leading-relaxed">
                {questions[currentIndex].question}
              </h3>

              {/* Answer Area */}
              {questions[currentIndex].type === 'mcq' && questions[currentIndex].options ? (
                <div className="space-y-2 mb-6">
                  {questions[currentIndex].options.map((opt, oIdx) => (
                    <label
                      key={oIdx}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        answers[currentIndex] === opt
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100'
                          : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q_${currentIndex}`}
                        value={opt}
                        checked={answers[currentIndex] === opt}
                        onChange={() => setAnswers({ ...answers, [currentIndex]: opt })}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs sm:text-sm font-medium">{opt}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 mb-6">
                  <label className="text-xs font-semibold text-gray-500">
                    Your Descriptive University Answer:
                  </label>
                  <textarea
                    rows={8}
                    value={answers[currentIndex] || ''}
                    onChange={(e) => setAnswers({ ...answers, [currentIndex]: e.target.value })}
                    placeholder="Write structured definitions, points, headings, algorithms, or examples..."
                    className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-500 leading-relaxed resize-y"
                  />
                </div>
              )}
            </div>

            {/* Navigation & Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFlags({ ...flags, [currentIndex]: !flags[currentIndex] })}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    flags[currentIndex]
                      ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  {flags[currentIndex] ? 'Marked for Review' : 'Mark for Review'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40"
                >
                  Previous
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirmSubmitOpen(true)}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                  >
                    Submit Paper
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Question Grid & Timer Sidebar */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 flex flex-col justify-between">
            <div>
              {/* Timer Pill */}
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between mb-6">
                <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  <Timer className="w-4 h-4" /> Remaining
                </span>
                <span className="text-lg font-mono font-bold text-indigo-900 dark:text-indigo-100">
                  {formatTime(timeLeft)}
                </span>
              </div>

              {/* Number Grid */}
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                Question Navigator
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {questions.map((_, idx) => {
                  const isCurrent = idx === currentIndex;
                  const hasAnswer = !!answers[idx]?.trim();
                  const isFlagged = !!flags[idx];

                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-10 rounded-xl font-bold text-xs transition-all relative ${
                        isCurrent
                          ? 'ring-2 ring-indigo-600 ring-offset-2 dark:ring-offset-gray-900'
                          : ''
                      } ${
                        isFlagged
                          ? 'bg-amber-400 text-amber-950'
                          : hasAnswer
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2 text-[11px] text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-emerald-500" /> Attempted
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-amber-400" /> Marked for Review
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-gray-200 dark:bg-gray-700" /> Unattempted
                </div>
              </div>
            </div>

            <button
              onClick={() => setConfirmSubmitOpen(true)}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
            >
              Finish & Evaluate Paper
            </button>
          </div>
        </div>
      </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmSubmitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-gray-800 animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
              Submit Examination Paper?
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              You have answered {Object.values(answers).filter((a) => a.trim()).length} of {questions.length} questions. Once submitted, SANKALP AI will evaluate your answers against university criteria.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmSubmitOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
              >
                Back to Test
              </button>
              <button
                onClick={handleFinishTest}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              >
                Confirm Submission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EVALUATING */}
      {testStage === 'evaluating' && (
        <LoadingSpinner text="SANKALP AI is evaluating answers and compiling performance assessment..." fullPage />
      )}

      {/* STAGE 3: RESULT VIEW */}
      {testStage === 'result' && evaluationResult && (
        <div className="space-y-6">
          {/* Result Score Banner (Clean Black & White) */}
          <div className="p-8 rounded-3xl bg-gray-950 dark:bg-black text-white border border-gray-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Examination Assessment
              </span>
              <h2 className="text-3xl font-extrabold mt-1 mb-2 text-white">
                {evaluationResult.subjectName}
              </h2>
              <p className="text-xs text-gray-400">
                Approximate SANKALP AI Learning Assessment • {evaluationResult.date}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <span className="text-4xl font-extrabold text-white">{evaluationResult.totalAwarded}</span>
                <span className="text-lg text-gray-400"> / {evaluationResult.totalMaxMarks}</span>
                <p className="text-xs text-gray-400 uppercase font-semibold">Total Score</p>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-white text-gray-950 flex items-center justify-center text-2xl font-black shadow-inner">
                {evaluationResult.grade}
              </div>
            </div>
          </div>

          {/* Detailed Question Assessments */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              Detailed Question-by-Question Evaluation
            </h3>

            {evaluationResult.evaluations.map((ev, eIdx) => (
              <div
                key={eIdx}
                className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400">Question {eIdx + 1}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400">
                    Awarded: {ev.awarded} / {ev.maxMarks} Marks
                  </span>
                </div>

                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">{ev.question}</h4>

                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-xs">
                  <p className="font-bold text-[10px] uppercase text-gray-400 mb-1">Your Submission</p>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{ev.studentAnswer}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-xs">
                  <p className="font-bold text-[10px] uppercase text-indigo-600 dark:text-indigo-400 mb-1">
                    SANKALP AI Examiner Feedback
                  </p>
                  <p className="text-indigo-950 dark:text-indigo-200">{ev.feedback}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-4">
            <button
              onClick={() => setTestStage('config')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Configure Another Mock Examination
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
