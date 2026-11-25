const pyCode = `arr = []

try:
    n = int(input("Enter number of elements: "))
    
    if n <= 0:
        print("Please enter a positive number.")
    else:
        for i in range(n):
            value = int(input(f"Enter element {i + 1}: "))
            arr.append(value)
`;

// Test regex matching on python lines
const lines = pyCode.split('\n');
for (const line of lines) {
  const m1 = line.match(/input\s*\(\s*["']([^"'\\]*(?:\\.[^"'\\]*)*)["']\s*\)/);
  const m2 = line.match(/input\s*\(\s*(?:f|r|b)?["']([^"'\\]*(?:\\.[^"'\\]*)*)["']\s*\)/);
  console.log('Line:', line.trim());
  console.log('  old regex:', m1 ? m1[1] : null);
  console.log('  new regex (with f-string):', m2 ? m2[1] : null);
}
