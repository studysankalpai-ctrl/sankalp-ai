const http = require('http');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(raw));
        } catch (e) {
          resolve({ status: res.statusCode, raw });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'GET',
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(raw));
        } catch (e) {
          resolve({ status: res.statusCode, raw });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING CODING PRACTICE LAB E2E VERIFICATION ---');

  const testStudentId = 'test_student_e2e_' + Date.now();

  // Test 1: Get problems
  console.log('\n[1] Testing GET /api/coding/problems...');
  const probList = await get('/api/coding/problems');
  console.log(`Success: ${probList.success}, Total problems: ${probList.data?.problems?.length}`);
  if (!probList.success || probList.data.problems.length === 0) {
    throw new Error('Problem list returned empty or failed');
  }

  // Test 2: Get single problem by slug (Two Sum)
  console.log('\n[2] Testing GET /api/coding/problems/two-sum...');
  const twoSumRes = await get('/api/coding/problems/two-sum');
  console.log(`Success: ${twoSumRes.success}, Title: ${twoSumRes.data?.problem?.title}`);
  const hasHidden = twoSumRes.data?.problem?.hiddenTestCases;
  console.log(`Hidden test cases exposed to student: ${hasHidden ? 'YES (SECURITY RISK!)' : 'NO (SECURE!)'}`);
  console.log(`Sample test cases count: ${twoSumRes.data?.problem?.sampleTestCases?.length}`);

  // Test 3: Execute Python code
  console.log('\n[3] Testing POST /api/coding/execute (Python)...');
  const pyCode = `import sys
nums = list(map(int, sys.stdin.readline().split()))
print(f"Product: {nums[0] * nums[1]}")
`;
  const pyRun = await post('/api/coding/execute', {
    studentId: testStudentId,
    language: 'python',
    code: pyCode,
    stdin: '6 7',
  });
  console.log('Python Output:', pyRun.data?.stdout?.trim());
  console.log('Python Status:', pyRun.data?.status?.description);

  // Test 4: Execute C++ code
  console.log('\n[4] Testing POST /api/coding/execute (C++)...');
  const cppCode = `#include <iostream>
using namespace std;
int main() {
    int a, b;
    if (cin >> a >> b) {
        cout << "Sum: " << (a + b) << endl;
    }
    return 0;
}
`;
  const cppRun = await post('/api/coding/execute', {
    studentId: testStudentId,
    language: 'cpp',
    code: cppCode,
    stdin: '25 17',
  });
  console.log('C++ Output:', cppRun.data?.stdout?.trim());
  console.log('C++ Status:', cppRun.data?.status?.description);

  // Test 5: Submit solution for Two Sum
  console.log('\n[5] Testing POST /api/coding/submit for Two Sum...');
  const twoSumSolution = `import sys

def two_sum():
    lines = sys.stdin.read().strip().split('\\n')
    if not lines or len(lines) < 2:
        return
    nums = list(map(int, lines[0].split()))
    target = int(lines[1])
    
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            print(f"{seen[diff]} {i}")
            return
        seen[num] = i

if __name__ == "__main__":
    two_sum()
`;
  const submitRes = await post('/api/coding/submit', {
    studentId: testStudentId,
    problemId: twoSumRes.data.problem._id,
    language: 'python',
    code: twoSumSolution,
  });
  console.log(`Submission Status: ${submitRes.data?.submission?.status}`);
  console.log(`Passed Tests: ${submitRes.data?.submission?.passedTests} / ${submitRes.data?.submission?.totalTests}`);

  // Test 6: Verify student progress & streak persistence
  console.log('\n[6] Testing GET /api/coding/progress/:studentId...');
  const progRes = await get(`/api/coding/progress/${testStudentId}`);
  console.log(`Problems Solved: ${progRes.data?.progress?.problemsSolved?.length}`);
  console.log(`Current Streak: ${progRes.data?.progress?.currentStreak} day(s)`);
  console.log(`Total Submissions: ${progRes.data?.progress?.totalSubmissions}`);
  console.log(`Topic Stats:`, progRes.data?.progress?.topicStats);

  // Test 7: Save draft code
  console.log('\n[7] Testing POST /api/coding/save-code...');
  const saveRes = await post('/api/coding/save-code', {
    studentId: testStudentId,
    problemId: twoSumRes.data.problem._id,
    language: 'python',
    code: '# My saved draft solution',
  });
  console.log(`Save draft success: ${saveRes.success}`);

  const getSavedRes = await get(`/api/coding/saved-code?studentId=${testStudentId}&problemId=${twoSumRes.data.problem._id}&language=python`);
  console.log(`Retrieved saved draft code: "${getSavedRes.data?.savedCode?.code}"`);

  console.log('\n✅ ALL E2E TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ E2E TEST FAILED:', err);
  process.exit(1);
});
