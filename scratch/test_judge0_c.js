async function testC() {
  const code = `
#include <stdio.h>

int main() {
    int a, b;
    if (scanf("%d %d", &a, &b) == 2) {
        printf("Sum: %d\\n", a + b);
    } else {
        printf("Hello C GCC 14!\\n");
    }
    return 0;
}
`;
  const payload = {
    source_code: Buffer.from(code).toString('base64'),
    language_id: 103, // C (GCC 14.1.0)
    stdin: Buffer.from('40 2').toString('base64'),
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
    console.log('Time:', data.time, 'Memory:', data.memory);
    if (data.stdout) {
      console.log('Decoded stdout:', Buffer.from(data.stdout, 'base64').toString('utf8'));
    }
  } catch (err) {
    console.error('C Execution error:', err);
  }
}
testC();
