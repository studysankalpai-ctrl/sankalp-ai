import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Bot,
  Key,
  Sparkles,
  Zap,
  Printer,
  FileCheck2,
  TrendingUp,
  Layers,
  CheckCircle2,
  HelpCircle,
  Mail,
  Copy,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  GraduationCap,
  Target,
  FileText,
  Clock,
  RotateCcw,
  Check,
  AlertCircle,
  Lightbulb,
  Search,
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import useAppStore from '../store/appStore';
import toast from 'react-hot-toast';

export default function Guide() {
  const { isAiConnected, selectedSubject, selectedCourse, selectedSemester } = useAppStore();
  const [activeSection, setActiveSection] = useState('quickstart');
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('study.sankalp.ai@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
    toast.success('Email copied to clipboard!');
  };

  const SECTIONS = [
    { id: 'quickstart', label: '60-Sec Quickstart', icon: Zap },
    { id: 'apikey', label: 'API Key Setup', icon: Key },
    { id: 'mentor', label: 'AI Mentor Mastery', icon: Bot },
    { id: 'learnbybook', label: 'Learn by Book Mode', icon: BookOpen },
    { id: 'caching', label: '0ms Offline Caching', icon: Zap },
    { id: 'predictions', label: '5-Yr Master Paper', icon: FileCheck2 },
    { id: 'revision', label: 'Revision & Cheatsheet', icon: Printer },
    { id: 'prohacks', label: '90%+ Exam Hacks', icon: Target },
    { id: 'faq', label: 'FAQ & Troubleshooting', icon: HelpCircle },
  ];

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800">
              Official User Manual
            </span>
            <span className="text-xs font-mono text-gray-400">Version 2.4 &bull; St. John's College, Agra</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 dark:text-white tracking-tight">
            How to Use SANKALP AI Properly
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-2xl leading-relaxed">
            A comprehensive, step-by-step master guide to preparing for university semester exams, generating 10-mark model answers, synthesizing 5-year question papers, and exporting 1-page printable cheat sheets.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Link
            to="/mentor"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all hover:scale-102"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Open AI Mentor</span>
          </Link>
          <Link
            to="/settings"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold transition-colors"
          >
            <Key className="w-3.5 h-3.5 text-gray-500" />
            <span>Settings</span>
          </Link>
        </div>
      </div>

      {/* Sticky Sub-Navigation Pills (Horizontally scrollable on mobile) */}
      <div className="sticky top-16 z-20 -mx-2 px-2 py-2 bg-gray-50/90 dark:bg-[#0f172a]/90 backdrop-blur-md rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {SECTIONS.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => {
                setActiveSection(sec.id);
                document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: 60-Second Quickstart */}
      <section id="quickstart" className="space-y-4 pt-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            1
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            The 60-Second Quickstart Guide
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-2xs space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold block">
              Step 01
            </span>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
              Connect Free Groq API Key
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Open <Link to="/settings" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Settings</Link> and paste your key from <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="underline font-semibold">console.groq.com</a>. It is 100% free and stored securely inside your browser's IndexedDB.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-2xs space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold block">
              Step 02
            </span>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
              Select Your Course & Semester
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Use the dropdown in the top header or navigate to <Link to="/subjects" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Subjects</Link>. SANKALP AI will instantly sync your verified 5 units and prescribed books.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-2xs space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold block">
              Step 03
            </span>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
              Ask AI or Solve 5-Year Papers
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Jump into <Link to="/mentor" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">AI Exam Mentor</Link> for model answers or open <Link to="/predictions" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">5-Year Paper</Link> to practice recurring university examination questions.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: API Key Setup */}
      <section id="apikey" className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            2
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Connecting Your Free Groq AI Key (BYOK)
            </h2>
            <p className="text-xs text-gray-500">Why Bring-Your-Own-Key ensures privacy, unlimited speed, and zero cost.</p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                How to get your free key in 30 seconds:
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                <li>Go to official <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 font-bold underline inline-flex items-center gap-0.5">console.groq.com <ExternalLink className="w-3 h-3" /></a></li>
                <li>Sign up with your Google account (free, no credit card required).</li>
                <li>In the left sidebar, click <strong>API Keys</strong> &rarr; <strong>Create API Key</strong>.</li>
                <li>Copy the key starting with <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-indigo-600 font-mono font-bold">gsk_...</code></li>
                <li>Paste it in <Link to="/settings" className="text-indigo-600 font-bold hover:underline">Settings</Link> and click <strong>Test & Save Key</strong>.</li>
              </ol>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 space-y-2">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Privacy & IndexedDB Storage</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                Your API key is stored <strong>locally in your browser's IndexedDB and session memory</strong>. It is never stored on our database servers. Once saved, it auto-restores across browser sessions so you never have to re-enter it.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                  isAiConnected
                    ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                    : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isAiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <span>{isAiConnected ? 'Your Key is Active & Connected' : 'Not Connected Yet'}</span>
                </span>
                <Link
                  to="/settings"
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Manage in Settings &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: AI Mentor Mastery */}
      <section id="mentor" className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            3
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Mastering the AI Exam Mentor (`/mentor`)
            </h2>
            <p className="text-xs text-gray-500">How to get accurate, mark-winning model answers instead of generic AI chatter.</p>
          </div>
        </div>

        {/* 4 Core Controls Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold">
                Control 1
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                2, 5, 10, 15M
              </span>
            </div>
            <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">Marks Target</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Always select the exact marks of your exam question. SANKALP AI dynamically adjusts word count, depth, and headings to match university marking schemes.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold">
                Control 2
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                Exam / Deep / Table
              </span>
            </div>
            <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">Answer Style</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Choose <strong>Standard Exam</strong> for paper-ready answers, <strong>Comprehensive</strong> for learning concepts, or <strong>Comparison Table</strong> for differences.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold">
                Control 3
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                EN / Hinglish / HI
              </span>
            </div>
            <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">Language Mode</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Switch to <strong>Hinglish</strong> for natural classroom explanations with real-world Indian examples, or <strong>English</strong> for academic paper writing.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold">
                Control 4
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                Learn by Book
              </span>
            </div>
            <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">Book Mode</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Toggle <strong>ON</strong> to anchor every definition and diagram directly into your prescribed university textbook (e.g. Pradeep K. Sinha).
            </p>
          </div>
        </div>

        {/* 10-Mark Model Structure Breakdown */}
        <div className="p-6 rounded-3xl bg-zinc-950 text-white border border-white/10 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-wider font-bold">
            <Target className="w-4 h-4" />
            <span>The Gold Standard 10-Mark Answer Blueprint</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            University evaluators don't read dense walls of text. SANKALP AI generates every 10-mark response with this exact winning formula:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
            <div className="p-3 rounded-xl bg-zinc-900 border border-white/10">
              <span className="text-indigo-400 block font-bold mb-1">1. Academic Hook</span>
              <span className="text-zinc-400 text-[11px]">Crisp 2-sentence definition with bolded key terms.</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900 border border-white/10">
              <span className="text-indigo-400 block font-bold mb-1">2. Architecture / Flow</span>
              <span className="text-zinc-400 text-[11px]">ASCII box diagram or flowchart steps for visual scoring.</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900 border border-white/10">
              <span className="text-indigo-400 block font-bold mb-1">3. Structured Points</span>
              <span className="text-zinc-400 text-[11px]">Bullet points with clear bold subheadings and examples.</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900 border border-white/10">
              <span className="text-indigo-400 block font-bold mb-1">4. Exam Scoring Key</span>
              <span className="text-zinc-400 text-[11px]">End summary & critical university exam cautionary tips.</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Learn by Book Mode */}
      <section id="learnbybook" className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            4
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Learn by Prescribed Book Mode
            </h2>
            <p className="text-xs text-gray-500">How to get textbook-authentic definitions that external teachers recognize.</p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-start gap-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
                Why Standard AI Fails in Indian Semester Exams
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                General AI gives generic internet answers. But university copy-checkers look for specific definitions prescribed in official curriculum textbooks (e.g. <em>Computer Fundamentals by Pradeep K. Sinha</em> or <em>Database Systems by Korth</em>).
              </p>
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" /> How to use Learn by Book:
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  In <Link to="/mentor" className="font-bold underline">AI Mentor</Link>, click the green <strong>Learn by Book: ON</strong> toggle button in the toolbar. If multiple textbooks are uploaded for that subject, select your preferred author from the adjacent dropdown. SANKALP AI will scan the exact textbook chunks to ground its response.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: 0ms IndexedDB Caching */}
      <section id="caching" className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            5
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              0ms Local IndexedDB Response Caching
            </h2>
            <p className="text-xs text-gray-500">Save Groq token limits, eliminate network lag, and revise completely offline.</p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>How Response Caching Works Automatically</span>
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Every time SANKALP AI generates a response in <strong>Mentor</strong>, <strong>Quick Revision</strong>, or <strong>Cheat Sheet</strong>, it stores that output into your browser's private IndexedDB under a deterministic academic key.
              </p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5 list-disc list-inside">
                <li><strong>0ms Instant Load</strong>: Re-opening questions or switching subjects loads in 0ms without waiting.</li>
                <li><strong>Zero Groq Tokens Burned</strong>: Prevents TPM (Tokens Per Minute) quota errors.</li>
                <li><strong>Works Offline</strong>: Once generated, revision notes and chats open even without internet.</li>
              </ul>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
              <h4 className="font-bold text-xs text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Need a brand new variation? Use "Fresh AI"</span>
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                If you ever want to re-generate an answer from scratch using live Groq AI, simply click the <strong>🔄 Fresh AI</strong> button next to any cached answer. It will bypass the local cache, call Groq for a fresh answer, and update IndexedDB.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: 5-Year Final Paper */}
      <section id="predictions" className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            6
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Solving the 5-Year Master Final Paper (`/predictions`)
            </h2>
            <p className="text-xs text-gray-500">Cross-paper pattern analysis from 2021 to 2025.</p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            In university exams, up to <strong>70% of questions repeat or follow predictable patterns</strong>. The <Link to="/predictions" className="text-indigo-600 font-bold hover:underline">5-Year Final Paper</Link> engine aggregates past question papers and synthesizes a full exam paper divided into:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60">
              <span className="font-bold text-gray-900 dark:text-gray-100 block mb-1">Section A (Very Short)</span>
              <p className="text-gray-500 dark:text-gray-400">Compulsory 2-mark definitions and direct formulas. Focus on exact terminology.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60">
              <span className="font-bold text-gray-900 dark:text-gray-100 block mb-1">Section B (Short Answer)</span>
              <p className="text-gray-500 dark:text-gray-400">5-mark analytical questions. Requires 4-5 bullet points and at least 1 diagram or table.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60">
              <span className="font-bold text-gray-900 dark:text-gray-100 block mb-1">Section C (Long Answer)</span>
              <p className="text-gray-500 dark:text-gray-400">10-mark comprehensive master questions. Click <strong>Solve with AI</strong> for full model solutions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: Revision & Cheatsheet */}
      <section id="revision" className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            7
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Quick Revision & 1-Page Printable Cheat Sheet
            </h2>
            <p className="text-xs text-gray-500">Everything you need on the morning of your examination.</p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-purple-600" />
                <span>1-Page Printable Cheat Sheet (A4 PDF)</span>
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Accessible via the <strong>1-Page Cheat Sheet</strong> button in <Link to="/mentor" className="underline font-bold">Mentor</Link> or <Link to="/revision" className="underline font-bold">Quick Revision</Link>. It compresses all 5 syllabus units into a dense 2-column matrix:
              </p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                <li>Core 2M Definitions (~25 words)</li>
                <li>Key Formulas & Diagram Flowcharts</li>
                <li>High-Frequency Distinction Tables (Differences)</li>
                <li>10-Mark Model Question Anchor Points</li>
              </ul>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-200 dark:border-purple-800">
                  <Check className="w-3.5 h-3.5" /> 1-Click "Download PDF" button directly saves A4 file
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-indigo-600" />
                <span>Interactive Flashcards Mode</span>
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Open <Link to="/revision" className="underline font-bold">Quick Revision</Link> and switch to the <strong>Interactive Flashcards</strong> tab. Click any card to flip between the concept question and its university definition. Perfect for rapid recall 1 hour before entering the exam hall.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: Pro Hacks for 90%+ */}
      <section id="prohacks" className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            8
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Pro Hacks for 90%+ University Semester Marks
            </h2>
            <p className="text-xs text-gray-500">Golden exam room rules from university professors and top scorers.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-2xs space-y-2">
            <span className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Always Use Boxed Diagrams</span>
            </span>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              In computer science, management, and science papers, a neat flowchart or block diagram (like the ASCII diagrams SANKALP AI draws) earns 30% of the question's total marks instantly.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-2xs space-y-2">
            <span className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Table Over Paragraphs</span>
            </span>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Whenever a question asks "Differentiate between X and Y", NEVER write two separate paragraphs. Draw a 3-column table: [Basis of Comparison | Concept X | Concept Y].
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-2xs space-y-2">
            <span className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Underline Key Terms</span>
            </span>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Notice the bolded terms in SANKALP AI answers. In your exam booklet, use a pencil or black pen to underline these core technical keywords so the examiner spots them in 2 seconds.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 9: FAQ & Troubleshooting */}
      <section id="faq" className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            9
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-xs text-gray-500">Quick solutions to common doubts.</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-2xs space-y-1.5">
            <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span>Why did I see "Groq Tokens Per Minute (TPM) limit reached"?</span>
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Groq provides a free tier with high speed but limits the volume of tokens in a single 60-second window. If you see this, wait 15–20 seconds and send your query again. Also, thanks to our new <strong>IndexedDB Response Caching</strong>, repeating previous questions or revising previously generated topics uses 0 tokens and will never trigger this error.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-2xs space-y-1.5">
            <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span>Can I use SANKALP AI on my mobile phone?</span>
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Yes, 100%! The platform is fully responsive and optimized for mobile screens (Android Chrome, iPhone Safari, etc.) with equal-aligned text margins, thumb-friendly buttons, and direct PDF downloads.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-2xs space-y-1.5">
            <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span>How do I export my chat conversations?</span>
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              In <Link to="/mentor" className="font-bold underline">Mentor</Link>, click the <strong>Export</strong> button in the top action bar. It downloads your entire subject conversation as a formatted Markdown (<code className="px-1 font-mono">.md</code>) file which you can open in Obsidian, Notion, or MS Word.
            </p>
          </div>
        </div>
      </section>

      {/* Official Support & Enquiry Footer Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-black text-white border border-white/15 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold block">
              Official Helpdesk & Enquiries
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-white">
              Have Questions, Suggestions or Need Syllabus Added?
            </h3>
            <p className="text-xs text-zinc-300 max-w-xl leading-relaxed">
              For any academic doubts, question paper requests, bug reports, or platform enquiries, email the SANKALP AI team directly.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyEmail}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors"
            >
              {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedEmail ? 'Copied' : 'Copy Email'}</span>
            </button>

            <a
              href="mailto:study.sankalp.ai@gmail.com?subject=SANKALP%20AI%20Manual%20Enquiry"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-extrabold shadow-md transition-all hover:scale-102"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Support</span>
            </a>
          </div>
        </div>

        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-400 gap-2">
          <p>
            Architected by <strong>Sameer Singh</strong> &bull; Student of St. John's College, Agra
          </p>
          <p className="font-mono text-zinc-300">
            study.sankalp.ai@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}
