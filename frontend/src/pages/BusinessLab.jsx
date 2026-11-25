import React, { useState, useEffect, useRef } from 'react';
import {
  Briefcase,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShieldAlert,
  Users,
  DollarSign,
  PieChart,
  HeartHandshake,
  Clock,
  ArrowRight,
  RotateCcw,
  Volume2,
  Mic,
  MicOff,
  Copy,
  Check,
  Building2,
  ChevronRight,
  Layers,
  Award,
  Zap,
  Target,
  FileText,
  Printer,
  ChevronDown,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';
import { caseStudyApi } from '../lib/api';
import useAppStore from '../store/appStore';
import MarkdownRenderer from '../components/common/MarkdownRenderer';
import toast from 'react-hot-toast';

const DOMAINS = [
  { id: 'all', label: 'All Crises' },
  { id: 'startup', label: 'Runway & Cash Burn' },
  { id: 'competition', label: 'Price War & Defense' },
  { id: 'crisis', label: 'Recall & Public Safety' },
  { id: 'ethics', label: 'Ethics & Internal Revolt' },
  { id: 'growth', label: 'Hostile Scale & Pivot' },
];

export default function BusinessLab() {
  const { groqApiKey, groqModel } = useAppStore();

  // State: Case data
  const [currentCase, setCurrentCase] = useState(null);
  const [presets, setPresets] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [isLoadingCase, setIsLoadingCase] = useState(true);
  const [isGeneratingAiCase, setIsGeneratingAiCase] = useState(false);

  // Simulation Game State
  const [turn, setTurn] = useState(1); // 1, 2, or 3 (complete)
  const [vitals, setVitals] = useState(null);
  const [vitalsHistory, setVitalsHistory] = useState([]);
  const [decisionHistory, setDecisionHistory] = useState([]);
  const [consequenceHistory, setConsequenceHistory] = useState([]);
  const [currentDecision, setCurrentDecision] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  // Audit / Evaluation State
  const [evaluation, setEvaluation] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Mobile Tab Toggle ('dossier' vs 'warroom')
  const [mobileTab, setMobileTab] = useState('warroom');

  // Voice Dictation State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Load Presets on Mount
  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    setIsLoadingCase(true);
    try {
      const res = await caseStudyApi.getPresets();
      if (res.data?.success && res.data.data?.length > 0) {
        setPresets(res.data.data);
        initCase(res.data.data[0]);
      }
    } catch (err) {
      console.error('Failed to load preset cases:', err);
      toast.error('Using offline case engine');
    } finally {
      setIsLoadingCase(false);
    }
  };

  const initCase = (caseObj) => {
    setCurrentCase(caseObj);
    setTurn(1);
    const initialVitals = { ...caseObj.financial_vitals };
    setVitals(initialVitals);
    setVitalsHistory([initialVitals]);
    setDecisionHistory([]);
    setConsequenceHistory([]);
    setCurrentDecision('');
    setEvaluation(null);
  };

  const handleGenerateAiCase = async (domainToUse = selectedDomain) => {
    setIsGeneratingAiCase(true);
    const effectiveDomain = domainToUse === 'all' ? 'startup' : domainToUse;
    try {
      const res = await caseStudyApi.generateCase({
        domain: effectiveDomain,
        apiKey: groqApiKey,
        model: groqModel,
      });
      if (res.data?.success && res.data.data) {
        initCase(res.data.data);
        toast.success(`Generated: ${res.data.data.company_name} Crisis`);
      }
    } catch (err) {
      console.error('AI Case generation error:', err);
      toast.error('Failed to generate AI case, loaded fallback dilemma');
    } finally {
      setIsGeneratingAiCase(false);
    }
  };

  // Voice Speech Recognition Setup
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported in this browser. Please type your strategy.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        toast.success('Listening... Speak your strategic plan.');
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setCurrentDecision((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech init error:', err);
      setIsListening(false);
    }
  };

  // Execute Strategic Decision Turn
  const handleExecuteDecision = async () => {
    if (!currentDecision.trim()) {
      toast.error('Please formulate your strategic decision before executing.');
      return;
    }

    setIsSimulating(true);
    const submittedDecision = currentDecision.trim();

    try {
      const res = await caseStudyApi.simulateTurn({
        scenario: currentCase,
        current_vitals: vitals,
        turn_number: turn,
        student_decision: submittedDecision,
        decision_history: decisionHistory,
        apiKey: groqApiKey,
        model: groqModel,
      });

      if (res.data?.success && res.data.data) {
        const sim = res.data.data;
        const newVitals = sim.new_vitals;

        // Record history
        const updatedDecisions = [...decisionHistory, submittedDecision];
        const updatedConsequences = [...consequenceHistory, sim];
        const updatedVitalsHistory = [...vitalsHistory, newVitals];

        setDecisionHistory(updatedDecisions);
        setConsequenceHistory(updatedConsequences);
        setVitals(newVitals);
        setVitalsHistory(updatedVitalsHistory);
        setCurrentDecision('');

        if (turn >= 2 || sim.is_final) {
          setTurn(3); // Completed! Trigger evaluation
          handleTriggerEvaluation(updatedDecisions, updatedConsequences, newVitals);
        } else {
          setTurn(2);
          toast.success('Day 30 Simulation Complete: Review market reaction & phase 2 crisis.');
        }
      }
    } catch (err) {
      console.error('Simulation error:', err);
      toast.error('Error running simulation turn. Please retry.');
    } finally {
      setIsSimulating(false);
    }
  };

  // Trigger Final Thinking Audit Evaluation
  const handleTriggerEvaluation = async (allDecisions, allHistory, finalVitals) => {
    setIsEvaluating(true);
    try {
      const res = await caseStudyApi.evaluateSimulation({
        scenario: currentCase,
        decisions: allDecisions,
        history: allHistory,
        final_vitals: finalVitals,
        apiKey: groqApiKey,
        model: groqModel,
      });
      if (res.data?.success) {
        setEvaluation(res.data.data);
        toast.success('Corporate Board Audit Complete!');
      }
    } catch (err) {
      console.error('Evaluation error:', err);
      toast.error('Failed to generate final evaluation');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Format INR Currency
  const formatInr = (num) => {
    if (typeof num !== 'number') return '₹0';
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)} Cr`;
    }
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(1)} L`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
  };

  // Calculate Delta Indicators
  const getLatestDelta = (key) => {
    if (vitalsHistory.length < 2) return null;
    const current = vitalsHistory[vitalsHistory.length - 1][key];
    const prev = vitalsHistory[vitalsHistory.length - 2][key];
    if (current === undefined || prev === undefined) return null;
    return current - prev;
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 dark:bg-black text-gray-900 dark:text-zinc-100 select-none overflow-hidden font-sans">
      {/* 1. TOP EXECUTIVE HUD & CONTROLS (Horizontally scrollable on mobile) */}
      <header className="w-full bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-neutral-800 shrink-0 shadow-xs overflow-x-auto no-scrollbar scrollbar-transparent">
        <div className="min-w-max w-full px-3 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          {/* Left: Brand & Company Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-sm shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
            <div className="shrink-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-sm font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-1.5 whitespace-nowrap">
                  <span>{currentCase?.company_name || 'Loading War Room...'}</span>
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider font-bold bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 whitespace-nowrap">
                  {currentCase?.industry || 'MBA Strategic Sim'}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-neutral-400 max-w-xs sm:max-w-md truncate whitespace-nowrap block">
                {currentCase?.headline || 'High-Stakes Decision Laboratory'}
              </p>
            </div>
          </div>

          {/* Center / Right Controls: Turn Progression & Preset Select */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Turn Tracker Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-[11px] font-mono whitespace-nowrap">
              <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="text-gray-500 dark:text-neutral-400 font-sans">Phase:</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {turn === 1 ? 'Turn 1/2 (Crisis)' : turn === 2 ? 'Turn 2/2 (Twist)' : 'Final Resolution'}
              </span>
            </div>

            {/* Quick Dilemma Switcher Dropdown */}
            <div className="relative group shrink-0">
              <select
                value={currentCase?.id || ''}
                onChange={(e) => {
                  const found = presets.find((p) => p.id === e.target.value);
                  if (found) initCase(found);
                }}
                className="appearance-none bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700 rounded-xl px-3 py-1.5 pr-7 text-xs font-medium text-gray-800 dark:text-neutral-200 focus:outline-none cursor-pointer shadow-xs whitespace-nowrap"
              >
                {presets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.company_name} ({p.domain.split('&')[0]})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* AI Generator Button */}
            <button
              type="button"
              onClick={() => handleGenerateAiCase()}
              disabled={isGeneratingAiCase}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-98 disabled:opacity-50 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Sparkles className={`w-3.5 h-3.5 shrink-0 ${isGeneratingAiCase ? 'animate-spin' : ''}`} />
              <span className="whitespace-nowrap">
                {isGeneratingAiCase ? 'Generating...' : 'AI New Case'}
              </span>
            </button>

            {/* Reset Button */}
            <button
              type="button"
              onClick={() => currentCase && initCase(currentCase)}
              title="Restart Scenario"
              className="p-1.5 rounded-xl border border-gray-200 dark:border-neutral-800 text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. THE 4 VITAL GAUGES RIBBON */}
      <div className="px-3 sm:px-6 py-2 bg-gray-100/70 dark:bg-[#0e0e0e] border-b border-gray-200 dark:border-neutral-800/80 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 shrink-0">
        {/* Gauge 1: Cash & Runway */}
        <div className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-neutral-900/90 border border-gray-200 dark:border-neutral-800 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] text-gray-500 dark:text-neutral-400 font-medium flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-500" />
              Cash &amp; Runway
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white font-mono">
                {formatInr(vitals?.cash)}
              </span>
              <span className="text-[10px] text-gray-500 font-mono">
                ({vitals?.runway_days || 0}d)
              </span>
            </div>
          </div>
          {getLatestDelta('cash') !== null && (
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                getLatestDelta('cash') >= 0
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-rose-500/10 text-rose-500'
              }`}
            >
              {getLatestDelta('cash') >= 0 ? '+' : ''}
              {formatInr(getLatestDelta('cash'))}
            </span>
          )}
        </div>

        {/* Gauge 2: Team Morale */}
        <div className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-neutral-900/90 border border-gray-200 dark:border-neutral-800 flex items-center justify-between shadow-2xs">
          <div className="w-full mr-2">
            <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-neutral-400 font-medium">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-blue-500" />
                Team Morale
              </span>
              <span className="font-bold text-gray-900 dark:text-white font-mono">
                {vitals?.team_morale || 0}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 dark:bg-neutral-800 rounded-full mt-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  (vitals?.team_morale || 0) > 60
                    ? 'bg-blue-500'
                    : (vitals?.team_morale || 0) > 35
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, vitals?.team_morale || 0)}%` }}
              />
            </div>
          </div>
          {getLatestDelta('team_morale') !== null && (
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                getLatestDelta('team_morale') >= 0
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-rose-500/10 text-rose-500'
              }`}
            >
              {getLatestDelta('team_morale') >= 0 ? '+' : ''}
              {getLatestDelta('team_morale')}%
            </span>
          )}
        </div>

        {/* Gauge 3: Market Share */}
        <div className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-neutral-900/90 border border-gray-200 dark:border-neutral-800 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] text-gray-500 dark:text-neutral-400 font-medium flex items-center gap-1">
              <PieChart className="w-3 h-3 text-indigo-500" />
              Market Share
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white font-mono">
                {vitals?.market_share || 0}%
              </span>
              <span className="text-[10px] text-gray-400 font-sans">Territory</span>
            </div>
          </div>
          {getLatestDelta('market_share') !== null && (
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                getLatestDelta('market_share') >= 0
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-rose-500/10 text-rose-500'
              }`}
            >
              {getLatestDelta('market_share') >= 0 ? '+' : ''}
              {getLatestDelta('market_share')}%
            </span>
          )}
        </div>

        {/* Gauge 4: Brand Trust & Volatility */}
        <div className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-neutral-900/90 border border-gray-200 dark:border-neutral-800 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] text-gray-500 dark:text-neutral-400 font-medium flex items-center gap-1">
              <HeartHandshake className="w-3 h-3 text-purple-500" />
              Brand Trust
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white font-mono">
                {vitals?.brand_trust || 0}%
              </span>
              <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                {vitals?.risk_level || 'Moderate'}
              </span>
            </div>
          </div>
          {getLatestDelta('brand_trust') !== null && (
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                getLatestDelta('brand_trust') >= 0
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-rose-500/10 text-rose-500'
              }`}
            >
              {getLatestDelta('brand_trust') >= 0 ? '+' : ''}
              {getLatestDelta('brand_trust')}%
            </span>
          )}
        </div>
      </div>

      {/* MOBILE TAB SWITCHER (For phone screens) */}
      <div className="lg:hidden flex items-center justify-center p-2 border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shrink-0">
        <div className="flex rounded-xl bg-gray-100 dark:bg-neutral-900 p-0.5 text-xs font-semibold w-full max-w-sm">
          <button
            type="button"
            onClick={() => setMobileTab('dossier')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
              mobileTab === 'dossier'
                ? 'bg-white dark:bg-neutral-800 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-neutral-400'
            }`}
          >
            Dossier &amp; Brief
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('warroom')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
              mobileTab === 'warroom'
                ? 'bg-white dark:bg-neutral-800 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-neutral-400'
            }`}
          >
            War Room &amp; Decisions
          </button>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE: 2-COLUMN SPLIT */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT COLUMN: THE EXECUTIVE CASE DOSSIER */}
        <div
          className={`lg:col-span-5 h-full flex flex-col min-h-0 border-r border-gray-200 dark:border-neutral-800/80 bg-white dark:bg-[#080808] overflow-y-auto p-4 sm:p-5 space-y-4 ${
            mobileTab === 'dossier' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Headline & Domain */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{currentCase?.domain || 'Executive Dilemma'}</span>
            </span>
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white leading-snug">
              {currentCase?.headline}
            </h2>
          </div>

          {/* Background Story */}
          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-800/80 text-xs sm:text-[13px] text-gray-700 dark:text-neutral-300 leading-relaxed space-y-2">
            <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5 text-xs">
              <Building2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Company Background</span>
            </p>
            <p>{currentCase?.background}</p>
          </div>

          {/* The Ticking Clock Crisis */}
          <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-xs sm:text-[13px] text-gray-800 dark:text-neutral-200 leading-relaxed space-y-2">
            <p className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5 text-xs">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>The Burning Platform Dilemma</span>
            </p>
            <p>{currentCase?.crisis_context}</p>
          </div>

          {/* Key Strategic Constraints */}
          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-800/80 space-y-2.5">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-500" />
              <span>Operating Realities &amp; Limits</span>
            </h4>
            <div className="space-y-1.5 text-xs text-gray-600 dark:text-neutral-400">
              <div className="flex items-center justify-between py-1 border-b border-gray-200/60 dark:border-neutral-800/60">
                <span>Monthly Cash Burn:</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                  {formatInr(vitals?.burn_rate)} / month
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-200/60 dark:border-neutral-800/60">
                <span>Total Cash Remaining:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatInr(vitals?.cash)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Critical Runway Limit:</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  {vitals?.runway_days} Days to Insolvency
                </span>
              </div>
            </div>
          </div>

          {/* Tactical Options Inspiration (If available) */}
          {currentCase?.quick_options && currentCase.quick_options.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-gray-500 dark:text-neutral-400 font-bold block">
                Executive Playbook Options:
              </span>
              <div className="space-y-1.5">
                {currentCase.quick_options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentDecision(opt)}
                    className="w-full text-left p-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white dark:bg-neutral-900 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-xs text-gray-700 dark:text-neutral-300 transition-all flex items-start gap-2 group cursor-pointer shadow-2xs"
                  >
                    <span className="w-4 h-4 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-snug text-[11px] sm:text-xs">{opt}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: THE WAR ROOM & DECISION TIMELINE */}
        <div
          className={`lg:col-span-7 h-full flex flex-col min-h-0 bg-gray-50 dark:bg-[#0a0a0a] overflow-hidden ${
            mobileTab === 'warroom' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Scrollable Dialogue & Consequence History Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* 1. STAKEHOLDERS PERSPECTIVE CARDS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-widest text-gray-500 dark:text-neutral-400 font-bold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                  <span>The Boardroom Pressure Cooker: 3 Conflicting Demands</span>
                </span>
                <span className="text-[10px] text-gray-400 font-mono">Phase 1 Input</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {currentCase?.stakeholders?.map((sh, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-white dark:bg-neutral-900/80 border border-gray-200 dark:border-neutral-800 flex flex-col justify-between shadow-2xs space-y-2 hover:border-gray-300 dark:hover:border-neutral-700 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                        <h5 className="text-[11px] font-bold text-gray-900 dark:text-white truncate">
                          {sh.role}
                        </h5>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 uppercase tracking-wider block mb-2">
                        {sh.stance}
                      </span>
                      <p className="text-[11px] text-gray-600 dark:text-neutral-300 italic leading-snug">
                        "{sh.statement}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. CONSEQUENCE HISTORY (If Turn >= 2) */}
            {consequenceHistory.map((consequence, idx) => (
              <div
                key={idx}
                className="space-y-3 p-4 rounded-2xl bg-indigo-50/60 dark:bg-[#101322] border border-indigo-200 dark:border-indigo-900/50 shadow-md animate-in fade-in duration-300"
              >
                {/* News Ticker Headline */}
                <div className="flex items-center justify-between pb-2 border-b border-indigo-200/60 dark:border-indigo-900/60">
                  <span className="text-[11px] font-mono font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5 uppercase">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                    <span>{consequence.time_jump_label}</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                    Market Turn {idx + 1}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                  📰 Breaking: {consequence.news_headline}
                </h4>

                <p className="text-xs text-gray-700 dark:text-neutral-300 leading-relaxed">
                  {consequence.market_reaction}
                </p>

                {/* Second-Order Surprise Box */}
                {consequence.unintended_consequence && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                    <span className="font-bold text-[11px] uppercase tracking-wider flex items-center gap-1 text-amber-800 dark:text-amber-400">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Second-Order Consequence (The Ripple Effect):</span>
                    </span>
                    <p className="text-[11px] leading-relaxed">
                      {consequence.unintended_consequence}
                    </p>
                  </div>
                )}

                {/* Follow-up Dilemma for Phase 2 */}
                {consequence.next_dilemma && (
                  <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-indigo-200 dark:border-neutral-800 space-y-1.5">
                    <span className="text-[11px] font-mono font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                      Phase 2 Crisis Trigger:
                    </span>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      {consequence.next_dilemma}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {/* 3. FINAL EVALUATION REPORT (When Simulation Finishes) */}
            {evaluation && (
              <div className="space-y-4 p-5 rounded-2xl bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-neutral-800 shadow-xl animate-in zoom-in-95 duration-300">
                {/* Header Verdict */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-gray-200 dark:border-neutral-800">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-500 font-bold block">
                      Corporate Boardroom Audit
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                      {evaluation.survival_verdict}
                    </h3>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                      evaluation.verdict_badge === 'SUCCESS'
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                    }`}
                  >
                    {evaluation.verdict_badge}
                  </span>
                </div>

                {/* Executive Summary */}
                <p className="text-xs sm:text-[13px] text-gray-700 dark:text-neutral-300 leading-relaxed">
                  {evaluation.executive_summary}
                </p>

                {/* 4 Critical Thinking Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {evaluation.critical_thinking_metrics &&
                    Object.entries(evaluation.critical_thinking_metrics).map(([key, item]) => (
                      <div
                        key={key}
                        className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-center"
                      >
                        <span className="text-[10px] font-mono text-gray-500 dark:text-neutral-400 uppercase tracking-wider block">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <div className="text-base font-extrabold text-gray-900 dark:text-white mt-0.5">
                          {item.score}/100
                        </div>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                          Grade {item.grade}
                        </span>
                      </div>
                    ))}
                </div>

                {/* Cognitive Biases Detected */}
                {evaluation.biases_detected && evaluation.biases_detected.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>Cognitive Thinking Patterns &amp; Biases Detected:</span>
                    </span>
                    <div className="space-y-1.5">
                      {evaluation.biases_detected.map((b, bIdx) => (
                        <div
                          key={bIdx}
                          className="p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-800 text-xs text-gray-700 dark:text-neutral-300"
                        >
                          <span className="font-bold text-gray-900 dark:text-white font-mono mr-1.5">
                            [{b.bias_name}]:
                          </span>
                          <span>{b.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Devil's Advocate / Alternate Timeline */}
                {evaluation.devils_advocate && (
                  <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 text-xs text-purple-900 dark:text-purple-200 space-y-1">
                    <span className="font-bold text-[11px] uppercase tracking-wider flex items-center gap-1 text-purple-700 dark:text-purple-400">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>The Devil's Advocate (Alternate Universe):</span>
                    </span>
                    <p className="text-[11px] leading-relaxed">
                      {evaluation.devils_advocate}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-800 hover:border-gray-300 text-gray-700 dark:text-neutral-300 text-xs font-medium flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Audit Report</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGenerateAiCase()}
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <span>Play Next Business Dilemma</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Strategy Decision Input Bar (Visible until final evaluation) */}
          {!evaluation && (
            <div className="p-3 sm:p-4 bg-white dark:bg-[#0c0c0c] border-t border-gray-200 dark:border-neutral-800 space-y-2 shrink-0">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-500" />
                  <span>
                    {turn === 1
                      ? 'Your Strategic Battle Plan (Phase 1 Action)'
                      : 'Your Response to Market Twist (Phase 2 Action)'}
                  </span>
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  {currentDecision.length}/1000 chars
                </span>
              </div>

              <div className="relative">
                <textarea
                  value={currentDecision}
                  onChange={(e) => setCurrentDecision(e.target.value)}
                  placeholder="Formulate your executive strategy: What trade-offs will you accept? How will you reallocate capital, defend reputation, and respond to the board?"
                  rows={3}
                  className="w-full bg-gray-50 dark:bg-black/80 border border-gray-200 dark:border-neutral-700 focus:border-indigo-500 rounded-xl p-3 pr-10 text-xs sm:text-[13px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none shadow-xs resize-none"
                />

                {/* Mic Speech-to-Text Button */}
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  title={isListening ? 'Stop Listening' : 'Dictate with Voice'}
                  className={`absolute right-2.5 bottom-2.5 p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'text-gray-400 hover:text-gray-700 dark:hover:text-white bg-gray-200/50 dark:bg-neutral-800'
                  }`}
                >
                  {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>
              </div>

              {/* Action Submit Buttons */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">
                  ⚡ Groq LLaMA-3 Real-Time Economic Simulator
                </span>
                <button
                  type="button"
                  onClick={handleExecuteDecision}
                  disabled={isSimulating || !currentDecision.trim()}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  {isSimulating ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>Simulating 30 Days Later...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      <span>
                        {turn === 1 ? 'Execute Strategy (Jump 30 Days)' : 'Resolve Dilemma & View Audit'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
