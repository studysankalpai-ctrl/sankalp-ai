import React, { useEffect, useState } from 'react';
import { FolderGit2, Folder, Plus, Edit2, Trash2, FolderPlus, FileText, ChevronRight } from 'lucide-react';
import { adminApi } from '../../lib/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

export default function Folders() {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [parentFolderId, setParentFolderId] = useState('');
  const [editingFolder, setEditingFolder] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadFolders = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getFolders({});
      if (res.data?.success) {
        setFolders(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load folders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFolders();
  }, []);

  const openCreateModal = () => {
    setEditingFolder(null);
    setFolderName('');
    setParentFolderId('');
    setModalOpen(true);
  };

  const openEditModal = (f) => {
    setEditingFolder(f);
    setFolderName(f.name);
    setParentFolderId(f.parent_folder_id || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    try {
      if (editingFolder) {
        await adminApi.updateFolder(editingFolder._id, { name: folderName.trim() });
        toast.success('Folder updated');
      } else {
        await adminApi.createFolder({
          name: folderName.trim(),
          parent_folder_id: parentFolderId || null,
        });
        toast.success('Folder created');
      }
      setModalOpen(false);
      loadFolders();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Error saving folder');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.deleteFolder(deleteTarget._id);
      toast.success('Folder deleted');
      loadFolders();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Cannot delete folder');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Folder Management</h1>
          <p className="text-xs text-slate-400">Hierarchical cloud storage tree (parent_folder_id recursion).</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
        >
          <FolderPlus className="w-4 h-4" /> Create Custom Folder
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Reading folder hierarchy..." />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-slate-900 border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-900/60">
                <th className="py-3 px-4">Folder Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Parent Reference</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {folders.map((f) => (
                <tr key={f._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                    <Folder className="w-4 h-4 text-amber-500 fill-amber-500/20 shrink-0" />
                    <span>{f.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {f.folder_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {f.course_id?.code || f.semester_id?.name || f.subject_id?.code || (f.parent_folder_id ? 'Subfolder' : 'Root Drive')}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(f)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {!f.is_system && (
                      <button
                        onClick={() => setDeleteTarget(f)}
                        className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
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
              {editingFolder ? 'Rename Folder' : 'Create Folder'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Folder Name</label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="e.g. Reference Books, Notes"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                />
              </div>

              {!editingFolder && (
                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Parent Folder (Optional)</label>
                  <select
                    value={parentFolderId}
                    onChange={(e) => setParentFolderId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="">None (Root Directory)</option>
                    {folders.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold">
                  Save Folder
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
        message="This will delete the folder. Only empty folders can be deleted."
      />
    </div>
  );
}
