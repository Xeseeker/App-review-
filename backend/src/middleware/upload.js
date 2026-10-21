const multer = require('multer');
const AppError = require('../utils/AppError');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (request, file, callback) => callback(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype))
});

function posterUpload(request, response, next) {
  upload.single('poster')(request, response, (error) => {
    if (error) return next(new AppError(400, error.code === 'LIMIT_FILE_SIZE' ? 'Poster images must be 5 MB or smaller.' : error.message));
    if (!request.file) return next(new AppError(400, 'Upload a JPEG, PNG, or WebP poster in the poster field.'));
    next();
  });
}

module.exports = posterUpload;
