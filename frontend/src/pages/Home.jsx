import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Mic,
  Bot,
  FileCheck2,
  Zap,
  TrendingUp,
  ArrowRight,
  FileText,
  BookOpen,
} from 'lucide-react';
import { publicApi } from '../lib/api';
import useAppStore from '../store/appStore';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Home() {
  const { selectedCourse, selectedSemester, setSelectedCourse } = useAppStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCourseTab, setActiveCourseTab] = useState(selectedCourse?.code || 'BMC');

  useEffect(() => {
    if (selectedCourse?.code) {
      setActiveCourseTab(selectedCourse.code);
    }
  }, [selectedCourse]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await publicApi.getStats(
          selectedCourse ? { course_id: selectedCourse._id || selectedCourse.code } : {}
        );

        if (res.data?.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Dashboard data load failed:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedCourse]);

  if (loading && !stats) {
    return <LoadingSpinner text="Loading Examination Desk..." fullPage />;
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 pb-8 select-none">
      {/* 1. Calm Exam Desk Header Banner (Clean, Academic, English-Only) */}
      <div className="relative overflow-hidden rounded-3xl bg-gray-950 dark:bg-black text-white p-5 sm:p-8 shadow-xl border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-gray-200 text-xs font-semibold border border-white/15 backdrop-blur-xs">
            <GraduationCap className="w-3.5 h-3.5 text-white" />
            <span>{selectedCourse ? `${selectedCourse.code} • ${selectedSemester?.name || 'Semester'}` : 'Exam Desk'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-gray-300 font-bold">Active Academic Scope</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Prepare for Your University Examinations.
          </h1>

          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
            Syllabus-grounded question papers, 15-mark model answers, and interactive oral viva voce  all in one centralized preparation desk.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              to="/viva"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-black font-extrabold text-xs shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <Mic className="w-4 h-4 text-black" />
              <span>AI Viva Room</span>
              <span className="px-1 py-0.2 rounded text-[8px] font-black bg-black text-white">LIVE</span>
            </Link>

            <Link
              to="/mentor"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs border border-neutral-700 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Bot className="w-4 h-4 text-neutral-300" />
              <span>Ask AI Mentor</span>
            </Link>

            <Link
              to="/predictions"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs border border-neutral-700 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4 text-neutral-300" />
              <span>5-Year Final Paper</span>
            </Link>
          </div>
        </div>

        {/* Quick Statistics Ribbon in Header */}
        <div className="grid grid-cols-3 md:grid-cols-1 gap-2.5 w-full md:w-44 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-white/10 md:pl-6 text-center md:text-left">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Subjects</p>
            <p className="text-lg sm:text-xl font-extrabold text-white">{stats?.total_subjects || 0}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">PYQ Papers</p>
            <p className="text-lg sm:text-xl font-extrabold text-white">{stats?.total_papers || 0}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Top Topics</p>
            <p className="text-lg sm:text-xl font-extrabold text-white">{stats?.total_topics || 0}</p>
          </div>
        </div>
      </div>

      {/* 2. THE 3-STEP EXAM PREPARATION WORKFLOW (Academic English, Clean Icons, Zero Emojis) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-950 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              3-Step Examination Preparation Workflow
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              A structured preparation methodology: analyze recurring trends, learn model answers, and verify retention.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* STEP 1: What to Study */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
                  Step 1 • High-Yield Questions
                </span>
                <span className="text-[11px] font-bold text-gray-400">Past 5 Years</span>
              </div>
              <h3 className="font-extrabold text-base text-gray-950 dark:text-white mb-1.5 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>5-Year Final Exam Paper & Topics</span>
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Curated high-probability questions and syllabus topics recurring consistently across 5-year university archives.
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <Link
                to="/predictions"
                className="w-full inline-flex items-center justify-between py-2 px-3 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black transition-all cursor-pointer shadow-xs"
              >
                <span>Open 5-Year Final Paper</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/topics"
                className="w-full inline-flex items-center justify-center py-1.5 px-3 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Important Topics List →
              </Link>
            </div>
          </div>

          {/* STEP 2: How to Write */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                  Step 2 • Model Answers
                </span>
                <span className="text-[11px] font-bold text-gray-400">Scoring Format</span>
              </div>
              <h3 className="font-extrabold text-base text-gray-950 dark:text-white mb-1.5 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Model Answers & 1-Page Revision</span>
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Master 2, 5, 10, and 15-mark answers structured with technical headings, architectural diagrams, and mark distribution.
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <Link
                to="/mentor"
                className="w-full inline-flex items-center justify-between py-2 px-3 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black transition-all cursor-pointer shadow-xs"
              >
                <span>Ask AI Mentor a Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/revision"
                className="w-full inline-flex items-center justify-center py-1.5 px-3 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                1-Page Quick Cheatsheet →
              </Link>
            </div>
          </div>

          {/* STEP 3: Test Readiness */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900">
                  Step 3 • Test Readiness
                </span>
                <span className="text-[11px] font-bold text-gray-400">Zero Typing</span>
              </div>
              <h3 className="font-extrabold text-base text-gray-950 dark:text-white mb-1.5 flex items-center gap-2">
                <Mic className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span>Oral Viva Voce & Timed Mock Exam</span>
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Simulate authentic oral examinations with the AI External Examiner and receive an immediate conceptual report card.
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <Link
                to="/viva"
                className="w-full inline-flex items-center justify-between py-2 px-3 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black transition-all cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5" />
                  <span>Start Oral Viva Room</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/tests"
                className="w-full inline-flex items-center justify-center py-1.5 px-3 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Take Timed Mock Test →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. My Subjects (Streamlined, Pure English, Lucide Icons) */}
      {stats?.courses_breakdown && stats.courses_breakdown.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-base font-bold text-gray-950 dark:text-white">
                  Curriculum Subjects & Papers
                </h2>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Select a subject to access previous year papers, unit syllabus, or oral viva simulation.
              </p>
            </div>

            {/* Course Selector Tabs if multiple */}
            {stats.courses_breakdown.length > 1 && (
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 self-start sm:self-auto">
                {stats.courses_breakdown.map((cb) => {
                  const isActive = activeCourseTab.toUpperCase() === cb.course_code.toUpperCase();
                  return (
                    <button
                      key={cb.course_code}
                      onClick={() => setActiveCourseTab(cb.course_code)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${isActive
                          ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                    >
                      {cb.course_code}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Course Subject Cards Grid */}
          {(() => {
            const currentCourseData =
              stats.courses_breakdown.find(
                (cb) => cb.course_code.toUpperCase() === activeCourseTab.toUpperCase()
              ) || stats.courses_breakdown[0];

            if (!currentCourseData) return null;

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentCourseData.subjects?.map((sub) => {
                  const hasPapers = sub.papers_count > 0;
                  return (
                    <div
                      key={sub._id || sub.code}
                      className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-1 mb-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-gray-200/70 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                            {sub.code}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${hasPapers
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                              }`}
                          >
                            {sub.papers_count} {sub.papers_count === 1 ? 'Paper' : 'Papers'}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-gray-950 dark:text-white line-clamp-2 leading-snug pt-1">
                          {sub.name}
                        </h4>
                      </div>

                      <div className="pt-2.5 border-t border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between text-xs font-bold">
                        <Link
                          to={`/library?subject=${sub._id}`}
                          className="inline-flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Papers</span>
                        </Link>
                        <div className="flex items-center gap-3">
                          <Link
                            to="/viva"
                            className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            <Mic className="w-3.5 h-3.5" />
                            <span>Viva</span>
                          </Link>
                          <Link
                            to={`/mentor?subjectId=${sub._id}`}
                            className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            <Bot className="w-3.5 h-3.5" />
                            <span>Mentor</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

    </div>
  );
}
