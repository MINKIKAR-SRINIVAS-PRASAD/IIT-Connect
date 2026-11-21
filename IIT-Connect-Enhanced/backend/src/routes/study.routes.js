import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { requireStudentCommunity } from '../middleware/studentCommunity.middleware.js'
import { requireProfileComplete } from '../middleware/profileCompletion.middleware.js'
import { createStudyPost, deleteMyStudyPost, listApprovedStudy, listMyStudy } from '../controllers/study.controller.js'

const router = Router()

router.use(requireAuth, requireStudentCommunity, requireProfileComplete)

router.get('/', listApprovedStudy)
router.get('/mine', listMyStudy)
router.post('/', createStudyPost)
router.delete('/:id', deleteMyStudyPost)

export default router
