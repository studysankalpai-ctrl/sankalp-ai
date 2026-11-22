const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Book = require('../models/Book');
const AcademicFile = require('../models/AcademicFile');
const { uploadToGridFS, getGridFSBucket } = require('../services/storageService');

async function syncAllToGridFS() {
  try {
    console.log('[Sync] Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Sync] Connected to MongoDB Atlas.');

    const bucket = getGridFSBucket();
    const uploadsDir = path.join(__dirname, '..', 'uploads');

    // 1. Sync Books
    const books = await Book.find();
    console.log(`[Sync] Found ${books.length} books in database.`);

    for (const book of books) {
      console.log(`\nChecking Book: "${book.title}" (${book._id})`);
      
      let localPath = null;
      if (book.storage_path && fs.existsSync(book.storage_path)) {
        localPath = book.storage_path;
      } else {
        // Search in uploads/books
        const booksFolder = path.join(uploadsDir, 'books');
        if (fs.existsSync(booksFolder)) {
          const files = fs.readdirSync(booksFolder);
          const fname = path.basename(book.storage_path || '');
          if (files.includes(fname)) {
            localPath = path.join(booksFolder, fname);
          } else {
            // Match by title keywords
            const titleWord = book.title.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
            const match = files.find(f => f.toLowerCase().includes(titleWord));
            if (match) {
              localPath = path.join(booksFolder, match);
            }
          }
        }
      }

      if (localPath && fs.existsSync(localPath)) {
        console.log(`  Found local file: ${localPath} (${fs.statSync(localPath).size} bytes)`);
        console.log(`  Uploading to MongoDB GridFS...`);
        const result = await uploadToGridFS(localPath, book.file_name || path.basename(localPath));
        console.log(`  Uploaded! GridFS ID: ${result.gridfs_id}`);
        book.gridfs_id = result.gridfs_id;
        book.storage_path = localPath;
        await book.save();
        console.log(`  Saved book record with GridFS ID.`);
      } else {
        console.log(`  No local file found on this disk for "${book.title}".`);
      }
    }

    // 2. Sync Academic Files (Papers & Syllabus)
    const files = await AcademicFile.find();
    console.log(`\n[Sync] Found ${files.length} academic files in database.`);

    for (const file of files) {
      let localPath = null;
      if (file.storage_path && fs.existsSync(file.storage_path)) {
        localPath = file.storage_path;
      } else {
        // Check in uploads/papers, uploads/syllabus, uploads/general
        const folders = ['papers', 'syllabus', 'general'];
        const fname = path.basename(file.storage_path || '');
        for (const sub of folders) {
          const testP = path.join(uploadsDir, sub, fname);
          if (fs.existsSync(testP)) {
            localPath = testP;
            break;
          }
        }
      }

      if (localPath && fs.existsSync(localPath)) {
        console.log(`\nAcademicFile: "${file.original_filename}" (${file._id})`);
        console.log(`  Found local file: ${localPath}`);
        console.log(`  Uploading to GridFS...`);
        const result = await uploadToGridFS(localPath, file.original_filename || path.basename(localPath));
        file.gridfs_id = result.gridfs_id;
        file.storage_path = localPath;
        await file.save();
        console.log(`  Saved file record with GridFS ID: ${result.gridfs_id}`);
      }
    }

    console.log('\n[Sync] GridFS Sync Completed Successfully!');
  } catch (err) {
    console.error('[Sync Error]:', err);
  } finally {
    await mongoose.disconnect();
  }
}

syncAllToGridFS();
