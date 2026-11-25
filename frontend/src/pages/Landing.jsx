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
      subtitle: 'Structured Model Answers (2, 5, 10 & 15 Marks)',
      icon: Bot,
      image: '/screenshots/mentor.png',
      badge: 'Core Feature',
      tagline: 'Get exam-ready answers formatted exactly as university evaluators expect.',
      description:
        'Generic chatbots write rambling, unstructured paragraphs. SANKALP AI Mentor formats answers with clear definitions, comparative matrices, architectural bullet points, and scoring summaries calibrated for 2, 5, 10, or 15 marks.',
      highlights: [
        'Exact mark schemas: 2-mark definitions, 5-mark short notes, 10-mark full answers',
        'Auto-healed Markdown tables and comparison matrices with zero formatting bugs',
        '1-Click Unit Masterclass button for complete syllabus unit overviews',
        'Prescribed book grounding for textbook-authentic academic explanations',
      ],
      link: '/mentor',
      linkText: 'Launch AI Mentor',
    },
    {
      id: 'coding-lab',
      title: 'Interactive Coding Lab & DSA',
      subtitle: 'Multi-Language IDE & 18+ Graded DSA Questions',
      icon: Terminal,
      image: '/screenshots/coding-lab.png',
      badge: 'Live Online IDE',
      tagline: 'Write, debug, and run code with real-time interactive terminal prompts.',
      description:
        'A full-featured university programming environment and DSA problem-solving studio. Features a free-form multi-language playground with instant compiler diagnostics, traditional step-by-step interactive terminal execution (supporting scanf, cin, input(), Scanner), 18+ graded university DSA questions with sample and hidden test cases, execution runtime metrics, and an AI Debugger mentor.',
      highlights: [
        'Multi-Language Support: GCC 14 C/C++, Python 3.12, Java 17, JavaScript',
        'Interactive Terminal Console: authentic step-by-step TTY input prompts',
        '18+ Graded DSA Problems: Arrays, Matrix, Strings, Linked Lists, Stacks, Trees',
        'AI Debug Assistant: explain runtime bugs, analyze complexity, generate dry runs',
      ],
      link: '/coding-lab',
      linkText: 'Launch Coding Lab',
    },
    {
      id: 'final-paper',
      title: '5-Year Master Paper Synthesizer',
      subtitle: 'Cross-Paper Examination Synthesis',
      icon: FileCheck2,
      image: '/screenshots/final-paper.png',
      badge: 'Exclusive',
      tagline: 'Synthesizes 5 years of past exams into one definitive university paper.',
      description:
        'Never guess what might appear in your semester exams. SANKALP AI analyzes past 5-year university examination papers, detects repeat trends, and generates one official master paper balanced into Section A (Short), Section B (Analytical), and Section C (Essay with OR choices).',
      highlights: [
        'Balanced 75-mark official structure adhering to university exam rules',
        'Includes repeated questions that appeared in 3+ previous academic years',
        'Clean printable format: click Print or download as PDF for mock exams',
        'Resilient JSON synthesis engine with automatic prompt token compression',
      ],
      link: '/predictions',
      linkText: 'Generate Master Paper',
    },
    {
      id: 'viva',
      title: 'AI Viva Voce Room',
      subtitle: 'Speech-Powered Oral Exam Simulation',
      icon: Mic,
      image: '/screenshots/mentor.png',
      badge: 'Live Audio AI',
      tagline: 'Simulate high-stakes university oral vivas with an AI external examiner.',
      description:
        'Overcome oral exam anxiety with speech-driven interactive practice. SANKALP AI speaks questions aloud, transcribes your spoken answers in real time using Web Speech, and grades your response against university syllabi with instant scorecards.',
      highlights: [
        'Hands-free speech dialogue: AI speaks questions and listens to student answers',
        '4 Examiner Personas: Strict Academic, Friendly Mentor, Rapid-Fire, Standard',
        'Instant oral viva scorecard with conceptual strengths and missing points',
        'Zero typing needed  builds confidence for real university practical exams',
      ],
      link: '/viva',
      linkText: 'Enter AI Viva Room',
    },
    {
      id: 'tests',
      title: 'Timed Mock Tests & PDF Scorecard',
      subtitle: '5-Min, 10-Min Drills & Official PDF Scorecards',
      icon: ClipboardCheck,
      image: '/screenshots/final-paper.png',
      badge: 'Rapid Exam Drills',
      tagline: 'Test your retention under time pressure with automatic rubric grading and PDF export.',
      description:
        'Practice with 5-minute blitz drills, 10-minute quizzes, or full 3-hour university mocks. Features real-time urgency timer warnings, an interactive question matrix, automated marking with model answers, and instant 1-click A4 PDF scorecard download complete with your typed answers.',
      highlights: [
        'Rapid 5 Min (Blitz) & 10 Min (Express) quick revision presets',
        'Live timer HUD with smart warning alerts and review flagging',
        'Real-time word and character counters for descriptive 10-mark answers',
        'Official Scorecard PDF export with marks, grade badge, and typed answers',
      ],
      link: '/tests',
      linkText: 'Take a Mock Test',
    },
    {
      id: 'library',
      title: 'Library & Prescribed Books',
      subtitle: 'Integrated PDF Reader with Learn by Book AI',
      icon: BookOpen,
      image: '/screenshots/library.png',
      badge: 'Integrated Reader',
      tagline: 'Study prescribed textbooks side-by-side with an intelligent AI tutor.',
      description:
        'Access official university syllabus blueprints, past question papers, and prescribed textbooks (like Pradeep K. Sinha) directly in the integrated reader. Click any question or topic in the book and the AI assistant solves it instantly.',
      highlights: [
        'Prescribed Textbook Mode: answers anchored directly in textbook content',
        'Fullscreen Study Preview: large distraction-free reader with font size controls (S, M, L, XL)',
        'Expandable split-screen view: side-by-side textbook reader and AI answer workspace',
        '10 1-click university actions: Explain Paper, Solve Question, Find Similar, etc.',
      ],
      link: '/library',
      linkText: 'Open Academic Library',
    },
    {
      id: 'topics',
      title: 'Important Topics Analyzer',
      subtitle: 'High-Probability Repeated Topics',
      icon: Star,
      image: '/screenshots/topics.png',
      badge: 'Exam Intelligence',
      tagline: 'Prioritize questions that appear most frequently in previous exams.',
      description:
        'SANKALP AI scans historical exam papers and tags topics with their exact frequency (e.g., "Appeared 4x in past exams"). Students know precisely which units and topics carry the highest probability before exam day.',
      highlights: [
        'Frequency indicators: see exact historical appearances across past exams',
        'Clear explanations of why each topic is critical for scoring high marks',
        '1-Click launch directly into SANKALP AI model answer generation',
        'Filtered by course, semester, and individual academic subjects',
      ],
      link: '/topics',
      linkText: 'View Important Topics',
    },
    {
      id: 'dashboard',
      title: 'Student Academic Dashboard',
      subtitle: 'Course & Semester Synchronization',
      icon: BarChart3,
      image: '/screenshots/dashboard.png',
      badge: 'Overview',
      tagline: 'Your centralized command center for all university semester preparation.',
      description:
        'Synchronized to your selected university course (BCA, MCA, B.Sc, B.Tech) and semester. Instantly view your total subjects, available past papers, recent question history, and step-by-step exam preparation guide.',
      highlights: [
        'Instant course & semester switching with automatic curriculum reload',
        'Recent question history tracking for easy continuation of revision',
        '4-step guided workflow for systematic semester exam preparation',
        'Zero clutter, fast loading, and complete dark/light mode compatibility',
      ],
      link: '/dashboard',
      linkText: 'Open Student Dashboard',
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

      {/* Top Navbar (Monochrome Black & White, Responsive Mobile Height & Text, iPhone Notch Protection) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 sm:bg-black/85 sm:backdrop-blur-xl border-b border-white/10 transition-all pt-[env(safe-area-inset-top,0px)]">
        <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/5 border border-white/20 p-1 flex items-center justify-center transition-all duration-200 group-hover:border-white/50 group-hover:bg-white/10">
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
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white group-hover:text-zinc-200 transition-colors">
                  SANKALP AI
                </span>
                <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-zinc-300 font-semibold">
                  2.0 Core
                </span>
              </div>
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

          {/* Right Action: Enter AI Platform + Mobile Hamburger */}
          <div className="flex items-center gap-2">
            <Link
              to="/coding-lab"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Coding Lab</span>
            </Link>
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-extrabold tracking-tight shadow-md shadow-white/5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Enter SANKALP AI</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 border border-white/10 transition-colors"
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

      {/* 2-Column Hero Section: Left (Copy & CTAs) + Right (Live Software Frame) */}
      <section className="relative pt-[calc(4.75rem+env(safe-area-inset-top,0px))] pb-12 sm:pt-28 sm:pb-20 z-10">
        <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-16 items-center">
            {/* Left Column (Headline, Natural Human-Centric Copy & CTAs - Immediate Paint on Mobile) */}
            <div className="lg:col-span-6 xl:col-span-6 space-y-5 sm:space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">

              {/* Highlight Announcement Pill */}
              <Link
                to="/coding-lab"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/20 hover:border-emerald-400/60 hover:bg-emerald-950/20 text-zinc-300 hover:text-white text-xs font-medium transition-all group mb-0.5 shadow-sm"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="font-extrabold text-emerald-400 font-mono text-[10px] tracking-wider uppercase">
                  NEW
                </span>
                <span className="text-zinc-500">•</span>
                <span className="text-xs">Interactive Coding Lab &amp; DSA Studio</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 group-hover:text-emerald-400 transition-all" />
              </Link>

              {/* Bold Headline (Equal centered on mobile, responsive font) */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.2] text-center lg:text-left">
                Master Your University Exams with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
                  Presized AI Precision.
                </span>
              </h1>

              {/* Natural, Easy-to-Read Subheadline (Equal aligned on mobile, left on desktop) */}
              <p
                className="text-xs sm:text-sm md:text-base text-zinc-300 leading-relaxed font-normal max-w-xl mx-auto lg:mx-0 text-justify sm:text-justify lg:text-left hyphens-auto"
                style={{ textJustify: 'inter-word' }}
              >
                Stop drowning in unorganized 800-page PDFs and last-minute panic. SANKALP AI turns your university syllabus, past 5-year question papers, and prescribed textbooks into structured, high-scoring model answers &mdash; calibrated for 2, 5, 10, and 15 marks.
              </p>

              {/* Action Buttons (Centered on mobile, horizontal on tablet/desktop) */}
              <div className="w-full flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3 pt-1">
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs sm:text-sm font-extrabold shadow-lg shadow-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Bot className="w-4 h-4 text-black" />
                  <span>Enter SANKALP AI</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </Link>

                <Link
                  to="/coding-lab"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 hover:text-emerald-200 text-xs sm:text-sm font-bold border border-emerald-500/40 transition-all hover:border-emerald-400 shadow-lg shadow-emerald-950/30"
                >
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Coding Lab &amp; DSA</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-black bg-emerald-400 text-black">IDE</span>
                </Link>

                <Link
                  to="/business-lab"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 rounded-xl bg-amber-950/70 hover:bg-amber-900/80 text-amber-300 hover:text-amber-200 text-xs sm:text-sm font-bold border border-amber-500/40 transition-all hover:border-amber-400 shadow-lg shadow-amber-950/30"
                >
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <span>Business War Room</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-black bg-amber-400 text-black">MBA</span>
                </Link>

                <Link
                  to="/viva"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-white text-xs sm:text-sm font-bold border border-white/20 transition-all hover:border-white/40"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <Mic className="w-4 h-4 text-white" />
                  <span>AI Viva Room</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-white text-black">LIVE</span>
                </Link>

                <Link
                  to="/tests"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-white text-xs sm:text-sm font-bold border border-white/20 transition-all hover:border-white/40"
                >
                  <ClipboardCheck className="w-4 h-4 text-white" />
                  <span>Timed Mock Drills</span>
                </Link>

                <Link
                  to="/predictions"
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-transparent hover:bg-white/5 text-zinc-300 hover:text-white text-xs sm:text-sm font-semibold transition-colors"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>5-Yr Master Paper</span>
                </Link>
              </div>

              {/* 3 Value Metrics on Left Column (Centered on mobile, aligned on desktop) */}
              <div className="w-full pt-5 border-t border-white/10 grid grid-cols-3 gap-2 sm:gap-4 text-center lg:text-left">
                <div>
                  <p className="text-base sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-white">5-Year</p>
                  <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5 font-medium leading-tight">Cross-Paper Analysis</p>
                </div>
                <div>
                  <p className="text-base sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-white">2 - 15M</p>
                  <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5 font-medium leading-tight">Mark Formats</p>
                </div>
                <div>
                  <p className="text-base sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-white">100%</p>
                  <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5 font-medium leading-tight">Syllabus Grounded</p>
                </div>
              </div>
            </div>

            {/* Right Column (Hero Visual: Sleek Software Showcase Window - Instant Render) */}
            <div className="lg:col-span-6 xl:col-span-6">
              <div className="relative rounded-3xl bg-zinc-950 border border-white/20 p-3 sm:p-4 shadow-2xl overflow-hidden group">
                {/* Window Frame Top Header */}
                <div className="h-10 px-4 bg-zinc-900/90 rounded-2xl border border-white/10 flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-zinc-700" />
                    <div className="w-3 h-3 rounded-full bg-zinc-700" />
                    <div className="w-3 h-3 rounded-full bg-zinc-700" />
                    <span className="text-xs font-mono text-zinc-400 ml-2">
                      sankalp-ai://exam-mentor/unit-masterclass
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>ACTIVE CORE</span>
                  </div>
                </div>

                {/* Main Hero Software Screenshot */}
                <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-[16/10] bg-black">
                  <img
                    src="/screenshots/mentor.png"
                    alt="SANKALP AI Exam Mentor Interface"
                    width="800"
                    height="500"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-102"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                  {/* Floating Highlight Chips */}
                  <Link
                    to="/coding-lab"
                    className="absolute top-3.5 left-3.5 bg-black/90 backdrop-blur-md border border-emerald-500/40 hover:border-emerald-400 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 transition-transform hover:scale-105 group/chip"
                  >
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Coding Lab: C, C++, Python, Java</span>
                    <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-emerald-500/20 text-emerald-300">RUN</span>
                  </Link>

                  <div className="absolute top-3.5 right-3.5 bg-black/85 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-2">
                    <Target className="w-4 h-4 text-white" />
                    <span className="text-xs sm:text-sm font-bold text-white">10-Mark Model Answer Structure</span>
                  </div>

                  <div className="absolute bottom-3.5 left-3.5 bg-black/85 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <Mic className="w-4 h-4 text-white" />
                    <span className="text-xs sm:text-sm font-bold text-white">Oral Viva Voce & Speech AI</span>
                  </div>

                  <div className="absolute bottom-3.5 right-3.5">
                    <Link
                      to="/tests"
                      className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white text-black shadow-md hover:bg-zinc-200 inline-flex items-center gap-1.5 transition-transform hover:scale-105"
                    >
                      <ClipboardCheck className="w-3.5 h-3.5 text-black" />
                      <span>5M & 10M Mock Drills</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Academic Validation Ribbon (8XL Width, Centered on Mobile) */}
      <section className="border-y border-white/10 bg-zinc-950/80 py-5 sm:py-6 z-10 relative">
        <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 flex flex-wrap items-center justify-center lg:justify-between gap-4 sm:gap-5 text-center lg:text-left text-xs sm:text-sm font-semibold text-zinc-300">
          <div className="flex items-center justify-center gap-2">
            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />
            <span>St. John's College, Agra Curriculum Grounded</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <FileCheck2 className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />
            <span>5-Year Cross-Paper Pattern Analysis (2021-2025)</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />
            <span>Prescribed Textbook Mode (Pradeep K. Sinha)</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />
            <span>Zero Hallucinations • Direct University Marking Keys</span>
          </div>
        </div>
      </section>

      {/* CORE PRODUCT TOUR SECTION: Inside the Software with Real Screenshots & Deep Descriptions */}
      <section id="tour" className="py-14 sm:py-20 z-10 relative">
        <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3 text-center md:text-left items-center md:items-end">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-1.5 block">
                Product Tour & Inside Software
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Explore the Software Modules in Action
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md leading-relaxed mx-auto md:mx-0">
              Real screenshots from SANKALP AI. Each module is specifically architected to solve a critical university exam challenge.
            </p>
          </div>

          {/* Module Selector Tabs (Centered on mobile, horizontal touch scrolling) */}
          <div className="flex items-center justify-center md:justify-start gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
            {tourModules.map((module) => {
              const Icon = module.icon;
              const isActive = module.id === activeTourTab;
              return (
                <button
                  key={module.id}
                  onClick={() => setActiveTourTab(module.id)}
                  className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shrink-0 transition-all border ${isActive
                    ? 'bg-white text-black border-white shadow-md'
                    : 'bg-zinc-950 text-zinc-400 border-white/10 hover:border-white/30 hover:text-white'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{module.title}</span>
                </button>
              );
            })}
          </div>

          {/* Detailed Module Showcase Card: Left Description & Highlights, Right Real Screenshot */}
          <div className="rounded-3xl bg-zinc-950 border border-white/15 p-5 sm:p-8 lg:p-10 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left / Info & Detailed Points (Centered on mobile, left on desktop) */}
              <div className="lg:col-span-5 space-y-4 sm:space-y-5 text-center lg:text-left flex flex-col items-center lg:items-start">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-zinc-200">
                    {activeModule.badge}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">{activeModule.subtitle}</span>
                </div>

                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                  {activeModule.title}
                </h3>

                <p className="text-xs sm:text-sm font-medium text-zinc-200 italic border-l-0 lg:border-l-2 pl-0 lg:pl-3 leading-relaxed max-w-md">
                  "{activeModule.tagline}"
                </p>

                <p
                  className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal max-w-md text-justify sm:text-justify lg:text-left hyphens-auto"
                  style={{ textJustify: 'inter-word' }}
                >
                  {activeModule.description}
                </p>

                {/* Key Highlights (Centered block on mobile with neat checkmarks) */}
                <div className="space-y-2 pt-1 w-full max-w-md text-left">
                  <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block font-bold text-center lg:text-left mb-2">
                    Key Academic Features:
                  </span>
                  {activeModule.highlights.map((h, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                      <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="leading-snug">{h}</span>
                    </div>
                  ))}
                </div>

                {/* Direct Action Link (Centered button on mobile) */}
                <div className="pt-3 w-full flex justify-center lg:justify-start">
                  <Link
                    to={activeModule.link}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs sm:text-sm font-extrabold transition-all hover:scale-102"
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
                  <div className="rounded-xl overflow-hidden border border-white/10 aspect-[16/10] bg-zinc-900 relative">
                    {activeModule.id === 'coding-lab' ? (
                      <div className="w-full h-full bg-[#0a0d12] flex flex-col font-mono text-xs select-none p-0">
                        {/* Editor Tab Bar */}
                        <div className="flex items-center justify-between px-3 py-2 bg-[#12161f] border-b border-white/10 text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                            <span className="ml-2 px-2.5 py-0.5 rounded bg-zinc-800/90 text-white border border-white/10 flex items-center gap-1.5 font-sans font-medium text-[11px]">
                              <span className="text-emerald-400 font-bold font-mono">C</span> main.c
                            </span>
                            <span className="px-2 py-0.5 rounded text-zinc-400 hover:text-zinc-200 font-sans font-medium text-[11px] hidden sm:inline-block">
                              solution.py
                            </span>
                            <span className="px-2 py-0.5 rounded text-zinc-400 hover:text-zinc-200 font-sans font-medium text-[11px] hidden sm:inline-block">
                              Main.java
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-zinc-400 text-[10px]">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                              GCC 14.2
                            </span>
                            <span className="px-2 py-0.5 rounded bg-white/10 text-white font-sans hidden sm:inline-block">
                              Run Code
                            </span>
                          </div>
                        </div>

                        {/* Editor Code Canvas */}
                        <div className="p-3.5 bg-[#0a0d12] text-zinc-300 text-[11px] sm:text-xs leading-relaxed overflow-hidden font-mono flex-1">
                          <div className="flex gap-3">
                            <div className="text-zinc-600 select-none text-right font-mono pr-1 text-[10px] leading-[1.6]">
                              1<br />2<br />3<br />4<br />5<br />6<br />7<br />8
                            </div>
                            <div className="flex-1 font-mono text-[11px] sm:text-xs leading-[1.6]">
                              <span className="text-pink-400">#include</span> <span className="text-amber-300">&lt;stdio.h&gt;</span><br />
                              <span className="text-purple-400">int</span> <span className="text-blue-400">main</span>() &#123;<br />
                              &nbsp;&nbsp;<span className="text-purple-400">int</span> a, b;<br />
                              &nbsp;&nbsp;<span className="text-yellow-300">printf</span>(<span className="text-emerald-300">"Enter Two Numbers: "</span>);<br />
                              &nbsp;&nbsp;<span className="text-yellow-300">scanf</span>(<span className="text-emerald-300">"%d %d"</span>, &amp;a, &amp;b);<br />
                              &nbsp;&nbsp;<span className="text-yellow-300">printf</span>(<span className="text-emerald-300">"Sum Of Values = %d\n"</span>, a + b);<br />
                              &nbsp;&nbsp;<span className="text-purple-400">return</span> <span className="text-cyan-400">0</span>;<br />
                              &#125;
                            </div>
                          </div>
                        </div>

                        {/* Interactive Terminal */}
                        <div className="border-t border-white/10 bg-black/95 p-3 text-[11px] font-mono">
                          <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1.5 pb-1 border-b border-white/5">
                            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Interactive Terminal (TTY)
                            </span>
                            <span className="text-zinc-500 font-sans">0.012s • 1MB RAM</span>
                          </div>
                          <div className="text-zinc-300 space-y-1 leading-snug">
                            <p className="text-zinc-400 font-semibold">
                              <span className="text-emerald-400 font-bold">sankalp@ide:~$</span> ./main
                            </p>
                            <p className="text-zinc-200">
                              Enter Two Numbers: <span className="text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">10 20</span>
                            </p>
                            <p className="text-emerald-300 font-semibold">
                              Sum Of Values = 30
                            </p>
                            <p className="text-[10px] text-zinc-500 font-mono">
                              [Process finished with exit code 0]
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={activeModule.image}
                        alt={activeModule.title}
                        width="800"
                        height="500"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-102"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* CREATOR SPOTLIGHT SECTION (Sameer Singh • St. John's College Agra, Centered on Mobile) */}
      <section id="creator" className="py-14 sm:py-20 border-t border-white/10 z-10 relative">
        <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-1.5 block">
              Architect & Visionary
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Crafted by a Student, for Students
            </h2>
          </div>

          {/* Luxury Monochrome Profile Card */}
          <div className="relative rounded-3xl bg-zinc-950 border border-white/15 p-6 sm:p-10 lg:p-12 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/5 to-transparent blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-10 text-center md:text-left">
              {/* Profile Image with Monochrome Ring */}
              <div className="relative shrink-0 text-center mx-auto md:mx-0">
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/30 shadow-2xl p-1 bg-black mx-auto">
                  <img
                    src="/sameer.png"
                    alt="Sameer Singh - Creator of SANKALP AI"
                    width="176"
                    height="176"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover rounded-xl sm:rounded-2xl grayscale-0 sm:grayscale contrast-110 sm:hover:grayscale-0 transition-all duration-500" />
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl ring-1 ring-white/20 pointer-events-none" />
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-white">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  <span>Verified Builder</span>
                </div>
              </div>

              {/* Bio & Details */}
              <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                    Platform Architect & Lead Creator
                  </span>
                  <span className="text-zinc-600 hidden md:inline">&bull;</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-white font-semibold">
                    Full Stack & AI Engineer
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-2">
                  Sameer Singh
                </h3>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/15 text-xs sm:text-sm font-bold text-white mb-4">
                  <GraduationCap className="w-4 h-4 text-white" />
                  <span>Student of St. John's College, Agra</span>
                </div>

                <p
                  className="text-zinc-300 text-xs sm:text-sm md:text-base leading-relaxed mb-6 font-normal max-w-2xl mx-auto md:mx-0 hyphens-auto"
                  style={{ textAlign: 'justify', textJustify: 'inter-word' }}
                >
                  &ldquo;SANKALP AI was born out of a real classroom reality at <strong>St. John&apos;s College, Agra</strong> &mdash; every semester, students wrestle with scattered notes, unpredictable question patterns, and thick textbooks. I architected SANKALP AI to be an autonomous, syllabus-aligned intelligence system that transforms 5-year past papers and prescribed textbooks into structured, mark-winning model answers so every student can prepare with absolute clarity and confidence.&rdquo;
                </p>

                {/* Highlights Grid */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-white/10 text-xs sm:text-sm">
                  <div className="p-3 rounded-xl bg-black border border-white/10 text-center sm:text-left">
                    <span className="text-[10px] sm:text-[11px] font-mono text-zinc-400 block mb-0.5">ACADEMIC ALMA MATER</span>
                    <p className="font-bold text-white text-xs sm:text-sm">St. John's College, Agra</p>
                  </div>

                  <div className="p-3 rounded-xl bg-black border border-white/10 text-center sm:text-left">
                    <span className="text-[10px] sm:text-[11px] font-mono text-zinc-400 block mb-0.5">CORE TECHNOLOGY</span>
                    <p className="font-bold text-white text-xs sm:text-sm">React 19, Node.js, Groq AI</p>
                  </div>

                  <div className="p-3 rounded-xl bg-black border border-white/10 text-center sm:text-left">
                    <span className="text-[10px] sm:text-[11px] font-mono text-zinc-400 block mb-0.5">PURPOSE & MISSION</span>
                    <p className="font-bold text-white text-xs sm:text-sm">Empowering Students</p>
                  </div>

                  <a
                    href="mailto:study.sankalp.ai@gmail.com"
                    className="p-3 rounded-xl bg-black border border-white/10 hover:border-white/30 transition-all text-center sm:text-left block group"
                    title="Send an email enquiry"
                  >
                    <span className="text-[10px] sm:text-[11px] font-mono text-zinc-400 mb-0.5 flex items-center justify-center sm:justify-start gap-1">
                      <Mail className="w-3 h-3 text-white" />
                      <span>QUERIES & ENQUIRY</span>
                    </span>
                    <p className="font-bold text-white text-xs sm:text-sm truncate group-hover:underline">
                      study.sankalp.ai@gmail.com
                    </p>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Core Architectural Capabilities Grid (8XL Width, Centered on Mobile) */}
      <section id="features" className="py-14 sm:py-20 border-t border-white/10 z-10 relative">
        <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-1.5 block">
              Platform Features
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-2.5">
              Everything Needed for 90%+ Semester Exam Scores
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
              Every tool inside SANKALP AI is built with one clear purpose: eliminating exam uncertainty and giving students precise, model-grade answers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-5 sm:p-7 rounded-2xl bg-zinc-950 border border-emerald-500/30 hover:border-emerald-500/60 transition-all flex flex-col justify-between text-center sm:text-left items-center sm:items-start group relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500/10 border-b border-l border-emerald-500/20 rounded-bl-xl text-[10px] font-mono text-emerald-400 font-bold">
                NEW
              </div>
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-4 mx-auto sm:mx-0 group-hover:scale-105 transition-transform">
                  <Terminal className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white mb-1.5 flex items-center gap-2">
                  <span>Coding Lab &amp; DSA Studio</span>
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                  Multi-language browser compiler (C, C++, Python 3, Java 17) with interactive step-by-step terminal execution, 18+ graded DSA problems, and AI bug diagnosis.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-xs font-mono text-emerald-400 flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Interactive TTY Terminal</span>
                </div>
                <Link to="/coding-lab" className="hover:underline flex items-center gap-1 text-white font-semibold">
                  <span>Open Lab</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <div className="p-5 sm:p-7 rounded-2xl bg-zinc-950 border border-white/10 hover:border-white/30 transition-all flex flex-col justify-between text-center sm:text-left items-center sm:items-start">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-white mb-4 mx-auto sm:mx-0">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white mb-1.5">
                  5-Year Master Paper Synthesizer
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                  Aggregates recurring questions across the last 5 years into a balanced official paper format (Sections A, B, and C).
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-xs font-mono text-zinc-400 flex items-center justify-center sm:justify-start gap-1.5 w-full">
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Automatic Section A/B/C Balancing</span>
              </div>
            </div>

            <div className="p-5 sm:p-7 rounded-2xl bg-zinc-950 border border-white/10 hover:border-white/30 transition-all flex flex-col justify-between text-center sm:text-left items-center sm:items-start">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-white mb-4 mx-auto sm:mx-0">
                  <Mic className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white mb-1.5">
                  Speech-Powered AI Viva Voce
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                  Simulate high-stakes university oral vivas with spoken questions, speech-to-text student responses, and instant rubric grading across 4 examiner personas.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-xs font-mono text-zinc-400 flex items-center justify-center sm:justify-start gap-1.5 w-full">
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Hands-Free Speech Dialogue</span>
              </div>
            </div>

            <div className="p-5 sm:p-7 rounded-2xl bg-zinc-950 border border-white/10 hover:border-white/30 transition-all flex flex-col justify-between text-center sm:text-left items-center sm:items-start">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-white mb-4 mx-auto sm:mx-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white mb-1.5">
                  Learn by Prescribed Book Mode
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                  Anchors answers directly in prescribed university textbooks like Pradeep K. Sinha for page-authentic definitions and diagrams.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-xs font-mono text-zinc-400 flex items-center justify-center sm:justify-start gap-1.5 w-full">
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Textbook Definitions & Diagrams</span>
              </div>
            </div>

            <div className="p-5 sm:p-7 rounded-2xl bg-zinc-950 border border-white/10 hover:border-white/30 transition-all flex flex-col justify-between text-center sm:text-left items-center sm:items-start">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-white mb-4 mx-auto sm:mx-0">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white mb-1.5">
                  Mark-Specific Model Formats
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                  Instant answer generation tailored for 2-mark definitions, 5-mark short notes, and 10-mark architectural essays.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-xs font-mono text-zinc-400 flex items-center justify-center sm:justify-start gap-1.5 w-full">
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Engineered for Maximum Marks</span>
              </div>
            </div>

            <div className="p-5 sm:p-7 rounded-2xl bg-zinc-950 border border-white/10 hover:border-white/30 transition-all flex flex-col justify-between text-center sm:text-left items-center sm:items-start">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-white mb-4 mx-auto sm:mx-0">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white mb-1.5">
                  Syllabus Unit Masterclasses
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                  Every syllabus unit is systematically linked with topics and 1-click comprehensive unit deep-dives for rapid pre-exam revision.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-xs font-mono text-zinc-400 flex items-center justify-center sm:justify-start gap-1.5 w-full">
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Zero Hallucinations • Syllabus Locked</span>
              </div>
            </div>

            <div className="p-5 sm:p-7 rounded-2xl bg-zinc-950 border border-white/10 hover:border-white/30 transition-all flex flex-col justify-between text-center sm:text-left items-center sm:items-start">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-white mb-4 mx-auto sm:mx-0">
                  <Maximize2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white mb-1.5">
                  Fullscreen Study Reader & Sizing
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                  Distraction-free large study preview modal with dynamic font scaling (S, M, L, XL), wide-split views, and printable notes.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-xs font-mono text-zinc-400 flex items-center justify-center sm:justify-start gap-1.5 w-full">
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Responsive & Easy on the Eyes</span>
              </div>
            </div>

            <div className="p-5 sm:p-7 rounded-2xl bg-zinc-950 border border-white/10 hover:border-white/30 transition-all flex flex-col justify-between text-center sm:text-left items-center sm:items-start">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-white mb-4 mx-auto sm:mx-0">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white mb-1.5">
                  High-Speed BYOK Engine
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                  Powered by ultra-fast Groq LLaMA-3.3 acceleration. Connect with your own free API key stored securely in your browser session.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-xs font-mono text-zinc-400 flex items-center justify-center sm:justify-start gap-1.5 w-full">
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Instant Inference • Browser Session Only</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step University Exam Master Workflow (8XL Width, Centered on Mobile) */}
      <section id="workflow" className="py-14 sm:py-20 bg-zinc-950/70 border-t border-white/10 z-10 relative">
        <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-1.5 block">
              Proven Methodology
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              4 Steps to Top Semester Marks
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-5 sm:p-6 rounded-2xl bg-black border border-white/10 flex flex-col justify-between text-center sm:text-left items-center sm:items-start">
              <div>
                <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">
                  Phase 01
                </span>
                <h4 className="font-bold text-white text-sm sm:text-base mb-1.5">Sync the Syllabus</h4>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                  Select your university course and semester. Access verified units, prescribed books, and syllabus outlines.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-xs font-mono text-zinc-400 w-full text-center sm:text-left">
                Papers & Syllabus Module
              </div>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-black border border-white/10 flex flex-col justify-between text-center sm:text-left items-center sm:items-start">
              <div>
                <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">
                  Phase 02
                </span>
                <h4 className="font-bold text-white text-sm sm:text-base mb-1.5">Identify Repetitions</h4>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                  Review historical frequencies. Prioritize topics that repeat 3+ times in official university examinations.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-xs font-mono text-zinc-400 w-full text-center sm:text-left">
                Important Topics Module
              </div>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-black border border-white/10 flex flex-col justify-between text-center sm:text-left items-center sm:items-start">
              <div>
                <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">
                  Phase 03
                </span>
                <h4 className="font-bold text-white text-sm sm:text-base mb-1.5">Learn Model Structures</h4>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                  Generate 10-mark model answers containing exact introductions, comparative tables, and bullet points.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-xs font-mono text-zinc-400 w-full text-center sm:text-left">
                AI Exam Mentor Module
              </div>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-black border border-white/10 flex flex-col justify-between text-center sm:text-left items-center sm:items-start">
              <div>
                <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">
                  Phase 04
                </span>
                <h4 className="font-bold text-white text-sm sm:text-base mb-1.5">Solve 5-Yr Master Paper</h4>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                  Synthesize and print the 5-Year Master Final Paper. Simulate the exam atmosphere and test your preparedness.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-xs font-mono text-zinc-400 w-full text-center sm:text-left">
                Final Paper Module
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* High-Impact Final Call to Action */}
      <section className="py-14 sm:py-20 border-t border-white/10 z-10 relative">
        <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 text-center">
          <div className="p-6 sm:p-12 lg:p-16 rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border border-white/20 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 max-w-xl mx-auto">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2 block">
                Immediate Access • Zero Complex Setup
              </span>
              <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
                Ready to Ace Your University Exams?
              </h2>
              <p className="text-zinc-300 text-xs sm:text-sm md:text-base mb-6 leading-relaxed">
                Step into SANKALP AI right now. Synthesize your first 5-year exam paper or study chapter-by-chapter with your prescribed university textbook.
              </p>

              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs sm:text-sm font-extrabold shadow-2xl transition-all hover:scale-103 active:scale-[0.98]"
              >
                <Bot className="w-4 h-4 text-black" />
                <span>Enter SANKALP AI Platform</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </Link>

              <p className="text-[11px] sm:text-xs text-zinc-400 font-mono mt-3.5">
                Free academic tier available • St. John's College, Agra • Enquiry:{' '}
                <a href="mailto:study.sankalp.ai@gmail.com" className="text-white hover:underline underline-offset-2">
                  study.sankalp.ai@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rich High-Impact Monochrome Footer */}
      <footer className="relative z-10 border-t border-white/20 bg-zinc-950 text-zinc-400 text-xs pt-16 pb-12 shadow-2xl">
        <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          {/* Main 4-Column Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 pb-12 border-b border-white/10">
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
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
            <p>
              &copy; {new Date().getFullYear()} SANKALP AI. Developed for University Students of St. John's College, Agra.
            </p>

            <div className="flex flex-wrap items-center gap-5 font-medium text-zinc-300">
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