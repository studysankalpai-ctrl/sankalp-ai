import React, { useEffect, useState } from 'react';
import { Layers, Plus, Edit2, Trash2, GraduationCap } from 'lucide-react';
import { adminApi } from '../../lib/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

export default function Semesters() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [number, setNumber] = useState(1);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadInitial() {
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
    loadInitial();
  }, []);

  const loadSemesters = async (courseId) => {
    if (!courseId) return;
    try {
      setLoading(true);
      const res = await adminApi.getSemesters(courseId);
      if (res.data?.success) {
        setSemesters(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load semesters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCourseId) {
      loadSemesters(selectedCourseId);
    }
  }, [selectedCourseId]);

  const openCreateModal = () => {
    setEditingSemester(null);
    setNumber(semesters.length + 1);
    setName(`Semester ${semesters.length + 1}`);
    setModalOpen(true);
  };

  const openEditModal = (s) => {
    setEditingSemester(s);
    setNumber(s.number);
    setName(s.name);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingSemester) {
        await adminApi.updateSemester(editingSemester._id, { number, name });
        toast.success('Semester updated');
      } else {
        await adminApi.createSemester({
          course_id: selectedCourseId,
          number,
          name,
          is_published: true,
        });
        toast.success('Semester created');
      }
      setModalOpen(false);
      loadSemesters(selectedCourseId);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Error saving semester');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.deleteSemester(deleteTarget._id);
      toast.success('Semester deleted');
      loadSemesters(selectedCourseId);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Cannot delete semester');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Semester Management</h1>
          <p className="text-xs text-slate-400">Manage academic semesters under each program.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white focus:outline-none"
          >
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Semester
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading semesters..." />
      ) : semesters.length === 0 ? (
        <div className="p-8 text-center text-slate-500 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
          No semesters created for this course yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-slate-900 border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-900/60">
                <th className="py-3 px-4">Number</th>
                <th className="py-3 px-4">Semester Name</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {semesters.map((s) => (
                <tr key={s._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-indigo-400">Semester {s.number}</td>
                  <td className="py-3 px-4 font-semibold text-white">{s.name}</td>
                  <td className="py-3 px-4 text-slate-400">{s.course_id?.code || 'MCA'}</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(s)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(s)}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800"
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              {editingSemester ? 'Edit Semester' : 'Add Semester'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Semester Number</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={number}
                  onChange={(e) => setNumber(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Semester Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Semester 1"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                >
                  {saving ? 'Saving...' : 'Save Semester'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete ${deleteTarget?.name}?`}
        message="This will delete the semester. Ensure all subjects under this semester are removed first."
      />
    </div>
  );
}
