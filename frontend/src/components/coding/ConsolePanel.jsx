import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import {
  Terminal as TerminalIcon,
  Play,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  HardDrive,
  Maximize2,
  Minimize2,
  Layers,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  HelpCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  analyzeCodeInputs,
  getTerminalCommand,
  extractProgramOutput,
} from '../../lib/terminalFormatter';
import { codingApi } from '../../lib/api';
import { getStudentId } from '../../lib/studentIdentity';

const ConsolePanel = forwardRef(function ConsolePanel(
  {
    mode = 'playground',
    activeTab = 'console',
    onTabChange,
    customInput = '',
    onCustomInputChange,
    output = '',
    error = '',
    executionStats = null,
    testResults = null,
    sampleTestCases = [],
    selectedTestCaseIndex = 0,
    onSelectTestCaseIndex,
    onRunSampleCase,
    onAskAiDebugger,
    isRunning = false,
    isSubmitting = false,
    isExpanded = false,
    onToggleExpand,
    code = '',
    language = 'c',
    studentId = '',
    problemId = '',
    onExecutionStart,
    onExecutionSuccess,
    onExecutionError,
    onClearTerminal,
  },
  ref
) {
  const [copiedError, setCopiedError] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);

  // Traditional Terminal State Machine
  // sessionStatus: 'idle' | 'running' | 'waiting' | 'done' | 'error'
  const [sessionStatus, setSessionStatus] = useState('idle');
  const [terminalHistory, setTerminalHistory] = useState([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [activeInput, setActiveInput] = useState('');
  const [collectedLines, setCollectedLines] = useState([]);
  const [expectedCount, setExpectedCount] = useState(0);
  const [promptsList, setPromptsList] = useState([]);
  const [dynamicLoopInfo, setDynamicLoopInfo] = useState(null);
  const [runningElapsed, setRunningElapsed] = useState('0.0');

  useEffect(() => {
    let timer = null;
    if (sessionStatus === 'running' || isRunning || isSubmitting) {
      setRunningElapsed('0.0');
      const start = Date.now();
      timer = setInterval(() => {
        setRunningElapsed(((Date.now() - start) / 1000).toFixed(1));
      }, 100);
    } else {
      setRunningElapsed('0.0');
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [sessionStatus, isRunning, isSubmitting]);

  const activeInputRef = useRef(null);
  const terminalScrollRef = useRef(null);

  const terminalCommand = getTerminalCommand(language);

  // Expose startExecution & clearTerminal to parent (CodingLab) via ref
  useImperativeHandle(ref, () => ({
    startExecution: (overrideStdin) => {
      handleStartExecution(overrideStdin);
    },
    clearTerminal: () => {
      handleClear();
    },
  }));

  // Auto scroll to bottom of terminal whenever stream updates
  useEffect(() => {
    if (terminalScrollRef.current) {
      terminalScrollRef.current.scrollTop = terminalScrollRef.current.scrollHeight;
    }
  }, [terminalHistory, activeInput, currentPrompt, sessionStatus]);

  // Focus active input whenever waiting for student input
  useEffect(() => {
    if (sessionStatus === 'waiting' && activeInputRef.current) {
      activeInputRef.current.focus();
    }
  }, [sessionStatus, currentPrompt]);

  // Execute program on Judge0 with given standard input
  const executeProgram = async (stdinToPass = '') => {
    setSessionStatus('running');
    if (onExecutionStart) onExecutionStart();

    try {
      const res = await codingApi.executeCode({
        studentId: studentId || getStudentId(),
        language,
        code,
        stdin: stdinToPass,
        problemId: mode === 'dsa' ? problemId : undefined,
      });

      if (res.data?.success) {
        const result = res.data.data;
        const compileOut = result.compileOutput || result.compile_output || '';
        const stdErr = result.stderr || '';
        const stdOut = result.stdout || '';
        const statusStr =
          typeof result.status === 'string'
            ? result.status
            : (result.status?.description || 'Executed');

        const hasCompileError =
          statusStr === 'Compilation Error' || compileOut.trim().length > 0;
        const hasRuntimeError =
          statusStr.includes('Runtime') || (stdErr.trim().length > 0 && !stdOut);

        if (hasCompileError) {
          const errText = compileOut || 'Compilation Error: Check code syntax';
          setTerminalHistory((prev) => [
            ...prev,
            { type: 'error_output', text: errText },
            { type: 'exit', text: `[Process exited with compilation error]` },
          ]);
          setSessionStatus('error');
          if (onExecutionError) onExecutionError(errText, result);
        } else if (hasRuntimeError) {
          const errText = stdErr || 'Runtime Error during execution';
          const items = [];
          if (stdOut) {
            const cleanOut = extractProgramOutput(stdOut, promptsList);
            if (cleanOut) items.push({ type: 'output', text: cleanOut });
          }
          items.push({ type: 'error_output', text: errText });
          items.push({ type: 'exit', text: `[Process terminated: ${statusStr}]` });
          setTerminalHistory((prev) => [...prev, ...items]);
          setSessionStatus('error');
          if (onExecutionError) onExecutionError(errText, result);
        } else {
          // Success execution!
          const cleanOut = extractProgramOutput(stdOut, promptsList);
          const finalOut = cleanOut || (stdOut ? stdOut.trim() : '(Program completed with no output)');
          setTerminalHistory((prev) => [
            ...prev,
            { type: 'output', text: finalOut },
            {
              type: 'exit',
              text: `[Process finished with exit code 0${result.time ? ` in ${result.time}s` : ''}]`,
            },
          ]);
          setSessionStatus('done');
          if (onExecutionSuccess) onExecutionSuccess(result);
        }
      } else {
        const errMsg = res.data?.message || 'Execution error';
        setTerminalHistory((prev) => [
          ...prev,
          { type: 'error_output', text: errMsg },
          { type: 'exit', text: `[Process failed]` },
        ]);
        setSessionStatus('error');
        if (onExecutionError) onExecutionError(errMsg);
      }
    } catch (err) {
      console.error('Execution error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Execution failed';
      setTerminalHistory((prev) => [
        ...prev,
        { type: 'error_output', text: errMsg },
        { type: 'exit', text: `[Process failed]` },
      ]);
      setSessionStatus('error');
      if (onExecutionError) onExecutionError(errMsg);
    }
  };

  // Start execution session
  const handleStartExecution = async (overrideStdin) => {
    if (!code || code.trim().length === 0) {
      toast.error('Editor is empty. Write some code first!');
      return;
    }

    if (onTabChange) onTabChange('console');

    // If explicit stdin provided (e.g. from sample test cases in DSA)
    if (typeof overrideStdin === 'string' && overrideStdin.length > 0) {
      setTerminalHistory([
        { type: 'header', text: `sankalp@ide:~$ ${terminalCommand}` },
        { type: 'prompt_line', prompt: 'Input: ', value: overrideStdin },
      ]);
      setCollectedLines([]);
      setActiveInput('');
      await executeProgram(overrideStdin);
      return;
    }

    // Interactive step-by-step terminal execution
    const analysis = analyzeCodeInputs(code, language);
    setExpectedCount(analysis.expectedCount);
    setPromptsList(analysis.prompts);
    setDynamicLoopInfo(analysis.dynamicLoop || null);
    setCollectedLines([]);
    setActiveInput('');

    if (analysis.expectedCount > 0 || (analysis.prompts && analysis.prompts.length > 0)) {
      // Program expects inputs! Show prompt immediately and wait for student
      const firstPrompt = analysis.prompts[0] !== undefined ? analysis.prompts[0] : '> ';
      setCurrentPrompt(firstPrompt);
      setSessionStatus('waiting');
      setTerminalHistory([
        { type: 'header', text: `sankalp@ide:~$ ${terminalCommand}` },
      ]);
      setTimeout(() => activeInputRef.current?.focus(), 50);
    } else {
      // No inputs expected - run program directly
      setTerminalHistory([
        { type: 'header', text: `sankalp@ide:~$ ${terminalCommand}` },
      ]);
      await executeProgram('');
    }
  };

  // Handle multi-line paste directly into active terminal prompt
  const handlePaste = async (e) => {
    const pasted = e.clipboardData.getData('text');
    if (!pasted) return;

    // Check if pasted content contains multiple lines
    const lines = pasted.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length > 1) {
      e.preventDefault();
      const addedHistory = [...terminalHistory];
      const allLines = [...collectedLines];

      lines.forEach((lineVal) => {
        const p = promptsList[allLines.length] || '> ';
        addedHistory.push({
          type: 'prompt_line',
          prompt: p,
          value: lineVal,
        });
        allLines.push(lineVal);
      });

      setTerminalHistory(addedHistory);
      setCollectedLines(allLines);
      setActiveInput('');

      // Check if all needed inputs are satisfied
      const totalTokens = allLines.flatMap((l) => l.split(/\s+/).filter(Boolean)).length;
      let isDone = false;
      if (promptsList.length > 1) {
        isDone = allLines.length >= promptsList.length;
      } else if (promptsList.length === 1) {
        isDone = totalTokens >= expectedCount;
      } else {
        isDone = totalTokens >= expectedCount;
      }

      if (isDone) {
        const fullStdin = allLines.join('\n');
        if (onCustomInputChange) onCustomInputChange(fullStdin);
        await executeProgram(fullStdin);
      } else {
        const nextPrompt = promptsList[allLines.length] || '> ';
        setCurrentPrompt(nextPrompt);
        setSessionStatus('waiting');
        setTimeout(() => activeInputRef.current?.focus(), 50);
      }
    }
  };

  // Handle Enter keypress on the active terminal line
  const handleTerminalInputSubmit = async (e) => {
    if (e) e.preventDefault();
    const typed = activeInput.trim();

    if (!typed) {
      // If user presses Enter on empty line and already provided inputs, execute now!
      if (collectedLines.length > 0) {
        const fullStdin = collectedLines.join('\n');
        if (onCustomInputChange) onCustomInputChange(fullStdin);
        await executeProgram(fullStdin);
      }
      return;
    }

    const tokensInThisLine = typed.split(/\s+/).filter(Boolean);
    const newCollected = [...collectedLines, typed];
    setCollectedLines(newCollected);
    setActiveInput('');

    // Append completed line to terminal history (preserving prompt + value)
    const newHistory = [
      ...terminalHistory,
      {
        type: 'prompt_line',
        prompt: currentPrompt,
        value: typed,
      },
    ];
    setTerminalHistory(newHistory);

    let updatedPrompts = [...promptsList];
    let updatedExpected = expectedCount;

    // If dynamic loop is detected (e.g. for i in range(n)), and this was response for n:
    if (dynamicLoopInfo && newCollected.length === 1) {
      const countVal = parseInt(tokensInThisLine[0], 10);
      if (!isNaN(countVal) && countVal > 0 && countVal <= 50) {
        const unrolled = [];
        for (let k = dynamicLoopInfo.startVal; k < dynamicLoopInfo.startVal + countVal; k++) {
          let p = dynamicLoopInfo.template || '';
          if (p) {
            p = p.replace(new RegExp(`\\{\\s*${dynamicLoopInfo.loopVar}\\s*\\+\\s*1\\s*\\}`, 'g'), String(k + 1));
            p = p.replace(new RegExp(`\\{\\s*${dynamicLoopInfo.loopVar}\\s*\\}`, 'g'), String(k));
          } else {
            p = `Element ${k + 1}:`;
          }
          unrolled.push(p);
        }
        updatedPrompts = [promptsList[0] || '', ...unrolled];
        updatedExpected = 1 + countVal;
        setPromptsList(updatedPrompts);
        setExpectedCount(updatedExpected);
      }
    }

    // Calculate total space-separated tokens across all lines
    const allTokens = newCollected.flatMap((l) => l.split(/\s+/).filter(Boolean));
    const totalTokens = allTokens.length;

    // Check if input collection is complete:
    // 1. If user typed multiple space-separated tokens (e.g. "10 20 30 40" or "4 10 20 30 40"):
    //    user gave multiple values at once -> complete immediately!
    // 2. If newCollected.length >= updatedPrompts.length -> all prompt lines answered!
    // 3. If totalTokens >= updatedExpected and updatedExpected > 0 -> all values provided!
    let isCompleted = false;
    if (tokensInThisLine.length > 1 && (totalTokens >= updatedExpected || totalTokens >= updatedPrompts.length)) {
      isCompleted = true;
    } else if (newCollected.length >= updatedPrompts.length && updatedPrompts.length > 0) {
      isCompleted = true;
    } else if (totalTokens >= updatedExpected && updatedExpected > 0) {
      isCompleted = true;
    }

    if (isCompleted) {
      // If user entered all values in one line (e.g. "10 20 30 40"),
      // separate by newline so Python/Java consecutive input() / scanner calls read each token!
      let fullStdin = newCollected.join('\n');
      if (newCollected.length === 1 && allTokens.length > 1) {
        fullStdin = allTokens.join('\n');
      }
      if (onCustomInputChange) onCustomInputChange(fullStdin);
      await executeProgram(fullStdin);
    } else {
      // More inputs are still needed! Display next prompt
      const nextPromptIndex = newCollected.length;
      const nextPrompt = updatedPrompts[nextPromptIndex] !== undefined ? updatedPrompts[nextPromptIndex] : '> ';
      setCurrentPrompt(nextPrompt);
      setSessionStatus('waiting');
      setTimeout(() => activeInputRef.current?.focus(), 50);
    }
  };

  // Reset & Clear terminal session
  const handleClear = () => {
    setSessionStatus('idle');
    setTerminalHistory([]);
    setCurrentPrompt('');
    setActiveInput('');
    setCollectedLines([]);
    setDynamicLoopInfo(null);
    if (onClearTerminal) onClearTerminal();
  };

  const handleCopyError = async () => {
    if (!error) return;
    try {
      await navigator.clipboard.writeText(error);
      setCopiedError(true);
      toast.success('Error copied to clipboard');
      setTimeout(() => setCopiedError(false), 2000);
    } catch (_) {}
  };

  const handleCopyOutput = async () => {
    const textToCopy = terminalHistory
      .map((item) => {
        if (item.type === 'header') return item.text;
        if (item.type === 'prompt_line') return `${item.prompt} ${item.value}`;
        if (item.type === 'output') return item.text;
        if (item.type === 'error_output') return item.text;
        if (item.type === 'exit') return item.text;
        return '';
      })
      .filter(Boolean)
      .join('\n');

    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedOutput(true);
      toast.success('Terminal output copied');
      setTimeout(() => setCopiedOutput(false), 2000);
    } catch (_) {}
  };

  const isSegFault =
    error &&
    (error.includes('Segmentation fault') ||
      error.includes('SIGSEGV') ||
      error.includes('core dumped'));

  const showTestCasesTab =
    mode === 'dsa' && (testResults || (sampleTestCases && sampleTestCases.length > 0));

  return (
    <div
      className={`w-full bg-white dark:bg-[#08090d] rounded-xl border border-gray-200 dark:border-neutral-800/90 flex flex-col overflow-hidden transition-all duration-200 shadow-md dark:shadow-2xl ${
        isExpanded ? 'h-[460px]' : 'h-[230px]'
      }`}
    >
      {/* ============================================================ */}
      {/* TOP HEADER                                                   */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 dark:bg-[#10121a] border-b border-gray-200 dark:border-neutral-800/90 select-none text-xs">
        <div className="flex items-center gap-2">
          {/* Main Terminal Tab */}
          <button
            type="button"
            onClick={() => onTabChange && onTabChange('console')}
            className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'console' ||
              activeTab === 'output' ||
              activeTab === 'input' ||
              activeTab === 'errors'
                ? 'bg-white dark:bg-neutral-800 text-gray-900 dark:text-white shadow-sm border border-gray-200/80 dark:border-transparent'
                : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-200 hover:bg-gray-200/60 dark:hover:bg-neutral-800/40'
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span>Terminal</span>
            {error ? (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            ) : terminalHistory.length > 1 ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            ) : null}
          </button>

          {/* Test Cases Tab (ONLY in DSA Mode) */}
          {showTestCasesTab && (
            <button
              type="button"
              onClick={() => onTabChange && onTabChange('testcases')}
              className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'testcases'
                  ? 'bg-white dark:bg-neutral-800 text-gray-900 dark:text-white shadow-sm border border-gray-200/80 dark:border-transparent'
                  : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-200 hover:bg-gray-200/60 dark:hover:bg-neutral-800/40'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
              <span>DSA Test Cases</span>
              {testResults && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    testResults.status === 'Accepted'
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                      : 'bg-rose-500/20 text-rose-600 dark:text-rose-300'
                  }`}
                >
                  {testResults.passedTests ?? testResults.test_cases_passed ?? 0}/
                  {testResults.totalTests ?? testResults.total_test_cases ?? 0}
                </span>
              )}
            </button>
          )}

          {/* Clear / Restart Terminal */}
          <button
            type="button"
            onClick={handleClear}
            className="text-[11px] text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white px-2 py-0.5 rounded bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 transition-colors flex items-center gap-1 shadow-2xs"
            title="Restart terminal session"
          >
            <RotateCcw className="w-3 h-3 text-gray-500 dark:text-neutral-400" />
            <span>Clear</span>
          </button>
        </div>

        {/* Right stats & controls */}
        <div className="flex items-center gap-2.5">
          {executionStats && (
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-gray-600 dark:text-neutral-400 font-mono">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium border bg-white dark:bg-neutral-800 text-gray-800 dark:text-neutral-200 border-gray-200 dark:border-neutral-700 flex items-center gap-1 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                <span>{executionStats.status || 'Executed'}</span>
              </span>
              {executionStats.time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-400 dark:text-neutral-500" />
                  {executionStats.time}
                </span>
              )}
              {executionStats.memory && (
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3 text-gray-400 dark:text-neutral-500" />
                  {executionStats.memory}
                </span>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onToggleExpand}
            title={isExpanded ? 'Collapse Console' : 'Expand Console'}
            className="p-1 rounded text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-neutral-800 transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TERMINAL BODY: TRADITIONAL INTERACTIVE CONSOLE               */}
      {/* ============================================================ */}
      <div
        className="flex-1 overflow-hidden flex flex-col bg-[#0b0e17] dark:bg-[#07080b] cursor-text"
        onClick={() => activeInputRef.current?.focus()}
      >
        {(activeTab === 'console' ||
          activeTab === 'output' ||
          activeTab === 'input' ||
          activeTab === 'errors') && (
          <div className="flex-1 flex flex-col h-full overflow-hidden p-3 font-mono text-xs select-text">
            {/* Terminal Actions Bar */}
            <div className="flex items-center justify-between text-neutral-500 text-[11px] mb-2 select-none border-b border-neutral-900 pb-1.5">
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-emerald-500">sankalp@ide</span>
                <span className="text-neutral-600">:</span>
                <span className="text-indigo-400">~</span>
                <span className="text-neutral-500">$</span>
                <span className="text-neutral-300">{terminalCommand}</span>
              </div>

              <div className="flex items-center gap-2">
                {error && (
                  <button
                    type="button"
                    onClick={handleCopyError}
                    className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedError ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedError ? 'Copied' : 'Copy Error'}</span>
                  </button>
                )}
                {terminalHistory.length > 0 && !error && (
                  <button
                    type="button"
                    onClick={handleCopyOutput}
                    className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedOutput ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedOutput ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Output Stream */}
            <div
              ref={terminalScrollRef}
              className="flex-1 overflow-y-auto space-y-1 leading-relaxed"
            >
              {/* Prior Terminal History Lines */}
              {terminalHistory.map((item, idx) => {
                if (item.type === 'header') {
                  return (
                    <div key={idx} className="text-neutral-400">
                      {item.text}
                    </div>
                  );
                }
                if (item.type === 'prompt_line') {
                  return (
                    <div key={idx} className="flex items-center flex-wrap">
                      <span className="text-neutral-200 mr-1.5 whitespace-pre-wrap">{item.prompt}</span>
                      <span className="text-emerald-400 font-semibold">{item.value}</span>
                    </div>
                  );
                }
                if (item.type === 'output') {
                  return (
                    <div key={idx} className="text-emerald-400 whitespace-pre-wrap">
                      {item.text}
                    </div>
                  );
                }
                if (item.type === 'error_output') {
                  return (
                    <div key={idx} className="text-rose-400 whitespace-pre-wrap font-mono">
                      {item.text}
                    </div>
                  );
                }
                if (item.type === 'exit') {
                  return (
                    <div key={idx} className="text-neutral-500 text-[11px] pt-1">
                      {item.text}
                    </div>
                  );
                }
                return null;
              })}

              {/* CURRENT ACTIVE TERMINAL PROMPT LINE (WHEN WAITING FOR SCANF / CIN / SCANNER) */}
              {sessionStatus === 'waiting' && (
                <form
                  onSubmit={handleTerminalInputSubmit}
                  className="flex items-center flex-wrap gap-1"
                >
                  <span className="text-neutral-200 mr-1.5 whitespace-pre-wrap font-mono">
                    {currentPrompt}
                  </span>
                  <span className="relative flex-1 min-w-[100px]">
                    <input
                      ref={activeInputRef}
                      type="text"
                      value={activeInput}
                      onChange={(e) => setActiveInput(e.target.value)}
                      onPaste={handlePaste}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleTerminalInputSubmit(e);
                        }
                      }}
                      autoFocus
                      placeholder={collectedLines.length > 0 ? "type value and ↵ (or click Run Now)" : "type value and ↵"}
                      className="w-full bg-transparent border-none outline-none font-mono text-xs text-emerald-400 caret-indigo-400 p-0 m-0 placeholder:text-neutral-600"
                    />
                  </span>
                  {collectedLines.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const fullStdin = collectedLines.join('\n');
                        if (onCustomInputChange) onCustomInputChange(fullStdin);
                        executeProgram(fullStdin);
                      }}
                      className="text-[10px] px-2 py-0.5 rounded bg-indigo-600/70 hover:bg-indigo-600 text-white font-sans transition-colors flex items-center gap-1 select-none shadow-sm"
                      title="Run program with entered values"
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>Run Now ({collectedLines.length})</span>
                    </button>
                  )}
                </form>
              )}

              {/* RUNNING SPINNER WITH LIVE ELAPSED TIMER */}
              {(sessionStatus === 'running' || isRunning || isSubmitting) && (
                <div className="flex items-center gap-2 text-emerald-400 py-1 font-mono text-[11px] animate-in fade-in duration-150">
                  <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>
                    {isSubmitting ? 'Evaluating Test Cases...' : 'Executing Program...'} <span className="text-zinc-400 font-normal">({runningElapsed}s)</span>
                  </span>
                </div>
              )}

              {/* ERROR DIAGNOSTICS */}
              {error && (
                <div className="space-y-3 font-sans my-2">
                  <div className="bg-red-950/40 border border-red-900/60 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs mb-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>
                        {isSegFault
                          ? 'Runtime Error: Segmentation Fault (SIGSEGV / Core Dumped)'
                          : executionStats?.status === 'Compilation Error'
                          ? 'Compilation Error'
                          : 'Runtime Error'}
                      </span>
                    </div>
                    <pre className="whitespace-pre-wrap text-rose-300 font-mono text-xs leading-relaxed bg-black/60 p-2.5 rounded border border-red-900/40 overflow-x-auto">
                      {error}
                    </pre>
                  </div>

                  {isSegFault && (
                    <div className="bg-amber-950/30 border border-amber-800/50 rounded-lg p-3 text-xs space-y-1.5">
                      <div className="flex items-center gap-2 text-amber-300 font-semibold">
                        <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Why Did Segmentation Fault Happen in C?</span>
                      </div>
                      <p className="text-neutral-300 text-[11px] leading-relaxed">
                        In C, <code className="text-amber-300 font-mono font-semibold">scanf()</code> requires the <strong>memory address (&)</strong> of your variables.
                      </p>
                      <div className="p-2 rounded bg-black/60 font-mono text-[11px] text-neutral-300 space-y-1">
                        <div className="text-rose-400 line-through">
                          ❌ scanf("%d %d", a, b);  // WRONG: passes values!
                        </div>
                        <div className="text-emerald-400 font-semibold">
                          ✓ scanf("%d %d", &a, &b); // CORRECT: '&' gives the memory address!
                        </div>
                      </div>
                    </div>
                  )}

                  {onAskAiDebugger && (
                    <button
                      type="button"
                      onClick={() => onAskAiDebugger(error)}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-2 transition-all shadow-md w-fit"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>🤖 Ask AI Debugger to Auto-Fix Code</span>
                    </button>
                  )}
                </div>
              )}

              {/* IDLE READY STATE */}
              {sessionStatus === 'idle' && terminalHistory.length === 0 && !error && (
                <div className="flex flex-col items-center justify-center h-full text-neutral-500 py-6 text-center font-sans">
                  <TerminalIcon className="w-8 h-8 text-neutral-700 mb-2 stroke-1" />
                  <p className="text-neutral-300 text-xs font-medium">Terminal Ready</p>
                  <p className="text-neutral-500 text-[11px] mt-1 max-w-sm">
                    Click <span className="text-white font-semibold">Run (Ctrl+Enter)</span> to execute your program. Prompts and inputs appear inline right here in real time.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: DSA TEST CASES (ONLY in DSA Mode when tab is selected) */}
        {activeTab === 'testcases' && showTestCasesTab && (
          <div className="w-full h-full p-3 overflow-y-auto font-sans">
            {testResults ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <span className="text-xs text-neutral-300">
                    Passed: <strong className="text-white">
                      {testResults.passedTests ?? testResults.test_cases_passed ?? 0}
                    </strong> / {testResults.totalTests ?? testResults.total_test_cases ?? 0} test cases
                  </span>
                  {(testResults.time || testResults.executionTime) && (
                    <span className="text-[11px] text-neutral-400 font-mono">
                      Runtime: {testResults.time || testResults.executionTime}
                    </span>
                  )}
                </div>

                {testResults.results && testResults.results.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {testResults.results.map((res, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => onSelectTestCaseIndex && onSelectTestCaseIndex(idx)}
                          className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium flex items-center gap-1.5 transition-colors border ${
                            selectedTestCaseIndex === idx
                              ? 'bg-neutral-800 text-white border-neutral-600'
                              : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          {res.passed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          )}
                          <span>Case {idx + 1}</span>
                        </button>
                      ))}
                    </div>

                    {testResults.results[selectedTestCaseIndex] && (
                      <div className="bg-[#121212] border border-neutral-800 rounded-lg p-3 text-xs space-y-2">
                        <div>
                          <div className="text-[11px] font-semibold text-neutral-400 mb-1">Input:</div>
                          <pre className="p-2 rounded bg-black/60 text-neutral-300 font-mono text-[11px] overflow-x-auto">
                            {testResults.results[selectedTestCaseIndex].input || '(none)'}
                          </pre>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <div className="text-[11px] font-semibold text-neutral-400 mb-1">Expected Output:</div>
                            <pre className="p-2 rounded bg-black/60 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                              {testResults.results[selectedTestCaseIndex].expectedOutput || testResults.results[selectedTestCaseIndex].expected_output}
                            </pre>
                          </div>
                          <div>
                            <div className="text-[11px] font-semibold text-neutral-400 mb-1">Your Output:</div>
                            <pre
                              className={`p-2 rounded bg-black/60 font-mono text-[11px] overflow-x-auto ${
                                testResults.results[selectedTestCaseIndex].passed
                                  ? 'text-emerald-400'
                                  : 'text-rose-400'
                              }`}
                            >
                              {testResults.results[selectedTestCaseIndex].actualOutput || testResults.results[selectedTestCaseIndex].actual_output || '(empty)'}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[11px] text-neutral-400">Sample test cases provided for this problem:</p>
                <div className="flex items-center gap-1.5">
                  {sampleTestCases.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onSelectTestCaseIndex && onSelectTestCaseIndex(idx)}
                      className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium border transition-colors ${
                        selectedTestCaseIndex === idx
                          ? 'bg-neutral-800 text-white border-neutral-600'
                          : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      Case {idx + 1}
                    </button>
                  ))}
                </div>

                {sampleTestCases[selectedTestCaseIndex] && (
                  <div className="bg-[#121212] border border-neutral-800 rounded-lg p-3 text-xs space-y-2">
                    <div>
                      <div className="text-[11px] font-semibold text-neutral-400 mb-1">Input:</div>
                      <pre className="p-2 rounded bg-black/60 text-neutral-300 font-mono text-[11px] overflow-x-auto">
                        {sampleTestCases[selectedTestCaseIndex].input}
                      </pre>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-neutral-400 mb-1">Expected Output:</div>
                      <pre className="p-2 rounded bg-black/60 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                        {sampleTestCases[selectedTestCaseIndex].expectedOutput || sampleTestCases[selectedTestCaseIndex].output || sampleTestCases[selectedTestCaseIndex].expected_output}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default ConsolePanel;
