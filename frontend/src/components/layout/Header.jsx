import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Sun,
  Moon,
  Settings,
  Sparkles,
  GraduationCap,
  BookOpen,
  Download,
} from 'lucide-react';
import useAppStore from '../../store/appStore';
import { usePwaStore } from '../../store/pwaStore';
import toast from 'react-hot-toast';

export default function Header() {
  const { isInstalled, promptInstall } = usePwaStore();
  const {
    sidebarCollapsed,
    toggleSidebar,
    setMobileNavOpen,
    darkMode,
    toggleTheme,
    setSearchOpen,
    isAiConnected,
    courses,
    semesters,
    subjects,
    selectedCourse,
    setSelectedCourse,
    selectedSemester,
    setSelectedSemester,
    selectedSubject,
    setSelectedSubject,
    fetchAcademicTree,
  } = useAppStore();

  // Background sync for latest published courses, semesters & subjects
  useEffect(() => {
    fetchAcademicTree();
  }, [fetchAcademicTree]);

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-[calc(4rem+env(safe-area-inset-top,0px))] pt-[env(safe-area-inset-top,0px)] bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800/80 transition-all duration-300 flex items-center justify-between px-3 sm:px-6 ${
        sidebarCollapsed ? 'left-0 md:left-20' : 'left-0 md:left-64'
      }`}
    >
      {/* Left: Desktop sidebar toggle + Mobile hamburger + Global Search bar */}
      <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0 max-w-xs sm:max-w-md">
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileNavOpen(true)}
          className="p-1.5 sm:p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden shrink-0 cursor-pointer"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors shrink-0 cursor-pointer"
          title={sidebarCollapsed ? "Expand Sidebar (Ctrl+B)" : "Collapse Sidebar"}
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Desktop Search Button */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden sm:flex w-full items-center justify-between px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 transition-all text-xs sm:text-sm group"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors shrink-0" />
            <span className="truncate">Search syllabus & questions...</span>
          </div>
          <kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-2xs shrink-0">
            Ctrl K
          </kbd>
        </button>

        {/* Mobile Search Icon Button */}
        <button
          onClick={() => setSearchOpen(true)}
          className="sm:hidden p-1.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Academic Context Selector + Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Course, Semester & Subject Selector - Zero Latency (0ms) */}
        <div className="hidden sm:flex items-center gap-1.5 md:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 text-xs">
          <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />

          {/* 1. Course select */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase hidden lg:inline">Course:</span>
            <select
              value={selectedCourse?._id || ''}
              onChange={(e) => {
                const c = courses.find((x) => x._id === e.target.value);
                if (c) setSelectedCourse(c);
              }}
              className="bg-transparent font-bold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer max-w-[85px] md:max-w-[120px] truncate"
              title={selectedCourse?.name || 'Select Course'}
            >
              {courses.map((c) => (
                <option key={c._id} value={c._id} className="dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                  {c.code}
                </option>
              ))}
            </select>
          </div>

          <span className="text-gray-300 dark:text-gray-700">|</span>

          {/* 2. Semester select */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase hidden lg:inline">Sem:</span>
            <select
              value={selectedSemester?._id || ''}
              onChange={(e) => {
                const s = semesters.find((x) => x._id === e.target.value);
                if (s) setSelectedSemester(s);
              }}
              className="bg-transparent font-bold text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer max-w-[80px] md:max-w-[95px] truncate"
              title={selectedSemester?.name || 'Select Semester'}
            >
              {semesters.map((s) => (
                <option key={s._id} value={s._id} className="dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <span className="text-gray-300 dark:text-gray-700">|</span>

          {/* 3. Subject select */}
          <div className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0 hidden md:inline" />
            <span className="text-[10px] text-gray-400 font-bold uppercase hidden xl:inline">Sub:</span>
            <select
              value={selectedSubject?._id || ''}
              onChange={(e) => {
                const sub = subjects.find((x) => x._id === e.target.value);
                if (sub) setSelectedSubject(sub);
              }}
              className="bg-transparent font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none cursor-pointer max-w-[120px] md:max-w-[160px] lg:max-w-[200px] truncate"
              title={selectedSubject ? `${selectedSubject.code || ''} - ${selectedSubject.name}` : 'Select Subject'}
            >
              {subjects.length === 0 ? (
                <option value="">No Subjects</option>
              ) : (
                subjects.map((sub) => (
                  <option key={sub._id} value={sub._id} className="dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                    {sub.code ? `${sub.code} - ${sub.name}` : sub.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Mobile Degree & Subject Badge */}
        <button
          onClick={() => setMobileNavOpen(true)}
          className="sm:hidden flex items-center gap-1 px-2 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-[11px] font-bold text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 max-w-[110px] truncate"
          title="Change Course, Semester & Subject"
        >
          <GraduationCap className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span className="truncate">{selectedSubject?.code || selectedCourse?.code || 'Course'}</span>
        </button>

        {/* AI Key Status Pill */}
        <Link
          to="/settings"
          className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors shrink-0 ${
            isAiConnected
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 animate-pulse'
          }`}
          title={isAiConnected ? 'SANKALP AI Active (Click to manage settings)' : 'Connect SANKALP AI in Settings'}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isAiConnected ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
          <span className="hidden sm:inline">
            {isAiConnected ? 'SANKALP AI Active' : 'Setup AI Mentor'}
          </span>
          <span className="sm:hidden">
            {isAiConnected ? 'AI' : 'Setup'}
          </span>
        </Link>

        {/* PWA Install Button (Always visible on mobile & desktop when not installed) */}
        {!isInstalled && (
          <button
            type="button"
            onClick={promptInstall}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors shrink-0 cursor-pointer"
            title="Install SANKALP App on this device"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="hidden md:inline">Install App</span>
            <span className="md:hidden text-[10px]">Install</span>
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={() => {
            toggleTheme();
            toast.success(darkMode ? 'Light mode enabled' : 'Dark mode enabled', { id: 'theme-toast' });
          }}
          className="p-1.5 sm:p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500" />
          )}
        </button>

        {/* Settings Shortcut (Desktop only) */}
        <Link
          to="/settings"
          className="hidden sm:inline-flex p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
