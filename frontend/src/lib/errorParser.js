/**
 * SANKALP AI - Compiler Error Parser for Monaco Editor
 * Parses stderr/compile_output into line-specific Monaco markers.
 */

export function parseCompilerErrors(errorText, language) {
  if (!errorText || typeof errorText !== 'string') return [];

  const markers = [];
  const lines = errorText.split('\n');

  // Regex patterns by compiler/language
  // 1. C & C++ (GCC / G++): "main.c:8:5: error: ..." or "main.cpp:12:10: warning: ..."
  const gccRegex = /(?:[a-zA-Z0-9_\-\.]+):(\d+):(\d+):\s*(?:fatal\s+)?(error|warning|note):\s*(.+)/;

  // 2. Python: 'File "...", line 12' followed by error type
  const pythonLineRegex = /File\s+"(?:[^"]*)",\s+line\s+(\d+)/;

  // 3. Java (javac): "Main.java:8: error: ..."
  const javaRegex = /(?:[a-zA-Z0-9_\-\.]+):(\d+):\s*(error|warning):\s*(.+)/;

  // 4. TypeScript (tsc): "main.ts:8:5 - error TS2304: ..."
  const tsRegex = /(?:[a-zA-Z0-9_\-\.]+):(\d+):(\d+)\s*-\s*(error|warning)\s*(?:TS\d+)?:\s*(.+)/;

  if (language === 'c' || language === 'cpp') {
    for (const line of lines) {
      const match = gccRegex.exec(line);
      if (match) {
        const lineNum = parseInt(match[1], 10);
        const colNum = parseInt(match[2], 10);
        const type = match[3].toLowerCase();
        const msg = match[4].trim();

        markers.push({
          startLineNumber: lineNum,
          startColumn: colNum,
          endLineNumber: lineNum,
          endColumn: colNum + 15,
          message: msg,
          severity: type === 'warning' ? 4 : 8, // 4 = Warning, 8 = Error in Monaco
        });
      }
    }
  } else if (language === 'python') {
    let lastLineNum = null;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = pythonLineRegex.exec(line);
      if (match) {
        lastLineNum = parseInt(match[1], 10);
      } else if (lastLineNum !== null && /^[A-Z][a-zA-Z0-9_]*Error:/.test(line.trim())) {
        markers.push({
          startLineNumber: lastLineNum,
          startColumn: 1,
          endLineNumber: lastLineNum,
          endColumn: 100,
          message: line.trim(),
          severity: 8,
        });
        lastLineNum = null;
      }
    }
  } else if (language === 'java') {
    for (const line of lines) {
      const match = javaRegex.exec(line);
      if (match) {
        const lineNum = parseInt(match[1], 10);
        const type = match[2].toLowerCase();
        const msg = match[3].trim();

        markers.push({
          startLineNumber: lineNum,
          startColumn: 1,
          endLineNumber: lineNum,
          endColumn: 80,
          message: msg,
          severity: type === 'warning' ? 4 : 8,
        });
      }
    }
  } else if (language === 'typescript' || language === 'javascript') {
    for (const line of lines) {
      const match = tsRegex.exec(line) || gccRegex.exec(line);
      if (match) {
        const lineNum = parseInt(match[1], 10);
        const colNum = parseInt(match[2], 10);
        const type = (match[3] || 'error').toLowerCase();
        const msg = (match[4] || line).trim();

        markers.push({
          startLineNumber: lineNum,
          startColumn: colNum,
          endLineNumber: lineNum,
          endColumn: colNum + 15,
          message: msg,
          severity: type === 'warning' ? 4 : 8,
        });
      }
    }
  }

  return markers;
}
