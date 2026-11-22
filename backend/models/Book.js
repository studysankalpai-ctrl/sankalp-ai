const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, default: 'Prescribed University Author', trim: true },
  edition: { type: String, default: 'Standard Edition', trim: true },
  description: { type: String, default: '' },
  
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  semester_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  subject_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  
  storage_path: { type: String, required: true },
  gridfs_id: { type: mongoose.Schema.Types.ObjectId },
  cloudinary_url: { type: String, default: '' },
  cloudinary_public_id: { type: String, default: '' },
  file_name: { type: String, required: true },
  file_size: { type: Number, required: true },
  mime_type: { type: String, default: 'application/pdf' },
  public_url: { type: String },
  
  total_pages: { type: Number, default: 0 },
  extracted_text: { type: String, default: '' },
  summary_index: { type: String, default: '' },
  
  is_active: { type: Boolean, default: true },
}, { timestamps: true });

bookSchema.index({ course_id: 1 });
bookSchema.index({ semester_id: 1 });
bookSchema.index({ subject_id: 1 });
bookSchema.index({ title: 'text', author: 'text', description: 'text' });

module.exports = mongoose.model('Book', bookSchema);
