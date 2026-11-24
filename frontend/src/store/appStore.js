import { create } from 'zustand';
import { publicApi } from '../lib/api';

const loadJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const saveJson = (key, value) => {
  try {
    if (value !== undefined && value !== null) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.removeItem(key);
    }
  } catch (_) {}
};

const useAppStore = create((set, get) => {
  // Pre-load cached academic data synchronously for instant (0ms) render
  const initialCourses = loadJson('sankalp_cached_courses', []);
  const initialSemestersMap = loadJson('sankalp_cached_semesters_map', {});
  const initialSubjectsMap = loadJson('sankalp_cached_subjects_map', {});

  const initialSelectedCourse = loadJson('sankalp_selected_course', null);
  const initialSelectedSemester = loadJson('sankalp_selected_semester', null);
  const initialSelectedSubject = loadJson('sankalp_selected_subject', null);

  const initialSemesters =
    initialSelectedCourse?._id && initialSemestersMap[initialSelectedCourse._id]
      ? initialSemestersMap[initialSelectedCourse._id]
      : [];

  const initialSubjects =
    initialSelectedSemester?._id && initialSubjectsMap[initialSelectedSemester._id]
      ? initialSubjectsMap[initialSelectedSemester._id]
      : [];

  return {
    // Academic context
    courses: initialCourses,
    semestersMap: initialSemestersMap,
    subjectsMap: initialSubjectsMap,
    semesters: initialSemesters,
    subjects: initialSubjects,

    selectedCourse: initialSelectedCourse,
    selectedSemester: initialSelectedSemester,
    selectedSubject: initialSelectedSubject,

    academicLoading: false,

    // Theme & Navigation
    theme: localStorage.getItem('sankalp_theme') || 'dark',
    darkMode: localStorage.getItem('sankalp_theme') !== 'light',
    sidebarCollapsed: true, // Default to auto-collapsed
    mobileNavOpen: false,

    // Bring Your Own Groq Key
    groqApiKey: (() => {
      try {
        const fromSession = sessionStorage.getItem('sankalp_groq_session_key');
        if (fromSession) return fromSession;
        const fromLocal = localStorage.getItem('sankalp_setting_groq_api_key');
        if (fromLocal) {
          try {
            const parsed = JSON.parse(fromLocal);
            if (parsed && typeof parsed === 'string') return parsed;
          } catch {
            return fromLocal;
          }
        }
      } catch {}
      return '';
    })(),
    groqModel: (() => {
      try {
        const fromSession = sessionStorage.getItem('sankalp_groq_model');
        if (fromSession && !fromSession.includes('llama-3') && !fromSession.startsWith('llama3')) {
          return fromSession;
        }
        const fromLocal = localStorage.getItem('sankalp_setting_groq_model');
        if (fromLocal) {
          try {
            const parsed = JSON.parse(fromLocal);
            if (parsed && typeof parsed === 'string' && !parsed.includes('llama-3') && !parsed.startsWith('llama3')) {
              return parsed;
            }
          } catch {
            if (typeof fromLocal === 'string' && !fromLocal.includes('llama-3') && !fromLocal.startsWith('llama3')) {
              return fromLocal;
            }
          }
        }
      } catch {}
      return 'openai/gpt-oss-120b';
    })(),
    isAiConnected: (() => {
      try {
        const s = sessionStorage.getItem('sankalp_groq_session_key');
        if (s) return true;
        const l = localStorage.getItem('sankalp_setting_groq_api_key');
        if (l) {
          try {
            const parsed = JSON.parse(l);
            return Boolean(parsed);
          } catch {
            return Boolean(l.trim());
          }
        }
      } catch {}
      return false;
    })(),
    availableModels: [],

    // Global search modal
    searchOpen: false,

    // Instant Synchronous Actions (0ms Latency)
    setCourses: (courses) => {
      saveJson('sankalp_cached_courses', courses);
      set({ courses });
    },

    setSemesters: (semesters) => set({ semesters }),
    setSubjects: (subjects) => set({ subjects }),

    // Instant Course Change (Immediately updates semesters & subjects from local cache)
    setSelectedCourse: (course) => {
      if (!course) return;
      saveJson('sankalp_selected_course', course);

      const { semestersMap, subjectsMap } = get();
      const courseSemesters = semestersMap[course._id] || [];
      const firstSem = courseSemesters[0] || null;
      const semSubjects = firstSem ? subjectsMap[firstSem._id] || [] : [];
      const firstSub = semSubjects[0] || null;

      saveJson('sankalp_selected_semester', firstSem);
      saveJson('sankalp_selected_subject', firstSub);

      // Instantaneous state update (0ms delay)
      set({
        selectedCourse: course,
        semesters: courseSemesters,
        selectedSemester: firstSem,
        subjects: semSubjects,
        selectedSubject: firstSub,
      });
    },

    // Instant Semester Change (Immediately updates subjects from local cache)
    setSelectedSemester: (semester) => {
      if (!semester) return;
      saveJson('sankalp_selected_semester', semester);

      const { subjectsMap } = get();
      const semSubjects = subjectsMap[semester._id] || [];
      const firstSub = semSubjects[0] || null;

      saveJson('sankalp_selected_subject', firstSub);

      // Instantaneous state update (0ms delay)
      set({
        selectedSemester: semester,
        subjects: semSubjects,
        selectedSubject: firstSub,
      });
    },

    // Instant Subject Change
    setSelectedSubject: (subject) => {
      saveJson('sankalp_selected_subject', subject);
      set({ selectedSubject: subject });
    },

    // Fetch and sync entire academic tree in background (Stale-While-Revalidate)
    fetchAcademicTree: async () => {
      try {
        const res = await publicApi.getAcademicTree();
        if (res.data?.success && res.data.data) {
          const { courses, semesters, subjects } = res.data.data;

          // Build semestersMap: { [courseId]: Semester[] }
          const semestersMap = {};
          for (const s of semesters) {
            const cId = s.course_id?._id || s.course_id;
            if (cId) {
              if (!semestersMap[cId]) semestersMap[cId] = [];
              semestersMap[cId].push(s);
            }
          }

          // Build subjectsMap: { [semesterId]: Subject[] }
          const subjectsMap = {};
          for (const sub of subjects) {
            const semId = sub.semester_id?._id || sub.semester_id;
            if (semId) {
              if (!subjectsMap[semId]) subjectsMap[semId] = [];
              subjectsMap[semId].push(sub);
            }
          }

          saveJson('sankalp_cached_courses', courses);
          saveJson('sankalp_cached_semesters_map', semestersMap);
          saveJson('sankalp_cached_subjects_map', subjectsMap);

          const currentCourse = get().selectedCourse;
          const validCourse =
            currentCourse && courses.some((c) => c._id === currentCourse._id)
              ? courses.find((c) => c._id === currentCourse._id)
              : courses[0] || null;

          const courseSemesters = validCourse ? semestersMap[validCourse._id] || [] : [];
          const currentSem = get().selectedSemester;
          const validSem =
            currentSem && courseSemesters.some((s) => s._id === currentSem._id)
              ? courseSemesters.find((s) => s._id === currentSem._id)
              : courseSemesters[0] || null;

          const semSubjects = validSem ? subjectsMap[validSem._id] || [] : [];
          const currentSub = get().selectedSubject;
          const validSub =
            currentSub && semSubjects.some((s) => s._id === currentSub._id)
              ? semSubjects.find((s) => s._id === currentSub._id)
              : semSubjects[0] || null;

          saveJson('sankalp_selected_course', validCourse);
          saveJson('sankalp_selected_semester', validSem);
          saveJson('sankalp_selected_subject', validSub);

          set({
            courses,
            semestersMap,
            subjectsMap,
            selectedCourse: validCourse,
            semesters: courseSemesters,
            selectedSemester: validSem,
            subjects: semSubjects,
            selectedSubject: validSub,
            academicLoading: false,
          });
        }
      } catch (err) {
        console.warn('[Academic Data Sync]:', err.message);
      }
    },

    setTheme: (theme) => {
      let isDark = false;
      if (theme === 'dark') {
        isDark = true;
      } else if (theme === 'system') {
        isDark =
          typeof window !== 'undefined' &&
          window.matchMedia &&
          window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        isDark = false;
      }

      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      }

      localStorage.setItem('sankalp_theme', theme);
      set({ theme, darkMode: isDark });
    },

    toggleTheme: () => {
      const next = get().darkMode ? 'light' : 'dark';
      get().setTheme(next);
    },

    toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
    setSearchOpen: (open) => set({ searchOpen: open }),

    setGroqApiKey: (key) => {
      if (key) {
        sessionStorage.setItem('sankalp_groq_session_key', key);
        localStorage.setItem('sankalp_setting_groq_api_key', JSON.stringify(key));
      } else {
        sessionStorage.removeItem('sankalp_groq_session_key');
        localStorage.removeItem('sankalp_setting_groq_api_key');
      }
      set({ groqApiKey: key, isAiConnected: !!key });
    },

    setGroqModel: (model) => {
      if (model) {
        sessionStorage.setItem('sankalp_groq_model', model);
        localStorage.setItem('sankalp_setting_groq_model', JSON.stringify(model));
      }
      set({ groqModel: model });
    },

    disconnectAi: () => {
      sessionStorage.removeItem('sankalp_groq_session_key');
      localStorage.removeItem('sankalp_setting_groq_api_key');
      set({ groqApiKey: '', isAiConnected: false });
    },

    clearGroqKey: () => {
      sessionStorage.removeItem('sankalp_groq_session_key');
      localStorage.removeItem('sankalp_setting_groq_api_key');
      set({ groqApiKey: '', isAiConnected: false });
    },

    initAiCredentials: async () => {},

    initTheme: () => {
      const saved = localStorage.getItem('sankalp_theme') || 'dark';
      get().setTheme(saved);
    },
  };
});

export default useAppStore;
