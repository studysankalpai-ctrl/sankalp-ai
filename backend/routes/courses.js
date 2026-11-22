const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  togglePublish,
  toggleArchive,
} = require('../controllers/courseController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getCourses)
  .post(createCourse);

router.route('/:id')
  .get(getCourseById)
  .put(updateCourse)
  .delete(deleteCourse);

router.put('/:id/publish', togglePublish);
router.put('/:id/archive', toggleArchive);

module.exports = router;
