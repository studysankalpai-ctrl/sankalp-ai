const fetch = globalThis.fetch;

async function testJavaExecution() {
  const javaCode = `import java.util.Scanner;

public class Main {
    static String calculateGrade(double percentage) {
        if (percentage >= 90) return "A+";
        else if (percentage >= 80) return "A";
        else if (percentage >= 70) return "B";
        else if (percentage >= 60) return "C";
        else if (percentage >= 40) return "D";
        else return "F";
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        if (!sc.hasNextLine()) {
            System.out.println("Please provide input!");
            return;
        }

        System.out.print("Enter Student Name: ");
        String name = sc.nextLine();

        System.out.print("Enter Roll Number: ");
        if (!sc.hasNextInt()) {
            System.out.println("Invalid Roll Number!");
            return;
        }
        int rollNo = sc.nextInt();

        int total = 0;

        for (int i = 1; i <= 5; i++) {
            System.out.print("Enter Marks for Subject " + i + ": ");
            if (!sc.hasNextInt()) {
                System.out.println("Invalid or missing marks!");
                return;
            }
            int marks = sc.nextInt();
            if (marks < 0 || marks > 100) {
                System.out.println("Marks must be between 0 and 100!");
                return;
            }
            total += marks;
        }

        double percentage = total / 5.0;

        System.out.println("\\n========== RESULT ==========");
        System.out.println("Student Name: " + name);
        System.out.println("Roll Number: " + rollNo);
        System.out.println("Total Marks: " + total + "/500");
        System.out.printf("Percentage: %.2f%%\\n", percentage);
        System.out.println("Grade: " + calculateGrade(percentage));
        System.out.println("Result: " + (percentage >= 40 ? "PASS" : "FAIL"));

        sc.close();
    }
}
`;

  // Simulating line-by-line inputs from user:
  // 1. Name: SAmeer signh
  // 2. Roll: 101
  // 3. Subject 1: 85
  // 4. Subject 2: 90
  // 5. Subject 3: 75
  // 6. Subject 4: 80
  // 7. Subject 5: 95
  const stdin = [
    'SAmeer signh',
    '101',
    '85',
    '90',
    '75',
    '80',
    '95'
  ].join('\n');

  console.log('Sending Java code with stdin:');
  console.log(stdin);

  const res = await fetch('http://localhost:5000/api/coding/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentId: 'test-student',
      language: 'java',
      code: javaCode,
      stdin: stdin,
    }),
  });

  const data = await res.json();
  console.log('Status code:', res.status);
  console.log('Response success:', data.success);
  console.log('STDOUT:\n', data.data?.stdout);
  console.log('STDERR:\n', data.data?.stderr);
}

testJavaExecution();
