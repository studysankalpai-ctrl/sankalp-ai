const http = require('http');

function runJudge0(code, stdinVal) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      studentId: 'test_step',
      language: 'python',
      code: code,
      stdin: stdinVal
    });

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/coding/execute',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function testPythonStep() {
  const code = `a = int(input("Enter First Number: "))
b = int(input("Enter Second Number: "))
print("Sum =", a + b)`;

  console.log('--- PYTHON STEP 1: No input ---');
  const res1 = await runJudge0(code, '');
  console.log('stdout:', JSON.stringify(res1.data?.stdout));
  console.log('stderr (is EOF):', res1.data?.stderr?.includes('EOFError'));

  console.log('\n--- PYTHON STEP 2: Input "10" ---');
  const res2 = await runJudge0(code, '10');
  console.log('stdout:', JSON.stringify(res2.data?.stdout));
  console.log('stderr (is EOF):', res2.data?.stderr?.includes('EOFError'));

  console.log('\n--- PYTHON STEP 3: Input "10\\n20" ---');
  const res3 = await runJudge0(code, '10\n20');
  console.log('stdout:', JSON.stringify(res3.data?.stdout));
  console.log('stderr:', JSON.stringify(res3.data?.stderr));
}

testPythonStep().catch(console.error);
