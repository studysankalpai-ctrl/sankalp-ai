const express = require('express');
const router = express.Router();
const {
  getProcessingStatus,
  getPendingDocs,
  getFailedDocs,
} = require('../controllers/processingController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/status', getProcessingStatus);
router.get('/pending', getPendingDocs);
router.get('/failed', getFailedDocs);

module.exports = router;
