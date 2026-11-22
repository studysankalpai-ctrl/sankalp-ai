import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Archive,
  Loader2,
} from 'lucide-react';
import { adminApi, publicApi } from '../../lib/api';
import useAppStore from '../../store/appStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getCourses();
      if (res.data?.success) {
        setCourses(res.data.data);
        // Also sync active courses to appStore
        const active = res.data.data.filter(c => c.is_published && !c.is_archived);
        useAppStore.getState().setCourses(active.length > 0 ? active : res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const openCreateModal = () => {
    setEditingCourse(null);
    setName('');
    setCode('');
    setDescription('');
    setIsPublished(true);
    setModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingCourse(c);
    setName(c.name);
    setCode(c.code);
    setDescription(c.description || '');
    setIsPublished(c.is_published);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !code) {
      toast.error('Name and code are required');
      return;
    }

    setSaving(true);
    try {
      if (editingCourse) {
        await adminApi.updateCourse(editingCourse._id, {
          name,
          code,
          description,
          is_published: isPublished,
        });
        toast.success('Course updated');
      } else {
        await adminApi.createCourse({
          name,
          code,
          description,
          is_published: isPublished,
        });
        toast.success('Course created');
      }
      setModalOpen(false);
      loadCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Error saving course');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.deleteCourse(deleteTarget._id);
      toast.success('Course deleted');
      loadCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Cannot delete course');
    }
  };

  const togglePublish = async (id) => {
    try {
      const res = await adminApi.togglePublishCourse(id);
      if (res.data?.success) {
        toast.success(res.data.message);
        loadCourses();
      }
    } catch (err) {
      toast.error('Action failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Educational Guide Banner */}
      <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-900/60 flex items-start gap-3 text-xs text-indigo-200">
        <GraduationCap className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white">Degree Program Configuration:</strong> Set up university academic programs (e.g., BMC, BCA, MCA). Each program groups semesters, subjects, syllabus outlines, and past examination papers for students.
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Degree Courses & Academic Programs</h1>
          <p className="text-xs text-slate-400">Configure university degree programs and their publication status.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading courses..." />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-slate-900 border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-900/60">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Course Name</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {courses.map((c) => (
                <tr key={c._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-indigo-400">{c.code}</td>
                  <td className="py-3 px-4 font-semibold text-white">{c.name}</td>
                  <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{c.description || '-'}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => togglePublish(c._id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        c.is_published
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {c.is_published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(c)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(c)}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Delete"
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

      {/* Course Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              {editingCourse ? 'Edit Course' : 'Create New Course'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Course Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MCA, MBA, BCA"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 uppercase font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Course Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Master of Computer Applications"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Overview of the degree curriculum..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pub"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0"
                />
                <label htmlFor="pub" className="text-slate-300 font-medium">Publish immediately</label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  {saving ? 'Saving...' : editingCourse ? 'Save Changes' : 'Create Course'}
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
        title={`Delete Course ${deleteTarget?.code}?`}
        message="This action cannot be undone. Ensure there are no active semesters under this course first."
      />
    </div>
  );
}
