import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Loader2, ArrowLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { adminApi } from '../../lib/api';
import useAdminStore from '../../store/adminStore';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const { login } = useAdminStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Strictly clear any cached or auto-injected values on initial mount
    setEmail('');
    setPassword('');
    const t = setTimeout(() => setIsReady(true), 150);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Email and password required');
      return;
    }

    setLoading(true);
    try {
      const res = await adminApi.login({ email: email.trim(), password });
      if (res.data?.success) {
        login(res.data.data.admin, res.data.data.token);
        toast.success('Admin authentication successful!');
        navigate('/admin');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Authentication failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-y-auto bg-slate-950 flex flex-col justify-center items-center p-4 pt-[calc(1.5rem+env(safe-area-inset-top,0px))] pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] selection:bg-indigo-600 selection:text-white">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Student Website
      </Link>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center mx-auto shadow-lg shadow-black/40">
            <img
              src="/Logo.png"
              alt="SANKALP"
              className="w-full h-full object-contain"
              loading="eager"
            />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            SANKALP Administration
          </h1>
          <p className="text-xs text-slate-400">
            Secure curriculum control and document processing gateway.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
          {/* Hidden Anti-Autofill Traps */}
          <input
            type="text"
            name="fake_username_trap"
            style={{ position: 'absolute', opacity: 0, height: 0, width: 0, zIndex: -1 }}
            tabIndex={-1}
            readOnly
            autoComplete="off"
            aria-hidden="true"
          />
          <input
            type="password"
            name="fake_password_trap"
            style={{ position: 'absolute', opacity: 0, height: 0, width: 0, zIndex: -1 }}
            tabIndex={-1}
            readOnly
            autoComplete="off"
            aria-hidden="true"
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                name="sankalp_auth_identity"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                autoComplete="one-time-code"
                readOnly={!isReady}
                onFocus={(e) => e.target.removeAttribute('readonly')}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="sankalp_auth_secret"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoComplete="new-password"
                readOnly={!isReady}
                onFocus={(e) => e.target.removeAttribute('readonly')}
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Security Notice (Zero credentials revealed) */}
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Authorized Administrator Access Only &bull; End-to-End Encrypted</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
