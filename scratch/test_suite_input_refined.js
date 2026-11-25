// Updated with i = j - 1 advance
function analyzeCodeInputsRefined(code = '', language = 'python') {
  if (!code) return { expectedCount: 0, prompts: [], dynamicLoop: null };

  const prompts = [];
  let expectedCount = 0;
  let dynamicLoop = null;
  const lines = code.split('\n');

  if (language === 'python') {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check for loop: for i in range(n) or for i in range(5) or for i in range(1, 6)
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

        i = lastBodyIndex; // skip loop body lines

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

      // Check for assignment like: n = int(input(...))
      const assignMatch = line.match(/^([a-zA-Z_]\w*)\s*=\s*(?:int|float|str)?\s*\(?\s*input\s*\(\s*(?:f|r|b)?["']([^"'\\]*(?:\\.[^"'\\]*)*)["']/);
      if (assignMatch) {
        const promptText = assignMatch[2].trim();
        expectedCount++;
        prompts.push(promptText);
        continue;
      }

      // Check standard input("...") outside loop
      const pyInputMatch = line.match(/input\s*\(\s*(?:f|r|b)?["']([^"'\\]*(?:\\.[^"'\\]*)*)["']\s*\)/);
      if (pyInputMatch) {
        expectedCount++;
        prompts.push(pyInputMatch[1].trim());
      } else if (line.includes('input(')) {
        expectedCount++;
        prompts.push('');
      }
    }
  }

  return { expectedCount, prompts, dynamicLoop };
}

const userPy = `arr = []

try:
    n = int(input("Enter number of elements: "))
    
    if n <= 0:
        print("Please enter a positive number.")
    else:
        for i in range(n):
            value = int(input(f"Enter element {i + 1}: "))
            arr.append(value)
`;

const res1 = analyzeCodeInputsRefined(userPy, 'python');
console.log('--- TEST 1: User Python Code ---');
console.log('Expected:', res1.expectedCount);
console.log('Prompts:', res1.prompts);
console.log('Dynamic Loop:', res1.dynamicLoop);

const constPy = `for i in range(3):
    x = int(input(f"Enter number {i + 1}: "))
`;
const res2 = analyzeCodeInputsRefined(constPy, 'python');
console.log('\n--- TEST 2: Constant range(3) ---');
console.log('Expected:', res2.expectedCount);
console.log('Prompts:', res2.prompts);
