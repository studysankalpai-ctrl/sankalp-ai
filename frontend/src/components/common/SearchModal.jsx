import React, { useState, useEffect } from 'react';
import { Search, X, FileText, HelpCircle, Star, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { publicApi } from '../../lib/api';
import useAppStore from '../../store/appStore';

export default function SearchModal() {
  const { searchOpen, setSearchOpen } = useAppStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ files: [], questions: [], topics: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults({ files: [], questions: [], topics: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await publicApi.search(query.trim());
        if (res.data?.success) {
          setResults(res.data.data);
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-24 px-3 sm:px-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-gray-200 dark:border-gray-800 gap-3">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search syllabus, questions, topics, or files... (Ctrl+K)"
            autoFocus
            className="w-full bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 text-base focus:outline-none"
          />
          {loading && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin shrink-0" />}
          <button
            onClick={() => setSearchOpen(false)}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
          {!query && (
            <div className="text-center py-10 text-gray-400 text-sm">
              Type at least 2 characters to search across official syllabi, past examination questions, and study topics.
            </div>
          )}

          {query && !loading && !results.files.length && !results.questions.length && !results.topics.length && (
            <div className="text-center py-10 text-gray-500 text-sm">
              No results found for "{query}". Try a broader keyword or concept name.
            </div>
          )}

          {/* Important Topics */}
          {results.topics?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 px-2 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500" /> Important Topics
              </h4>
              <div className="space-y-1">
                {results.topics.map((t) => (
                  <div
                    key={t._id}
                    onClick={() => {
                      setSearchOpen(false);
                      navigate(`/topics`);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t.topic_name}</p>
                      <p className="text-xs text-gray-500">{t.subject_id?.name} • Priority: {t.priority}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Questions */}
          {results.questions?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 px-2 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-500" /> University Exam Questions
              </h4>
              <div className="space-y-1">
                {results.questions.map((q) => (
                  <div
                    key={q._id}
                    onClick={() => {
                      setSearchOpen(false);
                      navigate(`/practice`);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <div className="max-w-[90%]">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{q.question_text}</p>
                      <p className="text-xs text-gray-500">
                        {q.marks ? `${q.marks} Marks` : 'Question'} • {q.subject_id?.name} ({q.exam_year || 'Past Paper'})
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files */}
          {results.files?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 px-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-500" /> Academic Documents & Papers
              </h4>
              <div className="space-y-1">
                {results.files.map((f) => (
                  <div
                    key={f._id}
                    onClick={() => {
                      setSearchOpen(false);
                      navigate(`/library`);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{f.original_filename}</p>
                      <p className="text-xs text-gray-500">PDF Document</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 flex justify-between items-center">
          <span>Press ESC to close</span>
          <span>SANKALP AI Academic Search</span>
        </div>
      </div>
    </div>
  );
}
