import { spawnSync } from 'child_process';

const code = `arr = []
try:
    n = int(input("Enter number of elements: "))
    if n <= 0:
        print("Please enter a positive number.")
    else:
        for i in range(n):
            value = int(input(f"Enter element {i + 1}: "))
            arr.append(value)
        print("Array:", arr)
except Exception as e:
    print("Error:", e)
`;

console.log('--- TEST 1: stdin = "4\\n10\\n20\\n30\\n40" ---');
const r1 = spawnSync('python', ['-c', code], { input: '4\n10\n20\n30\n40\n', encoding: 'utf-8' });
console.log('stdout:\n', r1.stdout);
console.log('stderr:\n', r1.stderr);

console.log('--- TEST 2: stdin = "10 20 30 40" ---');
const r2 = spawnSync('python', ['-c', code], { input: '10 20 30 40\n', encoding: 'utf-8' });
console.log('stdout:\n', r2.stdout);
console.log('stderr:\n', r2.stderr);
