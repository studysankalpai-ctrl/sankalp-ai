import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Layers,
  BookOpen,
  FolderGit2,
  FileText,
  FileQuestion,
  Cpu,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  HardDrive,
  Sparkles,
  CheckCircle2,
  BookMarked,
  HelpCircle,
  BarChart3,
  Plus,
  Play,
  ArrowUpRight,
  Clock,
  Activity,
  Info,
} from 'lucide-react';
import { adminApi } from '../../lib/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const [statsRes, logsRes] = await Promise.all([
          adminApi.getStats(),
          adminApi.getAuditLogs({ limit: 10 }),
        ]);

        if (statsRes.data?.success) setStats(statsRes.data.data);
        if (logsRes.data?.success) setAuditLogs(logsRes.data.data);
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading && !stats) return <LoadingSpinner text="Compiling administrative analytics..." fullPage />;

  const statCards = [
    {
      label: 'Degree Courses',
      value: stats?.total_courses || 0,
      sub: 'Active Programs',
      icon: GraduationCap,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
      link: '/admin/courses',
    },
    {
      label: 'Academic Semesters',
      value: stats?.total_semesters || 0,
      sub: 'Configured Terms',
      icon: Layers,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
      link: '/admin/semesters',
    },
    {
      label: 'Subjects & Units',
      value: stats?.total_subjects || 0,
      sub: 'Syllabus Mapped',
      icon: BookOpen,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
      link: '/admin/subjects',
    },
    {
      label: 'Curriculum Folders',
      value: stats?.total_folders || 0,
      sub: 'Drive Directories',
      icon: FolderGit2,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      link: '/admin/folders',
    },
    {
      label: 'Published Past Papers',
      value: stats?.total_published_papers || 0,
      sub: '5-Yr Question Papers',
      icon: FileQuestion,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
      link: '/admin/papers',
    },
    {
      label: 'Prescribed Textbooks',
      value: stats?.total_books || stats?.total_textbooks || 1,
      sub: 'Prescribed Library',
      icon: BookMarked,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      link: '/admin/books',
    },
    {
      label: 'Pending OCR Queue',
      value: stats?.pending_processing || 0,
      sub: 'In Pipeline',
      icon: Cpu,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10 border-yellow-500/20',
      link: '/admin/processing',
    },
    {
      label: 'Total Uploaded Files',
      value: stats?.total_academic_files || 0,
      sub: 'PDFs & Docs Stored',
      icon: FileText,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
      link: '/admin/storage',
    },
  ];

  const pipelineSteps = [
    {
      step: '01',
      title: 'Structure Degrees & Semesters',
      desc: 'Define university courses (e.g. BMC, BCA) and allocate semester terms.',
      link: '/admin/courses',
      action: 'Manage Courses',
      icon: GraduationCap,
    },
    {
      step: '02',
      title: 'Define Subjects & Unit Outlines',
      desc: 'Map course subjects with specific examination unit numbers and detailed syllabus topics.',
      link: '/admin/subjects',
      action: 'Manage Subjects',
      icon: BookOpen,
    },
    {
      step: '03',
      title: 'Upload 5-Yr Papers & Textbooks',
      desc: 'Upload past university question papers and official textbook PDFs into subject folders.',
      link: '/admin/papers',
      action: 'Upload Papers',
      icon: FileQuestion,
    },
    {
      step: '04',
      title: 'AI OCR Extraction & Validation',
      desc: 'AI processes uploaded PDFs, extracts question text, marks, years, and computes repeat topics.',
      link: '/admin/processing',
      action: 'AI Processing Queue',
      icon: Cpu,
    },
    {
      step: '05',
      title: 'Student Master Examination Ready',
      desc: 'Synthesizes 5-year master papers and powers 2M-15M student mentor explanations.',
      link: '/',
      action: 'Open Student App',
      icon: Sparkles,
      external: true,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Welcome & System Status Card */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>SANKALP AI Control Engine v2.0 • Online</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              University Curriculum Administration
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Manage degrees, semesters, syllabus units, past 5-year examination papers, and AI extraction pipelines from one centralized control center.
            </p>
          </div>

          {/* Quick Operations Button Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/admin/courses"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Course</span>
            </Link>
            <Link
              to="/admin/subjects"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Subject</span>
            </Link>
            <Link
              to="/admin/papers"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              <FileQuestion className="w-3.5 h-3.5 text-cyan-400" />
              <span>Upload Papers</span>
            </Link>
            <Link
              to="/admin/processing"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              <Cpu className="w-3.5 h-3.5 text-yellow-400" />
              <span>Process Queue</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Live Curriculum Metrics
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">Real-time DB Counts</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Link
                key={idx}
                to={card.link}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 transition-all flex flex-col justify-between group shadow-xs"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">
                    {card.label}
                  </span>
                  <div className={`w-8 h-8 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{card.value}</p>
                  <p className="text-[11px] font-mono text-slate-500 mt-1 flex items-center justify-between">
                    <span>{card.sub}</span>
                    <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-white transition-colors" />
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Explanatory Pipeline Map ("Understanding SANKALP AI") */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Curriculum Pipeline Architecture</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Step-by-step workflow: how uploaded university documents power student exam intelligence.
            </p>
          </div>
          <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full self-start sm:self-auto">
            Autonomous Pipeline
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {pipelineSteps.map((p, pIdx) => {
            const Icon = p.icon;
            return (
              <div
                key={pIdx}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                      STEP {p.step}
                    </span>
                    <Icon className="w-4 h-4 text-slate-400" />
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1.5 leading-snug">{p.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{p.desc}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800/80">
                  {p.external ? (
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
                    >
                      <span>{p.action}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  ) : (
                    <Link
                      to={p.link}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
                    >
                      <span>{p.action}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security & Audit Trail */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Administrative Activity & Security Audit</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Immutable Log Trail</span>
        </div>

        {auditLogs.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            <Info className="w-6 h-6 mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="font-semibold text-slate-400">No administrative actions logged yet.</p>
            <p className="mt-1 text-slate-500">Actions like adding courses, uploading papers, or modifying syllabus will be audited here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Action Performed</th>
                  <th className="py-3 px-3">Target Entity</th>
                  <th className="py-3 px-3">Administrator</th>
                  <th className="py-3 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {auditLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-200">{log.entity_type}</td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">{log.admin_email || 'admin'}</td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
