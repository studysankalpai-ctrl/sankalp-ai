import { analyzeCodeInputs, codeExpectsInput, getTerminalCommand } from '../frontend/src/lib/terminalFormatter.js';

const cCode = `#include <stdio.h>

int main() {
    int a,b;
    int c;
    c=a+b;
    printf("Enter Two Numbers");
    scanf("%d %d",&a,&b);
    printf("Sum Of Values = %d", c);
}
`;

const javaCode = `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter Student Name: ");
        String name = sc.nextLine();

        System.out.print("Enter Roll Number: ");
        int rollNo = sc.nextInt();

        for (int i = 1; i <= 5; i++) {
            System.out.print("Enter Marks for Subject " + i + ": ");
            int marks = sc.nextInt();
        }
    }
}
`;

console.log('--- TEST C CODE ---');
const cAnalysis = analyzeCodeInputs(cCode, 'c');
console.log('C expected count:', cAnalysis.expectedCount);
console.log('C prompts:', cAnalysis.prompts);

console.log('\n--- TEST JAVA CODE ---');
const javaAnalysis = analyzeCodeInputs(javaCode, 'java');
console.log('Java expected count:', javaAnalysis.expectedCount);
console.log('Java prompts:', javaAnalysis.prompts);
