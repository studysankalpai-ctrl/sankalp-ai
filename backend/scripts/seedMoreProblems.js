require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const CodingProblem = require('../models/CodingProblem');

const moreProblems = [
  // 17. QUEUES - Easy: Implement Queue using Stacks
  {
    title: 'Implement Queue using Stacks',
    slug: 'implement-queue-using-stacks',
    difficulty: 'Easy',
    topic: 'Queues',
    tags: ['Stack', 'Queue', 'Design'],
    description: `Implement a first in first out (FIFO) queue using only two stacks. The implemented queue should support all normal functions of a queue (\`push\`, \`pop\`, \`peek\`, and \`empty\`).

In this problem, you will receive a sequence of commands:
- \`push x\`: Pushes element x to the back of the queue.
- \`pop\`: Removes the element from the front of the queue and prints it.
- \`peek\`: Prints the element at the front of the queue.
- \`empty\`: Prints \`true\` if the queue is empty, false otherwise.`,
    input_format: `The first line contains an integer \`q\` (number of operations).
The next \`q\` lines contain operations as described above.`,
    output_format: `For each \`pop\`, \`peek\`, or \`empty\` operation, print the result on a new line.`,
    constraints: `1 <= q <= 100\n1 <= x <= 10^9`,
    sample_test_cases: [
      {
        input: '5\npush 1\npush 2\npeek\npop\nempty',
        output: '1\n1\nfalse',
        explanation: 'peek returns 1. pop returns 1. Queue still contains 2, so empty returns false.',
        is_hidden: false,
      },
    ],
    hidden_test_cases: [
      { input: '3\npush 10\npop\nempty', output: '10\ntrue', is_hidden: true },
      { input: '4\npush 5\npush 6\npop\npop', output: '5\n6', is_hidden: true },
    ],
    hints: ['Use two stacks: inStack for pushing, and outStack for popping/peeking.'],
    solution_explanation: `Two stacks: when outStack is empty, transfer all elements from inStack to outStack.`,
    starter_templates: {
      c: `#include <stdio.h>
#include <string.h>

int main() {
    int q;
    if (scanf("%d", &q) != 1) return 0;

    // TODO: Write your queue implementation using stacks here

    return 0;
}
`,
      cpp: `#include <iostream>
#include <stack>
#include <string>
using namespace std;

int main() {
    int q;
    if (!(cin >> q)) return 0;

    // TODO: Write your queue implementation here

    return 0;
}
`,
      python: `import sys

def solve():
    lines = sys.stdin.read().splitlines()
    if not lines:
        return
    q = int(lines[0])

    # TODO: Write your queue implementation here

if __name__ == '__main__':
    solve()
`,
      java: `import java.util.Scanner;
import java.util.Stack;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int q = sc.nextInt();

        // TODO: Write your queue implementation here

    }
}
`,
      javascript: `const fs = require('fs');

function solve() {
    const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
    if (!lines || lines.length === 0) return;
    const q = parseInt(lines[0], 10);

    // TODO: Write your queue implementation here

}

solve();
`,
      typescript: `import * as fs from 'fs';

function solve(): void {
    const lines: string[] = fs.readFileSync(0, 'utf-8').trim().split('\\n');
    if (!lines || lines.length === 0) return;
    const q: number = parseInt(lines[0], 10);

    // TODO: Write your queue implementation here

}

solve();
`,
    },
    order: 17,
  },

  // 18. QUEUES / STRINGS - Easy: First Unique Character in a String
  {
    title: 'First Unique Character in a String',
    slug: 'first-unique-character-in-a-string',
    difficulty: 'Easy',
    topic: 'Queues',
    tags: ['Queue', 'Hash Table', 'String', 'Counting'],
    description: `Given a string \`s\`, find the **first non-repeating character** in it and print its **0-based index**. If it does not exist, print \`-1\`.`,
    input_format: `A single line containing the string \`s\`.`,
    output_format: `Print the index of the first unique character or \`-1\`.`,
    constraints: `1 <= s.length <= 10^5\ns consists of only lowercase English letters.`,
    sample_test_cases: [
      {
        input: 'leetcode',
        output: '0',
        explanation: 'Character "l" at index 0 is the first character that does not occur at any other index.',
        is_hidden: false,
      },
      {
        input: 'loveleetcode',
        output: '2',
        explanation: 'Character "v" at index 2 is the first non-repeating character.',
        is_hidden: false,
      },
      {
        input: 'aabb',
        output: '-1',
        explanation: 'All characters repeat, so return -1.',
        is_hidden: false,
      },
    ],
    hidden_test_cases: [
      { input: 'z', output: '0', is_hidden: true },
      { input: 'dddccdbba', output: '8', is_hidden: true },
    ],
    hints: ['Count frequency of each character using an array of size 26 or a hash map. Then find the first character with frequency 1.'],
    solution_explanation: `Count occurrences of each char in first pass. In second pass, return index of first char with count == 1.`,
    starter_templates: {
      c: `#include <stdio.h>
#include <string.h>

int main() {
    char s[100005];
    if (scanf("%s", s) != 1) return 0;

    // TODO: Write your solution here
    // Print the index of first unique char or -1

    return 0;
}
`,
      cpp: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    string s;
    if (!(cin >> s)) return 0;

    // TODO: Write your solution here

    return 0;
}
`,
      python: `import sys

def solve():
    s = sys.stdin.read().strip()
    if not s:
        return

    # TODO: Write your solution here

if __name__ == '__main__':
    solve()
`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();

        // TODO: Write your solution here

    }
}
`,
      javascript: `const fs = require('fs');

function solve() {
    const s = fs.readFileSync(0, 'utf-8').trim();
    if (!s) return;

    // TODO: Write your solution here

}

solve();
`,
      typescript: `import * as fs from 'fs';

function solve(): void {
    const s: string = fs.readFileSync(0, 'utf-8').trim();
    if (!s) return;

    // TODO: Write your solution here

}

solve();
`,
    },
    order: 18,
  },

  // 19. STACKS - Medium: Min Stack
  {
    title: 'Min Stack',
    slug: 'min-stack',
    difficulty: 'Medium',
    topic: 'Stacks',
    tags: ['Stack', 'Design'],
    description: `Design a stack that supports \`push\`, \`pop\`, \`top\`, and retrieving the minimum element \`getMin\` in **constant time O(1)**.

You will receive \`q\` operations:
- \`push x\`: Pushes the element x onto the stack.
- \`pop\`: Removes the element on the top of the stack.
- \`top\`: Prints the top element.
- \`getMin\`: Prints the minimum element in the stack.`,
    input_format: `The first line contains \`q\`. The next \`q\` lines contain the operations.`,
    output_format: `For each \`top\` or \`getMin\` operation, print the integer result on a new line.`,
    constraints: `1 <= q <= 1000\n-2^31 <= x <= 2^31 - 1`,
    sample_test_cases: [
      {
        input: '6\npush -2\npush 0\npush -3\ngetMin\npop\ntop',
        output: '-3\n0',
        explanation: 'getMin returns -3. After popping -3, top returns 0.',
        is_hidden: false,
      },
    ],
    hidden_test_cases: [
      { input: '4\npush 5\ngetMin\npush 2\ngetMin', output: '5\n2', is_hidden: true },
    ],
    hints: ['Store pairs (val, currentMin) or use an auxiliary min-stack.'],
    solution_explanation: `Maintain two stacks: mainStack and minStack storing minimums up to that point.`,
    starter_templates: {
      c: `#include <stdio.h>
#include <string.h>

int main() {
    int q;
    if (scanf("%d", &q) != 1) return 0;

    // TODO: Write your Min Stack implementation here

    return 0;
}
`,
      cpp: `#include <iostream>
#include <stack>
#include <string>
using namespace std;

int main() {
    int q;
    if (!(cin >> q)) return 0;

    // TODO: Write your Min Stack solution here

    return 0;
}
`,
      python: `import sys

def solve():
    lines = sys.stdin.read().splitlines()
    if not lines:
        return
    q = int(lines[0])

    # TODO: Write your Min Stack solution here

if __name__ == '__main__':
    solve()
`,
      java: `import java.util.Scanner;
import java.util.Stack;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int q = sc.nextInt();

        // TODO: Write your Min Stack solution here

    }
}
`,
      javascript: `const fs = require('fs');

function solve() {
    const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
    if (!lines || lines.length === 0) return;
    const q = parseInt(lines[0], 10);

    // TODO: Write your Min Stack solution here

}

solve();
`,
      typescript: `import * as fs from 'fs';

function solve(): void {
    const lines: string[] = fs.readFileSync(0, 'utf-8').trim().split('\\n');
    if (!lines || lines.length === 0) return;
    const q: number = parseInt(lines[0], 10);

    // TODO: Write your Min Stack solution here

}

solve();
`,
    },
    order: 19,
  },

  // 20. TREES - Easy: Invert Binary Tree
  {
    title: 'Invert Binary Tree',
    slug: 'invert-binary-tree',
    difficulty: 'Easy',
    topic: 'Trees',
    tags: ['Tree', 'Depth-First Search', 'Breadth-First Search', 'Binary Tree'],
    description: `Given the root of a binary tree represented as level-order space-separated integers (-1 for null), **invert the tree** (mirror it left-to-right) and print the new level-order traversal.`,
    input_format: `The first line contains \`n\`. The second line contains \`n\` space-separated integers.`,
    output_format: `Print the inverted tree in level order separated by a space.`,
    constraints: `0 <= n <= 1000\n-100 <= Node.val <= 100`,
    sample_test_cases: [
      {
        input: '7\n4 2 7 1 3 6 9',
        output: '4 7 2 9 6 3 1',
        explanation: 'Every left and right subtree is swapped.',
        is_hidden: false,
      },
      {
        input: '3\n2 1 3',
        output: '2 3 1',
        explanation: 'Children 1 and 3 are inverted.',
        is_hidden: false,
      },
    ],
    hidden_test_cases: [
      { input: '0', output: '', is_hidden: true },
      { input: '1\n1', output: '1', is_hidden: true },
    ],
    hints: ['Recursively swap the left and right child of each node.'],
    solution_explanation: `Swap root.left and root.right, then recurse on both children.`,
    starter_templates: {
      c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1 || n <= 0) return 0;
    int nodes[n];
    for (int i = 0; i < n; i++) scanf("%d", &nodes[i]);

    // TODO: Write your Invert Binary Tree solution here
    // Print the inverted tree level-order space-separated

    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    if (!(cin >> n) || n <= 0) return 0;
    vector<int> nodes(n);
    for (int i = 0; i < n; i++) cin >> nodes[i];

    // TODO: Write your solution here

    return 0;
}
`,
      python: `import sys

