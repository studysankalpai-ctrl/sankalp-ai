import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Star,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  Award,
  Filter,
  ArrowRight,
  TrendingUp,
  Loader2,
  RefreshCw,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { publicApi, aiApi } from '../lib/api';
import useAppStore from '../store/appStore';
import { PRIORITY_CONFIG } from '../lib/constants';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import PageHeader from '../components/common/PageHeader';
import toast from 'react-hot-toast';

export default function Topics() {
  const [searchParams] = useSearchParams();
  const urlSubjectId = searchParams.get('subjectId');
  const { selectedCourse, selectedSemester, selectedSubject, setSelectedSubject, groqApiKey, groqModel, isAiConnected } = useAppStore();

  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [filterPriority, setFilterPriority] = useState('all');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Load subjects
  useEffect(() => {
    async function loadSubjects() {
      if (!selectedSemester) return;
      try {
        const res = await publicApi.getSubjects(selectedSemester._id);
        if (res.data?.success) {
          setSubjects(res.data.data);
          if (urlSubjectId) {
            const found = res.data.data.find((s) => s._id === urlSubjectId);
            if (found) setSelectedSubject(found);
          } else if (!selectedSubject && res.data.data.length > 0) {
            setSelectedSubject(res.data.data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      }
    }
    loadSubjects();
  }, [selectedSemester, urlSubjectId, setSelectedSubject, selectedSubject]);

  // Load topics
  const loadTopics = async () => {
    if (!selectedSubject) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await publicApi.getTopics(selectedSubject._id);
      if (res.data?.success) {
        setTopics(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load topics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopics();
  }, [selectedSubject]);

  const handleGenerateTopics = async () => {
    if (!isAiConnected) {
      toast.error('Connect your API key in Settings to analyze topics with SANKALP AI');
      return;
    }
    if (!selectedSubject) {
      toast.error('Please select a subject to analyze');
      return;
    }

    setGenerating(true);
    try {
      const res = await aiApi.generateTopics({
        subjectId: selectedSubject._id,
        apiKey: groqApiKey,
        model: groqModel,
      });

      if (res.data?.success && res.data.data) {
        setTopics(res.data.data);
        toast.success(`Generated ${res.data.data.length} prioritized topics for ${selectedSubject.name}!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to generate topics');
    } finally {
      setGenerating(false);
    }
  };

  const filteredTopics = topics.filter((t) => {
    if (filterPriority === 'all') return true;
    return t.priority === filterPriority;
  });

  const highPriorityCount = topics.filter((t) => t.priority === 'high').length;
  const mediumPriorityCount = topics.filter((t) => t.priority === 'medium').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Important Exam Topics"
        description="Topics that repeat most frequently in 5-year question papers. Study high-priority topics first for maximum marks."
        badge={selectedSubject ? selectedSubject.name : 'Select Subject'}
        actions={
          selectedSubject && (
            <button
              onClick={handleGenerateTopics}
              disabled={generating}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {generating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{generating ? 'Analyzing 5-Yr Papers...' : 'Analyze & Prioritize Topics'}</span>
            </button>
          )
        }
      />

      {/* How it Works Information Card */}
      <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-indigo-950 dark:text-indigo-200 leading-relaxed">
            <span className="font-bold">How Examination Importance is Calculated:</span> Each topic is cross-correlated across the subject's active syllabus units and 5 years of university question papers. Topics with &ge;3 appearances in long/medium questions receive <strong>High Priority</strong>.
          </div>
        </div>
        {topics.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
              {highPriorityCount} High Priority
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              {mediumPriorityCount} Medium
            </span>
          </div>
        )}
      </div>

      {/* Filter and Subject Selector Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 shadow-2xs">
        <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
          <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className="text-xs font-semibold text-gray-500 shrink-0">Subject:</span>
          <select
            value={selectedSubject?._id || ''}
            onChange={(e) => {
              const s = subjects.find((x) => x._id === e.target.value);
              if (s) setSelectedSubject(s);
            }}
            className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-gray-100 focus:outline-none cursor-pointer truncate max-w-xs"
          >
            {subjects.map((s) => (
              <option key={s._id} value={s._id} className="dark:bg-gray-900">
                {s.code} - {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter (Smooth horizontal scroll on mobile) */}
        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800/80 p-1 rounded-xl text-xs overflow-x-auto no-scrollbar max-w-full">
          <button
            onClick={() => setFilterPriority('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all shrink-0 ${
              filterPriority === 'all'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-2xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            All ({topics.length})
          </button>
          <button
            onClick={() => setFilterPriority('high')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all shrink-0 ${
              filterPriority === 'high'
                ? 'bg-red-500 text-white shadow-2xs'
                : 'text-gray-500 hover:text-red-500'
            }`}
          >
            High Priority ({highPriorityCount})
          </button>
          <button
            onClick={() => setFilterPriority('medium')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all shrink-0 ${
              filterPriority === 'medium'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'text-gray-500 hover:text-amber-500'
            }`}
          >
            Medium ({mediumPriorityCount})
          </button>
          <button
            onClick={() => setFilterPriority('low')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all shrink-0 ${
              filterPriority === 'low'
                ? 'bg-emerald-500 text-white shadow-2xs'
                : 'text-gray-500 hover:text-emerald-500'
            }`}
          >
            Additional ({topics.filter((t) => t.priority === 'low').length})
          </button>
        </div>
      </div>

      {/* Topics Grid */}
      {loading ? (
        <LoadingSpinner text="Analyzing historical paper patterns..." />
      ) : filteredTopics.length === 0 ? (
        <div className="p-10 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Star className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              No Analyzed Topics for {selectedSubject?.name || 'this subject'} Yet
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Click below to correlate the syllabus units with all past examination papers and generate prioritized topics with appearance frequencies.
            </p>
          </div>
          {selectedSubject && (
            <button
              onClick={handleGenerateTopics}
              disabled={generating}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{generating ? 'Analyzing Papers & Syllabus...' : 'Analyze Subject Topics with SANKALP AI'}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic) => {
            const config = PRIORITY_CONFIG[topic.priority] || PRIORITY_CONFIG.medium;
            return (
              <div
                key={topic._id}
                className="p-6 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Unit & Priority Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-xs text-gray-400 font-medium truncate max-w-[180px]">
                      {topic.unit || 'Core Unit'}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${config.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                      {config.label}
                    </span>
                  </div>

                  {/* Topic Title */}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 leading-snug">
                    {topic.topic_name}
                  </h3>

                  {/* Frequency & Marks Breakdown */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Appearances</span>
                      <span className="font-bold text-gray-900 dark:text-gray-200">
                        {topic.historical_appearances > 0 ? `${topic.historical_appearances} times` : '0 in papers'}
                      </span>
                    </div>
                    {topic.appeared_years?.length > 0 && (
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Years Tested</span>
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {topic.appeared_years.join(', ')}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Typical Weight</span>
                      <span className="font-bold text-gray-900 dark:text-gray-200">
                        {topic.common_marks_pattern || '10 Marks'}
                      </span>
                    </div>
                  </div>

                  {/* Why Important */}
                  <div className="mb-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Why It Matters
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      {topic.why_important}
                    </p>
                  </div>

                  {/* AI Recommendation */}
                  {topic.ai_recommendation && (
                    <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 mb-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Mentor Advice
                      </p>
                      <p className="text-xs text-indigo-900/80 dark:text-indigo-200/80 leading-relaxed">
                        {topic.ai_recommendation}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Action */}
                <Link
                  to={`/mentor?topic=${encodeURIComponent(topic.topic_name)}&subjectId=${topic.subject_id?._id || selectedSubject?._id}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Start Learning This Topic
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
