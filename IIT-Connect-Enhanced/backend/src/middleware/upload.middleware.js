import multer from 'multer'

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

const storage = multer.memoryStorage()

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    if (!allowedImageTypes.has(file.mimetype)) {
      return callback(new Error('Only JPEG, PNG, and WebP images are allowed'))
    }
    callback(null, true)
  }
})
