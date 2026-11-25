/**
 * SANKALP AI - Autonomous University Examination Preparation Platform
 * Judge0 Enterprise Code Execution Engine Service
 * 
 * Features:
 * 1. Native support for C, C++, Python, Java, JavaScript, TypeScript.
 * 2. Secure isolation: Zero code executed on host server.
 * 3. Base64 encoding/decoding for safe binary/string stdin/stdout handling.
 * 4. Automatic wait + poll mechanism for queued jobs.
 * 5. Strict execution timeout and memory limit guards.
 */

const JUDGE0_BASE_URL = process.env.JUDGE0_API_URL || 'https://ce.judge0.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || '';
const JUDGE0_API_HOST = process.env.JUDGE0_API_HOST || '';

// Supported language definitions mapped to Judge0 Language IDs
const LANGUAGE_CONFIG = {
  c: {
    id: 103, // C (GCC 14.1.0)
    fallbackId: 50, // C (GCC 9.2.0)
    name: 'C (GCC 14.1.0)',
    monaco: 'c',
    extension: 'c',
    starter: `#include <stdio.h>

int main() {
    // Write your code here
    printf("Hello, World!\\n");
    return 0;
}
`,
  },
  cpp: {
    id: 105, // C++ (GCC 14.1.0)
    fallbackId: 54, // C++ (GCC 9.2.0)
    name: 'C++ (G++ 14.1.0)',
    monaco: 'cpp',
    extension: 'cpp',
    starter: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

int main() {
    // Fast I/O
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // Write your code here
    cout << "Hello, World!" << "\\n";
    return 0;
}
`,
  },
  python: {
    id: 100, // Python (3.12.5)
    fallbackId: 71, // Python (3.8.1)
    name: 'Python (Python 3.12)',
    monaco: 'python',
    extension: 'py',
    starter: `import sys

def main():
    # Write your code here
    print("Hello, World!")

if __name__ == "__main__":
    main()
`,
  },
  java: {
    id: 91, // Java (JDK 17.0.6)
    fallbackId: 62, // Java (OpenJDK 13.0.1)
    name: 'Java (JDK 17)',
    monaco: 'java',
    extension: 'java',
    starter: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        // Fast scanner
        Scanner scanner = new Scanner(System.in);

        // Write your code here
        System.out.println("Hello, World!");
    }
}
`,
  },
  javascript: {
    id: 102, // JavaScript (Node.js 22.08.0)
    fallbackId: 93, // Node.js 18.15.0
    name: 'JavaScript (Node.js 22)',
    monaco: 'javascript',
    extension: 'js',
    starter: `// Write your code here
function main() {
    console.log("Hello, World!");
}

main();
`,
  },
  typescript: {
    id: 101, // TypeScript (5.6.2)
    fallbackId: 94, // TypeScript (5.0.3)
    name: 'TypeScript (TS 5.6)',
    monaco: 'typescript',
    extension: 'ts',
    starter: `// Write your code here
function main(): void {
    const greeting: string = "Hello, World!";
    console.log(greeting);
}

main();
`,
  },
};

/**
 * Build request headers for Judge0 (supports both Community Edition and RapidAPI)
 */
function getJudge0Headers() {
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'SANKALP-AI-Lab/1.0',
  };

  if (JUDGE0_API_KEY) {
    if (JUDGE0_API_HOST || JUDGE0_BASE_URL.includes('rapidapi')) {
      headers['X-RapidAPI-Key'] = JUDGE0_API_KEY;
      headers['X-RapidAPI-Host'] = JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com';
    } else {
      headers['X-Auth-Token'] = JUDGE0_API_KEY;
    }
  }

  return headers;
}

/**
 * Decode Base64 string safely
 */
function decodeBase64(str) {
  if (!str) return '';
  try {
    return Buffer.from(str, 'base64').toString('utf8');
  } catch {
    return String(str);
  }
}

/**
 * Encode string to Base64 safely
 */
function encodeBase64(str) {
  if (!str) return '';
  return Buffer.from(String(str), 'utf8').toString('base64');
}

/**
 * Map Judge0 status ID to standard human status
 */
function mapJudge0Status(statusObj) {
  if (!statusObj) return 'Internal Error';
  const id = statusObj.id;

  switch (id) {
    case 3:
      return 'Accepted';
    case 4:
      return 'Wrong Answer';
    case 5:
      return 'Time Limit Exceeded';
    case 6:
      return 'Compilation Error';
    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
    case 12:
      return 'Runtime Error';
    case 13:
      return 'Internal Error';
    case 14:
      return 'Memory Limit Exceeded';
    default:
      return statusObj.description || 'Executed';
  }
}

/**
 * Normalize output string for rigorous whitespace comparison
 */
function normalizeOutput(str) {
  if (!str) return '';
  return str
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .trim();
}

