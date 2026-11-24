import { jsPDF } from 'jspdf';
import { cleanMarkdownText, parseMarkdownBlocks, renderFormattedBlocks, drawPdfTable } from '../frontend/src/lib/pdfExport.js';

// Sample message similar to what caused the user's corrupted PDF
const sampleUserMessage = {
  role: 'user',
  content: `Explain Unit 1: Basics of programming, Basics of C thoroughly according to the official university syllabus.
Official Syllabus Topics to cover:
- Approaches to problem solving
- Algorithm and flowchart
- Basics of C: History, Features, Structure of C program, Tokens, Data types`
};

const sampleAiMessage = {
  role: 'assistant',
  content: `> Prescribed Reference: Let Us\u202FC by Yashavant\u202FKanetkar

---

# 1️⃣ COMPLETE OVERVIEW & CORE CONCEPT MAP - UNIT 1

\`\`\`
[Basics of Programming]
├── Approaches to problem solving
│   ├── High level language for systematic development
│   └── Algorithm & Flowchart
└── Structured programming
\`\`\`

The map shows two parallel pillars — the programming mindset on the left and the C language machinery on the right. Mastery of both lets you turn a real world problem into a working C program.

---

## 2. STEP BY STEP BREAKDOWN

### 2.1 Approaches to Problem Solving

💡 IN SIMPLE WORDS
Problem solving is the mental process of turning a real world need into a clear, step-by-step plan that a computer can execute.

🎯 REAL WORLD EVERYDAY ANALOGY
Think of planning a road trip: you first decide the destination, then list the cities to stop at, choose the best route, and finally drive. The plan you write on paper is the algorithm for the trip.

🏆 UNIVERSITY EXAM SCORING ANSWER
A systematic method for creating computer software that solves a specific user problem.
1. Understanding the problem: Identify inputs, required outputs, and constraints.
2. Devising an algorithm: Write pseudo-code or flowchart describing logical steps.
3. Testing & debugging: Run with sample data, fix errors, verify correctness.

Diagram:
\`\`\`
[Problem] -> [Analysis] -> [Algorithm] -> [C Code] -> [Compile & Run] -> [Result]
\`\`\`

⚡ Exam Pro Tip: Always state time complexity for algorithms in 10-mark answers.

| Comparison Metric | Low-Level Language | High-Level Language (C) |
|---|---|---|
| Portability | Hardware dependent, non-portable | Machine independent, highly portable |
| Programmer Productivity | Very tedious, manual register allocation | Fast development, rich standard library |
| Execution Speed | Maximum machine speed | Near assembly speed with optimizing compiler |

`
};

// Simulate PDF generation
const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4',
});

// Test parse blocks
const blocks = parseMarkdownBlocks(sampleAiMessage.content);
console.log('Parsed blocks count:', blocks.length);
blocks.forEach((b, idx) => {
  console.log(`Block ${idx + 1}: [${b.type}] ${b.text ? b.text.substring(0, 40) : (b.code ? 'Code snippet (' + b.code.length + ' chars)' : (b.headers ? b.headers.join(' | ') : ''))}`);
});

let y = 20;
y = renderFormattedBlocks(doc, blocks, y);
console.log('Final Y coordinate:', y);

// Save generated PDF to inspect
const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
const pdfString = pdfBuffer.toString('latin1');

// Check for corrupted strings
const badPatterns = [
  /1þ/,
  /Ø<ß¯/,
  /Ø=Ü¡/,
  /Ø=ÜÝ/,
  /&¡/,
  /%\s*%\s*%\s*%/,
  /\u0000[A-Za-z]\u0000/,
  /Let Us \/C/,
  /Yashavant \/Kanetkar/,
  /UNIT \/1/
];

let hasError = false;
badPatterns.forEach(pat => {
  if (pat.test(pdfString)) {
    console.error('FAIL: Found bad pattern in PDF:', pat);
    hasError = true;
  }
});

if (!hasError) {
  console.log('SUCCESS! Zero corrupted glyphs, zero spaced-out letters, zero slashes, zero %% box-drawing corruption!');
}
