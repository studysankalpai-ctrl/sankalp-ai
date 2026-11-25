/**
 * SANKALP AI - Autonomous University Examination Preparation Platform
 * Coding Practice Lab AI Tutor & Diagnostic Engine
 * 
 * Features:
 * 1. AI Code Explainer: Line-by-line clear explanation in simple language.
 * 2. AI Debugger: Identifies runtime, syntax, or logic errors with actionable fixes.
 * 3. AI Complexity Analyzer: Computes Big-O Time & Space complexity with bottle-neck analysis.
 * 4. AI Progressive Hints: Multi-stage guided hints without revealing the full solution.
 * 5. AI Solution Explanation: Optimal pattern analysis, data structures, and edge cases.
 * 6. AI Custom Doubt: Answers student questions directly regarding their code.
 */

const { chatCompletion } = require('./groqService');

function extractContent(res) {
  if (!res) return '';
  if (typeof res === 'string') return res;
  if (typeof res === 'object' && res.content) return res.content;
  return String(res);
}

/**
 * 1. AI Code Explainer
 */
async function explainCode({ apiKey, model, code, language, problemTitle }) {
  const systemPrompt = `You are "Sankalp AI Code Mentor", an expert computer science professor who explains code with crystal clarity.
Your goal is to explain the provided ${language.toUpperCase()} code line-by-line or section-by-section in simple, intuitive terms.

Formatting Guidelines:
- Break down the code into logical steps.
- Explain what each key variable, function, loop, and condition does in plain language.
- Mention the underlying data structures being used.
- Add a brief 1-line summary at the end.
- Use clean Markdown with bold keywords and small code snippets.`;

  const userPrompt = `${problemTitle ? `Problem: ${problemTitle}\n\n` : ''}Language: ${language}\n\nCode to Explain:\n\`\`\`${language}\n${code}\n\`\`\``;

  const res = await chatCompletion({
    apiKey,
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
  });
  return extractContent(res);
}

/**
 * 2. AI Debugger
 */
async function debugCode({ apiKey, model, code, language, problemTitle, errorOutput, stdin, stdout }) {
  const systemPrompt = `You are "Sankalp AI Code Debugger", an expert software engineer and algorithm specialist.
Analyze the user's ${language.toUpperCase()} code and diagnose why it is failing or producing incorrect output.

Diagnostic Guidelines:
1. **Root Cause**: Pinpoint the exact line or logic flaw (e.g. Off-by-one, boundary condition, integer overflow, uninitialized pointer, wrong base case).
2. **Why It Failed**: Explain the runtime crash, compilation error, or logic error in simple terms.
3. **The Fix**: Show the precise code fix or correction without rewriting the entire program unnecessarily.
4. **Edge Cases to Watch**: List 1-2 tricky inputs that could cause issues.
Keep your explanation clear, encouraging, and focused directly on the bug.`;

  let userPrompt = `${problemTitle ? `Problem: ${problemTitle}\n\n` : ''}Language: ${language}\n\nSubmitted Code:\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;
  if (errorOutput) userPrompt += `Compiler / Error Output:\n\`\`\`\n${errorOutput}\n\`\`\`\n\n`;
  if (stdin) userPrompt += `Test Input:\n\`\`\`\n${stdin}\n\`\`\`\n\n`;
  if (stdout) userPrompt += `Actual Output Generated:\n\`\`\`\n${stdout}\n\`\`\`\n\n`;

  const res = await chatCompletion({
    apiKey,
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.2,
  });
  return extractContent(res);
}

/**
 * 3. AI Complexity Analyzer
 */
async function analyzeComplexity({ apiKey, model, code, language, problemTitle }) {
  const systemPrompt = `You are "Sankalp AI Complexity Specialist", an expert in Algorithmic Analysis & Big-O notation.
Analyze the Time and Space complexity of the provided ${language.toUpperCase()} code with formal proof and intuitive intuition.

Output Format:
1. **Time Complexity**: Formal Big-O (e.g. O(N log N)), with a step-by-step breakdown of loops, recursions, and helper functions.
2. **Space / Auxiliary Memory Complexity**: Formal Big-O (e.g. O(1) or O(N)), explaining stack frames, dynamic allocations, and collections.
3. **Bottleneck Analysis**: The most expensive operation in the code.
4. **Can it be optimized?**: State whether a better theoretical lower bound exists (e.g. from O(N²) to O(N log N) or O(N)).`;

  const userPrompt = `${problemTitle ? `Problem: ${problemTitle}\n\n` : ''}Language: ${language}\n\nCode to Analyze:\n\`\`\`${language}\n${code}\n\`\`\``;

  const res = await chatCompletion({
    apiKey,
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.2,
  });
  return extractContent(res);
}

