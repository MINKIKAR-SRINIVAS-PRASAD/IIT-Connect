import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { requireProfileComplete } from '../middleware/profileCompletion.middleware.js'
import { createStudyPost, listApprovedStudy, listMyStudy } from '../controllers/study.controller.js'

const router = Router()

router.use(requireAuth, requireProfileComplete)

router.get('/', listApprovedStudy)
router.get('/mine', listMyStudy)
router.post('/', createStudyPost)

export default router
