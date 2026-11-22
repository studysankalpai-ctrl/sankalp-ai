const fs = require('fs');
const path = require('path');
const Course = require('../models/Course');
const Semester = require('../models/Semester');
const Subject = require('../models/Subject');
const Folder = require('../models/Folder');
const AcademicFile = require('../models/AcademicFile');
const ExaminationPaper = require('../models/ExaminationPaper');
const SyllabusVersion = require('../models/SyllabusVersion');
const ImportantTopic = require('../models/ImportantTopic');
const SubjectAnalysis = require('../models/SubjectAnalysis');
const ExtractedQuestion = require('../models/ExtractedQuestion');
const Book = require('../models/Book');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// GET /api/public/courses
const getPublishedCourses = async (req, res, next) => {
  try {
    let courses = await Course.find({ is_published: true, is_archived: { $ne: true } })
      .sort({ sort_order: 1, name: 1 });
    if (courses.length === 0) {
      courses = await Course.find({ is_archived: { $ne: true } })
        .sort({ sort_order: 1, name: 1 });
    }
    return successResponse(res, courses, 'Published courses', 200, courses.length);
  } catch (error) {
    next(error);
  }
};

// GET /api/public/courses/:courseId/semesters
const getCourseSemesters = async (req, res, next) => {
  try {
    let semesters = await Semester.find({
      course_id: req.params.courseId,
      is_published: true,
      is_archived: { $ne: true },
    }).sort({ number: 1, sort_order: 1 });

    if (semesters.length === 0) {
      semesters = await Semester.find({
        course_id: req.params.courseId,
        is_archived: { $ne: true },
      }).sort({ number: 1, sort_order: 1 });
    }

    return successResponse(res, semesters, 'Semesters', 200, semesters.length);
  } catch (error) {
    next(error);
  }
};

// GET /api/public/semesters/:semesterId/subjects
const getSemesterSubjects = async (req, res, next) => {
  try {
    let subjects = await Subject.find({
      semester_id: req.params.semesterId,
      is_published: true,
      is_archived: { $ne: true },
    }).sort({ sort_order: 1, name: 1 });

    if (subjects.length === 0) {
      subjects = await Subject.find({
        semester_id: req.params.semesterId,
        is_archived: { $ne: true },
      }).sort({ sort_order: 1, name: 1 });
    }

    return successResponse(res, subjects, 'Subjects', 200, subjects.length);
  } catch (error) {
    next(error);
  }
};

// GET /api/public/subjects/:id
const getSubjectDetail = async (req, res, next) => {
  try {
    let subject = await Subject.findOne({
      _id: req.params.id,
      is_published: true,
      is_archived: { $ne: true },
    }).populate({
      path: 'semester_id',
      populate: { path: 'course_id' }
    });

    if (!subject) {
      subject = await Subject.findOne({
        _id: req.params.id,
        is_archived: { $ne: true },
      }).populate({
        path: 'semester_id',
        populate: { path: 'course_id' }
      });
    }

    if (!subject) return errorResponse(res, 'Subject not found', 404);
    return successResponse(res, subject, 'Subject detail');
  } catch (error) {
    next(error);
  }
};

// GET /api/public/subjects/:subjectId/papers
const getSubjectPapers = async (req, res, next) => {
  try {
    const papers = await ExaminationPaper.find({
      subject_id: req.params.subjectId,
    })
      .populate('file_id')
      .sort({ exam_year: -1 });

    return successResponse(res, papers, 'Question papers', 200, papers.length);
  } catch (error) {
    next(error);
  }
};

// GET /api/public/semesters/:semesterId/syllabus
const getActiveSyllabus = async (req, res, next) => {
  try {
    const syllabus = await SyllabusVersion.findOne({
      semester_id: req.params.semesterId,
      is_active: true,
    }).populate('file_id');

    if (!syllabus) {
      return errorResponse(res, 'The official syllabus has not been uploaded yet.', 404);
    }

    return successResponse(res, syllabus, 'Active syllabus');
  } catch (error) {
    next(error);
  }
};

// GET /api/public/folders/:id
const getFolderContents = async (req, res, next) => {
  try {
    const folder = await Folder.findById(req.params.id)
      .populate('course_id', 'name code')
      .populate('semester_id', 'name number')
      .populate('subject_id', 'name code');

    if (!folder) return errorResponse(res, 'Folder not found', 404);

    const childFolders = await Folder.find({ parent_folder_id: folder._id }).sort({ name: 1 });
    const files = await AcademicFile.find({ folder_id: folder._id }).sort({ filename: 1 });

    // Build breadcrumbs
    const breadcrumbs = [];
    let current = folder;
    while (current) {
      breadcrumbs.unshift({ id: current._id, name: current.name, folder_type: current.folder_type });
      if (current.parent_folder_id) {
        current = await Folder.findById(current.parent_folder_id);
      } else {
        current = null;
      }
    }

    return successResponse(res, {
      folder,
      childFolders,
      files,
      breadcrumbs,
    }, 'Folder contents');
  } catch (error) {
    next(error);
  }
};

