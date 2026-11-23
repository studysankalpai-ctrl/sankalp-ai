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
const { streamFromGridFS, resolveLocalFilePath, existsInGridFS } = require('../services/storageService');

// High-speed in-memory cache for instant switching
let academicTreeCache = null;
let academicTreeCacheTime = 0;

// GET /api/public/academic-tree - Returns entire published academic hierarchy in one instant query
const getAcademicTree = async (req, res, next) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    if (academicTreeCache && Date.now() - academicTreeCacheTime < 60000) {
      return successResponse(res, academicTreeCache, 'Academic hierarchy (cached)');
    }

    const [courses, semesters, subjects] = await Promise.all([
      Course.find({ is_archived: { $ne: true } }).sort({ sort_order: 1, name: 1 }).lean(),
      Semester.find({ is_archived: { $ne: true } }).sort({ number: 1, sort_order: 1 }).lean(),
      Subject.find({ is_archived: { $ne: true } }).sort({ sort_order: 1, name: 1 }).lean(),
    ]);

    const result = { courses, semesters, subjects };
    academicTreeCache = result;
    academicTreeCacheTime = Date.now();

    return successResponse(res, result, 'Academic hierarchy');
  } catch (error) {
    next(error);
  }
};

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
    const { course_id, semester_id } = req.query;

    // Fetch all active curriculum records to compute accurate breakdowns
    const [allCourses, allSemesters, allSubjects, allPapers, allTopics] = await Promise.all([
      Course.find({ is_archived: { $ne: true } }).sort({ sort_order: 1, code: 1 }),
      Semester.find({ is_archived: { $ne: true } }),
      Subject.find({ is_archived: { $ne: true } }),
      ExaminationPaper.find().select('subject_id exam_year'),
      ImportantTopic.find({ is_published: true }).select('subject_id topic_name'),
    ]);

    // Build per-course breakdown (BMC vs BMB, etc.)
    const coursesBreakdown = allCourses.map((course) => {
      const courseSemIds = allSemesters
        .filter((s) => s.course_id && s.course_id.toString() === course._id.toString())
        .map((s) => s._id.toString());

      const courseSubjects = allSubjects.filter(
        (sub) => sub.semester_id && courseSemIds.includes(sub.semester_id.toString())
      );
      const courseSubjectIds = courseSubjects.map((s) => s._id.toString());

      const coursePapers = allPapers.filter(
        (p) => p.subject_id && courseSubjectIds.includes(p.subject_id.toString())
      );
      const courseTopics = allTopics.filter(
        (t) => t.subject_id && courseSubjectIds.includes(t.subject_id.toString())
      );

      // Subject-wise details with individual past paper counts
      const subjectsWithCount = courseSubjects.map((sub) => {
        const subPapersCount = allPapers.filter(
          (p) => p.subject_id && p.subject_id.toString() === sub._id.toString()
        ).length;
        const subTopicsCount = allTopics.filter(
          (t) => t.subject_id && t.subject_id.toString() === sub._id.toString()
        ).length;

        return {
          _id: sub._id,
          code: sub.code,
          name: sub.name,
          papers_count: subPapersCount,
          topics_count: subTopicsCount,
        };
      });

      return {
        course_id: course._id,
        course_code: course.code,
        course_name: course.name,
        total_subjects: courseSubjects.length,
        total_papers: coursePapers.length,
        total_topics: courseTopics.length,
        subjects: subjectsWithCount,
      };
    });

    // Check if client asked for a specific course
    let selectedBreakdown = null;
    if (course_id) {
      selectedBreakdown = coursesBreakdown.find(
        (cb) =>
          cb.course_id.toString() === course_id.toString() ||
          cb.course_code.toLowerCase() === course_id.toLowerCase()
      );
    }

    const totalCourses = allCourses.length;
    const totalSubjects = selectedBreakdown ? selectedBreakdown.total_subjects : allSubjects.length;
    const totalPapers = selectedBreakdown ? selectedBreakdown.total_papers : allPapers.length;
    const totalTopics = selectedBreakdown ? selectedBreakdown.total_topics : allTopics.length;

    return successResponse(
      res,
      {
        total_courses: totalCourses,
        total_subjects: totalSubjects,
        total_papers: totalPapers,
        total_topics: totalTopics,
        is_filtered: !!selectedBreakdown,
        filtered_course: selectedBreakdown
          ? {
              code: selectedBreakdown.course_code,
              name: selectedBreakdown.course_name,
            }
          : null,
        courses_breakdown: coursesBreakdown,
      },
      'Public platform statistics'
    );
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
      let subject = null;
      let extractedText = '';
      let fileType = 'academic_file';

      // Check if an ExaminationPaper is linked to this file
      const linkedPaper = await ExaminationPaper.findOne({ file_id: file._id }).populate('subject_id', 'name code units course_id semester_id');
      if (linkedPaper) {
        fileType = 'paper';
        extractedText = linkedPaper.extracted_text || '';
        subject = linkedPaper.subject_id;
      } else {
        // Check if a SyllabusVersion is linked
        const linkedSyllabus = await SyllabusVersion.findOne({ file_id: file._id }).populate('subject_id', 'name code units course_id semester_id');
        if (linkedSyllabus) {
          fileType = 'syllabus';
          extractedText = linkedSyllabus.extracted_text || '';
          subject = linkedSyllabus.subject_id;
        } else if (file.folder_id && file.folder_id.subject_id) {
          subject = await Subject.findById(file.folder_id.subject_id).select('name code units course_id semester_id');
        }
      }

      return {
        _id: file._id,
        original_filename: file.original_filename,
        filename: file.filename,
        file_size: file.file_size,
        file_type: file.file_type || 'application/pdf',
        upload_date: file.upload_date,
        storage_path: file.storage_path,
        gridfs_id: file.gridfs_id,
        cloudinary_url: file.cloudinary_url,
        public_url: file.public_url,
        folder_id: file.folder_id,
        subject_id: subject?._id || file.folder_id?.subject_id,
        subject: subject,
        extracted_text: extractedText,
        type: fileType,
      };
    }

    const syllabus = await SyllabusVersion.findById(fileId).populate('file_id').populate('subject_id', 'name code units course_id semester_id');
    if (syllabus) {
      return {
        _id: syllabus._id,
        original_filename: syllabus.original_filename || syllabus.filename,
        filename: syllabus.filename,
        file_size: syllabus.file_size,
        file_type: 'application/pdf',
        upload_date: syllabus.upload_date,
        storage_path: syllabus.storage_path || syllabus.file_id?.storage_path,
        gridfs_id: syllabus.gridfs_id || syllabus.file_id?.gridfs_id,
        cloudinary_url: syllabus.cloudinary_url || syllabus.file_id?.cloudinary_url,
        public_url: syllabus.file_url,
        subject_id: syllabus.subject_id?._id || syllabus.subject_id,
        subject: syllabus.subject_id,
        extracted_text: syllabus.extracted_text,
        type: 'syllabus',
      };
    }

    const paper = await ExaminationPaper.findById(fileId).populate('file_id').populate('subject_id', 'name code units course_id semester_id');
    if (paper) {
      return {
        _id: paper._id,
        original_filename: paper.original_filename || paper.file_id?.original_filename || paper.filename,
        filename: paper.filename || paper.file_id?.filename,
        file_size: paper.file_size || paper.file_id?.file_size,
        file_type: 'application/pdf',
        upload_date: paper.upload_date,
        storage_path: paper.storage_path || paper.file_id?.storage_path,
        gridfs_id: paper.gridfs_id || paper.file_id?.gridfs_id,
        cloudinary_url: paper.cloudinary_url || paper.file_id?.cloudinary_url,
        public_url: paper.file_url,
        subject_id: paper.subject_id?._id || paper.subject_id,
        subject: paper.subject_id,
        extracted_text: paper.extracted_text,
        year: paper.year,
        exam_type: paper.exam_type,
        type: 'paper',
      };
    }

    const book = await Book.findById(fileId).populate('subject_id', 'name code units course_id semester_id');
    if (book) {
      return {
        _id: book._id,
        original_filename: book.file_name,
        filename: book.title,
        file_size: book.file_size,
        file_type: 'application/pdf',
        upload_date: book.createdAt,
        storage_path: book.storage_path,
        gridfs_id: book.gridfs_id,
        cloudinary_url: book.cloudinary_url,
        public_url: book.public_url,
        subject_id: book.subject_id?._id || book.subject_id,
        subject: book.subject_id,
        type: 'book',
        title: book.title,
        author: book.author,
        edition: book.edition,
        description: book.description,
        total_pages: book.total_pages,
        extracted_text: book.extracted_text,
        summary_index: book.summary_index,
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

    res.removeHeader('X-Frame-Options');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    // 1. Direct Cloudinary redirect if available (fastest, CDN powered)
    if (file.cloudinary_url && file.cloudinary_url.startsWith('http')) {
      return res.redirect(file.cloudinary_url);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.original_filename || 'document.pdf')}"`);

    // 2. Stream from GridFS if available
    if (file.gridfs_id) {
      try {
        const stream = streamFromGridFS(file.gridfs_id);
        stream.on('error', (err) => {
          console.warn('[GridFS Stream warning]:', err.message);
          if (!res.headersSent) {
            const subfolder = file.type === 'book' ? 'books' : file.type === 'paper' ? 'papers' : file.type === 'syllabus' ? 'syllabus' : '';
            const diskPath = resolveLocalFilePath(file.storage_path, subfolder);
            if (diskPath && fs.existsSync(diskPath)) {
              return fs.createReadStream(diskPath).pipe(res);
            }
            return errorResponse(res, 'PDF stream error from storage server', 500);
          }
        });
        return stream.pipe(res);
      } catch (gridFsErr) {
        console.warn('[GridFS unavailable, trying local disk]:', gridFsErr.message);
      }
    }

    // 3. Check flexible local disk path
    const subfolder = file.type === 'book' ? 'books' : file.type === 'paper' ? 'papers' : file.type === 'syllabus' ? 'syllabus' : '';
    const resolvedDiskPath = resolveLocalFilePath(file.storage_path, subfolder);
    if (resolvedDiskPath && fs.existsSync(resolvedDiskPath)) {
      return fs.createReadStream(resolvedDiskPath).pipe(res);
    }

    return errorResponse(res, 'PDF file not available on storage server', 404);
  } catch (error) {
    next(error);
  }
};

