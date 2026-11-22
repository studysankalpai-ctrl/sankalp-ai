const mongoose = require('mongoose');
const slugify = require('slugify');

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  slug: { type: String, unique: true },
  description: { type: String, default: '' },
  is_published: { type: Boolean, default: false },
  is_archived: { type: Boolean, default: false },
  sort_order: { type: Number, default: 0 },
}, { timestamps: true });

courseSchema.pre('save', function() {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Math.floor(1000 + Math.random() * 9000);
  }
});

courseSchema.index({ name: 'text', code: 'text', description: 'text' });

module.exports = mongoose.model('Course', courseSchema);
