const express = require('express');
const router = express.Router();
const {
  getFolders,
  getFolderById,
  createFolder,
  updateFolder,
  moveFolder,
  deleteFolder,
} = require('../controllers/folderController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getFolders)
  .post(createFolder);

router.route('/:id')
  .get(getFolderById)
  .put(updateFolder)
  .delete(deleteFolder);

router.put('/:id/move', moveFolder);

module.exports = router;
