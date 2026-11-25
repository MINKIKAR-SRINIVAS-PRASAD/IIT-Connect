import { deleteStudySubmission } from '../controllers/study.controller.js'
import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { createStudyPost, listApprovedStudy, listMyStudy } from '../controllers/study.controller.js'

const router = Router()

router.get('/', listApprovedStudy)
router.delete('/:id', requireAuth, deleteStudySubmission)
router.get('/mine', requireAuth, listMyStudy)
router.post('/', requireAuth, createStudyPost)

export default router
