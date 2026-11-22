const mongoose = require('mongoose');

const academicFileSchema = new mongoose.Schema({
  folder_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', required: true },
  filename: { type: String, required: true },
  original_filename: { type: String, required: true },
  file_type: { type: String, required: true, default: 'application/pdf' },
  file_size: { type: Number, required: true },
  storage_path: { type: String, required: true },
  gridfs_id: { type: mongoose.Schema.Types.ObjectId },
  cloudinary_url: { type: String, default: '' },
  cloudinary_public_id: { type: String, default: '' },
  public_url: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  upload_date: { type: Date, default: Date.now },
}, { timestamps: true });

academicFileSchema.index({ folder_id: 1 });
academicFileSchema.index({ filename: 'text', original_filename: 'text' });

module.exports = mongoose.model('AcademicFile', academicFileSchema);
