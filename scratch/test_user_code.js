const { extractCodePrompts, analyzeCodeInputs } = require('../frontend/src/lib/terminalFormatter.js');

const code = `#include <stdio.h>

int main() {
    int a,b;
    int c;
    printf("Enter Two Numbers");
    scanf("%d %d",&a,&b);
    c=a+b;
    printf("Sum Of Values = %d",c);
}`;

console.log('Analysis:', analyzeCodeInputs(code, 'c'));
