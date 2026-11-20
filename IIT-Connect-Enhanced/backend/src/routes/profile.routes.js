import { Router } from 'express'
import { body } from 'express-validator'
import { requireAuth } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { upload } from '../middleware/upload.middleware.js'
import { validateImageUpload } from '../middleware/imageUpload.middleware.js'
import { updateProfile } from '../controllers/profile.controller.js'

const router = Router()

router.put(
  '/',
  requireAuth,
  upload.single('photo'),
  validateImageUpload,
  body('name').optional().isString().isLength({ max: 80 }),
  body('iit').optional().isString().isLength({ max: 120 }),
  body('branch').optional().isString().isLength({ max: 80 }),
  body('batch').optional().isString().isLength({ max: 20 }),
  body('bio').optional().isString().isLength({ max: 500 }),
  validate,
  updateProfile
)

export default router
