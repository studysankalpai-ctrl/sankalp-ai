import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  FolderTree,
  Star,
  FileQuestion,
  TrendingUp,
  ArrowRight,
  Clock,
  Layers,
  GraduationCap,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  Bot,
  Printer,
  FileCheck2,
  PenTool,
} from 'lucide-react';
import { publicApi } from '../lib/api';
import useAppStore from '../store/appStore';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Home() {
  const { selectedCourse, selectedSemester, setSelectedCourse } = useAppStore();
  const [stats, setStats] = useState(null);
  const [importantTopics, setImportantTopics] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
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
        const [statsRes, topicsRes] = await Promise.all([
          publicApi.getStats(
            selectedCourse ? { course_id: selectedCourse._id || selectedCourse.code } : {}
          ),
          publicApi.getTopics(),
        ]);

        if (statsRes.data?.success) {
          setStats(statsRes.data.data);
        }
        if (topicsRes.data?.success) {
          setImportantTopics(topicsRes.data.data.slice(0, 4));
        }

        // Load local study history
        const savedHistory = JSON.parse(localStorage.getItem('sankalp_study_history') || '[]');
        setRecentActivity(savedHistory.slice(0, 3));
      } catch (err) {
        console.error('Dashboard data load failed:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedCourse]);

  if (loading && !stats) {
    return <LoadingSpinner text="Loading SANKALP AI Dashboard..." fullPage />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Hero Card (Clean Black & White / Minimalist Academic) */}
      <div className="relative overflow-hidden rounded-3xl bg-gray-950 dark:bg-black text-white p-5 sm:p-10 shadow-2xl border border-gray-800 dark:border-gray-800 flex items-center justify-between">
        <div className="relative z-10 max-w-2xl w-full">

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white mb-3 sm:mb-4">
            Prepare for University Exams with SANKALP AI.
          </h1>

          <p className="text-gray-300 text-xs sm:text-base leading-relaxed mb-6 sm:mb-8">
            Study past 5-year question papers, get structured 2, 5, 10, or 15-mark model answers, and generate your printable final exam preparation paper.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
            <Link
              to="/mentor"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-gray-100 text-gray-950 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto text-center"
            >
              <Bot className="w-4 h-4 text-gray-950 shrink-0" />
              Ask AI Exam Mentor
            </Link>
            <Link
              to="/predictions"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gray-900 hover:bg-gray-850 text-white font-bold text-xs sm:text-sm border border-gray-700 transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto text-center"
            >
              <FileCheck2 className="w-4 h-4 text-gray-300 shrink-0" />
              5-Year Final Paper
            </Link>
            <Link
              to="/library"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-transparent hover:bg-white/5 text-gray-300 hover:text-white font-semibold text-xs sm:text-sm transition-all w-full sm:w-auto text-center"
            >
              <FolderTree className="w-4 h-4 text-gray-400 shrink-0" />
              Papers & Syllabus
            </Link>
          </div>
        </div>

        {/* Brand Logo Display on Desktop */}
        <div className="hidden lg:flex items-center justify-center shrink-0 w-44 h-44 opacity-95 p-2">
          <img
            src="/Logo.png"
            alt="SANKALP AI"
            className="w-full h-full object-contain filter drop-shadow-2xl"
          />
        </div>
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-xs flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 flex items-center justify-center shrink-0 font-bold text-sm">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Course & Sem</p>
            <p className="text-xs sm:text-base font-bold text-gray-900 dark:text-gray-100 truncate">
              {selectedCourse ? `${selectedCourse.code} • ${selectedSemester?.name || 'Sem 1'}` : 'Select Course'}
            </p>
            <p className="text-[10px] text-gray-400 truncate mt-0.5">Active Academic Scope</p>
          </div>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-xs flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Subjects {selectedCourse ? `(${selectedCourse.code})` : ''}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{stats?.total_subjects || 0}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {stats?.filtered_course ? `in ${stats.filtered_course.code} curriculum` : 'Active Subjects'}
            </p>
          </div>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-xs flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <FileQuestion className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Past Papers {selectedCourse ? `(${selectedCourse.code})` : ''}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{stats?.total_papers || 0}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {stats?.filtered_course ? `in ${stats.filtered_course.code} archives` : 'Available Papers'}
            </p>
          </div>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-xs flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Topics</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{stats?.total_topics || 0}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">High Probability</p>
          </div>
        </div>
      </div>

      {/* Subject-Wise Past Paper Distribution Breakdown (BMC vs BMB) */}
      {stats?.courses_breakdown && stats.courses_breakdown.length > 0 && (
        <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                  Subject-Wise Question Paper Distribution
                </h2>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Breakdown of past university examination papers available per subject.
              </p>
            </div>

            {/* Course Selector Tabs: BMC vs BMB */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 self-start sm:self-auto">
              {stats.courses_breakdown.map((cb) => {
                const isActive = activeCourseTab.toUpperCase() === cb.course_code.toUpperCase();
                return (
                  <button
                    key={cb.course_code}
                    onClick={() => setActiveCourseTab(cb.course_code)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <span>{cb.course_code}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                        cb.total_papers > 0
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {cb.total_papers} Papers
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Course Subject Cards Grid */}
          {(() => {
            const currentCourseData =
              stats.courses_breakdown.find(
                (cb) => cb.course_code.toUpperCase() === activeCourseTab.toUpperCase()
              ) || stats.courses_breakdown[0];

            if (!currentCourseData) return null;

            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
                  <span>
                    Showing <strong>{currentCourseData.subjects?.length || 0} subjects</strong> for{' '}
                    <strong className="text-gray-900 dark:text-gray-100">
                      {currentCourseData.course_name} ({currentCourseData.course_code})
                    </strong>
                  </span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    Total: {currentCourseData.total_papers} Papers
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {currentCourseData.subjects?.map((sub) => {
                    const hasPapers = sub.papers_count > 0;
                    return (
                      <div
                        key={sub._id || sub.code}
                        className="p-3.5 sm:p-4 rounded-2xl bg-gray-50 dark:bg-[#0c1222] border border-gray-200 dark:border-gray-800/80 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col justify-between group"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                              {sub.code}
                            </span>
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                hasPapers
                                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                              }`}
                            >
                              <FileQuestion className="w-3 h-3" />
                              {sub.papers_count} {sub.papers_count === 1 ? 'Paper' : 'Papers'}
                            </span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug">
                            {sub.name}
                          </h4>
                        </div>

                        <div className="pt-3 mt-2 border-t border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between">
                          <Link
                            to={`/library?subject=${sub._id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            <span>Browse Papers</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                          <Link
                            to="/predictions"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                          >
                            <span>Synthesize Paper</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Main Study Actions (What do you want to study today?) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Exam Study Features
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Choose an action below to start preparing for your upcoming university exams.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: AI Mentor */}
          <Link
            to="/mentor"
            className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-1.5">
                AI Exam Mentor
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">AI</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                Ask any question from your syllabus. Get model answers formatted for 2, 5, 10, or 15 marks.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:gap-2 transition-all">
              Start Chatting <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Card 2: 5-Year Final Paper */}
          <Link
            to="/predictions"
            className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 hover:border-gray-900 dark:hover:border-gray-100 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-1.5">
                5-Year Final Paper
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">PDF</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                Generate the most probable final exam paper synthesized from past 5 years. Download or print PDF.
              </p>
            </div>
            <span className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1 group-hover:gap-2 transition-all">
              Generate Paper <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Card 3: Important Topics */}
          <Link
            to="/topics"
            className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 hover:border-amber-400 dark:hover:border-amber-600 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Star className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-1">
                Important Topics
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                See topics that repeat repeatedly in past papers. Study high-probability questions first.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 group-hover:gap-2 transition-all">
              View Topics <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Card 4: Papers & Syllabus */}
          <Link
            to="/library"
            className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-600 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <FolderTree className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-1">
                Papers & Syllabus
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                Open syllabus PDFs, download official previous year question papers, and study unit outlines.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:gap-2 transition-all">
              Browse Files <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      </div>

      {/* 2-Column Section: Continue Learning & High-Priority Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Continue Learning */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" /> Recent Questions
              </h2>
              <Link to="/mentor" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Open AI Mentor
              </Link>
            </div>

            {recentActivity.length === 0 ? (
              <div className="py-8 text-center text-gray-400 flex flex-col items-center">
                <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-2">
                  <Bookmark className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">No questions asked yet</p>
                <p className="text-[11px] text-gray-500 max-w-xs mt-1">
                  Ask the AI Mentor any question from your curriculum. Your question history will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentActivity.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                    <div className="min-w-0 pr-3">
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{item.title}</p>
                      <p className="text-[11px] text-gray-500">{item.subtitle}</p>
                    </div>
                    <Link to={item.link} className="p-1.5 text-indigo-600 hover:bg-white dark:hover:bg-gray-700 rounded-lg shrink-0">
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Link
              to="/mentor"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
            >
              Ask AI Mentor a Question
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* High-Priority Important Topics Preview */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" /> High-Priority Topics
              </h2>
              <Link to="/topics" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                View All ({importantTopics.length})
              </Link>
            </div>

            {importantTopics.length === 0 ? (
              <div className="py-8 text-center text-gray-400 flex flex-col items-center">
                <Star className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-xs font-semibold">No important topics loaded yet</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Click Important Topics to run AI frequency analysis.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {importantTopics.map((topic) => (
                  <div
                    key={topic._id}
                    className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                          {topic.topic_name}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 shrink-0">
                          {topic.historical_appearances}x in Papers
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 line-clamp-1">{topic.why_important}</p>
                    </div>

                    <Link
                      to={`/mentor?topic=${encodeURIComponent(topic.topic_name)}`}
                      className="shrink-0 p-1.5 rounded-lg bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-2xs hover:bg-indigo-50 transition-colors"
                      title="Learn model answer with SANKALP AI"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Link
              to="/topics"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Explore All Important Exam Topics
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4-Step University Exam Preparation Guide */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-xs">
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> How to Prepare for Your University Exam
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          Follow these 4 simple steps to score top marks in your semester exams:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
                Step 1
              </span>
              <p className="font-bold text-xs text-gray-900 dark:text-gray-100 mb-1">Know the Syllabus</p>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Check unit outlines and past question papers in Papers & Syllabus.
              </p>
            </div>
            <Link to="/library" className="mt-3 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              View Papers →
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1">
                Step 2
              </span>
              <p className="font-bold text-xs text-gray-900 dark:text-gray-100 mb-1">Focus on Repeated Topics</p>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Check Important Topics to see which questions repeat most often.
              </p>
            </div>
            <Link to="/topics" className="mt-3 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline">
              Check Topics →
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                Step 3
              </span>
              <p className="font-bold text-xs text-gray-900 dark:text-gray-100 mb-1">Learn 10-Mark Model Answers</p>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Ask AI Mentor to explain concepts with headings, diagrams, and exam scoring points.
              </p>
            </div>
            <Link to="/mentor" className="mt-3 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
              Ask AI Mentor →
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block mb-1">
                Step 4
              </span>
              <p className="font-bold text-xs text-gray-900 dark:text-gray-100 mb-1">Solve 5-Year Final Paper</p>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Generate the 5-Year Master Final Paper, print the PDF, and write answers under exam time.
              </p>
            </div>
            <Link to="/predictions" className="mt-3 text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline">
              Get Final Paper →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
