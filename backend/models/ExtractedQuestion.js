const mongoose = require('mongoose');

const extractedQuestionSchema = new mongoose.Schema({
  paper_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ExaminationPaper', required: true },
  subject_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  question_number: { type: String, default: '' },
  question_text: { type: String, required: true },
  marks: { type: Number, default: null },
  question_type: { 
    type: String, 
    enum: ['mcq', 'very_short', 'short', 'long', 'numerical', 'conceptual', 'programming', 'unknown'],
    default: 'unknown' 
  },
  unit: { type: String, default: '' },
  topic: { type: String, default: '' },
  page_number: { type: Number, default: null },
  is_verified: { type: Boolean, default: false },
  exam_year: { type: Number },
}, { timestamps: true });

extractedQuestionSchema.index({ paper_id: 1 });
extractedQuestionSchema.index({ subject_id: 1 });
extractedQuestionSchema.index({ question_text: 'text', topic: 'text' });

module.exports = mongoose.model('ExtractedQuestion', extractedQuestionSchema);