// GET /api/public/files/:id/download
const downloadPublicFile = async (req, res, next) => {
  try {
    const file = await resolveFileRecord(req.params.id);
    if (!file) return errorResponse(res, 'File not found', 404);

    // 1. Direct Cloudinary redirect if available
    if (file.cloudinary_url && file.cloudinary_url.startsWith('http')) {
      return res.redirect(file.cloudinary_url);
    }

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.original_filename || 'document.pdf')}"`);
    res.setHeader('Content-Type', 'application/pdf');

    // 2. Stream from GridFS if available
    if (file.gridfs_id) {
      try {
        const stream = streamFromGridFS(file.gridfs_id);
        return stream.pipe(res);
      } catch (gridFsErr) {
        console.warn('[GridFS download warning]:', gridFsErr.message);
      }
    }

    // 3. Check flexible local disk path
    const subfolder = file.type === 'book' ? 'books' : file.type === 'paper' ? 'papers' : file.type === 'syllabus' ? 'syllabus' : '';
    const resolvedDiskPath = resolveLocalFilePath(file.storage_path, subfolder);
    if (resolvedDiskPath && fs.existsSync(resolvedDiskPath)) {
      return res.download(resolvedDiskPath, file.original_filename);
    }

    return errorResponse(res, 'File not found on storage server', 404);
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
  getAcademicTree,
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
