const Course = require('../models/Course');
const Semester = require('../models/Semester');
const Subject = require('../models/Subject');
const Folder = require('../models/Folder');
const AcademicFile = require('../models/AcademicFile');
const ExaminationPaper = require('../models/ExaminationPaper');
const SyllabusVersion = require('../models/SyllabusVersion');
const ExtractedQuestion = require('../models/ExtractedQuestion');
const ImportantTopic = require('../models/ImportantTopic');
const AuditLog = require('../models/AuditLog');
const { successResponse } = require('../utils/apiResponse');

// GET /api/admin/stats
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalCourses,
      totalSemesters,
      totalSubjects,
      totalFolders,
      totalAcademicFiles,
      totalPapers,
      totalQuestions,
      totalTopics,
      pendingSyllabus,
      pendingPapers,
      failedSyllabus,
      failedPapers,
    ] = await Promise.all([
      Course.countDocuments(),
      Semester.countDocuments(),
      Subject.countDocuments(),
      Folder.countDocuments(),
      AcademicFile.countDocuments(),
      ExaminationPaper.countDocuments(),
      ExtractedQuestion.countDocuments(),
      ImportantTopic.countDocuments(),
      SyllabusVersion.countDocuments({ processing_status: 'pending' }),
      ExaminationPaper.countDocuments({ processing_status: 'pending' }),
      SyllabusVersion.countDocuments({ processing_status: 'failed' }),
      ExaminationPaper.countDocuments({ processing_status: 'failed' }),
    ]);

    return successResponse(res, {
      total_courses: totalCourses,
      total_semesters: totalSemesters,
      total_subjects: totalSubjects,
      total_folders: totalFolders,
      total_academic_files: totalAcademicFiles,
      total_published_papers: totalPapers,
      total_questions: totalQuestions,
      total_topics: totalTopics,
      pending_processing: pendingSyllabus + pendingPapers,
      failed_processing: failedSyllabus + failedPapers,
    }, 'Admin dashboard statistics');
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/audit-logs
const getAuditLogs = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const logs = await AuditLog.find()
      .populate('admin_id', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit);

    return successResponse(res, logs, 'Audit logs', 200, logs.length);
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/storage
const getStorageStats = async (req, res, next) => {
  try {
    const files = await AcademicFile.find();
    let totalSizeBytes = 0;
    const categoryBreakdown = {
      syllabus: { count: 0, size: 0 },
      papers: { count: 0, size: 0 },
      general: { count: 0, size: 0 },
    };

    files.forEach(f => {
      totalSizeBytes += f.file_size || 0;
      const cat = f.metadata?.category || 'general';
      if (categoryBreakdown[cat]) {
        categoryBreakdown[cat].count += 1;
        categoryBreakdown[cat].size += f.file_size || 0;
      } else {
        categoryBreakdown.general.count += 1;
        categoryBreakdown.general.size += f.file_size || 0;
      }
    });

    return successResponse(res, {
      total_files: files.length,
      total_size_bytes: totalSizeBytes,
      total_size_mb: parseFloat((totalSizeBytes / (1024 * 1024)).toFixed(2)),
      breakdown: categoryBreakdown,
    }, 'Storage statistics');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAuditLogs,
  getStorageStats,
};
