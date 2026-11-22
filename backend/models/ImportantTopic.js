const mongoose = require('mongoose');

const importantTopicSchema = new mongoose.Schema({
  subject_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  topic_name: { type: String, required: true },
  unit: { type: String, default: '' },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  historical_appearances: { type: Number, default: 0 },
  appeared_years: [{ type: Number }],
  common_marks_pattern: { type: String, default: '' },
  why_important: { type: String, default: '' },
  ai_recommendation: { type: String, default: '' },
  is_published: { type: Boolean, default: false },
  related_questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ExtractedQuestion' }],
}, { timestamps: true });

importantTopicSchema.index({ subject_id: 1, priority: 1 });
importantTopicSchema.index({ topic_name: 'text', why_important: 'text' });

module.exports = mongoose.model('ImportantTopic', importantTopicSchema);
