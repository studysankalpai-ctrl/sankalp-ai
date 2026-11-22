import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  FileQuestion,
  Star,
  Sparkles,
  ArrowRight,
  Layers,
  FileText,
  PenTool,
} from 'lucide-react';
import { publicApi } from '../lib/api';
import useAppStore from '../store/appStore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import PageHeader from '../components/common/PageHeader';

export default function Subjects() {
  const { selectedCourse, selectedSemester, setSelectedSubject } = useAppStore();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubjects() {
      if (!selectedSemester) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await publicApi.getSubjects(selectedSemester._id);
        if (res.data?.success) {
          setSubjects(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSubjects();
  }, [selectedSemester]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Subjects"
        description="Curriculum subjects, unit-wise outlines, syllabus files, and previous-year question papers."
        badge={selectedSemester?.name || 'Semester'}
      />

      {loading ? (
        <LoadingSpinner text="Loading curriculum subjects..." />
      ) : subjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No subjects available"
          description="There are no published subjects in the current course and semester yet."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subj) => (
            <div
              key={subj._id}
              className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-2xs hover:shadow-lg hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
                    {subj.code}
                  </span>
                  <span className="text-xs font-medium text-gray-400">
                    {subj.units?.length || 0} Units
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 leading-snug">
                  {subj.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                  {subj.description || 'Comprehensive university curriculum syllabus.'}
                </p>

                {/* Units List Snippet */}
                {subj.units && subj.units.length > 0 && (
                  <div className="space-y-1.5 mb-6 p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Syllabus Units
                    </p>
                    {subj.units.slice(0, 3).map((u) => (
                      <div key={u._id} className="text-xs text-gray-700 dark:text-gray-300 truncate">
                        • Unit {u.number}: {u.name}
                      </div>
                    ))}
                    {subj.units.length > 3 && (
                      <p className="text-[11px] text-indigo-500 font-medium">
                        +{subj.units.length - 3} more units
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                <Link
                  to={`/mentor?subjectId=${subj._id}`}
                  onClick={() => setSelectedSubject(subj)}
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Ask AI Mentor
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to={`/topics?subjectId=${subj._id}`}
                    onClick={() => setSelectedSubject(subj)}
                    className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-medium bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 transition-colors"
                  >
                    <Star className="w-3 h-3 text-amber-500" />
                    Topics
                  </Link>
                  <Link
                    to={`/practice?subjectId=${subj._id}`}
                    onClick={() => setSelectedSubject(subj)}
                    className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-medium bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 transition-colors"
                  >
                    <PenTool className="w-3 h-3 text-indigo-500" />
                    Practice
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
