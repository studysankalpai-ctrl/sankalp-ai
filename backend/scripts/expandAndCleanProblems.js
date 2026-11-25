/**
 * SANKALP AI - Expanded & Cleaned DSA Problem Bank
 * Replaces prefilled solutions with genuine unsolved starter code (TODO: Implement logic)
 * and expands catalog across all 14 topics and 3 difficulty tiers.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const CodingProblem = require('../models/CodingProblem');

const problems = [
  // =========================================================================
  // 1. ARRAYS - Easy: Two Sum
  // =========================================================================
  {
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'Easy',
    topic: 'Arrays',
    tags: ['Array', 'Hash Table', 'Two Pointers'],
    description: `Given an array of integers \`nums\` and an integer \`target\`, find the **indices** of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

Output the two indices separated by a space, with the smaller index first.`,
    input_format: `The first line contains an integer \`n\` (size of the array) and an integer \`target\`.
The second line contains \`n\` space-separated integers representing the array \`nums\`.`,
    output_format: `Print two space-separated integers representing the 0-based indices of the two numbers.`,
    constraints: `2 <= n <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.`,
    sample_test_cases: [
      {
        input: '4 9\n2 7 11 15',
        output: '0 1',
        explanation: 'Because nums[0] + nums[1] == 2 + 7 == 9, output is 0 1.',
        is_hidden: false,
      },
      {
        input: '3 6\n3 2 4',
        output: '1 2',
        explanation: 'nums[1] + nums[2] == 2 + 4 == 6, output is 1 2.',
        is_hidden: false,
      },
    ],
    hidden_test_cases: [
      { input: '2 6\n3 3', output: '0 1', is_hidden: true },
      { input: '5 10\n1 2 3 7 11', output: '2 3', is_hidden: true },
      { input: '4 -8\n-3 -5 1 4', output: '0 1', is_hidden: true },
    ],
    hints: [
      'Can you check every pair using two nested loops in O(N²)?',
      'Can you use a Hash Table to store the complement (target - nums[i]) to solve it in O(N)?',
    ],
    solution_explanation: `### Optimal Solution: Hash Map / Hash Table
1. Maintain a hash map storing value to its index.
2. For each number x at index i, compute diff = target - x.
3. If diff is already in the map, return [map[diff], i].
4. Otherwise, record map[x] = i.
Time Complexity: O(N) | Space Complexity: O(N)`,
    starter_templates: {
      c: `#include <stdio.h>

int main() {
    int n, target;
    if (scanf("%d %d", &n, &target) != 2) return 0;
    int nums[n];
    for (int i = 0; i < n; i++) {
        scanf("%d", &nums[i]);
    }

    // TODO: Write your solution here
    // Find two indices whose values sum to target and print them: printf("%d %d\\n", i, j);

    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    int n, target;
    if (!(cin >> n >> target)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    // TODO: Write your solution here
    // Print the two 0-based indices separated by a space

    return 0;
}
`,
      python: `import sys

def solve():
    lines = sys.stdin.read().split()
    if not lines:
        return
    n = int(lines[0])
    target = int(lines[1])
    nums = [int(x) for x in lines[2:2+n]]

    # TODO: Write your solution here
    # Print the two 0-based indices separated by a space

if __name__ == '__main__':
    solve()
`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int target = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) {
            nums[i] = sc.nextInt();
        }

        // TODO: Write your solution here
        // Print the two 0-based indices separated by a space

    }
}
`,
      javascript: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 2) return;
    const n = parseInt(input[0], 10);
    const target = parseInt(input[1], 10);
    const nums = input.slice(2, 2 + n).map(Number);

    // TODO: Write your solution here
    // Print the two 0-based indices separated by a space

}

solve();
`,
      typescript: `import * as fs from 'fs';

function solve(): void {
    const input: string[] = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 2) return;
    const n: number = parseInt(input[0], 10);
    const target: number = parseInt(input[1], 10);
    const nums: number[] = input.slice(2, 2 + n).map(Number);

    // TODO: Write your solution here
    // Print the two 0-based indices separated by a space

}

solve();
`,
    },
    order: 1,
  },

  // =========================================================================
  // 2. ARRAYS - Medium: Maximum Subarray Sum (Kadane's Algorithm)
  // =========================================================================
  {
    title: 'Maximum Subarray Sum',
    slug: 'maximum-subarray-sum',
    difficulty: 'Medium',
    topic: 'Arrays',
    tags: ['Array', 'Dynamic Programming', 'Divide and Conquer'],
    description: `Given an integer array \`nums\`, find the contiguous subarray (containing at least one number) which has the **largest sum** and print its sum.`,
    input_format: `The first line contains an integer \`n\` representing the size of the array.
The second line contains \`n\` space-separated integers.`,
    output_format: `Print a single integer representing the maximum subarray sum.`,
    constraints: `1 <= n <= 10^5\n-10^4 <= nums[i] <= 10^4`,
    sample_test_cases: [
      {
        input: '9\n-2 1 -3 4 -1 2 1 -5 4',
        output: '6',
        explanation: 'Subarray [4, -1, 2, 1] has the largest sum = 6.',
        is_hidden: false,
      },
      {
        input: '1\n1',
        output: '1',
        explanation: 'Subarray [1] has the largest sum = 1.',
        is_hidden: false,
      },
    ],
    hidden_test_cases: [
      { input: '5\n5 4 -1 7 8', output: '23', is_hidden: true },
      { input: '3\n-3 -2 -1', output: '-1', is_hidden: true },
      { input: '4\n-1 -2 -3 -4', output: '-1', is_hidden: true },
    ],
    hints: [
      'Think about Kadane\'s algorithm. Keep track of current subarray sum and max sum found so far.',
      'If the current running sum drops below 0, is it beneficial to continue with it?',
    ],
    solution_explanation: `### Kadane's Algorithm
Initialize currentSum = nums[0], maxSum = nums[0].
Iterate from 1 to n-1:
currentSum = max(nums[i], currentSum + nums[i])
maxSum = max(maxSum, currentSum)
Time Complexity: O(N) | Space Complexity: O(1)`,
    starter_templates: {
      c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int nums[n];
    for (int i = 0; i < n; i++) {
        scanf("%d", &nums[i]);
    }

    // TODO: Write your solution here (Kadane's Algorithm)
    // Print the maximum subarray sum

    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    // TODO: Write your solution here
    // Print the maximum subarray sum

    return 0;
}
`,
      python: `import sys

def solve():
    lines = sys.stdin.read().split()
    if not lines:
        return
    n = int(lines[0])
    nums = [int(x) for x in lines[1:1+n]]

    # TODO: Write your solution here
    # Print the maximum subarray sum

if __name__ == '__main__':
    solve()
`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) {
            nums[i] = sc.nextInt();
        }

        // TODO: Write your solution here
        // Print the maximum subarray sum

    }
}
`,
      javascript: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 1) return;
    const n = parseInt(input[0], 10);
    const nums = input.slice(1, 1 + n).map(Number);

    // TODO: Write your solution here
    // Print the maximum subarray sum

}

solve();
`,
      typescript: `import * as fs from 'fs';

function solve(): void {
    const input: string[] = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 1) return;
    const n: number = parseInt(input[0], 10);
    const nums: number[] = input.slice(1, 1 + n).map(Number);

    // TODO: Write your solution here
    // Print the maximum subarray sum

}

solve();
`,
    },
    order: 2,
  },

  // =========================================================================
  // 3. ARRAYS - Easy: Move Zeroes
  // =========================================================================
  {
    title: 'Move Zeroes',
    slug: 'move-zeroes',
    difficulty: 'Easy',
    topic: 'Arrays',
    tags: ['Array', 'Two Pointers'],
    description: `Given an integer array \`nums\`, move all \`0\`'s to the end of it while maintaining the relative order of the non-zero elements.

You must do this in-place without making a copy of the array. Output the array elements separated by spaces.`,
    input_format: `The first line contains an integer \`n\`.
The second line contains \`n\` space-separated integers.`,
    output_format: `Print the modified array with all zeros moved to the end, space-separated.`,
    constraints: `1 <= n <= 10^4\n-2^31 <= nums[i] <= 2^31 - 1`,
    sample_test_cases: [
      {
        input: '5\n0 1 0 3 12',
        output: '1 3 12 0 0',
        explanation: 'All zeros are shifted to the back while maintaining 1, 3, 12 order.',
        is_hidden: false,
      },
      {
        input: '1\n0',
        output: '0',
        explanation: 'Single element 0 remains 0.',
        is_hidden: false,
      },
    ],
    hidden_test_cases: [
      { input: '4\n0 0 0 1', output: '1 0 0 0', is_hidden: true },
      { input: '4\n4 2 4 0', output: '4 2 4 0', is_hidden: true },
      { input: '3\n1 2 3', output: '1 2 3', is_hidden: true },
    ],
    hints: [
      'Use a two-pointer approach: one pointer for the current element and one for placing the next non-zero element.',
    ],
    solution_explanation: `Iterate through the array with pointer i. Whenever nums[i] != 0, swap nums[insertPos] with nums[i] and increment insertPos.`,
    starter_templates: {
      c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int nums[n];
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);

    // TODO: Write your solution here
    // Print the array space-separated with all zeros moved to the end

    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];

    // TODO: Write your solution here

    return 0;
}
`,
      python: `import sys

def solve():
    lines = sys.stdin.read().split()
    if not lines:
        return
    n = int(lines[0])
    nums = [int(x) for x in lines[1:1+n]]

    # TODO: Write your solution here
    # Print the modified numbers separated by space

if __name__ == '__main__':
    solve()
`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();

        // TODO: Write your solution here

    }
}
`,
      javascript: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 1) return;
    const n = parseInt(input[0], 10);
    const nums = input.slice(1, 1 + n).map(Number);

    // TODO: Write your solution here

}

solve();
`,
      typescript: `import * as fs from 'fs';

function solve(): void {
    const input: string[] = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 1) return;
    const n: number = parseInt(input[0], 10);
    const nums: number[] = input.slice(1, 1 + n).map(Number);

    // TODO: Write your solution here

}

solve();
`,
    },
    order: 3,
  },

  // =========================================================================
  // 4. STRINGS - Easy: Valid Palindrome
  // =========================================================================
  {
    title: 'Valid Palindrome',
    slug: 'valid-palindrome',
    difficulty: 'Easy',
    topic: 'Strings',
    tags: ['Two Pointers', 'String'],
    description: `A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string \`s\`, print \`true\` if it is a palindrome, or \`false\` otherwise.`,
    input_format: `A single line containing the string \`s\`.`,
    output_format: `Print \`true\` or \`false\`.`,
    constraints: `1 <= s.length <= 2 * 10^5\ns consists only of printable ASCII characters.`,
    sample_test_cases: [
      {
        input: 'A man, a plan, a canal: Panama',
        output: 'true',
        explanation: 'After cleaning: "amanaplanacanalpanama" is a palindrome.',
        is_hidden: false,
      },
      {
        input: 'race a car',
        output: 'false',
        explanation: 'After cleaning: "raceacar" is not a palindrome.',
        is_hidden: false,
      },
    ],
    hidden_test_cases: [
      { input: ' ', output: 'true', is_hidden: true },
      { input: '0P', output: 'false', is_hidden: true },
      { input: 'ab_a', output: 'true', is_hidden: true },
    ],
    hints: [
      'Filter out non-alphanumeric characters and convert uppercase to lowercase.',
      'Compare characters from the left and right pointers moving inward.',
    ],
    solution_explanation: `Two pointers: left = 0, right = s.length - 1. Skip non-alphanumeric chars, compare lowercased chars.`,
    starter_templates: {
      c: `#include <stdio.h>
#include <string.h>
#include <ctype.h>

int main() {
    char s[200005];
    if (!fgets(s, sizeof(s), stdin)) return 0;

    // TODO: Write your solution here
    // Print "true" or "false"

    return 0;
}
`,
      cpp: `#include <iostream>
#include <string>
#include <cctype>

using namespace std;

int main() {
    string s;
    getline(cin, s);

    // TODO: Write your solution here
    // Print "true" or "false"

    return 0;
}
`,
      python: `import sys

def solve():
    s = sys.stdin.read().rstrip('\\n')

    # TODO: Write your solution here
    # Print "true" or "false"

if __name__ == '__main__':
    solve()
`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine() : "";

        // TODO: Write your solution here
        // Print "true" or "false"

    }
}
`,
      javascript: `const fs = require('fs');

function solve() {
    const s = fs.readFileSync(0, 'utf-8').replace(/\\r?\\n$/, '');

    // TODO: Write your solution here
    // Print "true" or "false"

}

solve();
`,
      typescript: `import * as fs from 'fs';

function solve(): void {
    const s: string = fs.readFileSync(0, 'utf-8').replace(/\\r?\\n$/, '');

    // TODO: Write your solution here
    // Print "true" or "false"

}

solve();
`,
    },
    order: 4,
  },

  // =========================================================================
  // 5. STRINGS - Easy: Longest Common Prefix
  // =========================================================================
  {
    title: 'Longest Common Prefix',
    slug: 'longest-common-prefix',
    difficulty: 'Easy',
    topic: 'Strings',
    tags: ['String', 'Trie'],
    description: `Write a program to find the longest common prefix string amongst an array of strings.

If there is no common prefix, print \`""\` (empty string or empty line).`,
    input_format: `The first line contains an integer \`n\` representing the number of strings.
The next \`n\` lines each contain a single string.`,
    output_format: `Print the longest common prefix string.`,
    constraints: `1 <= n <= 200\n0 <= strings[i].length <= 200`,
    sample_test_cases: [
      {
        input: '3\nflower\nflow\nflight',
        output: 'fl',
        explanation: '"fl" is the longest common prefix.',
        is_hidden: false,
      },
      {
        input: '3\ndog\nracecar\ncar',
        output: '',
        explanation: 'There is no common prefix among the input strings.',
        is_hidden: false,
      },
    ],
    hidden_test_cases: [
      { input: '1\na', output: 'a', is_hidden: true },
      { input: '2\ninterview\nintermediate', output: 'inter', is_hidden: true },
      { input: '3\nthrone\nthrone\nthrone', output: 'throne', is_hidden: true },
    ],
    hints: [
      'Compare characters column by column across all strings.',
      'Stop as soon as a mismatch occurs or string ends.',
    ],
    solution_explanation: `Take the first string as candidate prefix. Compare each character with subsequent strings.`,
    starter_templates: {
      c: `#include <stdio.h>
#include <string.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    char strs[205][205];
    for (int i = 0; i < n; i++) scanf("%s", strs[i]);

    // TODO: Write your solution here
    // Print the longest common prefix

    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <string>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<string> strs(n);
    for (int i = 0; i < n; i++) cin >> strs[i];

    // TODO: Write your solution here

    return 0;
}
`,
      python: `import sys

def solve():
    lines = sys.stdin.read().split()
    if not lines:
        return
    n = int(lines[0])
    strs = lines[1:1+n]

    # TODO: Write your solution here

if __name__ == '__main__':
    solve()
`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        String[] strs = new String[n];
        for (int i = 0; i < n; i++) strs[i] = sc.next();

        // TODO: Write your solution here

    }
}
`,
      javascript: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 1) return;
    const n = parseInt(input[0], 10);
    const strs = input.slice(1, 1 + n);

    // TODO: Write your solution here

}

solve();
`,
      typescript: `import * as fs from 'fs';

function solve(): void {
    const input: string[] = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 1) return;
    const n: number = parseInt(input[0], 10);
    const strs: string[] = input.slice(1, 1 + n);

    // TODO: Write your solution here

}

solve();
`,
    },
    order: 5,
  },

  // =========================================================================
  // 6. SEARCHING - Easy: Binary Search
  // =========================================================================
  {
    title: 'Binary Search',
    slug: 'binary-search',
    difficulty: 'Easy',
    topic: 'Searching',
    tags: ['Array', 'Binary Search'],
    description: `Given an array of integers \`nums\` which is sorted in **ascending order**, and an integer \`target\`, write a program to search \`target\` in \`nums\`.

If \`target\` exists, print its **0-based index**. Otherwise, print \`-1\`.

You must write an algorithm with **O(log n)** runtime complexity.`,
    input_format: `The first line contains two integers \`n\` and \`target\`.
The second line contains \`n\` space-separated sorted integers.`,
    output_format: `Print the index of \`target\` or \`-1\`.`,
    constraints: `1 <= n <= 10^5\n-10^4 < nums[i], target < 10^4\nAll integers in nums are unique and sorted in ascending order.`,
    sample_test_cases: [
      {
        input: '6 9\n-1 0 3 5 9 12',
        output: '4',
        explanation: '9 exists in nums and its index is 4.',
        is_hidden: false,
      },
      {
        input: '6 2\n-1 0 3 5 9 12',
        output: '-1',
        explanation: '2 does not exist in nums so print -1.',
        is_hidden: false,
      },
    ],
    hidden_test_cases: [
      { input: '1 5\n5', output: '0', is_hidden: true },
      { input: '2 1\n2 5', output: '-1', is_hidden: true },
      { input: '5 -5\n-5 -2 0 3 7', output: '0', is_hidden: true },
    ],
    hints: [
      'Maintain two pointers: low = 0 and high = n - 1.',
      'Calculate mid = low + (high - low) / 2 to avoid overflow.',
      'If nums[mid] == target, return mid. If nums[mid] < target, search right. Otherwise, search left.',
    ],
    solution_explanation: `Standard Binary Search: low = 0, high = n - 1. Halve search interval each step. O(log N) time, O(1) space.`,
    starter_templates: {
      c: `#include <stdio.h>

int main() {
    int n, target;
    if (scanf("%d %d", &n, &target) != 2) return 0;
    int nums[n];
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);

    // TODO: Write your solution here (Binary Search in O(log n))
    // Print the index or -1

    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    int n, target;
    if (!(cin >> n >> target)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];

    // TODO: Write your solution here

    return 0;
}
`,
      python: `import sys

def solve():
    lines = sys.stdin.read().split()
    if not lines:
        return
    n = int(lines[0])
    target = int(lines[1])
    nums = [int(x) for x in lines[2:2+n]]

    # TODO: Write your solution here

if __name__ == '__main__':
    solve()
`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int target = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();

        // TODO: Write your solution here

    }
}
`,
      javascript: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 2) return;
    const n = parseInt(input[0], 10);
    const target = parseInt(input[1], 10);
    const nums = input.slice(2, 2 + n).map(Number);

    // TODO: Write your solution here

}

solve();
`,
      typescript: `import * as fs from 'fs';

function solve(): void {
    const input: string[] = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 2) return;
    const n: number = parseInt(input[0], 10);
    const target: number = parseInt(input[1], 10);
    const nums: number[] = input.slice(2, 2 + n).map(Number);

    // TODO: Write your solution here

}

solve();
`,
    },
    order: 6,
  },

  // =========================================================================
  // 7. SEARCHING - Medium: Search in Rotated Sorted Array
  // =========================================================================
  {
    title: 'Search in Rotated Sorted Array',
    slug: 'search-in-rotated-sorted-array',
    difficulty: 'Medium',
    topic: 'Searching',
    tags: ['Array', 'Binary Search'],
    description: `Given an integer array \`nums\` sorted in ascending order (with distinct values) that was **rotated** at an unknown pivot index, and a \`target\` value, search for \`target\` in \`nums\`.

If \`target\` is found, print its index. Otherwise, print \`-1\`. You must achieve **O(log n)** runtime.`,
    input_format: `The first line contains \`n\` and \`target\`.
The second line contains \`n\` space-separated integers.`,
    output_format: `Print the index of \`target\` or \`-1\`.`,
    constraints: `1 <= n <= 5000\n-10^4 <= nums[i], target <= 10^4\nAll values of nums are unique.`,
    sample_test_cases: [
      {
        input: '7 0\n4 5 6 7 0 1 2',
        output: '4',
        explanation: '0 is found at index 4.',
        is_hidden: false,
      },
      {
        input: '7 3\n4 5 6 7 0 1 2',
        output: '-1',
        explanation: '3 is not in the array.',
        is_hidden: false,
      },
    ],
    hidden_test_cases: [
      { input: '1 0\n0', output: '0', is_hidden: true },
      { input: '3 1\n5 1 3', output: '1', is_hidden: true },
    ],
    hints: [
      'In a rotated sorted array, one half is always strictly sorted.',
      'Check if target lies within the sorted half; if so, search there, else search the other half.',
    ],
    solution_explanation: `Modified binary search: determine which half [low..mid] or [mid..high] is sorted, then check if target is in range.`,
    starter_templates: {
      c: `#include <stdio.h>

int main() {
    int n, target;
    if (scanf("%d %d", &n, &target) != 2) return 0;
    int nums[n];
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);

    // TODO: Write your solution here

    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n, target;
    if (!(cin >> n >> target)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];

    // TODO: Write your solution here

    return 0;
}
`,
      python: `import sys

def solve():
    lines = sys.stdin.read().split()
    if not lines:
        return
    n = int(lines[0])
    target = int(lines[1])
    nums = [int(x) for x in lines[2:2+n]]

    # TODO: Write your solution here

if __name__ == '__main__':
    solve()
`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int target = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();

        // TODO: Write your solution here

    }
}
`,
      javascript: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 2) return;
    const n = parseInt(input[0], 10);
    const target = parseInt(input[1], 10);
    const nums = input.slice(2, 2 + n).map(Number);

    // TODO: Write your solution here

}

solve();
`,
      typescript: `import * as fs from 'fs';

function solve(): void {
    const input: string[] = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 2) return;
    const n: number = parseInt(input[0], 10);
    const target: number = parseInt(input[1], 10);
    const nums: number[] = input.slice(2, 2 + n).map(Number);

    // TODO: Write your solution here

}

solve();
`,
    },
    order: 7,
  },

  // =========================================================================
  // 8. SORTING - Easy: Sort an Array
  // =========================================================================
  {
    title: 'Sort an Array',
    slug: 'sort-an-array',
    difficulty: 'Easy',
    topic: 'Sorting',
    tags: ['Array', 'Sorting', 'Merge Sort', 'Quick Sort'],
    description: `Given an array of integers \`nums\`, sort the array in **ascending order** and print the sorted array space-separated.

Try to solve it without using built-in library sort functions.`,
    input_format: `The first line contains an integer \`n\`.
The second line contains \`n\` space-separated integers.`,
    output_format: `Print the \`n\` integers sorted in ascending order separated by a space.`,
    constraints: `1 <= n <= 5 * 10^4\n-5 * 10^4 <= nums[i] <= 5 * 10^4`,
    sample_test_cases: [
      {
        input: '4\n5 2 3 1',
        output: '1 2 3 5',
        explanation: 'The sorted array is 1, 2, 3, 5.',
        is_hidden: false,
      },
      {
        input: '6\n5 1 1 2 0 0',
        output: '0 0 1 1 2 5',
        explanation: 'Duplicates are handled properly.',
        is_hidden: false,
      },
    ],
    hidden_test_cases: [
      { input: '1\n10', output: '10', is_hidden: true },
      { input: '5\n-4 0 7 4 9', output: '-4 0 4 7 9', is_hidden: true },
    ],
    hints: [
      'Use Merge Sort or Quick Sort to achieve O(N log N) runtime.',
    ],
    solution_explanation: `Implement Merge Sort: divide array into halves, recursively sort, and merge in O(N log N).`,
    starter_templates: {
      c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int nums[n];
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);

    // TODO: Write your sorting algorithm here
    // Print the sorted array space-separated

    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];

    // TODO: Write your sorting algorithm here

    return 0;
}
`,
      python: `import sys

def solve():
    lines = sys.stdin.read().split()
    if not lines:
        return
    n = int(lines[0])
    nums = [int(x) for x in lines[1:1+n]]

    # TODO: Write your sorting algorithm here
    # Print sorted numbers space-separated

if __name__ == '__main__':
    solve()
`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();

        // TODO: Write your sorting algorithm here

    }
}
`,
      javascript: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 1) return;
    const n = parseInt(input[0], 10);
    const nums = input.slice(1, 1 + n).map(Number);

    // TODO: Write your sorting algorithm here

}

solve();
`,
      typescript: `import * as fs from 'fs';

function solve(): void {
    const input: string[] = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 1) return;
    const n: number = parseInt(input[0], 10);
    const nums: number[] = input.slice(1, 1 + n).map(Number);

    // TODO: Write your sorting algorithm here

}

solve();
`,
    },
    order: 8,
  },

  // =========================================================================
  // 9. RECURSION - Easy: Fibonacci Number
  // =========================================================================
  {
    title: 'Fibonacci Number',
    slug: 'fibonacci-number',
    difficulty: 'Easy',
    topic: 'Recursion',
    tags: ['Math', 'Dynamic Programming', 'Recursion'],
    description: `The **Fibonacci numbers**, commonly denoted \`F(n)\`, form a sequence such that each number is the sum of the two preceding ones, starting from \`0\` and \`1\`. That is:
- F(0) = 0, F(1) = 1
- F(n) = F(n - 1) + F(n - 2), for n > 1.

Given \`n\`, calculate \`F(n)\`.`,
    input_format: `A single line containing the integer \`n\`.`,
    output_format: `Print the integer value of \`F(n)\`.`,
    constraints: `0 <= n <= 30`,
    sample_test_cases: [
      {
        input: '2',
        output: '1',
        explanation: 'F(2) = F(1) + F(0) = 1 + 0 = 1.',
        is_hidden: false,
      },
      {
        input: '3',
        output: '2',
        explanation: 'F(3) = F(2) + F(1) = 1 + 1 = 2.',
        is_hidden: false,
      },
      {
        input: '4',
        output: '3',
        explanation: 'F(4) = F(3) + F(2) = 2 + 1 = 3.',
        is_hidden: false,
      },
    ],
    hidden_test_cases: [
      { input: '0', output: '0', is_hidden: true },
      { input: '1', output: '1', is_hidden: true },
      { input: '10', output: '55', is_hidden: true },
    ],
    hints: [
      'Base cases: if n <= 1 return n.',
      'Use recursion or iteration with two variables to compute F(n) in O(n) time.',
    ],
    solution_explanation: `Recursive: f(n) = f(n-1) + f(n-2) with base cases 0 and 1. Iterative in O(n) time and O(1) space.`,
    starter_templates: {
      c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;

    // TODO: Write your recursive or iterative function here
    // Print F(n)

    return 0;
}
`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;

    // TODO: Write your solution here

    return 0;
}
`,
      python: `import sys

def solve():
    line = sys.stdin.read().strip()
    if not line:
        return
    n = int(line)

    # TODO: Write your solution here

if __name__ == '__main__':
    solve()
`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();

        // TODO: Write your solution here

    }
}
`,
      javascript: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim();
    if (!input) return;
    const n = parseInt(input, 10);

    // TODO: Write your solution here

}

solve();
`,
      typescript: `import * as fs from 'fs';

function solve(): void {
    const input: string = fs.readFileSync(0, 'utf-8').trim();
    if (!input) return;
    const n: number = parseInt(input, 10);

    // TODO: Write your solution here

}

solve();
`,
    },
    order: 9,
  },

  // =========================================================================
  // 10. STACKS - Easy: Valid Parentheses
  // =========================================================================
  {
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    difficulty: 'Easy',
    topic: 'Stacks',
    tags: ['Stack', 'String'],
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

Print \`true\` if valid, or \`false\` otherwise.`,
    input_format: `A single line containing the string \`s\`.`,
    output_format: `Print \`true\` or \`false\`.`,
    constraints: `1 <= s.length <= 10^4\ns consists of parentheses only \`'()[]{}'\`.`,
    sample_test_cases: [
      {
        input: '()',
        output: 'true',
        explanation: 'Simple valid parenthesis.',
        is_hidden: false,
      },
      {
        input: '()[]{}',
        output: 'true',
        explanation: 'Multiple valid bracket sets.',
        is_hidden: false,
      },
      {
        input: '(]',
        output: 'false',
        explanation: 'Opening ( cannot be closed by ].',
        is_hidden: false,
      },
    ],
    hidden_test_cases: [
      { input: '([)]', output: 'false', is_hidden: true },
      { input: '{[]}', output: 'true', is_hidden: true },
      { input: ']', output: 'false', is_hidden: true },
    ],
    hints: [
      'Use a Stack to keep track of opening brackets.',
      'When encountering a closing bracket, check if it matches the top of the stack.',
    ],
    solution_explanation: `Push opening brackets onto stack. For closing brackets, pop and check if matching. Stack must be empty at end.`,
    starter_templates: {
      c: `#include <stdio.h>
#include <string.h>

int main() {
    char s[10005];
    if (scanf("%s", s) != 1) return 0;

    // TODO: Write your stack logic here
    // Print "true" or "false"

    return 0;
}
`,
      cpp: `#include <iostream>
#include <string>
#include <stack>

using namespace std;

int main() {
    string s;
    if (!(cin >> s)) return 0;

    // TODO: Write your stack solution here
    // Print "true" or "false"

    return 0;
}
`,
      python: `import sys

def solve():
    s = sys.stdin.read().strip()
    if not s:
        return

    # TODO: Write your stack solution here
    # Print "true" or "false"

if __name__ == '__main__':
    solve()
`,
      java: `import java.util.Scanner;
import java.util.Stack;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();

        // TODO: Write your stack solution here
        // Print "true" or "false"

    }
}
`,
      javascript: `const fs = require('fs');

function solve() {
    const s = fs.readFileSync(0, 'utf-8').trim();
    if (!s) return;

    // TODO: Write your stack solution here
    // Print "true" or "false"

}

solve();
`,
      typescript: `import * as fs from 'fs';

function solve(): void {
    const s: string = fs.readFileSync(0, 'utf-8').trim();
    if (!s) return;

    // TODO: Write your stack solution here
    // Print "true" or "false"

}

solve();
`,
    },
    order: 10,
  },

  // =========================================================================
  // 11. HASHING - Easy: Contains Duplicate
  // =========================================================================
  {
    title: 'Contains Duplicate',
    slug: 'contains-duplicate',
    difficulty: 'Easy',
    topic: 'Hashing',
    tags: ['Array', 'Hash Table', 'Sorting'],
    description: `Given an integer array \`nums\`, print \`true\` if any value appears **at least twice** in the array, and print \`false\` if every element is distinct.`,
    input_format: `The first line contains an integer \`n\`.
The second line contains \`n\` space-separated integers.`,
    output_format: `Print \`true\` or \`false\`.`,
    constraints: `1 <= n <= 10^5\n-10^9 <= nums[i] <= 10^9`,
    sample_test_cases: [
      {
        input: '4\n1 2 3 1',
        output: 'true',
        explanation: '1 appears twice.',
        is_hidden: false,
      },
      {
        input: '4\n1 2 3 4',
        output: 'false',
        explanation: 'All elements are distinct.',
        is_hidden: false,
      },
    ],
    hidden_test_cases: [
      { input: '1\n100', output: 'false', is_hidden: true },
      { input: '5\n1 1 1 3 3', output: 'true', is_hidden: true },
    ],
    hints: [
      'Can you use a Hash Set to track seen elements in O(N)?',
    ],
    solution_explanation: `Insert each element into a hash set. If it already exists, return true. O(N) time and O(N) space.`,
    starter_templates: {
      c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int nums[n];
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);

    // TODO: Write your solution here
    // Print "true" or "false"

    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_set>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];

    // TODO: Write your solution here

    return 0;
}
`,
      python: `import sys

def solve():
    lines = sys.stdin.read().split()
    if not lines:
        return
    n = int(lines[0])
    nums = [int(x) for x in lines[1:1+n]]

    # TODO: Write your solution here

if __name__ == '__main__':
    solve()
`,
      java: `import java.util.Scanner;
import java.util.HashSet;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();

        // TODO: Write your solution here

    }
}
`,
      javascript: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 1) return;
    const n = parseInt(input[0], 10);
    const nums = input.slice(1, 1 + n).map(Number);

    // TODO: Write your solution here

}

solve();
`,
      typescript: `import * as fs from 'fs';

function solve(): void {
    const input: string[] = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 1) return;
    const n: number = parseInt(input[0], 10);
    const nums: number[] = input.slice(1, 1 + n).map(Number);

    // TODO: Write your solution here

}

solve();
`,
    },
    order: 11,
  },

  // =========================================================================
  // 12. LINKED LISTS - Easy: Reverse Linked List
  // =========================================================================
  {
    title: 'Reverse Linked List',
    slug: 'reverse-linked-list',
    difficulty: 'Easy',
    topic: 'Linked Lists',
    tags: ['Linked List', 'Recursion'],
    description: `Given the head of a singly linked list represented as an array of values, reverse the list and print the reversed values separated by a space.`,
    input_format: `The first line contains an integer \`n\` (number of nodes).
The second line contains \`n\` space-separated integers representing node values from head to tail.`,
    output_format: `Print the values of the reversed linked list separated by a space.`,
    constraints: `0 <= n <= 5000\n-5000 <= Node.val <= 5000`,
    sample_test_cases: [
      {
        input: '5\n1 2 3 4 5',
        output: '5 4 3 2 1',
        explanation: '1->2->3->4->5 reversed becomes 5->4->3->2->1.',
        is_hidden: false,
      },
      {
        input: '2\n1 2',
        output: '2 1',
        explanation: '1->2 reversed is 2->1.',
        is_hidden: false,
      },
    ],
    hidden_test_cases: [
      { input: '1\n42', output: '42', is_hidden: true },
      { input: '4\n10 20 30 40', output: '40 30 20 10', is_hidden: true },
    ],
    hints: [
      'Maintain three pointers: prev = NULL, curr = head, next = NULL.',
      'Iterate through the list reversing curr->next = prev.',
    ],
    solution_explanation: `Standard 3-pointer linked list reversal: prev, curr, next. O(N) time and O(1) space.`,
    starter_templates: {
      c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1 || n <= 0) return 0;
    int vals[n];
    for (int i = 0; i < n; i++) scanf("%d", &vals[i]);

    // TODO: Write your linked list reversal solution here
    // Print the reversed values separated by space

    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    if (!(cin >> n) || n <= 0) return 0;
    vector<int> vals(n);
    for (int i = 0; i < n; i++) cin >> vals[i];

    // TODO: Write your solution here

    return 0;
}
`,
      python: `import sys

def solve():
    lines = sys.stdin.read().split()
    if not lines:
        return
    n = int(lines[0])
    vals = [int(x) for x in lines[1:1+n]]

    # TODO: Write your solution here

if __name__ == '__main__':
    solve()
`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] vals = new int[n];
        for (int i = 0; i < n; i++) vals[i] = sc.nextInt();

        // TODO: Write your solution here

    }
}
`,
      javascript: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 1) return;
    const n = parseInt(input[0], 10);
    const vals = input.slice(1, 1 + n).map(Number);

    // TODO: Write your solution here

}

solve();
`,
      typescript: `import * as fs from 'fs';

function solve(): void {
    const input: string[] = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 1) return;
    const n: number = parseInt(input[0], 10);
    const vals: number[] = input.slice(1, 1 + n).map(Number);

    // TODO: Write your solution here

}

solve();
`,
    },
    order: 12,
  },

  // =========================================================================
  // 13. DYNAMIC PROGRAMMING - Easy: Climbing Stairs
  // =========================================================================
  {
    title: 'Climbing Stairs',
    slug: 'climbing-stairs',
    difficulty: 'Easy',
    topic: 'Dynamic Programming',
    tags: ['Math', 'Dynamic Programming', 'Memoization'],
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb \`1\` or \`2\` steps. In how many **distinct ways** can you climb to the top?`,
    input_format: `A single integer \`n\`.`,
    output_format: `Print the number of distinct ways to reach the top.`,
    constraints: `1 <= n <= 45`,
    sample_test_cases: [
      {
        input: '2',
        output: '2',
        explanation: 'There are two ways: (1 + 1) or (2).',
        is_hidden: false,
      },
      {
        input: '3',
        output: '3',
        explanation: 'Three ways: (1+1+1), (1+2), (2+1).',
        is_hidden: false,
      },
    ],
    hidden_test_cases: [
      { input: '1', output: '1', is_hidden: true },
      { input: '4', output: '5', is_hidden: true },
      { input: '5', output: '8', is_hidden: true },
    ],
    hints: [
      'To reach step n, you must arrive from either step n-1 or step n-2.',
      'ways(n) = ways(n-1) + ways(n-2), exactly like the Fibonacci sequence!',
    ],
    solution_explanation: `DP: dp[i] = dp[i-1] + dp[i-2] with dp[1]=1, dp[2]=2. O(N) time and O(1) space.`,
    starter_templates: {
      c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;

    // TODO: Write your DP solution here
    // Print the number of distinct ways

    return 0;
}
`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;

    // TODO: Write your solution here

    return 0;
}
`,
      python: `import sys

def solve():
    line = sys.stdin.read().strip()
    if not line:
        return
    n = int(line)

    # TODO: Write your solution here

if __name__ == '__main__':
    solve()
`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();

        // TODO: Write your solution here

    }
}
`,
      javascript: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim();
    if (!input) return;
    const n = parseInt(input, 10);

    // TODO: Write your solution here

}

solve();
`,
      typescript: `import * as fs from 'fs';

function solve(): void {
    const input: string[] = fs.readFileSync(0, 'utf-8').trim();
    if (!input) return;
    const n: number = parseInt(input, 10);

    // TODO: Write your solution here

}

solve();
`,
    },
    order: 13,
  },

  // =========================================================================
  // 14. GREEDY - Medium: Jump Game
  // =========================================================================
  {
    title: 'Jump Game',
    slug: 'jump-game',
    difficulty: 'Medium',
    topic: 'Greedy Algorithms',
    tags: ['Array', 'Dynamic Programming', 'Greedy'],
    description: `You are given an integer array \`nums\`. You are initially positioned at the array's **first index**, and each element in the array represents your maximum jump length at that position.

Print \`true\` if you can reach the last index, or \`false\` otherwise.`,
    input_format: `The first line contains an integer \`n\`.
The second line contains \`n\` space-separated integers.`,
    output_format: `Print \`true\` or \`false\`.`,
    constraints: `1 <= n <= 10^4\n0 <= nums[i] <= 10^5`,
    sample_test_cases: [
      {
        input: '5\n2 3 1 1 4',
        output: 'true',
        explanation: 'Jump 1 step from index 0 to 1, then 3 steps to the last index.',
        is_hidden: false,
      },
      {
        input: '5\n3 2 1 0 4',
        output: 'false',
        explanation: 'You will always arrive at index 3 where jump length is 0.',
        is_hidden: false,
      },
    ],
    hidden_test_cases: [
      { input: '1\n0', output: 'true', is_hidden: true },
      { input: '2\n2 0', output: 'true', is_hidden: true },
      { input: '3\n0 2 3', output: 'false', is_hidden: true },
    ],
    hints: [
      'Keep track of the maximum reachable index as you iterate through the array.',
      'If the current index i > maxReach, you can never reach index i or beyond!',
    ],
    solution_explanation: `Greedy: maxReach = 0. For each index i: if i > maxReach return false; maxReach = max(maxReach, i + nums[i]). If maxReach >= n - 1 return true.`,
    starter_templates: {
      c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int nums[n];
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);

    // TODO: Write your greedy jump logic here
    // Print "true" or "false"

    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];

    // TODO: Write your solution here

    return 0;
}
`,
      python: `import sys

def solve():
    lines = sys.stdin.read().split()
    if not lines:
        return
    n = int(lines[0])
    nums = [int(x) for x in lines[1:1+n]]

    # TODO: Write your solution here

if __name__ == '__main__':
    solve()
`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();

        // TODO: Write your solution here

    }
}
`,
      javascript: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 1) return;
    const n = parseInt(input[0], 10);
    const nums = input.slice(1, 1 + n).map(Number);

    // TODO: Write your solution here

}

solve();
`,
      typescript: `import * as fs from 'fs';

function solve(): void {
    const input: string[] = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 1) return;
    const n: number = parseInt(input[0], 10);
    const nums: number[] = input.slice(1, 1 + n).map(Number);

    // TODO: Write your solution here

}

solve();
`,
    },
    order: 14,
  },

  // =========================================================================
  // 15. TREES - Easy: Maximum Depth of Binary Tree
  // =========================================================================
  {
    title: 'Maximum Depth of Binary Tree',
    slug: 'maximum-depth-of-binary-tree',
    difficulty: 'Easy',
    topic: 'Trees',
    tags: ['Tree', 'Depth-First Search', 'Breadth-First Search', 'Binary Tree'],
    description: `Given a binary tree represented as level-order space-separated integers where \`-1\` indicates a null node, find its **maximum depth**.

A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.`,
    input_format: `The first line contains an integer \`n\` (number of elements in level-order representation).
The second line contains \`n\` space-separated integers (-1 denotes null).`,
    output_format: `Print the integer maximum depth of the tree.`,
    constraints: `0 <= n <= 10^4\n-100 <= Node.val <= 100`,
    sample_test_cases: [
      {
        input: '7\n3 9 20 -1 -1 15 7',
        output: '3',
        explanation: 'Root 3 has depth 1, 20 has depth 2, and 15/7 have depth 3.',
        is_hidden: false,
      },
      {
        input: '2\n1 -1 2',
        output: '2',
        explanation: 'Depth is 2.',
        is_hidden: false,
      },
    ],
    hidden_test_cases: [
      { input: '0', output: '0', is_hidden: true },
      { input: '1\n10', output: '1', is_hidden: true },
      { input: '3\n1 2 3', output: '2', is_hidden: true },
    ],
    hints: [
      'Depth of an empty tree is 0.',
      'Depth of root = 1 + max(depth(left), depth(right)).',
    ],
    solution_explanation: `DFS recursion: maxDepth(root) = 1 + max(maxDepth(root.left), maxDepth(root.right)). O(N) time.`,
    starter_templates: {
      c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1 || n <= 0) {
        printf("0\\n");
        return 0;
    }
    int nodes[n];
    for (int i = 0; i < n; i++) scanf("%d", &nodes[i]);

    // TODO: Write your tree depth solution here
    // Print the maximum depth

    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    if (!(cin >> n) || n <= 0) {
        cout << 0 << endl;
        return 0;
    }
    vector<int> nodes(n);
    for (int i = 0; i < n; i++) cin >> nodes[i];

    // TODO: Write your solution here

    return 0;
}
`,
      python: `import sys

def solve():
    lines = sys.stdin.read().split()
    if not lines:
        print(0)
        return
    n = int(lines[0])
    if n == 0:
        print(0)
        return
    nodes = [int(x) for x in lines[1:1+n]]

    # TODO: Write your solution here

if __name__ == '__main__':
    solve()
`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) {
            System.out.println(0);
            return;
        }
        int n = sc.nextInt();
        if (n <= 0) {
            System.out.println(0);
            return;
        }
        int[] nodes = new int[n];
        for (int i = 0; i < n; i++) nodes[i] = sc.nextInt();

        // TODO: Write your solution here

    }
}
`,
      javascript: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 1 || input[0] === '0') {
        console.log(0);
        return;
    }
    const n = parseInt(input[0], 10);
    const nodes = input.slice(1, 1 + n).map(Number);

    // TODO: Write your solution here

}

solve();
`,
      typescript: `import * as fs from 'fs';

function solve(): void {
    const input: string[] = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 1 || input[0] === '0') {
        console.log(0);
        return;
    }
    const n: number = parseInt(input[0], 10);
    const nodes: number[] = input.slice(1, 1 + n).map(Number);

    // TODO: Write your solution here

}

solve();
`,
    },
    order: 15,
  },

  // =========================================================================
  // 16. GRAPHS - Medium: Number of Islands
  // =========================================================================
  {
    title: 'Number of Islands',
    slug: 'number-of-islands',
    difficulty: 'Medium',
    topic: 'Graphs',
    tags: ['Array', 'Depth-First Search', 'Breadth-First Search', 'Union Find', 'Matrix'],
    description: `Given an \`m x n\` 2D binary grid \`grid\` which represents a map of \`'1'\`s (land) and \`'0'\`s (water), print the **number of islands**.

An **island** is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.`,
    input_format: `The first line contains two integers \`m\` and \`n\`.
The next \`m\` lines each contain \`n\` space-separated characters (\`'1'\` or \`'0'\`).`,
    output_format: `Print a single integer representing the number of islands.`,
    constraints: `1 <= m, n <= 300\ngrid[i][j] is '0' or '1'`,
    sample_test_cases: [
      {
        input: '4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0',
        output: '1',
        explanation: 'All 1s are connected into one single island.',
        is_hidden: false,
      },
      {
        input: '4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1',
        output: '3',
        explanation: 'There are 3 separate islands.',
        is_hidden: false,
      },
    ],
    hidden_test_cases: [
      { input: '1 1\n0', output: '0', is_hidden: true },
      { input: '1 1\n1', output: '1', is_hidden: true },
      { input: '3 3\n1 0 1\n0 1 0\n1 0 1', output: '5', is_hidden: true },
    ],
    hints: [
      'Iterate through the grid. When you find a \'1\', increment islandCount and trigger a DFS/BFS to sink the entire island to \'0\'.',
    ],
    solution_explanation: `DFS traversal: for each (r, c) == '1', DFS all 4 neighbors sinking visited '1's to '0'. Count components.`,
    starter_templates: {
      c: `#include <stdio.h>

int main() {
    int m, n;
    if (scanf("%d %d", &m, &n) != 2) return 0;
    char grid[305][305];
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            scanf(" %c", &grid[i][j]);
        }
    }

    // TODO: Write your BFS/DFS connected components solution here
    // Print the number of islands

    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int m, n;
    if (!(cin >> m >> n)) return 0;
    vector<vector<char>> grid(m, vector<char>(n));
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            cin >> grid[i][j];
        }
    }

    // TODO: Write your BFS/DFS solution here

    return 0;
}
`,
      python: `import sys

def solve():
    lines = sys.stdin.read().split()
    if not lines:
        return
    m = int(lines[0])
    n = int(lines[1])
    tokens = lines[2:2 + m * n]
    grid = [tokens[i * n:(i + 1) * n] for i in range(m)]

    # TODO: Write your BFS/DFS solution here
    # Print the number of islands

if __name__ == '__main__':
    solve()
`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int m = sc.nextInt();
        int n = sc.nextInt();
        char[][] grid = new char[m][n];
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                grid[i][j] = sc.next().charAt(0);
            }
        }

        // TODO: Write your BFS/DFS solution here

    }
}
`,
      javascript: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 2) return;
    const m = parseInt(input[0], 10);
    const n = parseInt(input[1], 10);
    const tokens = input.slice(2, 2 + m * n);

    // TODO: Write your BFS/DFS solution here

}

solve();
`,
      typescript: `import * as fs from 'fs';

function solve(): void {
    const input: string[] = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 2) return;
    const m: number = parseInt(input[0], 10);
    const n: number = parseInt(input[1], 10);
    const tokens: string[] = input.slice(2, 2 + m * n);

    // TODO: Write your BFS/DFS solution here

}

solve();
`,
    },
    order: 16,
  },
];

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI missing in .env');
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB');

    for (const prob of problems) {
      await CodingProblem.findOneAndUpdate(
        { slug: prob.slug },
        prob,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`[Seed] Updated: "${prob.title}" (${prob.difficulty} - ${prob.topic}) - No auto-solutions!`);
    }

    console.log(`[Seed] Successfully updated ${problems.length} DSA problems with genuine unsolved starter templates!`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
}

seed();
