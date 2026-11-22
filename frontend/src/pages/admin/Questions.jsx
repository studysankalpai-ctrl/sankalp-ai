import React, { useEffect, useState } from 'react';
import { HelpCircle, CheckCircle, Edit2, Trash2, Filter } from 'lucide-react';
import { adminApi } from '../../lib/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Edit fields
  const [qNum, setQNum] = useState('');
  const [qText, setQText] = useState('');
  const [marks, setMarks] = useState(10);
  const [qType, setQType] = useState('long');
  const [unit, setUnit] = useState('');
  const [topic, setTopic] = useState('');

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getQuestions({ limit: 50 });
      if (res.data?.success) {
        setQuestions(res.data.data.questions || []);
      }
    } catch (err) {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const openEdit = (q) => {
    setEditingQuestion(q);
    setQNum(q.question_number || '');
    setQText(q.question_text || '');
    setMarks(q.marks || 10);
    setQType(q.question_type || 'long');
    setUnit(q.unit || '');
    setTopic(q.topic || '');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await adminApi.updateQuestion(editingQuestion._id, {
        question_number: qNum,
        question_text: qText,
        marks,
        question_type: qType,
        unit,
        topic,
        is_verified: true,
      });
      toast.success('Question updated & verified');
      setEditingQuestion(null);
      loadQuestions();
    } catch (err) {
      toast.error('Failed to update question');
    }
  };

  const handleVerify = async (id) => {
    try {
      await adminApi.verifyQuestion(id);
      toast.success('Question verified');
      loadQuestions();
    } catch (err) {
      toast.error('Verification failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.deleteQuestion(deleteTarget._id);
      toast.success('Question deleted');
      loadQuestions();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Extracted Examination Questions</h1>
          <p className="text-xs text-slate-400">
            Review, edit marks/units, and manually verify questions extracted from past year PDFs.
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading questions database..." />
      ) : questions.length === 0 ? (
        <div className="p-8 text-center text-slate-500 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
          No extracted questions found. Upload question papers to extract them automatically.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-slate-900 border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-900/60">
                <th className="py-3 px-4">Q#</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Year</th>
                <th className="py-3 px-4">Question Text</th>
                <th className="py-3 px-4">Marks</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {questions.map((q) => (
                <tr key={q._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-indigo-400">{q.question_number || 'Q'}</td>
                  <td className="py-3 px-4 text-slate-400">{q.subject_id?.code}</td>
                  <td className="py-3 px-4 text-slate-400">{q.exam_year}</td>
                  <td className="py-3 px-4 font-medium text-white max-w-sm truncate" title={q.question_text}>
                    {q.question_text}
                  </td>
                  <td className="py-3 px-4 font-bold text-white">{q.marks ? `${q.marks}M` : '-'}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      q.is_verified ? 'bg-emerald-950/60 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {q.is_verified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    {!q.is_verified && (
                      <button
                        onClick={() => handleVerify(q._id)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                        title="Mark as Verified"
                      >
                        Verify
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(q)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(q)}
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

      {/* Edit Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Edit Question Details</h3>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Question #</label>
                  <input
                    type="text"
                    value={qNum}
                    onChange={(e) => setQNum(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Marks</label>
                  <input
                    type="number"
                    value={marks}
                    onChange={(e) => setMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Question Text</label>
                <textarea
                  rows={3}
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. Unit 3"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. ACID Properties"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold">
                  Save & Verify
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
        title="Delete Question?"
        message="This question will be removed from practice pools."
      />
    </div>
  );
}
