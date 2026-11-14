import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { addComment, listComments } from '../controllers/comment.controller.js'

const router = Router()

router.get('/', requireAuth, listComments)
router.post('/', requireAuth, addComment)

export default router
