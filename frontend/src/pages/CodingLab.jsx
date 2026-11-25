import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play,
  CheckCircle2,
  RotateCcw,
  Save,
  Maximize2,
  Minimize2,
  Flame,
  Award,
  Layers,
  Code2,
  BookOpen,
  ChevronDown,
  Terminal,
  Loader2,
  Settings,
  Sparkles,
  Search,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

import CodeEditor from '../components/coding/CodeEditor';
import ConsolePanel from '../components/coding/ConsolePanel';
import ProblemDetail from '../components/coding/ProblemDetail';
import ProblemListModal from '../components/coding/ProblemListModal';
import CodingStatsModal from '../components/coding/CodingStatsModal';
import AiAssistantPanel from '../components/coding/AiAssistantPanel';

import { codingApi } from '../lib/api';
import { getStudentId } from '../lib/studentIdentity';
import useAppStore from '../store/appStore';

const PLAYGROUND_STARTERS = {
  c: `#include <stdio.h>

int main() {
    printf("Hello from Sankalp Coding Lab!\\n");
    return 0;
}
`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello from Sankalp Coding Lab!" << endl;
    return 0;
}
`,
  python: `def main():
    print("Hello from Sankalp Coding Lab!")

if __name__ == "__main__":
    main()
`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Sankalp Coding Lab!");
    }
}
`,
  javascript: `console.log("Hello from Sankalp Coding Lab!");
`,
  typescript: `const greeting: string = "Hello from Sankalp Coding Lab!";
console.log(greeting);
`,
};

const LANGUAGES = [
  { id: 'python', name: 'Python 3', ext: '.py' },
  { id: 'cpp', name: 'C++ (G++ 14)', ext: '.cpp' },
  { id: 'c', name: 'C (GCC 14)', ext: '.c' },
  { id: 'java', name: 'Java (JDK 17)', ext: '.java' },
  { id: 'javascript', name: 'JavaScript (Node 22)', ext: '.js' },
  { id: 'typescript', name: 'TypeScript (TS 5.6)', ext: '.ts' },
];