/**
 * 4. AI Progressive Hints
 */
async function getHint({ apiKey, model, code, language, problem, hintLevel = 1 }) {
  const systemPrompt = `You are "Sankalp AI Socratic Coding Tutor".
Your goal is to guide students to discover the solution on their own through progressive hints.
NEVER write the full solution code in early hints!

Hint Levels:
- Level 1 (Nudge): Rephrase the problem intuitively or hint at the right data structure (e.g., "Think about how a HashMap can give you O(1) lookups instead of scanning twice.").
- Level 2 (Algorithm Idea): Outline the step-by-step strategy without full code (e.g., Two pointers, Sliding Window, Monotonic Stack).
- Level 3 (Implementation Details): Point out tricky edge cases, base cases, or loop termination conditions.

Current Request Level: Hint ${hintLevel} of 3.
Give ONLY the requested level hint clearly and concisely in 2-4 sentences.`;

  const userPrompt = `Problem: ${problem?.title || 'Coding Exercise'}\nDescription: ${problem?.description || 'Implement the algorithm efficiently'}\nConstraints: ${problem?.constraints || 'Standard'}\n\nStudent's Current ${language} Code:\n\`\`\`${language}\n${code || '// Empty code'}\n\`\`\`\n\nPlease give Hint #${hintLevel}.`;

  const res = await chatCompletion({
    apiKey,
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.4,
  });
  return extractContent(res);
}

/**
 * 5. AI Solution Explanation
 */
async function explainSolution({ apiKey, model, problem, language, code }) {
  const systemPrompt = `You are "Sankalp AI Algorithm Guide".
Your goal is to guide the student on HOW to solve this problem independently.
IMPORTANT INSTRUCTION: DO NOT provide full copy-paste solution code. The student must write the implementation themselves.

Structure your response:
1. **Core Pattern & Intuition**: Explain the algorithmic technique (e.g. Hash Map, Two Pointers, Greedy, Dynamic Programming) in simple, intuitive terms.
2. **Step-by-Step Algorithm**:
   - Step 1: What to initialize.
   - Step 2: What condition to check in loop/traversal.
   - Step 3: What to return or output.
3. **Corner Cases to Handle**: Mention 1-2 edge cases (empty inputs, duplicates, boundaries).
4. **Complexity Target**: Expected Time Complexity and Space Complexity.
5. **Encouraging Call to Action**: Encourage them to write the code in the editor and click Submit!`;

  const userPrompt = `Problem: ${problem?.title || 'Optimal Strategy'}
Difficulty: ${problem?.difficulty || 'General'}
Topic: ${problem?.topic || 'DSA Algorithms'}
Description:
${problem?.description || 'Algorithm analysis'}
Input Format: ${problem?.input_format || 'Standard'}
Output Format: ${problem?.output_format || 'Standard'}
Constraints: ${problem?.constraints || 'Standard'}
${code ? `\nStudent's Current Code:\n\`\`\`${language}\n${code}\n\`\`\`\n` : ''}

Please provide the complete optimal solution explanation in ${language.toUpperCase()}.`;

  const res = await chatCompletion({
    apiKey,
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
  });
  return extractContent(res);
}

/**
 * 6. AI Custom Doubt / Question
 */
async function askQuestion({ apiKey, model, code, language, problemTitle, question, errorOutput, stdout }) {
  const systemPrompt = `You are "Sankalp AI Code Mentor", a patient, friendly, and expert programming tutor.
Answer the student's specific question about their ${language.toUpperCase()} code accurately and concisely.
Use clean Markdown with bold points, explanations, and code snippets when helpful.
Keep your response directly answering their doubt without unnecessary fluff.`;

  let userPrompt = `${problemTitle ? `Problem: ${problemTitle}\n\n` : ''}Language: ${language}\n\nCode in Editor:\n\`\`\`${language}\n${code || '// Empty code'}\n\`\`\`\n\n`;
  if (errorOutput) userPrompt += `Compiler / Error Output:\n\`\`\`\n${errorOutput}\n\`\`\`\n\n`;
  if (stdout) userPrompt += `Console Output:\n\`\`\`\n${stdout}\n\`\`\`\n\n`;
  userPrompt += `Student Question: ${question || 'Please review and help me with this code.'}`;

  const res = await chatCompletion({
    apiKey,
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
  });
  return extractContent(res);
}

module.exports = {
  explainCode,
  debugCode,
  analyzeComplexity,
  getHint,
  explainSolution,
  askQuestion,
};
