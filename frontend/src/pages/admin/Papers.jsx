import React, { useEffect, useState } from 'react';
import { FileQuestion, Upload, RotateCcw, Trash2, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { adminApi } from '../../lib/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

export default function Papers() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload Form
  const [file, setFile] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [examType, setExamType] = useState('regular');
  const [includeInAnalysis, setIncludeInAnalysis] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

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
          setPapers([]);
        }
      } catch (err) {
        toast.error('Failed to load subjects');
      }
    }
    loadSubjects();
  }, [selectedSemesterId]);

  const loadPapers = async () => {
    if (!selectedSubjectId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await adminApi.getPapers({ subject_id: selectedSubjectId });
      if (res.data?.success) {
        setPapers(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load papers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPapers();
  }, [selectedSubjectId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please choose a question paper PDF');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('subject_id', selectedSubjectId);
    formData.append('exam_year', year);
    formData.append('exam_type', examType);
    formData.append('is_included_in_analysis', includeInAnalysis);

    setUploading(true);
    try {
      const res = await adminApi.uploadPaper(formData);
      if (res.data?.success) {
        toast.success('Question paper uploaded and extraction started!');
        setFile(null);
        loadPapers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleReprocess = async (id) => {
    try {
      await adminApi.processPaper(id);
      toast.success('Reprocessing text & questions extraction...');
      loadPapers();
    } catch (err) {
      toast.error('Failed to trigger reprocessing');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.deletePaper(deleteTarget._id);
      toast.success('Question paper deleted');
      loadPapers();
    } catch (err) {
      toast.error('Failed to delete paper');
    }
  };

  return (
    <div className="space-y-6">
      {/* Educational Guide Banner */}
      <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-900/60 flex items-start gap-3 text-xs text-indigo-200">
        <FileQuestion className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white">5-Year Past Papers Repository:</strong> Upload previous 5-year official examination papers (2021&ndash;2025). The background AI pipeline automatically OCR-extracts every question, marks value, and year frequency to synthesize the student 5-Year Final Master Examination Paper.
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Previous-Year Question Papers</h1>
          <p className="text-xs text-slate-400">
            Upload examination PDFs. System extracts questions, numbers, and marks automatically.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white focus:outline-none"
          >
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.code}
              </option>
            ))}
          </select>

          <select
            value={selectedSemesterId}
            onChange={(e) => setSelectedSemesterId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white focus:outline-none"
          >
            {semesters.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white focus:outline-none"
          >
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.code}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Upload Box */}
      <form onSubmit={handleUpload} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Upload className="w-4 h-4 text-indigo-400" /> Upload Question Paper PDF
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-slate-400 font-semibold mb-1 block">PDF File</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0])}
              required
              className="w-full text-slate-400 text-xs file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
            />
          </div>

          <div>
            <label className="text-slate-400 font-semibold mb-1 block">Examination Year</label>
            <input
              type="number"
              min={2000}
              max={2099}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-400 font-semibold mb-1 block">Session / Type</label>
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
            >
              <option value="regular">Regular Annual / End-Term</option>
              <option value="supplementary">Supplementary / Backlog</option>
              <option value="mid-term">Mid-Term / Sessional</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              id="inc"
              checked={includeInAnalysis}
              onChange={(e) => setIncludeInAnalysis(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-0"
            />
            <label htmlFor="inc" className="text-slate-300 font-medium">Include in 5-Yr AI Analysis</label>
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading || !file || !selectedSubjectId}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-40"
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          {uploading ? 'Processing Questions...' : 'Upload & Extract Paper'}
        </button>
      </form>

      {/* Papers Table */}
      {loading ? (
        <LoadingSpinner text="Loading paper archives..." />
      ) : papers.length === 0 ? (
        <div className="p-8 text-center text-slate-500 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
          No question papers uploaded for this subject yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-slate-900 border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-900/60">
                <th className="py-3 px-4">Exam Year</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">File Name</th>
                <th className="py-3 px-4">AI Analysis</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {papers.map((p) => (
                <tr key={p._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-indigo-400 text-sm">{p.exam_year}</td>
                  <td className="py-3 px-4 capitalize text-slate-400">{p.exam_type}</td>
                  <td className="py-3 px-4 text-slate-200 max-w-xs truncate">{p.file_id?.original_filename}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      p.is_included_in_analysis ? 'bg-indigo-950 text-indigo-300 border border-indigo-900' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {p.is_included_in_analysis ? 'In 5-Yr Set' : 'Archived'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      p.processing_status === 'completed'
                        ? 'bg-emerald-950/60 text-emerald-400'
                        : p.processing_status === 'failed'
                        ? 'bg-red-950/60 text-red-400'
                        : 'bg-yellow-950/60 text-yellow-400'
                    }`}>
                      {p.processing_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleReprocess(p._id)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                      title="Reprocess Questions Extraction"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(p)}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800"
                      title="Delete Paper"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete Paper ${deleteTarget?.exam_year}?`}
        message="This will permanently delete this question paper and all extracted questions derived from it."
      />
    </div>
  );
}
