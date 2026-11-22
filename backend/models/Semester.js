const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  number: { type: Number, required: true },
  name: { type: String, required: true, trim: true }, // e.g. "Semester 1"
  is_published: { type: Boolean, default: false },
  is_archived: { type: Boolean, default: false },
  sort_order: { type: Number, default: 0 },
}, { timestamps: true });

semesterSchema.index({ course_id: 1, number: 1 }, { unique: true });

module.exports = mongoose.model('Semester', semesterSchema);
