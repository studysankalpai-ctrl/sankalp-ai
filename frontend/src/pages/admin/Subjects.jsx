import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Layers, PlusCircle, X, Sparkles, HelpCircle } from 'lucide-react';
import { adminApi } from '../../lib/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

export default function Subjects() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [units, setUnits] = useState([]);
  const [saving, setSaving] = useState(false);

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

  // Load semesters when course selected
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
        }
      } catch (err) {
        toast.error('Failed to load semesters');
      }
    }
    loadSemesters();
  }, [selectedCourseId]);

  // Load subjects when semester selected
  const loadSubjects = async () => {
    if (!selectedSemesterId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await adminApi.getSubjects(selectedSemesterId);
      if (res.data?.success) {
        setSubjects(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, [selectedSemesterId]);

  const openCreateModal = () => {
    setEditingSubject(null);
    setName('');
    setCode('');
    setDescription('');
    setUnits([
      { number: 1, name: 'Unit 1: Fundamentals', topics: [], description: '' },
      { number: 2, name: 'Unit 2: Architecture', topics: [], description: '' },
    ]);
    setModalOpen(true);
  };

  const openEditModal = (s) => {
    setEditingSubject(s);
    setName(s.name);
    setCode(s.code);
    setDescription(s.description || '');
    setUnits(
      s.units && s.units.length > 0
        ? s.units.map(u => ({
            number: u.number,
            name: u.name,
            topics: u.topics || [],
            description: u.description || '',
          }))
        : []
    );
    setModalOpen(true);
  };

  const addUnit = () => {
    setUnits([
      ...units,
      { number: units.length + 1, name: `Unit ${units.length + 1}`, topics: [], description: '' },
    ]);
  };

  const removeUnit = (index) => {
    setUnits(units.filter((_, i) => i !== index));
  };

  const updateUnitName = (index, val) => {
    const next = [...units];
    next[index].name = val;
    setUnits(next);
  };

  const updateUnitDescription = (index, val) => {
    const next = [...units];
    next[index].description = val;
    setUnits(next);
  };

  const updateUnitTopics = (index, val) => {
    const next = [...units];
    next[index].topics = val.split(',').map((t) => t.trim()).filter(Boolean);
    setUnits(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingSubject) {
        await adminApi.updateSubject(editingSubject._id, {
          name,
          code,
          description,
          units,
        });
        toast.success('Subject updated');
      } else {
        await adminApi.createSubject({
          semester_id: selectedSemesterId,
          name,
          code,
          description,
          units,
          is_published: true,
        });
        toast.success('Subject created');
      }
      setModalOpen(false);
      loadSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Error saving subject');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.deleteSubject(deleteTarget._id);
      toast.success('Subject deleted');
      loadSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Cannot delete subject');
    }
  };

  return (
    <div className="space-y-6">
      {/* Educational Banner */}
      <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-900/60 flex items-start gap-3 text-xs text-indigo-200">
        <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white">AI Grounding Architecture:</strong> Each subject and syllabus unit defined here directly trains the SANKALP AI Mentor. The detailed unit description is used to construct 1-click Unit Masterclasses and to balance questions in the 5-Year Final Master Examination Paper.
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Subject & Syllabus Unit Architecture</h1>
          <p className="text-xs text-slate-400">Map university curriculum subjects, detailed unit breakdowns, and examination scope.</p>
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

          <button
            onClick={openCreateModal}
            disabled={!selectedSemesterId}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Add Subject
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading subjects..." />
      ) : subjects.length === 0 ? (
        <div className="p-8 text-center text-slate-500 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
          No subjects created for this semester yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-slate-900 border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-900/60">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Subject Name</th>
                <th className="py-3 px-4">Units Defined</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {subjects.map((s) => (
                <tr key={s._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-indigo-400">{s.code}</td>
                  <td className="py-3 px-4 font-semibold text-white">{s.name}</td>
                  <td className="py-3 px-4 text-slate-400">{s.units?.length || 0} Units</td>
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
          <div className="w-full max-w-xl max-h-[85vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              {editingSubject ? 'Edit Subject' : 'Add Subject'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Subject Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. MCA101"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Subject Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Database Management Systems"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Subject overview..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              {/* Units Configuration */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Syllabus Units & Topics</span>
                  <button
                    type="button"
                    onClick={addUnit}
                    className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Add Unit
                  </button>
                </div>

                <div className="space-y-3">
                  {units.map((u, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-indigo-400 shrink-0">Unit {u.number}</span>
                        <input
                          type="text"
                          value={u.name}
                          onChange={(e) => updateUnitName(idx, e.target.value)}
                          placeholder="Unit Title (e.g. Introduction to Computer)"
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => removeUnit(idx)}
                          className="text-slate-500 hover:text-red-400 p-1"
                          title="Remove Unit"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                          Full Syllabus Content & Paragraph (powers AI Mentor unit breakdown)
                        </label>
                        <textarea
                          rows={2}
                          value={u.description || ''}
                          onChange={(e) => updateUnitDescription(idx, e.target.value)}
                          placeholder="Paste syllabus text: Definition, Computer Hardware & Software, CPU, Primary/Secondary Memory, Assembler, Algorithms..."
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs leading-relaxed"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                          Topic Keywords (comma-separated for quick tags)
                        </label>
                        <input
                          type="text"
                          value={(u.topics || []).join(', ')}
                          onChange={(e) => updateUnitTopics(idx, e.target.value)}
                          placeholder="Topics separated by commas (e.g. CPU, RAM, Secondary Storage, Compiler)"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
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
                  {saving ? 'Saving...' : 'Save Subject'}
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
        title={`Delete Subject ${deleteTarget?.name}?`}
        message="This will delete the subject and its folders. Ensure question papers are removed first."
      />
    </div>
  );
}
