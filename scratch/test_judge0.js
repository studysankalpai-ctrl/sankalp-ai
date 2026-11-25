async function testExec() {
  const code = 'console.log("Hello from Sankalp Coding Lab!");';
  const payload = {
    source_code: Buffer.from(code).toString('base64'),
    language_id: 102,
    stdin: Buffer.from('').toString('base64'),
  };
  try {
    const res = await fetch('https://ce.judge0.com/submissions?base64_encoded=true&wait=true', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log('HTTP Status:', res.status);
    console.log('Result status:', data.status);
    if (data.stdout) {
      console.log('Decoded stdout:', Buffer.from(data.stdout, 'base64').toString('utf8'));
    }
    if (data.compile_output) {
      console.log('Compile output:', Buffer.from(data.compile_output, 'base64').toString('utf8'));
    }
  } catch (err) {
    console.error('Execution error:', err);
  }
}
testExec();
