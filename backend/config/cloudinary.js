const cloudinary = require('cloudinary').v2;

const isCloudinaryConfigured = () => {
  return !!(
    (process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET) ||
    process.env.CLOUDINARY_URL
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log('[Cloudinary] Initialized successfully.');
} else {
  console.log('[Cloudinary] Credentials not yet configured in .env. Will fall back to MongoDB GridFS / disk.');
}

/**
 * Upload a local file to Cloudinary
 * @param {string} filePath - Local absolute or relative file path
 * @param {string} folder - Destination folder on Cloudinary (e.g. 'sankalp_ai/books')
 * @param {string} filename - Display filename
 */
const uploadPdfToCloudinary = async (filePath, folder = 'sankalp_ai/documents', filename = '') => {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary credentials not configured in backend/.env');
  }

  // Upload as raw resource type so PDFs retain native format and byte integrity
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: 'raw',
    folder,
    use_filename: true,
    unique_filename: true,
    filename_override: filename || undefined,
  });

  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
    bytes: result.bytes,
    format: result.format || 'pdf',
  };
};

/**
 * Delete a file from Cloudinary by public_id
 */
const deleteFromCloudinary = async (publicId, resourceType = 'raw') => {
  if (!isCloudinaryConfigured() || !publicId) return null;
  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.warn('[Cloudinary Delete Error]:', err.message);
    return null;
  }
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadPdfToCloudinary,
  deleteFromCloudinary,
};
