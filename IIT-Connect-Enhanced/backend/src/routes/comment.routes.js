import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { requireProfileComplete } from '../middleware/profileCompletion.middleware.js'
import { addComment, listComments } from '../controllers/comment.controller.js'

const router = Router()

router.use(requireAuth, requireProfileComplete)

router.get('/', listComments)
router.post('/', addComment)

export default router
