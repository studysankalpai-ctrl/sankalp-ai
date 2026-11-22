const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/publicController');

router.get('/courses', getPublishedCourses);
router.get('/courses/:courseId/semesters', getCourseSemesters);
router.get('/semesters/:semesterId/subjects', getSemesterSubjects);
router.get('/subjects/:id', getSubjectDetail);
router.get('/subjects/:subjectId/papers', getSubjectPapers);
router.get('/subjects/:subjectId/books', getSubjectBooks);
router.get('/books', getPublicBooks);
router.get('/semesters/:semesterId/syllabus', getActiveSyllabus);
router.get('/folders/:id', getFolderContents);
router.get('/files/:id', getFileDetail);
router.get('/files/:id/view', viewFileInline);
router.get('/files/:id/download', downloadPublicFile);
router.get('/library/tree', getLibraryTree);
router.get('/topics', getPublishedTopics);
router.get('/analysis/:subjectId', getPublishedAnalysis);
router.get('/questions', getPracticeQuestions);
router.get('/stats', getPublicStats);
router.get('/search', searchContent);

module.exports = router;
