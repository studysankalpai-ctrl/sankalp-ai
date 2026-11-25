const fetch = globalThis.fetch;

async function testCExecution() {
  const cCode = `#include <stdio.h>

int main() {
    int a,b;
    int c;
    printf("Enter Two Numbers: ");
    scanf("%d %d",&a,&b);
    c=a+b;
    printf("Sum Of Values = %d\\n", c);
    return 0;
}
`;

  const stdin = '10 20';

  const res = await fetch('http://localhost:5000/api/coding/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentId: 'test-student',
      language: 'c',
      code: cCode,
      stdin: stdin,
    }),
  });

  const data = await res.json();
  console.log('Status code:', res.status);
  console.log('STDOUT:\n', data.data?.stdout);
  console.log('STDERR:\n', data.data?.stderr);
}

testCExecution();
