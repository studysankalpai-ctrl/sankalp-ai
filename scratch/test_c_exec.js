const http = require('http');

function runReq(language, code, stdinVal) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      studentId: 'test_student',
      language: language,
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
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function testPython() {
  const pyCode = `a = int(input("Enter first number: "))
b = int(input("Enter second number: "))
print("Sum =", a + b)`;

  console.log('--- Python with "10\\n20" ---');
  const res1 = await runReq('python', pyCode, '10\n20');
  console.log('stdout:', JSON.stringify(res1.data?.stdout));

  console.log('\n--- Python with EMPTY stdin ---');
  const res2 = await runReq('python', pyCode, '');
  console.log('stdout:', JSON.stringify(res2.data?.stdout));
  console.log('stderr:', JSON.stringify(res2.data?.stderr));
}

testPython().catch(console.error);
