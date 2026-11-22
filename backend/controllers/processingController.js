const SyllabusVersion = require('../models/SyllabusVersion');
const ExaminationPaper = require('../models/ExaminationPaper');
const { successResponse } = require('../utils/apiResponse');

// GET /api/admin/processing/status
const getProcessingStatus = async (req, res, next) => {
  try {
    const [
      pendingSyllabus,
      processingSyllabus,
      completedSyllabus,
      failedSyllabus,
      pendingPapers,
      processingPapers,
      completedPapers,
      failedPapers,
    ] = await Promise.all([
      SyllabusVersion.countDocuments({ processing_status: 'pending' }),
      SyllabusVersion.countDocuments({ processing_status: 'processing' }),
      SyllabusVersion.countDocuments({ processing_status: 'completed' }),
      SyllabusVersion.countDocuments({ processing_status: 'failed' }),
      ExaminationPaper.countDocuments({ processing_status: 'pending' }),
      ExaminationPaper.countDocuments({ processing_status: 'processing' }),
      ExaminationPaper.countDocuments({ processing_status: 'completed' }),
      ExaminationPaper.countDocuments({ processing_status: 'failed' }),
    ]);

    return successResponse(res, {
      total_pending: pendingSyllabus + pendingPapers,
      total_processing: processingSyllabus + processingPapers,
      total_completed: completedSyllabus + completedPapers,
      total_failed: failedSyllabus + failedPapers,
      syllabus: {
        pending: pendingSyllabus,
        processing: processingSyllabus,
        completed: completedSyllabus,
        failed: failedSyllabus,
      },
      papers: {
        pending: pendingPapers,
        processing: processingPapers,
        completed: completedPapers,
        failed: failedPapers,
      },
    }, 'Processing status overview');
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/processing/pending
const getPendingDocs = async (req, res, next) => {
  try {
    const [pendingSyllabus, pendingPapers] = await Promise.all([
      SyllabusVersion.find({ processing_status: { $in: ['pending', 'processing'] } })
        .populate('semester_id')
        .populate('file_id'),
      ExaminationPaper.find({ processing_status: { $in: ['pending', 'processing'] } })
        .populate('subject_id')
        .populate('file_id'),
    ]);

    return successResponse(res, {
      syllabus: pendingSyllabus,
      papers: pendingPapers,
    }, 'Pending documents');
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/processing/failed
const getFailedDocs = async (req, res, next) => {
  try {
    const [failedSyllabus, failedPapers] = await Promise.all([
      SyllabusVersion.find({ processing_status: 'failed' })
        .populate('semester_id')
        .populate('file_id'),
      ExaminationPaper.find({ processing_status: 'failed' })
        .populate('subject_id')
        .populate('file_id'),
    ]);

    return successResponse(res, {
      syllabus: failedSyllabus,
      papers: failedPapers,
    }, 'Failed documents');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProcessingStatus,
  getPendingDocs,
  getFailedDocs,
};
