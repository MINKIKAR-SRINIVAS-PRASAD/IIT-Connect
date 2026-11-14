
import { Router } from 'express'
import {
  requireAuth,
  requireCompletedProfile
} from '../middleware/auth.middleware.js'

import {
  createStudyPost,
  listApprovedStudy,
  listMyStudy
} from '../controllers/study.controller.js'

const router = Router()

router.use(requireAuth, requireCompletedProfile)

router.get('/', listApprovedStudy)
router.get('/mine', listMyStudy)
router.post('/', createStudyPost)

export default router
