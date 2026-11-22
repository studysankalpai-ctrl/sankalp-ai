const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  topics: [{ type: String }]
}, { _id: true });

const subjectSchema = new mongoose.Schema({
  semester_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  is_published: { type: Boolean, default: false },
  sort_order: { type: Number, default: 0 },
  units: [unitSchema],
}, { timestamps: true });

subjectSchema.index({ semester_id: 1 });
subjectSchema.index({ name: 'text', code: 'text', description: 'text' });

module.exports = mongoose.model('Subject', subjectSchema);
