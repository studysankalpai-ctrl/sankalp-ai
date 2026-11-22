import React, { useEffect, useState } from 'react';
import { BarChart3, Sparkles, CheckCircle2, RotateCcw, Trash2, Eye } from 'lucide-react';
import { adminApi } from '../../lib/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
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

  const loadAnalyses = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAnalyses({});
      if (res.data?.success) {
        setAnalyses(res.data.data);
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

  const handleGenerate = async () => {
    if (!selectedSubjectId) {
      toast.error('Please select a subject');
      return;
    }
    setGenerating(true);
    try {
      const res = await adminApi.generateAnalysis({
        subject_id: selectedSubjectId,
      });
      if (res.data?.success) {
        toast.success('Subject-wise academic analysis generated!');
        loadAnalyses();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      const res = await adminApi.publishAnalysis(id);
      if (res.data?.success) {
        toast.success(res.data.message);
        loadAnalyses();
      }
    } catch (err) {
      toast.error('Action failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">AI Examination Analysis & Trends</h1>
          <p className="text-xs text-slate-400">
            Synthesize historical frequency, unit coverage, and exam predictions. Review before publishing to students.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white focus:outline-none"
          >
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleGenerate}
            disabled={generating || !selectedSubjectId}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {generating ? 'Synthesizing...' : 'Generate Subject Analysis'}
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching academic analyses..." />
      ) : analyses.length === 0 ? (
        <div className="p-8 text-center text-slate-500 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
          No analysis generated yet. Click "Generate Subject Analysis" above.
        </div>
      ) : (
        <div className="space-y-4">
          {analyses.map((a) => (
            <div
              key={a._id}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">
                    {a.subject_id?.name} ({a.subject_id?.code})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Years Analyzed: {a.years_analyzed?.join(', ') || 'Recent Archives'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePublish(a._id)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                      a.is_published
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-900'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {a.is_published ? 'Published to Students' : 'Draft / Unpublished'}
                  </button>
                </div>
              </div>

              {a.analysis_data?.summary && (
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-indigo-400 block mb-1">Executive Summary:</span>
                  {a.analysis_data.summary}
                </div>
              )}

              {/* Predictions list */}
              {a.analysis_data?.predictions?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Key Predictions Preview ({a.analysis_data.predictions.length})
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {a.analysis_data.predictions.slice(0, 4).map((p, pIdx) => (
                      <div key={pIdx} className="p-3 rounded-xl bg-slate-800/40 text-xs text-slate-300">
                        <span className="font-bold text-white">{p.topic || p.topic_or_question}</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">{p.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
