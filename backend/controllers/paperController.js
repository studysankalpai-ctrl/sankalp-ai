const path = require('path');
const fs = require('fs');
const ExaminationPaper = require('../models/ExaminationPaper');
const ExtractedQuestion = require('../models/ExtractedQuestion');
const AcademicFile = require('../models/AcademicFile');
const Subject = require('../models/Subject');
const Folder = require('../models/Folder');
const { extractPdfText, parseQuestionsFromText } = require('../services/pdfService');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logAudit } = require('../utils/auditLogger');
const { uploadToGridFS } = require('../services/storageService');
const { isCloudinaryConfigured, uploadPdfToCloudinary } = require('../config/cloudinary');

// GET /api/admin/papers
const getPapers = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.subject_id) filter.subject_id = req.query.subject_id;
    if (req.query.exam_year) filter.exam_year = parseInt(req.query.exam_year, 10);

    const papers = await ExaminationPaper.find(filter)
      .populate({
        path: 'subject_id',
        populate: {
          path: 'semester_id',
          populate: { path: 'course_id', select: 'name code' }
        }
      })
      .populate('file_id')
      .sort({ exam_year: -1, createdAt: -1 });

    return successResponse(res, papers, 'Examination papers fetched', 200, papers.length);
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/papers/upload
const uploadPaper = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'Please upload a question paper PDF', 400);
    }

    const { subject_id, exam_year, exam_type, is_included_in_analysis } = req.body;
    if (!subject_id || !exam_year) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return errorResponse(res, 'Subject ID and Examination Year are required', 400);
    }

    const subject = await Subject.findById(subject_id).populate({
      path: 'semester_id',
      populate: { path: 'course_id' }
    });
    if (!subject) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return errorResponse(res, 'Subject not found', 404);
    }

    // Find "Previous Year Question Papers" folder for this subject
    let papersFolder = await Folder.findOne({ subject_id, folder_type: 'papers' });
    if (!papersFolder) {
      const subjectFolder = await Folder.findOne({ subject_id, folder_type: 'subject' });
      papersFolder = await Folder.create({
        name: 'Previous Year Question Papers',
        parent_folder_id: subjectFolder ? subjectFolder._id : null,
        course_id: subject.semester_id?.course_id?._id,
        semester_id: subject.semester_id?._id,
        subject_id: subject._id,
        folder_type: 'papers',
        is_system: true,
      });
    }

    // Upload to GridFS & Cloudinary
    let gridfsId = null;
    try {
      const gfs = await uploadToGridFS(req.file.path, req.file.originalname);
      gridfsId = gfs.gridfs_id;
    } catch (gfsErr) {
      console.warn('[GridFS Paper Warning]:', gfsErr.message);
    }

    let cloudinaryUrl = '';
    let cloudinaryPublicId = '';
    if (isCloudinaryConfigured()) {
      try {
        const cRes = await uploadPdfToCloudinary(req.file.path, 'sankalp_ai/papers', req.file.originalname);
        cloudinaryUrl = cRes.secure_url;
        cloudinaryPublicId = cRes.public_id;
      } catch (cErr) {
        console.warn('[Cloudinary Paper Warning]:', cErr.message);
      }
    }

    // Save AcademicFile
    const academicFile = await AcademicFile.create({
      folder_id: papersFolder._id,
      filename: req.file.filename,
      original_filename: req.file.originalname,
      file_type: 'application/pdf',
      file_size: req.file.size,
      storage_path: req.file.path,
      gridfs_id: gridfsId,
      cloudinary_url: cloudinaryUrl,
      cloudinary_public_id: cloudinaryPublicId,
      public_url: `/uploads/papers/${req.file.filename}`,
      metadata: {
        category: 'paper',
        subject_id,
        exam_year: parseInt(exam_year, 10),
        exam_type: exam_type || 'regular',
      },
    });

    const parsedYear = parseInt(exam_year, 10);

    const paper = await ExaminationPaper.create({
      subject_id,
      file_id: academicFile._id,
      exam_year: parsedYear,
      exam_type: exam_type || 'regular',
      is_included_in_analysis: is_included_in_analysis !== 'false' && is_included_in_analysis !== false,
      processing_status: 'pending',
    });

    // Run extraction in background
    processPaperAsync(paper._id, academicFile.storage_path, subject_id, parsedYear);

    await logAudit({
      action: 'UPLOAD_PAPER',
      entityType: 'ExaminationPaper',
      entityId: paper._id,
      details: { subject: subject.name, year: parsedYear },
      req,
    });

    return successResponse(res, paper, 'Question paper uploaded and processing initiated', 201);
  } catch (error) {
    next(error);
  }
};

