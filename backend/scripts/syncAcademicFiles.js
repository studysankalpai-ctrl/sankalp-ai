const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const AcademicFile = require('../models/AcademicFile');
const { uploadToGridFS } = require('../services/storageService');

async function syncAcademicFiles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const files = await AcademicFile.find();

    const allLocalPapers = fs.existsSync(path.join(uploadsDir, 'papers')) 
      ? fs.readdirSync(path.join(uploadsDir, 'papers')).map(f => ({ name: f, path: path.join(uploadsDir, 'papers', f) }))
      : [];
    const allLocalSyllabus = fs.existsSync(path.join(uploadsDir, 'syllabus'))
      ? fs.readdirSync(path.join(uploadsDir, 'syllabus')).map(f => ({ name: f, path: path.join(uploadsDir, 'syllabus', f) }))
      : [];
    const allLocal = [...allLocalPapers, ...allLocalSyllabus];

    console.log(`Found ${allLocal.length} local files in uploads folder.`);

    for (const file of files) {
      if (file.gridfs_id) continue;

      let localPath = null;
      if (file.storage_path && fs.existsSync(file.storage_path)) {
        localPath = file.storage_path;
      } else {
        const base = path.basename(file.storage_path || '').split('-')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        const origBase = (file.original_filename || '').split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

        const match = allLocal.find(l => {
          const lBase = l.name.split('-')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
          return (base.length > 4 && lBase.startsWith(base.slice(0, 8))) ||
                 (origBase.length > 4 && lBase.startsWith(origBase.slice(0, 8))) ||
                 l.name.toLowerCase().includes(origBase.slice(0, 8));
        });

        if (match) {
          localPath = match.path;
        }
      }

      if (localPath && fs.existsSync(localPath)) {
        console.log(`Uploading ${file.original_filename} from ${path.basename(localPath)}...`);
        const result = await uploadToGridFS(localPath, file.original_filename || path.basename(localPath));
        file.gridfs_id = result.gridfs_id;
        file.storage_path = localPath;
        await file.save();
        console.log(`  Uploaded! GridFS ID: ${result.gridfs_id}`);
      }
    }
    console.log('Academic files sync complete!');
  } catch (e) {
    console.error('Sync failed:', e);
  } finally {
    await mongoose.disconnect();
  }
}

syncAcademicFiles();
