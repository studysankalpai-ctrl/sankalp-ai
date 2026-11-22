const mongoose = require('mongoose');

const syllabusUnitSchema = new mongoose.Schema({
  subject_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  syllabus_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SyllabusVersion', required: true },
  unit_number: { type: Number, required: true },
  unit_name: { type: String, required: true },
  topics: [{ type: String }],
  description: { type: String, default: '' },
}, { timestamps: true });

syllabusUnitSchema.index({ subject_id: 1 });
syllabusUnitSchema.index({ unit_name: 'text', description: 'text' });

module.exports = mongoose.model('SyllabusUnit', syllabusUnitSchema);
