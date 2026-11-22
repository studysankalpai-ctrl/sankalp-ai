const mongoose = require('mongoose');
require('dotenv').config();

const AdminUser = require('./models/AdminUser');

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sankalp_ai';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // Seed Super Admin
    const adminEmail = (process.env.ADMIN_DEFAULT_EMAIL || 'admin@sankalp.ai').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123456';

    let admin = await AdminUser.findOne({ email: adminEmail });
    if (!admin) {
      admin = await AdminUser.create({
        name: 'SANKALP Administrator',
        email: adminEmail,
        password: adminPassword,
        role: 'super_admin',
        is_active: true,
      });
      console.log(`[Seed] Created Super Admin: ${adminEmail} (password: ${adminPassword})`);
    } else {
      console.log(`[Seed] Super Admin verified: ${adminEmail}`);
    }

    console.log('[Seed] Done. System is clean and ready for admin content creation.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedAdmin();
