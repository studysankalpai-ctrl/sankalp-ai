const mongoose = require('mongoose');

const codingProgressSchema = new mongoose.Schema({
  student_id: { type: String, required: true, unique: true, index: true },
  total_attempted: { type: Number, default: 0 },
  total_solved: { type: Number, default: 0 },
  easy_solved: { type: Number, default: 0 },
  medium_solved: { type: Number, default: 0 },
  hard_solved: { type: Number, default: 0 },
  total_submissions: { type: Number, default: 0 },
  accepted_submissions: { type: Number, default: 0 },
  solved_problem_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CodingProblem' }],
  attempted_problem_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CodingProblem' }],
  language_stats: {
    c: { type: Number, default: 0 },
    cpp: { type: Number, default: 0 },
    python: { type: Number, default: 0 },
    java: { type: Number, default: 0 },
    javascript: { type: Number, default: 0 },
    typescript: { type: Number, default: 0 },
  },
  topic_stats: {
    type: Map,
    of: {
      attempted: { type: Number, default: 0 },
      solved: { type: Number, default: 0 },
    },
    default: {},
  },
  current_streak: { type: Number, default: 0 },
  longest_streak: { type: Number, default: 0 },
  last_active_date: { type: Date, default: null },
  activity_history: [{
    date: { type: String, required: true }, // Format YYYY-MM-DD
    count: { type: Number, default: 1 },
  }],
}, { timestamps: true });

module.exports = mongoose.model('CodingProgress', codingProgressSchema);
