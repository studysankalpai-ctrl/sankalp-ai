const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const AdminUser = require('../models/AdminUser');
const Course = require('../models/Course');
const Semester = require('../models/Semester');
const Subject = require('../models/Subject');
const Folder = require('../models/Folder');
const ExaminationPaper = require('../models/ExaminationPaper');
const ExtractedQuestion = require('../models/ExtractedQuestion');
const ImportantTopic = require('../models/ImportantTopic');
const SubjectAnalysis = require('../models/SubjectAnalysis');
const AcademicFile = require('../models/AcademicFile');
const SyllabusVersion = require('../models/SyllabusVersion');

const purgeData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sankalp_ai';
    await mongoose.connect(mongoUri);
    console.log('[Purge] Connected to MongoDB');

    // 1. Purge all academic collections
    const collectionsToPurge = [
      { name: 'Courses', model: Course },
      { name: 'Semesters', model: Semester },
      { name: 'Subjects', model: Subject },
      { name: 'Folders', model: Folder },
      { name: 'Examination Papers', model: ExaminationPaper },
      { name: 'Extracted Questions', model: ExtractedQuestion },
      { name: 'Important Topics', model: ImportantTopic },
      { name: 'Subject Analyses', model: SubjectAnalysis },
      { name: 'Academic Files', model: AcademicFile },
      { name: 'Syllabus Versions', model: SyllabusVersion },
    ];

    for (const item of collectionsToPurge) {
      const result = await item.model.deleteMany({});
      console.log(`[Purge] Cleared ${item.name}: ${result.deletedCount} deleted`);
    }

    // 2. Ensure Super Admin user remains intact
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
      console.log(`[Admin] Created Super Admin account: ${adminEmail}`);
    } else {
      console.log(`[Admin] Verified Super Admin account: ${adminEmail}`);
    }

    // 3. Clean uploaded PDF files in storage directories
    const uploadDirs = ['syllabus', 'papers', 'general', 'temp'];
    for (const sub of uploadDirs) {
      const dirPath = path.join(__dirname, '..', 'uploads', sub);
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
          const filePath = path.join(dirPath, file);
          try {
            if (fs.statSync(filePath).isFile()) {
              fs.unlinkSync(filePath);
              console.log(`[Storage] Deleted: uploads/${sub}/${file}`);
            }
          } catch (e) {
            console.warn(`[Storage] Could not remove ${filePath}:`, e.message);
          }
        }
      }
    }

    console.log('\n========================================');
    console.log('✅ ALL DEMO DATA PURGED SUCCESSFULLY!');
    console.log('System is in fresh, pristine state.');
    console.log('Super Admin Login:');
    console.log(`  Email:    ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Purge Error]:', error);
    process.exit(1);
  }
};

purgeData();
