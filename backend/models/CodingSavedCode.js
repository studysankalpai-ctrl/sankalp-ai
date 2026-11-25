const mongoose = require('mongoose');

const codingSavedCodeSchema = new mongoose.Schema({
  student_id: { type: String, required: true, index: true },
  problem_id: { type: mongoose.Schema.Types.ObjectId, ref: 'CodingProblem', default: null, index: true },
  language: {
    type: String,
    enum: ['c', 'cpp', 'python', 'java', 'javascript', 'typescript'],
    required: true,
  },
  code: { type: String, required: true },
  custom_input: { type: String, default: '' },
}, { timestamps: true });

// Compound index so one student has at most one saved draft per problem + language (or playground + language)
codingSavedCodeSchema.index({ student_id: 1, problem_id: 1, language: 1 }, { unique: true });

module.exports = mongoose.model('CodingSavedCode', codingSavedCodeSchema);
