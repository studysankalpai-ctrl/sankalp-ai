const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
  admin_email: { type: String, default: '' },
  action: { type: String, required: true },
  entity_type: { type: String, required: true },
  entity_id: { type: mongoose.Schema.Types.ObjectId },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  ip_address: { type: String, default: '' },
}, { timestamps: true });

auditLogSchema.index({ admin_id: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
