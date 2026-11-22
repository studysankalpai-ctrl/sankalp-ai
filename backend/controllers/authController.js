const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logAudit } = require('../utils/auditLogger');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return errorResponse(res, 'Please provide email and password', 400);
    }

    const admin = await AdminUser.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    if (!admin.is_active) {
      return errorResponse(res, 'Account has been deactivated. Please contact administrator.', 403);
    }

    admin.last_login = new Date();
    await admin.save();

    const token = generateToken(admin._id);

    await logAudit({
      adminId: admin._id,
      adminEmail: admin.email,
      action: 'LOGIN',
      entityType: 'AdminUser',
      entityId: admin._id,
      details: { email: admin.email },
      req,
    });

    return successResponse(res, {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      token,
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/register (Only if no admin exists, for initial setup)
const register = async (req, res, next) => {
  try {
    const adminCount = await AdminUser.countDocuments();
    if (adminCount > 0) {
      return errorResponse(res, 'Admin registration closed. Please log in.', 403);
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return errorResponse(res, 'Please provide all required fields', 400);
    }

    const admin = await AdminUser.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: 'super_admin',
    });

    const token = generateToken(admin._id);

    return successResponse(res, {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      token,
    }, 'Admin account created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me (Protected)
const getMe = async (req, res, next) => {
  try {
    return successResponse(res, req.admin, 'Profile fetched successfully');
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/change-password (Protected)
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Current password and new password are required', 400);
    }

    const admin = await AdminUser.findById(req.admin._id);
    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, 'Current password does not match', 400);
    }

    admin.password = newPassword;
    await admin.save();

    await logAudit({
      adminId: admin._id,
      adminEmail: admin.email,
      action: 'CHANGE_PASSWORD',
      entityType: 'AdminUser',
      entityId: admin._id,
      req,
    });

    return successResponse(res, null, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register,
  getMe,
  changePassword,
};
