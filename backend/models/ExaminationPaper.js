const mongoose = require('mongoose');

const examinationPaperSchema = new mongoose.Schema({
  subject_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  file_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicFile', required: true },
  exam_year: { type: Number, required: true },
  exam_type: { type: String, default: 'regular' }, // 'regular', 'supplementary', 'mid-term'
  extracted_text: { type: String, default: '' },
  processing_status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  processing_error: { type: String, default: '' },
  is_included_in_analysis: { type: Boolean, default: true },
}, { timestamps: true });

examinationPaperSchema.index({ subject_id: 1, exam_year: -1 });
examinationPaperSchema.index({ extracted_text: 'text' });

module.exports = mongoose.model('ExaminationPaper', examinationPaperSchema);
