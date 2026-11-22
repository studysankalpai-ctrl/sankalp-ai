import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
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
} from 'lucide-react';
import { aiApi } from '../lib/api';
import useAppStore from '../store/appStore';
import PageHeader from '../components/common/PageHeader';
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
  } = useAppStore();

  const [inputKey, setInputKey] = useState(groqApiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // { valid: boolean, message: string }
  const [availableModels, setAvailableModels] = useState([
    { id: 'openai/gpt-oss-120b', name: 'GPT OSS 120B (Recommended - 500 t/s, 131K Context)' },
    { id: 'openai/gpt-oss-20b', name: 'GPT OSS 20B (Ultra-Fast 1000 t/s, 131K Context)' },
    { id: 'qwen/qwen3.8-27b', name: 'Qwen 3.8 27B (High Quality Reasoning)' },
    { id: 'canopylabs/orpheus-v1-english', name: 'CanopyLabs Orpheus v1 English' },
    { id: 'openai/gpt-oss-safeguard-20b', name: 'GPT OSS Safeguard 20B' },
    { id: 'canopylabs/orpheus-arabic-saudi', name: 'CanopyLabs Orpheus Arabic Saudi' },
    { id: 'meta-llama/llama-prompt-guard-2-86m', name: 'Meta Llama Prompt Guard 2 86M' },
    { id: 'meta-llama/llama-prompt-guard-2-22m', name: 'Meta Llama Prompt Guard 2 22M' },
  ]);

  // Load models dynamically on mount if API key is present
  useEffect(() => {
    async function loadLiveModels() {
      if (groqApiKey && groqApiKey.startsWith('gsk_')) {
        try {
          const res = await aiApi.getModels(groqApiKey);
          if (res.data?.success && res.data.data?.length > 0) {
            setAvailableModels(res.data.data);
          }
        } catch {}
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
            setAvailableModels(mRes.data.data);
            // Ensure groqModel is valid
            const exists = mRes.data.data.some(m => m.id === groqModel);
            if (!exists) {
              const fallback = mRes.data.data.find(m => m.id.includes('120b') || m.id.includes('20b')) || mRes.data.data[0];
              if (fallback) setGroqModel(fallback.id);
            }
          }
        } catch {}
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
    clearGroqKey();
    setInputKey('');
    setTestStatus(null);
    toast.success('API key removed from session memory');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader
        title="Settings"
        description="Add your Groq API key, choose your preferred AI model, and change your display theme."
      />

      {/* PART 8: CONNECT YOUR AI PROVIDER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Key className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Connect Your AI Provider
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
            Use your own Groq API key to activate your personal AI learning assistant. Your AI usage and provider charges are managed directly through your personal Groq account.
          </p>
        </div>

        {/* Security Assurance Card */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-xs text-indigo-950 dark:text-indigo-200 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Zero Key Storage Guarantee:</span> Your Groq API key is held only in browser session memory. It is sent via HTTPS payload solely to proxy university mentor queries and is never logged or saved to any database.
          </div>
        </div>

        {/* VPN Advisory Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Important Network Notice:</span> Groq's Cloudflare security layer strictly blocks requests from active VPNs or proxies (giving error: <em>"Access denied. Please check your network settings"</em>). If you have <strong>Proton VPN</strong> or any VPN turned on, please disconnect it before connecting your API key.
          </div>
        </div>

        {/* API Key Input */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-between">
            <span>Groq API Key (gsk_...)</span>
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              Get a Free Groq Key <ExternalLink className="w-3 h-3" />
            </a>
          </label>

          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="gsk_..."
              className="w-full pl-4 pr-24 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-mono text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Test Status Alert */}
          {testStatus && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-medium flex items-center gap-2.5 animate-in fade-in ${
                testStatus.valid
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
              }`}
            >
              {testStatus.valid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              )}
              <span>{testStatus.message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2">
            <button
              onClick={handleTestAndSaveKey}
              disabled={testing || !inputKey.trim()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors disabled:opacity-50 w-full sm:w-auto text-center"
            >
              {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {testing ? 'Testing Connection...' : 'Test & Save Key'}
            </button>

            {isAiConnected && (
              <button
                onClick={handleRemoveKey}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors w-full sm:w-auto text-center"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove Key
              </button>
            )}
          </div>
        </div>

        {/* Model Selection */}
        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-indigo-500" /> Active Groq LLM Model
          </label>
          <select
            value={groqModel}
            onChange={(e) => setGroqModel(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-medium text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-500"
          >
            {availableModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name || m.id}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-gray-400">
            GPT OSS 120B provides the highest reasoning capability for university marking schemes, while GPT OSS 20B provides 1000 t/s hyper-speed generation.
          </p>
        </div>
      </div>

      {/* APPEARANCE & THEME SETTINGS */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Palette className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Appearance & Interface Theme
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
            Choose your preferred interface theme. You can switch between Light Mode, Dark Mode, or follow your operating system default.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Light Theme Button */}
          <button
            onClick={() => {
              setTheme('light');
              toast.success('Switched to Light Mode', { id: 'theme-toast' });
            }}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
              !darkMode && theme !== 'system'
                ? 'bg-amber-50/50 border-amber-300 dark:border-amber-700 ring-2 ring-amber-500/30'
                : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Sun className="w-5 h-5" />
              </div>
              {!darkMode && theme !== 'system' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                  Active
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Light Mode</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Crisp high-contrast daytime reading</p>
            </div>
          </button>

          {/* Dark Theme Button */}
          <button
            onClick={() => {
              setTheme('dark');
              toast.success('Switched to Dark Mode', { id: 'theme-toast' });
            }}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
              darkMode && theme !== 'system'
                ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-600 ring-2 ring-indigo-500/30'
                : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Moon className="w-5 h-5" />
              </div>
              {darkMode && theme !== 'system' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                  Active
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Dark Mode</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Midnight eye-comfort for late studies</p>
            </div>
          </button>

          {/* System Theme Button */}
          <button
            onClick={() => {
              setTheme('system');
              toast.success('Switched to System Theme', { id: 'theme-toast' });
            }}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
              theme === 'system'
                ? 'bg-purple-50/50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-600 ring-2 ring-purple-500/30'
                : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Monitor className="w-5 h-5" />
              </div>
              {theme === 'system' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-600 text-white">
                  Active
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">System Theme</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Syncs automatically with device settings</p>
            </div>
          </button>
        </div>
      </div>

      {/* Platform & Academic Enquiry Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              Platform Enquiries & Student Support
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Have questions, found a bug, or want syllabus updates for your college?
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold block mb-0.5">
              Official Enquiry Email
            </span>
            <a
              href="mailto:study.sankalp.ai@gmail.com"
              className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline font-mono"
            >
              study.sankalp.ai@gmail.com
            </a>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                navigator.clipboard.writeText('study.sankalp.ai@gmail.com');
                toast.success('Email copied to clipboard!');
              }}
              className="flex-1 sm:flex-none justify-center px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Email</span>
            </button>

            <a
              href="mailto:study.sankalp.ai@gmail.com?subject=SANKALP%20AI%20Enquiry"
              className="flex-1 sm:flex-none justify-center px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
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
