import React, { useEffect, useState } from 'react';
import { FileText, Upload, CheckCircle2, RotateCcw, AlertTriangle, Eye, Loader2 } from 'lucide-react';
import { adminApi } from '../../lib/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Syllabus() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [syllabusList, setSyllabusList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [file, setFile] = useState(null);
  const [session, setSession] = useState('2024-2025');
  const [setActive, setSetActive] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Load courses
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

  // Load semesters
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
          setSyllabusList([]);
        }
      } catch (err) {
        toast.error('Failed to load semesters');
      }
    }
    loadSemesters();
  }, [selectedCourseId]);

  // Load syllabus versions
  const loadSyllabus = async () => {
    if (!selectedSemesterId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await adminApi.getSyllabusList(selectedSemesterId);
      if (res.data?.success) {
        setSyllabusList(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load syllabus versions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSyllabus();
  }, [selectedSemesterId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please choose a PDF file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('semester_id', selectedSemesterId);
    formData.append('academic_session', session);
    formData.append('set_active', setActive);

    setUploading(true);
    try {
      const res = await adminApi.uploadSyllabus(formData);
      if (res.data?.success) {
        toast.success('Syllabus uploaded and processing initiated!');
        setFile(null);
        loadSyllabus();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleActivate = async (id) => {
    try {
      const res = await adminApi.activateSyllabus(id);
      if (res.data?.success) {
        toast.success(res.data.message);
        loadSyllabus();
      }
    } catch (err) {
      toast.error('Failed to activate version');
    }
  };

  const handleReprocess = async (id) => {
    try {
      const res = await adminApi.processSyllabus(id);
      if (res.data?.success) {
        toast.success('Reprocessing text extraction...');
        loadSyllabus();
      }
    } catch (err) {
      toast.error('Failed to trigger processing');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Official Syllabus Management</h1>
          <p className="text-xs text-slate-400">
            Upload active curriculum PDF. The AI Mentor uses the active syllabus to ground all questions.
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
        </div>
      </div>

      {/* Upload Box */}
      <form onSubmit={handleUpload} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Upload className="w-4 h-4 text-indigo-400" /> Upload Official Syllabus PDF
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
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
            <label className="text-slate-400 font-semibold mb-1 block">Academic Session</label>
            <input
              type="text"
              value={session}
              onChange={(e) => setSession(e.target.value)}
              placeholder="e.g. 2024-2025"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              id="setact"
              checked={setActive}
              onChange={(e) => setSetActive(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-0"
            />
            <label htmlFor="setact" className="text-slate-300 font-medium">Set as currently active syllabus</label>
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading || !file}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-40"
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          {uploading ? 'Extracting & Saving...' : 'Upload & Process Syllabus'}
        </button>
      </form>

      {/* Versions List */}
      {loading ? (
        <LoadingSpinner text="Fetching syllabus records..." />
      ) : syllabusList.length === 0 ? (
        <div className="p-8 text-center text-slate-500 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
          No syllabus uploaded for this semester yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-slate-900 border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-900/60">
                <th className="py-3 px-4">Version</th>
                <th className="py-3 px-4">Academic Session</th>
                <th className="py-3 px-4">File Name</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {syllabusList.map((s) => (
                <tr key={s._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                    <span>v{s.version}</span>
                    {s.is_active && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-900">
                        ACTIVE OFFICIAL
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-400">{s.academic_session}</td>
                  <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{s.file_id?.original_filename}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      s.processing_status === 'completed'
                        ? 'bg-emerald-950/60 text-emerald-400'
                        : s.processing_status === 'failed'
                        ? 'bg-red-950/60 text-red-400'
                        : 'bg-yellow-950/60 text-yellow-400'
                    }`}>
                      {s.processing_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    {!s.is_active && (
                      <button
                        onClick={() => handleActivate(s._id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                      >
                        Set Active
                      </button>
                    )}
                    <button
                      onClick={() => handleReprocess(s._id)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                      title="Reprocess Extraction"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
