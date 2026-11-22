import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Sun,
  Moon,
  Settings,
  Sparkles,
  GraduationCap,
  ChevronDown,
} from 'lucide-react';
import { publicApi } from '../../lib/api';
import useAppStore from '../../store/appStore';
import toast from 'react-hot-toast';

export default function Header() {
  const {
    sidebarCollapsed,
    setMobileNavOpen,
    darkMode,
    toggleTheme,
    setSearchOpen,
    isAiConnected,
    courses,
    setCourses,
    semesters,
    setSemesters,
    selectedCourse,
    setSelectedCourse,
    selectedSemester,
    setSelectedSemester,
  } = useAppStore();

  const [loadingCourses, setLoadingCourses] = useState(false);

  // Fetch published courses on mount
  useEffect(() => {
    async function loadCourses() {
      try {
        setLoadingCourses(true);
        const res = await publicApi.getCourses();
        if (res.data?.success && res.data.data.length > 0) {
          const list = res.data.data;
          setCourses(list);
          const current = useAppStore.getState().selectedCourse;
          if (!current || !list.some((c) => c._id === current._id)) {
            setSelectedCourse(list[0]);
          }
        } else {
          setCourses([]);
        }
      } catch (err) {
        console.error('Failed to load courses:', err);
      } finally {
        setLoadingCourses(false);
      }
    }
    loadCourses();
  }, [setCourses, setSelectedCourse]);

  // When selectedCourse changes, fetch its semesters
  useEffect(() => {
    async function loadSemesters() {
      if (!selectedCourse?._id) {
        setSemesters([]);
        return;
      }
      try {
        const res = await publicApi.getSemesters(selectedCourse._id);
        if (res.data?.success) {
          const semList = res.data.data || [];
          setSemesters(semList);
          const currentSem = useAppStore.getState().selectedSemester;
          if (semList.length > 0) {
            if (!currentSem || !semList.some((s) => s._id === currentSem._id)) {
              setSelectedSemester(semList[0]);
            }
          } else {
            setSelectedSemester(null);
          }
        }
      } catch (err) {
        console.error('Failed to load semesters:', err);
      }
    }
    loadSemesters();
  }, [selectedCourse?._id, setSemesters, setSelectedSemester]);

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800/80 transition-all duration-300 flex items-center justify-between px-4 sm:px-6 ${
        sidebarCollapsed ? 'left-0 md:left-20' : 'left-0 md:left-64'
      }`}
    >
      {/* Left: Mobile hamburger & Global Search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={() => setMobileNavOpen(true)}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={() => setSearchOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 transition-all text-sm group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
            <span className="hidden sm:inline">Search syllabus & questions...</span>
            <span className="sm:hidden">Search...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-2xs">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right: Academic Context Selector + Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Course & Semester Selector */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 text-xs">
          <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          
          {loadingCourses ? (
            <span className="text-gray-400 font-medium italic">Loading...</span>
          ) : courses.length === 0 ? (
            <span className="text-gray-400 font-medium italic">No courses</span>
          ) : (
            <>
              {/* Course select */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase hidden md:inline">Course:</span>
                <select
                  value={selectedCourse?._id || ''}
                  onChange={(e) => {
                    const c = courses.find((x) => x._id === e.target.value);
                    if (c) setSelectedCourse(c);
                  }}
                  className="bg-transparent font-semibold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer max-w-[130px] md:max-w-[180px] truncate"
                  title={selectedCourse?.name || 'Select Course'}
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c._id} className="dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                      {c.code} ({c.name})
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-gray-300 dark:text-gray-700">|</span>

              {/* Semester select */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase hidden md:inline">Sem:</span>
                <select
                  value={selectedSemester?._id || ''}
                  onChange={(e) => {
                    const s = semesters.find((x) => x._id === e.target.value);
                    if (s) setSelectedSemester(s);
                  }}
                  className="bg-transparent font-semibold text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer max-w-[110px] truncate"
                >
                  {semesters.length === 0 ? (
                    <option value="">No Sem</option>
                  ) : (
                    semesters.map((s) => (
                      <option key={s._id} value={s._id} className="dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                        {s.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </>
          )}
        </div>

        {/* Mobile Course Badge (Opens Menu to switch course & semester) */}
        <button
          onClick={() => setMobileNavOpen(true)}
          className="sm:hidden flex items-center gap-1 px-2 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-[11px] font-bold text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 max-w-[80px] truncate"
          title="Change Course & Semester"
        >
          <GraduationCap className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span className="truncate">{selectedCourse?.code || 'Course'}</span>
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
            className={`w-2 h-2 rounded-full shrink-0 ${
              isAiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span className="hidden sm:inline">
            {isAiConnected ? 'SANKALP AI Active' : 'Connect SANKALP AI'}
          </span>
          <span className="sm:hidden font-bold text-[10px]">
            {isAiConnected ? 'AI' : 'Key'}
          </span>
        </Link>

        {/* Theme Toggle Button */}
        <button
          onClick={() => {
            toggleTheme();
            toast.success(darkMode ? 'Switched to Light Mode' : 'Switched to Dark Mode', { id: 'theme-toggle-toast' });
          }}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
        </button>

        {/* Settings Shortcut */}
        <Link
          to="/settings"
          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </Link>
      </div>
    </header>
  );
}
