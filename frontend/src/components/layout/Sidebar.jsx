import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
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
  ChevronDown,
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
  const location = useLocation();
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

  // Top-Level Flagship Links (1-Click Core Access)
  const primaryLinks = [
    { label: 'AI Viva Room', path: '/viva', icon: 'Mic', highlight: true, badge: 'NEW', isNew: true },
    { label: 'Exam Desk (Home)', path: '/dashboard', icon: 'Home' },
    { label: 'AI Exam Mentor', path: '/mentor', icon: 'Bot', highlight: true, badge: 'AI' },
  ];

  // Collapsible Sub-link Groups (Zero Clutter, 100% Links Preserved)
  const subLinkGroups = [
    {
      id: 'papers',
      title: 'Exam Papers & Syllabus',
      icon: 'FolderTree',
      items: [
        { label: '5-Year Final Paper', path: '/predictions', icon: 'TrendingUp', badge: '5-Yr' },
        { label: 'Important Topics', path: '/topics', icon: 'Star' },
        { label: 'Papers & Syllabus', path: '/library', icon: 'FolderTree' },
      ],
    },
    {
      id: 'practice',
      title: 'Practice & Mock Tests',
      icon: 'PenTool',
      items: [
        { label: 'Practice Questions', path: '/practice', icon: 'PenTool' },
        { label: 'Timed Mock Tests', path: '/tests', icon: 'ClipboardCheck' },
        { label: 'Study Planner', path: '/planner', icon: 'Calendar' },
      ],
    },
    {
      id: 'notes',
      title: 'Revision & Help',
      icon: 'Bookmark',
      items: [
        { label: '1-Page Revision', path: '/revision', icon: 'RotateCcw' },
        { label: 'Saved Notes', path: '/bookmarks', icon: 'Bookmark' },
        { label: 'User Guide', path: '/guide', icon: 'BookOpen', badge: 'Guide' },
        { label: 'Settings', path: '/settings', icon: 'Settings' },
      ],
    },
  ];

  // Expand / Collapse State for Groups
  const [openGroups, setOpenGroups] = useState({
    papers: true,
    practice: true,
    notes: false,
  });

  const toggleGroup = (groupId) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Keep group auto-open when user is visiting a link inside it
  useEffect(() => {
    const currentPath = location.pathname;
    subLinkGroups.forEach((group) => {
      if (group.items.some((item) => currentPath.startsWith(item.path))) {
        setOpenGroups((prev) => ({ ...prev, [group.id]: true }));
      }
    });
  }, [location.pathname]);

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
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out pt-[env(safe-area-inset-top,0px)] md:pt-0 pb-[env(safe-area-inset-bottom,0px)] md:pb-0 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo Section */}
        <div className={`h-16 flex items-center ${sidebarCollapsed ? 'justify-center px-0' : 'justify-between px-4'} border-b border-gray-100 dark:border-gray-800 shrink-0`}>
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

          {/* Main Navigation: Primary Links + Collapsible Sub-link Groups */}
          {!sidebarCollapsed ? (
            <div className="space-y-4">
              {/* Primary 1-Click Core Tools */}
              <div className="space-y-1">
                <p className="px-3 pt-1 pb-1 text-[10px] font-bold tracking-wider uppercase text-gray-400 dark:text-gray-500">
                  Core Desk
                </p>
                {primaryLinks.map((item) => {
                  const Icon = ICONS[item.icon] || Home;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/'}
                      onClick={() => setMobileNavOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs sm:text-sm transition-all duration-150 group relative cursor-pointer ${
                          isActive
                            ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-950 dark:hover:text-white'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-transform group-hover:scale-105 ${
                              isActive
                                ? 'text-white dark:text-black'
                                : item.highlight
                                ? 'text-indigo-600 dark:text-indigo-400'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}
                          />
                          <span className="truncate flex-1 font-semibold">{item.label}</span>
                          {item.badge && (
                            <span
                              className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold tracking-wider uppercase transition-all ${
                                item.isNew
                                  ? 'bg-emerald-500 text-white font-black shadow-2xs'
                                  : isActive
                                  ? 'bg-white/20 dark:bg-black/10 text-white dark:text-black'
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

              {/* Collapsible Sub-link Groups */}
              <div className="pt-1 space-y-2.5">
                <p className="px-3 text-[10px] font-bold tracking-wider uppercase text-gray-400 dark:text-gray-500">
                  Study Modules
                </p>
                {subLinkGroups.map((group) => {
                  const GroupIcon = ICONS[group.icon] || FolderTree;
                  const isOpen = openGroups[group.id];
                  const hasActiveChild = group.items.some((item) =>
                    location.pathname.startsWith(item.path)
                  );

                  return (
                    <div key={group.id} className="space-y-1">
                      {/* Accordion Group Header */}
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                          hasActiveChild
                            ? 'text-gray-950 dark:text-white bg-gray-100/80 dark:bg-gray-800/60 font-extrabold'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-gray-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <GroupIcon
                            className={`w-4 h-4 shrink-0 ${
                              hasActiveChild
                                ? 'text-black dark:text-white'
                                : 'text-gray-400 dark:text-gray-500'
                            }`}
                          />
                          <span className="truncate">{group.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-gray-200/60 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-semibold">
                            {group.items.length}
                          </span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </button>

                      {/* Sub-links with clean connector border */}
                      {isOpen && (
                        <div className="ml-4 pl-3 border-l-2 border-gray-200 dark:border-gray-800 space-y-0.5 py-1 animate-in fade-in duration-150">
                          {group.items.map((sub) => {
                            const SubIcon = ICONS[sub.icon] || Star;
                            return (
                              <NavLink
                                key={sub.path}
                                to={sub.path}
                                onClick={() => setMobileNavOpen(false)}
                                className={({ isActive }) =>
                                  `flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                    isActive
                                      ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-2xs'
                                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50'
                                  }`
                                }
                              >
                                {({ isActive }) => (
                                  <>
                                    <SubIcon
                                      className={`w-3.5 h-3.5 shrink-0 ${
                                        isActive
                                          ? 'text-white dark:text-black'
                                          : 'text-gray-400 dark:text-gray-500'
                                      }`}
                                    />
                                    <span className="truncate flex-1">{sub.label}</span>
                                    {sub.badge && (
                                      <span
                                        className={`px-1.5 py-0.2 rounded text-[8px] font-extrabold uppercase ${
                                          isActive
                                            ? 'bg-white/20 dark:bg-black/10 text-white dark:text-black'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                        }`}
                                      >
                                        {sub.badge}
                                      </span>
                                    )}
                                  </>
                                )}
                              </NavLink>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Mini Icon Sidebar (when collapsed on desktop) */
            <div className="space-y-3">
              <div className="space-y-1">
                {primaryLinks.map((item) => {
                  const Icon = ICONS[item.icon] || Home;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/'}
                      className={({ isActive }) =>
                        `flex items-center justify-center p-2.5 rounded-xl transition-all ${
                          isActive
                            ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                            : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-950 dark:hover:text-white'
                        }`
                      }
                      title={item.label}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                    </NavLink>
                  );
                })}
              </div>
              <div className="border-t border-gray-200 dark:border-gray-800 pt-2 space-y-1">
                {subLinkGroups.flatMap((g) => g.items).map((item) => {
                  const Icon = ICONS[item.icon] || Star;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center justify-center p-2.5 rounded-xl transition-all ${
                          isActive
                            ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                            : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-950 dark:hover:text-white'
                        }`
                      }
                      title={item.label}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                    </NavLink>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* AI Key Status & Support Card (bottom of sidebar - Compact, Sleek AMOLED Black) */}
        {!sidebarCollapsed && (
          <div className="mx-3 mb-2 p-3 rounded-2xl bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="relative flex h-2 w-2 shrink-0">
                  {isAiConnected && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isAiConnected ? 'bg-emerald-500' : 'bg-amber-400'
                    }`}
                  />
                </span>
                <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                  {isAiConnected ? 'SANKALP AI Active' : 'AI Key Required'}
                </span>
              </div>
              <Link
                to="/settings"
                className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-gray-200/70 hover:bg-gray-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-gray-800 dark:text-gray-200 border border-gray-300/60 dark:border-neutral-800 transition-colors shrink-0"
              >
                {isAiConnected ? 'Settings' : 'Connect'}
              </Link>
            </div>

            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
              {isAiConnected
                ? 'Exam mentor & oral viva room ready.'
                : 'Connect Groq API key in Settings to activate AI.'}
            </p>

            <div className="pt-2 border-t border-gray-200/60 dark:border-neutral-800/80">
              <a
                href="mailto:study.sankalp.ai@gmail.com"
                className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors truncate"
                title="Support & Queries"
              >
                <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="truncate">study.sankalp.ai@gmail.com</span>
              </a>
            </div>
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
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
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
