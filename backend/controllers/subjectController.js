const Subject = require('../models/Subject');
const Semester = require('../models/Semester');
const Folder = require('../models/Folder');
const ExaminationPaper = require('../models/ExaminationPaper');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logAudit } = require('../utils/auditLogger');

// GET /api/admin/subjects
const getSubjects = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.semester_id) {
      filter.semester_id = req.query.semester_id;
    }
    const subjects = await Subject.find(filter)
      .populate({
        path: 'semester_id',
        populate: { path: 'course_id', select: 'name code' }
      })
      .sort({ sort_order: 1, createdAt: 1 });

    return successResponse(res, subjects, 'Subjects fetched', 200, subjects.length);
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/subjects/:id
const getSubjectById = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate({
        path: 'semester_id',
        populate: { path: 'course_id' }
      });

    if (!subject) return errorResponse(res, 'Subject not found', 404);
    return successResponse(res, subject, 'Subject details');
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/subjects
const createSubject = async (req, res, next) => {
  try {
    const { semester_id, name, code, description, units, sort_order, is_published } = req.body;
    if (!semester_id || !name || !code) {
      return errorResponse(res, 'Semester ID, Subject Name, and Subject Code are required', 400);
    }

    const semester = await Semester.findById(semester_id).populate('course_id');
    if (!semester) return errorResponse(res, 'Semester not found', 404);

    const subject = await Subject.create({
      semester_id,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description || '',
      units: units || [],
      sort_order: sort_order || 0,
      is_published: is_published !== false,
    });

    // Find parent semester folder
    const semesterFolder = await Folder.findOne({ semester_id, folder_type: 'semester' });

    // Create system folder for this subject
    const subjectFolder = await Folder.create({
      name: subject.name,
      parent_folder_id: semesterFolder ? semesterFolder._id : null,
      course_id: semester.course_id?._id,
      semester_id: semester._id,
      subject_id: subject._id,
      folder_type: 'subject',
      is_system: true,
    });

    // Create "Previous Year Question Papers" subfolder
    await Folder.create({
      name: 'Previous Year Question Papers',
      parent_folder_id: subjectFolder._id,
      course_id: semester.course_id?._id,
      semester_id: semester._id,
      subject_id: subject._id,
      folder_type: 'papers',
      is_system: true,
    });

    await logAudit({
      action: 'CREATE_SUBJECT',
      entityType: 'Subject',
      entityId: subject._id,
      details: { name: subject.name, code: subject.code, semester: semester.name },
      req,
    });

    return successResponse(res, subject, 'Subject created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/subjects/:id
const updateSubject = async (req, res, next) => {
  try {
    const { name, code, description, units, sort_order, is_published } = req.body;
    const subject = await Subject.findById(req.params.id);
    if (!subject) return errorResponse(res, 'Subject not found', 404);

    if (name) subject.name = name.trim();
    if (code) subject.code = code.trim().toUpperCase();
    if (description !== undefined) subject.description = description;
    if (units !== undefined) subject.units = units;
    if (sort_order !== undefined) subject.sort_order = sort_order;
    if (is_published !== undefined) subject.is_published = is_published;

    await subject.save();

    await logAudit({
      action: 'UPDATE_SUBJECT',
      entityType: 'Subject',
      entityId: subject._id,
      details: { name: subject.name, code: subject.code },
      req,
    });

    return successResponse(res, subject, 'Subject updated successfully');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/subjects/:id
const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return errorResponse(res, 'Subject not found', 404);

    const paperCount = await ExaminationPaper.countDocuments({ subject_id: subject._id });
    if (paperCount > 0) {
      return errorResponse(res, `Cannot delete subject. It has ${paperCount} question paper(s).`, 400);
    }

    await Subject.findByIdAndDelete(subject._id);
    await Folder.deleteMany({ subject_id: subject._id, is_system: true });

    await logAudit({
      action: 'DELETE_SUBJECT',
      entityType: 'Subject',
      entityId: subject._id,
      details: { name: subject.name, code: subject.code },
      req,
    });

    return successResponse(res, null, 'Subject deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
};
