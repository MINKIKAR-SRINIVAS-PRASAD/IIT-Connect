
import { Router } from 'express'
import {
  requireAuth,
  requireCompletedProfile
} from '../middleware/auth.middleware.js'

import {
  addComment,
  listComments
} from '../controllers/comment.controller.js'

const router = Router()

router.use(requireAuth, requireCompletedProfile)

router.get('/', listComments)
router.post('/', addComment)

export default router
