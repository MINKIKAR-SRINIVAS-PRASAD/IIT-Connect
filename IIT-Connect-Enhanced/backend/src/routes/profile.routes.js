import { Router } from 'express'
import { body } from 'express-validator'
import { requireAuth } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { upload } from '../middleware/upload.middleware.js'
import { updateProfile } from '../controllers/profile.controller.js'
import { achievementSummary, issueAchievementCertificate, verifyAchievementCertificate } from '../controllers/achievement.controller.js'
import { getPublicStudentProfile } from '../controllers/publicProfile.controller.js'

const router = Router()
router.put(
  '/',
  requireAuth,
  upload.single('photo'),
  body('name').optional().isString().isLength({ max: 80 }),
  body('iit').optional().isString().isLength({ max: 120 }),
  body('branch').optional().isString().isLength({ max: 80 }),
  body('batch').optional().isString().isLength({ max: 20 }),
  body('bio').optional().isString().isLength({ max: 500 }),
  validate,
  updateProfile
)

router.get('/achievements', requireAuth, achievementSummary)
router.post('/achievement-certificate', requireAuth, issueAchievementCertificate)
router.get('/achievement-certificate/verify/:certificateId', verifyAchievementCertificate)

// Keep the dynamic public-profile route last so it cannot shadow static routes.
router.get('/:userId', requireAuth, getPublicStudentProfile)

export default router
