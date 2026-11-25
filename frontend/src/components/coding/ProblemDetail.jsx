import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  History,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Clock,
  HardDrive,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Tag,
  Copy,
  Check,
  Search,
} from 'lucide-react';
import MarkdownRenderer from '../common/MarkdownRenderer';
import AiAssistantPanel from './AiAssistantPanel';
import { codingApi } from '../../lib/api';

export default function ProblemDetail({
  problem,
  studentId,
  currentCode,
  language,
  activeTab: externalTab,
  onTabChange: onExternalTabChange,
  onOpenProblemList,
  onSelectSubmissionCode,
  errorOutput = '',
  stdout = '',
  stdin = '',
}) {
  const [internalTab, setInternalTab] = useState('description');
  const activeTab = externalTab !== undefined ? externalTab : internalTab;
  const setActiveTab = onExternalTabChange || setInternalTab;
  const [submissions, setSubmissions] = useState([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [copiedExampleIndex, setCopiedExampleIndex] = useState(null);

  useEffect(() => {
    if (activeTab === 'submissions' && problem?._id && studentId) {
      fetchSubmissions();
    }
  }, [activeTab, problem?._id, studentId]);

  const fetchSubmissions = async () => {
    setIsLoadingSubmissions(true);
    try {
      const res = await codingApi.getSubmissions({
        studentId,
        problemId: problem._id,
        limit: 20,
      });
      if (res.data?.success) {
        setSubmissions(res.data.data.submissions || []);
      }
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedExampleIndex(index);
      setTimeout(() => setCopiedExampleIndex(null), 2000);
    } catch (_) {}
  };

  if (!problem) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-neutral-400">
        <BookOpen className="w-10 h-10 text-gray-400 dark:text-neutral-600 mb-3" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Select a Problem</h3>
        <p className="text-xs text-gray-500 dark:text-neutral-500 mt-1 max-w-xs">
          Choose a DSA question from the catalog to start solving.
        </p>
        <button
          type="button"
          onClick={onOpenProblemList}
          className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Browse Problems</span>
        </button>
      </div>
    );
  }

  // Difficulty badge styling
  const diffColors = {
    Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60',
    Hard: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800/60',
  };

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-neutral-800/80 overflow-hidden shadow-xs dark:shadow-2xl">
      {/* Top Header / Problem Title */}
      <div className="p-3.5 sm:p-4 bg-gray-50 dark:bg-[#121212] border-b border-gray-200 dark:border-neutral-800/80 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onOpenProblemList}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Problem Catalog</span>
          </button>

          <div className="flex items-center gap-1.5">
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                diffColors[problem.difficulty] || 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300'
              }`}
            >
              {problem.difficulty}
            </span>
            {problem.topic && (
              <span className="px-2 py-0.5 rounded-full text-[11px] bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 flex items-center gap-1">
                <Tag className="w-3 h-3 text-gray-400 dark:text-neutral-400" />
                {problem.topic}
              </span>
            )}
          </div>
        </div>

        <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
          {problem.title}
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center px-3 bg-gray-50/60 dark:bg-[#0d0d0d] border-b border-gray-200 dark:border-neutral-800/80 text-xs shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('description')}
          className={`px-3 py-2 border-b-2 font-medium flex items-center gap-1.5 transition-colors ${
            activeTab === 'description'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-white'
              : 'border-transparent text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Description</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('submissions')}
          className={`px-3 py-2 border-b-2 font-medium flex items-center gap-1.5 transition-colors ${
            activeTab === 'submissions'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-white'
              : 'border-transparent text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Submissions</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ai')}
          className={`px-3 py-2 border-b-2 font-medium flex items-center gap-1.5 transition-colors ${
            activeTab === 'ai'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-300'
              : 'border-transparent text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
          <span>AI Assistant</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 text-xs leading-relaxed text-gray-700 dark:text-neutral-300">
        {/* TAB 1: DESCRIPTION */}
        {activeTab === 'description' && (
          <div className="space-y-5">
            {/* Main Description */}
            <div className="prose max-w-none text-gray-800 dark:text-neutral-300 text-xs dark:prose-invert">
              <MarkdownRenderer content={problem.description} />
            </div>

            {/* Input & Output Format */}
            {((problem.inputFormat || problem.input_format) || (problem.outputFormat || problem.output_format)) && (
              <div className="space-y-3 bg-gray-50 dark:bg-[#121212] p-3.5 rounded-xl border border-gray-200 dark:border-neutral-800/80">
                {(problem.inputFormat || problem.input_format) && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400 mb-1">
                      Input Format
                    </h4>
                    <p className="text-gray-800 dark:text-neutral-300 text-xs font-mono">{problem.inputFormat || problem.input_format}</p>
                  </div>
                )}
                {(problem.outputFormat || problem.output_format) && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400 mb-1">
                      Output Format
                    </h4>
                    <p className="text-gray-800 dark:text-neutral-300 text-xs font-mono">{problem.outputFormat || problem.output_format}</p>
                  </div>
                )}
              </div>
            )}

            {/* Examples from Sample Test Cases */}
            {((problem.sampleTestCases && problem.sampleTestCases.length > 0) || (problem.sample_test_cases && problem.sample_test_cases.length > 0)) && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-neutral-300">
                  Examples
                </h3>
                {(problem.sampleTestCases || problem.sample_test_cases).map((ex, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-neutral-800/80 p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between text-gray-600 dark:text-neutral-400 font-semibold text-[11px]">
                      <span>Example {idx + 1}:</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(ex.input, idx)}
                        className="text-[10px] text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1"
                      >
                        {copiedExampleIndex === idx ? (
                          <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedExampleIndex === idx ? 'Copied' : 'Copy Input'}</span>
                      </button>
                    </div>

                    <div className="space-y-1.5 font-mono text-xs">
                      <div>
                        <span className="text-gray-500 dark:text-neutral-400 block text-[11px] font-sans font-medium">Input:</span>
                        <pre className="p-2 rounded bg-white dark:bg-black/60 text-gray-800 dark:text-neutral-200 border border-gray-200 dark:border-transparent overflow-x-auto">
                          {ex.input}
                        </pre>
                      </div>

                      <div>
                        <span className="text-gray-500 dark:text-neutral-400 block text-[11px] font-sans font-medium">Output:</span>
                        <pre className="p-2 rounded bg-white dark:bg-black/60 text-emerald-600 dark:text-emerald-400 border border-gray-200 dark:border-transparent overflow-x-auto">
                          {ex.expectedOutput || ex.output}
                        </pre>
                      </div>

                      {ex.explanation && (
                        <div className="pt-1">
                          <span className="text-gray-500 dark:text-neutral-400 block text-[11px] font-sans font-medium">Explanation:</span>
                          <p className="text-gray-600 dark:text-neutral-400 font-sans text-xs">{ex.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Constraints */}
            {problem.constraints && (
              <div className="bg-gray-50 dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-neutral-800/80 p-3.5 space-y-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
                  Constraints
                </h3>
                <ul className="list-disc list-inside space-y-1 font-mono text-xs text-gray-700 dark:text-neutral-300">
                  {(typeof problem.constraints === 'string'
                    ? problem.constraints.split('\n').filter(Boolean)
                    : Array.isArray(problem.constraints)
                    ? problem.constraints
                    : [problem.constraints]
                  ).map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SUBMISSIONS HISTORY */}
        {activeTab === 'submissions' && (
          <div className="space-y-3">
            {isLoadingSubmissions ? (
              <div className="py-8 text-center text-gray-500 dark:text-neutral-500">
                <div className="w-5 h-5 border-2 border-indigo-500 dark:border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p>Loading submission history...</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="py-12 text-center text-gray-500 dark:text-neutral-500">
                <History className="w-8 h-8 mx-auto mb-2 stroke-1 text-gray-400 dark:text-neutral-600" />
                <p className="text-gray-700 dark:text-neutral-400 text-xs font-medium">No submissions yet for this problem.</p>
                <p className="text-[11px] text-gray-500 dark:text-neutral-600 mt-0.5">
                  Write your solution in the editor and click <strong>Submit Solution</strong>.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {submissions.map((sub) => {
                  const isAccepted = sub.status === 'Accepted';
                  return (
                    <div
                      key={sub._id}
                      className="bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-neutral-800 rounded-lg p-3 flex items-center justify-between hover:border-gray-300 dark:hover:border-neutral-700 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {isAccepted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                          )}
                          <span
                            className={`font-semibold text-xs ${
                              isAccepted ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'
                            }`}
                          >
                            {sub.status}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-neutral-400">
                            {sub.language}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-neutral-500 flex items-center gap-3">
                          <span>
                            {new Date(sub.createdAt).toLocaleDateString()}{' '}
                            {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {sub.executionTime && (
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3" />
                              {sub.executionTime}
                            </span>
                          )}
                          {sub.memoryUsed && (
                            <span className="flex items-center gap-1 font-mono">
                              <HardDrive className="w-3 h-3" />
                              {sub.memoryUsed}
                            </span>
                          )}
                        </div>
                      </div>

                      {sub.code && onSelectSubmissionCode && (
                        <button
                          type="button"
                          onClick={() => onSelectSubmissionCode(sub.code, sub.language)}
                          className="px-2.5 py-1 rounded bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:border-transparent dark:text-neutral-300 text-[11px] font-medium transition-colors shadow-2xs"
                        >
                          Load Code
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AI ASSISTANT */}
        {activeTab === 'ai' && (
          <AiAssistantPanel
            problemSlug={problem.slug}
            problemTitle={problem.title}
            language={language}
            code={currentCode}
            studentId={studentId}
            errorOutput={errorOutput}
            stdout={stdout}
            stdin={stdin}
          />
        )}
      </div>
    </div>
  );
}
