import { Router } from 'express'
import { body } from 'express-validator'

import { requireAuth } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { upload } from '../middleware/upload.middleware.js'
import { updateProfile } from '../controllers/profile.controller.js'
import { achievementSummary, issueAchievementCertificate, verifyAchievementCertificate } from '../controllers/achievement.controller.js'

const router = Router()

router.put(
  '/',
  requireAuth,
  upload.single('photo'),

  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 80 }),

  // Institute is assigned from the verified IIT email on the server.
  // Do not require a client-supplied institute field.

  body('rollNumber')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Roll number must be 30 characters or fewer'),

  body('branch')
    .trim()
    .notEmpty()
    .withMessage('Branch is required')
    .isLength({ max: 80 }),

  body('batch')
    .trim()
    .notEmpty()
    .withMessage('Batch is required')
    .isLength({ max: 20 }),

  body('bio')
    .optional()
    .isString()
    .isLength({ max: 500 }),

  validate,
  updateProfile
)

router.get('/achievements', requireAuth, achievementSummary)
router.post('/achievement-certificate', requireAuth, issueAchievementCertificate)
router.get('/achievement-certificate/verify/:certificateId', verifyAchievementCertificate)

export default router
