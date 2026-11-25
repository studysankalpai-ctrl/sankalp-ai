import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Tag,
  ChevronRight,
  TrendingUp,
  Award,
} from 'lucide-react';

const TOPICS = [
  'All',
  'Arrays',
  'Strings',
  'Searching',
  'Sorting',
  'Recursion',
  'Linked Lists',
  'Stacks',
  'Queues',
  'Hashing',
  'Trees',
  'Binary Search Trees',
  'Graphs',
  'Dynamic Programming',
  'Greedy Algorithms',
];

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

export default function ProblemListModal({
  isOpen,
  onClose,
  problems = [],
  solvedProblemIds = [],
  attemptedProblemIds = [],
  selectedProblemSlug,
  onSelectProblem,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Solved', 'Unsolved'

  const solvedSet = useMemo(() => {
    return new Set(
      (solvedProblemIds || []).map((item) =>
        item && typeof item === 'object' && item._id ? item._id.toString() : item?.toString()
      ).filter(Boolean)
    );
  }, [solvedProblemIds]);

  const attemptedSet = useMemo(() => {
    return new Set(
      (attemptedProblemIds || []).map((item) =>
        item && typeof item === 'object' && item._id ? item._id.toString() : item?.toString()
      ).filter(Boolean)
    );
  }, [attemptedProblemIds]);

  const filteredProblems = useMemo(() => {
    return problems.filter((prob) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = prob.title?.toLowerCase().includes(query);
        const matchesTopic = prob.topic?.toLowerCase().includes(query);
        const matchesTags = prob.tags?.some((t) => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesTopic && !matchesTags) return false;
      }

      // Topic filter (supports exact topic, tags, and common DSA aliases)
      if (selectedTopic !== 'All') {
        const topicNorm = selectedTopic.toLowerCase();
        const probTopicNorm = (prob.topic || '').toLowerCase();
        const matchesMainTopic = probTopicNorm === topicNorm;
        const matchesTags = (prob.tags || []).some((tag) => {
          const t = tag.toLowerCase();
          return t === topicNorm || t.includes(topicNorm) || topicNorm.includes(t);
        });
        const isHashingMatch = topicNorm.includes('hash') && (probTopicNorm.includes('hash') || (prob.tags || []).some(t => t.toLowerCase().includes('hash')));
        const isBstMatch = (topicNorm.includes('bst') || topicNorm.includes('binary search tree')) && (probTopicNorm.includes('tree') || (prob.tags || []).some(t => t.toLowerCase().includes('bst') || t.toLowerCase().includes('tree')));
        const isDpMatch = (topicNorm.includes('dynamic') || topicNorm === 'dp') && (probTopicNorm.includes('dynamic') || (prob.tags || []).some(t => t.toLowerCase().includes('dp')));
        const isLinkedListMatch = topicNorm.includes('linked') && (probTopicNorm.includes('linked') || (prob.tags || []).some(t => t.toLowerCase().includes('linked')));

        if (!matchesMainTopic && !matchesTags && !isHashingMatch && !isBstMatch && !isDpMatch && !isLinkedListMatch) {
          return false;
        }
      }

      // Difficulty filter
      if (selectedDifficulty !== 'All' && prob.difficulty !== selectedDifficulty) {
        return false;
      }

      // Status filter
      if (statusFilter === 'Solved' && !solvedSet.has(prob._id)) return false;
      if (statusFilter === 'Unsolved' && solvedSet.has(prob._id)) return false;

      return true;
    });
  }, [problems, searchQuery, selectedTopic, selectedDifficulty, statusFilter, solvedSet]);

  if (!isOpen) return null;

  const diffColors = {
    Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60',
    Hard: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800/60',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[85vh] bg-white dark:bg-[#0d0d0d] border border-gray-200 dark:border-neutral-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gray-50 dark:bg-[#121212] border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              DSA Problem Catalog
            </h2>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
              Practice data structures & algorithms from Easy to Hard with real test execution
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-200 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-gray-50/70 dark:bg-[#101010] border-b border-gray-200 dark:border-neutral-800/80 space-y-3 shrink-0">
          {/* Top row: search + difficulty + status */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-gray-400 dark:text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search problems by name or tag (e.g. Two Sum, Arrays)..."
                className="w-full bg-white dark:bg-[#181818] border border-gray-200 dark:border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs text-gray-900 dark:text-neutral-200 placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:border-indigo-500/70 shadow-2xs"
              />
            </div>

            {/* Difficulty Tabs */}
            <div className="flex items-center gap-1 bg-gray-200/70 dark:bg-[#181818] p-1 rounded-lg border border-gray-200 dark:border-neutral-800 shrink-0">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    selectedDifficulty === diff
                      ? 'bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-2xs'
                      : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1 bg-gray-200/70 dark:bg-[#181818] p-1 rounded-lg border border-gray-200 dark:border-neutral-800 shrink-0">
              {['All', 'Solved', 'Unsolved'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    statusFilter === st
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {TOPICS.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => setSelectedTopic(topic)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors border ${
                  selectedTopic === topic
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/60'
                    : 'bg-white dark:bg-[#181818] text-gray-600 dark:text-neutral-400 border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700 hover:text-gray-900 dark:hover:text-neutral-200 shadow-2xs'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Problems List Table / Cards */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredProblems.length === 0 ? (
            <div className="py-16 text-center text-gray-400 dark:text-neutral-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-neutral-600 stroke-1" />
              <p className="text-xs font-medium text-gray-700 dark:text-neutral-400">No matching DSA questions found.</p>
              <p className="text-[11px] text-gray-400 dark:text-neutral-600 mt-1">
                Try selecting "All" topics or clearing your search filter.
              </p>
            </div>
          ) : (
            filteredProblems.map((prob) => {
              const isSolved = solvedSet.has(prob._id);
              const isAttempted = attemptedSet.has(prob._id);
              const isCurrent = prob.slug === selectedProblemSlug;

              return (
                <div
                  key={prob._id}
                  onClick={() => {
                    onSelectProblem(prob);
                    onClose();
                  }}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-700/60 shadow-xs'
                      : 'bg-white dark:bg-[#121212] border-gray-200 dark:border-neutral-800/80 hover:border-gray-300 dark:hover:border-neutral-700 hover:bg-gray-50 dark:hover:bg-[#161616]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Solved Status Indicator */}
                    <div className="shrink-0">
                      {isSolved ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                      ) : isAttempted ? (
                        <Circle className="w-5 h-5 text-amber-500 dark:text-amber-400 fill-amber-400/20" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 dark:text-neutral-600" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
                          {prob.title}
                        </h4>
                        {isCurrent && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-mono border border-indigo-200 dark:border-transparent">
                            active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500 dark:text-neutral-400">
                        <span>{prob.topic}</span>
                        {prob.acceptanceRate !== undefined && (
                          <>
                            <span>•</span>
                            <span className="text-gray-400 dark:text-neutral-500">
                              Acceptance: {prob.acceptanceRate || 0}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        diffColors[prob.difficulty] || 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300'
                      }`}
                    >
                      {prob.difficulty}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400 dark:text-neutral-500" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-gray-50 dark:bg-[#121212] border-t border-gray-200 dark:border-neutral-800 flex items-center justify-between text-xs text-gray-600 dark:text-neutral-400 px-4 shrink-0">
          <span>
            Showing <strong className="text-gray-900 dark:text-white">{filteredProblems.length}</strong> of{' '}
            <strong className="text-gray-900 dark:text-white">{problems.length}</strong> questions
          </span>
          <span className="text-[11px] text-gray-500 dark:text-neutral-500">
            Solved: <strong className="text-emerald-600 dark:text-emerald-400">{solvedProblemIds.length}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
