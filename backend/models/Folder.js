const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  parent_folder_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
  semester_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', default: null },
  subject_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },
  folder_type: { 
    type: String, 
    enum: ['root', 'course', 'semester', 'subject', 'syllabus', 'papers', 'custom'],
    default: 'custom' 
  },
  sort_order: { type: Number, default: 0 },
  is_system: { type: Boolean, default: false },
}, { timestamps: true });

folderSchema.index({ parent_folder_id: 1 });
folderSchema.index({ course_id: 1 });
folderSchema.index({ semester_id: 1 });
folderSchema.index({ subject_id: 1 });
folderSchema.index({ name: 'text' });

module.exports = mongoose.model('Folder', folderSchema);
