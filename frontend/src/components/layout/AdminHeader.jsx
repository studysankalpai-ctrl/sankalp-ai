import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  ExternalLink,
  ShieldCheck,
  LogOut,
  Sparkles,
  Layers,
  ChevronRight,
  GraduationCap,
  BookOpen,
  FolderGit2,
  FileText,
  FileQuestion,
  BookMarked,
  Cpu,
  BarChart3,
  HardDrive,
  Settings as SettingsIcon,
  HelpCircle,
  LayoutDashboard,
} from 'lucide-react';
import useAdminStore from '../../store/adminStore';
import toast from 'react-hot-toast';

const ROUTE_META = {
  '/admin': { title: 'Dashboard & Overview', category: 'Overview', icon: LayoutDashboard },
  '/admin/courses': { title: 'Degree Programs & Courses', category: 'Academic Architecture', icon: GraduationCap },
  '/admin/semesters': { title: 'Academic Semesters', category: 'Academic Architecture', icon: Layers },
  '/admin/subjects': { title: 'Subjects & Syllabus Units', category: 'Academic Architecture', icon: BookOpen },
  '/admin/folders': { title: 'Curriculum Drive Folders', category: 'Curriculum Repository', icon: FolderGit2 },
  '/admin/syllabus': { title: 'Official Syllabus Documents', category: 'Curriculum Repository', icon: FileText },
  '/admin/papers': { title: '5-Year Past Examination Papers', category: 'Curriculum Repository', icon: FileQuestion },
  '/admin/books': { title: 'Prescribed Textbooks & Reference Books', category: 'Curriculum Repository', icon: BookMarked },
  '/admin/processing': { title: 'AI Extraction & OCR Processing Queue', category: 'AI Pipeline', icon: Cpu },
  '/admin/questions': { title: 'Extracted University Questions Database', category: 'AI Pipeline', icon: HelpCircle },
  '/admin/analysis': { title: 'Repetition Analytics & Weightage Heatmap', category: 'AI Pipeline', icon: BarChart3 },
  '/admin/storage': { title: 'Physical File Storage & Backups', category: 'System', icon: HardDrive },
  '/admin/settings': { title: 'Security & Administrative Credentials', category: 'System', icon: SettingsIcon },
};

export default function AdminHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout, toggleMobileSidebar } = useAdminStore();

  const currentMeta = ROUTE_META[location.pathname] || {
    title: 'Administrative Control Panel',
    category: 'Admin',
    icon: ShieldCheck,
  };
  const Icon = currentMeta.icon;

  const handleLogout = () => {
    logout();
    toast.success('Signed out of Admin Panel');
    navigate('/admin/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Open Admin Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
              <span>Admin</span>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span className="text-slate-300 font-semibold">{currentMeta.category}</span>
            </div>
            <h2 className="text-sm font-bold text-white tracking-tight truncate max-w-[200px] sm:max-w-md">
              {currentMeta.title}
            </h2>
          </div>
        </div>
      </div>

      {/* Right: Status Pill, View Student Site, Admin Profile */}
      <div className="flex items-center gap-3">
        {/* System Health Pill */}
        <div className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>SANKALP Engine 2.0 • Active</span>
        </div>

        {/* View Student Web App */}
        <Link
          to="/"
          target="_blank"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          title="Open Student Web Application"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          <span>Student App</span>
        </Link>

        {/* Quick Admin Profile & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="hidden lg:flex flex-col text-right">
            <span className="text-xs font-bold text-white leading-tight">{admin?.name || 'Administrator'}</span>
            <span className="text-[10px] text-indigo-400 font-mono">Super Admin</span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition-colors"
            title="Log out of Admin Panel"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
