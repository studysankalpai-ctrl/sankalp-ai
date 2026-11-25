import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAppStore from '../store/appStore';
import {
  Sparkles,
  Bot,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  BookOpen,
  Layers,
  Cpu,
  GraduationCap,
  Clock,
  Target,
  Code2,
  Terminal,
  ChevronRight,
  Star,
  FileText,
  Zap,
  BarChart3,
  Search,
  Database,
  Check,
  Award,
  BookMarked,
  Sliders,
  Printer,
  Maximize2,
  Eye,
  Activity,
  Layers3,
  FolderTree,
  TrendingUp,
  Menu,
  X,
  Mail,
  Mic,
  ClipboardCheck,
  Briefcase,
} from 'lucide-react';

export default function Landing() {
  const [heroPreviewTab, setHeroPreviewTab] = useState('mentor');
  const [activeTourTab, setActiveTourTab] = useState('mentor');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Strictly lock pure black background on body & html to prevent any white flashes during mobile scroll or rubber banding
    const originalBodyBg = document.body.style.backgroundColor;
    const originalHtmlBg = document.documentElement.style.backgroundColor;
    const originalBodyOverflowY = document.body.style.overflowY;
    const originalBodyOverflowX = document.body.style.overflowX;

    document.body.style.backgroundColor = '#000000';
    document.documentElement.style.backgroundColor = '#000000';
    document.documentElement.classList.add('dark');
    document.body.style.overflowY = 'auto';
    document.body.style.overflowX = 'hidden';

    return () => {
      document.body.style.backgroundColor = originalBodyBg;
      document.documentElement.style.backgroundColor = originalHtmlBg;
      document.body.style.overflowY = originalBodyOverflowY;
      document.body.style.overflowX = originalBodyOverflowX;
    };
  }, []);

  const tourModules = [
    {
      id: 'mentor',
      title: 'AI Exam Mentor',
      subtitle: '2, 5, 10 & 15 Mark Schemas',
      icon: Bot,
      image: '/screenshots/mentor.png',
      badge: 'Core Engine',
      tagline: 'Structured model answers formatted for university scoring rubrics.',
      description:
        'Generates mark-winning model answers with clean definitions, comparison matrices, and textbook-grounded diagrams.',
      highlights: [
        'Calibrated for 2, 5, 10, and 15 marks',
        'Auto-formatted comparison tables & diagrams',
        'Direct grounding in prescribed textbooks',
      ],
      link: '/mentor',
      linkText: 'Open AI Mentor',
    },
    {
      id: 'coding-lab',
      title: 'Coding Lab & DSA',
      subtitle: 'Browser IDE & 18+ Graded Problems',
      icon: Terminal,
      image: '/screenshots/coding-lab.png',
      badge: 'Online IDE',
      tagline: 'Write, debug, and run code with live terminal interaction.',
      description:
        'Multi-language browser compiler with step-by-step TTY input execution, 18+ university DSA challenges, and AI bug diagnosis.',
      highlights: [
        'GCC 14 C/C++, Python 3, Java 17 & JS',
        'Interactive terminal supporting scanf, cin, input',
        '18+ graded DSA problems with sample test cases',
      ],
      link: '/coding-lab',
      linkText: 'Open Coding Lab',
    },
    {
      id: 'business-lab',
      title: 'MBA Business Lab',
      subtitle: 'Boardroom Decision Simulator',
      icon: Briefcase,
      image: '/screenshots/business-lab.png',
      badge: 'MBA Sim',
      tagline: 'Step into the executive seat to resolve live corporate crisis dilemmas.',
      description:
        'Simulate multi-turn executive decisions with real-time financial vitals, burn rate tracking, and stakeholder impact analysis.',
      highlights: [
        'Live cash, runway, morale & market vitals',
        'Dynamic multi-turn corporate crisis dilemmas',
        'Rubric scoring on strategic and ethical thinking',
      ],
      link: '/business-lab',
      linkText: 'Open Business Lab',
    },
    {
      id: 'final-paper',
      title: '5-Year Master Paper',
      subtitle: 'Exam Trend Synthesizer',
      icon: FileCheck2,
      image: '/screenshots/final-paper.png',
      badge: 'Predictions',
      tagline: 'Synthesize 5 years of past exams into one balanced master paper.',
      description:
        'Analyzes historical recurrence to generate a complete mock examination balanced across Section A, Section B, and Section C.',
      highlights: [
        'Balanced Section A, B & C university exam format',
        'Flags questions repeating in 3+ previous years',
        '1-click print and PDF download for mock practice',
      ],
      link: '/predictions',
      linkText: 'Generate Master Paper',
    },
    {
      id: 'viva',
      title: 'AI Viva Voce Room',
      subtitle: 'Speech-Driven Oral Drills',
      icon: Mic,
      image: '/screenshots/viva.png',
      badge: 'Audio AI',
      tagline: 'Simulate university oral vivas with spoken questions and answers.',
      description:
        'Hands-free speech dialogue with real-time audio transcription and instant rubric grading across 4 examiner personas.',
      highlights: [
        'Hands-free voice questions and student speech response',
        '4 Examiner personas: Strict, Friendly, Rapid & Standard',
        'Instant oral scorecards with missing points highlighted',
      ],
      link: '/viva',
      linkText: 'Enter Viva Room',
    },
  ];

  const activeModule = tourModules.find((m) => m.id === activeTourTab) || tourModules[0];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black overflow-x-hidden font-sans">
      {/* Background Dot Grid Pattern & Ambient Monochrome Glows (Optimized for Mobile GPU) */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-black">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="hidden sm:block absolute top-0 left-1/4 w-[900px] h-[550px] bg-gradient-to-b from-white/10 via-white/[0.02] to-transparent blur-3xl pointer-events-none" />
        <div className="hidden sm:block absolute top-1/3 right-10 w-[700px] h-[450px] bg-gradient-to-b from-white/5 to-transparent blur-3xl pointer-events-none" />
        <div className="hidden sm:block absolute bottom-10 left-1/3 w-[800px] h-[400px] bg-gradient-to-t from-white/5 to-transparent blur-3xl pointer-events-none" />
      </div>

      {/* Top Navbar (Monochrome Black & White, Lowered position for iPhone notch/dynamic island, Mobile responsive) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 sm:bg-black/85 sm:backdrop-blur-xl border-b border-white/10 transition-all pt-[calc(env(safe-area-inset-top,0px)+10px)] sm:pt-0">
        <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Logo & Brand Identity */}
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/10 border border-white/20 p-1 flex items-center justify-center transition-all duration-200 group-hover:border-white/50 group-hover:bg-white/15 shadow-sm shrink-0">
              <img
                src="/Logo.png"
                alt="SANKALP AI"
                width="32"
                height="32"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-contain filter drop-shadow"
              />
            </div>
            <div className="shrink-0">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white group-hover:text-zinc-200 transition-colors whitespace-nowrap block">
                SANKALP AI
              </span>
              <p className="text-[10px] text-zinc-400 font-medium hidden sm:block leading-tight">
                University Exam Intelligence Engine
              </p>
            </div>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-zinc-400">
            <Link
              to="/business-lab"
              className="hover:text-white transition-colors flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-bold"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Business Lab</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                MBA
              </span>
            </Link>
            <Link
              to="/coding-lab"
              className="hover:text-white transition-colors flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-bold"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Coding Lab</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                NEW
              </span>
            </Link>
            <a href="#tour" className="hover:text-white transition-colors">
              Inside Software
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#workflow" className="hover:text-white transition-colors">
              How It Works
            </a>
            <Link to="/guide" className="hover:text-white transition-colors">
              User Manual
            </Link>
            <a href="#creator" className="hover:text-white transition-colors">
              Creator
            </a>
          </nav>

          {/* Right Action: Enter SANKALP CTA + Mobile Hamburger */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-extrabold tracking-tight shadow-sm transition-all shrink-0"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 border border-white/10 transition-colors shrink-0 flex items-center justify-center cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-zinc-950 border-b border-white/15 px-5 py-4 space-y-3 animate-in fade-in duration-200">
            <nav className="flex flex-col gap-2 text-xs font-medium text-zinc-300">
              <Link
                to="/business-lab"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-white transition-colors flex items-center justify-between text-amber-400 font-bold"
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <span>Business Case War Room</span>
                </div>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  MBA
                </span>
              </Link>
              <Link
                to="/coding-lab"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-white transition-colors flex items-center justify-between text-emerald-400 font-bold"
              >
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Coding Lab &amp; DSA Studio</span>
                </div>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  NEW
                </span>
              </Link>
              <a
                href="#tour"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-white transition-colors"
              >
                Inside Software
              </a>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#workflow"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-white transition-colors"
              >
                How It Works
              </a>
              <a
                href="#creator"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-white transition-colors"
              >
                Creator Spotlight
              </a>
              <Link
                to="/guide"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-white transition-colors text-white"
              >
                User Manual & Guide
              </Link>
            </nav>

            <div className="pt-2 border-t border-white/10 space-y-2">
              <Link
                to="/coding-lab"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-xs font-bold shadow-md"
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Open Coding Lab (IDE &amp; DSA)</span>
              </Link>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-bold shadow-md"
              >
                <Bot className="w-3.5 h-3.5 text-black" />
                <span>Launch SANKALP AI</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2-Column Hero Section: Left (Copy & CTAs) + Right (Interactive Live Studio Showcase) */}
      <section className="relative pt-[calc(4.25rem+env(safe-area-inset-top,0px))] pb-8 sm:pt-28 sm:pb-16 z-10 overflow-hidden">
        {/* Ambient atmospheric backdrop glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[400px] bg-gradient-to-tr from-indigo-600/15 via-emerald-600/10 to-transparent blur-[140px] pointer-events-none rounded-full -z-10" />

        <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            {/* Left Column (Left-aligned Headline, Clean Paragraph, Minimal Padding) */}
            <div className="lg:col-span-6 space-y-3.5 sm:space-y-4 text-left flex flex-col items-start">

              {/* Highlight Announcement Pill (Linear/Raycast style) */}
              <Link
                to="/coding-lab"
                className="self-start inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 hover:border-emerald-400/50 text-zinc-300 hover:text-white text-[11px] sm:text-xs font-medium transition-all group shadow-sm text-left backdrop-blur-md"
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="font-extrabold text-emerald-400 font-mono text-[9px] sm:text-[10px] tracking-wider uppercase shrink-0">
                  NEW
                </span>
                <span className="text-zinc-600 shrink-0">•</span>
                <span className="text-[11px] sm:text-xs truncate max-w-[210px] sm:max-w-none text-zinc-300 group-hover:text-white">
                  Interactive Coding Lab &amp; MBA Studio
                </span>
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-400 group-hover:translate-x-0.5 group-hover:text-emerald-400 transition-all shrink-0" />
              </Link>

              {/* Headline */}
              <h1 className="text-[26px] sm:text-4xl md:text-5xl lg:text-[52px] font-black tracking-[-0.03em] text-white leading-[1.12] text-left">
                Master Your University Exams with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
                  Calibrated AI Precision.
                </span>
              </h1>

              {/* Subheadline (Minimal, punchy, clean - no awkward text-justify gaps) */}
              <p className="text-xs sm:text-sm md:text-[15px] text-zinc-300 leading-relaxed font-normal max-w-xl text-left">
                Transform 5-year past papers, prescribed textbooks, and syllabus units into structured model answers, live compiler environments, and strategic decision simulations.
              </p>

              {/* 2 Clean Primary Action Buttons */}
              <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-2.5 sm:gap-3.5 pt-1">
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-2.5 sm:px-6 sm:py-3.5 rounded-xl bg-white hover:bg-zinc-100 text-black text-xs sm:text-sm font-extrabold shadow-[0_0_25px_rgba(255,255,255,0.22)] hover:shadow-[0_0_35px_rgba(255,255,255,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Bot className="w-4 h-4 text-black" />
                  <span>Enter SANKALP AI</span>
                  <ArrowRight className="w-3.5 h-3.5 text-black" />
                </Link>

                <Link
                  to="/coding-lab"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-4 py-2.5 sm:px-5 sm:py-3.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 hover:text-emerald-200 text-xs sm:text-sm font-bold border border-emerald-500/40 hover:border-emerald-400 transition-all shadow-md shadow-emerald-950/40"
                >
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Coding Lab &amp; DSA</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-black bg-emerald-400 text-black">
                    IDE
                  </span>
                </Link>
              </div>

              {/* Quick Studio Dock */}
              <div className="w-full pt-1.5 text-left">
                <span className="text-[10px] sm:text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-2 text-left font-semibold">
                  Explore Specialized Studios:
                </span>
                <div className="flex flex-wrap items-center justify-start gap-1.5 sm:gap-2">
                  <Link
                    to="/business-lab"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-900 border border-amber-500/30 hover:border-amber-400 text-[11px] sm:text-xs font-semibold text-amber-300 transition-all hover:-translate-y-0.5 shadow-sm"
                  >
                    <Briefcase className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                    <span>MBA Business Lab</span>
                  </Link>
                  <Link
                    to="/viva"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-900 border border-white/15 hover:border-indigo-400/50 text-[11px] sm:text-xs font-semibold text-zinc-300 hover:text-indigo-300 transition-all hover:-translate-y-0.5 shadow-sm"
                  >
                    <Mic className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-400" />
                    <span>AI Viva Room</span>
                  </Link>
                  <Link
                    to="/predictions"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-900 border border-white/15 hover:border-white/30 text-[11px] sm:text-xs font-semibold text-zinc-300 hover:text-white transition-all hover:-translate-y-0.5 shadow-sm"
                  >
                    <FileCheck2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-400" />
                    <span>5-Yr Master Paper</span>
                  </Link>
                  <Link
                    to="/tests"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-900 border border-white/15 hover:border-white/30 text-[11px] sm:text-xs font-semibold text-zinc-300 hover:text-white transition-all hover:-translate-y-0.5 shadow-sm"
                  >
                    <ClipboardCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-400" />
                    <span>Mock Tests</span>
                  </Link>
                </div>
              </div>

              {/* 3 Core Value Metrics (Divided glass bar) */}
              <div className="w-full pt-3 sm:pt-4 border-t border-white/10 grid grid-cols-3 divide-x divide-white/10 text-left">
                <div className="pr-2 sm:pr-4">
                  <p className="text-lg sm:text-2xl font-black text-white tracking-tight">5-Year</p>
                  <p className="text-[10px] sm:text-xs text-zinc-400 font-medium leading-tight">Cross-Paper Analysis</p>
                </div>
                <div className="px-2 sm:px-4">
                  <p className="text-lg sm:text-2xl font-black text-white tracking-tight">2 - 15M</p>
                  <p className="text-[10px] sm:text-xs text-zinc-400 font-medium leading-tight">Model Mark Formats</p>
                </div>
                <div className="pl-2 sm:pl-4">
                  <p className="text-lg sm:text-2xl font-black text-white tracking-tight">100%</p>
                  <p className="text-[10px] sm:text-xs text-zinc-400 font-medium leading-tight">Syllabus Grounded</p>
                </div>
              </div>
            </div>

            {/* Right Column (Hero Visual: Interactive Multi-Studio Showcase Window with Dynamic Aura) - Hidden on Mobile per user request */}
            <div className="hidden lg:block lg:col-span-6 w-full relative">
              {/* Dynamic Aura Glow matching active tab */}
              <div
                className={`absolute -inset-1 sm:-inset-2 rounded-3xl blur-2xl opacity-60 transition-all duration-700 pointer-events-none -z-10 ${
                  heroPreviewTab === 'mentor'
                    ? 'bg-gradient-to-tr from-indigo-600/35 via-purple-600/20 to-blue-600/30'
                    : heroPreviewTab === 'coding'
                    ? 'bg-gradient-to-tr from-emerald-600/40 via-teal-600/20 to-cyan-600/30'
                    : 'bg-gradient-to-tr from-amber-600/35 via-orange-600/20 to-yellow-600/30'
                }`}
              />

              <div className="rounded-2xl sm:rounded-3xl bg-zinc-950/90 backdrop-blur-xl border border-white/20 p-3 sm:p-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative overflow-hidden ring-1 ring-white/10">
                {/* Window Frame Top Header & Interactive Tab Switcher */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/90 shadow-[0_0_8px_rgba(244,63,94,0.4)] inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/90 shadow-[0_0_8px_rgba(245,158,11,0.4)] inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/90 shadow-[0_0_8px_rgba(16,185,129,0.4)] inline-block" />
                    </div>
                    {/* Simulated URL Pill / App breadcrumb */}
                    <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-[10px] font-mono text-zinc-400">
                      <span className="text-zinc-500">sankalp-ai://studio/</span>
                      <span className="text-zinc-200 font-semibold">{heroPreviewTab}</span>
                    </div>
                  </div>

                  {/* Switcher Buttons (Floating Segmented Control) */}
                  <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-white/15 text-[10px] sm:text-xs font-semibold shadow-inner">
                    <button
                      type="button"
                      onClick={() => setHeroPreviewTab('mentor')}
                      className={`px-2.5 py-1 sm:px-3 sm:py-1 rounded-lg transition-all cursor-pointer ${
                        heroPreviewTab === 'mentor'
                          ? 'bg-white text-black font-extrabold shadow-md'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      AI Mentor
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroPreviewTab('coding')}
                      className={`px-2.5 py-1 sm:px-3 sm:py-1 rounded-lg transition-all cursor-pointer ${
                        heroPreviewTab === 'coding'
                          ? 'bg-emerald-500 text-black font-extrabold shadow-md'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Coding Lab
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroPreviewTab('business')}
                      className={`px-2.5 py-1 sm:px-3 sm:py-1 rounded-lg transition-all cursor-pointer ${
                        heroPreviewTab === 'business'
                          ? 'bg-amber-400 text-black font-extrabold shadow-md'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Business Lab
                    </button>
                  </div>
                </div>

                {/* Tab 1: AI Exam Mentor Live Mockup */}
                {heroPreviewTab === 'mentor' && (
                  <div className="space-y-3 font-sans text-xs animate-in fade-in duration-300">
                    {/* Prompt Box */}
                    <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-indigo-500/30 flex items-start gap-2.5 shadow-sm">
                      <div className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 font-bold font-mono text-[11px] border border-indigo-500/30">
                        Q
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-0.5">
                          <span className="text-zinc-400">Operating Systems • Unit 2 (Process Management)</span>
                          <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold border border-indigo-500/30">10 MARKS</span>
                        </div>
                        <p className="font-semibold text-white text-xs sm:text-[13px] leading-snug">
                          Explain Process Synchronization and deadlock avoidance using Banker&apos;s Algorithm with an illustrative matrix.
                        </p>
                      </div>
                    </div>

                    {/* Model Answer Preview */}
                    <div className="p-3.5 rounded-xl bg-black/90 border border-white/10 space-y-2.5 text-zinc-300 shadow-inner">
                      <div className="flex items-center justify-between border-b border-white/10 pb-1.5 text-[10px] font-mono text-zinc-400">
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          SANKALP AI Structured Output
                        </span>
                        <span className="text-zinc-400">Evaluation Rubric: 10/10</span>
                      </div>

                      <div className="text-[11px] sm:text-xs leading-relaxed space-y-2">
                        <p>
                          <strong className="text-white">1. Conceptual Definition:</strong> Banker&apos;s Algorithm is a resource allocation and deadlock avoidance algorithm developed by Edsger Dijkstra that tests for safety by simulating the allocation of predetermined maximum possible amounts of all resources.
                        </p>

                        {/* Comparative Matrix Preview */}
                        <div className="rounded-lg border border-white/10 overflow-hidden text-[10px] font-mono">
                          <div className="grid grid-cols-3 bg-zinc-900/90 p-1.5 font-bold text-white border-b border-white/10">
                            <span>Process</span>
                            <span>Allocation (A, B)</span>
                            <span>Max Need (A, B)</span>
                          </div>
                          <div className="grid grid-cols-3 p-1.5 text-zinc-400 border-b border-white/5 bg-zinc-950/40">
                            <span className="text-white font-semibold">P0</span>
                            <span>0, 1</span>
                            <span>7, 5</span>
                          </div>
                          <div className="grid grid-cols-3 p-1.5 text-zinc-400 bg-zinc-900/20">
                            <span className="text-white font-semibold">P1</span>
                            <span>2, 0</span>
                            <span>3, 2</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-zinc-400 italic">Grounded in: Galvin / Pradeep K. Sinha</span>
                          <Link
                            to="/mentor"
                            className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group/link"
                          >
                            <span>Open in AI Mentor</span>
                            <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Coding Lab Live IDE Mockup */}
                {heroPreviewTab === 'coding' && (
                  <div className="space-y-2.5 font-mono text-xs select-none animate-in fade-in duration-300">
                    {/* Code Editor Preview */}
                    <div className="p-3 rounded-xl bg-[#07090e] border border-emerald-500/20 text-[11px] leading-relaxed shadow-inner">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[10px] text-zinc-400 font-sans">
                        <span className="flex items-center gap-1.5 font-bold text-white font-mono">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          main.c
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold font-mono text-[9px]">
                            GCC 14.2
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold hidden sm:inline">
                            ▶ Run (F5)
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="text-zinc-600 select-none text-right pr-1 text-[10px] leading-[1.6]">
                          1<br />2<br />3<br />4<br />5
                        </div>
                        <div className="flex-1 text-[11px] leading-[1.6]">
                          <span className="text-pink-400">#include</span> <span className="text-amber-300">&lt;stdio.h&gt;</span><br />
                          <span className="text-purple-400">int</span> <span className="text-blue-400">main</span>() &#123;<br />
                          &nbsp;&nbsp;<span className="text-purple-400">int</span> n, arr[<span className="text-cyan-400">50</span>];<br />
                          &nbsp;&nbsp;<span className="text-yellow-300">printf</span>(<span className="text-emerald-300">&quot;Enter elements: &quot;</span>);<br />
                          &nbsp;&nbsp;<span className="text-yellow-300">scanf</span>(<span className="text-emerald-300">&quot;%d&quot;</span>, &amp;n);<br />
                        </div>
                      </div>
                    </div>

                    {/* Interactive TTY Terminal */}
                    <div className="p-3 rounded-xl bg-black border border-emerald-500/30 text-[11px] space-y-1.5 shadow-inner">
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 pb-1 border-b border-white/10">
                        <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          Interactive Terminal (TTY)
                        </span>
                        <span className="text-zinc-500">0.012s • 1MB RAM</span>
                      </div>
                      <p className="text-zinc-400">
                        <span className="text-emerald-400 font-bold">sankalp@ide:~$</span> ./main
                      </p>
                      <p className="text-zinc-200">
                        Enter elements: <span className="text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40">10 20 30</span>
                      </p>
                      <p className="text-emerald-300 font-bold">
                        Array Processed Successfully.
                      </p>
                    </div>

                    <div className="flex justify-end pt-0.5">
                      <Link
                        to="/coding-lab"
                        className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-sans group/link"
                      >
                        <span>Launch Full IDE Playground</span>
                        <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                )}

                {/* Tab 3: Business Lab Live Mockup */}
                {heroPreviewTab === 'business' && (
                  <div className="space-y-3 font-sans text-xs animate-in fade-in duration-300">
                    {/* Company Header */}
                    <div className="p-3 rounded-xl bg-zinc-900/90 border border-amber-500/30 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                          <Briefcase className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-xs">VoltRide Mobility</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                              MBA SIM
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-400">Product Safety &amp; Recall Crisis</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-300 font-bold border border-white/10">
                        Phase: Turn 1/2
                      </span>
                    </div>

                    {/* 4 Live Vitals Gauges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
                      <div className="p-2 rounded-lg bg-black/90 border border-white/10 shadow-inner">
                        <span className="text-zinc-400 block text-[9px]">CASH &amp; RUNWAY</span>
                        <span className="text-white font-bold text-xs">₹4.20 Cr</span>
                        <span className="text-emerald-400 block text-[9px]">(180 Days)</span>
                      </div>
                      <div className="p-2 rounded-lg bg-black/90 border border-white/10 shadow-inner">
                        <span className="text-zinc-400 block text-[9px]">TEAM MORALE</span>
                        <span className="text-white font-bold text-xs">82%</span>
                        <span className="text-emerald-400 block text-[9px]">High</span>
                      </div>
                      <div className="p-2 rounded-lg bg-black/90 border border-white/10 shadow-inner">
                        <span className="text-zinc-400 block text-[9px]">MARKET SHARE</span>
                        <span className="text-white font-bold text-xs">14%</span>
                        <span className="text-zinc-400 block text-[9px]">Territory</span>
                      </div>
                      <div className="p-2 rounded-lg bg-black/90 border border-white/10 shadow-inner">
                        <span className="text-zinc-400 block text-[9px]">BRAND TRUST</span>
                        <span className="text-white font-bold text-xs">78%</span>
                        <span className="text-amber-400 block text-[9px]">Moderate</span>
                      </div>
                    </div>

                    {/* Crisis Dilemma */}
                    <div className="p-3 rounded-xl bg-black/90 border border-white/10 text-[11px] space-y-1.5 text-zinc-300 shadow-inner">
                      <span className="text-rose-400 font-bold font-mono text-[10px] uppercase flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-rose-400" />
                        The Burning Platform Dilemma:
                      </span>
                      <p className="leading-snug">
                        500 Thermal Runaway incidents reported in Maharashtra. CTO proposes silent OTA firmware update; CFO warns battery recall costs ₹6 Cr (insolvency).
                      </p>
                    </div>

                    <div className="flex justify-end pt-0.5">
                      <Link
                        to="/business-lab"
                        className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 group/link"
                      >
                        <span>Enter Executive War Room</span>
                        <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Academic Validation Ribbon (Minimal, Sleek & Left-Aligned) */}
      <section className="border-y border-white/10 bg-zinc-950/60 py-3 sm:py-3.5 z-10 relative">
        <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 flex flex-wrap items-center justify-start lg:justify-between gap-3 sm:gap-4 text-left text-[11px] sm:text-xs font-semibold text-zinc-300">
          <div className="flex items-center justify-start gap-1.5 sm:gap-2 text-left">
            <GraduationCap className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>St. John&apos;s College, Agra</span>
          </div>
          <div className="flex items-center justify-start gap-1.5 sm:gap-2 text-left">
            <FileCheck2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>5-Year Past Papers (2021–2025)</span>
          </div>
          <div className="flex items-center justify-start gap-1.5 sm:gap-2 text-left">
            <BookOpen className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>Prescribed Textbooks Grounding</span>
          </div>
          <div className="flex items-center justify-start gap-1.5 sm:gap-2 text-left">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>Verified University Marking Keys</span>
          </div>
        </div>
      </section>

      {/* CORE PRODUCT TOUR SECTION: Inside the Software with Real Screenshots & Deep Descriptions */}
      <section id="tour" className="py-8 sm:py-16 z-10 relative">
        <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-5 sm:mb-8 gap-2.5 text-center md:text-left items-center md:items-end">
            <div>
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1 block">
                Platform Architecture
              </span>
              <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Explore Specialized Studios
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md leading-relaxed mx-auto md:mx-0">
              Purpose-built AI studios to master university examinations, code labs, and executive simulations.
            </p>
          </div>

          {/* Module Selector Tabs (Horizontal touch scrolling from start, no clipped left items) */}
          <div className="w-full flex items-center justify-start gap-2 overflow-x-auto pb-3 mb-4 sm:mb-6 -mx-3.5 px-3.5 sm:mx-0 sm:px-0 touch-pan-x scroll-smooth overscroll-x-contain no-scrollbar">
            {tourModules.map((module) => {
              const Icon = module.icon;
              const isActive = module.id === activeTourTab;
              return (
                <button
                  key={module.id}
                  onClick={() => setActiveTourTab(module.id)}
                  className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shrink-0 transition-all border cursor-pointer select-none ${isActive
                    ? 'bg-white text-black border-white shadow-md'
                    : 'bg-zinc-950 text-zinc-400 border-white/10 hover:border-white/30 hover:text-white'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="whitespace-nowrap">{module.title}</span>
                </button>
              );
            })}
          </div>

          {/* Detailed Module Showcase Card: Left Description & Highlights, Right Real Screenshot */}
          <div className="rounded-2xl sm:rounded-3xl bg-zinc-950 border border-white/15 p-4 sm:p-7 lg:p-9 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-10 items-center">
              {/* Left / Info & Detailed Points (Centered on mobile, left on desktop) */}
              <div className="lg:col-span-5 space-y-3 sm:space-y-4 text-center lg:text-left flex flex-col items-center lg:items-start">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-zinc-200">
                    {activeModule.badge}
                  </span>
                  <span className="text-[11px] sm:text-xs font-mono text-zinc-400">{activeModule.subtitle}</span>
                </div>

                <h3 className="text-base sm:text-xl md:text-2xl font-extrabold text-white tracking-tight">
                  {activeModule.title}
                </h3>

                <p className="text-[11px] sm:text-xs font-medium text-zinc-300 italic border-l-0 lg:border-l-2 pl-0 lg:pl-3 leading-relaxed max-w-md">
                  "{activeModule.tagline}"
                </p>

                <p
                  className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal max-w-md text-justify sm:text-justify lg:text-left hyphens-auto"
                  style={{ textJustify: 'inter-word' }}
                >
                  {activeModule.description}
                </p>

                {/* Key Highlights (Centered block on mobile with neat checkmarks) */}
                <div className="space-y-1.5 pt-0.5 w-full max-w-md text-left">
                  <span className="text-[10px] sm:text-xs font-mono text-zinc-400 uppercase tracking-wider block font-bold text-center lg:text-left mb-1.5">
                    Highlights:
                  </span>
                  {activeModule.highlights.map((h, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px] sm:text-xs text-zinc-300">
                      <div className="w-3.5 h-3.5 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="leading-snug">{h}</span>
                    </div>
                  ))}
                </div>

                {/* Direct Action Link (Centered button on mobile) */}
                <div className="pt-2 w-full flex justify-center lg:justify-start">
                  <Link
                    to={activeModule.link}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs sm:text-sm font-extrabold transition-all hover:scale-102"
                  >
                    <span>{activeModule.linkText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right / High-Res Screenshot Frame */}
              <div className="lg:col-span-7 w-full">
                <div className="rounded-2xl bg-black border border-white/20 p-2 shadow-2xl overflow-hidden group">
                  <div className="h-8 px-3 bg-zinc-900 rounded-xl border border-white/10 flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-zinc-400 truncate">
                      sankalp-ai://app{activeModule.link}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                      Live Interface Capture
                    </span>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-white/10 aspect-[16/10] bg-zinc-950 relative group/img">
                    <img
                      key={activeModule.id}
                      src={activeModule.image}
                      alt={activeModule.title}
                      width="1280"
                      height="800"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-top transition-all duration-500 group-hover/img:scale-[1.02] animate-in fade-in duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* CREATOR SPOTLIGHT SECTION (Sameer Singh • St. John's College Agra, Centered on Mobile) */}
      <section id="creator" className="py-8 sm:py-16 border-t border-white/10 z-10 relative">
        <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-5 sm:mb-8">
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1 block">
              Architect &amp; Visionary
            </span>
            <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Crafted by a Student, for Students
            </h2>
          </div>

          {/* Luxury Monochrome Profile Card */}
          <div className="relative rounded-2xl sm:rounded-3xl bg-zinc-950 border border-white/15 p-4 sm:p-8 lg:p-10 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/5 to-transparent blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-8 text-center md:text-left">
              {/* Profile Image with Monochrome Ring */}
              <div className="relative shrink-0 text-center mx-auto md:mx-0">
                <div className="relative w-28 h-28 sm:w-40 sm:h-40 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl p-1 bg-black mx-auto">
                  <img
                    src="/sameer.png"
                    alt="Sameer Singh - Creator of SANKALP AI"
                    width="160"
                    height="160"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover rounded-lg sm:rounded-xl grayscale-0 sm:grayscale contrast-110 sm:hover:grayscale-0 transition-all duration-500" />
                  <div className="absolute inset-0 rounded-lg sm:rounded-xl ring-1 ring-white/20 pointer-events-none" />
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-[10px] sm:text-xs font-bold text-white">
                  <ShieldCheck className="w-3 h-3 text-white" />
                  <span>Verified Builder</span>
                </div>
              </div>

              {/* Bio & Details */}
              <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 mb-1.5">
                  <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-zinc-400">
                    Platform Architect &amp; Creator
                  </span>
                  <span className="text-zinc-600 hidden md:inline">&bull;</span>
                  <span className="text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-white font-semibold">
                    St. John&apos;s College, Agra
                  </span>
                </div>

                <h3 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2">
                  Sameer Singh
                </h3>

                <p
                  className="text-zinc-300 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5 font-normal max-w-2xl mx-auto md:mx-0 hyphens-auto"
                  style={{ textAlign: 'justify', textJustify: 'inter-word' }}
                >
                  &ldquo;Built at St. John&apos;s College, Agra to eliminate semester exam anxiety. SANKALP AI grounds 5-year past papers and prescribed textbooks into verified model answers so every student can prepare with absolute confidence.&rdquo;
                </p>

                {/* Highlights Grid (2-columns on mobile for neat density) */}
                <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-white/10 text-xs sm:text-sm">
                  <div className="p-2.5 sm:p-3 rounded-xl bg-black border border-white/10 text-left">
                    <span className="text-[9px] sm:text-[10px] font-mono text-zinc-400 block mb-0.5 truncate">ALMA MATER</span>
                    <p className="font-bold text-white text-[11px] sm:text-xs truncate">St. John's College</p>
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-xl bg-black border border-white/10 text-left">
                    <span className="text-[9px] sm:text-[10px] font-mono text-zinc-400 block mb-0.5 truncate">STACK</span>
                    <p className="font-bold text-white text-[11px] sm:text-xs truncate">React 19, Node, Groq</p>
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-xl bg-black border border-white/10 text-left">
                    <span className="text-[9px] sm:text-[10px] font-mono text-zinc-400 block mb-0.5 truncate">MISSION</span>
                    <p className="font-bold text-white text-[11px] sm:text-xs truncate">Student Exam Mastery</p>
                  </div>

                  <a
                    href="mailto:study.sankalp.ai@gmail.com"
                    className="p-2.5 sm:p-3 rounded-xl bg-black border border-white/10 hover:border-white/30 transition-all text-left block group"
                    title="Send an email enquiry"
                  >
                    <span className="text-[9px] sm:text-[10px] font-mono text-zinc-400 mb-0.5 flex items-center gap-1">
                      <Mail className="w-2.5 h-2.5 text-white" />
                      <span className="truncate">CONTACT</span>
                    </span>
                    <p className="font-bold text-white text-[11px] sm:text-xs truncate group-hover:underline">
                      study.sankalp.ai
                    </p>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Core Architectural Capabilities Grid */}
      <section id="features" className="py-8 sm:py-16 border-t border-white/10 z-10 relative">
        <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-5 sm:mb-8">
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1 block">
              Capabilities
            </span>
            <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-1.5 sm:mb-2">
              Engineered for Academic Mastery
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto">
              Purpose-built tools to eliminate exam ambiguity and master complex technical concepts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
            {/* 1. Coding Lab */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-emerald-500/30 hover:border-emerald-500/60 transition-all flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 right-0 px-2.5 py-0.5 bg-emerald-500/10 border-b border-l border-emerald-500/20 rounded-bl-xl text-[9px] font-mono text-emerald-400 font-bold">
                NEW
              </div>
              <div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-2.5 group-hover:scale-105 transition-transform">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white mb-1">Coding Lab &amp; DSA</h3>
                <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
                  Browser compiler for C, C++, Python &amp; Java with interactive terminal execution and 18+ DSA challenges.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-white/5 text-[10px] sm:text-xs font-mono text-emerald-400 flex items-center justify-between">
                <span>GCC 14 • 18+ DSA Problems</span>
                <Link to="/coding-lab" className="hover:underline flex items-center gap-1 text-white font-semibold">
                  <span>Open</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* 2. 5-Year Master Papers */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-white/10 hover:border-white/30 transition-all flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-white mb-2.5">
                  <FileCheck2 className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white mb-1">5-Year Master Papers</h3>
                <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
                  Analyzes 5 years of exam archives to synthesize balanced Section A, B &amp; C mock examination papers.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-white/5 text-[10px] sm:text-xs font-mono text-zinc-400 flex items-center justify-between">
                <span>Balanced Sections A/B/C</span>
                <Link to="/predictions" className="hover:underline flex items-center gap-1 text-white font-semibold">
                  <span>Open</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* 3. MBA Business Lab */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-amber-500/30 hover:border-amber-500/60 transition-all flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 right-0 px-2.5 py-0.5 bg-amber-500/10 border-b border-l border-amber-500/20 rounded-bl-xl text-[9px] font-mono text-amber-400 font-bold">
                MBA
              </div>
              <div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 mb-2.5 group-hover:scale-105 transition-transform">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white mb-1">MBA Business Lab</h3>
                <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
                  Boardroom crisis dilemmas with dynamic financial vitals, runway metrics, and strategic simulations.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-white/5 text-[10px] sm:text-xs font-mono text-amber-400 flex items-center justify-between">
                <span>Executive War Room</span>
                <Link to="/business-lab" className="hover:underline flex items-center gap-1 text-white font-semibold">
                  <span>Open</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* 4. AI Viva Voce */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-white/10 hover:border-white/30 transition-all flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-white mb-2.5">
                  <Mic className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white mb-1">AI Viva Voce Room</h3>
                <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
                  Hands-free oral viva drills with real-time speech transcription and scoring across 4 examiner personas.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-white/5 text-[10px] sm:text-xs font-mono text-zinc-400 flex items-center justify-between">
                <span>Voice Speech Dialogue</span>
                <Link to="/viva" className="hover:underline flex items-center gap-1 text-white font-semibold">
                  <span>Open</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* 5. Prescribed Books Mode */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-white/10 hover:border-white/30 transition-all flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-white mb-2.5">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white mb-1">Prescribed Books Grounding</h3>
                <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
                  Directly anchors definitions, diagrams, and explanations in university-prescribed textbooks.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-white/5 text-[10px] sm:text-xs font-mono text-zinc-400 flex items-center justify-between">
                <span>Textbook Definitions</span>
                <Link to="/library" className="hover:underline flex items-center gap-1 text-white font-semibold">
                  <span>Open</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* 6. Calibrated Model Formats */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-white/10 hover:border-white/30 transition-all flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-white mb-2.5">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white mb-1">Calibrated Mark Schemas</h3>
                <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
                  Instant answer generation tailored for 2-mark definitions, 5-mark notes, and 10-mark architectural essays.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-white/5 text-[10px] sm:text-xs font-mono text-zinc-400 flex items-center justify-between">
                <span>2M, 5M &amp; 10M Formats</span>
                <Link to="/mentor" className="hover:underline flex items-center gap-1 text-white font-semibold">
                  <span>Open</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step University Exam Master Workflow */}
      <section id="workflow" className="py-8 sm:py-16 bg-zinc-950/70 border-t border-white/10 z-10 relative">
        <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-5 sm:mb-8">
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1 block">
              Methodology
            </span>
            <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              4 Steps to Exam Mastery
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-black border border-white/10 flex flex-col justify-between">
              <div>
                <span className="text-[10px] sm:text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Step 01
                </span>
                <h4 className="font-bold text-white text-xs sm:text-sm mb-1">Sync Syllabus</h4>
                <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
                  Select your course and semester to load verified syllabus units and prescribed books.
                </p>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-black border border-white/10 flex flex-col justify-between">
              <div>
                <span className="text-[10px] sm:text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Step 02
                </span>
                <h4 className="font-bold text-white text-xs sm:text-sm mb-1">Analyze Trends</h4>
                <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
                  Identify high-probability questions repeated in 3+ historical university examination years.
                </p>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-black border border-white/10 flex flex-col justify-between">
              <div>
                <span className="text-[10px] sm:text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Step 03
                </span>
                <h4 className="font-bold text-white text-xs sm:text-sm mb-1">Master Formats</h4>
                <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
                  Study 2, 5 &amp; 10-mark model structures with clean comparative matrices and diagrams.
                </p>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-black border border-white/10 flex flex-col justify-between">
              <div>
                <span className="text-[10px] sm:text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Step 04
                </span>
                <h4 className="font-bold text-white text-xs sm:text-sm mb-1">Simulate Mocks</h4>
                <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
                  Practice balanced 5-year master papers and interactive coding terminal drills.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* High-Impact Final Call to Action */}
      <section className="py-8 sm:py-16 border-t border-white/10 z-10 relative">
        <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 text-center">
          <div className="p-5 sm:p-10 lg:p-12 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border border-white/20 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 max-w-xl mx-auto">
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5 block">
                Immediate Access • Zero Complex Setup
              </span>
              <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-2 sm:mb-2.5">
                Ready to Ace Your University Exams?
              </h2>
              <p className="text-zinc-300 text-xs sm:text-sm mb-4 sm:mb-5 leading-relaxed">
                Step into SANKALP AI right now. Free for university students.
              </p>

              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-7 sm:py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs sm:text-sm font-extrabold shadow-xl transition-all hover:scale-103 active:scale-[0.98]"
              >
                <Bot className="w-4 h-4 text-black" />
                <span>Enter SANKALP AI Platform</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </Link>

              <p className="text-[10px] sm:text-xs text-zinc-400 font-mono mt-3">
                St. John&apos;s College, Agra • Inquiries:{' '}
                <a href="mailto:study.sankalp.ai@gmail.com" className="text-white hover:underline underline-offset-2">
                  study.sankalp.ai@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rich High-Impact Monochrome Footer */}
      <footer className="relative z-10 border-t border-white/20 bg-zinc-950 text-zinc-400 text-xs pt-10 sm:pt-14 pb-8 sm:pb-10 shadow-2xl">
        <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          {/* Main 4-Column Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10 pb-8 sm:pb-10 border-b border-white/10">
            {/* Col 1: Brand & Academic Mission */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 p-1 flex items-center justify-center">
                  <img
                    src="/Logo.png"
                    alt="SANKALP AI"
                    width="36"
                    height="36"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain filter drop-shadow"
                  />
                </div>
                <div>
                  <span className="font-extrabold text-white text-base tracking-tight block">
                    SANKALP AI
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                    2.0 Academic Core
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Autonomous University Exam Intelligence Engine. Grounded in prescribed textbooks and 5-year historical question papers to deliver mark-winning model answers.
              </p>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-xs text-zinc-300">
                <GraduationCap className="w-3.5 h-3.5 text-white" />
                <span>St. John's College, Agra</span>
              </div>
            </div>

            {/* Col 2: Core Platform Modules */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-widest text-white font-bold mb-4">
                Platform Features
              </h4>
              <ul className="space-y-2.5 text-xs text-zinc-300 font-medium">
                <li>
                  <Link to="/business-lab" className="hover:text-white transition-colors flex items-center justify-between text-amber-400 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                      <span>Business Case War Room</span>
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      MBA
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to="/coding-lab" className="hover:text-white transition-colors flex items-center justify-between text-emerald-400 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Coding Lab &amp; DSA Studio</span>
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      NEW
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to="/mentor" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-zinc-400" />
                    <span>AI Exam Mentor</span>
                  </Link>
                </li>
                <li>
                  <Link to="/predictions" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-zinc-400" />
                    <span>5-Year Master Final Paper</span>
                  </Link>
                </li>
                <li>
                  <Link to="/viva" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-zinc-400" />
                    <span>AI Viva Voce Room</span>
                  </Link>
                </li>
                <li>
                  <Link to="/tests" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <ClipboardCheck className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Timed Mock Tests &amp; PDF</span>
                  </Link>
                </li>
                <li>
                  <Link to="/library" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Academic Library &amp; Textbooks</span>
                  </Link>
                </li>
                <li>
                  <Link to="/topics" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Important Repeated Topics</span>
                  </Link>
                </li>
                <li>
                  <Link to="/guide" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Student User Manual &amp; Guide</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Academic Programs & Syllabi */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-widest text-white font-bold mb-4">
                Curriculum & Programs
              </h4>
              <ul className="space-y-2.5 text-xs text-zinc-300 font-medium">
                <li className="flex items-center justify-between">
                  <span>BMC • Master of Computer Applications</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                    21 Papers
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>BMB • Master of Business Administration</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300">
                    7 Subjects
                  </span>
                </li>
                <li>
                  <Link to="/library" className="hover:text-white transition-colors">
                    Official University Syllabus 2026-2027
                  </Link>
                </li>
                <li>
                  <Link to="/library" className="hover:text-white transition-colors">
                    5-Year Exam Question Archives
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Creator Credit & Inquiries */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-widest text-white font-bold mb-2">
                Creator & Inquiries
              </h4>
              <p className="text-xs text-zinc-300 font-semibold">
                Designed & Built by Sameer Singh
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Student of St. John's College, Agra • Platform Architect & AI Full Stack Engineer.
              </p>

              <div className="pt-2">
                <a
                  href="mailto:study.sankalp.ai@gmail.com"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all hover:scale-[1.02]"
                  title="Contact SANKALP AI"
                >
                  <Mail className="w-3.5 h-3.5 text-white" />
                  <span>study.sankalp.ai@gmail.com</span>
                </a>
              </div>
            </div>
          </div>

          {/* Sub-Footer Bar */}
          <div className="pt-5 sm:pt-7 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] sm:text-xs text-zinc-400 text-center sm:text-left">
            <p>
              &copy; {new Date().getFullYear()} SANKALP AI. Developed for University Students of St. John's College, Agra.
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3.5 sm:gap-5 font-medium text-zinc-300">
              <Link to="/coding-lab" className="text-emerald-400 hover:text-emerald-300 transition-colors font-semibold flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5" />
                <span>Coding Lab</span>
              </Link>
              <Link to="/dashboard" className="hover:text-white transition-colors">
                Launch Platform
              </Link>
              <Link to="/guide" className="hover:text-white transition-colors">
                User Guide
              </Link>
              <a href="#creator" className="hover:text-white transition-colors">
                About Creator
              </a>
              <a
                href="mailto:study.sankalp.ai@gmail.com"
                className="hover:text-white transition-colors text-white font-mono"
              >
                study.sankalp.ai@gmail.com
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
