import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  Layers,
  BookOpen,
  FolderGit2,
  FileText,
  FileQuestion,
  BookMarked,
  Cpu,
  HelpCircle,
  BarChart3,
  HardDrive,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Sun,
  Moon,
  X,
  Compass,
  Database,
  Sparkles,
} from 'lucide-react';
import useAdminStore from '../../store/adminStore';
import useAppStore from '../../store/appStore';
import toast from 'react-hot-toast';

const SECTIONS = [
  {
    category: 'ACADEMIC STRUCTURE',
    items: [
      { label: 'Overview', path: '/admin', icon: LayoutDashboard },
      { label: 'Degree Courses', path: '/admin/courses', icon: GraduationCap },
      { label: 'Semesters', path: '/admin/semesters', icon: Layers },
      { label: 'Subjects & Units', path: '/admin/subjects', icon: BookOpen },
    ],
  },
  {
    category: 'CURRICULUM REPOSITORY',
    items: [
      { label: 'Drive Folders', path: '/admin/folders', icon: FolderGit2 },
      { label: 'Syllabus Docs', path: '/admin/syllabus', icon: FileText },
      { label: 'Past Papers (5-Yr)', path: '/admin/papers', icon: FileQuestion },
      { label: 'Prescribed Textbooks', path: '/admin/books', icon: BookMarked },
    ],
  },
  {
    category: 'AI ENGINE & PIPELINE',
    items: [
      { label: 'AI Processing Queue', path: '/admin/processing', icon: Cpu },
      { label: 'Extracted Questions', path: '/admin/questions', icon: HelpCircle },
      { label: 'Exam Analytics', path: '/admin/analysis', icon: BarChart3 },
    ],
  },
  {
    category: 'SYSTEM & SECURITY',
    items: [
      { label: 'File Storage', path: '/admin/storage', icon: HardDrive },
      { label: 'Admin Settings', path: '/admin/settings', icon: ShieldCheck },
    ],
  },
];

export default function AdminSidebar() {
  const { admin, logout, mobileSidebarOpen, setMobileSidebarOpen } = useAdminStore();
  const { darkMode, toggleTheme } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 shrink-0">
        <Link to="/admin" onClick={() => setMobileSidebarOpen(false)} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0 bg-white/5 border border-white/10">
            <img
              src="/Logo.png"
              alt="SANKALP Admin"
              className="w-full h-full object-contain transition-transform group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm tracking-wide text-white">SANKALP AI</span>
            <span className="text-[10px] text-indigo-400 font-mono font-semibold uppercase tracking-widest">
              Admin Control Panel
            </span>
          </div>
        </Link>

        {/* Mobile close button */}
        <button
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Admin User Card */}
      <div className="p-3.5 mx-3 my-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
          {admin?.name ? admin.name[0].toUpperCase() : 'A'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-white truncate">{admin?.name || 'Administrator'}</p>
          <p className="text-[10px] text-indigo-300 font-mono truncate">{admin?.email || 'admin@sankalp.ai'}</p>
          <span className="inline-block mt-1 text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
            Verified Admin
          </span>
        </div>
      </div>

      {/* Categorized Navigation */}
      <nav className="flex-1 px-3 space-y-5 overflow-y-auto pb-4">
        {SECTIONS.map((sec, secIdx) => (
          <div key={secIdx} className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center justify-between">
              <span>{sec.category}</span>
            </div>

            {sec.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin'}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-4 h-4 shrink-0 transition-colors group-hover:text-white" />
                    <span className="truncate">{item.label}</span>
                  </div>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Footer Actions */}
      <div className="p-3 border-t border-slate-800 space-y-1 shrink-0 bg-slate-900/60">
        <Link
          to="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors font-medium border border-slate-800 hover:border-slate-700"
          title="Open live student application"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
            <span>Open Student App</span>
          </span>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 rounded font-mono">
            Live
          </span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-xl transition-colors"
        >
          <span className="flex items-center gap-2">
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Static Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col shrink-0 min-h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Navigation */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />

          {/* Slide-in panel */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
