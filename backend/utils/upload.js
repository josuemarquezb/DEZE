// utils/upload.js — multer configuration for photo/document uploads.
// Files are stored on the local filesystem under backend/uploads/ (see
// UPLOADS_ROOT) and served back out by the express.static mount in
// server.js. See routes/photos.js for how createUploader() is used per route.

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolved relative to this file (not process.cwd()) so uploads always land
// in the same place regardless of which directory the server is started from.
export const UPLOADS_ROOT = path.join(__dirname, '..', 'uploads');

export const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

// Pre-create the known subdirectories so the first upload of each type
// doesn't race a mkdir. Job photos additionally nest under a per-job folder
// (uploads/jobs/<jobId>/...), created lazily per request in createUploader.
for (const sub of ['profiles', 'equipment', 'verification', 'jobs']) {
  fs.mkdirSync(path.join(UPLOADS_ROOT, sub), { recursive: true });
}

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype) || !ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error('Only JPG and PNG images are allowed'));
  }
  cb(null, true);
};

/**
 * createUploader(subdir, ownerIdFromReq) — builds a multer instance that
 * stores files under UPLOADS_ROOT/<subdir> with a unique, owner-scoped
 * filename: `${ownerId}-${timestamp}-${randomId}.ext`.
 *
 * @param {string|(req) => string} subdir - path relative to UPLOADS_ROOT, or a
 *   function of req that returns one (e.g. `jobs/${req.params.jobId}`).
 * @param {(req) => string} ownerIdFromReq - returns the id embedded in the filename.
 */
export const createUploader = (subdir, ownerIdFromReq) =>
  multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        const rel = typeof subdir === 'function' ? subdir(req) : subdir;
        const dir = path.join(UPLOADS_ROOT, rel);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const ownerId = ownerIdFromReq(req);
        const randomId = crypto.randomBytes(6).toString('hex');
        cb(null, `${ownerId}-${Date.now()}-${randomId}${ext}`);
      },
    }),
    fileFilter,
    limits: { fileSize: MAX_FILE_BYTES },
  });

/**
 * uploadMiddleware(multerHandler) — wraps a multer `.single()`/`.array()`
 * middleware so file-type and file-size-limit errors come back as a normal
 * 400 JSON response instead of an uncaught exception / generic 500.
 */
export const uploadMiddleware = (multerHandler) => (req, res, next) => {
  multerHandler(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      const message = err.code === 'LIMIT_FILE_SIZE' ? 'File must be smaller than 5MB' : err.message;
      return res.status(400).json({ message });
    }
    return res.status(400).json({ message: err.message || 'Upload failed' });
  });
};
