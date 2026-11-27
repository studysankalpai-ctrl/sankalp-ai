const mongoose = require('mongoose');
const AdminUser = require('../models/AdminUser');

// Ensure default super admin exists on server boot (for fresh databases like Render MongoDB Atlas)
const initSuperAdmin = async () => {
  try {
    const adminEmail = (process.env.ADMIN_DEFAULT_EMAIL || 'admin@sankalp.ai').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123456';

    const existingAdmin = await AdminUser.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await AdminUser.create({
        name: 'SANKALP Administrator',
        email: adminEmail,
        password: adminPassword,
        role: 'super_admin',
        is_active: true,
      });
      console.log(`[Security] Default Super Admin account verified (${adminEmail})`);
    }
  } catch (err) {
    console.warn(`[Security Notice] Admin user verification check: ${err.message}`);
  }
};

const connectDB = async () => {
  const remoteUri = process.env.MONGODB_URI;
  const localUri = 'mongodb://127.0.0.1:27017/sankalp_ai';

  // 1. Attempt configured MongoDB URI (e.g. Atlas) with a short timeout
  if (remoteUri && remoteUri !== localUri) {
    try {
      console.log(`[Database] Attempting connection to configured MongoDB URI...`);
      const conn = await mongoose.connect(remoteUri, {
        serverSelectionTimeoutMS: 3500,
        connectTimeoutMS: 5000,
      });
      console.log(`[Database] MongoDB Atlas Connected: ${conn.connection.host}`);
      await initSuperAdmin();
      return;
    } catch (remoteError) {
      console.warn(`[Database Warning] Remote MongoDB connection failed (${remoteError.message}).`);
      console.log(`[Database] Falling back to local MongoDB instance: ${localUri}...`);
    }
  }

  // 2. Attempt Local MongoDB Fallback
  try {
    const localConn = await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 5000,
    });
    console.log(`[Database] Local MongoDB Connected: ${localConn.connection.host} (${localUri})`);
    await initSuperAdmin();
  } catch (localError) {
    console.error(`[Database Error] Local MongoDB connection also failed: ${localError.message}`);
    console.warn('[Database Notice]: Server running in offline mode. Will attempt reconnection in 15s.');
    setTimeout(connectDB, 15000);
  }
};

module.exports = connectDB;
