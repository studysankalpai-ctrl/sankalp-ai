const { extractCodePrompts, codeExpectsInput, formatTerminalOutput, getTerminalCommand } = require('../frontend/src/lib/terminalFormatter.js');

console.log('Testing getTerminalCommand:');
console.log('c:', getTerminalCommand('c'));
console.log('python:', getTerminalCommand('python'));

console.log('\nTesting codeExpectsInput:');
console.log('scanf in C:', codeExpectsInput('scanf("%d", &a);', 'c'));
console.log('cin in C++:', codeExpectsInput('cin >> a;', 'cpp'));
console.log('input in Python:', codeExpectsInput('a = input()', 'python'));
console.log('no input in DSA:', codeExpectsInput('vector<int> v; return v;', 'cpp'));

console.log('\nTesting formatTerminalOutput with user exact C code:');
const userCode = `#include <stdio.h>
int main() {
    int a,b;
    int c;
    printf("Enter Two Numbers");
    scanf("%d %d",&a,&b);
    c=a+b;
    printf("Sum Of Values = %d",c);
}`;

// Case 1: First run with no stdin
const resNoInput = formatTerminalOutput({
  stdout: "Enter Two NumbersSum Of Values = 32767",
  stdin: "",
  code: userCode,
  language: 'c'
});
console.log('No input result:', resNoInput);

// Case 2: User provides 10 20
const resWithInput = formatTerminalOutput({
  stdout: "Enter Two NumbersSum Of Values = 30",
  stdin: "10 20",
  code: userCode,
  language: 'c'
});
console.log('With input result:', resWithInput);

// Case 3: DSA problem with no prompts
const resDSA = formatTerminalOutput({
  stdout: "[0, 1]\n",
  stdin: "2 7 11 15\n9",
  code: `// leetcode`,
  language: 'cpp'
});
console.log('DSA result:', resDSA);
