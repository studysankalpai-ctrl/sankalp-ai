import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Home,
  FolderTree,
  BookOpen,
  Bot,
  Star,
  TrendingUp,
  PenTool,
  ClipboardCheck,
  Calendar,
  RotateCcw,
  Bookmark,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Sparkles,
  X,
  Sun,
  Moon,
  Mail,
  Download,
  Smartphone,
  Mic,
} from 'lucide-react';
import useAppStore from '../../store/appStore';
import { usePwaStore } from '../../store/pwaStore';
import { APP_NAME } from '../../lib/constants';
import toast from 'react-hot-toast';

const ICONS = {
  Home,
  FolderTree,
  BookOpen,
  Bot,
  Star,
  TrendingUp,
  PenTool,
  ClipboardCheck,
  Calendar,
  RotateCcw,
  Bookmark,
  Settings,
  Mic,
};

export default function Sidebar() {
  const {
    sidebarCollapsed,
    toggleSidebar,
    mobileNavOpen,
    setMobileNavOpen,
    isAiConnected,
    darkMode,
    toggleTheme,
    courses,
    selectedCourse,
    setSelectedCourse,
    semesters,
    selectedSemester,
    setSelectedSemester,
    subjects,
    selectedSubject,
    setSelectedSubject,
  } = useAppStore();

  const { isInstallable, isInstalled, isIos, promptInstall } = usePwaStore();

  const navSections = [
    {
      title: 'Voice Viva & Study',
      items: [
        { label: 'AI Viva Room', path: '/viva', icon: 'Mic', highlight: true, badge: 'NEW', isNew: true },
        { label: 'Dashboard', path: '/dashboard', icon: 'Home' },
        { label: 'AI Exam Mentor', path: '/mentor', icon: 'Bot', highlight: true, badge: 'AI' },
        { label: 'Papers & Syllabus', path: '/library', icon: 'FolderTree' },
      ],
    },
    {
      title: 'Exam Preparation',
      items: [
        { label: '5-Year Final Paper', path: '/predictions', icon: 'TrendingUp', badge: '5-Year' },
        { label: 'Important Topics', path: '/topics', icon: 'Star' },
        { label: 'Practice Questions', path: '/practice', icon: 'PenTool' },
        { label: 'Mock Tests', path: '/tests', icon: 'ClipboardCheck' },
        { label: 'Study Planner', path: '/planner', icon: 'Calendar' },
      ],
    },
    {
      title: 'Notes & Help',
      items: [
        { label: 'Quick Revision', path: '/revision', icon: 'RotateCcw' },
        { label: 'Saved Notes', path: '/bookmarks', icon: 'Bookmark' },
        { label: 'User Guide & Manual', path: '/guide', icon: 'BookOpen', badge: 'Guide' },
        { label: 'Settings', path: '/settings', icon: 'Settings' },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white dark:bg-[#111827] border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out pt-[env(safe-area-inset-top,0px)] md:pt-0 pb-[env(safe-area-inset-bottom,0px)] md:pb-0 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <Link
            to="/"
            onClick={() => setMobileNavOpen(false)}
            className="flex items-center gap-3 overflow-hidden focus:outline-none group"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
              <img
                src="/Logo.png"
                alt="SANKALP"
                className="w-full h-full object-contain transition-transform group-hover:scale-105"
              />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-gray-950 dark:text-white">
                  {APP_NAME}
                </span>
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                  Exam Mentor
                </span>
              </div>
            )}
          </Link>

          {/* Close for mobile drawer */}
          <button
            onClick={() => setMobileNavOpen(false)}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links Grouped By Section */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
          {/* Mobile Course & Semester Switcher */}
          {courses && courses.length > 0 && (
            <div className="md:hidden p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/80 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-gray-100">
                <GraduationCap className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Academic Degree & Sem</span>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Course</label>
                  <select
                    value={selectedCourse?._id || ''}
                    onChange={(e) => {
                      const c = courses.find((x) => x._id === e.target.value);
                      if (c) setSelectedCourse(c);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-semibold text-gray-800 dark:text-gray-200 focus:outline-none"
                  >
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.code} ({c.name})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Semester</label>
                  <select
                    value={selectedSemester?._id || ''}
                    onChange={(e) => {
                      const s = semesters.find((x) => x._id === e.target.value);
                      if (s) setSelectedSemester(s);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-semibold text-gray-800 dark:text-gray-200 focus:outline-none"
                  >
                    {semesters.length === 0 ? (
                      <option value="">No Semesters Available</option>
                    ) : (
                      semesters.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Subject</label>
                  <select
                    value={selectedSubject?._id || ''}
                    onChange={(e) => {
                      const sub = subjects.find((x) => x._id === e.target.value);
                      if (sub) setSelectedSubject(sub);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-semibold text-gray-800 dark:text-gray-200 focus:outline-none"
                  >
                    {subjects.length === 0 ? (
                      <option value="">No Subjects Available</option>
                    ) : (
                      subjects.map((sub) => (
                        <option key={sub._id} value={sub._id}>
                          {sub.code ? `${sub.code} - ${sub.name}` : sub.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            </div>
          )}

          {navSections.map((sec, secIdx) => (
            <div key={sec.title || secIdx} className="space-y-1">
              {!sidebarCollapsed && (
                <p className="px-3 pt-1 pb-1 text-[10px] font-bold tracking-wider uppercase text-gray-400 dark:text-gray-500">
                  {sec.title}
                </p>
              )}
              {sec.items.map((item) => {
                const Icon = ICONS[item.icon] || Home;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    onClick={() => setMobileNavOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs sm:text-sm transition-all duration-150 group relative ${
                        isActive
                          ? 'bg-gray-950 dark:bg-white text-white dark:text-gray-950 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-100'
                      } ${sidebarCollapsed ? 'justify-center px-0' : ''}`
                    }
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-transform group-hover:scale-105 ${
                            isActive
                              ? 'text-white dark:text-gray-950'
                              : item.highlight
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        />
                        {!sidebarCollapsed && (
                          <span className="truncate flex-1 font-semibold">{item.label}</span>
                        )}
                        {!sidebarCollapsed && item.badge && (
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold tracking-wider uppercase transition-all ${
                              item.isNew
                                ? 'bg-black dark:bg-white text-white dark:text-black font-extrabold shadow-xs ring-1 ring-gray-400/40'
                                : isActive
                                ? 'bg-white/20 dark:bg-black/10 text-white dark:text-gray-950'
                                : item.highlight
                                ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* AI Key Status Card (bottom of sidebar - Clean Neutral) */}
        {!sidebarCollapsed && (
          <div className="p-3 mx-3 mb-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`w-2 h-2 rounded-full ${isAiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                {isAiConnected ? 'SANKALP AI Active' : 'SANKALP AI Offline'}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
              {isAiConnected
                ? 'Your SANKALP AI exam mentor is active and ready.'
                : 'Connect your AI key in Settings to activate SANKALP AI.'}
            </p>
            <Link
              to="/settings"
              className="text-[11px] font-semibold text-gray-900 dark:text-gray-100 hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              {isAiConnected ? 'AI Settings' : 'Connect Key'}
            </Link>
          </div>
        )}

        {/* Enquiry / Support Link in Sidebar */}
        {!sidebarCollapsed && (
          <div className="px-3 pb-1">
            <a
              href="mailto:study.sankalp.ai@gmail.com"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] font-medium text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              title="Queries & Enquiry"
            >
              <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">study.sankalp.ai@gmail.com</span>
            </a>
          </div>
        )}

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
          {/* Mobile PWA Install Button */}
          {!isInstalled && (isInstallable || isIos) && (
            <button
              onClick={promptInstall}
              className={`w-full flex items-center gap-2.5 py-2 px-2.5 text-xs font-bold rounded-xl transition-all ${
                sidebarCollapsed ? 'justify-center px-0' : 'justify-between'
              } bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60`}
              title="Install SANKALP Mobile App"
            >
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-indigo-500 shrink-0" />
                {!sidebarCollapsed && <span>Install Mobile App</span>}
              </div>
              {!sidebarCollapsed && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-600 text-white font-extrabold uppercase">
                  App
                </span>
              )}
            </button>
          )}

          {/* Quick Theme Toggle */}
          <button
            onClick={() => {
              toggleTheme();
              toast.success(darkMode ? 'Switched to Light Mode' : 'Switched to Dark Mode', { id: 'sidebar-theme-toast' });
            }}
            className={`w-full flex items-center gap-2.5 py-2 px-2.5 text-xs font-medium rounded-xl transition-colors ${
              sidebarCollapsed ? 'justify-center px-0' : 'justify-between'
            } text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800/60`}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <div className="flex items-center gap-2">
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500 shrink-0" />
              )}
              {!sidebarCollapsed && <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>}
            </div>
            {!sidebarCollapsed && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500">
                {darkMode ? 'Dark' : 'Light'}
              </span>
            )}
          </button>

          {/* Sidebar Collapse/Expand Toggle (desktop only) */}
          <div className="hidden md:flex">
            <button
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  <span>Collapse Sidebar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
