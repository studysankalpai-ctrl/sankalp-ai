const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAuditLogs,
  getStorageStats,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/audit-logs', getAuditLogs);
router.get('/storage', getStorageStats);

module.exports = router;
