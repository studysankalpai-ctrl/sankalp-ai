const http = require('http');

async function testSubmission() {
  const code = `#include <stdio.h>
int main() {
    int n, target;
    if (scanf("%d %d", &n, &target) != 2) return 0;
    int nums[n];
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (nums[i] + nums[j] == target) {
                printf("%d %d\\n", i, j);
                return 0;
            }
        }
    }
    return 0;
}`;

  // Get two-sum problem id
  const prob = await new Promise((res, rej) => {
    http.get('http://localhost:5000/api/coding/problems/two-sum', (r) => {
      let b = '';
      r.on('data', c => b += c);
      r.on('end', () => res(JSON.parse(b).data.problem));
    });
  });

  console.log('Testing submission for problem:', prob.title, 'id:', prob._id);

  const postData = JSON.stringify({
    studentId: 'student_tester_01',
    problemId: prob._id,
    language: 'c',
    code: code
  });

  const subRes = await new Promise((res, rej) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/coding/submit',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (r) => {
      let b = '';
      r.on('data', c => b += c);
      r.on('end', () => res(JSON.parse(b)));
    });
    req.write(postData);
    req.end();
  });

  console.log('Submission status:', subRes.data?.submission?.status);
  console.log('Passed tests:', subRes.data?.submission?.passedTests, '/', subRes.data?.submission?.totalTests);
}

testSubmission().catch(console.error);
