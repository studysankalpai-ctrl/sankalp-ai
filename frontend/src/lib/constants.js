export const APP_NAME = 'SANKALP AI';
export const APP_TAGLINE = 'Your Personal AI University Exam Mentor';
export const APP_DESCRIPTION = 'Understand concepts, explore previous-year papers and prepare confidently with your personal AI examination mentor.';

export const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const STUDENT_NAV = [
  { label: 'Home', path: '/', icon: 'Home' },
  { label: 'Papers & Syllabus', path: '/library', icon: 'FolderTree' },
  { label: 'AI Exam Mentor', path: '/mentor', icon: 'Bot' },
  { label: '5-Year Final Paper', path: '/predictions', icon: 'TrendingUp' },
  { label: 'Important Topics', path: '/topics', icon: 'Star' },
  { label: 'Practice Questions', path: '/practice', icon: 'PenTool' },
  { label: 'Mock Tests', path: '/tests', icon: 'ClipboardCheck' },
  { label: 'Study Planner', path: '/planner', icon: 'Calendar' },
  { label: 'Quick Revision', path: '/revision', icon: 'RotateCcw' },
  { label: 'Saved Notes', path: '/bookmarks', icon: 'Bookmark' },
  { label: 'Settings', path: '/settings', icon: 'Settings' },
];

export const ADMIN_NAV = [
  { label: 'Overview', path: '/admin', icon: 'LayoutDashboard' },
  { label: 'Courses', path: '/admin/courses', icon: 'GraduationCap' },
  { label: 'Semesters', path: '/admin/semesters', icon: 'Layers' },
  { label: 'Subjects', path: '/admin/subjects', icon: 'BookOpen' },
  { label: 'Folders', path: '/admin/folders', icon: 'FolderGit2' },
  { label: 'Syllabus', path: '/admin/syllabus', icon: 'FileText' },
  { label: 'Question Papers', path: '/admin/papers', icon: 'FileQuestion' },
  { label: 'AI Processing', path: '/admin/processing', icon: 'Cpu' },
  { label: 'Extracted Questions', path: '/admin/questions', icon: 'HelpCircle' },
  { label: 'AI Analysis', path: '/admin/analysis', icon: 'BarChart3' },
  { label: 'Storage', path: '/admin/storage', icon: 'HardDrive' },
  { label: 'Admin Settings', path: '/admin/settings', icon: 'ShieldCheck' },
];

export const MARKS_OPTIONS = [2, 5, 10, 15];

export const LANGUAGES = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi (हिंदी)' },
  { value: 'hinglish', label: 'Hinglish' },
];

export const ANSWER_STYLES = [
  { value: 'exam', label: 'Exam-Oriented Answer' },
  { value: 'beginner', label: 'Beginner Explanation' },
  { value: 'detailed', label: 'Detailed Technical Analysis' },
  { value: 'revision', label: 'Quick Revision' },
  { value: 'practical', label: 'Practical Examples & Cases' },
  { value: 'notes', label: 'Short Notes' },
];

export const QUESTION_TYPES = [
  { value: 'mcq', label: 'MCQ (Multiple Choice)' },
  { value: 'very_short', label: 'Very Short (2 Marks)' },
  { value: 'short', label: 'Short Answer (5 Marks)' },
  { value: 'long', label: 'Long Answer (10/15 Marks)' },
  { value: 'numerical', label: 'Numerical / Problem' },
  { value: 'conceptual', label: 'Conceptual' },
  { value: 'programming', label: 'Programming / Code' },
];

export const PRIORITY_CONFIG = {
  high: {
    label: 'High Priority',
    bg: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900',
    dot: 'bg-red-500',
  },
  medium: {
    label: 'Medium Priority',
    bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900',
    dot: 'bg-amber-500',
  },
  low: {
    label: 'Additional Preparation',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900',
    dot: 'bg-emerald-500',
  },
};
