const path = require('path');
const fs = require('fs');
const AcademicFile = require('../models/AcademicFile');
const Folder = require('../models/Folder');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logAudit } = require('../utils/auditLogger');

// POST /api/admin/files/upload
const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'Please provide a PDF file to upload', 400);
    }

    const { folder_id, description } = req.body;
    if (!folder_id) {
      // Remove uploaded file if no folder provided
      fs.unlinkSync(req.file.path);
      return errorResponse(res, 'Folder ID is required', 400);
    }

    const folder = await Folder.findById(folder_id);
    if (!folder) {
      fs.unlinkSync(req.file.path);
      return errorResponse(res, 'Target folder not found', 404);
    }

    const academicFile = await AcademicFile.create({
      folder_id,
      filename: req.file.filename,
      original_filename: req.file.originalname,
      file_type: req.file.mimetype || 'application/pdf',
      file_size: req.file.size,
      storage_path: req.file.path,
      public_url: `/uploads/${path.basename(path.dirname(req.file.path))}/${req.file.filename}`,
      metadata: { description: description || '' },
    });

    await logAudit({
      action: 'UPLOAD_FILE',
      entityType: 'AcademicFile',
      entityId: academicFile._id,
      details: { filename: academicFile.original_filename, size: academicFile.file_size },
      req,
    });

    return successResponse(res, academicFile, 'File uploaded successfully', 201);
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/files/:id
const getFileById = async (req, res, next) => {
  try {
    const file = await AcademicFile.findById(req.params.id).populate('folder_id');
    if (!file) return errorResponse(res, 'File not found', 404);
    return successResponse(res, file, 'File details');
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/files/:id/view
const viewFile = async (req, res, next) => {
  try {
    const file = await AcademicFile.findById(req.params.id);
    if (!file) return errorResponse(res, 'File not found', 404);

    if (!fs.existsSync(file.storage_path)) {
      return errorResponse(res, 'File not found on storage server', 404);
    }

    res.removeHeader('X-Frame-Options');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.original_filename)}"`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    return fs.createReadStream(file.storage_path).pipe(res);
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/files/:id/download
const downloadFile = async (req, res, next) => {
  try {
    const file = await AcademicFile.findById(req.params.id);
    if (!file) return errorResponse(res, 'File not found', 404);

    if (!fs.existsSync(file.storage_path)) {
      return errorResponse(res, 'File not found on storage server', 404);
    }

    return res.download(file.storage_path, file.original_filename);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/files/:id
const deleteFile = async (req, res, next) => {
  try {
    const file = await AcademicFile.findById(req.params.id);
    if (!file) return errorResponse(res, 'File not found', 404);

    // Remove from disk if exists
    if (fs.existsSync(file.storage_path)) {
      try {
        fs.unlinkSync(file.storage_path);
      } catch (err) {
        console.warn('[File unlink warning]:', err.message);
      }
    }

    await AcademicFile.findByIdAndDelete(file._id);

    await logAudit({
      action: 'DELETE_FILE',
      entityType: 'AcademicFile',
      entityId: file._id,
      details: { filename: file.original_filename },
      req,
    });

    return successResponse(res, null, 'File deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadFile,
  getFileById,
  viewFile,
  downloadFile,
  deleteFile,
};
