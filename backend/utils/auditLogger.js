const AuditLog = require('../models/AuditLog');

const logAudit = async ({ adminId, adminEmail, action, entityType, entityId, details, req }) => {
  try {
    const ip = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '') : '';
    await AuditLog.create({
      admin_id: adminId || req?.admin?._id,
      admin_email: adminEmail || req?.admin?.email || '',
      action,
      entity_type: entityType,
      entity_id: entityId,
      details: details || {},
      ip_address: ip,
    });
  } catch (error) {
    console.error('[AuditLog Error]:', error.message);
  }
};

module.exports = { logAudit };