// Async worker for processing question paper
const processPaperAsync = async (paperId, filePath, subjectId, examYear) => {
  try {
    await ExaminationPaper.findByIdAndUpdate(paperId, { processing_status: 'processing' });
    const { text } = await extractPdfText(filePath);

    // Heuristically extract questions
    const extractedItems = parseQuestionsFromText(text, examYear);

    // Clear any previous extracted questions for this paper if reprocessing
    await ExtractedQuestion.deleteMany({ paper_id: paperId });

    if (extractedItems.length > 0) {
      const questionsToInsert = extractedItems.map(item => ({
        paper_id: paperId,
        subject_id: subjectId,
        question_number: item.question_number,
        question_text: item.question_text,
        marks: item.marks,
        question_type: item.question_type,
        exam_year: examYear,
        is_verified: false,
      }));
      await ExtractedQuestion.insertMany(questionsToInsert);
    }

    await ExaminationPaper.findByIdAndUpdate(paperId, {
      extracted_text: text,
      processing_status: 'completed',
    });
  } catch (err) {
    console.error('[Paper Processing Failed]:', err.message);
    await ExaminationPaper.findByIdAndUpdate(paperId, {
      processing_status: 'failed',
      processing_error: err.message,
    });
  }
};

// PUT /api/admin/papers/:id
const updatePaper = async (req, res, next) => {
  try {
    const { exam_year, exam_type, is_included_in_analysis } = req.body;
    const paper = await ExaminationPaper.findById(req.params.id);
    if (!paper) return errorResponse(res, 'Paper not found', 404);

    if (exam_year) {
      paper.exam_year = parseInt(exam_year, 10);
      await ExtractedQuestion.updateMany({ paper_id: paper._id }, { exam_year: paper.exam_year });
    }
    if (exam_type) paper.exam_type = exam_type;
    if (is_included_in_analysis !== undefined) paper.is_included_in_analysis = is_included_in_analysis;

    await paper.save();

    return successResponse(res, paper, 'Paper metadata updated');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/papers/:id
const deletePaper = async (req, res, next) => {
  try {
    const paper = await ExaminationPaper.findById(req.params.id).populate('file_id');
    if (!paper) return errorResponse(res, 'Paper not found', 404);

    // Delete questions
    await ExtractedQuestion.deleteMany({ paper_id: paper._id });

    // Delete file
    if (paper.file_id) {
      if (fs.existsSync(paper.file_id.storage_path)) {
        try { fs.unlinkSync(paper.file_id.storage_path); } catch (e) {}
      }
      await AcademicFile.findByIdAndDelete(paper.file_id._id);
    }

    await ExaminationPaper.findByIdAndDelete(paper._id);

    await logAudit({
      action: 'DELETE_PAPER',
      entityType: 'ExaminationPaper',
      entityId: paper._id,
      details: { year: paper.exam_year },
      req,
    });

    return successResponse(res, null, 'Question paper deleted successfully');
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/papers/:id/process
const triggerProcessPaper = async (req, res, next) => {
  try {
    const paper = await ExaminationPaper.findById(req.params.id).populate('file_id');
    if (!paper) return errorResponse(res, 'Paper not found', 404);

    if (!paper.file_id || !fs.existsSync(paper.file_id.storage_path)) {
      return errorResponse(res, 'PDF file not found on disk', 404);
    }

    paper.processing_status = 'processing';
    paper.processing_error = '';
    await paper.save();

    processPaperAsync(paper._id, paper.file_id.storage_path, paper.subject_id, paper.exam_year);

    return successResponse(res, paper, 'Reprocessing initiated');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPapers,
  uploadPaper,
  updatePaper,
  deletePaper,
  triggerProcessPaper,
};
