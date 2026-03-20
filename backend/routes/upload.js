const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const {
  uploadSingle,
  uploadMultiple,
  deleteFile,
} = require('../controllers/uploadController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {

  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
});

router.post('/single', auth(), upload.single('file'), uploadSingle);
router.post('/multiple', auth(), upload.array('files', 10), uploadMultiple);
router.delete('/:publicId', auth(), deleteFile);

module.exports = router;
