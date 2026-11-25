/**
 * SANKALP AI - Coding Practice Lab Problem Seed Script
 * Pre-populates essential DSA problems across all 14 topics and 3 difficulty tiers
 * with starter templates for C, C++, Python, Java, JavaScript, and TypeScript.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const CodingProblem = require('../models/CodingProblem');

const problems = [
  // 1. ARRAYS - Easy
  {
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'Easy',
    topic: 'Arrays',
    tags: ['Array', 'Hash Table', 'Two Pointers'],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the **indices** of the two numbers such that they add up to \`target\`.

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
        explanation: 'Because nums[0] + nums[1] == 2 + 7 == 9, we print 0 1.',
        is_hidden: false,
      },
      {
        input: '3 6\n3 2 4',
        output: '1 2',
        explanation: 'nums[1] + nums[2] == 2 + 4 == 6, so print 1 2.',
        is_hidden: false,
      },
    ],
    hidden_test_cases: [
      {
        input: '2 6\n3 3',
        output: '0 1',
        is_hidden: true,
      },
      {
        input: '5 10\n1 2 3 7 11',
        output: '2 3',
        is_hidden: true,
      },
      {
        input: '4 -8\n-3 -5 1 4',
        output: '0 1',
        is_hidden: true,
      },
    ],
    hints: [
      'Can you solve it in O(N²) using two nested loops first?',
      'How can a Hash Table or Dictionary store the complement (target - nums[i]) to achieve O(N) time?',
      'Check if the complement already exists in your map as you iterate through the array.',
    ],
    solution_explanation: `### Optimal Solution: Hash Map / Hash Table
1. Maintain a hash map storing value to its index.
2. For each number \`x\` at index \`i\`, compute \`diff = target - x\`.
3. If \`diff\` is already in the map, return \`[map[diff], i]\`.
4. Otherwise, record \`map[x] = i\`.
Time Complexity: O(N)
Space Complexity: O(N)`,
    starter_templates: {
      c: `#include <stdio.h>

int main() {
    int n, target;
    if (scanf("%d %d", &n, &target) != 2) return 0;
    int nums[n];
    for (int i = 0; i < n; i++) {
        scanf("%d", &nums[i]);
    }

    // Write your logic here
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (nums[i] + nums[j] == target) {
                printf("%d %d\\n", i, j);
                return 0;
            }
        }
    }
    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

int main() {
    int n, target;
    if (!(cin >> n >> target)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];

    unordered_map<int, int> seen;
    for (int i = 0; i < n; i++) {
        int complement = target - nums[i];
        if (seen.find(complement) != seen.end()) {
            cout << seen[complement] << " " << i << "\\n";
            return 0;
        }
        seen[nums[i]] = i;
    }
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

    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            print(f"{seen[complement]} {i}")
            return
        seen[num] = i

if __name__ == "__main__":
    solve()
`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int target = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();

        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < n; i++) {
            int comp = target - nums[i];
            if (map.containsKey(comp)) {
                System.out.println(map.get(comp) + " " + i);
                return;
            }
            map.put(nums[i], i);
        }
    }
}
`,
      javascript: `const fs = require('fs');

function main() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (input.length < 2) return;
    const n = parseInt(input[0], 10);
    const target = parseInt(input[1], 10);
    const nums = input.slice(2, 2 + n).map(Number);

    const map = new Map();
    for (let i = 0; i < n; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) {
            console.log(map.get(comp) + " " + i);
            return;
        }
        map.set(nums[i], i);
    }
}

main();
`,
      typescript: `import * as fs from 'fs';

function main(): void {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (input.length < 2) return;
    const n = parseInt(input[0], 10);
    const target = parseInt(input[1], 10);
    const nums: number[] = input.slice(2, 2 + n).map(Number);

    const map = new Map<number, number>();
    for (let i = 0; i < n; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) {
            console.log(map.get(comp) + " " + i);
            return;
        }
        map.set(nums[i], i);
    }
}

main();
`,
    },
    order: 1,
  },

  // 2. ARRAYS - Medium: Maximum Subarray (Kadane's Algorithm)
  {
    title: 'Maximum Subarray Sum',
    slug: 'maximum-subarray-sum',
    difficulty: 'Medium',
    topic: 'Arrays',
    tags: ['Array', 'Dynamic Programming', "Kadane's Algorithm"],
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return **its sum**.

A **subarray** is a contiguous non-empty sequence of elements within an array.`,
    input_format: `The first line contains an integer \`n\` representing the size of the array.
The second line contains \`n\` space-separated integers representing the array \`nums\`.`,
    output_format: `Print a single integer representing the maximum subarray sum.`,
    constraints: `1 <= n <= 10^5\n-10^4 <= nums[i] <= 10^4`,
    sample_test_cases: [
      {
        input: '9\n-2 1 -3 4 -1 2 1 -5 4',
        output: '6',
        explanation: 'The subarray [4, -1, 2, 1] has the largest sum 6.',
        is_hidden: false,
      },
      {
        input: '1\n1',
        output: '1',
        explanation: 'The single element array has sum 1.',
        is_hidden: false,
      },
    ],
    hidden_test_cases: [
      {
        input: '5\n5 4 -1 7 8',
        output: '23',
        is_hidden: true,
      },
      {
        input: '3\n-3 -2 -1',
        output: '-1',
        is_hidden: true,
      },
      {
        input: '4\n-1 -2 -3 -4',
        output: '-1',
        is_hidden: true,
      },
    ],
    hints: [
      'Can you think dynamically? If the current running sum drops below 0, is it helpful for future elements?',
      "This is famously solved using Kadane's Algorithm in O(N) time.",
      'Track current_sum = max(nums[i], current_sum + nums[i]) and max_sum = max(max_sum, current_sum).',
    ],
    solution_explanation: `### Kadane's Algorithm (O(N) Time, O(1) Space)
At each index \`i\`, we decide whether to add \`nums[i]\` to the ongoing sum or start a fresh subarray at \`nums[i]\`.
\`current_sum = max(nums[i], current_sum + nums[i])\`
\`max_sum = max(max_sum, current_sum)\``,
    starter_templates: {
      c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    long long nums[n];
    for (int i = 0; i < n; i++) scanf("%lld", &nums[i]);

    long long max_sum = nums[0];
    long long current_sum = nums[0];

    for (int i = 1; i < n; i++) {
        current_sum = (nums[i] > current_sum + nums[i]) ? nums[i] : (current_sum + nums[i]);
        if (current_sum > max_sum) max_sum = current_sum;
    }

    printf("%lld\\n", max_sum);
    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<long long> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];

    long long max_sum = nums[0];
    long long current_sum = nums[0];

    for (int i = 1; i < n; i++) {
        current_sum = max(nums[i], current_sum + nums[i]);
        max_sum = max(max_sum, current_sum);
    }

    cout << max_sum << "\\n";
    return 0;
}
`,
      python: `import sys

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = [int(x) for x in tokens[1:1+n]]

    max_sum = current_sum = nums[0]
    for x in nums[1:]:
        current_sum = max(x, current_sum + x)
        max_sum = max(max_sum, current_sum)

    print(max_sum)

if __name__ == "__main__":
    main()
`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        long[] nums = new long[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextLong();

        long maxSum = nums[0];
        long curSum = nums[0];

        for (int i = 1; i < n; i++) {
            curSum = Math.max(nums[i], curSum + nums[i]);
            maxSum = Math.max(maxSum, curSum);
        }

        System.out.println(maxSum);
    }
}
`,
      javascript: `const fs = require('fs');

function main() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input.length || input[0] === '') return;
    const n = parseInt(input[0], 10);
    const nums = input.slice(1, 1 + n).map(Number);

    let maxSum = nums[0];
    let curSum = nums[0];

    for (let i = 1; i < n; i++) {
        curSum = Math.max(nums[i], curSum + nums[i]);
        maxSum = Math.max(maxSum, curSum);
    }

    console.log(maxSum);
}

main();
`,
      typescript: `import * as fs from 'fs';

function main(): void {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input.length || input[0] === '') return;
    const n = parseInt(input[0], 10);
    const nums: number[] = input.slice(1, 1 + n).map(Number);

    let maxSum: number = nums[0];
    let curSum: number = nums[0];

    for (let i = 1; i < n; i++) {
        curSum = Math.max(nums[i], curSum + nums[i]);
        maxSum = Math.max(maxSum, curSum);
    }

    console.log(maxSum);
}

main();
`,
    },
    order: 2,
  },

  // 3. STRINGS - Easy: Valid Palindrome
  {
    title: 'Valid Palindrome',
    slug: 'valid-palindrome',
    difficulty: 'Easy',
    topic: 'Strings',
    tags: ['String', 'Two Pointers'],
    description: `A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string \`s\`, print \`true\` if it is a palindrome, or \`false\` otherwise.`,
    input_format: `A single line containing the string \`s\`.`,
    output_format: `Print \`true\` if \`s\` is a valid palindrome, or \`false\` otherwise.`,
    constraints: `1 <= s.length <= 2 * 10^5\ns consists only of printable ASCII characters.`,
    sample_test_cases: [
      {
        input: 'A man, a plan, a canal: Panama',
        output: 'true',
        explanation: '"amanaplanacanalpanama" reads identically forward and backward.',
        is_hidden: false,
      },
      {
        input: 'race a car',
        output: 'false',
        explanation: '"raceacar" is not a palindrome.',
        is_hidden: false,
      },
    ],
    hidden_test_cases: [
      {
        input: ' ',
        output: 'true',
        is_hidden: true,
      },
      {
        input: '0P',
        output: 'false',
        is_hidden: true,
      },
      {
        input: 'Madam, I\'m Adam',
        output: 'true',
        is_hidden: true,
      },
    ],
    hints: [
      'Filter out non-alphanumeric characters and normalize all characters to lowercase.',
      'Use two pointers: one at the start and one at the end, comparing characters as they move toward the center.',
    ],
    solution_explanation: `Two pointers moving inward comparing alphanumeric characters converted to lowercase.
Time Complexity: O(N)
Space Complexity: O(1)`,
    starter_templates: {
      c: `#include <stdio.h>
#include <ctype.h>
#include <string.h>
#include <stdbool.h>

bool isPalindrome(char *s) {
    int left = 0, right = strlen(s) - 1;
    while (left < right) {
        while (left < right && !isalnum((unsigned char)s[left])) left++;
        while (left < right && !isalnum((unsigned char)s[right])) right--;
        if (tolower((unsigned char)s[left]) != tolower((unsigned char)s[right])) return false;
        left++;
        right--;
    }
    return true;
}

int main() {
    char s[200005];
    if (!fgets(s, sizeof(s), stdin)) {
        printf("true\\n");
        return 0;
    }
    // strip newline
    s[strcspn(s, "\\r\\n")] = 0;
    printf("%s\\n", isPalindrome(s) ? "true" : "false");
    return 0;
}
`,
      cpp: `#include <iostream>
#include <string>
#include <cctype>

using namespace std;

bool isPalindrome(string s) {
    int left = 0, right = (int)s.size() - 1;
    while (left < right) {
        while (left < right && !isalnum(s[left])) left++;
        while (left < right && !isalnum(s[right])) right--;
        if (tolower(s[left]) != tolower(s[right])) return false;
        left++;
        right--;
    }
    return true;
}

int main() {
    string s;
    if (getline(cin, s)) {
        cout << (isPalindrome(s) ? "true" : "false") << "\\n";
    } else {
        cout << "true\\n";
    }
    return 0;
}
`,
      python: `import sys

def main():
    s = sys.stdin.read().rstrip('\\r\\n')
    filtered = [ch.lower() for ch in s if ch.isalnum()]
    print("true" if filtered == filtered[::-1] else "false")

if __name__ == "__main__":
    main()
`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine() : "";

        int left = 0, right = s.length() - 1;
        boolean ok = true;

        while (left < right) {
            while (left < right && !Character.isLetterOrDigit(s.charAt(left))) left++;
            while (left < right && !Character.isLetterOrDigit(s.charAt(right))) right--;
            if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) {
                ok = false;
                break;
            }
            left++;
            right--;
        }

        System.out.println(ok ? "true" : "false");
    }
}
`,
      javascript: `const fs = require('fs');

function main() {
    const s = fs.readFileSync(0, 'utf-8').replace(/[\\r\\n]/g, '');
    const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const rev = clean.split('').reverse().join('');
    console.log(clean === rev ? "true" : "false");
}

main();
`,
      typescript: `import * as fs from 'fs';

function main(): void {
    const s: string = fs.readFileSync(0, 'utf-8').replace(/[\\r\\n]/g, '');
    const clean: string = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const rev: string = clean.split('').reverse().join('');
    console.log(clean === rev ? "true" : "false");
}

main();
`,
    },
    order: 3,
  },

  // 4. SEARCHING - Easy: Binary Search
  {
    title: 'Binary Search',
    slug: 'binary-search',
    difficulty: 'Easy',
    topic: 'Searching',
    tags: ['Binary Search', 'Divide and Conquer'],
    description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`.

If \`target\` exists, then return its **0-based index**. Otherwise, return \`-1\`.

You must write an algorithm with **O(log n)** runtime complexity.`,
    input_format: `The first line contains an integer \`n\` and an integer \`target\`.
The second line contains \`n\` space-separated integers in strictly ascending order.`,
    output_format: `Print the index of \`target\` if present, otherwise print \`-1\`.`,
    constraints: `1 <= n <= 10^5\n-10^4 < nums[i], target < 10^4\nAll integers in \`nums\` are unique and sorted in ascending order.`,
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
        explanation: '2 does not exist in nums so return -1.',
        is_hidden: false,
      },
    ],
    hidden_test_cases: [
      {
        input: '1 5\n5',
        output: '0',
        is_hidden: true,
      },
      {
        input: '2 1\n1 3',
        output: '0',
        is_hidden: true,
      },
      {
        input: '5 100\n10 20 30 40 50',
        output: '-1',
        is_hidden: true,
      },
    ],
    hints: [
      'Keep track of low = 0 and high = n - 1.',
      'Calculate mid = low + (high - low) / 2 to prevent integer overflow.',
      'If nums[mid] == target return mid; if nums[mid] < target low = mid + 1; else high = mid - 1.',
    ],
    solution_explanation: `Classic Binary Search with logarithmic time complexity O(log N) and O(1) space.`,
    starter_templates: {
      c: `#include <stdio.h>

int binarySearch(int nums[], int n, int target) {
    int low = 0, high = n - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (nums[mid] == target) return mid;
        else if (nums[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}

int main() {
    int n, target;
    if (scanf("%d %d", &n, &target) != 2) return 0;
    int nums[n];
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);
    printf("%d\\n", binarySearch(nums, n, target));
    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>

using namespace std;

int binarySearch(const vector<int>& nums, int target) {
    int low = 0, high = (int)nums.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (nums[mid] == target) return mid;
        else if (nums[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}

int main() {
    int n, target;
    if (!(cin >> n >> target)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    cout << binarySearch(nums, target) << "\\n";
    return 0;
}
`,
      python: `import sys

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    target = int(tokens[1])
    nums = [int(x) for x in tokens[2:2+n]]

    low, high = 0, n - 1
    ans = -1
    while low <= high:
        mid = (low + high) // 2
        if nums[mid] == target:
            ans = mid
            break
        elif nums[mid] < target:
            low = mid + 1
        else:
            high = mid - 1

    print(ans)

if __name__ == "__main__":
    main()
`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int target = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();

        int low = 0, high = n - 1, ans = -1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (nums[mid] == target) {
                ans = mid;
                break;
            } else if (nums[mid] < target) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        System.out.println(ans);
    }
}
`,
      javascript: `const fs = require('fs');

function main() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (input.length < 2) return;
    const n = parseInt(input[0], 10);
    const target = parseInt(input[1], 10);
    const nums = input.slice(2, 2 + n).map(Number);

    let low = 0, high = n - 1, ans = -1;
    while (low <= high) {
        const mid = Math.floor(low + (high - low) / 2);
        if (nums[mid] === target) {
            ans = mid;
            break;
        } else if (nums[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    console.log(ans);
}

main();
`,
      typescript: `import * as fs from 'fs';

function main(): void {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (input.length < 2) return;
    const n = parseInt(input[0], 10);
    const target = parseInt(input[1], 10);
    const nums: number[] = input.slice(2, 2 + n).map(Number);

    let low = 0, high = n - 1, ans = -1;
    while (low <= high) {
        const mid = Math.floor(low + (high - low) / 2);
        if (nums[mid] === target) {
            ans = mid;
            break;
        } else if (nums[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    console.log(ans);
}

main();
`,
    },
    order: 4,
  },

  // 5. STACKS - Easy: Valid Parentheses
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
3. Every close bracket has a corresponding open bracket of the same type.`,
    input_format: `A single line containing the bracket string \`s\`.`,
    output_format: `Print \`true\` if the string is valid, or \`false\` otherwise.`,
    constraints: `1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'.`,
    sample_test_cases: [
      {
        input: '()[]{}',
        output: 'true',
        explanation: 'All open brackets are closed in the correct order.',
        is_hidden: false,
      },
      {
        input: '(]',
        output: 'false',
        explanation: 'Mismatched bracket pair: ( closed with ].',
        is_hidden: false,
      },
    ],
    hidden_test_cases: [
      {
        input: '([)]',
        output: 'false',
        is_hidden: true,
      },
      {
        input: '{[]}',
        output: 'true',
        is_hidden: true,
      },
      {
        input: '(',
        output: 'false',
        is_hidden: true,
      },
    ],
    hints: [
      'Use a Stack to push opening brackets `(`, `{`, `[`.',
      'When you see a closing bracket, check if the stack is non-empty and the top matches the corresponding opener.',
      'At the end of string traversal, the stack must be completely empty.',
    ],
    solution_explanation: `Push openers to stack; on closer, pop and verify matching pair. Return true only if stack is empty at end.
Time Complexity: O(N)
Space Complexity: O(N)`,
    starter_templates: {
      c: `#include <stdio.h>
#include <string.h>
#include <stdbool.h>

bool isValid(char *s) {
    int len = strlen(s);
    char stack[len + 1];
    int top = -1;

    for (int i = 0; i < len; i++) {
        char c = s[i];
        if (c == '(' || c == '{' || c == '[') {
            stack[++top] = c;
        } else {
            if (top == -1) return false;
            char open = stack[top--];
            if (c == ')' && open != '(') return false;
            if (c == '}' && open != '{') return false;
            if (c == ']' && open != '[') return false;
        }
    }
    return top == -1;
}

int main() {
    char s[10005];
    if (scanf("%s", s) == 1) {
        printf("%s\\n", isValid(s) ? "true" : "false");
    } else {
        printf("true\\n");
    }
    return 0;
}
`,
      cpp: `#include <iostream>
#include <string>
#include <stack>

using namespace std;

bool isValid(string s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '{' || c == '[') {
            st.push(c);
        } else {
            if (st.empty()) return false;
            char top = st.top();
            st.pop();
            if (c == ')' && top != '(') return false;
            if (c == '}' && top != '{') return false;
            if (c == ']' && top != '[') return false;
        }
    }
    return st.empty();
}

int main() {
    string s;
    if (cin >> s) {
        cout << (isValid(s) ? "true" : "false") << "\\n";
    }
    return 0;
}
`,
      python: `import sys

def main():
    s = sys.stdin.read().strip()
    if not s:
        print("true")
        return

    stack = []
    mapping = {')': '(', '}': '{', ']': '['}

    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                print("false")
                return
        else:
            stack.append(char)

    print("true" if not stack else "false")

if __name__ == "__main__":
    main()
`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) {
            System.out.println("true");
            return;
        }
        String s = sc.next();
        Deque<Character> stack = new ArrayDeque<>();
        boolean valid = true;

        for (char c : s.toCharArray()) {
            if (c == '(' || c == '{' || c == '[') {
                stack.push(c);
            } else {
                if (stack.isEmpty()) { valid = false; break; }
                char top = stack.pop();
                if (c == ')' && top != '(') { valid = false; break; }
                if (c == '}' && top != '{') { valid = false; break; }
                if (c == ']' && top != '[') { valid = false; break; }
            }
        }
        System.out.println(valid && stack.isEmpty() ? "true" : "false");
    }
}
`,
      javascript: `const fs = require('fs');

function main() {
    const s = fs.readFileSync(0, 'utf-8').trim();
    const stack = [];
    const map = { ')': '(', '}': '{', ']': '[' };

    for (let c of s) {
        if (c === '(' || c === '{' || c === '[') {
            stack.push(c);
        } else if (map[c]) {
            if (stack.pop() !== map[c]) {
                console.log("false");
                return;
            }
        }
    }
    console.log(stack.length === 0 ? "true" : "false");
}

main();
`,
      typescript: `import * as fs from 'fs';

function main(): void {
    const s: string = fs.readFileSync(0, 'utf-8').trim();
    const stack: string[] = [];
    const map: Record<string, string> = { ')': '(', '}': '{', ']': '[' };

    for (const c of s) {
        if (c === '(' || c === '{' || c === '[') {
            stack.push(c);
        } else if (map[c]) {
            if (stack.pop() !== map[c]) {
                console.log("false");
                return;
            }
        }
    }
    console.log(stack.length === 0 ? "true" : "false");
}

main();
`,
    },
    order: 5,
  },

  // 6. DYNAMIC PROGRAMMING - Easy: Climbing Stairs
  {
    title: 'Climbing Stairs',
    slug: 'climbing-stairs',
    difficulty: 'Easy',
    topic: 'Dynamic Programming',
    tags: ['Dynamic Programming', 'Math', 'Memoization'],
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?`,
    input_format: `A single integer \`n\`.`,
    output_format: `Print the total number of distinct ways to climb \`n\` steps.`,
    constraints: `1 <= n <= 45`,
    sample_test_cases: [
      {
        input: '2',
        output: '2',
        explanation: 'There are two ways: 1 step + 1 step, or 2 steps.',
        is_hidden: false,
      },
      {
        input: '3',
        output: '3',
        explanation: 'Three ways: 1+1+1, 1+2, 2+1.',
        is_hidden: false,
      },
    ],
    hidden_test_cases: [
      {
        input: '4',
        output: '5',
        is_hidden: true,
      },
      {
        input: '5',
        output: '8',
        is_hidden: true,
      },
      {
        input: '10',
        output: '89',
        is_hidden: true,
      },
    ],
    hints: [
      'To reach step n, you must come from either step (n - 1) or step (n - 2).',
      'Therefore, ways(n) = ways(n - 1) + ways(n - 2). This is the Fibonacci sequence!',
      'Compute iteratively in O(N) using two variables for O(1) space.',
    ],
    solution_explanation: `Fibonacci recurrence: dp[i] = dp[i-1] + dp[i-2].
Base cases: dp[1] = 1, dp[2] = 2.
Time Complexity: O(N)
Space Complexity: O(1)`,
    starter_templates: {
      c: `#include <stdio.h>

long long climbStairs(int n) {
    if (n <= 2) return n;
    long long a = 1, b = 2;
    for (int i = 3; i <= n; i++) {
        long long c = a + b;
        a = b;
        b = c;
    }
    return b;
}

int main() {
    int n;
    if (scanf("%d", &n) == 1) {
        printf("%lld\\n", climbStairs(n));
    }
    return 0;
}
`,
      cpp: `#include <iostream>

using namespace std;

long long climbStairs(int n) {
    if (n <= 2) return n;
    long long a = 1, b = 2;
    for (int i = 3; i <= n; i++) {
        long long c = a + b;
        a = b;
        b = c;
    }
    return b;
}

int main() {
    int n;
    if (cin >> n) cout << climbStairs(n) << "\\n";
    return 0;
}
`,
      python: `import sys

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    if n <= 2:
        print(n)
        return
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    print(b)

if __name__ == "__main__":
    main()
`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        if (n <= 2) {
            System.out.println(n);
            return;
        }
        long a = 1, b = 2;
        for (int i = 3; i <= n; i++) {
            long c = a + b;
            a = b;
            b = c;
        }
        System.out.println(b);
    }
}
`,
      javascript: `const fs = require('fs');

function main() {
    const input = fs.readFileSync(0, 'utf-8').trim();
    if (!input) return;
    const n = parseInt(input, 10);
    if (n <= 2) {
        console.log(n);
        return;
    }
    let a = 1, b = 2;
    for (let i = 3; i <= n; i++) {
        const c = a + b;
        a = b;
        b = c;
    }
    console.log(b);
}

main();
`,
      typescript: `import * as fs from 'fs';

function main(): void {
    const input = fs.readFileSync(0, 'utf-8').trim();
    if (!input) return;
    const n = parseInt(input, 10);
    if (n <= 2) {
        console.log(n);
        return;
    }
    let a = 1, b = 2;
    for (let i = 3; i <= n; i++) {
        const c = a + b;
        a = b;
        b = c;
    }
    console.log(b);
}

main();
`,
    },
    order: 6,
  },

  // 7. GREEDY ALGORITHMS - Medium: Jump Game
  {
    title: 'Jump Game',
    slug: 'jump-game',
    difficulty: 'Medium',
    topic: 'Greedy Algorithms',
    tags: ['Greedy', 'Array', 'Dynamic Programming'],
    description: `You are given an integer array \`nums\`. You are initially positioned at the array's **first index**, and each element in the array represents your maximum jump length at that position.

Return \`true\` if you can reach the last index, or \`false\` otherwise.`,
    input_format: `The first line contains an integer \`n\` (size of array).
The second line contains \`n\` space-separated integers.`,
    output_format: `Print \`true\` if the end is reachable, otherwise print \`false\`.`,
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
        explanation: 'You will always arrive at index 3 no matter what. Its maximum jump length is 0, which makes it impossible to reach the last index.',
        is_hidden: false,
      },
    ],
    hidden_test_cases: [
      {
        input: '1\n0',
        output: 'true',
        is_hidden: true,
      },
      {
        input: '2\n2 0',
        output: 'true',
        is_hidden: true,
      },
      {
        input: '4\n0 2 3 4',
        output: 'false',
        is_hidden: true,
      },
    ],
    hints: [
      'Think greedily: What is the maximum index you can reach from your current positions so far?',
      'Iterate through the array. If at any index `i > max_reachable`, you are stuck!',
      'Update `max_reachable = max(max_reachable, i + nums[i])`.',
    ],
    solution_explanation: `Maintain the furthest reachable index. If current index exceeds furthest reachable, return false.
Time Complexity: O(N)
Space Complexity: O(1)`,
    starter_templates: {
      c: `#include <stdio.h>
#include <stdbool.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int nums[n];
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);

    int maxReach = 0;
    bool ok = true;

    for (int i = 0; i < n; i++) {
        if (i > maxReach) {
            ok = false;
            break;
        }
        if (i + nums[i] > maxReach) {
            maxReach = i + nums[i];
        }
        if (maxReach >= n - 1) break;
    }

    printf("%s\\n", ok ? "true" : "false");
    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];

    int maxReach = 0;
    bool ok = true;
    for (int i = 0; i < n; i++) {
        if (i > maxReach) {
            ok = false;
            break;
        }
        maxReach = max(maxReach, i + nums[i]);
        if (maxReach >= n - 1) break;
    }
    cout << (ok ? "true" : "false") << "\\n";
    return 0;
}
`,
      python: `import sys

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = [int(x) for x in tokens[1:1+n]]

    max_reach = 0
    for i, jump in enumerate(nums):
        if i > max_reach:
            print("false")
            return
        max_reach = max(max_reach, i + jump)
        if max_reach >= n - 1:
            print("true")
            return

    print("true")

if __name__ == "__main__":
    main()
`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();

        int maxReach = 0;
        boolean ok = true;
        for (int i = 0; i < n; i++) {
            if (i > maxReach) {
                ok = false;
                break;
            }
            maxReach = Math.max(maxReach, i + nums[i]);
            if (maxReach >= n - 1) break;
        }
        System.out.println(ok ? "true" : "false");
    }
}
`,
      javascript: `const fs = require('fs');

function main() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input.length || input[0] === '') return;
    const n = parseInt(input[0], 10);
    const nums = input.slice(1, 1 + n).map(Number);

    let maxReach = 0;
    for (let i = 0; i < n; i++) {
        if (i > maxReach) {
            console.log("false");
            return;
        }
        maxReach = Math.max(maxReach, i + nums[i]);
        if (maxReach >= n - 1) {
            console.log("true");
            return;
        }
    }
    console.log("true");
}

main();
`,
      typescript: `import * as fs from 'fs';

function main(): void {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input.length || input[0] === '') return;
    const n = parseInt(input[0], 10);
    const nums: number[] = input.slice(1, 1 + n).map(Number);

    let maxReach = 0;
    for (let i = 0; i < n; i++) {
        if (i > maxReach) {
            console.log("false");
            return;
        }
        maxReach = Math.max(maxReach, i + nums[i]);
        if (maxReach >= n - 1) {
            console.log("true");
            return;
        }
    }
    console.log("true");
}

main();
`,
    },
    order: 7,
  },

  // 8. LINKED LISTS - Easy: Reverse Linked List values
  {
    title: 'Reverse Linked List',
    slug: 'reverse-linked-list',
    difficulty: 'Easy',
    topic: 'Linked Lists',
    tags: ['Linked List', 'Recursion'],
    description: `Given the head of a singly linked list with \`n\` nodes, reverse the list, and return **the reversed list elements in order**.`,
    input_format: `The first line contains an integer \`n\` representing number of elements.
The second line contains \`n\` space-separated integers representing node values from head to tail.`,
    output_format: `Print the space-separated node values of the reversed linked list.`,
    constraints: `0 <= n <= 5000\n-5000 <= Node.val <= 5000`,
    sample_test_cases: [
      {
        input: '5\n1 2 3 4 5',
        output: '5 4 3 2 1',
        explanation: 'The linked list 1->2->3->4->5 reversed becomes 5->4->3->2->1.',
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
      {
        input: '1\n42',
        output: '42',
        is_hidden: true,
      },
      {
        input: '4\n10 20 30 40',
        output: '40 30 20 10',
        is_hidden: true,
      },
      {
        input: '0\n',
        output: '',
        is_hidden: true,
      },
    ],
    hints: [
      'Maintain three pointers: prev = NULL, curr = head, next = NULL.',
      'In a loop: next = curr->next; curr->next = prev; prev = curr; curr = next.',
      'Return prev as the new head.',
    ],
    solution_explanation: `Standard 3-pointer iterative list reversal.
Time Complexity: O(N)
Space Complexity: O(1)`,
    starter_templates: {
      c: `#include <stdio.h>
#include <stdlib.h>

struct ListNode {
    int val;
    struct ListNode *next;
};

int main() {
    int n;
    if (scanf("%d", &n) != 1 || n <= 0) {
        return 0;
    }
    int nums[n];
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);

    // Print reversed
    for (int i = n - 1; i >= 0; i--) {
        printf("%d%s", nums[i], (i == 0) ? "" : " ");
    }
    printf("\\n");
    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    int n;
    if (!(cin >> n) || n <= 0) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];

    for (int i = n - 1; i >= 0; i--) {
        cout << nums[i] << (i == 0 ? "" : " ");
    }
    cout << "\\n";
    return 0;
}
`,
      python: `import sys

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    if n == 0:
        return
    nums = tokens[1:1+n]
    print(" ".join(reversed(nums)))

if __name__ == "__main__":
    main()
`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        if (n == 0) return;
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();

        for (int i = n - 1; i >= 0; i--) {
            System.out.print(nums[i] + (i == 0 ? "" : " "));
        }
        System.out.println();
    }
}
`,
      javascript: `const fs = require('fs');

function main() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input.length || input[0] === '') return;
    const n = parseInt(input[0], 10);
    if (n === 0) return;
    const nums = input.slice(1, 1 + n);
    console.log(nums.reverse().join(' '));
}

main();
`,
      typescript: `import * as fs from 'fs';

function main(): void {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input.length || input[0] === '') return;
    const n = parseInt(input[0], 10);
    if (n === 0) return;
    const nums: string[] = input.slice(1, 1 + n);
    console.log(nums.reverse().join(' '));
}

main();
`,
    },
    order: 8,
  },

  // 9. TREES - Medium: Maximum Depth of Binary Tree
  {
    title: 'Maximum Depth of Binary Tree',
    slug: 'maximum-depth-of-binary-tree',
    difficulty: 'Easy',
    topic: 'Trees',
    tags: ['Tree', 'Depth-First Search', 'Breadth-First Search'],
    description: `Given the root of a binary tree represented as level-order traversal (with \`-1\` or \`null\` representing empty nodes), return **its maximum depth**.

A binary tree's **maximum depth** is the number of nodes along the longest path from the root node down to the farthest leaf node.`,
    input_format: `The first line contains an integer \`n\` (number of nodes in level order).
The second line contains \`n\` space-separated integers, where \`-1\` indicates a null node.`,
    output_format: `Print a single integer denoting the maximum depth of the binary tree.`,
    constraints: `0 <= n <= 10^4\n-1000 <= Node.val <= 1000`,
    sample_test_cases: [
      {
        input: '7\n3 9 20 -1 -1 15 7',
        output: '3',
        explanation: 'Longest path is 3 -> 20 -> 15 (depth 3).',
        is_hidden: false,
      },
      {
        input: '2\n1 -1',
        output: '1',
        explanation: 'Only root node exists with depth 1.',
        is_hidden: false,
      },
    ],
    hidden_test_cases: [
      {
        input: '0\n',
        output: '0',
        is_hidden: true,
      },
      {
        input: '3\n1 2 3',
        output: '2',
        is_hidden: true,
      },
    ],
    hints: [
      'If the node is null, its depth is 0.',
      'Recursively: depth = 1 + max(depth(left), depth(right)).',
    ],
    solution_explanation: `Recursive DFS: 1 + max(maxDepth(root.left), maxDepth(root.right)).
Time Complexity: O(N)
Space Complexity: O(H) where H is tree height.`,
    starter_templates: {
      c: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1 || n <= 0) {
        printf("0\\n");
        return 0;
    }
    int nodes[n];
    for (int i = 0; i < n; i++) scanf("%d", &nodes[i]);

    if (nodes[0] == -1) {
        printf("0\\n");
        return 0;
    }

    // Depth in 0-indexed complete binary tree
    int maxDepth = 0;
    int depthMap[n];
    for (int i = 0; i < n; i++) depthMap[i] = 0;

    depthMap[0] = 1;
    maxDepth = 1;

    for (int i = 0; i < n; i++) {
        if (nodes[i] == -1 || depthMap[i] == 0) continue;
        int left = 2 * i + 1;
        int right = 2 * i + 2;
        if (left < n && nodes[left] != -1) {
            depthMap[left] = depthMap[i] + 1;
            if (depthMap[left] > maxDepth) maxDepth = depthMap[left];
        }
        if (right < n && nodes[right] != -1) {
            depthMap[right] = depthMap[i] + 1;
            if (depthMap[right] > maxDepth) maxDepth = depthMap[right];
        }
    }

    printf("%d\\n", maxDepth);
    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    int n;
    if (!(cin >> n) || n <= 0) {
        cout << 0 << "\\n";
        return 0;
    }
    vector<int> nodes(n);
    for (int i = 0; i < n; i++) cin >> nodes[i];
    if (nodes[0] == -1) {
        cout << 0 << "\\n";
        return 0;
    }

    vector<int> depth(n, 0);
    depth[0] = 1;
    int maxDepth = 1;

    for (int i = 0; i < n; i++) {
        if (nodes[i] == -1 || depth[i] == 0) continue;
        int left = 2 * i + 1;
        int right = 2 * i + 2;
        if (left < n && nodes[left] != -1) {
            depth[left] = depth[i] + 1;
            maxDepth = max(maxDepth, depth[left]);
        }
        if (right < n && nodes[right] != -1) {
            depth[right] = depth[i] + 1;
            maxDepth = max(maxDepth, depth[right]);
        }
    }
    cout << maxDepth << "\\n";
    return 0;
}
`,
      python: `import sys

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        print(0)
        return
    n = int(tokens[0])
    if n == 0:
        print(0)
        return
    nodes = [int(x) for x in tokens[1:1+n]]
    if nodes[0] == -1:
        print(0)
        return

    depth = [0] * n
    depth[0] = 1
    max_d = 1

    for i in range(n):
        if nodes[i] == -1 or depth[i] == 0:
            continue
        left = 2 * i + 1
        right = 2 * i + 2
        if left < n and nodes[left] != -1:
            depth[left] = depth[i] + 1
            max_d = max(max_d, depth[left])
        if right < n and nodes[right] != -1:
            depth[right] = depth[i] + 1
            max_d = max(max_d, depth[right])

    print(max_d)

if __name__ == "__main__":
    main()
`,
      java: `import java.util.*;

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
        if (nodes[0] == -1) {
            System.out.println(0);
            return;
        }

        int[] depth = new int[n];
        depth[0] = 1;
        int maxD = 1;

        for (int i = 0; i < n; i++) {
            if (nodes[i] == -1 || depth[i] == 0) continue;
            int left = 2 * i + 1;
            int right = 2 * i + 2;
            if (left < n && nodes[left] != -1) {
                depth[left] = depth[i] + 1;
                maxD = Math.max(maxD, depth[left]);
            }
            if (right < n && nodes[right] != -1) {
                depth[right] = depth[i] + 1;
                maxD = Math.max(maxD, depth[right]);
            }
        }
        System.out.println(maxD);
    }
}
`,
      javascript: `const fs = require('fs');

function main() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input.length || input[0] === '') {
        console.log(0);
        return;
    }
    const n = parseInt(input[0], 10);
    if (n === 0) {
        console.log(0);
        return;
    }
    const nodes = input.slice(1, 1 + n).map(Number);
    if (nodes[0] === -1) {
        console.log(0);
        return;
    }

    const depth = new Array(n).fill(0);
    depth[0] = 1;
    let maxD = 1;

    for (let i = 0; i < n; i++) {
        if (nodes[i] === -1 || depth[i] === 0) continue;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        if (left < n && nodes[left] !== -1) {
            depth[left] = depth[i] + 1;
            maxD = Math.max(maxD, depth[left]);
        }
        if (right < n && nodes[right] !== -1) {
            depth[right] = depth[i] + 1;
            maxD = Math.max(maxD, depth[right]);
        }
    }
    console.log(maxD);
}

main();
`,
      typescript: `import * as fs from 'fs';

function main(): void {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input.length || input[0] === '') {
        console.log(0);
        return;
    }
    const n = parseInt(input[0], 10);
    if (n === 0) {
        console.log(0);
        return;
    }
    const nodes: number[] = input.slice(1, 1 + n).map(Number);
    if (nodes[0] === -1) {
        console.log(0);
        return;
    }

    const depth: number[] = new Array(n).fill(0);
    depth[0] = 1;
    let maxD = 1;

    for (let i = 0; i < n; i++) {
        if (nodes[i] === -1 || depth[i] === 0) continue;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        if (left < n && nodes[left] !== -1) {
            depth[left] = depth[i] + 1;
            maxD = Math.max(maxD, depth[left]);
        }
        if (right < n && nodes[right] !== -1) {
            depth[right] = depth[i] + 1;
            maxD = Math.max(maxD, depth[right]);
        }
    }
    console.log(maxD);
}

main();
`,
    },
    order: 9,
  },

  // 10. GRAPHS - Hard: Number of Islands
  {
    title: 'Number of Islands',
    slug: 'number-of-islands',
    difficulty: 'Hard',
    topic: 'Graphs',
    tags: ['Graph', 'Depth-First Search', 'Breadth-First Search', 'Matrix'],
    description: `Given an \`m x n\` 2D binary grid \`grid\` which represents a map of \`'1'\`s (land) and \`'0'\`s (water), return **the number of islands**.

An **island** is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.`,
    input_format: `The first line contains two integers \`m\` and \`n\` (rows and columns).
The next \`m\` lines each contain \`n\` space-separated integers (\`0\` or \`1\`).`,
    output_format: `Print a single integer representing the total count of isolated islands.`,
    constraints: `1 <= m, n <= 300\ngrid[i][j] is either '0' or '1'.`,
    sample_test_cases: [
      {
        input: '4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0',
        output: '1',
        explanation: 'All 1s connect horizontally or vertically into a single island.',
        is_hidden: false,
      },
      {
        input: '4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1',
        output: '3',
        explanation: 'There are 3 disjoint clusters of land.',
        is_hidden: false,
      },
    ],
    hidden_test_cases: [
      {
        input: '1 1\n0',
        output: '0',
        is_hidden: true,
      },
      {
        input: '1 1\n1',
        output: '1',
        is_hidden: true,
      },
      {
        input: '3 3\n1 0 1\n0 1 0\n1 0 1',
        output: '5',
        is_hidden: true,
      },
    ],
    hints: [
      'Iterate through each cell (r, c) of the grid.',
      'When you encounter a `1`, increment your island counter and trigger a DFS or BFS to sink/visit all connected land cells.',
      'Remember diagonals do NOT count as connections.',
    ],
    solution_explanation: `Grid DFS / Flood Fill: Traverse grid, whenever '1' is found, run DFS marking visited land to '0' to avoid double counting.
Time Complexity: O(M * N)
Space Complexity: O(M * N) call stack.`,
    starter_templates: {
      c: `#include <stdio.h>

void dfs(int m, int n, int grid[m][n], int r, int c) {
    if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] != 1) return;
    grid[r][c] = 0; // mark visited
    dfs(m, n, grid, r + 1, c);
    dfs(m, n, grid, r - 1, c);
    dfs(m, n, grid, r, c + 1);
    dfs(m, n, grid, r, c - 1);
}

int main() {
    int m, n;
    if (scanf("%d %d", &m, &n) != 2) return 0;
    int grid[m][n];
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            scanf("%d", &grid[i][j]);
        }
    }

    int islands = 0;
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (grid[i][j] == 1) {
                islands++;
                dfs(m, n, grid, i, j);
            }
        }
    }
    printf("%d\\n", islands);
    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>

using namespace std;

void dfs(int r, int c, vector<vector<int>>& grid, int m, int n) {
    if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] != 1) return;
    grid[r][c] = 0;
    dfs(r + 1, c, grid, m, n);
    dfs(r - 1, c, grid, m, n);
    dfs(r, c + 1, grid, m, n);
    dfs(r, c - 1, grid, m, n);
}

int main() {
    int m, n;
    if (!(cin >> m >> n)) return 0;
    vector<vector<int>> grid(m, vector<int>(n));
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            cin >> grid[i][j];
        }
    }

    int islands = 0;
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (grid[i][j] == 1) {
                islands++;
                dfs(i, j, grid, m, n);
            }
        }
    }
    cout << islands << "\\n";
    return 0;
}
`,
      python: `import sys

# Increase recursion depth for large grid DFS
sys.setrecursionlimit(200000)

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    m = int(tokens[0])
    n = int(tokens[1])
    grid = []
    idx = 2
    for _ in range(m):
        row = [int(x) for x in tokens[idx:idx+n]]
        grid.append(row)
        idx += n

    def dfs(r, c):
        if r < 0 or r >= m or c < 0 or c >= n or grid[r][c] != 1:
            return
        grid[r][c] = 0
        dfs(r + 1, c)
        dfs(r - 1, c)
        dfs(r, c + 1)
        dfs(r, c - 1)

    islands = 0
    for r in range(m):
        for c in range(n):
            if grid[r][c] == 1:
                islands += 1
                dfs(r, c)

    print(islands)

if __name__ == "__main__":
    main()
`,
      java: `import java.util.*;

public class Main {
    static void dfs(int[][] grid, int r, int c, int m, int n) {
        if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] != 1) return;
        grid[r][c] = 0;
        dfs(grid, r + 1, c, m, n);
        dfs(grid, r - 1, c, m, n);
        dfs(grid, r, c + 1, m, n);
        dfs(grid, r, c - 1, m, n);
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int m = sc.nextInt();
        int n = sc.nextInt();
        int[][] grid = new int[m][n];
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                grid[i][j] = sc.nextInt();
            }
        }

        int islands = 0;
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (grid[i][j] == 1) {
                    islands++;
                    dfs(grid, i, j, m, n);
                }
            }
        }
        System.out.println(islands);
    }
}
`,
      javascript: `const fs = require('fs');

function main() {
    const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (tokens.length < 2) return;
    const m = parseInt(tokens[0], 10);
    const n = parseInt(tokens[1], 10);

    const grid = [];
    let idx = 2;
    for (let i = 0; i < m; i++) {
        grid.push(tokens.slice(idx, idx + n).map(Number));
        idx += n;
    }

    function dfs(r, c) {
        if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] !== 1) return;
        grid[r][c] = 0;
        dfs(r + 1, c);
        dfs(r - 1, c);
        dfs(r, c + 1);
        dfs(r, c - 1);
    }

    let islands = 0;
    for (let r = 0; r < m; r++) {
        for (let c = 0; c < n; c++) {
            if (grid[r][c] === 1) {
                islands++;
                dfs(r, c);
            }
        }
    }
    console.log(islands);
}

main();
`,
      typescript: `import * as fs from 'fs';

function main(): void {
    const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (tokens.length < 2) return;
    const m = parseInt(tokens[0], 10);
    const n = parseInt(tokens[1], 10);

    const grid: number[][] = [];
    let idx = 2;
    for (let i = 0; i < m; i++) {
        grid.push(tokens.slice(idx, idx + n).map(Number));
        idx += n;
    }

    function dfs(r: number, c: number): void {
        if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] !== 1) return;
        grid[r][c] = 0;
        dfs(r + 1, c);
        dfs(r - 1, c);
        dfs(r, c + 1);
        dfs(r, c - 1);
    }

    let islands = 0;
    for (let r = 0; r < m; r++) {
        for (let c = 0; c < n; c++) {
            if (grid[r][c] === 1) {
                islands++;
                dfs(r, c);
            }
        }
    }
    console.log(islands);
}

main();
`,
    },
    order: 10,
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
      console.log(`[Seed] Seeded problem: "${prob.title}" (${prob.difficulty} - ${prob.topic})`);
    }

    console.log(`[Seed] Successfully seeded ${problems.length} high-standard DSA problems!`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
}

seed();
