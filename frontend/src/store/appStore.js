import { create } from 'zustand';
import {
  saveAiApiKey,
  getAiApiKey,
  removeAiApiKey,
  saveAiModel,
  getAiModel,
} from '../lib/mentorStorage';

const useAppStore = create((set, get) => ({
  // Academic context
  courses: [],
  semesters: [],
  subjects: [],
  selectedCourse: (() => {
    try {
      const saved = localStorage.getItem('sankalp_selected_course');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })(),
  selectedSemester: (() => {
    try {
      const saved = localStorage.getItem('sankalp_selected_semester');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })(),
  selectedSubject: (() => {
    try {
      const saved = localStorage.getItem('sankalp_selected_subject');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })(),

  // Theme & Navigation
  theme: localStorage.getItem('sankalp_theme') || 'light',
  darkMode: localStorage.getItem('sankalp_theme') === 'dark',
  sidebarCollapsed: false,
  mobileNavOpen: false,

  // Bring Your Own Groq Key (Stored in browser IndexedDB + session memory)
  groqApiKey: (() => {
    try {
      const fromSession = sessionStorage.getItem('sankalp_groq_session_key');
      if (fromSession) return fromSession;
      const fromLocal = localStorage.getItem('sankalp_setting_groq_api_key');
      if (fromLocal) {
        const parsed = JSON.parse(fromLocal);
        if (parsed && typeof parsed === 'string') return parsed;
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
        const parsed = JSON.parse(fromLocal);
        if (parsed && typeof parsed === 'string' && !parsed.includes('llama-3') && !parsed.startsWith('llama3')) {
          return parsed;
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
      if (l && JSON.parse(l)) return true;
    } catch {}
    return false;
  })(),
  availableModels: [],

  // Global search modal
  searchOpen: false,

  // Actions
  setCourses: (courses) => set({ courses }),
  setSemesters: (semesters) => set({ semesters }),
  setSubjects: (subjects) => set({ subjects }),

  setSelectedCourse: (course) => {
    try {
      if (course) localStorage.setItem('sankalp_selected_course', JSON.stringify(course));
      else localStorage.removeItem('sankalp_selected_course');
    } catch (_) {}
    set({ selectedCourse: course, selectedSemester: null, selectedSubject: null, semesters: [], subjects: [] });
  },

  setSelectedSemester: (semester) => {
    try {
      if (semester) localStorage.setItem('sankalp_selected_semester', JSON.stringify(semester));
      else localStorage.removeItem('sankalp_selected_semester');
    } catch (_) {}
    set({ selectedSemester: semester, selectedSubject: null, subjects: [] });
  },

  setSelectedSubject: (subject) => {
    try {
      if (subject) localStorage.setItem('sankalp_selected_subject', JSON.stringify(subject));
      else localStorage.removeItem('sankalp_selected_subject');
    } catch (_) {}
    set({ selectedSubject: subject });
  },

  setTheme: (theme) => {
    let isDark = false;
    if (theme === 'dark') {
      isDark = true;
    } else if (theme === 'system') {
      isDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
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
    const currentTheme = get().theme || (get().darkMode ? 'dark' : 'light');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    get().setTheme(newTheme);
  },

  initTheme: () => {
    const saved = localStorage.getItem('sankalp_theme') || 'light';
    get().setTheme(saved);
  },

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  setSearchOpen: (open) => set({ searchOpen: open }),

  // Load saved credentials from IndexedDB on startup
  initAiCredentials: async () => {
    try {
      const [savedKey, savedModel] = await Promise.all([
        getAiApiKey(),
        getAiModel(),
      ]);

      if (savedKey && typeof savedKey === 'string' && savedKey.trim().startsWith('gsk_')) {
        try {
          sessionStorage.setItem('sankalp_groq_session_key', savedKey.trim());
        } catch {}
        set({ groqApiKey: savedKey.trim(), isAiConnected: true });
      }

      if (savedModel && typeof savedModel === 'string' && !savedModel.includes('llama-3') && !savedModel.startsWith('llama3')) {
        try {
          sessionStorage.setItem('sankalp_groq_model', savedModel);
        } catch {}
        set({ groqModel: savedModel });
      }
    } catch (err) {
      console.warn('Could not load AI credentials from IndexedDB:', err);
    }
  },

  // Groq BYOK key management (Stored in browser IndexedDB + session memory)
  setGroqApiKey: (key) => {
    const trimmed = (key || '').trim();
    if (trimmed) {
      try {
        sessionStorage.setItem('sankalp_groq_session_key', trimmed);
      } catch {}
      saveAiApiKey(trimmed);
      set({ groqApiKey: trimmed, isAiConnected: true });
    } else {
      try {
        sessionStorage.removeItem('sankalp_groq_session_key');
      } catch {}
      removeAiApiKey();
      set({ groqApiKey: '', isAiConnected: false });
    }
  },

  setGroqModel: (model) => {
    let safeModel = model;
    if (!safeModel || safeModel.includes('llama-3') || safeModel.startsWith('llama3')) {
      safeModel = 'openai/gpt-oss-120b';
    }
    try {
      sessionStorage.setItem('sankalp_groq_model', safeModel);
    } catch {}
    saveAiModel(safeModel);
    set({ groqModel: safeModel });
  },
  setAvailableModels: (models) => set({ availableModels: models }),
  clearGroqKey: () => {
    try {
      sessionStorage.removeItem('sankalp_groq_session_key');
      sessionStorage.removeItem('sankalp_groq_model');
    } catch {}
    removeAiApiKey();
    set({ groqApiKey: '', isAiConnected: false });
  },
}));

export default useAppStore;
