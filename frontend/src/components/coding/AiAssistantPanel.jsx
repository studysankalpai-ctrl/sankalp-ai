import React, { useState } from 'react';
import {
  Sparkles,
  Bug,
  Gauge,
  Lightbulb,
  CheckCircle,
  HelpCircle,
  Key,
  Copy,
  Check,
  RefreshCw,
  ChevronRight,
  Flame,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import MarkdownRenderer from '../common/MarkdownRenderer';
import { codingApi } from '../../lib/api';
import useAppStore from '../../store/appStore';
import toast from 'react-hot-toast';

const AI_ACTIONS = [
  { id: 'explain', label: 'Explain Code', icon: HelpCircle, desc: 'Line-by-line clear explanation in plain English' },
  { id: 'debug', label: 'AI Debugger', icon: Bug, desc: 'Detect bugs, logic errors & edge cases with fixes' },
  { id: 'complexity', label: 'Big-O Complexity', icon: Gauge, desc: 'Analyze Time & Space limits and bottlenecks' },
  { id: 'hint', label: 'Progressive Hints', icon: Lightbulb, desc: 'Nudges without spoiling the answer' },
  { id: 'solution', label: 'Strategy & Pattern', icon: CheckCircle, desc: 'Algorithmic approach & intuition (you write code)' },
];

export default function AiAssistantPanel({
  problemSlug,
  language = 'python',
  code = '',
  studentId,
}) {
  const { groqApiKey, groqModel, setGroqApiKey } = useAppStore();
  const [activeAction, setActiveAction] = useState('explain');
  const [hintLevel, setHintLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [copied, setCopied] = useState(false);
  const [inlineKey, setInlineKey] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);

  const handleSaveInlineKey = () => {
    const cleanKey = inlineKey.trim();
    if (!cleanKey) return;
    if (setGroqApiKey) {
      setGroqApiKey(cleanKey);
    }
    localStorage.setItem('groq_api_key', cleanKey);
    setIsSavingKey(false);
    toast.success('Groq API Key saved successfully! AI Mentor is ready.');
  };

  const handleRequestAssist = async (actionToRun = activeAction, specificHintLevel = hintLevel) => {
    if (!code || code.trim().length === 0) {
      toast.error('Please write some code in the editor first');
      return;
    }

    if (!groqApiKey && !inlineKey.trim()) {
      toast.error('Please enter your free Groq API key to activate AI Mentor');
      return;
    }

    setIsLoading(true);
    setAiResponse('');

    const keyToUse = groqApiKey || inlineKey.trim();

    try {
      const res = await codingApi.requestAiAssist({
        studentId,
        problemSlug,
        language,
        code,
        action: actionToRun,
        hintLevel: specificHintLevel,
        groqApiKey: keyToUse,
        groqModel: groqModel || undefined,
      });

      if (res.data?.success) {
        setAiResponse(res.data.data.response);
      } else {
        toast.error(res.data?.message || 'AI request failed');
      }
    } catch (err) {
      console.error('AI assistant error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Error communicating with AI';
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!aiResponse) return;
    try {
      await navigator.clipboard.writeText(aiResponse);
      setCopied(true);
      toast.success('Copied AI response');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-neutral-800/80 overflow-hidden shadow-xs dark:shadow-2xl">
      {/* Header bar */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-[#121212] border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-700/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-900 dark:text-white tracking-wide flex items-center gap-1.5">
              Sankalp AI Coding Mentor
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono border border-emerald-200 dark:border-transparent">
                {groqApiKey ? 'ACTIVE' : 'SETUP'}
              </span>
            </h3>
            <p className="text-[10px] text-gray-500 dark:text-neutral-400">Powered by Ultra-Fast Llama 3</p>
          </div>
        </div>

        {groqApiKey ? (
          <span className="text-[10px] text-gray-500 dark:text-neutral-500 font-mono">
            Key: ••••{groqApiKey.slice(-4)}
          </span>
        ) : (
          <a
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            <span>Get Free Key</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Inline Key Configuration Banner if no key */}
      {!groqApiKey && (
        <div className="p-3 bg-indigo-50/70 dark:bg-[#131520] border-b border-indigo-200 dark:border-indigo-950/80 space-y-2 text-xs shrink-0">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Enter Free Groq API Key to Activate AI Mentor:
            </span>
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 font-medium"
            >
              <span>Instant Free Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="password"
              value={inlineKey}
              onChange={(e) => setInlineKey(e.target.value)}
              placeholder="Paste free key: gsk_..."
              className="flex-1 bg-white dark:bg-black/60 border border-gray-300 dark:border-neutral-700 focus:border-indigo-500 rounded-lg px-2.5 py-1 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500 font-mono focus:outline-none shadow-2xs"
            />
            <button
              type="button"
              onClick={handleSaveInlineKey}
              disabled={!inlineKey.trim()}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors disabled:opacity-40 shadow-xs"
            >
              Save Key
            </button>
          </div>
        </div>
      )}

      {/* Action Selector Pills */}
      <div className="px-3 py-2 border-b border-gray-200 dark:border-neutral-800/80 bg-gray-50/60 dark:bg-[#0d0d0d] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        {AI_ACTIONS.map((action) => {
          const Icon = action.icon;
          const isSelected = activeAction === action.id;
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => {
                setActiveAction(action.id);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap border ${
                isSelected
                  ? 'bg-indigo-50 dark:bg-indigo-600/20 border-indigo-300 dark:border-indigo-500/60 text-indigo-700 dark:text-indigo-200 shadow-2xs'
                  : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-200 hover:border-gray-300 dark:hover:border-neutral-700 shadow-2xs'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Progressive Hint Sub-controls (when action === 'hint') */}
      {activeAction === 'hint' && (
        <div className="px-4 py-2 bg-gray-100 dark:bg-neutral-950 border-b border-gray-200 dark:border-neutral-800/80 flex items-center justify-between text-xs shrink-0">
          <span className="text-gray-500 dark:text-neutral-400 text-[11px]">Hint Depth:</span>
          <div className="flex items-center gap-1">
            {[
              { level: 1, label: '1. Nudge' },
              { level: 2, label: '2. Algorithm' },
              { level: 3, label: '3. Pseudocode' },
            ].map((h) => (
              <button
                key={h.level}
                type="button"
                onClick={() => {
                  setHintLevel(h.level);
                  handleRequestAssist('hint', h.level);
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                  hintLevel === h.level
                    ? 'bg-amber-100 dark:bg-amber-950/70 border-amber-400 dark:border-amber-600 text-amber-800 dark:text-amber-200'
                    : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* Trigger button */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => handleRequestAssist(activeAction, hintLevel)}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
          >
            {isLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>
              {isLoading
                ? 'Thinking...'
                : `Run ${AI_ACTIONS.find((a) => a.id === activeAction)?.label}`}
            </span>
          </button>

          {aiResponse && (
            <button
              type="button"
              onClick={handleCopy}
              className="text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700 transition-colors shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>

        {/* AI Response Display */}
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center text-gray-500 dark:text-neutral-400 space-y-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400 absolute inset-0 m-auto" />
            </div>
            <div>
              <p className="text-xs text-gray-800 dark:text-neutral-300 font-medium">Analyzing your code...</p>
              <p className="text-[11px] text-gray-400 dark:text-neutral-500">Checking edge cases, patterns, and Big-O</p>
            </div>
          </div>
        ) : aiResponse ? (
          <div className="bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-neutral-800/80 rounded-xl p-4 text-gray-800 dark:text-neutral-200 shadow-2xs">
            <MarkdownRenderer content={aiResponse} />
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center text-center text-gray-400 dark:text-neutral-500 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 flex items-center justify-center text-gray-500 dark:text-neutral-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-gray-700 dark:text-neutral-400">Ask the AI Mentor anything</p>
            <p className="text-[11px] text-gray-400 dark:text-neutral-500 max-w-xs">
              Choose an action above (Explain Code, AI Debugger, Big-O Complexity, Hints, or Strategy) and click the run button.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
