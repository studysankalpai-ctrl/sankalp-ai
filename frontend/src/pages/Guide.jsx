import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Mic,
  Key,
  Bot,
  BookOpen,
  FileCheck2,
  Printer,
  Target,
  HelpCircle,
  ChevronDown,
  ChevronsUpDown,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Mail,
  ArrowRight,
  Info,
  Clock,
  Sparkles,
  Smartphone,
  RotateCcw,
  Search,
  Compass,
  FileText,
  Award,
  Layers,
  CheckCheck,
} from 'lucide-react';
import useAppStore from '../store/appStore';
import toast from 'react-hot-toast';

export default function Guide() {
  const { isAiConnected, selectedCourse, selectedSemester } = useAppStore();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Collapsible Accordion State
  const [openSections, setOpenSections] = useState({
    quickstart: true,
    viva: true,
    mentor: false,
    apikey: false,
    predictions: false,
    revision: false,
    hacks: false,
    faq: false,
  });

  const toggleSection = (id) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const all = {};
    GUIDE_MODULES.forEach((m) => (all[m.id] = true));
    setOpenSections(all);
    toast.success('All guide modules opened');
  };

  const collapseAll = () => {
    setOpenSections({});
    toast.success('All guide modules collapsed');
  };

  const openAndScrollTo = (id) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: true,
    }));
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('study.sankalp.ai@gmail.com');
    setCopiedEmail(true);
    toast.success('Support email copied to clipboard!');
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  // 5 Instant Goal Pathfinders for Students
  const STUDENT_GOALS = [
    {
      id: 'quickstart',
      title: 'First Time Here?',
      desc: 'Set up in 60 seconds',
      icon: Zap,
    },
    {
      id: 'viva',
      title: 'Practice Oral Viva',
      desc: 'Speak answers out loud',
      icon: Mic,
    },
    {
      id: 'mentor',
      title: '10 & 15-Mark Answers',
      desc: 'Scoring headings & diagrams',
      icon: Bot,
    },
    {
      id: 'predictions',
      title: 'Past 5-Year Papers',
      desc: 'Solve recurring questions',
      icon: FileCheck2,
    },
    {
      id: 'revision',
      title: 'Exam Tomorrow?',
      desc: '1-page A4 cheat sheet PDF',
      icon: Printer,
    },
  ];

  const GUIDE_MODULES = [
    {
      id: 'quickstart',
      step: '01',
      title: '60-Second Quickstart (Start Here)',
      subtitle: 'The 3 simple steps to get exam-ready right away.',
      icon: Zap,
      keywords: 'start setup course semester begin first time install',
    },
    {
      id: 'viva',
      step: '02',
      title: 'AI Oral Viva-Voce Room (Spoken Practice)',
      subtitle: 'Zero typing  speak with an external AI examiner in Hindi or English.',
      icon: Mic,
      keywords: 'viva oral speak voice mic cross questions trap external audio hindi hinglish',
    },
    {
      id: 'apikey',
      step: '03',
      title: 'Connect Free Groq AI Key (Zero Cost)',
      subtitle: 'Get your personal 100% free API key in 3 clicks with private storage.',
      icon: Key,
      keywords: 'api key groq free token tpm console privacy vpn gsk password',
    },
    {
      id: 'mentor',
      step: '04',
      title: 'AI Exam Mentor & Model Answers (`/mentor`)',
      subtitle: 'How to get exact university marking scheme answers with diagrams.',
      icon: Bot,
      keywords: 'mentor model answers 10 marks 15 marks 5 marks 2 marks book mode headings diagrams',
    },
    {
      id: 'predictions',
      step: '05',
      title: '5-Year Final Exam Papers & Recurring Questions',
      subtitle: 'Target the 70% recurring questions across 2021–2025 university archives.',
      icon: FileCheck2,
      keywords: '5 year final paper pyq questions section a b c repeat recurring',
    },
    {
      id: 'revision',
      step: '06',
      title: '1-Page Printable Cheat Sheet & Flashcards',
      subtitle: 'Printable A4 PDF summary for the morning of your exam.',
      icon: Printer,
      keywords: 'cheat sheet pdf print a4 download revision flashcards morning last minute',
    },
    {
      id: 'hacks',
      step: '07',
      title: 'Golden Exam Hacks for 90%+ Marks',
      subtitle: 'What university professors look for when checking your paper.',
      icon: Target,
      keywords: 'hacks tips marks 90 scoring rules diagrams table difference underline',
    },
    {
      id: 'faq',
      step: '08',
      title: 'Frequently Asked Questions (FAQ)',
      subtitle: 'Simple solutions for TPM limits, mobile phones, and offline storage.',
      icon: HelpCircle,
      keywords: 'faq help error token limit tpm mobile phone android iphone export',
    },
  ];

  // Filter modules based on search query
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return GUIDE_MODULES;
    const q = searchQuery.toLowerCase();
    return GUIDE_MODULES.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.subtitle.toLowerCase().includes(q) ||
        m.keywords.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const allExpanded = filteredModules.every((m) => openSections[m.id]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-14 select-none animate-in fade-in duration-200">
      {/* 1. Header & Purpose */}
      <div className="space-y-2 border-b border-gray-200 dark:border-neutral-800 pb-5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold">
            Student Handbook
          </span>
          <span className="text-xs text-gray-400 font-mono">
            St. John's College & University Edition
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white">
          SANKALP AI Student Guide
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed">
          Everything explained in simple, step-by-step language so you can prepare for semester exams without confusion.
        </p>
      </div>

      {/* 2. INSTANT PATHFINDER: "What is your goal today?" */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            <span>What do you want to do right now?</span>
          </h2>
          <span className="text-[10px] text-gray-400 hidden sm:inline">
            Tap any goal to jump directly to its guide
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {STUDENT_GOALS.map((goal) => {
            const Icon = goal.icon;
            return (
              <button
                key={goal.id}
                type="button"
                onClick={() => openAndScrollTo(goal.id)}
                className="p-3 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 hover:border-black dark:hover:border-white transition-all text-left flex flex-col justify-between gap-2 shadow-2xs group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-xl bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 flex items-center justify-center text-gray-900 dark:text-white group-hover:scale-110 transition-transform shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-950 dark:text-white leading-tight">
                    {goal.title}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                    {goal.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Search Bar + Expand / Collapse All Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Instant Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guide (e.g. viva, 10 marks, key, pdf)..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] text-xs text-gray-950 dark:text-white placeholder-gray-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
          />
        </div>

        {/* Global Expand / Collapse All */}
        <button
          type="button"
          onClick={allExpanded ? collapseAll : expandAll}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 text-gray-800 dark:text-gray-200 transition-colors cursor-pointer shrink-0"
        >
          <ChevronsUpDown className="w-3.5 h-3.5" />
          <span>{allExpanded ? 'Collapse All Modules' : 'Expand All Modules'}</span>
        </button>
      </div>

      {/* 4. GUIDE MODULES ACCORDION LIST */}
      <div className="space-y-3 sm:space-y-4">
        {/* ============================================================ */}
        {/* MODULE 1: 60-Second Quickstart */}
        {/* ============================================================ */}
        {filteredModules.some((m) => m.id === 'quickstart') && (
          <div
            id="quickstart"
            className="rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 shadow-2xs overflow-hidden transition-all"
          >
            <button
              type="button"
              onClick={() => toggleSection('quickstart')}
              className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/70 dark:hover:bg-neutral-900/40 transition-colors"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <span className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 flex items-center justify-center font-black text-xs text-gray-900 dark:text-white shrink-0">
                  01
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-gray-950 dark:text-white flex items-center gap-2 truncate">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>60-Second Quickstart (Start Here)</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    The 3 simple steps to get exam-ready right away.
                  </p>
                </div>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${openSections.quickstart ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {openSections.quickstart && (
              <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-1 border-t border-gray-100 dark:border-neutral-800 space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Step 1</span>
                    <h4 className="font-bold text-xs text-gray-950 dark:text-white">Choose Your Course</h4>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                      Look at the top navbar. Select your course (e.g. <strong>BMC</strong>) and semester. SANKALP will instantly load your exact university syllabus and subjects.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Step 2</span>
                    <h4 className="font-bold text-xs text-gray-950 dark:text-white">Add Free AI Key</h4>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                      Open <Link to="/settings" className="font-bold underline text-gray-950 dark:text-white">Settings</Link> and paste your free key from Groq. It takes 30 seconds and costs zero money.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Step 3</span>
                    <h4 className="font-bold text-xs text-gray-950 dark:text-white">Pick How to Study</h4>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                      Practice speaking in <Link to="/viva" className="font-bold underline text-gray-950 dark:text-white">Viva Room</Link>, get model answers in <Link to="/mentor" className="font-bold underline text-gray-950 dark:text-white">Mentor</Link>, or solve recurring papers in <Link to="/predictions" className="font-bold underline text-gray-950 dark:text-white">5-Year Paper</Link>.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[11px] text-gray-600 dark:text-gray-400">
                    💡 <strong>Pro Tip:</strong> You do NOT need to register or log in with passwords. Your setup stays saved locally on your device.
                  </span>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black transition-colors"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* MODULE 2: AI Viva Room */}
        {/* ============================================================ */}
        {filteredModules.some((m) => m.id === 'viva') && (
          <div
            id="viva"
            className="rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 shadow-2xs overflow-hidden transition-all"
          >
            <button
              type="button"
              onClick={() => toggleSection('viva')}
              className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/70 dark:hover:bg-neutral-900/40 transition-colors"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <span className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 flex items-center justify-center font-black text-xs text-gray-900 dark:text-white shrink-0">
                  02
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-gray-950 dark:text-white flex items-center gap-2 truncate">
                    <Mic className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>AI Oral Viva-Voce Room (Spoken Practice)</span>
                    <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-black text-white dark:bg-white dark:text-black">
                      NEW
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    Zero typing  speak with an external AI examiner in Hindi, English, or Hinglish.
                  </p>
                </div>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${openSections.viva ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {openSections.viva && (
              <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-1 border-t border-gray-100 dark:border-neutral-800 space-y-4 animate-in fade-in duration-150">
                <div className="space-y-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800 space-y-2">
                    <h4 className="font-bold text-xs text-gray-950 dark:text-white">
                      How to do an Oral Viva in 3 Steps:
                    </h4>
                    <ol className="list-decimal list-inside space-y-1.5 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      <li>Open <Link to="/viva" className="font-bold underline text-gray-950 dark:text-white">AI Viva Room</Link> and pick your subject (e.g. <em>Computer Fundamentals</em>).</li>
                      <li>Choose your language: <strong>English</strong>, <strong>हिंदी</strong>, or <strong>Hinglish</strong> (how we speak in college).</li>
                      <li>Tap the glowing AI voice orb, listen to the examiner's spoken question, and speak your answer out loud!</li>
                    </ol>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 space-y-1">
                      <span className="font-bold text-gray-950 dark:text-white flex items-center gap-1.5">
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Catches Ratta (Memorization)</span>
                      </span>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                        If your answer sounds like a memorized definition, the AI external examiner asks a real cross-question: <em>"Can you give an example?"</em> or <em>"What happens if memory is full?"</em>
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 space-y-1">
                      <span className="font-bold text-gray-950 dark:text-white flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-purple-500" />
                        <span>Instant Grade & Trap Questions</span>
                      </span>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                        When you finish, you get an immediate university score card, list of concepts to revise, and 3 tricky trap questions professors love to ask in that subject.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[11px] text-gray-500">Works smoothly on Android Chrome and iPhone Safari.</span>
                  <Link
                    to="/viva"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black transition-colors"
                  >
                    <span>Start Practice Session</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* MODULE 3: API Key Setup */}
        {/* ============================================================ */}
        {filteredModules.some((m) => m.id === 'apikey') && (
          <div
            id="apikey"
            className="rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 shadow-2xs overflow-hidden transition-all"
          >
            <button
              type="button"
              onClick={() => toggleSection('apikey')}
              className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/70 dark:hover:bg-neutral-900/40 transition-colors"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <span className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 flex items-center justify-center font-black text-xs text-gray-900 dark:text-white shrink-0">
                  03
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-gray-950 dark:text-white flex items-center gap-2 truncate">
                    <Key className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>Connect Free Groq AI Key (Zero Cost)</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    Get your personal 100% free API key in 3 clicks with private storage.
                  </p>
                </div>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${openSections.apikey ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {openSections.apikey && (
              <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-1 border-t border-gray-100 dark:border-neutral-800 space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <h4 className="font-bold text-xs text-gray-950 dark:text-white">
                      Why Bring-Your-Own-Key (BYOK)?
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      Groq gives every student an ultra-fast AI engine for free (up to 1,000 tokens per second). By connecting your own free key:
                    </p>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                      <li>You never pay any subscription fees.</li>
                      <li>Your questions remain 100% private.</li>
                      <li>You experience zero lag and instant streaming.</li>
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800 space-y-2">
                    <h4 className="font-bold text-xs text-gray-950 dark:text-white">
                      3 Steps to Get Your Key:
                    </h4>
                    <ol className="list-decimal list-inside space-y-1 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      <li>Open <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="font-bold underline text-gray-950 dark:text-white inline-flex items-center gap-0.5">console.groq.com/keys <ExternalLink className="w-3 h-3" /></a></li>
                      <li>Sign in with your Google account.</li>
                      <li>Click <strong>Create API Key</strong>, copy it, and paste it in <Link to="/settings" className="font-bold underline text-gray-950 dark:text-white">Settings</Link>.</li>
                    </ol>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold pt-1">
                      ⚠️ Note: Turn off VPN (Proton VPN, etc.) before saving, as Groq blocks active proxies.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link
                    to="/settings"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black transition-colors"
                  >
                    <span>Open Settings to Add Key</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* MODULE 4: AI Exam Mentor */}
        {/* ============================================================ */}
        {filteredModules.some((m) => m.id === 'mentor') && (
          <div
            id="mentor"
            className="rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 shadow-2xs overflow-hidden transition-all"
          >
            <button
              type="button"
              onClick={() => toggleSection('mentor')}
              className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/70 dark:hover:bg-neutral-900/40 transition-colors"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <span className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 flex items-center justify-center font-black text-xs text-gray-900 dark:text-white shrink-0">
                  04
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-gray-950 dark:text-white flex items-center gap-2 truncate">
                    <Bot className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>AI Exam Mentor & Model Answers (`/mentor`)</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    How to get exact university marking scheme answers with diagrams.
                  </p>
                </div>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${openSections.mentor ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {openSections.mentor && (
              <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-1 border-t border-gray-100 dark:border-neutral-800 space-y-4 animate-in fade-in duration-150">
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed pt-2">
                  General AI gives generic internet essays. But university copy-checkers look for specific definitions, numbered points, and diagrams. In <Link to="/mentor" className="font-bold underline text-gray-950 dark:text-white">AI Mentor</Link>, you have 4 controls:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Control 1</span>
                    <h4 className="font-bold text-xs text-gray-950 dark:text-white">Marks (2, 5, 10, 15M)</h4>
                    <p className="text-[11px] text-gray-500">Pick the exact marks. SANKALP automatically sizes the answer and points.</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Control 2</span>
                    <h4 className="font-bold text-xs text-gray-950 dark:text-white">Format Type</h4>
                    <p className="text-[11px] text-gray-500">Exam paper format, comprehensive study, or side-by-side difference table.</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Control 3</span>
                    <h4 className="font-bold text-xs text-gray-950 dark:text-white">Language</h4>
                    <p className="text-[11px] text-gray-500">English for writing your paper, or Hinglish for easy concept understanding.</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Control 4</span>
                    <h4 className="font-bold text-xs text-gray-950 dark:text-white">Learn by Book</h4>
                    <p className="text-[11px] text-gray-500">Turn ON to quote definitions directly from your prescribed textbook (e.g. P.K. Sinha).</p>
                  </div>
                </div>

                {/* 10-Mark Answer Formula Blueprint */}
                <div className="p-4 rounded-2xl bg-neutral-950 text-white border border-neutral-800 space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block">
                    The Winning 10-Mark Formula Every Answer Follows:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                      <strong className="text-white block mb-0.5">1. Definition Hook</strong>
                      <span className="text-neutral-400 text-[11px]">2-line core definition with bold keywords.</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                      <strong className="text-white block mb-0.5">2. Block Diagram</strong>
                      <span className="text-neutral-400 text-[11px]">ASCII flowchart for instant visual marks.</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                      <strong className="text-white block mb-0.5">3. Numbered Points</strong>
                      <span className="text-neutral-400 text-[11px]">5-6 bullet points with bold subheadings.</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                      <strong className="text-white block mb-0.5">4. Exam Caution</strong>
                      <span className="text-neutral-400 text-[11px]">Common traps evaluators penalize.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* MODULE 5: 5-Year Final Exam Papers */}
        {/* ============================================================ */}
        {filteredModules.some((m) => m.id === 'predictions') && (
          <div
            id="predictions"
            className="rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 shadow-2xs overflow-hidden transition-all"
          >
            <button
              type="button"
              onClick={() => toggleSection('predictions')}
              className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/70 dark:hover:bg-neutral-900/40 transition-colors"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <span className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 flex items-center justify-center font-black text-xs text-gray-900 dark:text-white shrink-0">
                  05
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-gray-950 dark:text-white flex items-center gap-2 truncate">
                    <FileCheck2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>5-Year Final Exam Papers & Recurring Questions</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    Target the 70% recurring questions across 2021–2025 university archives.
                  </p>
                </div>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${openSections.predictions ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {openSections.predictions && (
              <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-1 border-t border-gray-100 dark:border-neutral-800 space-y-4 animate-in fade-in duration-150">
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed pt-2">
                  Up to <strong>70% of exam questions repeat</strong> across past papers. The <Link to="/predictions" className="font-bold underline text-gray-950 dark:text-white">5-Year Final Paper</Link> organizes recurring questions into standard paper sections:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Section A (2 Marks)</span>
                    <h4 className="font-bold text-xs text-gray-950 dark:text-white">Very Short Questions</h4>
                    <p className="text-[11px] text-gray-500">Direct definitions, formulas, and abbreviations. Compulsory scoring questions.</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Section B (5 Marks)</span>
                    <h4 className="font-bold text-xs text-gray-950 dark:text-white">Short Analytical Questions</h4>
                    <p className="text-[11px] text-gray-500">Requires 4-5 bullet points and at least 1 diagram or comparison table.</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Section C (10/15 Marks)</span>
                    <h4 className="font-bold text-xs text-gray-950 dark:text-white">Long Comprehensive Questions</h4>
                    <p className="text-[11px] text-gray-500">Deep theoretical questions. Click <strong>Solve with AI</strong> on any question for full answers.</p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link
                    to="/predictions"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black transition-colors"
                  >
                    <span>Open 5-Year Final Paper</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* MODULE 6: Revision & Cheatsheets */}
        {/* ============================================================ */}
        {filteredModules.some((m) => m.id === 'revision') && (
          <div
            id="revision"
            className="rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 shadow-2xs overflow-hidden transition-all"
          >
            <button
              type="button"
              onClick={() => toggleSection('revision')}
              className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/70 dark:hover:bg-neutral-900/40 transition-colors"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <span className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 flex items-center justify-center font-black text-xs text-gray-900 dark:text-white shrink-0">
                  06
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-gray-950 dark:text-white flex items-center gap-2 truncate">
                    <Printer className="w-4 h-4 text-purple-500 shrink-0" />
                    <span>1-Page Printable Cheat Sheet & Flashcards</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    Printable A4 PDF summary for the morning of your exam.
                  </p>
                </div>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${openSections.revision ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {openSections.revision && (
              <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-1 border-t border-gray-100 dark:border-neutral-800 space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800 space-y-2">
                    <h4 className="font-bold text-xs sm:text-sm text-gray-950 dark:text-white flex items-center gap-1.5">
                      <Printer className="w-4 h-4 text-purple-500" />
                      <span>Printable A4 PDF Cheat Sheet</span>
                    </h4>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                      In <Link to="/revision" className="font-bold underline text-gray-950 dark:text-white">Quick Revision</Link>, click <strong>1-Page Cheat Sheet</strong>. SANKALP compresses all 5 units into a dense 2-column matrix: definitions, formulas, and difference tables. Click <strong>Download PDF</strong> for instant printing.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800 space-y-2">
                    <h4 className="font-bold text-xs sm:text-sm text-gray-950 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                      <span>Interactive Flashcards</span>
                    </h4>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                      Tap any flashcard in <Link to="/revision" className="font-bold underline text-gray-950 dark:text-white">Quick Revision</Link> to flip between the question and university definition. Ideal for rapid recall 1 hour before entering the examination hall.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* MODULE 7: Golden Exam Hacks */}
        {/* ============================================================ */}
        {filteredModules.some((m) => m.id === 'hacks') && (
          <div
            id="hacks"
            className="rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 shadow-2xs overflow-hidden transition-all"
          >
            <button
              type="button"
              onClick={() => toggleSection('hacks')}
              className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/70 dark:hover:bg-neutral-900/40 transition-colors"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <span className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 flex items-center justify-center font-black text-xs text-gray-900 dark:text-white shrink-0">
                  07
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-gray-950 dark:text-white flex items-center gap-2 truncate">
                    <Target className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Golden Exam Hacks for 90%+ Marks</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    What university professors look for when checking your paper.
                  </p>
                </div>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${openSections.hacks ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {openSections.hacks && (
              <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-1 border-t border-gray-100 dark:border-neutral-800 space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800 space-y-1.5">
                    <h4 className="font-bold text-xs text-gray-950 dark:text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Draw a Boxed Diagram</span>
                    </h4>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                      A simple flowchart or block diagram inside a neat box earns 30% marks immediately. Evaluators scan diagrams before reading paragraphs.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800 space-y-1.5">
                    <h4 className="font-bold text-xs text-gray-950 dark:text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Table Over Paragraphs</span>
                    </h4>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                      Whenever asked "Difference between A and B", draw a 3-column table: [Basis of Difference | Concept A | Concept B]. Never write two long paragraphs.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800 space-y-1.5">
                    <h4 className="font-bold text-xs text-gray-950 dark:text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Underline Keywords</span>
                    </h4>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                      Use a pencil or black pen to underline technical terms (like the bolded terms in SANKALP answers) so the copy-checker spots them in 2 seconds.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* MODULE 8: FAQ */}
        {/* ============================================================ */}
        {filteredModules.some((m) => m.id === 'faq') && (
          <div
            id="faq"
            className="rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 shadow-2xs overflow-hidden transition-all"
          >
            <button
              type="button"
              onClick={() => toggleSection('faq')}
              className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/70 dark:hover:bg-neutral-900/40 transition-colors"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <span className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 flex items-center justify-center font-black text-xs text-gray-900 dark:text-white shrink-0">
                  08
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-gray-950 dark:text-white flex items-center gap-2 truncate">
                    <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Frequently Asked Questions (FAQ)</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    Simple solutions for token limits, mobile phones, and offline storage.
                  </p>
                </div>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${openSections.faq ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {openSections.faq && (
              <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-1 border-t border-gray-100 dark:border-neutral-800 space-y-3 animate-in fade-in duration-150">
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800 space-y-1">
                  <h4 className="font-bold text-xs text-gray-950 dark:text-white">
                    Why do I see "Groq Tokens Per Minute (TPM) limit reached"?
                  </h4>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                    Groq free tier limits requests in a 60-second window. Wait 15–20 seconds and send your query again. Thanks to our <strong>IndexedDB Local Response Caching</strong>, repeated questions load in 0ms without using any tokens.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800 space-y-1">
                  <h4 className="font-bold text-xs text-gray-950 dark:text-white">
                    Can I use SANKALP AI on my Android or iPhone?
                  </h4>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                    Yes, 100%! Open it in Chrome or Safari. In <Link to="/settings" className="font-bold underline text-gray-950 dark:text-white">Settings</Link>, tap <strong>Install App</strong> to add SANKALP AI to your home screen as a native PWA app with zero lag.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-100 dark:border-neutral-800 space-y-1">
                  <h4 className="font-bold text-xs text-gray-950 dark:text-white">
                    How do I export my study conversations as notes?
                  </h4>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                    In <Link to="/mentor" className="font-bold underline text-gray-950 dark:text-white">AI Mentor</Link>, tap the <strong>Export PDF</strong> button in the top bar to download your full subject chat as an official PDF document.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Official Helpdesk & Support Card */}
      <div className="p-5 sm:p-7 rounded-3xl bg-neutral-950 text-white border border-neutral-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold block">
              Official Academic Helpdesk
            </span>
            <h3 className="text-base sm:text-lg font-extrabold text-white">
              Need Syllabus Added or Have Questions?
            </h3>
            <p className="text-xs text-neutral-300 max-w-xl leading-relaxed">
              Email the academic team directly for syllabus requests, question bank updates, or feature suggestions.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyEmail}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors cursor-pointer"
            >
              {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedEmail ? 'Copied' : 'Copy Email'}</span>
            </button>

            <a
              href="mailto:study.sankalp.ai@gmail.com?subject=SANKALP%20AI%20Manual%20Inquiry"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-neutral-100 text-black text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Support</span>
            </a>
          </div>
        </div>

        <div className="pt-3 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-neutral-400 gap-2">
          <p>
            Architected by <strong>Sameer Singh</strong> &bull; St. John's College, Agra
          </p>
          <p className="font-mono text-neutral-300">
            study.sankalp.ai@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}
