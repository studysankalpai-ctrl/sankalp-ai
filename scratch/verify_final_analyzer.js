import { analyzeCodeInputs } from '../frontend/src/lib/terminalFormatter.js';

// 1. User's exact Python code from the screenshot
const userPython = `arr = []

try:
    n = int(input("Enter number of elements: "))
    
    if n <= 0:
        print("Please enter a positive number.")
    else:
        for i in range(n):
            value = int(input(f"Enter element {i + 1}: "))
            arr.append(value)
`;

console.log('--- TEST 1: User Python Code Analysis ---');
const pyAnalysis = analyzeCodeInputs(userPython, 'python');
console.log('Expected:', pyAnalysis.expectedCount);
console.log('Prompts:', pyAnalysis.prompts);
console.log('Dynamic Loop:', pyAnalysis.dynamicLoop);

// 2. User C code
const cCode = `#include <stdio.h>
int main() {
    int a,b;
    printf("Enter Two Numbers: ");
    scanf("%d %d", &a, &b);
}
`;
console.log('\n--- TEST 2: C Code Analysis ---');
const cAnalysis = analyzeCodeInputs(cCode, 'c');
console.log('Expected:', cAnalysis.expectedCount);
console.log('Prompts:', cAnalysis.prompts);

// 3. User Java code
const javaCode = `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter Student Name: ");
        String name = sc.nextLine();
        for (int i = 1; i <= 3; i++) {
            System.out.print("Marks " + i + ": ");
            int m = sc.nextInt();
        }
    }
}
`;
console.log('\n--- TEST 3: Java Code Analysis ---');
const javaAnalysis = analyzeCodeInputs(javaCode, 'java');
console.log('Expected:', javaAnalysis.expectedCount);
console.log('Prompts:', javaAnalysis.prompts);