export default function CodingLab() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { groqApiKey } = useAppStore();

  const studentId = useMemo(() => getStudentId(), []);

  // UI Modes: 'playground' (Default: Full IDE Online Playground) vs 'dsa' (Split screen problem + editor)
  const [mode, setMode] = useState('playground');

  // Languages & Problems state (Remembers last selected language, defaults to C)
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('sankalp_coding_last_lang') || 'c';
  });
  const [problems, setProblems] = useState([]);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [isLoadingProblems, setIsLoadingProblems] = useState(true);

  // Editor code state
  const [code, setCode] = useState('');
  const [fontSize, setFontSize] = useState(14);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Console state
  const [consoleTab, setConsoleTab] = useState('console');
  const [customInput, setCustomInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [executionStats, setExecutionStats] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState(0);
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);

  // Left Problem Detail active tab ('description', 'submissions', 'ai')
  const [detailTab, setDetailTab] = useState('description');

  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals state
  const [isProblemListOpen, setIsProblemListOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Progress state
  const [progress, setProgress] = useState(null);

  const containerRef = useRef(null);
  const consolePanelRef = useRef(null);

  // Load initial problems and student progress
  useEffect(() => {
    fetchInitialData();
  }, [slug]);

  const fetchInitialData = async () => {
    setIsLoadingProblems(true);
    try {
      const [probRes, progRes] = await Promise.all([
        codingApi.getProblems(),
        codingApi.getProgress(studentId),
      ]);

      let allProblems = [];
      if (probRes.data?.success) {
        allProblems = probRes.data.data.problems || probRes.data.data || [];
        setProblems(allProblems);
      }

      if (progRes.data?.success) {
        setProgress(progRes.data.data.progress || progRes.data.data);
      }

      // Determine active problem
      if (allProblems.length > 0) {
        let matched = null;
        if (slug) {
          matched = allProblems.find((p) => p.slug === slug);
        }
        if (!matched) {
          matched = allProblems[0];
        }
        setCurrentProblem(matched);
      }
    } catch (err) {
      console.error('Failed to load coding lab data:', err);
      toast.error('Could not load coding questions');
    } finally {
      setIsLoadingProblems(false);
    }
  };

  // Switch or initialize code when problem, language, or mode changes
  useEffect(() => {
    // Reset console results on mode or problem switch
    setOutput('');
    setError('');
    setExecutionStats(null);
    setTestResults(null);
    setConsoleTab('console');

    if (mode === 'playground') {
      const savedPlayground = localStorage.getItem(`sankalp_draft_playground_${selectedLanguage}`);
      setCode(savedPlayground || PLAYGROUND_STARTERS[selectedLanguage] || '');
      return;
    }

    if (!currentProblem) return;

    // Check localStorage cache or problem templates
    const savedLocal = localStorage.getItem(
      `sankalp_draft_${currentProblem._id}_${selectedLanguage}`
    );

    if (savedLocal) {
      setCode(savedLocal);
    } else {
      const starter =
        currentProblem.starterTemplates?.[selectedLanguage] ||
        currentProblem.starter_templates?.[selectedLanguage] ||
        PLAYGROUND_STARTERS[selectedLanguage] ||
        '';
      setCode(starter);
    }
  }, [currentProblem?._id, selectedLanguage, mode]);

  // Handle Code Change
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (mode === 'playground') {
      localStorage.setItem(`sankalp_draft_playground_${selectedLanguage}`, newCode);
    } else if (currentProblem?._id) {
      localStorage.setItem(`sankalp_draft_${currentProblem._id}_${selectedLanguage}`, newCode);
    }
  };

  // Execution lifecycle callbacks from ConsolePanel
  const handleExecutionStart = () => {
    setIsRunning(true);
    setConsoleTab('console');
    setOutput('');
    setError('');
    setExecutionStats(null);
  };

  const handleExecutionSuccess = (result) => {
    setIsRunning(false);
    setOutput(result.stdout || '');
    setError('');
    setConsoleTab('console');
    setExecutionStats({
      time: result.time ? `${result.time}s` : (result.executionTime || null),
      memory: result.memory ? `${Math.round(result.memory / 1024)}MB` : (result.memoryUsage || null),
      status: result.status || 'Accepted',
    });
    toast.success('Execution finished successfully');
  };

  const handleExecutionError = (errText, result) => {
    setIsRunning(false);
    setError(errText);
    setConsoleTab('console');
    const isCompile = errText.includes('Compilation') || (result && (result.compileOutput || result.compile_output));
    setExecutionStats({
      time: result?.time ? `${result.time}s` : (result?.executionTime || null),
      memory: result?.memory ? `${Math.round(result.memory / 1024)}MB` : (result?.memoryUsage || null),
      status: isCompile ? 'Compilation Error' : 'Runtime Error',
    });
    toast.error(isCompile ? 'Compilation Error: See Diagnostics' : 'Runtime Error during execution', {
      icon: isCompile ? '⚠️' : '❌',
    });
  };

  // Run Code (Playground & Sample Test Cases)
  const handleRunCode = (overrideStdin) => {
    if (isSubmitting) return;
    if (!code || code.trim().length === 0) {
      toast.error('Editor is empty. Write some code first!');
      return;
    }

    if (consolePanelRef.current) {
      const stdinArg =
        typeof overrideStdin === 'string'
          ? overrideStdin
          : mode === 'dsa' &&
            !customInput.trim() &&
            (currentProblem?.sampleTestCases?.[0]?.input || currentProblem?.sample_test_cases?.[0]?.input)
          ? (currentProblem?.sampleTestCases?.[0]?.input || currentProblem?.sample_test_cases?.[0]?.input)
          : undefined;
      consolePanelRef.current.startExecution(stdinArg);
    }
  };

  // Run a specific Sample Test Case from Test Cases tab
  const handleRunSampleTestCase = (sampleInput) => {
    setCustomInput(sampleInput);
    if (consolePanelRef.current) {
      consolePanelRef.current.startExecution(sampleInput);
    }
  };

  // Submit Solution (Graded against Hidden Test Cases)
  const handleSubmitSolution = async () => {
    if (isRunning || isSubmitting) return;
    if (mode !== 'dsa' || !currentProblem) {
      toast.error('Submit is only available for DSA Practice Problems');
      return;
    }

    if (!code || code.trim().length === 0) {
      toast.error('Editor is empty. Write your solution before submitting!');
      return;
    }

    setIsSubmitting(true);
    setConsoleTab('testcases');
    setOutput('');
    setError('');
    setExecutionStats(null);
    setTestResults(null);

    try {
      const res = await codingApi.submitSolution({
        studentId,
        problemId: currentProblem._id,
        language: selectedLanguage,
        code,
      });

      if (res.data?.success) {
        const submission = res.data.data.submission || res.data.data;
        const compileOut = submission.compileOutput || submission.compile_output || '';
        setTestResults(submission);
        setExecutionStats({
          time: submission.time || submission.executionTime,
          memory: submission.memory || submission.memoryUsed,
          status: submission.status,
        });

        if (submission.status === 'Accepted') {
          setError('');
          toast.success('🎉 Solution Accepted! Great work!', {
            duration: 4000,
            icon: '🏆',
          });
          fetchStudentProgress();
        } else if (submission.status === 'Compilation Error') {
          setError(compileOut || 'Compilation Error during evaluation');
          setConsoleTab('errors');
          toast.error('Compilation Error: See Compiler Errors tab', { icon: '⚠️' });
        } else {
          setError(submission.stderr || compileOut || '');
          toast.error(
            `${submission.status}: ${submission.passedTests ?? submission.test_cases_passed ?? 0}/${
              submission.totalTests ?? submission.total_test_cases ?? 0
            } passed`
          );
        }
      } else {
        toast.error(res.data?.message || 'Submission failed');
      }
    } catch (err) {
      console.error('Submit solution error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Submission failed';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchStudentProgress = async () => {
    try {
      const res = await codingApi.getProgress(studentId);
      if (res.data?.success) {
        setProgress(res.data.data.progress || res.data.data);
      }
    } catch (_) {}
  };

  // Reset code to starter template
  const handleResetCode = () => {
    if (window.confirm('Reset code back to the initial starter template? Your unsaved edits will be lost.')) {
      const starter =
        mode === 'dsa'
          ? currentProblem?.starterTemplates?.[selectedLanguage] ||
            currentProblem?.starter_templates?.[selectedLanguage] ||
            PLAYGROUND_STARTERS[selectedLanguage]
          : PLAYGROUND_STARTERS[selectedLanguage];
      setCode(starter || '');
      if (mode === 'playground') {
        localStorage.removeItem(`sankalp_draft_playground_${selectedLanguage}`);
      } else if (currentProblem?._id) {
        localStorage.removeItem(`sankalp_draft_${currentProblem._id}_${selectedLanguage}`);
      }
      toast.success('Reset to starter template');
    }
  };

  // Save draft explicitly to backend
  const handleSaveDraft = async () => {
    try {
      await codingApi.saveCode({
        studentId,
        problemId: mode === 'dsa' ? currentProblem?._id : undefined,
        language: selectedLanguage,
        code,
      });
      toast.success('Draft saved securely to your account');
    } catch (err) {
      toast.error('Failed to save draft');
    }
  };

  // Toggle Fullscreen
  const handleToggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Handle problem selection from modal
  const handleSelectProblem = (prob) => {
    setCurrentProblem(prob);
    navigate(`/coding-lab/${prob.slug}`, { replace: true });
    setMode('dsa');
  };

  // Ask AI Debugger directly from Compiler Errors tab
  const handleAskAiDebugger = () => {
    if (mode === 'dsa') {
      setDetailTab('ai');
      toast('AI Coding Mentor opened on the left panel', { icon: '🤖' });
    } else {
      setIsAiModalOpen(true);
    }
  };

  const currentStreak = progress?.currentStreak ?? progress?.current_streak ?? 0;
  const solvedCount =
    progress?.totalSolved ??
    progress?.total_solved ??
    (progress?.problemsSolved?.length || progress?.solved_problem_ids?.length || 0);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex flex-col overflow-hidden font-sans select-none bg-slate-50 dark:bg-black text-gray-900 dark:text-neutral-100 ${
        isFullscreen ? 'fixed inset-0 z-50 p-2 sm:p-3 bg-slate-50 dark:bg-black' : 'p-2 sm:p-3'
      }`}
    >
      {/* ============================================================ */}
      {/* TOP HEADER & ACTION CONTROLS                                 */}
      {/* ============================================================ */}
      <header className="bg-white dark:bg-[#0e0e0e] border border-gray-200 dark:border-neutral-800/80 rounded-2xl p-2.5 sm:px-4 sm:py-2.5 mb-2.5 flex flex-wrap items-center justify-between gap-2.5 shadow-xs dark:shadow-xl shrink-0">
        {/* Left: Mode toggle, Problem Selector, Language Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Switcher: Free Playground (Default) | DSA Practice Lab */}
          <div className="flex items-center bg-gray-100 dark:bg-[#181818] p-1 rounded-xl border border-gray-200 dark:border-neutral-800 text-xs">
            <button
              type="button"
              onClick={() => setMode('playground')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                mode === 'playground'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Free Playground</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('dsa')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                mode === 'dsa'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>DSA Practice Lab</span>
            </button>
          </div>

          {/* Problem Selector (in DSA Mode) */}
          {mode === 'dsa' && (
            <button
              type="button"
              onClick={() => setIsProblemListOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 dark:bg-[#141414] dark:hover:bg-[#1a1a1a] border border-gray-200 hover:border-gray-300 dark:border-neutral-800 dark:hover:border-neutral-700 text-xs text-gray-800 dark:text-neutral-200 font-medium flex items-center gap-2 transition-all shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span className="max-w-[160px] sm:max-w-[220px] truncate">
                {currentProblem ? currentProblem.title : 'Select Problem'}
              </span>
              <ChevronDown className="w-3 h-3 text-gray-400 dark:text-neutral-500" />
            </button>
          )}

          {/* Language Selector Dropdown */}
          <div className="relative">
            <select
              value={selectedLanguage}
              onChange={(e) => {
                const newLang = e.target.value;
                setSelectedLanguage(newLang);
                localStorage.setItem('sankalp_coding_last_lang', newLang);
              }}
              className="appearance-none bg-white hover:bg-gray-50 dark:bg-[#141414] dark:hover:bg-[#1a1a1a] border border-gray-200 hover:border-gray-300 dark:border-neutral-800 dark:hover:border-neutral-700 rounded-xl pl-3 pr-8 py-1.5 text-xs text-gray-800 dark:text-neutral-200 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer transition-all shadow-2xs"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id} className="bg-white text-gray-900 dark:bg-neutral-900 dark:text-white">
                  {lang.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-gray-400 dark:text-neutral-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Playground AI Mentor Pill */}
          {mode === 'playground' && (
            <button
              type="button"
              onClick={() => setIsAiModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-700/50 text-xs text-indigo-700 dark:text-indigo-300 font-medium flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>AI Coding Mentor</span>
            </button>
          )}
        </div>

        {/* Right: Actions (Run, Submit, Reset, Save, Fullscreen, Stats) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Coding Streak & Stats Pill */}
          <button
            type="button"
            onClick={() => setIsStatsOpen(true)}
            title="View Coding Performance & Streaks"
            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-gray-50 dark:bg-[#141414] dark:hover:bg-[#1a1a1a] border border-gray-200 hover:border-gray-300 dark:border-neutral-800 dark:hover:border-neutral-700 text-xs text-gray-700 dark:text-neutral-300 font-medium flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <Flame className="w-4 h-4 text-orange-500 dark:text-orange-400 animate-pulse" />
            <span className="font-mono font-semibold text-gray-900 dark:text-white">{currentStreak}</span>
            <span className="text-gray-500 dark:text-neutral-500 hidden sm:inline">streak</span>
            <span className="text-gray-400 dark:text-neutral-600 hidden sm:inline">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono hidden sm:inline">{solvedCount} solved</span>
          </button>

          {/* Reset Code */}
          <button
            type="button"
            onClick={handleResetCode}
            title="Reset code to default template"
            className="p-2 rounded-xl bg-white hover:bg-gray-50 dark:bg-[#141414] dark:hover:bg-[#1a1a1a] border border-gray-200 hover:border-gray-300 dark:border-neutral-800 dark:hover:border-neutral-700 text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white transition-colors shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Save Draft */}
          <button
            type="button"
            onClick={handleSaveDraft}
            title="Save code to account"
            className="p-2 rounded-xl bg-white hover:bg-gray-50 dark:bg-[#141414] dark:hover:bg-[#1a1a1a] border border-gray-200 hover:border-gray-300 dark:border-neutral-800 dark:hover:border-neutral-700 text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white transition-colors shadow-2xs"
          >
            <Save className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-2 rounded-xl bg-white hover:bg-gray-50 dark:bg-[#141414] dark:hover:bg-[#1a1a1a] border border-gray-200 hover:border-gray-300 dark:border-neutral-800 dark:hover:border-neutral-700 text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white transition-colors hidden sm:flex shadow-2xs"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Run Code Button */}
          <button
            type="button"
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            title="Run Code (Ctrl + Enter)"
            className="px-3.5 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 disabled:opacity-50 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-98"
          >
            {isRunning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-300 dark:text-neutral-300" />
            ) : (
              <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            )}
            <span>{isRunning ? 'Running...' : 'Run'}</span>
            <kbd className="hidden md:inline px-1.5 py-0.5 rounded bg-gray-800 dark:bg-neutral-900 border border-gray-700 dark:border-neutral-700 text-[10px] text-gray-300 dark:text-neutral-400 font-mono ml-1">
              Ctrl+↵
            </kbd>
          </button>

          {/* Submit Solution Button (Only in DSA mode) */}
          {mode === 'dsa' && (
            <button
              type="button"
              onClick={handleSubmitSolution}
              disabled={isRunning || isSubmitting}
              title="Submit Solution against Hidden Test Cases (Ctrl + Shift + Enter)"
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-98"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>{isSubmitting ? 'Evaluating...' : 'Submit'}</span>
              <kbd className="hidden md:inline px-1.5 py-0.5 rounded bg-emerald-700/60 border border-emerald-500/40 text-[10px] text-emerald-200 font-mono ml-1">
                ⇧+↵
              </kbd>
            </button>
          )}
        </div>
      </header>

      {/* ============================================================ */}
      {/* MAIN WORKSPACE: SPLIT SCREEN OR FULL IDE                     */}
      {/* ============================================================ */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2.5 min-h-0 overflow-hidden">
        {/* LEFT COLUMN: Problem Details & AI Tutor (only in DSA mode) */}
        {mode === 'dsa' && (
          <div className="lg:col-span-5 h-full flex flex-col min-h-0 overflow-hidden">
            <ProblemDetail
              problem={currentProblem}
              studentId={studentId}
              currentCode={code}
              language={selectedLanguage}
              activeTab={detailTab}
              onTabChange={setDetailTab}
              onOpenProblemList={() => setIsProblemListOpen(true)}
              errorOutput={error}
              stdout={output}
              stdin={customInput}
              onSelectSubmissionCode={(savedCode, lang) => {
                setCode(savedCode);
                if (lang && lang !== selectedLanguage) {
                  setSelectedLanguage(lang);
                }
                toast.success('Loaded code from previous submission');
              }}
            />
          </div>
        )}

        {/* RIGHT COLUMN: Code Editor + Resizable Console Panel */}
        <div
          className={`${
            mode === 'dsa' ? 'lg:col-span-7' : 'lg:col-span-12'
          } h-full flex flex-col min-h-0 gap-2 overflow-hidden`}
        >
          {/* Quick Informational Tip for Easy Understanding */}
          {mode === 'playground' && (
            <div className="shrink-0 px-3 py-1.5 bg-white dark:bg-[#0f1118] border border-gray-200 dark:border-neutral-800/80 rounded-xl text-xs flex items-center justify-between text-gray-600 dark:text-neutral-400 select-none shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-gray-800 dark:text-neutral-300">
                  <strong>Online IDE Playground:</strong> Write code in {selectedLanguage.toUpperCase()}, pass inputs directly in the terminal below, and run instantly.
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-[11px] text-gray-500 dark:text-neutral-500 font-mono">
                <span>Run: Ctrl+Enter</span>
                <span>•</span>
                <span>Reset: ↺</span>
              </div>
            </div>
          )}

          {/* Main Monaco Editor */}
          <div className="flex-1 min-h-[160px] overflow-hidden">
            <CodeEditor
              language={selectedLanguage}
              code={code}
              onChange={handleCodeChange}
              onRun={handleRunCode}
              onSubmit={mode === 'dsa' ? handleSubmitSolution : undefined}
              errorText={error}
              fontSize={fontSize}
            />
          </div>

          {/* Bottom Console Panel */}
          <div className="shrink-0">
            <ConsolePanel
              ref={consolePanelRef}
              mode={mode}
              activeTab={consoleTab}
              onTabChange={setConsoleTab}
              customInput={customInput}
              onCustomInputChange={setCustomInput}
              output={output}
              error={error}
              executionStats={executionStats}
              testResults={testResults}
              sampleTestCases={currentProblem?.sampleTestCases || currentProblem?.sample_test_cases || []}
              selectedTestCaseIndex={selectedTestCaseIndex}
              onSelectTestCaseIndex={setSelectedTestCaseIndex}
              onRunSampleCase={handleRunSampleTestCase}
              onAskAiDebugger={handleAskAiDebugger}
              isRunning={isRunning}
              isSubmitting={isSubmitting}
              isExpanded={isConsoleExpanded}
              onToggleExpand={() => setIsConsoleExpanded(!isConsoleExpanded)}
              code={code}
              language={selectedLanguage}
              studentId={studentId}
              problemId={currentProblem?._id}
              onExecutionStart={handleExecutionStart}
              onExecutionSuccess={handleExecutionSuccess}
              onExecutionError={handleExecutionError}
              onClearTerminal={() => {
                setOutput('');
                setError('');
                setExecutionStats(null);
                setCustomInput('');
              }}
            />
          </div>
        </div>
      </main>

      {/* ============================================================ */}
      {/* MODALS: PROBLEM BROWSER & PROGRESS DASHBOARD                 */}
      {/* ============================================================ */}
      <ProblemListModal
        isOpen={isProblemListOpen}
        onClose={() => setIsProblemListOpen(false)}
        problems={problems}
        solvedProblemIds={progress?.problemsSolved || progress?.solved_problem_ids || []}
        attemptedProblemIds={progress?.problemsAttempted || progress?.attempted_problem_ids || []}
        selectedProblemSlug={currentProblem?.slug}
        onSelectProblem={handleSelectProblem}
      />

      <CodingStatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        studentId={studentId}
      />

      {/* Playground AI Assistant Slide-over / Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 dark:bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl h-[80vh] bg-white dark:bg-[#0d0d0d] border border-gray-200 dark:border-neutral-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            <div className="p-3 bg-gray-50 dark:bg-[#121212] border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                AI Coding Assistant
              </span>
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="p-1 rounded text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-2">
              <AiAssistantPanel
                problemSlug={currentProblem?.slug || null}
                problemTitle={currentProblem?.title || null}
                language={selectedLanguage}
                code={code}
                studentId={studentId}
                errorOutput={error}
                stdout={output}
                stdin={customInput}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
