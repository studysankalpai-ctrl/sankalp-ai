const Folder = require('../models/Folder');
const AcademicFile = require('../models/AcademicFile');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logAudit } = require('../utils/auditLogger');

// GET /api/admin/folders
const getFolders = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.parent_folder_id !== undefined) {
      filter.parent_folder_id = req.query.parent_folder_id === 'null' || req.query.parent_folder_id === '' ? null : req.query.parent_folder_id;
    }
    if (req.query.course_id) filter.course_id = req.query.course_id;
    if (req.query.semester_id) filter.semester_id = req.query.semester_id;
    if (req.query.subject_id) filter.subject_id = req.query.subject_id;

    const folders = await Folder.find(filter)
      .populate('course_id', 'name code')
      .populate('semester_id', 'name number')
      .populate('subject_id', 'name code')
      .sort({ sort_order: 1, name: 1 });

    return successResponse(res, folders, 'Folders fetched', 200, folders.length);
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/folders/:id (With files & children)
const getFolderById = async (req, res, next) => {
  try {
    const folder = await Folder.findById(req.params.id)
      .populate('course_id')
      .populate('semester_id')
      .populate('subject_id')
      .populate('parent_folder_id');

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

// POST /api/admin/folders
const createFolder = async (req, res, next) => {
  try {
    const { name, parent_folder_id, course_id, semester_id, subject_id, sort_order } = req.body;
    if (!name) return errorResponse(res, 'Folder name is required', 400);

    const folder = await Folder.create({
      name: name.trim(),
      parent_folder_id: parent_folder_id || null,
      course_id: course_id || null,
      semester_id: semester_id || null,
      subject_id: subject_id || null,
      folder_type: 'custom',
      sort_order: sort_order || 0,
      is_system: false,
    });

    await logAudit({
      action: 'CREATE_FOLDER',
      entityType: 'Folder',
      entityId: folder._id,
      details: { name: folder.name },
      req,
    });

    return successResponse(res, folder, 'Folder created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/folders/:id
const updateFolder = async (req, res, next) => {
  try {
    const { name, sort_order } = req.body;
    const folder = await Folder.findById(req.params.id);
    if (!folder) return errorResponse(res, 'Folder not found', 404);

    if (name) folder.name = name.trim();
    if (sort_order !== undefined) folder.sort_order = sort_order;
    await folder.save();

    await logAudit({
      action: 'UPDATE_FOLDER',
      entityType: 'Folder',
      entityId: folder._id,
      details: { name: folder.name },
      req,
    });

    return successResponse(res, folder, 'Folder updated successfully');
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/folders/:id/move
const moveFolder = async (req, res, next) => {
  try {
    const { parent_folder_id } = req.body;
    const folder = await Folder.findById(req.params.id);
    if (!folder) return errorResponse(res, 'Folder not found', 404);

    if (folder.is_system) {
      return errorResponse(res, 'System folders cannot be moved', 400);
    }

    if (parent_folder_id && parent_folder_id === req.params.id) {
      return errorResponse(res, 'Cannot move folder into itself', 400);
    }

    folder.parent_folder_id = parent_folder_id || null;
    await folder.save();

    return successResponse(res, folder, 'Folder moved successfully');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/folders/:id
const deleteFolder = async (req, res, next) => {
  try {
    const folder = await Folder.findById(req.params.id);
    if (!folder) return errorResponse(res, 'Folder not found', 404);

    if (folder.is_system) {
      return errorResponse(res, 'System folders cannot be deleted', 400);
    }

    // Check files inside
    const fileCount = await AcademicFile.countDocuments({ folder_id: folder._id });
    const childFolderCount = await Folder.countDocuments({ parent_folder_id: folder._id });

    if (fileCount > 0 || childFolderCount > 0) {
      return errorResponse(res, `Folder is not empty (${fileCount} files, ${childFolderCount} subfolders). Please remove contents first.`, 400);
    }

    await Folder.findByIdAndDelete(folder._id);

    await logAudit({
      action: 'DELETE_FOLDER',
      entityType: 'Folder',
      entityId: folder._id,
      details: { name: folder.name },
      req,
    });

    return successResponse(res, null, 'Folder deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFolders,
  getFolderById,
  createFolder,
  updateFolder,
  moveFolder,
  deleteFolder,
};
