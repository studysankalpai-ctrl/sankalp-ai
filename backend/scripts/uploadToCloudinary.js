const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Book = require('../models/Book');
const AcademicFile = require('../models/AcademicFile');
const { isCloudinaryConfigured, uploadPdfToCloudinary } = require('../config/cloudinary');
const { resolveLocalFilePath } = require('../services/storageService');

async function syncAllToCloudinary() {
  try {
    if (!isCloudinaryConfigured()) {
      console.error('[Cloudinary Sync Error]: Cloudinary credentials are not set in backend/.env!');
      console.log('Please add the following to backend/.env:');
      console.log('CLOUDINARY_CLOUD_NAME=your_cloud_name');
      console.log('CLOUDINARY_API_KEY=your_api_key');
      console.log('CLOUDINARY_API_SECRET=your_api_secret');
      process.exit(1);
    }

    console.log('[Cloudinary Sync] Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Cloudinary Sync] Connected to MongoDB Atlas.');

    const uploadsDir = path.join(__dirname, '..', 'uploads');

    // 1. Sync Books
    const books = await Book.find();
    console.log(`\nFound ${books.length} books in database.`);

    for (const book of books) {
      if (book.cloudinary_url && book.cloudinary_url.startsWith('http')) {
        console.log(`Book "${book.title}" already has Cloudinary URL: ${book.cloudinary_url}`);
        continue;
      }

      console.log(`\nProcessing Book: "${book.title}" (${book._id})`);
      const localPath = resolveLocalFilePath(book.storage_path, 'books');

      if (localPath && fs.existsSync(localPath)) {
        console.log(`  Found local file: ${localPath}`);
        console.log(`  Uploading to Cloudinary (folder: sankalp_ai/books)...`);
        const cRes = await uploadPdfToCloudinary(localPath, 'sankalp_ai/books', book.file_name);
        console.log(`  Uploaded! URL: ${cRes.secure_url}`);
        book.cloudinary_url = cRes.secure_url;
        book.cloudinary_public_id = cRes.public_id;
        await book.save();
        console.log(`  Saved book record with Cloudinary URL.`);
      } else {
        console.log(`  Local file not found on disk for "${book.title}".`);
      }
    }

    // 2. Sync Academic Files (Papers & Syllabus)
    const files = await AcademicFile.find();
    console.log(`\nFound ${files.length} academic files in database.`);

    for (const file of files) {
      if (file.cloudinary_url && file.cloudinary_url.startsWith('http')) {
        continue;
      }

      const localPath = resolveLocalFilePath(file.storage_path, 'papers') || resolveLocalFilePath(file.storage_path, 'syllabus');

      if (localPath && fs.existsSync(localPath)) {
        console.log(`\nUploading Academic File: "${file.original_filename}"...`);
        const cRes = await uploadPdfToCloudinary(localPath, 'sankalp_ai/papers', file.original_filename);
        file.cloudinary_url = cRes.secure_url;
        file.cloudinary_public_id = cRes.public_id;
        await file.save();
        console.log(`  Uploaded! URL: ${cRes.secure_url}`);
      }
    }

    console.log('\n[Cloudinary Sync] Completed all uploads successfully!');
  } catch (err) {
    console.error('[Cloudinary Sync Error]:', err);
  } finally {
    await mongoose.disconnect();
  }
}

syncAllToCloudinary();
