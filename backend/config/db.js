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
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sankalp_ai');
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    await initSuperAdmin();
  } catch (error) {
    console.error(`[Database Error]: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
