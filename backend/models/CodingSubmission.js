const mongoose = require('mongoose');

const testCaseResultSchema = new mongoose.Schema({
  test_case_index: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  input: { type: String, default: '' },
  expected_output: { type: String, default: '' },
  actual_output: { type: String, default: '' },
  execution_time: { type: Number, default: 0 },
  memory_usage: { type: Number, default: 0 },
  status: { type: String, default: 'Accepted' },
  error_message: { type: String, default: '' },
  is_hidden: { type: Boolean, default: false },
}, { _id: false });

const codingSubmissionSchema = new mongoose.Schema({
  student_id: { type: String, required: true, index: true },
  problem_id: { type: mongoose.Schema.Types.ObjectId, ref: 'CodingProblem', default: null, index: true },
  language: {
    type: String,
    enum: ['c', 'cpp', 'python', 'java', 'javascript', 'typescript'],
    required: true,
  },
  language_id: { type: Number, required: true },
  source_code: { type: String, required: true },
  stdin: { type: String, default: '' },
  status: {
    type: String,
    enum: [
      'Accepted',
      'Wrong Answer',
      'Compilation Error',
      'Runtime Error',
      'Time Limit Exceeded',
      'Memory Limit Exceeded',
      'Internal Error',
      'Executed', // for playground run code
    ],
    required: true,
    index: true,
  },
  stdout: { type: String, default: '' },
  stderr: { type: String, default: '' },
  compile_output: { type: String, default: '' },
  execution_time: { type: Number, default: 0 }, // in seconds
  memory_usage: { type: Number, default: 0 }, // in KB
  test_cases_passed: { type: Number, default: 0 },
  total_test_cases: { type: Number, default: 0 },
  test_case_results: [testCaseResultSchema],
  is_submission: { type: Boolean, default: true, index: true }, // true = submit against test cases, false = playground run
}, { timestamps: true });

module.exports = mongoose.model('CodingSubmission', codingSubmissionSchema);
