const mongoose = require('mongoose');

const subjectAnalysisSchema = new mongoose.Schema({
  subject_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  analysis_type: { 
    type: String, 
    enum: ['frequency', 'unit_wise', 'prediction', 'full'],
    required: true 
  },
  analysis_data: { type: mongoose.Schema.Types.Mixed, default: {} },
  years_analyzed: [{ type: Number }],
  is_published: { type: Boolean, default: false },
  generated_at: { type: Date, default: Date.now },
}, { timestamps: true });

subjectAnalysisSchema.index({ subject_id: 1, analysis_type: 1 });

module.exports = mongoose.model('SubjectAnalysis', subjectAnalysisSchema);
