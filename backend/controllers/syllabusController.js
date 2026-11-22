const path = require('path');
const fs = require('fs');
const SyllabusVersion = require('../models/SyllabusVersion');
const AcademicFile = require('../models/AcademicFile');
const Semester = require('../models/Semester');
const Folder = require('../models/Folder');
const { extractPdfText } = require('../services/pdfService');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logAudit } = require('../utils/auditLogger');

// GET /api/admin/syllabus
const getSyllabusList = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.semester_id) filter.semester_id = req.query.semester_id;

    const list = await SyllabusVersion.find(filter)
      .populate({
        path: 'semester_id',
        populate: { path: 'course_id', select: 'name code' }
      })
      .populate('file_id')
      .sort({ version: -1, createdAt: -1 });

    return successResponse(res, list, 'Syllabus versions fetched', 200, list.length);
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/syllabus/upload
const uploadSyllabus = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'Please upload a syllabus PDF file', 400);
    }

    const { semester_id, academic_session, set_active } = req.body;
    if (!semester_id) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return errorResponse(res, 'Semester ID is required', 400);
    }

    const semester = await Semester.findById(semester_id).populate('course_id');
    if (!semester) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return errorResponse(res, 'Semester not found', 404);
    }

    // Find or create syllabus folder
    let syllabusFolder = await Folder.findOne({ semester_id, folder_type: 'syllabus' });
    if (!syllabusFolder) {
      const semFolder = await Folder.findOne({ semester_id, folder_type: 'semester' });
      syllabusFolder = await Folder.create({
        name: 'Official Syllabus',
        parent_folder_id: semFolder ? semFolder._id : null,
        course_id: semester.course_id?._id,
        semester_id: semester._id,
        folder_type: 'syllabus',
        is_system: true,
      });
    }

    // Create AcademicFile record
    const academicFile = await AcademicFile.create({
      folder_id: syllabusFolder._id,
      filename: req.file.filename,
      original_filename: req.file.originalname,
      file_type: 'application/pdf',
      file_size: req.file.size,
      storage_path: req.file.path,
      public_url: `/uploads/syllabus/${req.file.filename}`,
      metadata: {
        category: 'syllabus',
        semester_id,
        academic_session: academic_session || '',
      },
    });

    // Count existing versions
    const latestVersion = await SyllabusVersion.findOne({ semester_id }).sort({ version: -1 });
    const newVersionNum = latestVersion ? latestVersion.version + 1 : 1;

    // If set_active is true or this is the first version, deactivate others
    const shouldBeActive = set_active === 'true' || set_active === true || newVersionNum === 1;
    if (shouldBeActive) {
      await SyllabusVersion.updateMany({ semester_id }, { is_active: false });
    }

    const syllabusVersion = await SyllabusVersion.create({
      semester_id,
      file_id: academicFile._id,
      version: newVersionNum,
      academic_session: academic_session || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      is_active: shouldBeActive,
      processing_status: 'pending',
    });

    // Automatically trigger background text extraction
    processSyllabusAsync(syllabusVersion._id, academicFile.storage_path);

    await logAudit({
      action: 'UPLOAD_SYLLABUS',
      entityType: 'SyllabusVersion',
      entityId: syllabusVersion._id,
      details: { version: newVersionNum, semester: semester.name },
      req,
    });

    return successResponse(res, syllabusVersion, 'Syllabus uploaded and processing initiated', 201);
  } catch (error) {
    next(error);
  }
};

// Helper for background extraction
const processSyllabusAsync = async (syllabusId, filePath) => {
  try {
    await SyllabusVersion.findByIdAndUpdate(syllabusId, { processing_status: 'processing' });
    const { text } = await extractPdfText(filePath);
    await SyllabusVersion.findByIdAndUpdate(syllabusId, {
      extracted_text: text,
      processing_status: 'completed',
    });
  } catch (err) {
    await SyllabusVersion.findByIdAndUpdate(syllabusId, {
      processing_status: 'failed',
      processing_error: err.message,
    });
  }
};

// PUT /api/admin/syllabus/:id/activate
const activateSyllabus = async (req, res, next) => {
  try {
    const syllabus = await SyllabusVersion.findById(req.params.id);
    if (!syllabus) return errorResponse(res, 'Syllabus version not found', 404);

    // Deactivate all others for this semester
    await SyllabusVersion.updateMany({ semester_id: syllabus.semester_id }, { is_active: false });

    syllabus.is_active = true;
    await syllabus.save();

    await logAudit({
      action: 'ACTIVATE_SYLLABUS',
      entityType: 'SyllabusVersion',
      entityId: syllabus._id,
      details: { version: syllabus.version },
      req,
    });

    return successResponse(res, syllabus, `Version ${syllabus.version} activated as official syllabus`);
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/syllabus/:id/archive
const archiveSyllabus = async (req, res, next) => {
  try {
    const syllabus = await SyllabusVersion.findById(req.params.id);
    if (!syllabus) return errorResponse(res, 'Syllabus version not found', 404);

    syllabus.is_active = false;
    await syllabus.save();

    return successResponse(res, syllabus, `Version ${syllabus.version} archived`);
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/syllabus/:id/process
const triggerProcessSyllabus = async (req, res, next) => {
  try {
    const syllabus = await SyllabusVersion.findById(req.params.id).populate('file_id');
    if (!syllabus) return errorResponse(res, 'Syllabus version not found', 404);

    if (!syllabus.file_id || !fs.existsSync(syllabus.file_id.storage_path)) {
      return errorResponse(res, 'Associated PDF file not found on disk', 404);
    }

    syllabus.processing_status = 'processing';
    syllabus.processing_error = '';
    await syllabus.save();

    processSyllabusAsync(syllabus._id, syllabus.file_id.storage_path);

    return successResponse(res, syllabus, 'Extraction process restarted');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSyllabusList,
  uploadSyllabus,
  activateSyllabus,
  archiveSyllabus,
  triggerProcessSyllabus,
};
