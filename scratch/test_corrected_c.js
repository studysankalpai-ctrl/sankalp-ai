const http = require('http');

const correctedCode = `#include <stdio.h>

int main() {
    int a, b;
    int c;
    printf("Enter Two Numbers\\n");
    scanf("%d %d", &a, &b);
    c = a + b;
    printf("Sum Of Values = %d\\n", c);
    return 0;
}
`;

const data = JSON.stringify({
  language: 'c',
  code: correctedCode,
  stdin: '12 14',
});

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/coding/execute',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  },
}, (res) => {
  let raw = '';
  res.on('data', chunk => raw += chunk);
  res.on('end', () => {
    const json = JSON.parse(raw);
    console.log('Status:', json.data?.status);
    console.log('Stdout:\n' + json.data?.stdout);
    console.log('Stderr:', json.data?.stderr);
  });
});

req.on('error', (err) => console.error(err));
req.write(data);
req.end();
