const http = require('http');

async function simulate() {
  const code = `#include <stdio.h>

int main() {
    int a,b;
    int c;
    printf("Enter Two Numbers");
    scanf("%d %d",&a,&b);
    c=a+b;
    printf("Sum Of Values = %d",c);
}`;

  console.log('Calling /api/coding/execute with stdin: "10\\n20"...');
  const postData = JSON.stringify({
    studentId: 'test_student',
    language: 'c',
    code: code,
    stdin: '10\n20'
  });

  const res = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/coding/execute',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (r) => {
      let b = '';
      r.on('data', chunk => b += chunk);
      r.on('end', () => resolve(JSON.parse(b)));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });

  console.log('API returned success:', res.success);
  console.log('Result data:', res.data);

  const rawStdout = res.data.stdout;
  console.log('rawStdout:', JSON.stringify(rawStdout));

  const prompts = ['Enter Two Numbers'];
  let remainingText = rawStdout;
  for (const p of prompts) {
    remainingText = remainingText.replace(p, '');
  }
  remainingText = remainingText.trim();
  console.log('remainingText:', JSON.stringify(remainingText));
}

simulate().catch(console.error);
