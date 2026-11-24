import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  Cpu,
  Trash2,
  ExternalLink,
  Info,
  Sun,
  Moon,
  Monitor,
  Palette,
  Mail,
  Copy,
  Check,
  GraduationCap,
  HardDrive,
  Smartphone,
  RefreshCw,
  ArrowRight,
  BookOpen,
  Zap,
} from 'lucide-react';
import { aiApi } from '../lib/api';
import useAppStore from '../store/appStore';
import { usePwaStore } from '../store/pwaStore';
import { clearResponseCache } from '../lib/mentorStorage';
import toast from 'react-hot-toast';

export default function Settings() {
  const {
    groqApiKey,
    setGroqApiKey,
    clearGroqKey,
    groqModel,
    setGroqModel,
    isAiConnected,
    theme,
    setTheme,
    darkMode,
    selectedCourse,
    selectedSemester,
    selectedSubject,
    courses,
    semesters,
    setSelectedCourse,
    setSelectedSemester,
  } = useAppStore();

  const { isInstallable, isInstalled, promptInstall } = usePwaStore();

  const [inputKey, setInputKey] = useState(groqApiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // { valid: boolean, message: string }
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);

  // Curated, student-focused high performance LLM models
  const [availableModels, setAvailableModels] = useState([
    { id: 'openai/gpt-oss-120b', name: 'GPT OSS 120B  High Reasoning & Marking Schemes (Recommended • 500 t/s)' },
    { id: 'openai/gpt-oss-20b', name: 'GPT OSS 20B  Hyper-Speed Instant Answers (1000 t/s)' },
    { id: 'qwen/qwen3.8-27b', name: 'Qwen 3.8 27B  High Quality Academic Reasoning' },
  ]);

  // Load live models dynamically on mount if API key is present
  useEffect(() => {
    async function loadLiveModels() {
      if (groqApiKey && groqApiKey.startsWith('gsk_')) {
        try {
          const res = await aiApi.getModels(groqApiKey);
          if (res.data?.success && res.data.data?.length > 0) {
            // Filter out non-conversational, guard, or irrelevant models
            const curated = res.data.data.filter(
              (m) =>
                !m.id.includes('guard') &&
                !m.id.includes('arabic') &&
                !m.id.includes('whisper') &&
                !m.id.includes('vision')
            );
            if (curated.length > 0) {
              setAvailableModels(curated);
            }
          }
        } catch { }
      }
    }
    loadLiveModels();
  }, [groqApiKey]);

  // Ensure groqModel is not set to invalid or deprecated models
  useEffect(() => {
    if (!groqModel || groqModel.includes('llama-3') || groqModel.startsWith('llama3')) {
      setGroqModel('openai/gpt-oss-120b');
    }
  }, [groqModel, setGroqModel]);

  const isAiActive = Boolean(isAiConnected && groqApiKey && inputKey.trim() === groqApiKey.trim());

  const handleTestAndSaveKey = async () => {
    if (!inputKey.trim()) {
      toast.error('Please enter a Groq API key');
      return;
    }

    if (!inputKey.trim().startsWith('gsk_')) {
      toast.error('Groq API keys start with "gsk_"');
      return;
    }

    setTesting(true);
    setTestStatus(null);

    try {
      const res = await aiApi.testConnection(inputKey.trim(), groqModel);
      if (res.data?.success && res.data.data.valid) {
        setTestStatus({ valid: true, message: res.data.data.message || 'Groq API connection verified!' });
        setGroqApiKey(inputKey.trim());
        toast.success('Groq API key activated for this session!');

        // Fetch live active models from Groq account
        try {
          const mRes = await aiApi.getModels(inputKey.trim());
          if (mRes.data?.success && mRes.data.data?.length > 0) {
            const curated = mRes.data.data.filter(
              (m) =>
                !m.id.includes('guard') &&
                !m.id.includes('arabic') &&
                !m.id.includes('whisper') &&
                !m.id.includes('vision')
            );
            if (curated.length > 0) {
              setAvailableModels(curated);
              const exists = curated.some((m) => m.id === groqModel);
              if (!exists) {
                const fallback = curated.find((m) => m.id.includes('120b') || m.id.includes('20b')) || curated[0];
                if (fallback) setGroqModel(fallback.id);
              }
            }
          }
        } catch { }
      } else {
        setTestStatus({ valid: false, message: res.data?.message || 'Invalid API key' });
        toast.error('Connection failed: ' + (res.data?.message || 'Invalid key'));
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Connection test failed';
      setTestStatus({ valid: false, message: msg });
      toast.error(msg);
    } finally {
      setTesting(false);
    }
  };

  const handleRemoveKey = () => {
    if (typeof clearGroqKey === 'function') {
      clearGroqKey();
    } else if (typeof setGroqApiKey === 'function') {
      setGroqApiKey('');
    }
    sessionStorage.removeItem('sankalp_groq_session_key');
    localStorage.removeItem('sankalp_setting_groq_api_key');
    setInputKey('');
    setTestStatus(null);
    toast.success('API key removed from session memory');
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('study.sankalp.ai@gmail.com');
    setCopiedEmail(true);
    toast.success('Support email copied to clipboard!');
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleClearCache = async () => {
    try {
      setClearingCache(true);
      await clearResponseCache();
      toast.success('AI response cache cleared successfully!');
    } catch (err) {
      toast.error('Failed to clear offline cache');
    } finally {
      setClearingCache(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-10 select-none animate-in fade-in duration-200">
      {/* 1. Header with Live Status Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white">
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure your AI credentials, visual appearance, and offline cache.
          </p>
        </div>

        {/* Live Engine Status Pill */}
        <div className="self-start sm:self-auto">
          {isAiActive ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>AI Connected</span>
              <span className="text-[10px] opacity-75 font-mono hidden md:inline">
                ({groqModel.split('/')[1] || groqModel})
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-gray-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>AI Key Required</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. AI PROVIDER & MODEL (BYOK) */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 shadow-2xs space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 flex items-center justify-center text-gray-900 dark:text-white">
                <Key className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-950 dark:text-white">
                Groq AI Engine Credentials
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl">
              Connect your personal Groq API key to power oral viva examinations, 15-mark model answers, and syllabus reasoning with ultra-low latency.
            </p>
          </div>

          <a
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-900 dark:text-white bg-gray-100 hover:bg-gray-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 transition-colors shrink-0"
          >
            <span>Get Free Groq Key</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Compact Security & Network Guarantees Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="p-3 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800/80 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-[11px] sm:text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
              <strong className="text-gray-950 dark:text-white">Session-Only Storage:</strong> Your key is kept only in browser memory and is never logged or saved to any database.
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800/80 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] sm:text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
              <strong className="text-gray-950 dark:text-white">VPN Advisory:</strong> Groq Cloudflare blocks active proxies. Turn off VPNs (Proton, etc.) before saving your key.
            </div>
          </div>
        </div>

        {/* API Key Input Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-800 dark:text-gray-200">
            <label htmlFor="groqKeyInput">Groq API Key</label>
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noreferrer"
              className="sm:hidden text-xs text-gray-600 dark:text-gray-400 underline"
            >
              Get Free Key →
            </a>
          </div>

          <div className="relative">
            <input
              id="groqKeyInput"
              type={showKey ? 'text' : 'password'}
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="gsk_..."
              className="w-full pl-3.5 pr-20 py-2.5 sm:py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-xs sm:text-sm font-mono text-gray-950 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors cursor-pointer"
              title={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Verification Status Alert */}
          {testStatus && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in ${testStatus.valid
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                }`}
            >
              {testStatus.valid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{testStatus.message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleTestAndSaveKey}
              disabled={testing || !inputKey.trim() || isAiActive}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all w-full sm:w-auto text-center cursor-pointer shadow-xs ${isAiActive
                  ? 'bg-emerald-600 dark:bg-emerald-600 text-white cursor-default'
                  : 'bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
            >
              {testing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying Connection...</span>
                </>
              ) : isAiActive ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Key Verified & Active</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Save & Activate Key</span>
                </>
              )}
            </button>

            {isAiConnected && (
              <button
                type="button"
                onClick={handleRemoveKey}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 border border-gray-200 dark:border-neutral-800 transition-colors w-full sm:w-auto text-center cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Key</span>
              </button>
            )}
          </div>
        </div>

        {/* Model Selection Dropdown */}
        <div className="pt-4 border-t border-gray-100 dark:border-neutral-800/80 space-y-2">
          <label className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-gray-700 dark:text-gray-300" /> Active Groq LLM Model
          </label>
          <select
            value={groqModel}
            onChange={(e) => setGroqModel(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 font-semibold text-xs text-gray-950 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors cursor-pointer"
          >
            {availableModels.map((m) => (
              <option key={m.id} value={m.id} className="bg-white dark:bg-neutral-900 text-gray-950 dark:text-white">
                {m.name || m.id}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
            GPT OSS 120B is recommended for structured university exam answers and oral viva evaluations. GPT OSS 20B provides instant, sub-second generation.
          </p>
        </div>
      </div>

      {/* 3. APPEARANCE & INTERFACE THEME (Pure Monochrome Tactile Cards) */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 shadow-2xs space-y-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 flex items-center justify-center text-gray-900 dark:text-white">
              <Palette className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-gray-950 dark:text-white">
              Appearance & Interface Theme
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl">
            Switch between clean high-contrast Light Mode, AMOLED True Black Dark Mode, or sync with your system preference.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Light Theme Button */}
          <button
            type="button"
            onClick={() => {
              setTheme('light');
              toast.success('Switched to Light Mode', { id: 'theme-toast' });
            }}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 cursor-pointer ${!darkMode && theme !== 'system'
                ? 'bg-neutral-50 dark:bg-neutral-900 border-black dark:border-white ring-2 ring-black/10 dark:ring-white/20 shadow-xs'
                : 'bg-white dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 hover:border-gray-400 dark:hover:border-neutral-700'
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 flex items-center justify-center text-gray-900 dark:text-white">
                <Sun className="w-4 h-4" />
              </div>
              {!darkMode && theme !== 'system' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black text-white dark:bg-white dark:text-black">
                  Active
                </span>
              )}
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-950 dark:text-white">Light Mode</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Crisp, paper-like daytime study</p>
            </div>
          </button>

          {/* Dark Theme Button */}
          <button
            type="button"
            onClick={() => {
              setTheme('dark');
              toast.success('Switched to AMOLED Dark Mode', { id: 'theme-toast' });
            }}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 cursor-pointer ${darkMode && theme !== 'system'
                ? 'bg-neutral-50 dark:bg-neutral-900 border-black dark:border-white ring-2 ring-black/10 dark:ring-white/20 shadow-xs'
                : 'bg-white dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 hover:border-gray-400 dark:hover:border-neutral-700'
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 flex items-center justify-center text-gray-900 dark:text-white">
                <Moon className="w-4 h-4" />
              </div>
              {darkMode && theme !== 'system' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black text-white dark:bg-white dark:text-black">
                  Active
                </span>
              )}
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-950 dark:text-white">AMOLED Dark</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">True pitch black late-night comfort</p>
            </div>
          </button>

          {/* System Theme Button */}
          <button
            type="button"
            onClick={() => {
              setTheme('system');
              toast.success('Switched to System Theme', { id: 'theme-toast' });
            }}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 cursor-pointer ${theme === 'system'
                ? 'bg-neutral-50 dark:bg-neutral-900 border-black dark:border-white ring-2 ring-black/10 dark:ring-white/20 shadow-xs'
                : 'bg-white dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 hover:border-gray-400 dark:hover:border-neutral-700'
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 flex items-center justify-center text-gray-900 dark:text-white">
                <Monitor className="w-4 h-4" />
              </div>
              {theme === 'system' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black text-white dark:bg-white dark:text-black">
                  Active
                </span>
              )}
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-950 dark:text-white">System Auto</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Follows iOS & Android device theme</p>
            </div>
          </button>
        </div>
      </div>

      {/* 4. ACADEMIC SCOPE & OFFLINE CACHE MANAGEMENT */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 shadow-2xs space-y-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 flex items-center justify-center text-gray-900 dark:text-white">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-gray-950 dark:text-white">
              Academic Scope & Device Cache
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl">
            Control your active university course curriculum and manage local IndexedDB offline storage.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Active Course & Semester Scope */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800/80 flex flex-col justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Active Curriculum Scope
              </span>
              <p className="text-sm font-bold text-gray-950 dark:text-white">
                {selectedCourse ? `${selectedCourse.code} • ${selectedSemester?.name || 'Semester'}` : 'All University Courses'}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                Questions and papers are filtered according to this academic scope.
              </p>
            </div>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-white hover:underline pt-1"
            >
              <span>Change Course in Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Offline Cache & PWA Status */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800/80 flex flex-col justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Offline Memory & Storage
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-gray-950 dark:text-white">IndexedDB Active</span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                Subject question history and syllabus are stored securely on this device.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <button
                type="button"
                onClick={handleClearCache}
                disabled={clearingCache}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                {clearingCache ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>Clear AI Cache</span>
              </button>

              {isInstallable && !isInstalled && (
                <button
                  type="button"
                  onClick={promptInstall}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-black dark:bg-white text-white dark:text-black shadow-2xs hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Install App</span>
                </button>
              )}

              {isInstalled && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Installed App
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. STUDENT SUPPORT & ACADEMIC ENQUIRIES */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 shadow-2xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 flex items-center justify-center text-gray-900 dark:text-white shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-950 dark:text-white">
              Student Support & Curriculum Updates
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Need syllabus updates for your university, found an error, or have suggestions?
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
              Official University Support Email
            </span>
            <a
              href="mailto:study.sankalp.ai@gmail.com"
              className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white hover:underline font-mono"
            >
              study.sankalp.ai@gmail.com
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyEmail}
              className="flex-1 sm:flex-none justify-center px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-xs font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copiedEmail ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Email</span>
                </>
              )}
            </button>

            <a
              href="mailto:study.sankalp.ai@gmail.com?subject=SANKALP%20AI%20Curriculum%20Enquiry"
              className="flex-1 sm:flex-none justify-center px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Send Query</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
