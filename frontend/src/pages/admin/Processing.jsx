import React, { useEffect, useState } from 'react';
import { Cpu, CheckCircle2, AlertTriangle, RotateCcw, Clock, RefreshCw } from 'lucide-react';
import { adminApi } from '../../lib/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Processing() {
  const [status, setStatus] = useState(null);
  const [failedDocs, setFailedDocs] = useState({ syllabus: [], papers: [] });
  const [loading, setLoading] = useState(true);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const [statusRes, failedRes] = await Promise.all([
        adminApi.getProcessingStatus(),
        adminApi.getFailedDocs(),
      ]);
      if (statusRes.data?.success) setStatus(statusRes.data.data);
      if (failedRes.data?.success) setFailedDocs(failedRes.data.data);
    } catch (err) {
      toast.error('Failed to load processing overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleRetryPaper = async (id) => {
    try {
      await adminApi.processPaper(id);
      toast.success('Reprocessing triggered');
      loadStatus();
    } catch (err) {
      toast.error('Retry failed');
    }
  };

  const handleRetrySyllabus = async (id) => {
    try {
      await adminApi.processSyllabus(id);
      toast.success('Reprocessing triggered');
      loadStatus();
    } catch (err) {
      toast.error('Retry failed');
    }
  };

  if (loading && !status) return <LoadingSpinner text="Querying document processing pipeline..." fullPage />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">AI Document Processing Pipeline</h1>
          <p className="text-xs text-slate-400">
            Real-time status of PDF text extraction, question classification, and unit mapping.
          </p>
        </div>
        <button
          onClick={loadStatus}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Pipeline
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Completed
          </span>
          <p className="text-2xl font-bold text-white">{status?.total_completed || 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-2">
            <Clock className="w-4 h-4 text-yellow-400" /> In Processing
          </span>
          <p className="text-2xl font-bold text-white">{status?.total_processing || 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-2">
            <Clock className="w-4 h-4 text-slate-400" /> Pending Queue
          </span>
          <p className="text-2xl font-bold text-white">{status?.total_pending || 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" /> Failed Extractions
          </span>
          <p className="text-2xl font-bold text-white">{status?.total_failed || 0}</p>
        </div>
      </div>

      {/* Failed Documents Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" /> Failed Documents Requiring Attention
        </h3>

        {(!failedDocs.syllabus?.length && !failedDocs.papers?.length) ? (
          <p className="text-xs text-slate-500 py-6 text-center">
            All document text and question extractions have succeeded cleanly!
          </p>
        ) : (
          <div className="space-y-2">
            {failedDocs.papers?.map((p) => (
              <div
                key={p._id}
                className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold text-white">
                    Paper: {p.subject_id?.name || 'Subject'} ({p.exam_year})
                  </p>
                  <p className="text-[11px] text-red-400 mt-0.5">{p.processing_error || 'PDF extraction failed'}</p>
                </div>
                <button
                  onClick={() => handleRetryPaper(p._id)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Retry Extraction
                </button>
              </div>
            ))}

            {failedDocs.syllabus?.map((s) => (
              <div
                key={s._id}
                className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold text-white">
                    Syllabus: {s.semester_id?.name || 'Semester'} (v{s.version})
                  </p>
                  <p className="text-[11px] text-red-400 mt-0.5">{s.processing_error || 'Extraction error'}</p>
                </div>
                <button
                  onClick={() => handleRetrySyllabus(s._id)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Retry Extraction
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
