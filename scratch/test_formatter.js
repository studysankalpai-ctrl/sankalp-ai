function interleavePromptsAndStdin(stdoutStr, stdinStr, code) {
  if (!stdoutStr || !stdinStr) return stdoutStr;

  // Extract string prompts from code
  const regex = /(?:printf\s*\(\s*|cout\s*<<\s*|System\.out\.print(?:ln)?\s*\(\s*|input\s*\(\s*)"([^"\\]*(?:\\.[^"\\]*)*)"/g;
  let match;
  const promptCandidates = [];
  while ((match = regex.exec(code)) !== null) {
    const raw = match[1] || '';
    const clean = raw.replace(/\\n/g, '').trim();
    if (clean.length >= 2 && !clean.includes('%d') && !clean.includes('%s') && !clean.includes('%f')) {
      promptCandidates.push(clean);
    }
  }

  const stdinClean = stdinStr.trim();
  const stdinTokens = stdinClean.split(/\s+/).filter(Boolean);
  if (promptCandidates.length === 0 || stdinTokens.length === 0) {
    return stdoutStr;
  }

  // Find prompts present in stdout
  const activePrompts = promptCandidates.filter(p => stdoutStr.includes(p));
  if (activePrompts.length === 0) {
    return stdoutStr;
  }

  let remainingStdout = stdoutStr;
  const segments = [];
  let tokenIdx = 0;

  for (let i = 0; i < activePrompts.length; i++) {
    const p = activePrompts[i];
    const pos = remainingStdout.indexOf(p);
    if (pos !== -1) {
      const prefix = remainingStdout.slice(0, pos).trim();
      if (prefix) {
        segments.push(prefix);
      }
      
      const isLast = (i === activePrompts.length - 1);
      const val = isLast ? stdinTokens.slice(tokenIdx).join(' ') : (stdinTokens[tokenIdx++] || '');
      segments.push(`${p} ${val}`.trim());
      remainingStdout = remainingStdout.slice(pos + p.length);
    }
  }

  if (remainingStdout.trim()) {
    segments.push(remainingStdout.trim());
  }

  return segments.join('\n');
}

// User exact case:
const userCode = `#include <stdio.h>
int main() {
    int a,b;
    int c;
    printf("Enter Two Numbers");
    scanf("%d %d",&a,&b);
    c=a+b;
    printf("Sum Of Values = %d",c);
}`;

console.log(interleavePromptsAndStdin(
  "Enter Two NumbersSum Of Values = 30",
  "10\n20",
  userCode
));
