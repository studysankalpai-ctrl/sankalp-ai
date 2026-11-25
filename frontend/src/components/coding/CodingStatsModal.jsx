import React, { useState, useEffect } from 'react';
import {
  X,
  Flame,
  Award,
  CheckCircle2,
  TrendingUp,
  Clock,
  Layers,
  Code2,
  BookOpen,
  Calendar,
  Zap,
} from 'lucide-react';
import { codingApi } from '../../lib/api';

export default function CodingStatsModal({
  isOpen,
  onClose,
  studentId,
}) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    if (isOpen && studentId) {
      fetchData();
    }
  }, [isOpen, studentId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [progRes, subRes] = await Promise.all([
        codingApi.getProgress(studentId),
        codingApi.getSubmissions({ studentId, limit: 10 }),
      ]);

      if (progRes.data?.success) {
        setProgress(progRes.data.data.progress);
      }
      if (subRes.data?.success) {
        setSubmissions(subRes.data.data.submissions || []);
      }
    } catch (err) {
      console.error('Failed to fetch coding stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentStreak = progress?.currentStreak ?? progress?.current_streak ?? 0;
  const longestStreak = progress?.longestStreak ?? progress?.longest_streak ?? 0;
  const solvedCount =
    progress?.totalSolved ??
    progress?.total_solved ??
    (progress?.solved_problem_ids?.length || progress?.problemsSolved?.length || 0);
  const attemptedCount =
    progress?.totalAttempted ??
    progress?.total_attempted ??
    (progress?.attempted_problem_ids?.length || progress?.problemsAttempted?.length || 0);
  const totalSubmissions = progress?.totalSubmissions ?? progress?.total_submissions ?? 0;
  const acceptedSubmissions = progress?.acceptedSubmissions ?? progress?.accepted_submissions ?? 0;
  const acceptanceRate =
    totalSubmissions > 0
      ? Math.round((acceptedSubmissions / totalSubmissions) * 100)
      : (progress?.acceptance_rate ?? progress?.acceptanceRate ?? 0);

  const difficultyStats = progress?.difficultyStats || {
    easy: progress?.easy_solved || 0,
    medium: progress?.medium_solved || 0,
    hard: progress?.hard_solved || 0,
  };

  const languageStats = progress?.languageStats || progress?.language_stats || {};
  const topicStats = progress?.topicStats || progress?.topic_stats || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 dark:bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-[#0d0d0d] border border-gray-200 dark:border-neutral-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gray-50 dark:bg-[#121212] border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-700/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                Coding Performance & Progress
              </h2>
              <p className="text-xs text-gray-500 dark:text-neutral-400">
                Track your streak, problem mastery, and submission statistics
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-200 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {loading ? (
            <div className="py-16 text-center text-gray-500 dark:text-neutral-500">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs">Loading your coding stats...</p>
            </div>
          ) : (
            <>
              {/* Top Highlights Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Streak Card */}
                <div className="bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-neutral-800 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs">
                  <div className="flex items-center justify-between text-gray-500 dark:text-neutral-400 text-xs">
                    <span>Streak</span>
                    <Flame className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white font-mono">{currentStreak}</span>
                    <span className="text-xs text-gray-500 dark:text-neutral-500 ml-1">days</span>
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-neutral-500 mt-1">Best: {longestStreak} days</p>
                </div>

                {/* Solved Card */}
                <div className="bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-neutral-800 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs">
                  <div className="flex items-center justify-between text-gray-500 dark:text-neutral-400 text-xs">
                    <span>Problems Solved</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {solvedCount}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-neutral-500 ml-1">solved</span>
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-neutral-500 mt-1">
                    Attempted: {attemptedCount}
                  </p>
                </div>

                {/* Submissions Card */}
                <div className="bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-neutral-800 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs">
                  <div className="flex items-center justify-between text-gray-500 dark:text-neutral-400 text-xs">
                    <span>Submissions</span>
                    <Code2 className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white font-mono">
                      {totalSubmissions}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-neutral-500 ml-1">runs</span>
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-neutral-500 mt-1">
                    Accepted: {acceptedSubmissions}
                  </p>
                </div>

                {/* Acceptance Rate Card */}
                <div className="bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-neutral-800 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs">
                  <div className="flex items-center justify-between text-gray-500 dark:text-neutral-400 text-xs">
                    <span>Acceptance</span>
                    <TrendingUp className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-300 font-mono">
                      {acceptanceRate}%
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-neutral-500 mt-1">Passing ratio</p>
                </div>
              </div>

              {/* Difficulty Breakdown */}
              <div className="bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-neutral-800 rounded-xl p-4 space-y-3 shadow-2xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-neutral-300 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  Difficulty Breakdown
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-center">
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block">Easy</span>
                    <span className="text-xl font-bold font-mono text-gray-900 dark:text-white mt-1 block">
                      {difficultyStats.easy || 0}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-center">
                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 block">Medium</span>
                    <span className="text-xl font-bold font-mono text-gray-900 dark:text-white mt-1 block">
                      {difficultyStats.medium || 0}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-center">
                    <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 block">Hard</span>
                    <span className="text-xl font-bold font-mono text-gray-900 dark:text-white mt-1 block">
                      {difficultyStats.hard || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Languages & Topics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Language Usage */}
                <div className="bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-neutral-800 rounded-xl p-4 space-y-3 shadow-2xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-neutral-300">
                    Language Usage
                  </h3>
                  {Object.keys(languageStats).length === 0 ? (
                    <p className="text-xs text-gray-400 dark:text-neutral-500 italic">No language data recorded yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(languageStats).map(([lang, val]) => {
                        const solvedNum = typeof val === 'object' && val !== null ? (val.solved ?? 0) : Number(val) || 0;
                        return (
                          <div key={lang} className="flex items-center justify-between text-xs">
                            <span className="font-mono text-gray-700 dark:text-neutral-300 uppercase">{lang}</span>
                            <span className="text-gray-500 dark:text-neutral-400 font-mono">{solvedNum} solved</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Topic Progress */}
                <div className="bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-neutral-800 rounded-xl p-4 space-y-3 shadow-2xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-neutral-300">
                    Topic Mastery
                  </h3>
                  {Object.keys(topicStats).length === 0 ? (
                    <p className="text-xs text-gray-400 dark:text-neutral-500 italic">No topic data recorded yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(topicStats).map(([topic, val]) => {
                        const solvedNum = typeof val === 'object' && val !== null ? (val.solved ?? 0) : Number(val) || 0;
                        return (
                          <div key={topic} className="flex items-center justify-between text-xs">
                            <span className="text-gray-700 dark:text-neutral-300">{topic}</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-mono font-medium">{solvedNum} solved</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Submissions */}
              <div className="bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-neutral-800 rounded-xl p-4 space-y-3 shadow-2xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-neutral-300 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  Recent Submissions
                </h3>

                {submissions.length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-neutral-500 italic py-2">
                    No submissions recorded yet. Solve a problem to see your history!
                  </p>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-neutral-800/80">
                    {submissions.map((sub) => {
                      const isAcc = sub.status === 'Accepted';
                      return (
                        <div
                          key={sub._id}
                          className="py-2.5 flex items-center justify-between text-xs first:pt-0 last:pb-0"
                        >
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                              <span>{sub.problemTitle || 'DSA Problem'}</span>
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                                  isAcc
                                    ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                                    : 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
                                }`}
                              >
                                {sub.status}
                              </span>
                            </div>
                            <div className="text-[11px] text-gray-500 dark:text-neutral-500 mt-0.5 flex items-center gap-2 font-mono">
                              <span className="uppercase">{sub.language}</span>
                              {sub.executionTime && <span>• {sub.executionTime}</span>}
                            </div>
                          </div>

                          <span className="text-[11px] text-gray-400 dark:text-neutral-500">
                            {new Date(sub.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
