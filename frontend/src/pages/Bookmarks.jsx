import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  Download,
  Upload,
  Trash2,
  FileQuestion,
  Star,
  Sparkles,
  ClipboardCheck,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import ConfirmDialog from '../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

export default function Bookmarks() {
  const [activeTab, setActiveTab] = useState('questions'); // 'questions' | 'answers' | 'tests'
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [savedAnswers, setSavedAnswers] = useState([]);
  const [savedTests, setSavedTests] = useState([]);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const loadData = () => {
    setSavedQuestions(JSON.parse(localStorage.getItem('sankalp_saved_questions') || '[]'));
    setSavedAnswers(JSON.parse(localStorage.getItem('sankalp_bookmarked_answers') || '[]'));
    setSavedTests(JSON.parse(localStorage.getItem('sankalp_mock_test_results') || '[]'));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExportData = () => {
    const data = {
      savedQuestions,
      savedAnswers,
      savedTests,
      studyHistory: JSON.parse(localStorage.getItem('sankalp_study_history') || '[]'),
      completedTasks: JSON.parse(localStorage.getItem('sankalp_planner_completed_tasks') || '{}'),
      exportDate: new Date().toISOString(),
      platform: 'SANKALP AI',
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sankalp_study_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Study data exported successfully!');
  };

  const handleImportData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result);
        if (parsed.savedQuestions) localStorage.setItem('sankalp_saved_questions', JSON.stringify(parsed.savedQuestions));
        if (parsed.savedAnswers) localStorage.setItem('sankalp_bookmarked_answers', JSON.stringify(parsed.savedAnswers));
        if (parsed.savedTests) localStorage.setItem('sankalp_mock_test_results', JSON.stringify(parsed.savedTests));
        if (parsed.studyHistory) localStorage.setItem('sankalp_study_history', JSON.stringify(parsed.studyHistory));
        if (parsed.completedTasks) localStorage.setItem('sankalp_planner_completed_tasks', JSON.stringify(parsed.completedTasks));

        loadData();
        toast.success('Study data imported successfully!');
      } catch (err) {
        toast.error('Invalid JSON file format');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    localStorage.removeItem('sankalp_saved_questions');
    localStorage.removeItem('sankalp_bookmarked_answers');
    localStorage.removeItem('sankalp_mock_test_results');
    localStorage.removeItem('sankalp_study_history');
    localStorage.removeItem('sankalp_planner_completed_tasks');
    loadData();
    toast.success('Local study history cleared');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Saved Notes & Questions"
        description="Your bookmarked answers, saved practice questions, and mock test scores stored in your browser."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportData}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 text-gray-700 dark:text-gray-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>

            <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              Import JSON
              <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
            </label>

            <button
              onClick={() => setConfirmClearOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear History
            </button>
          </div>
        }
      />

      {/* Required Privacy Notice */}
      <div className="p-3.5 rounded-2xl bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300 leading-relaxed flex items-center justify-between gap-3">
        <p>
          <strong className="text-gray-950 dark:text-white">Local Privacy:</strong> Saved study data is preserved in your device&apos;s browser storage. Use <strong>Export Data</strong> to back up anytime.
        </p>
      </div>

      {/* Tabs (Smooth horizontal scrolling on mobile) */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 shadow-2xs overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'questions'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white'
          }`}
        >
          <FileQuestion className="w-3.5 h-3.5" />
          Saved Questions ({savedQuestions.length})
        </button>

        <button
          onClick={() => setActiveTab('answers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'answers'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Bookmarked Answers ({savedAnswers.length})
        </button>

        <button
          onClick={() => setActiveTab('tests')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'tests'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white'
          }`}
        >
          <ClipboardCheck className="w-3.5 h-3.5" />
          Mock Test Scores ({savedTests.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'questions' && (
        <div className="space-y-3">
          {savedQuestions.length === 0 ? (
            <p className="text-center py-12 text-xs text-gray-400">No saved questions yet.</p>
          ) : (
            savedQuestions.map((q, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-start justify-between gap-4"
              >
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 mr-2">
                    {q.marks ? `${q.marks}M` : 'PYQ'}
                  </span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {q.question_text || q.question}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const next = savedQuestions.filter((_, i) => i !== idx);
                    setSavedQuestions(next);
                    localStorage.setItem('sankalp_saved_questions', JSON.stringify(next));
                  }}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'answers' && (
        <div className="space-y-4">
          {savedAnswers.length === 0 ? (
            <p className="text-center py-12 text-xs text-gray-400">No bookmarked AI answers yet.</p>
          ) : (
            savedAnswers.map((a, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{a.subject}</span>
                  <button
                    onClick={() => {
                      const next = savedAnswers.filter((_, i) => i !== idx);
                      setSavedAnswers(next);
                      localStorage.setItem('sankalp_bookmarked_answers', JSON.stringify(next));
                    }}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {a.answer}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'tests' && (
        <div className="space-y-3">
          {savedTests.length === 0 ? (
            <p className="text-center py-12 text-xs text-gray-400">No mock tests attempted yet.</p>
          ) : (
            savedTests.map((t, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">{t.subjectName}</h4>
                  <p className="text-xs text-gray-400">{t.date} • Grade: {t.grade}</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                    {t.totalAwarded} / {t.totalMaxMarks} Marks
                  </span>
                  <p className="text-xs text-gray-400">{t.percentage}% Score</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        onConfirm={handleClearAll}
        title="Clear All Local Study Data?"
        message="This will permanently remove all your locally saved questions, bookmarked answers, and mock test scores from this browser."
        confirmText="Clear All Data"
      />
    </div>
  );
}
