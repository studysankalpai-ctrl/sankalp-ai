import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ListTodo,
  Layers,
  GraduationCap,
  Printer,
  FileText,
  Target,
  Trophy,
  Loader2,
  Check,
} from 'lucide-react';
import { aiApi, publicApi } from '../lib/api';
import useAppStore from '../store/appStore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PageHeader from '../components/common/PageHeader';
import toast from 'react-hot-toast';

export default function Planner() {
  const {
    groqApiKey,
    groqModel,
    isAiConnected,
    courses,
    selectedCourse,
    selectedSemester,
    setSelectedCourse,
    setSelectedSemester,
  } = useAppStore();

  // Plan scope: 'semester' (All subjects of semester) | 'custom' (Specific subjects)
  const [planScope, setPlanScope] = useState('semester');
  const [semesterSubjects, setSemesterSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  // Default exam date: 30 days from today
  const defaultExamDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [examDate, setExamDate] = useState(defaultExamDate);
  const [dailyHours, setDailyHours] = useState(4);
  const [preferredTime, setPreferredTime] = useState('Evening');
  const [prepLevel, setPrepLevel] = useState('Beginner');
  const [loading, setLoading] = useState(false);
  const [studyPlan, setStudyPlan] = useState(null);
  const [completedTasks, setCompletedTasks] = useState({});

  // Load semester subjects when selectedSemester is active
  useEffect(() => {
    async function fetchSubjects() {
      if (!selectedSemester) return;
      try {
        const res = await publicApi.getSubjects(selectedSemester._id);
        if (res.data?.success) {
          setSemesterSubjects(res.data.data);
          // By default, select all subjects for custom mode
          setSelectedSubjects(res.data.data.map((s) => s.name));
        }
      } catch (err) {
        console.warn('Could not load subjects for planner:', err);
      }
    }
    fetchSubjects();
  }, [selectedSemester]);

  // Load saved plan from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sankalp_study_plan');
    if (saved) {
      try {
        setStudyPlan(JSON.parse(saved));
      } catch (e) {}
    }
    const savedCompleted = JSON.parse(localStorage.getItem('sankalp_planner_completed_tasks') || '{}');
    setCompletedTasks(savedCompleted);
  }, []);

  const handleGeneratePlan = async () => {
    if (!isAiConnected) {
      toast.error('Connect your API key in Settings to generate a study plan with SANKALP AI');
      return;
    }
    if (!examDate) {
      toast.error('Please specify your upcoming examination date');
      return;
    }

    setLoading(true);
    try {
      const res = await aiApi.generateStudyPlan({
        apiKey: groqApiKey,
        model: groqModel,
        examDate,
        semesterId: selectedSemester?._id,
        planScope,
        subjects: planScope === 'custom' && selectedSubjects.length > 0 ? selectedSubjects : undefined,
        dailyHours,
        preferredTime,
        prepLevel,
      });

      if (res.data?.success && res.data.data) {
        setStudyPlan(res.data.data);
        localStorage.setItem('sankalp_study_plan', JSON.stringify(res.data.data));
        toast.success(
          planScope === 'semester'
            ? 'Generated Entire Semester Master Study Plan!'
            : 'Generated targeted exam sprint schedule!'
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Plan generation failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (taskId) => {
    const next = { ...completedTasks, [taskId]: !completedTasks[taskId] };
    setCompletedTasks(next);
    localStorage.setItem('sankalp_planner_completed_tasks', JSON.stringify(next));
  };

  const handlePrint = () => {
    window.print();
  };

  // Progress calculations
  const totalDays = studyPlan?.daily_schedule?.length || 0;
  const completedCount = studyPlan?.daily_schedule?.filter((item, idx) => {
    const taskId = `day_${item.day || idx + 1}`;
    return !!completedTasks[taskId];
  }).length || 0;
  const progressPercent = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Study Planner"
        description="Create a personalized day-by-day exam preparation schedule for your semester."
        badge={selectedSemester ? selectedSemester.name : 'Study Plan'}
        actions={
          studyPlan && (
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors print:hidden"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Timetable</span>
            </button>
          )
        }
      />

      {/* Configuration Box (Hidden in Print) */}
      <div className="p-4 sm:p-8 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 shadow-xs space-y-6 print:hidden">
        {/* Semester Context & Plan Scope Toggle */}
        <div className="space-y-4 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {selectedCourse?.name || 'Academic Degree'} • {selectedSemester?.name || 'Semester'}
                </h3>
                <p className="text-xs text-gray-400">
                  Choose whether to schedule all semester subjects or create a single-subject sprint.
                </p>
              </div>
            </div>

            {/* Scope Toggle */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl text-xs font-semibold w-full sm:w-auto">
              <button
                onClick={() => setPlanScope('semester')}
                className={`px-3.5 py-1.5 rounded-xl transition-all text-center ${
                  planScope === 'semester'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                Entire Semester (All Subjects)
              </button>
              <button
                onClick={() => setPlanScope('custom')}
                className={`px-3.5 py-1.5 rounded-xl transition-all text-center ${
                  planScope === 'custom'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                Custom / Single Subject
              </button>
            </div>
          </div>

          {/* Subjects in Current Semester */}
          <div className="pt-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              {planScope === 'semester'
                ? `Subjects Automatically Included in Semester Plan (${semesterSubjects.length}):`
                : 'Select Specific Subjects to Include:'}
            </p>
            {semesterSubjects.length === 0 ? (
              <p className="text-xs text-gray-400 italic">
                No subjects registered for this semester yet. SANKALP AI will extrapolate standard university curriculum.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {semesterSubjects.map((sub) => {
                  const isChecked = selectedSubjects.includes(sub.name);
                  if (planScope === 'semester') {
                    return (
                      <span
                        key={sub._id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                      >
                        <BookOpen className="w-3 h-3 text-indigo-500" />
                        <span>{sub.name}</span>
                      </span>
                    );
                  }

                  return (
                    <button
                      key={sub._id}
                      onClick={() => {
                        if (isChecked) {
                          setSelectedSubjects(selectedSubjects.filter((n) => n !== sub.name));
                        } else {
                          setSelectedSubjects([...selectedSubjects, sub.name]);
                        }
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium border transition-colors ${
                        isChecked
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                      <span>{sub.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
              Target Examination Date
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
              Daily Available Study Hours
            </label>
            <select
              value={dailyHours}
              onChange={(e) => setDailyHours(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-500"
            >
              <option value={2}>2 Hours / Day</option>
              <option value={4}>4 Hours / Day (Recommended)</option>
              <option value={6}>6 Hours / Day</option>
              <option value={8}>8+ Hours / Day (Intensive Sprint)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
              Preferred Study Slot
            </label>
            <select
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="Early Morning">Early Morning (5am - 9am)</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening (6pm - 10pm)</option>
              <option value="Night Owl">Night Owl (10pm - 2am)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
              Current Preparation Level
            </label>
            <select
              value={prepLevel}
              onChange={(e) => setPrepLevel(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="Beginner">Beginner (Starting from scratch)</option>
              <option value="Intermediate">Intermediate (Basic concept familiarity)</option>
              <option value="Revision Ready">Revision Ready (Practicing PYQs)</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-end pt-2 w-full">
          <button
            onClick={handleGeneratePlan}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 w-full sm:w-auto text-center cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Sparkles className="w-4 h-4 shrink-0" />}
            <span>
              {loading
                ? 'Synthesizing Semester Roadmap...'
                : planScope === 'semester'
                ? 'Generate Entire Semester Plan'
                : 'Generate Custom Plan'}
            </span>
          </button>
        </div>
      </div>

      {/* Generated Schedule View */}
      {studyPlan && (
        <div className="space-y-6">
          {/* Header Summary & Progress Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {studyPlan.plan_title || 'Semester Examination Roadmap'}
                </span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                  Preparation Progress: {completedCount} / {totalDays} Milestones Completed ({progressPercent}%)
                </h3>
              </div>

              {/* Progress Bar */}
              <div className="w-full sm:w-64 space-y-1.5">
                <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-gray-400 font-medium">
                  <span>Start</span>
                  <span>Exam Day</span>
                </div>
              </div>
            </div>

            {/* Strategy Overview */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
              <strong className="text-indigo-950 dark:text-indigo-200 block mb-1">
                Strategy & Subject Rotation Plan:
              </strong>
              {studyPlan.strategy_overview}
            </div>

            {/* Included Subjects Chips */}
            {studyPlan.subjects_included?.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                <span className="text-gray-400 font-semibold">Subjects Scheduled:</span>
                {studyPlan.subjects_included.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[11px] font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Daily Schedule Timeline List */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-indigo-500" />
              <span>Daily Study Schedule & Rotation</span>
            </h3>

            {studyPlan.daily_schedule?.map((item, idx) => {
              const taskId = `day_${item.day || idx + 1}`;
              const isDone = !!completedTasks[taskId];

              return (
                <div
                  key={idx}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                    isDone
                      ? 'border-emerald-200 bg-emerald-50/30 dark:bg-emerald-950/10 dark:border-emerald-900'
                      : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]'
                  }`}
                >
                  <button
                    onClick={() => toggleTask(taskId)}
                    className={`p-1 rounded-lg shrink-0 transition-colors mt-0.5 print:hidden ${
                      isDone
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                    title={isDone ? 'Mark as incomplete' : 'Mark as completed'}
                  >
                    <CheckCircle2 className="w-6 h-6" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                          Day {item.day || idx + 1}
                        </span>
                        {item.date && (
                          <span className="text-xs text-gray-400 font-mono">
                            • {item.date}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300">
                          {item.session_type || 'Study Session'}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Target: {item.target_hours || dailyHours} Hours
                      </span>
                    </div>

                    <h4
                      className={`text-sm font-bold text-gray-900 dark:text-gray-100 ${
                        isDone ? 'line-through text-gray-400' : ''
                      }`}
                    >
                      {item.subject}
                    </h4>

                    {item.topics?.length > 0 && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        <strong>Focus Topics:</strong> {item.topics.join(', ')}
                      </p>
                    )}

                    {item.tips && (
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 italic mt-1.5 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>Study Tip: {item.tips}</span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Final Revision Checklist */}
          {studyPlan.final_revision_checklist?.length > 0 && (
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 shadow-xs space-y-3">
              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-500" />
                <span>Pre-Exam Revision Checklist</span>
              </h4>
              <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                {studyPlan.final_revision_checklist.map((chk, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{chk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
