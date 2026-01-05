// server/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const { FILE_VALIDATION } = require('../utils/fileValidator');

// Configure storage
// Using memoryStorage to keep files in memory for validation before processing
const storage = multer.memoryStorage();

// Enhanced file filter with detailed error messages
const fileFilter = (req, file, cb) => {
  const allowedExtensions = FILE_VALIDATION.ALLOWED_EXTENSIONS;
  const allowedMimeTypes = FILE_VALIDATION.ALLOWED_MIME_TYPES;

  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  // Check extension
  if (!allowedExtensions.includes(ext)) {
    return cb(
      new Error(`Invalid file extension. Only ${allowedExtensions.join(', ')} files are allowed.`),
      false
    );
  }

  // Check MIME type
  if (!allowedMimeTypes.includes(mimetype)) {
    return cb(
      new Error('Invalid file type. Only PDF, DOC, and DOCX files are supported.'),
      false
    );
  }

  // File passes initial checks
  cb(null, true);
};

// Configure multer with enhanced limits and validation
const upload = multer({
  storage: storage,
  limits: {
    fileSize: FILE_VALIDATION.MAX_SIZE, // 5MB file size limit
    files: 1, // Only allow 1 file per request
    fields: 10, // Limit number of non-file fields
    parts: 11, // Limit total parts (fields + files)
  },
  fileFilter: fileFilter,
});

// Error handling middleware for multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      const maxSizeMB = FILE_VALIDATION.MAX_SIZE / (1024 * 1024);
      return res.status(400).json({
        error: 'File too large',
        message: `File size exceeds the maximum allowed size of ${maxSizeMB}MB.`,
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: 'Only one file can be uploaded at a time.',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Unexpected file field',
        message: 'Unexpected file field in upload request.',
      });
    }

    // Generic multer error
    return res.status(400).json({
      error: 'Upload error',
      message: err.message || 'An error occurred during file upload.',
    });
  }

  // Custom file filter errors
  if (err) {
    return res.status(400).json({
      error: 'Invalid file',
      message: err.message,
    });
  }

  next();
};

module.exports = upload;
module.exports.handleMulterError = handleMulterError;
