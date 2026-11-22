const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let gridfsBucket = null;

const getGridFSBucket = () => {
  if (!gridfsBucket && mongoose.connection.readyState === 1) {
    gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'academic_pdfs',
    });
  }
  return gridfsBucket;
};

/**
 * Upload a local file buffer or stream to MongoDB GridFS
 */
const uploadToGridFS = (filePath, filename, contentType = 'application/pdf') => {
  return new Promise((resolve, reject) => {
    try {
      const bucket = getGridFSBucket();
      if (!bucket) {
        return reject(new Error('GridFS bucket not initialized. Database not connected.'));
      }

      const cleanFilename = path.basename(filename || filePath);
      const uploadStream = bucket.openUploadStream(cleanFilename, {
        contentType,
        metadata: {
          uploaded_at: new Date(),
          original_name: cleanFilename,
        },
      });

      const readStream = fs.createReadStream(filePath);
      readStream
        .pipe(uploadStream)
        .on('error', (err) => reject(err))
        .on('finish', () => {
          resolve({
            gridfs_id: uploadStream.id,
            filename: cleanFilename,
          });
        });
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Stream a file from GridFS by ID
 */
const streamFromGridFS = (gridfsId) => {
  const bucket = getGridFSBucket();
  if (!bucket) throw new Error('GridFS bucket not available');
  const objectId = typeof gridfsId === 'string' ? new mongoose.Types.ObjectId(gridfsId) : gridfsId;
  return bucket.openDownloadStream(objectId);
};

/**
 * Check if a file exists in GridFS
 */
const existsInGridFS = async (gridfsId) => {
  try {
    const bucket = getGridFSBucket();
    if (!bucket || !gridfsId) return false;
    const objectId = typeof gridfsId === 'string' ? new mongoose.Types.ObjectId(gridfsId) : gridfsId;
    const files = await bucket.find({ _id: objectId }).limit(1).toArray();
    return files && files.length > 0;
  } catch (err) {
    return false;
  }
};

/**
 * Flexible local file finder that checks multiple paths and filename variants
 */
const resolveLocalFilePath = (targetPath, subfolder = '') => {
  if (!targetPath) return null;

  // 1. Direct path check
  if (fs.existsSync(targetPath)) {
    return targetPath;
  }

  const filename = path.basename(targetPath);
  const uploadsRoot = path.join(__dirname, '..', 'uploads');

  // 2. Check in specific subfolder
  if (subfolder) {
    const p1 = path.join(uploadsRoot, subfolder, filename);
    if (fs.existsSync(p1)) return p1;
  }

  // 3. Check across all standard subfolders
  const candidateFolders = ['books', 'papers', 'syllabus', 'general', 'temp', ''];
  for (const folder of candidateFolders) {
    const testPath = folder ? path.join(uploadsRoot, folder, filename) : path.join(uploadsRoot, filename);
    if (fs.existsSync(testPath)) return testPath;
  }

  // 4. Fuzzy match in books folder if filename has timestamp prefix
  const cleanBase = filename.split('-')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  if (cleanBase.length > 3) {
    const booksDir = path.join(uploadsRoot, 'books');
    if (fs.existsSync(booksDir)) {
      const allBooks = fs.readdirSync(booksDir);
      for (const f of allBooks) {
        const fBase = f.split('-')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        if (fBase === cleanBase || f.toLowerCase().includes(cleanBase)) {
          return path.join(booksDir, f);
        }
      }
    }
  }

  return null;
};

module.exports = {
  getGridFSBucket,
  uploadToGridFS,
  streamFromGridFS,
  existsInGridFS,
  resolveLocalFilePath,
};
