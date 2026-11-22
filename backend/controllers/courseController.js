const Course = require('../models/Course');
const Semester = require('../models/Semester');
const Folder = require('../models/Folder');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logAudit } = require('../utils/auditLogger');

// GET /api/admin/courses
const getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find().sort({ sort_order: 1, createdAt: -1 });
    return successResponse(res, courses, 'Courses fetched', 200, courses.length);
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/courses/:id
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return errorResponse(res, 'Course not found', 404);
    return successResponse(res, course, 'Course details');
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/courses
const createCourse = async (req, res, next) => {
  try {
    const { name, code, description, sort_order, is_published } = req.body;
    if (!name || !code) {
      return errorResponse(res, 'Name and code are required', 400);
    }

    const existing = await Course.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return errorResponse(res, `Course code "${code}" already exists`, 400);
    }

    const course = await Course.create({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      description: description || '',
      sort_order: sort_order || 0,
      is_published: is_published !== false,
    });

    // Create a system folder for this course
    await Folder.create({
      name: course.name,
      course_id: course._id,
      folder_type: 'course',
      is_system: true,
    });

    await logAudit({
      action: 'CREATE_COURSE',
      entityType: 'Course',
      entityId: course._id,
      details: { name: course.name, code: course.code },
      req,
    });

    return successResponse(res, course, 'Course created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/courses/:id
const updateCourse = async (req, res, next) => {
  try {
    const { name, code, description, sort_order, is_published, is_archived } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return errorResponse(res, 'Course not found', 404);

    if (code && code.toUpperCase().trim() !== course.code) {
      const existing = await Course.findOne({ code: code.toUpperCase().trim(), _id: { $ne: course._id } });
      if (existing) return errorResponse(res, `Course code "${code}" already exists`, 400);
      course.code = code.toUpperCase().trim();
    }

    if (name) course.name = name.trim();
    if (description !== undefined) course.description = description;
    if (sort_order !== undefined) course.sort_order = sort_order;
    if (is_published !== undefined) course.is_published = is_published;
    if (is_archived !== undefined) course.is_archived = is_archived;

    await course.save();

    await logAudit({
      action: 'UPDATE_COURSE',
      entityType: 'Course',
      entityId: course._id,
      details: { name: course.name, code: course.code },
      req,
    });

    return successResponse(res, course, 'Course updated successfully');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/courses/:id
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return errorResponse(res, 'Course not found', 404);

    // Check if there are semesters
    const semesterCount = await Semester.countDocuments({ course_id: course._id });
    if (semesterCount > 0) {
      return errorResponse(res, `Cannot delete course. It contains ${semesterCount} semester(s). Please delete or move them first.`, 400);
    }

    await Course.findByIdAndDelete(course._id);
    await Folder.deleteMany({ course_id: course._id, is_system: true });

    await logAudit({
      action: 'DELETE_COURSE',
      entityType: 'Course',
      entityId: course._id,
      details: { name: course.name, code: course.code },
      req,
    });

    return successResponse(res, null, 'Course deleted successfully');
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/courses/:id/publish
const togglePublish = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return errorResponse(res, 'Course not found', 404);

    course.is_published = !course.is_published;
    await course.save();

    await logAudit({
      action: 'TOGGLE_PUBLISH_COURSE',
      entityType: 'Course',
      entityId: course._id,
      details: { is_published: course.is_published },
      req,
    });

    return successResponse(res, course, `Course ${course.is_published ? 'published' : 'unpublished'}`);
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/courses/:id/archive
const toggleArchive = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return errorResponse(res, 'Course not found', 404);

    course.is_archived = !course.is_archived;
    await course.save();

    return successResponse(res, course, `Course ${course.is_archived ? 'archived' : 'unarchived'}`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  togglePublish,
  toggleArchive,
};
