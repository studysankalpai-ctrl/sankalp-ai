const mongoose = require('mongoose');

const syllabusVersionSchema = new mongoose.Schema({
  semester_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  file_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicFile', required: true },
  version: { type: Number, required: true, default: 1 },
  academic_session: { type: String, default: '' },
  is_active: { type: Boolean, default: true },
  extracted_text: { type: String, default: '' },
  processing_status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  processing_error: { type: String, default: '' },
}, { timestamps: true });

syllabusVersionSchema.index({ semester_id: 1, is_active: 1 });
syllabusVersionSchema.index({ extracted_text: 'text' });

module.exports = mongoose.model('SyllabusVersion', syllabusVersionSchema);
