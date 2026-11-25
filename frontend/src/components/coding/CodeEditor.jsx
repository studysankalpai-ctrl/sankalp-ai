import React, { useRef, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Loader2, Sparkles, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { parseCompilerErrors } from '../../lib/errorParser';
import useAppStore from '../../store/appStore';

// Language identifier mapping for Monaco Editor
const MONACO_LANG_MAP = {
  c: 'c',
  cpp: 'cpp',
  python: 'python',
  java: 'java',
  javascript: 'javascript',
  typescript: 'typescript',
};

export default function CodeEditor({
  language = 'python',
  code = '',
  onChange,
  onRun,
  onSubmit,
  errorText = '',
  readOnly = false,
  fontSize = 14,
}) {
  const { darkMode } = useAppStore();
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const monacoLanguage = MONACO_LANG_MAP[language] || 'plaintext';

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // 1. Dark Theme (AMOLED)
    monaco.editor.defineTheme('sankalp-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: '', background: '0a0a0a', foreground: 'e4e4e7' },
        { token: 'comment', foreground: '71717a', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c084fc', fontStyle: 'bold' },
        { token: 'string', foreground: '4ade80' },
        { token: 'number', foreground: 'f59e0b' },
        { token: 'type', foreground: '60a5fa' },
        { token: 'function', foreground: '38bdf8' },
        { token: 'delimiter', foreground: 'a1a1aa' },
      ],
      colors: {
        'editor.background': '#0a0a0a',
        'editor.foreground': '#e4e4e7',
        'editor.lineHighlightBackground': '#141414',
        'editorLineNumber.foreground': '#52525b',
        'editorLineNumber.activeForeground': '#fafafa',
        'editorCursor.foreground': '#818cf8',
        'editor.selectionBackground': '#27272a88',
        'editor.inactiveSelectionBackground': '#27272a44',
        'editorBracketMatch.background': '#3f3f4655',
        'editorBracketMatch.border': '#818cf8',
        'editorGutter.background': '#0a0a0a',
      },
    });

    // 2. Light Theme (Crisp & Clean)
    monaco.editor.defineTheme('sankalp-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: '', background: 'ffffff', foreground: '1e293b' },
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: '7c3aed', fontStyle: 'bold' },
        { token: 'string', foreground: '16a34a' },
        { token: 'number', foreground: 'd97706' },
        { token: 'type', foreground: '2563eb' },
        { token: 'function', foreground: '0284c7' },
        { token: 'delimiter', foreground: '475569' },
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#1e293b',
        'editor.lineHighlightBackground': '#f8fafc',
        'editorLineNumber.foreground': '#94a3b8',
        'editorLineNumber.activeForeground': '#0f172a',
        'editorCursor.foreground': '#6366f1',
        'editor.selectionBackground': '#e0e7ff',
        'editor.inactiveSelectionBackground': '#f1f5f9',
        'editorBracketMatch.background': '#e2e8f0',
        'editorBracketMatch.border': '#6366f1',
        'editorGutter.background': '#ffffff',
      },
    });

    monaco.editor.setTheme(darkMode ? 'sankalp-dark' : 'sankalp-light');

    // Register keyboard shortcuts
    // Ctrl+Enter / Cmd+Enter => Run Code
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRun) onRun();
    });

    // Ctrl+Shift+Enter / Cmd+Shift+Enter => Submit Solution
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
      if (onSubmit) onSubmit();
    });
  };

  // Sync theme when user toggles light/dark mode in app
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(darkMode ? 'sankalp-dark' : 'sankalp-light');
    }
  }, [darkMode]);

  // Sync compiler error markers to Monaco model
  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        if (errorText && errorText.trim().length > 0) {
          const markers = parseCompilerErrors(errorText, language);
          monacoRef.current.editor.setModelMarkers(model, 'compiler', markers);
        } else {
          monacoRef.current.editor.setModelMarkers(model, 'compiler', []);
        }
      }
    }
  }, [errorText, language]);

  const handleCopyCode = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleFormatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
      toast.success('Code formatted');
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-neutral-800/80 overflow-hidden shadow-sm dark:shadow-2xl">
      {/* Editor Sub-header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 dark:bg-[#121212] border-b border-gray-200 dark:border-neutral-800/80 text-xs text-gray-500 dark:text-neutral-400 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70 inline-block" />
          <span className="ml-2 font-mono uppercase font-semibold text-gray-700 dark:text-neutral-300 text-[11px] tracking-wider">
            {language}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFormatCode}
            title="Auto Format Document (Alt+Shift+F)"
            className="px-2 py-0.5 rounded text-[11px] text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
            <span className="hidden sm:inline">Format</span>
          </button>
          <button
            type="button"
            onClick={handleCopyCode}
            title="Copy Code"
            className="px-2 py-0.5 rounded text-[11px] text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 w-full h-full min-h-0 relative">
        <Editor
          height="100%"
          language={monacoLanguage}
          value={code}
          onChange={(val) => onChange && onChange(val || '')}
          onMount={handleEditorDidMount}
          theme={darkMode ? 'sankalp-dark' : 'sankalp-light'}
          loading={
            <div className="w-full h-full flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] text-gray-500 dark:text-neutral-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="text-xs font-mono">Initializing Monaco Editor...</span>
            </div>
          }
          options={{
            readOnly,
            fontSize,
            fontFamily: "'Fira Code', 'JetBrains Mono', Menlo, Monaco, Consolas, monospace",
            fontLigatures: true,
            tabSize: language === 'python' ? 4 : 2,
            insertSpaces: true,
            lineNumbers: 'on',
            lineNumbersMinChars: 3,
            lineDecorationsWidth: 10,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            wrappingIndent: 'indent',
            automaticLayout: true,
            bracketPairColorization: { enabled: true },
            autoClosingBrackets: 'always',
            autoClosingQuotes: 'always',
            renderLineHighlight: 'all',
            padding: { top: 12, bottom: 12 },
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            contextmenu: true,
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
          }}
        />
      </div>
    </div>
  );
}