def solve():
    lines = sys.stdin.read().split()
    if not lines or lines[0] == '0':
        return
    n = int(lines[0])
    nodes = [int(x) for x in lines[1:1+n]]

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
        if (n <= 0) return;
        int[] nodes = new int[n];
        for (int i = 0; i < n; i++) nodes[i] = sc.nextInt();

        // TODO: Write your solution here

    }
}
`,
      javascript: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 1 || input[0] === '0') return;
    const n = parseInt(input[0], 10);
    const nodes = input.slice(1, 1 + n).map(Number);

    // TODO: Write your solution here

}

solve();
`,
      typescript: `import * as fs from 'fs';

function solve(): void {
    const input: string[] = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 1 || input[0] === '0') return;
    const n: number = parseInt(input[0], 10);
    const nodes: number[] = input.slice(1, 1 + n).map(Number);

    // TODO: Write your solution here

}

solve();
`,
    },
    order: 20,
  },

  // 21. DYNAMIC PROGRAMMING - Medium: House Robber
  {
    title: 'House Robber',
    slug: 'house-robber',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    tags: ['Array', 'Dynamic Programming'],
    description: `You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed.

The only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and **it will automatically contact the police if two adjacent houses were broken into on the same night**.

Given an integer array \`nums\` representing the amount of money of each house, print the **maximum amount of money** you can rob tonight without alerting the police.`,
    input_format: `The first line contains \`n\`. The second line contains \`n\` space-separated integers.`,
    output_format: `Print the maximum money that can be robbed.`,
    constraints: `1 <= n <= 100\n0 <= nums[i] <= 400`,
    sample_test_cases: [
      {
        input: '4\n1 2 3 1',
        output: '4',
        explanation: 'Rob house 1 (money = 1) and then rob house 3 (money = 3). Total = 1 + 3 = 4.',
        is_hidden: false,
      },
      {
        input: '5\n2 7 9 3 1',
        output: '12',
        explanation: 'Rob house 1 (money = 2), house 3 (money = 9) and house 5 (money = 1). Total = 2 + 9 + 1 = 12.',
        is_hidden: false,
      },
    ],
    hidden_test_cases: [
      { input: '1\n100', output: '100', is_hidden: true },
      { input: '2\n2 1', output: '2', is_hidden: true },
      { input: '5\n2 1 1 2 5', output: '8', is_hidden: true },
    ],
    hints: [
      'At each house i, you either rob it (nums[i] + maxAt(i-2)) or skip it (maxAt(i-1)).',
      'dp[i] = max(dp[i-1], dp[i-2] + nums[i]).',
    ],
    solution_explanation: `DP: prev1 and prev2 track maximum money up to previous houses. O(N) time and O(1) space.`,
    starter_templates: {
      c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int nums[n];
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);

    // TODO: Write your DP solution here
    // Print the maximum robbed money

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
    order: 21,
  },

  // 22. HASHING - Easy: Intersection of Two Arrays
  {
    title: 'Intersection of Two Arrays',
    slug: 'intersection-of-two-arrays',
    difficulty: 'Easy',
    topic: 'Hashing',
    tags: ['Array', 'Hash Table', 'Two Pointers', 'Binary Search', 'Sorting'],
    description: `Given two integer arrays \`nums1\` and \`nums2\`, print an array of their **intersection**. Each element in the result must be **unique** and you may print the result sorted in ascending order.`,
    input_format: `The first line contains \`n1\` and \`n2\`.
The second line contains \`n1\` space-separated integers.
The third line contains \`n2\` space-separated integers.`,
    output_format: `Print the unique intersecting integers sorted in ascending order separated by a space.`,
    constraints: `1 <= n1, n2 <= 1000\n0 <= nums1[i], nums2[i] <= 1000`,
    sample_test_cases: [
      {
        input: '4 5\n1 2 2 1\n2 2 3 4 5',
        output: '2',
        explanation: 'Only 2 is common between both arrays.',
        is_hidden: false,
      },
      {
        input: '3 5\n4 9 5\n9 4 9 8 4',
        output: '4 9',
        explanation: '4 and 9 are present in both arrays.',
        is_hidden: false,
      },
    ],
    hidden_test_cases: [
      { input: '2 2\n1 2\n3 4', output: '', is_hidden: true },
      { input: '1 1\n5\n5', output: '5', is_hidden: true },
    ],
    hints: ['Store elements of nums1 in a HashSet. Check which elements of nums2 exist in the set.'],
    solution_explanation: `Insert nums1 into set1. Filter elements of nums2 present in set1 into resultSet. Sort and print.`,
    starter_templates: {
      c: `#include <stdio.h>

int main() {
    int n1, n2;
    if (scanf("%d %d", &n1, &n2) != 2) return 0;
    int a[n1], b[n2];
    for (int i = 0; i < n1; i++) scanf("%d", &a[i]);
    for (int i = 0; i < n2; i++) scanf("%d", &b[i]);

    // TODO: Write your intersection solution here
    // Print unique common elements sorted ascending

    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <set>
using namespace std;

int main() {
    int n1, n2;
    if (!(cin >> n1 >> n2)) return 0;
    vector<int> a(n1), b(n2);
    for (int i = 0; i < n1; i++) cin >> a[i];
    for (int i = 0; i < n2; i++) cin >> b[i];

    // TODO: Write your solution here

    return 0;
}
`,
      python: `import sys

def solve():
    lines = sys.stdin.read().split()
    if not lines:
        return
    n1 = int(lines[0])
    n2 = int(lines[1])
    a = [int(x) for x in lines[2:2+n1]]
    b = [int(x) for x in lines[2+n1:2+n1+n2]]

    # TODO: Write your solution here

if __name__ == '__main__':
    solve()
`,
      java: `import java.util.Scanner;
import java.util.HashSet;
import java.util.ArrayList;
import java.util.Collections;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n1 = sc.nextInt();
        int n2 = sc.nextInt();
        int[] a = new int[n1];
        int[] b = new int[n2];
        for (int i = 0; i < n1; i++) a[i] = sc.nextInt();
        for (int i = 0; i < n2; i++) b[i] = sc.nextInt();

        // TODO: Write your solution here

    }
}
`,
      javascript: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 2) return;
    const n1 = parseInt(input[0], 10);
    const n2 = parseInt(input[1], 10);
    const a = input.slice(2, 2 + n1).map(Number);
    const b = input.slice(2 + n1, 2 + n1 + n2).map(Number);

    // TODO: Write your solution here

}

solve();
`,
      typescript: `import * as fs from 'fs';

function solve(): void {
    const input: string[] = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 2) return;
    const n1: number = parseInt(input[0], 10);
    const n2: number = parseInt(input[1], 10);
    const a: number[] = input.slice(2, 2 + n1).map(Number);
    const b: number[] = input.slice(2 + n1, 2 + n1 + n2).map(Number);

    // TODO: Write your solution here

}

solve();
`,
    },
    order: 22,
  },
];

async function seedMore() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB');

    for (const prob of moreProblems) {
      await CodingProblem.findOneAndUpdate(
        { slug: prob.slug },
        prob,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`[Seed] Seeded: "${prob.title}" (${prob.difficulty} - ${prob.topic})`);
    }

    const total = await CodingProblem.countDocuments();
    console.log(`[Seed] Total problems in DB now: ${total}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
}

seedMore();
