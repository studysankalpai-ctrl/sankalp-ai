const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: { type: String, default: '' },
  output: { type: String, required: true },
  explanation: { type: String, default: '' },
  is_hidden: { type: Boolean, default: false },
}, { _id: true });

const codingProblemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy',
    required: true,
  },
  topic: {
    type: String,
    enum: [
      'Arrays',
      'Strings',
      'Searching',
      'Sorting',
      'Recursion',
      'Linked Lists',
      'Stacks',
      'Queues',
      'Hashing',
      'Trees',
      'Binary Search Trees',
      'Graphs',
      'Dynamic Programming',
      'Greedy Algorithms',
    ],
    required: true,
    index: true,
  },
  tags: [{ type: String, trim: true }],
  input_format: { type: String, required: true },
  output_format: { type: String, required: true },
  constraints: { type: String, default: '' },
  sample_test_cases: [testCaseSchema],
  hidden_test_cases: [testCaseSchema],
  starter_templates: {
    c: { type: String, default: '' },
    cpp: { type: String, default: '' },
    python: { type: String, default: '' },
    java: { type: String, default: '' },
    javascript: { type: String, default: '' },
    typescript: { type: String, default: '' },
  },
  hints: [{ type: String }],
  solution_explanation: { type: String, default: '' },
  time_limit: { type: Number, default: 2.0 }, // in seconds
  memory_limit: { type: Number, default: 128000 }, // in KB (128 MB)
  total_submissions: { type: Number, default: 0 },
  accepted_submissions: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

// Virtual acceptance rate
codingProblemSchema.virtual('acceptance_rate').get(function() {
  if (this.total_submissions === 0) return 0;
  return Math.round((this.accepted_submissions / this.total_submissions) * 100);
});

codingProblemSchema.set('toJSON', { virtuals: true });
codingProblemSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('CodingProblem', codingProblemSchema);
