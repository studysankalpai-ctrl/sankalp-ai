import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Key, CheckCircle } from 'lucide-react';
import { adminApi } from '../../lib/api';
import useAdminStore from '../../store/adminStore';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const { admin } = useAdminStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Both password fields required');
      return;
    }

    setSaving(true);
    try {
      const res = await adminApi.changePassword({ currentPassword, newPassword });
      if (res.data?.success) {
        toast.success('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Password update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Administrator Profile & Security</h1>
        <p className="text-xs text-slate-400">
          Manage administrator credentials, session policies, and security parameters.
        </p>
      </div>

      {/* Admin Profile Details */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-400" /> Active Admin Profile
        </h3>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-1">Administrator Name</span>
            <p className="font-semibold text-white">{admin?.name || 'Administrator'}</p>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Email Address</span>
            <p className="font-semibold text-white">{admin?.email || 'admin@sankalp.ai'}</p>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Role Permission</span>
            <span className="font-bold text-indigo-400 uppercase">{admin?.role || 'super_admin'}</span>
          </div>
        </div>
      </div>

      {/* Change Password Form */}
      <form onSubmit={handleChangePassword} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-indigo-400" /> Update Password
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-400 font-semibold mb-1 block">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-semibold mb-1 block">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50"
        >
          {saving ? 'Updating...' : 'Update Password'}
        </button>
      </form>

      {/* Security Directives Info */}
      <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-900/40 text-xs text-indigo-200 space-y-2">
        <p className="font-bold flex items-center gap-1.5 text-indigo-300">
          <ShieldCheck className="w-4 h-4" /> Compliance Notice (PART 16)
        </p>
        <p className="leading-relaxed">
          Admin settings must not expose student API keys because those keys are never stored centrally. All student learning data and BYOK keys are maintained exclusively on the client side.
        </p>
      </div>
    </div>
  );
}
