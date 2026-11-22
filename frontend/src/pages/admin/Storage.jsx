import React, { useEffect, useState } from 'react';
import { HardDrive, FileText, Download, Trash2 } from 'lucide-react';
import { adminApi } from '../../lib/api';
import { formatFileSize, formatDate } from '../../lib/utils';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Storage() {
  const [storage, setStorage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorage() {
      try {
        setLoading(true);
        const res = await adminApi.getStorage();
        if (res.data?.success) {
          setStorage(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load storage statistics');
      } finally {
        setLoading(false);
      }
    }
    loadStorage();
  }, []);

  if (loading && !storage) return <LoadingSpinner text="Computing disk storage..." fullPage />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Cloud & Local Storage Management</h1>
        <p className="text-xs text-slate-400">
          Monitor total academic documents, syllabus PDFs, and question paper disk consumption.
        </p>
      </div>

      {/* Storage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Total Disk Usage</span>
          <p className="text-3xl font-extrabold text-white">{storage?.total_size_mb || 0} MB</p>
          <p className="text-xs text-slate-500 mt-2">{storage?.total_files || 0} Total Academic Files</p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Question Papers Archive</span>
          <p className="text-3xl font-extrabold text-indigo-400">
            {formatFileSize(storage?.breakdown?.papers?.size || 0)}
          </p>
          <p className="text-xs text-slate-500 mt-2">{storage?.breakdown?.papers?.count || 0} Question Papers</p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Official Syllabi Archive</span>
          <p className="text-3xl font-extrabold text-purple-400">
            {formatFileSize(storage?.breakdown?.syllabus?.size || 0)}
          </p>
          <p className="text-xs text-slate-500 mt-2">{storage?.breakdown?.syllabus?.count || 0} Curriculum Documents</p>
        </div>
      </div>
    </div>
  );
}
