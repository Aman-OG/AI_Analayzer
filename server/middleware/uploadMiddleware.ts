import { Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { FILE_VALIDATION } from '../utils/fileValidator';

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedExtensions = FILE_VALIDATION.ALLOWED_EXTENSIONS;
    const allowedMimeTypes = FILE_VALIDATION.ALLOWED_MIME_TYPES;

    const ext = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;

    if (!allowedExtensions.includes(ext)) {
        return cb(
            new Error(`Invalid file extension. Only ${allowedExtensions.join(', ')} files are allowed.`)
        );
    }

    if (!allowedMimeTypes.includes(mimetype)) {
        return cb(
            new Error('Invalid file type. Only PDF, DOC, and DOCX files are supported.')
        );
    }

    cb(null, true);
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: FILE_VALIDATION.MAX_SIZE,
        files: 1,
        fields: 10,
        parts: 11,
    },
    fileFilter: fileFilter,
});

export const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
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

        return res.status(400).json({
            error: 'Upload error',
            message: err.message || 'An error occurred during file upload.',
        });
    }

    if (err) {
        return res.status(400).json({
            error: 'Invalid file',
            message: err.message,
        });
    }

    next();
};

export default upload;
