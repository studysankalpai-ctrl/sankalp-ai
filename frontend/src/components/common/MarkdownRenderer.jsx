import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Safe markdown pre-cleaner that fixes collapsed AI table rows, cleans up
 * raw mathematical LaTeX artifacts into human-readable Unicode symbols,
 * and ensures proper GFM Markdown formatting (tables, lists, headings).
 */
function cleanMarkdown(text) {
  if (!text || typeof text !== 'string') return '';
  let clean = text;

  // 1. Remove LaTeX \boxed{...} wrappers
  clean = clean.replace(/\\boxed\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, '$1');

  // 2. Clean up raw bracketed math lines like "[ a\cdot b ... ]" or "\[ ... \]"
  clean = clean.replace(/^\[\s*\\boxed\{?([^\]]+)\}?\s*\]$/gm, '$1');
  clean = clean.replace(/^\[\s*([\s\S]*?)\s*\]$/gm, (match, inner) => {
    if (inner.includes('\\') || inner.includes('=') || inner.includes('+') || inner.includes('·') || inner.includes('*')) {
      return `> **Formula:** ${inner.trim()}`;
    }
    return match;
  });

  // 3. Convert LaTeX math symbols to clear, universally readable Unicode
  clean = clean
    .replace(/\\cdot/g, ' · ')
    .replace(/\\times/g, ' × ')
    .replace(/\\div/g, ' ÷ ')
    .replace(/\\pm/g, ' ± ')
    .replace(/\\neq/g, ' ≠ ')
    .replace(/\\leq?/g, ' ≤ ')
    .replace(/\\geq?/g, ' ≥ ')
    .replace(/\\forall/g, ' ∀ ')
    .replace(/\\exists/g, ' ∃ ')
    .replace(/\\in\b/g, ' ∈ ')
    .replace(/\\notin\b/g, ' ∉ ')
    .replace(/\\subset\b/g, ' ⊂ ')
    .replace(/\\subseteq\b/g, ' ⊆ ')
    .replace(/\\cup\b/g, ' ∪ ')
    .replace(/\\cap\b/g, ' ∩ ')
    .replace(/\\rightarrow|\\to\b/g, ' ➔ ')
    .replace(/\\leftarrow/g, ' ← ')
    .replace(/\\implies/g, ' ⟹ ')
    .replace(/\\iff/g, ' ⟺ ')
    .replace(/\\infty/g, ' ∞ ')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)');

  // 4. Clean messy comma/semicolon artifacts like "(R,;+,;;;\cdot,;0,;1)"
  clean = clean.replace(/[,;]{2,}/g, ', ');
  clean = clean.replace(/\s*,\s*;\s*/g, ', ');

  // 5. Fix collapsed table rows: whenever a closing pipe is followed by an opening pipe on the same line
  // e.g. "... | | Next Row |" or "...---| | Next Row |"
  clean = clean.replace(/\|\s*\|\s*/g, '|\n| ');

  // 6. Remove accidental double-newlines between table rows so table is not severed into separate paragraphs
  clean = clean.replace(/\|\n\n+(\|\s*)/g, '|\n$1');

  // 7. Ensure a blank line before table starts if preceded by non-table text
  clean = clean.replace(/([^\n|])\n+(\|(?:\s*[^|\n]+\s*\|)+)/g, '$1\n\n$2');

  // 8. Ensure headings have a blank line before them if preceded by text
  clean = clean.replace(/([^\n])\n+(#{1,6}\s+)/g, '$1\n\n$2');

  // 9. Ensure bullet lists have a blank line before them if preceded by a paragraph
  clean = clean.replace(/([^\n\-*•\d])\n+([-*•]\s+)/g, '$1\n\n$2');

  return clean;
}

/**
 * Universal Markdown Renderer for SANKALP AI
 * Renders rich text, tables, headings, bold text, bullet points, blockquotes, and code seamlessly.
 */
export default function MarkdownRenderer({ content, className = '' }) {
  const sanitized = useMemo(() => cleanMarkdown(content), [content]);

  if (!sanitized) return null;

  return (
    <div className={`prose-custom ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs">
              <table {...props} className="w-full text-left text-[0.9em] border-collapse" />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead {...props} className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold uppercase tracking-wider text-[0.82em]" />
          ),
          th: ({ node, ...props }) => (
            <th
              {...props}
              className="px-3.5 py-2.5 font-bold border-b border-r last:border-r-0 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          ),
          tbody: ({ node, ...props }) => (
            <tbody {...props} className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900/60" />
          ),
          tr: ({ node, ...props }) => (
            <tr {...props} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors" />
          ),
          td: ({ node, ...props }) => (
            <td
              {...props}
              className="px-3.5 py-2.5 border-r last:border-r-0 border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 leading-relaxed text-[0.95em]"
            />
          ),
          h1: ({ node, ...props }) => (
            <h1 {...props} className="text-[1.4em] font-bold text-gray-900 dark:text-gray-100 mt-4 mb-2 pb-1.5 border-b border-gray-200 dark:border-gray-800" />
          ),
          h2: ({ node, ...props }) => (
            <h2 {...props} className="text-[1.25em] font-bold text-gray-900 dark:text-gray-100 mt-3.5 mb-2 pb-1 border-b border-gray-200 dark:border-gray-800" />
          ),
          h3: ({ node, ...props }) => (
            <h3 {...props} className="text-[1.12em] font-bold text-indigo-600 dark:text-indigo-400 mt-3 mb-1.5" />
          ),
          h4: ({ node, ...props }) => (
            <h4 {...props} className="text-[1.02em] font-bold text-gray-800 dark:text-gray-200 mt-2 mb-1" />
          ),
          p: ({ node, ...props }) => (
            <p {...props} className="mb-2.5 leading-relaxed text-gray-800 dark:text-gray-200 text-[1em]" />
          ),
          ul: ({ node, ...props }) => (
            <ul {...props} className="list-disc pl-5 my-2.5 space-y-1.5 text-gray-800 dark:text-gray-200 text-[1em]" />
          ),
          ol: ({ node, ...props }) => (
            <ol {...props} className="list-decimal pl-5 my-2.5 space-y-1.5 text-gray-800 dark:text-gray-200 text-[1em]" />
          ),
          li: ({ node, ...props }) => (
            <li {...props} className="leading-relaxed" />
          ),
          strong: ({ node, ...props }) => (
            <strong {...props} className="font-bold text-gray-900 dark:text-white" />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              {...props}
              className="border-l-4 border-indigo-500 dark:border-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/30 px-3.5 py-2.5 my-2.5 rounded-r-xl text-[0.95em] text-indigo-900 dark:text-indigo-200 italic"
            />
          ),
          hr: ({ node, ...props }) => (
            <hr {...props} className="my-4 border-t border-gray-200 dark:border-gray-800" />
          ),
          code: ({ node, className, children, ...props }) => {
            const isMultiLine = String(children).includes('\n');
            if (isMultiLine) {
              return (
                <pre className="bg-gray-950 text-gray-100 p-4 rounded-xl overflow-x-auto my-3 text-[0.88em] font-mono border border-gray-800 leading-normal">
                  <code {...props}>{children}</code>
                </pre>
              );
            }
            return (
              <code
                {...props}
                className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[0.88em] font-mono text-indigo-600 dark:text-indigo-400 border border-gray-200 dark:border-gray-700"
              >
                {children}
              </code>
            );
          },
        }}
      >
        {sanitized}
      </ReactMarkdown>
    </div>
  );
}
