const Semester = require('../models/Semester');
const Subject = require('../models/Subject');
const Folder = require('../models/Folder');
const Course = require('../models/Course');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logAudit } = require('../utils/auditLogger');

// GET /api/admin/semesters
const getSemesters = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.course_id) {
      filter.course_id = req.query.course_id;
    }
    const semesters = await Semester.find(filter)
      .populate('course_id', 'name code')
      .sort({ sort_order: 1, number: 1 });
    return successResponse(res, semesters, 'Semesters fetched', 200, semesters.length);
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/semesters/:id
const getSemesterById = async (req, res, next) => {
  try {
    const semester = await Semester.findById(req.params.id).populate('course_id');
    if (!semester) return errorResponse(res, 'Semester not found', 404);
    return successResponse(res, semester, 'Semester details');
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/semesters
const createSemester = async (req, res, next) => {
  try {
    const { course_id, number, name, sort_order, is_published } = req.body;
    if (!course_id || number === undefined) {
      return errorResponse(res, 'Course ID and Semester number are required', 400);
    }

    const course = await Course.findById(course_id);
    if (!course) return errorResponse(res, 'Course not found', 404);

    const existing = await Semester.findOne({ course_id, number });
    if (existing) {
      return errorResponse(res, `Semester ${number} already exists for ${course.name}`, 400);
    }

    const semesterName = name ? name.trim() : `Semester ${number}`;

    const semester = await Semester.create({
      course_id,
      number: parseInt(number, 10),
      name: semesterName,
      sort_order: sort_order || parseInt(number, 10),
      is_published: is_published !== false,
    });

    // Find parent course folder
    const courseFolder = await Folder.findOne({ course_id, folder_type: 'course' });

    // Create system folder for this semester
    const semFolder = await Folder.create({
      name: semester.name,
      parent_folder_id: courseFolder ? courseFolder._id : null,
      course_id,
      semester_id: semester._id,
      folder_type: 'semester',
      is_system: true,
    });

    // Create Official Syllabus subfolder inside semester folder
    await Folder.create({
      name: 'Official Syllabus',
      parent_folder_id: semFolder._id,
      course_id,
      semester_id: semester._id,
      folder_type: 'syllabus',
      is_system: true,
    });

    await logAudit({
      action: 'CREATE_SEMESTER',
      entityType: 'Semester',
      entityId: semester._id,
      details: { course_name: course.name, semester: semester.name },
      req,
    });

    return successResponse(res, semester, 'Semester created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/semesters/:id
const updateSemester = async (req, res, next) => {
  try {
    const { name, number, sort_order, is_published, is_archived } = req.body;
    const semester = await Semester.findById(req.params.id);
    if (!semester) return errorResponse(res, 'Semester not found', 404);

    if (number !== undefined && number !== semester.number) {
      const existing = await Semester.findOne({
        course_id: semester.course_id,
        number,
        _id: { $ne: semester._id },
      });
      if (existing) return errorResponse(res, `Semester ${number} already exists for this course`, 400);
      semester.number = number;
    }

    if (name) semester.name = name.trim();
    if (sort_order !== undefined) semester.sort_order = sort_order;
    if (is_published !== undefined) semester.is_published = is_published;
    if (is_archived !== undefined) semester.is_archived = is_archived;

    await semester.save();

    await logAudit({
      action: 'UPDATE_SEMESTER',
      entityType: 'Semester',
      entityId: semester._id,
      details: { semester: semester.name },
      req,
    });

    return successResponse(res, semester, 'Semester updated successfully');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/semesters/:id
const deleteSemester = async (req, res, next) => {
  try {
    const semester = await Semester.findById(req.params.id);
    if (!semester) return errorResponse(res, 'Semester not found', 404);

    const subjectCount = await Subject.countDocuments({ semester_id: semester._id });
    if (subjectCount > 0) {
      return errorResponse(res, `Cannot delete semester. It contains ${subjectCount} subject(s).`, 400);
    }

    await Semester.findByIdAndDelete(semester._id);
    await Folder.deleteMany({ semester_id: semester._id, is_system: true });

    await logAudit({
      action: 'DELETE_SEMESTER',
      entityType: 'Semester',
      entityId: semester._id,
      details: { semester: semester.name },
      req,
    });

    return successResponse(res, null, 'Semester deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSemesters,
  getSemesterById,
  createSemester,
  updateSemester,
  deleteSemester,
};
