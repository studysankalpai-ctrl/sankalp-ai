import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Trash2,
  Eye,
  GraduationCap,
  Layers,
  Bookmark,
  Filter,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { adminApi } from '../../lib/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

export default function Analysis() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filterSubjectOnly, setFilterSubjectOnly] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // 1. Load Courses
  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await adminApi.getCourses();
        if (res.data?.success && res.data.data.length > 0) {
          setCourses(res.data.data);
          setSelectedCourseId(res.data.data[0]._id);
        }
      } catch (err) {
        toast.error('Failed to load courses');
      }
    }
    loadCourses();
  }, []);

  // 2. Load Semesters when Course changes
  useEffect(() => {
    async function loadSemesters() {
      if (!selectedCourseId) return;
      try {
        const res = await adminApi.getSemesters(selectedCourseId);
        if (res.data?.success && res.data.data.length > 0) {
          setSemesters(res.data.data);
          setSelectedSemesterId(res.data.data[0]._id);
        } else {
          setSemesters([]);
          setSelectedSemesterId('');
          setSubjects([]);
          setSelectedSubjectId('');
        }
      } catch (err) {
        toast.error('Failed to load semesters');
      }
    }
    loadSemesters();
  }, [selectedCourseId]);

  // 3. Load Subjects when Semester changes
  useEffect(() => {
    async function loadSubjects() {
      if (!selectedSemesterId) return;
      try {
        const res = await adminApi.getSubjects(selectedSemesterId);
        if (res.data?.success && res.data.data.length > 0) {
          setSubjects(res.data.data);
          setSelectedSubjectId(res.data.data[0]._id);
        } else {
          setSubjects([]);
          setSelectedSubjectId('');
        }
      } catch (err) {
        toast.error('Failed to load subjects');
      }
    }
    loadSubjects();
  }, [selectedSemesterId]);

  // 4. Load Analyses
  const loadAnalyses = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAnalyses({});
      if (res.data?.success) {
        setAnalyses(res.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load analyses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyses();
  }, []);

  // 5. Generate Subject Analysis
  const handleGenerate = async (targetSubjectId = selectedSubjectId) => {
    if (!targetSubjectId) {
      toast.error('Please select a subject first');
      return;
    }
    setGenerating(true);
    try {
      const res = await adminApi.generateAnalysis({
        subject_id: targetSubjectId,
      });
      if (res.data?.success) {
        toast.success('Subject-wise academic analysis generated successfully!');
        loadAnalyses();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  // 6. Toggle Publish Status
  const handleTogglePublish = async (id) => {
    try {
      const res = await adminApi.publishAnalysis(id);
      if (res.data?.success) {
        toast.success(res.data.message || 'Status updated');
        loadAnalyses();
      }
    } catch (err) {
      toast.error('Action failed');
    }
  };

  // 7. Delete Analysis
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await adminApi.deleteAnalysis(deleteTarget._id);
      if (res.data?.success) {
        toast.success('Analysis deleted');
        setDeleteTarget(null);
        loadAnalyses();
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  // Selected subject object
  const currentSubject = subjects.find((s) => s._id === selectedSubjectId);

  // Filtered analyses list
  const displayedAnalyses = filterSubjectOnly && selectedSubjectId
    ? analyses.filter((a) => (a.subject_id?._id || a.subject_id) === selectedSubjectId)
    : analyses;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            AI Examination Analysis & Trends
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Synthesize historical frequency, unit weightage, and high-probability exam predictions for any Course, Semester, and Subject.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterSubjectOnly(!filterSubjectOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
              filterSubjectOnly
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Toggle between showing all subjects or only the currently selected subject"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{filterSubjectOnly ? 'Filtered: Selected Subject' : 'Showing: All Analyses'}</span>
          </button>

          <button
            onClick={loadAnalyses}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Refresh Analyses"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3-Step Selection Panel: Course -> Semester -> Subject */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Select Course */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              1. Select Course
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-medium text-white focus:outline-none focus:border-indigo-500"
            >
              {courses.length === 0 && <option value="">No courses found</option>}
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Select Semester */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              2. Select Semester
            </label>
            <select
              value={selectedSemesterId}
              onChange={(e) => setSelectedSemesterId(e.target.value)}
              disabled={semesters.length === 0}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-medium text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            >
              {semesters.length === 0 && <option value="">No semesters available</option>}
              {semesters.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} (Semester {s.number})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Select Subject */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
              3. Select Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              disabled={subjects.length === 0}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-medium text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            >
              {subjects.length === 0 && <option value="">No subjects in this semester</option>}
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action bar for selected subject */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {currentSubject ? (
              <span>
                Selected Target:{' '}
                <strong className="text-white">
                  {currentSubject.code} &bull; {currentSubject.name}
                </strong>
              </span>
            ) : (
              <span className="text-amber-400">Please choose a course, semester, and subject to begin</span>
            )}
          </div>

          <button
            onClick={() => handleGenerate(selectedSubjectId)}
            disabled={generating || !selectedSubjectId}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            <Sparkles className="w-4 h-4" />
            <span>{generating ? 'Synthesizing with Groq AI...' : 'Generate Subject Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Main Analysis Display Section */}
      {loading ? (
        <LoadingSpinner text="Fetching academic analyses..." />
      ) : displayedAnalyses.length === 0 ? (
        <div className="p-10 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-950/60 border border-indigo-900/50 flex items-center justify-center mx-auto text-indigo-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">
            {filterSubjectOnly
              ? 'No analysis found for this specific subject yet'
              : 'No subject analysis generated in database'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Select your desired subject using the Course, Semester, and Subject controls above, then click{' '}
            <strong className="text-indigo-400">"Generate Subject Analysis"</strong>.
          </p>
          {selectedSubjectId && (
            <button
              onClick={() => handleGenerate(selectedSubjectId)}
              disabled={generating}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Now for {currentSubject?.code || 'Selected Subject'}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {displayedAnalyses.map((a) => {
            const subject = a.subject_id;
            const courseCode = subject?.semester_id?.course_id?.code || '';
            const semNumber = subject?.semester_id?.number;

            return (
              <div
                key={a._id}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-md space-y-4 hover:border-slate-700/80 transition-colors"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        {subject?.name || 'Subject Analysis'} ({subject?.code || 'CODE'})
                      </h3>
                      {courseCode && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {courseCode}
                        </span>
                      )}
                      {semNumber && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          Sem {semNumber}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Years Analyzed: {a.years_analyzed?.length > 0 ? a.years_analyzed.join(', ') : 'Recent Question Archives'} &bull;{' '}
                      Generated: {new Date(a.generated_at || a.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleTogglePublish(a._id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
                        a.is_published
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {a.is_published ? 'Published to Students' : 'Draft / Unpublished'}
                    </button>

                    <button
                      onClick={() => handleGenerate(subject?._id || a.subject_id)}
                      disabled={generating}
                      className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
                      title="Re-run Analysis for this Subject"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setDeleteTarget(a)}
                      className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete Analysis"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Executive Summary */}
                {a.analysis_data?.summary && (
                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-300 leading-relaxed">
                    <span className="font-bold text-indigo-400 block mb-1">Executive Summary:</span>
                    {a.analysis_data.summary}
                  </div>
                )}

                {/* Unit Coverage breakdown (if available) */}
                {a.analysis_data?.unit_coverage?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                      Unit Weightage & High-Frequency Focus
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {a.analysis_data.unit_coverage.map((u, uIdx) => (
                        <div
                          key={uIdx}
                          className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-300 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white truncate">
                              Unit {u.unit_number}: {u.unit_name}
                            </span>
                            {u.estimated_weightage_percentage && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 font-bold">
                                {u.estimated_weightage_percentage}%
                              </span>
                            )}
                          </div>
                          {u.frequently_tested_concepts?.length > 0 && (
                            <p className="text-[11px] text-slate-400 line-clamp-2">
                              {u.frequently_tested_concepts.join(', ')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Predictions list */}
                {a.analysis_data?.predictions?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Key Predictions Preview ({a.analysis_data.predictions.length})
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {a.analysis_data.predictions.slice(0, 4).map((p, pIdx) => (
                        <div key={pIdx} className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-300">
                          <span className="font-bold text-white">{p.topic || p.topic_or_question}</span>
                          <p className="text-[11px] text-slate-400 mt-0.5">{p.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Examination Analysis"
        message={`Are you sure you want to delete the analysis for "${deleteTarget?.subject_id?.name || 'this subject'}"? This action cannot be undone.`}
        confirmText="Delete Analysis"
        isDestructive={true}
      />
    </div>
  );
}
