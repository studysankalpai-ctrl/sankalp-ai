const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');
const { errorResponse } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.admin = await AdminUser.findById(decoded.id).select('-password');
      if (!req.admin || !req.admin.is_active) {
        return errorResponse(res, 'Not authorized, account inactive or invalid', 401);
      }
      return next();
    } catch (error) {
      return errorResponse(res, 'Not authorized, token failed or expired', 401);
    }
  }
  if (!token) {
    return errorResponse(res, 'Not authorized, no token provided', 401);
  }
};

module.exports = { protect };