// GET /api/public/library/tree
const getLibraryTree = async (req, res, next) => {
  try {
    // Return hierarchical tree of courses -> semesters -> subjects -> folders
    let courses = await Course.find({ is_published: true, is_archived: { $ne: true } }).sort({ sort_order: 1 });
    if (courses.length === 0) courses = await Course.find({ is_archived: { $ne: true } }).sort({ sort_order: 1 });

    let semesters = await Semester.find({ is_published: true, is_archived: { $ne: true } }).sort({ number: 1 });
    if (semesters.length === 0) semesters = await Semester.find({ is_archived: { $ne: true } }).sort({ number: 1 });

    let subjects = await Subject.find({ is_published: true, is_archived: { $ne: true } }).sort({ sort_order: 1 });
    if (subjects.length === 0) subjects = await Subject.find({ is_archived: { $ne: true } }).sort({ sort_order: 1 });

    const rootFolders = await Folder.find({ parent_folder_id: null });

    return successResponse(res, {
      courses,
      semesters,
      subjects,
      rootFolders,
    }, 'Library hierarchy');
  } catch (error) {
    next(error);
  }
};

// GET /api/public/topics
const getPublishedTopics = async (req, res, next) => {
  try {
    const filter = { is_published: true };
    if (req.query.subject_id) filter.subject_id = req.query.subject_id;
    if (req.query.priority) filter.priority = req.query.priority;

    const topics = await ImportantTopic.find(filter)
      .populate('subject_id', 'name code')
      .sort({ priority: 1, historical_appearances: -1 });

    return successResponse(res, topics, 'Published important topics', 200, topics.length);
  } catch (error) {
    next(error);
  }
};

// GET /api/public/analysis/:subjectId
const getPublishedAnalysis = async (req, res, next) => {
  try {
    const analysis = await SubjectAnalysis.findOne({
      subject_id: req.params.subjectId,
      is_published: true,
    }).populate('subject_id', 'name code');

    if (!analysis) {
      return errorResponse(res, 'Analysis has not been generated for this subject yet.', 404);
    }

    return successResponse(res, analysis, 'Subject analysis');
  } catch (error) {
    next(error);
  }
};

// GET /api/public/questions
const getPracticeQuestions = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.subject_id) filter.subject_id = req.query.subject_id;
    if (req.query.unit) filter.unit = req.query.unit;
    if (req.query.question_type) filter.question_type = req.query.question_type;
    if (req.query.marks) filter.marks = parseInt(req.query.marks, 10);

    const limit = parseInt(req.query.limit, 10) || 50;
    const questions = await ExtractedQuestion.find(filter)
      .populate('subject_id', 'name code')
      .sort({ exam_year: -1, marks: -1 })
      .limit(limit);

    return successResponse(res, questions, 'Questions fetched', 200, questions.length);
  } catch (error) {
    next(error);
  }
};

// GET /api/public/stats
const getPublicStats = async (req, res, next) => {
  try {
    let [courses, subjects, papers, topics] = await Promise.all([
      Course.countDocuments({ is_published: true, is_archived: { $ne: true } }),
      Subject.countDocuments({ is_published: true, is_archived: { $ne: true } }),
      ExaminationPaper.countDocuments(),
      ImportantTopic.countDocuments({ is_published: true }),
    ]);

    if (courses === 0) courses = await Course.countDocuments({ is_archived: { $ne: true } });
    if (subjects === 0) subjects = await Subject.countDocuments({ is_archived: { $ne: true } });
    if (topics === 0) topics = await ImportantTopic.countDocuments();

    return successResponse(res, {
      total_courses: courses,
      total_subjects: subjects,
      total_papers: papers,
      total_topics: topics,
    }, 'Public platform statistics');
  } catch (error) {
    next(error);
  }
};

// GET /api/public/search
const searchContent = async (req, res, next) => {
  try {
    const q = req.query.q;
    if (!q || q.trim().length < 2) {
      return successResponse(res, { files: [], questions: [], topics: [] }, 'Search results');
    }

    const regex = new RegExp(q.trim(), 'i');

    const [files, questions, topics] = await Promise.all([
      AcademicFile.find({
        $or: [{ filename: regex }, { original_filename: regex }]
      }).limit(10),
      ExtractedQuestion.find({
        $or: [{ question_text: regex }, { topic: regex }]
      }).populate('subject_id', 'name code').limit(15),
      ImportantTopic.find({
        $or: [{ topic_name: regex }, { why_important: regex }],
        is_published: true,
      }).populate('subject_id', 'name code').limit(10),
    ]);

    return successResponse(res, {
      files,
      questions,
      topics,
    }, 'Search results');
  } catch (error) {
    next(error);
  }
};

