const http = require('http');

const segfaultCode = `#include <stdio.h>

int main() {
    int a,b;
    int c;
    printf("Enter Two Numbers");
    scanf("%d %d",a,b);
    c=a+b;
    printf("Sum Of Values = %d",c);
}
`;

const data = JSON.stringify({
  language: 'c',
  code: segfaultCode,
  stdin: '12\n14',
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
    console.log('Stdout:', json.data?.stdout);
    console.log('Stderr:', json.data?.stderr);
    console.log('CompileOutput:', json.data?.compileOutput);
  });
});

req.on('error', (err) => console.error(err));
req.write(data);
req.end();
