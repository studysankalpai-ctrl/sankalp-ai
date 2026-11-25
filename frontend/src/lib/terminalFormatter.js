/**
 * Traditional Interactive Terminal Formatter for Sankalp Coding Lab
 * Emulates the exact step-by-step TTY terminal experience (like Command Prompt, Turbo C, Bash).
 * Input is taken inline, prompt-by-prompt and scan-by-scan.
 */

/**
 * Checks if code contains input statements
 */
export function codeExpectsInput(code = '', language = '') {
  if (!code) return false;
  return /(?:scanf\s*\(|cin\s*>>|getchar\s*\(|gets\s*\(|fgets\s*\(|readline|readLine|\.next(?:Line|Int|Double|Float|Long|Byte|Short|Boolean)?\s*\(|input\s*\(|sys\.stdin)/i.test(code);
}

/**
 * Analyzes code to extract sequential prompts and expected input count.
 * Handles sequential print-input chains and bounded for-loops (e.g. for (int i = 1; i <= 5; i++)).
 */
export function analyzeCodeInputs(code = '', language = 'c') {
  if (!code) return { expectedCount: 0, prompts: [], dynamicLoop: null };

  const prompts = [];
  let expectedCount = 0;
  let dynamicLoop = null;
  const lines = code.split('\n');

  if (language === 'java') {
    let currentPrompt = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check for for-loop: for (int i = 1; i <= 5; i++) or for (int i = 0; i < n; i++)
      const loopMatch = line.match(/for\s*\(\s*(?:int\s+)?([a-zA-Z_]\w*)\s*=\s*(\d+)\s*;\s*\1\s*(<=|<)\s*(\d+|[a-zA-Z_]\w*)\s*;\s*[^)]+\)/);
      if (loopMatch) {
        const varName = loopMatch[1];
        const start = parseInt(loopMatch[2], 10);
        const op = loopMatch[3];
        const endStr = loopMatch[4];
        const isConst = /^\d+$/.test(endStr);

        let loopBody = '';
        let braceDepth = 0;
        let foundStart = false;

        for (let j = i; j < lines.length; j++) {
          const l = lines[j];
          for (const char of l) {
            if (char === '{') {
              braceDepth++;
              foundStart = true;
            } else if (char === '}') {
              braceDepth--;
            }
          }
          loopBody += l + '\n';
          if (foundStart && braceDepth === 0) {
            i = j;
            break;
          }
        }

        const innerPrintMatch = loopBody.match(/System\.out\.print(?:ln)?\s*\(\s*["']([^"']*)["'](?:\s*\+\s*([a-zA-Z_]\w*)\s*\+\s*["']([^"']*)["'])?/);
        let basePrompt = '';
        let hasVar = false;
        let suffix = '';

        if (innerPrintMatch) {
          basePrompt = innerPrintMatch[1];
          if (innerPrintMatch[2] === varName) {
            hasVar = true;
            suffix = innerPrintMatch[3] || '';
          }
        }

        const innerInputMatches = loopBody.match(/\b(?:sc|scanner)\.next(?:Line|Int|Double|Float|Long|Byte|Short)?\s*\(/gi);
        const inputsPerIter = innerInputMatches ? innerInputMatches.length : 1;

        if (isConst) {
          const end = parseInt(endStr, 10);
          const count = op === '<=' ? (end - start + 1) : (end - start);
          expectedCount += count * inputsPerIter;

          for (let k = start; op === '<=' ? k <= end : k < end; k++) {
            if (hasVar) {
              prompts.push(`${basePrompt}${k}${suffix}`.trim());
            } else if (basePrompt) {
              prompts.push(`${basePrompt} (${k})`.trim());
            } else {
              prompts.push(`Element ${k}:`);
            }
          }
        } else {
          dynamicLoop = {
            loopVar: varName,
            limitVar: endStr,
            startVal: start,
            template: hasVar ? `${basePrompt}{${varName}}${suffix}` : (basePrompt || 'Element {i + 1}:'),
          };
        }

        continue;
      }

      // Check normal print statement outside loop:
      const printMatch = line.match(/System\.out\.print(?:ln)?\s*\(\s*["']([^"'\\]*(?:\\.[^"'\\]*)*)["']/);
      if (printMatch) {
        const pText = printMatch[1].replace(/\\n/g, '').trim();
        if (!line.includes('RESULT') && !line.includes('Invalid') && !line.includes('Please provide') && !line.includes('Error')) {
          currentPrompt = pText;
        }
      }

      // Check input statement outside loop:
      const inputMatch = line.match(/\b(?:sc|scanner)\.next(?:Line|Int|Double|Float|Long|Byte|Short)?\s*\(/i);
      if (inputMatch) {
        expectedCount++;
        if (currentPrompt) {
          prompts.push(currentPrompt);
          currentPrompt = '';
        }
      }
    }
  } else if (language === 'c' || language === 'cpp') {
    let currentPrompt = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check for for-loop: constant or variable limit
      const loopMatch = line.match(/for\s*\(\s*(?:int\s+)?([a-zA-Z_]\w*)\s*=\s*(\d+)\s*;\s*\1\s*(<=|<)\s*(\d+|[a-zA-Z_]\w*)\s*;\s*[^)]+\)/);
      if (loopMatch) {
        const varName = loopMatch[1];
        const start = parseInt(loopMatch[2], 10);
        const op = loopMatch[3];
        const endStr = loopMatch[4];
        const isConst = /^\d+$/.test(endStr);

        let loopBody = '';
        let braceDepth = 0;
        let foundStart = false;

        for (let j = i; j < lines.length; j++) {
          const l = lines[j];
          for (const char of l) {
            if (char === '{') {
              braceDepth++;
              foundStart = true;
            } else if (char === '}') {
              braceDepth--;
            }
          }
          loopBody += l + '\n';
          if (foundStart && braceDepth === 0) {
            i = j;
            break;
          }
        }

        const innerPrintMatch = loopBody.match(/(?:printf|cout\s*<<)\s*\(?\s*["']([^"']*)["']/);
        let basePrompt = innerPrintMatch ? innerPrintMatch[1].replace(/%d/g, '').replace(/\\n/g, '').trim() : '';

        let inputsPerIter = 1;
        const scanfMatch = loopBody.match(/scanf\s*\(\s*["']([^"']*)["']/);
        if (scanfMatch) {
          const specs = scanfMatch[1].match(/%[a-zA-Z]/g);
          if (specs) inputsPerIter = specs.length;
        } else {
          const cinMatch = loopBody.match(/>>\s*[a-zA-Z0-9_\[\]]+/g);
          if (cinMatch) inputsPerIter = cinMatch.length;
        }

        if (isConst) {
          const end = parseInt(endStr, 10);
          const count = op === '<=' ? (end - start + 1) : (end - start);
          expectedCount += count * inputsPerIter;

          for (let k = start; op === '<=' ? k <= end : k < end; k++) {
            prompts.push(basePrompt ? `${basePrompt} ${k}:` : `Element ${k}:`);
          }
        } else {
          dynamicLoop = {
            loopVar: varName,
            limitVar: endStr,
            startVal: start,
            template: basePrompt ? `${basePrompt} {${varName} + 1}:` : 'Element {i + 1}:',
          };
        }

        continue;
      }

      // Check normal printf/cout outside loop:
      const printMatch = line.match(/(?:printf|cout\s*<<)\s*\(?\s*["']([^"'\\]*(?:\\.[^"'\\]*)*)["']/);
      if (printMatch) {
        const pText = printMatch[1].replace(/\\n/g, '').trim();
        const hasOnlyFormat = /^%[a-zA-Z0-9\s]+$/.test(pText);
        if (!hasOnlyFormat && !line.includes('Result') && !line.includes('Sum Of') && !line.includes('Total')) {
          currentPrompt = pText;
        }
      }

      // Check scanf or cin outside loop:
      const scanfMatch = line.match(/scanf\s*\(\s*["']([^"']*)["']/);
      if (scanfMatch) {
        const specs = scanfMatch[1].match(/%[a-zA-Z]/g);
        const count = specs ? specs.length : 1;
        expectedCount += count;
        if (currentPrompt) {
          prompts.push(currentPrompt);
          currentPrompt = '';
        }
      } else {
        const cinMatch = line.match(/>>\s*[a-zA-Z0-9_\[\]]+/g);
        if (cinMatch) {
          expectedCount += cinMatch.length;
          if (currentPrompt) {
            prompts.push(currentPrompt);
            currentPrompt = '';
          }
        }
      }
    }
  } else if (language === 'python') {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check for Python loop: for i in range(n) or for i in range(5) or for i in range(1, 6)
      const rangeMatch = line.match(/for\s+([a-zA-Z_]\w*)\s+in\s+range\s*\(\s*(?:(\d+)\s*,\s*)?([a-zA-Z0-9_]+)\s*\)/);
      if (rangeMatch) {
        const loopVar = rangeMatch[1];
        const startVal = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : 0;
        const limitStr = rangeMatch[3];
        const isConstLimit = /^\d+$/.test(limitStr);

        let loopPromptTemplate = '';
        let hasLoopInput = false;
        let lastBodyIndex = i;

        for (let j = i + 1; j < lines.length; j++) {
          const bodyLine = lines[j];
          if (!bodyLine.startsWith(' ') && !bodyLine.startsWith('\t') && bodyLine.trim().length > 0) {
            break;
          }
          lastBodyIndex = j;
          const bodyInputMatch = bodyLine.match(/input\s*\(\s*(?:f|r|b)?["']([^"'\\]*(?:\\.[^"'\\]*)*)["']/);
          if (bodyInputMatch) {
            hasLoopInput = true;
            loopPromptTemplate = bodyInputMatch[1].trim();
          } else if (bodyLine.includes('input(')) {
            hasLoopInput = true;
            loopPromptTemplate = '';
          }
        }

        i = lastBodyIndex; // skip past loop body lines to prevent duplicate matches

        if (hasLoopInput) {
          if (isConstLimit) {
            const endVal = parseInt(limitStr, 10);
            const count = endVal - startVal;
            expectedCount += count;
            for (let k = startVal; k < endVal; k++) {
              let p = loopPromptTemplate;
              if (p) {
                p = p.replace(new RegExp(`\\{\\s*${loopVar}\\s*\\+\\s*1\\s*\\}`, 'g'), String(k + 1));
                p = p.replace(new RegExp(`\\{\\s*${loopVar}\\s*\\}`, 'g'), String(k));
                prompts.push(p);
              } else {
                prompts.push(`Element ${k + 1}:`);
              }
            }
          } else {
            dynamicLoop = {
              loopVar,
              limitVar: limitStr,
              startVal,
              template: loopPromptTemplate,
            };
          }
        }
        continue;
      }

      // Check for assignment: n = int(input(...))
      const assignMatch = line.match(/^([a-zA-Z_]\w*)\s*=\s*(?:int|float|str)?\s*\(?\s*input\s*\(\s*(?:f|r|b)?["']([^"'\\]*(?:\\.[^"'\\]*)*)["']/);
      if (assignMatch) {
        const promptText = assignMatch[2].trim();
        expectedCount++;
        prompts.push(promptText);
        continue;
      }

      // Check standard input("prompt") outside loop (including f-strings: input(f"...") or input('...'))
      const pyInputMatch = line.match(/input\s*\(\s*(?:f|r|b)?["']([^"'\\]*(?:\\.[^"'\\]*)*)["']\s*\)/);
      if (pyInputMatch) {
        expectedCount++;
        prompts.push(pyInputMatch[1].trim());
      } else if (line.includes('input(')) {
        // Plain input() without string prompt - do NOT push "Enter input:"!
        expectedCount++;
        prompts.push('');
      }
    }
  }

  // Safety fallback
  if (expectedCount === 0 && codeExpectsInput(code, language)) {
    expectedCount = 1;
  }

  return { expectedCount, prompts, dynamicLoop };
}

/**
 * Robustly removes prompt strings from the program's raw stdout so only the resultant output is displayed
 */
export function extractProgramOutput(rawStdout = '', prompts = []) {
  if (!rawStdout) return '';
  let cleaned = rawStdout;

  for (const p of prompts) {
    if (!p) continue;
    if (cleaned.includes(p)) {
      cleaned = cleaned.replace(p, '');
    } else {
      const pNorm = p.replace(/\s+/g, ' ').trim();
      if (pNorm) {
        const escaped = pNorm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const reg = new RegExp(escaped, 'i');
        cleaned = cleaned.replace(reg, '');
      }
    }
  }

  cleaned = cleaned.trim();
  // Safe fallback: never suppress output if cleaned is empty but rawStdout had real text
  return cleaned || rawStdout.trim();
}

/**
 * Returns terminal executable command for the language
 */
export function getTerminalCommand(language = 'c') {
  switch (language) {
    case 'c':
    case 'cpp':
      return './main';
    case 'python':
      return 'python3 main.py';
    case 'java':
      return 'java Main';
    case 'javascript':
      return 'node main.js';
    case 'typescript':
      return 'ts-node main.ts';
    default:
      return './run';
  }
}