/**
 * Poll submission result if job was queued
 */
async function pollSubmission(token, maxAttempts = 10, intervalMs = 800) {
  const url = `${JUDGE0_BASE_URL}/submissions/${token}?base64_encoded=true`;
  const headers = getJudge0Headers();

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, intervalMs));
    const response = await fetch(url, { headers });
    if (!response.ok) continue;

    const data = await response.json();
    // Status 1 = In Queue, 2 = Processing
    if (data.status && data.status.id > 2) {
      return data;
    }
  }
  throw new Error('Code execution timed out waiting in Judge0 processing queue.');
}

/**
 * Execute single source code submission via Judge0
 */
async function executeCode({
  source_code,
  language,
  stdin = '',
  time_limit = 3.0,
  memory_limit = 128000,
}) {
  const langKey = (language || '').toLowerCase().trim();
  const config = LANGUAGE_CONFIG[langKey];
  if (!config) {
    throw new Error(`Unsupported programming language: "${language}". Supported: C, C++, Python, Java, JavaScript, TypeScript.`);
  }

  const payload = {
    source_code: encodeBase64(source_code || ''),
    language_id: config.id,
    stdin: encodeBase64(stdin || ''),
    cpu_time_limit: Math.min(Math.max(Number(time_limit) || 3.0, 1.0), 10.0),
    max_file_size: 4096,
  };

  if (memory_limit) {
    payload.memory_limit = Math.min(Math.max(Number(memory_limit) || 128000, 32000), 256000);
  }

  const headers = getJudge0Headers();
  const submitUrl = `${JUDGE0_BASE_URL}/submissions?base64_encoded=true&wait=true`;

  let response = await fetch(submitUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  // Fallback to legacy language ID if compiler version not available
  if (!response.ok && config.fallbackId) {
    payload.language_id = config.fallbackId;
    response = await fetch(submitUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Judge0 execution engine error (${response.status}): ${errorText}`);
  }

  let resultData = await response.json();

  // If queued, poll for completion
  if (resultData.status && (resultData.status.id === 1 || resultData.status.id === 2)) {
    resultData = await pollSubmission(resultData.token);
  }

  const stdout = decodeBase64(resultData.stdout);
  const stderr = decodeBase64(resultData.stderr);
  const compile_output = decodeBase64(resultData.compile_output);
  const status = mapJudge0Status(resultData.status);

  return {
    language: langKey,
    language_id: payload.language_id,
    status,
    status_id: resultData.status?.id || 0,
    stdout,
    stderr,
    compile_output,
    compileOutput: compile_output,
    time: Number(resultData.time) || 0,
    memory: Number(resultData.memory) || 0,
  };
}

/**
 * Execute source code against a collection of test cases (Sample + Hidden)
 */
async function executeAgainstTestCases({
  source_code,
  language,
  sample_test_cases = [],
  hidden_test_cases = [],
  time_limit = 3.0,
  memory_limit = 128000,
}) {
  const allCases = [
    ...sample_test_cases.map((tc, idx) => ({ ...tc, is_hidden: false, case_num: idx + 1 })),
    ...hidden_test_cases.map((tc, idx) => ({ ...tc, is_hidden: true, case_num: sample_test_cases.length + idx + 1 })),
  ];

  if (allCases.length === 0) {
    // If problem has no test cases, perform a simple execution check
    const singleRun = await executeCode({
      source_code,
      language,
      stdin: '',
      time_limit,
      memory_limit,
    });
    return {
      status: singleRun.status === 'Accepted' ? 'Accepted' : singleRun.status,
      test_cases_passed: singleRun.status === 'Accepted' ? 1 : 0,
      total_test_cases: 1,
      results: [{
        test_case_index: 1,
        passed: singleRun.status === 'Accepted',
        input: '',
        expected_output: '',
        actual_output: singleRun.stdout,
        execution_time: singleRun.time,
        memory_usage: singleRun.memory,
        status: singleRun.status,
        error_message: singleRun.compile_output || singleRun.stderr,
        is_hidden: false,
      }],
      max_time: singleRun.time,
      max_memory: singleRun.memory,
      compile_output: singleRun.compile_output,
    };
  }

  let passedCount = 0;
  const results = [];
  let overallStatus = 'Accepted';
  let maxTime = 0;
  let maxMemory = 0;
  let compileOutput = '';

  for (let i = 0; i < allCases.length; i++) {
    const tc = allCases[i];
    const execRes = await executeCode({
      source_code,
      language,
      stdin: tc.input || '',
      time_limit,
      memory_limit,
    });

    if (execRes.time > maxTime) maxTime = execRes.time;
    if (execRes.memory > maxMemory) maxMemory = execRes.memory;

    // Fast-fail if code fails to compile
    if (execRes.status === 'Compilation Error') {
      overallStatus = 'Compilation Error';
      compileOutput = execRes.compile_output;
      results.push({
        test_case_index: tc.case_num,
        passed: false,
        input: tc.is_hidden ? '[Hidden Test Case]' : (tc.input || ''),
        expected_output: tc.is_hidden ? '[Hidden Test Case]' : (tc.output || ''),
        expectedOutput: tc.is_hidden ? '[Hidden Test Case]' : (tc.output || ''),
        actual_output: '',
        actualOutput: '',
        execution_time: 0,
        memory_usage: 0,
        status: 'Compilation Error',
        error_message: execRes.compile_output,
        is_hidden: tc.is_hidden,
        isHidden: tc.is_hidden,
      });
      break; // No need to run further test cases on compilation error
    }

    if (execRes.status === 'Time Limit Exceeded') {
      if (overallStatus === 'Accepted') overallStatus = 'Time Limit Exceeded';
      results.push({
        test_case_index: tc.case_num,
        passed: false,
        input: tc.is_hidden ? '[Hidden Test Case]' : (tc.input || ''),
        expected_output: tc.is_hidden ? '[Hidden Test Case]' : (tc.output || ''),
        expectedOutput: tc.is_hidden ? '[Hidden Test Case]' : (tc.output || ''),
        actual_output: 'Time Limit Exceeded',
        actualOutput: 'Time Limit Exceeded',
        execution_time: execRes.time,
        memory_usage: execRes.memory,
        status: 'Time Limit Exceeded',
        error_message: 'Your program exceeded the allowed execution time limit.',
        is_hidden: tc.is_hidden,
        isHidden: tc.is_hidden,
      });
      continue;
    }

    if (execRes.status === 'Runtime Error') {
      if (overallStatus === 'Accepted') overallStatus = 'Runtime Error';
      results.push({
        test_case_index: tc.case_num,
        passed: false,
        input: tc.is_hidden ? '[Hidden Test Case]' : (tc.input || ''),
        expected_output: tc.is_hidden ? '[Hidden Test Case]' : (tc.output || ''),
        expectedOutput: tc.is_hidden ? '[Hidden Test Case]' : (tc.output || ''),
        actual_output: execRes.stdout || '',
        actualOutput: execRes.stdout || '',
        execution_time: execRes.time,
        memory_usage: execRes.memory,
        status: 'Runtime Error',
        error_message: execRes.stderr || 'Runtime error during execution',
        is_hidden: tc.is_hidden,
        isHidden: tc.is_hidden,
      });
      continue;
    }

    // Compare stdout with expected output
    const normActual = normalizeOutput(execRes.stdout);
    const normExpected = normalizeOutput(tc.output);
    const isCorrect = normActual === normExpected;

    if (isCorrect) {
      passedCount++;
      results.push({
        test_case_index: tc.case_num,
        passed: true,
        input: tc.is_hidden ? '[Hidden Test Case]' : (tc.input || ''),
        expected_output: tc.is_hidden ? '[Hidden Test Case]' : (tc.output || ''),
        expectedOutput: tc.is_hidden ? '[Hidden Test Case]' : (tc.output || ''),
        actual_output: tc.is_hidden ? '[Correct]' : execRes.stdout,
        actualOutput: tc.is_hidden ? '[Correct]' : execRes.stdout,
        execution_time: execRes.time,
        memory_usage: execRes.memory,
        status: 'Accepted',
        error_message: '',
        is_hidden: tc.is_hidden,
        isHidden: tc.is_hidden,
      });
    } else {
      if (overallStatus === 'Accepted') overallStatus = 'Wrong Answer';
      results.push({
        test_case_index: tc.case_num,
        passed: false,
        input: tc.is_hidden ? '[Hidden Test Case]' : (tc.input || ''),
        expected_output: tc.is_hidden ? '[Hidden Test Case]' : (tc.output || ''),
        expectedOutput: tc.is_hidden ? '[Hidden Test Case]' : (tc.output || ''),
        actual_output: tc.is_hidden ? '[Wrong Answer on Hidden Case]' : execRes.stdout,
        actualOutput: tc.is_hidden ? '[Wrong Answer on Hidden Case]' : execRes.stdout,
        execution_time: execRes.time,
        memory_usage: execRes.memory,
        status: 'Wrong Answer',
        error_message: '',
        is_hidden: tc.is_hidden,
        isHidden: tc.is_hidden,
      });
    }
  }

  return {
    status: overallStatus,
    test_cases_passed: passedCount,
    total_test_cases: allCases.length,
    results,
    max_time: maxTime,
    max_memory: maxMemory,
    compile_output: compileOutput,
  };
}

module.exports = {
  LANGUAGE_CONFIG,
  executeCode,
  executeAgainstTestCases,
  getJudge0Headers,
};