/**
 * Universal helper to resolve any academic file (AcademicFile, Syllabus, Paper)
 */
const resolveFileRecord = async (fileId) => {
  try {
    let file = await AcademicFile.findById(fileId).populate('folder_id');
    if (file) {
      return {
        _id: file._id,
        original_filename: file.original_filename,
        filename: file.filename,
        file_size: file.file_size,
        file_type: file.file_type || 'application/pdf',
        upload_date: file.upload_date,
        storage_path: file.storage_path,
        public_url: file.public_url,
        folder_id: file.folder_id,
        type: 'academic_file',
      };
    }

    const syllabus = await SyllabusVersion.findById(fileId);
    if (syllabus) {
      return {
        _id: syllabus._id,
        original_filename: syllabus.original_filename || syllabus.filename,
        filename: syllabus.filename,
        file_size: syllabus.file_size,
        file_type: 'application/pdf',
        upload_date: syllabus.upload_date,
        storage_path: syllabus.storage_path,
        public_url: syllabus.file_url,
        type: 'syllabus',
      };
    }

    const paper = await ExaminationPaper.findById(fileId);
    if (paper) {
      return {
        _id: paper._id,
        original_filename: paper.original_filename || paper.filename,
        filename: paper.filename,
        file_size: paper.file_size,
        file_type: 'application/pdf',
        upload_date: paper.upload_date,
        storage_path: paper.storage_path,
        public_url: paper.file_url,
        type: 'paper',
      };
    }

    const book = await Book.findById(fileId);
    if (book) {
      return {
        _id: book._id,
        original_filename: book.file_name,
        filename: book.title,
        file_size: book.file_size,
        file_type: 'application/pdf',
        upload_date: book.createdAt,
        storage_path: book.storage_path,
        public_url: book.public_url,
        type: 'book',
        title: book.title,
        author: book.author,
        edition: book.edition,
        description: book.description,
        total_pages: book.total_pages,
      };
    }

    return null;
  } catch (e) {
    return null;
  }
};

// GET /api/public/files/:id
const getFileDetail = async (req, res, next) => {
  try {
    const file = await resolveFileRecord(req.params.id);
    if (!file) return errorResponse(res, 'File not found', 404);
    return successResponse(res, file, 'File details');
  } catch (error) {
    next(error);
  }
};

// GET /api/public/files/:id/view
const viewFileInline = async (req, res, next) => {
  try {
    const file = await resolveFileRecord(req.params.id);
    if (!file) return errorResponse(res, 'File record not found', 404);

    if (!file.storage_path || !fs.existsSync(file.storage_path)) {
      return errorResponse(res, 'PDF file not available on storage server', 404);
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

// GET /api/public/files/:id/download
const downloadPublicFile = async (req, res, next) => {
  try {
    const file = await resolveFileRecord(req.params.id);
    if (!file) return errorResponse(res, 'File not found', 404);

    if (!file.storage_path || !fs.existsSync(file.storage_path)) {
      return errorResponse(res, 'File not found on storage server', 404);
    }

    return res.download(file.storage_path, file.original_filename);
  } catch (error) {
    next(error);
  }
};

// GET /api/public/books
const getPublicBooks = async (req, res, next) => {
  try {
    const { course_id, semester_id, subject_id } = req.query;
    const filter = { is_active: true };

    if (course_id) filter.course_id = course_id;
    if (semester_id) filter.semester_id = semester_id;
    if (subject_id) filter.subject_id = subject_id;

    const books = await Book.find(filter)
      .populate('course_id', 'name code')
      .populate('semester_id', 'name number')
      .populate('subject_id', 'name code')
      .sort({ createdAt: -1 });

    return successResponse(res, books, 'Books fetched successfully', 200, books.length);
  } catch (error) {
    next(error);
  }
};

// GET /api/public/subjects/:subjectId/books
const getSubjectBooks = async (req, res, next) => {
  try {
    const books = await Book.find({
      subject_id: req.params.subjectId,
      is_active: true,
    })
      .populate('course_id', 'name code')
      .populate('semester_id', 'name number')
      .populate('subject_id', 'name code')
      .sort({ createdAt: -1 });

    return successResponse(res, books, 'Subject books fetched successfully', 200, books.length);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublishedCourses,
  getCourseSemesters,
  getSemesterSubjects,
  getSubjectDetail,
  getSubjectPapers,
  getActiveSyllabus,
  getFolderContents,
  getLibraryTree,
  getPublishedTopics,
  getPublishedAnalysis,
  getPracticeQuestions,
  getPublicStats,
  searchContent,
  getFileDetail,
  viewFileInline,
  downloadPublicFile,
  getPublicBooks,
  getSubjectBooks,
};
